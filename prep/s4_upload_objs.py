"""
Write all objects to s3

One object for every position x month x time range => ~20M objects.
This would not only take long but also be quite expensive.
I reduce the amount of objects by binning them to full lat-lng minutes.

That's 1.2M objects.
Vanilla 2 time ranges, 1 month, 100 records: 18s => 30h
Subroutines 2 time ranges, 1 month, 100 records: 7s => 12h
with 2 processes in 6h

    DATA_DIR=my/data/dir IS_TEST=1 python s4_upload_objs.py
    DATA_DIR=my/data/dir python s4_upload_objs.py
    DATA_DIR=my/data/dir python s4_upload_objs.py 'v5/2023/7/17/-32/data.pkl' 'v5/2019-2023/5/-65/-16/data.pkl'

Single keys can be given to only upload single objects
"""
from typing import Iterable
from itertools import product
import multiprocessing as ms
import pandas as pd
import eventlet  # type: ignore

eventlet.monkey_patch(thread=False, socket=False)
from src.config import (
    IS_TEST,
    DATA_DIR,
    TIME_RANGES,
    ALL_MONTHS,
    VERSION_PREFIX,
    THIS_YEAR,
    ARGS,
)
from src.util import read_parquet
import src.s3 as s3


def _get_df(filename: str) -> pd.DataFrame:
    df = read_parquet(DATA_DIR / filename)
    df.columns = [str(d) for d in df.columns]
    return df


def _lat_lng_grid(idx: pd.Index) -> Iterable:
    lngs = idx.get_level_values("lon").astype(int)
    lngs = list(range(lngs.min(), lngs.max() + 1))
    lats = idx.get_level_values("lat").astype(int)
    lats = list(range(lats.min(), lats.max()))  # ignore lat=70.00
    return product(lngs, lats)


def _qrtr_mile_grid() -> Iterable:
    parts = (0.0, 0.25, 0.5, 0.75)
    return product(parts, parts)


if __name__ == "__main__":
    keys = []
    months = ALL_MONTHS
    time_ranges = TIME_RANGES

    if len(ARGS) > 0:
        keys = list(ARGS)

    if IS_TEST:
        months = months[:1]
        time_ranges = {str(THIS_YEAR - 1): time_ranges[str(THIS_YEAR - 1)]}

    for time_range in time_ranges:

        def process_month(month: int):
            print(f"Processing {time_range}/{month}...")
            green_pool = eventlet.GreenPool(200)

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
            prec.rename(
                columns={"daily_mean": "dailyMean", "daily_std": "dailyStd"},
                inplace=True,
            )

            assert prec.index.equals(tmps.index)
            assert tmps.index.equals(winds.index)
            grid = _lat_lng_grid(idx=prec.index)

            for i, (lng_base, lat_base) in enumerate(grid):
                key = f"{VERSION_PREFIX}/{time_range}/{month}/{lat_base:d}/{lng_base:d}/data.pkl"
                if IS_TEST and i > 100:
                    break
                if len(keys) > 0 and key not in keys:
                    continue

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

                green_pool.spawn_n(s3.put_obj, key, data)
            green_pool.waitall()

        with ms.Pool(2) as mp_pool:
            mp_pool.map(process_month, months)

    print("\ndone")
