"""
Write all objects to s3

One object for every position x month x time range => ~20M objects.
This would not only take long but also be quite expensive.
I reduce the amount of objects by binning them to full lat-lng minutes.

That's 1.2M objects.
Vanilla 2 time ranges, 1 month, 100 records: 18s => 30h
Subroutines 2 time ranges, 1 month, 100 records: 7s => 12h

    DATA_DIR=my/data/dir IS_TEST=1 python s4_upload_objs.py
    DATA_DIR=my/data/dir python s4_upload_objs.py

"""
from typing import Iterable
from itertools import product
import pandas as pd
import eventlet  # type: ignore

eventlet.monkey_patch()
from src.config import IS_TEST, DATA_DIR, TIME_RANGES, ALL_MONTHS, VERSION_PREFIX, THIS_YEAR
from src.util import read_parquet
import src.s3 as s3


def _get_df(filename: str) -> pd.DataFrame:
    df = read_parquet(DATA_DIR / filename)
    df.columns = [str(d) for d in df.columns]
    return df


# TODO: explicitly give prec...
def _lat_lng_grid() -> Iterable:
    lngs = prec.index.get_level_values("lon").astype(int)
    lngs = list(range(lngs.min(), lngs.max() + 1))
    lats = prec.index.get_level_values("lat").astype(int)
    lats = list(range(lats.min(), lats.max()))  # ignore lat=70.00
    return product(lngs, lats)


def _qrtr_mile_grid() -> Iterable:
    parts = (0.0, 0.25, 0.5, 0.75)
    return product(parts, parts)


if __name__ == "__main__":
    months = ALL_MONTHS
    time_ranges = TIME_RANGES
    if IS_TEST:
        months = months[:1]
        time_ranges = {str(THIS_YEAR): time_ranges[str(THIS_YEAR)]}

    for time_range in time_ranges:
        for month in months:
            print(f"Processing {time_range}/{month}...")
            pool = eventlet.GreenPool(200)

            prec = _get_df(filename=f"s3_prec_{time_range}_{month}.pq")
            tmps = _get_df(filename=f"s3_tmps_{time_range}_{month}.pq")
            winds = _get_df(filename=f"s3_winds_{time_range}_{month}.pq")
            waves = _get_df(filename=f"s3_waves_{time_range}_{month}.pq")
            seatmps = _get_df(filename=f"s3_seatmps_{time_range}_{month}.pq")

            winds.columns = [tuple(d.split("|")) for d in winds.columns]
            tmps.rename(
                columns={
                    "high_mean": "highMean",
                    "high_std": "highStd",
                    "low_mean": "lowMean",
                    "low_std": "lowStd",
                },
                inplace=True,
            )
            seatmps.rename(
                columns={
                    "high_mean": "highMean",
                    "high_std": "highStd",
                    "low_mean": "lowMean",
                    "low_std": "lowStd",
                },
                inplace=True,
            )

            assert prec.index.equals(tmps.index)
            assert tmps.index.equals(winds.index)

            for i, (lng_base, lat_base) in enumerate(_lat_lng_grid()):
                if IS_TEST and i > 100:
                    break

                data = {}
                for lat_add, lng_add in _qrtr_mile_grid():
                    lat = lat_base + lat_add
                    lng = lng_base + lng_add

                    values = {
                        "prec": prec.loc[(lng, lat)].to_dict(),
                        "tmps": tmps.loc[(lng, lat)].to_dict(),
                        "winds": winds.loc[(lng, lat)].to_dict(),
                    }

                    if (lng, lat) in seatmps.index:
                        if not seatmps.loc[(lng, lat)].isna().any():
                            values["seatmps"] = seatmps.loc[(lng, lat)].to_dict()

                    if (lng, lat) in waves.index:
                        if waves.loc[(lng, lat)].sum() > 0:
                            values["waves"] = waves.loc[(lng, lat)].to_dict()

                    data[(lat, lng)] = values

                key = f"{VERSION_PREFIX}/{time_range}/{month}/{lat_base:d}/{lng_base:d}/data.pkl"
                pool.spawn_n(s3.put_obj, key, data)
            pool.waitall()

    print("\ndone")
