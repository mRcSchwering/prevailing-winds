"""
Write all objects to s3

One object for every position x month x time range => ~20M objects.
This would not only take long but also be quite expensive.
I reduce the amount of objects by binning them to full lat-lng minutes.

That's 1.2M objects.
Vanilla 2 time ranges, 1 month, 100 records: 18s => 30h
Subroutines 2 time ranges, 1 month, 100 records: 7s => 12h

    python s4_upload_objs.py test
    python s4_upload_objs.py

"""
from pathlib import Path
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


if __name__ == "__main__":
    for time_range in TIME_RANGES:
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            print(f"Processing {time_range}/{month}...")

            prec = read_parquet(DATA_DIR / f"s3_prec_{time_range}_{month}.pq")
            prec.columns = [str(d) for d in prec.columns]
            tmps = read_parquet(DATA_DIR / f"s3_tmps_{time_range}_{month}.pq")
            tmps.rename(
                columns={
                    "high_mean": "highMean",
                    "high_std": "highStd",
                    "low_mean": "lowMean",
                    "low_std": "lowStd",
                },
                inplace=True,
            )
            winds = read_parquet(DATA_DIR / f"s3_winds_{time_range}_{month}.pq")
            winds.columns = [tuple(d.split("|")) for d in winds.columns]

            assert prec.index.equals(tmps.index)
            assert tmps.index.equals(winds.index)
            n = len(prec.index)

            pool = eventlet.GreenPool(200)

            lngs = prec.index.get_level_values("lon").astype(int)
            lngs = list(range(lngs.min(), lngs.max() + 1))
            lats = prec.index.get_level_values("lat").astype(int)
            lats = list(range(lats.min(), lats.max()))  # ignore lat=70.00

            parts = (0.0, 0.25, 0.5, 0.75)
            for i, (lng_base, lat_base) in enumerate(product(lngs, lats)):
                if IS_TEST and i > 100:
                    break

                data = {}
                for lat_add, lng_add in product(parts, parts):
                    lat = lat_base + lat_add
                    lng = lng_base + lng_add
                    data[(lat, lng)] = {
                        "prec": prec.loc[(lng, lat)].to_dict(),
                        "tmps": tmps.loc[(lng, lat)].to_dict(),
                        "winds": winds.loc[(lng, lat)].to_dict(),
                    }
                key = (
                    f"{PREFIX}/{time_range}/{month}/{lat_base:d}/{lng_base:d}/data.pkl"
                )
                pool.spawn_n(s3.put_obj, key, data)
            pool.waitall()

    print("\ndone")
