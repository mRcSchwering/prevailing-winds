"""
Update s3 objects with additional water data

Only consider positions with data:
- waves: there must be at least one count (non zero)
- seatmps: there must not be any NaN

Only go through positions with data, get existing s3 obj,
add new data to it, put new s3 obj.
As with s4, all natural lats x lngs are objs, decimal lats x lngs
are combined within single s3 obj.

Relevant positions: ~40k => 960k objects
With subroutines 7s per 200 => ~9h

    python s7_upload_add_water_data.py test
    python s7_upload_add_water_data.py

"""
from pathlib import Path
from typing import Dict
import sys
from itertools import product
import eventlet  # type: ignore

eventlet.monkey_patch()
from src.util import read_parquet
import src.s3 as s3

TIME_RANGES = ["2020", "2016-2020"]
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
PREFIX = "v2"
DATA_DIR = Path("data/tmp")
IS_TEST = "test" in sys.argv[1:]


def s3_update_obj(key: str, addobj: Dict[tuple, dict]):
    orig: Dict[tuple, dict] = s3.get_obj(key=key)
    for pos in addobj:
        orig[pos].update(addobj[pos])
    s3.put_obj(key=key, obj=orig)


if __name__ == "__main__":
    for time_range in TIME_RANGES:
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            print(f"Processing {time_range}/{month}...")

            waves = read_parquet(DATA_DIR / f"s6_waves_{time_range}_{month}.pq")
            waves.columns = [str(d) for d in waves.columns]
            waves_ids = set(waves.index[waves.sum(axis=1) > 0].tolist())

            seatmps = read_parquet(DATA_DIR / f"s6_seatmps_{time_range}_{month}.pq")
            seatmps.rename(
                columns={
                    "high_mean": "highMean",
                    "high_std": "highStd",
                    "low_mean": "lowMean",
                    "low_std": "lowStd",
                },
                inplace=True,
            )
            seatmps_ids = set(seatmps.index[~seatmps.isna().any(axis=1)].tolist())
            row_ids = seatmps_ids | waves_ids

            pool = eventlet.GreenPool(200)

            base_ids = set((int(a), int(b)) for a, b in row_ids)
            parts = (0.0, 0.25, 0.5, 0.75)
            for i, (lng_base, lat_base) in enumerate(base_ids):
                if IS_TEST and i > 100:
                    break

                data = {}
                for lat_add, lng_add in product(parts, parts):
                    lat = lat_base + lat_add
                    lng = lng_base + lng_add
                    values = {}

                    if (lng, lat) in seatmps.index:
                        if not seatmps.loc[(lng, lat)].isna().any():
                            values["seatmps"] = seatmps.loc[(lng, lat)].to_dict()

                    if (lng, lat) in waves.index:
                        if waves.loc[(lng, lat)].sum() > 0:
                            values["waves"] = waves.loc[(lng, lat)].to_dict()

                    if len(values) > 0:
                        data[(lat, lng)] = values

                key = (
                    f"{PREFIX}/{time_range}/{month}/{lat_base:d}/{lng_base:d}/data.pkl"
                )

                pool.spawn_n(s3_update_obj, key, data)
            pool.waitall()

    print("\ndone")

