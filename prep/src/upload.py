from typing import Iterable
from pathlib import Path
from itertools import product
import pandas as pd
import eventlet
from . import pq
from . import s3


def _world_grid(lon_range: tuple[int, int], lat_range: tuple[int, int]) -> Iterable:
    lons = list(range(min(lon_range), max(lon_range) + 1))
    lats = list(range(min(lat_range), max(lat_range) + 1))
    return product(lons, lats)


def _qrtr_mile_grid() -> Iterable:
    parts = (0.0, 0.25, 0.5, 0.75)
    return product(parts, parts)


def _add_if_exists(data: dict, key: str, df: pd.DataFrame, pos: tuple[float, float]):
    if pos in df.index:
        data[key] = df.loc[pos].to_dict()  # type: ignore


def _add_if_no_nan(data: dict, key: str, df: pd.DataFrame, pos: tuple[float, float]):
    if pos in df.index:
        row = df.loc[pos]  # type: ignore
        if not row.isna().any():
            data[key] = row.to_dict()


def _add_if_not_zero(data: dict, key: str, df: pd.DataFrame, pos: tuple[float, float]):
    if pos in df.index:
        row = df.loc[pos]  # type: ignore
        if row.sum() > 0:
            data[key] = row.to_dict()


def monthly_data(
    month: int,
    keys: list[str] | None,
    label: str,
    version: str,
    datadir: Path,
    lon_range: tuple[int, int],
    lat_range: tuple[int, int],
):
    print(f"Processing {label} {month}...")
    df_rain = pq.read_table(file=datadir / f"aggregated_rain_{label}_{month}.pq")
    df_temp = pq.read_table(file=datadir / f"aggregated_temp_{label}_{month}.pq")
    df_wind = pq.read_table(file=datadir / f"aggregated_wind_{label}_{month}.pq")
    df_wave = pq.read_table(file=datadir / f"aggregated_wave_{label}_{month}.pq")
    df_seatemp = pq.read_table(file=datadir / f"aggregated_seatemp_{label}_{month}.pq")
    df_current = pq.read_table(file=datadir / f"aggregated_current_{label}_{month}.pq")

    df_wind.columns = [tuple(d.split("|")) for d in df_wind.columns]  # type: ignore
    df_current.columns = [tuple(d.split("|")) for d in df_current.columns]  # type: ignore
    df_temp.rename(
        columns={
            "high_mean": "highMean",
            "high_std": "highStd",
            "low_mean": "lowMean",
            "low_std": "lowStd",
        },
        inplace=True,
    )
    df_seatemp.rename(
        columns={
            "high_mean": "highMean",
            "high_std": "highStd",
            "low_mean": "lowMean",
            "low_std": "lowStd",
        },
        inplace=True,
    )
    df_rain.rename(
        columns={"daily_mean": "dailyMean", "daily_std": "dailyStd"},
        inplace=True,
    )

    pool = eventlet.GreenPool(200)
    for lng_base, lat_base in _world_grid(lat_range=lat_range, lon_range=lon_range):
        key = f"{version}/{label}/{month}/{lat_base:d}/{lng_base:d}/data.pkl"
        # TODO: different function for when keys are None vs not None
        if keys is not None and key not in keys:
            continue

        record = {}
        for lat_add, lng_add in _qrtr_mile_grid():
            pos = (lng_base + lng_add, lat_base + lat_add)
            # TODO: changed names: prec->rains,tmps->temps,seatmps->seatemps
            data: dict = {}
            _add_if_exists(data=data, key="rains", df=df_rain, pos=pos)
            _add_if_exists(data=data, key="temps", df=df_temp, pos=pos)
            _add_if_exists(data=data, key="winds", df=df_wind, pos=pos)
            _add_if_no_nan(data=data, key="seatemps", df=df_seatemp, pos=pos)
            _add_if_not_zero(data=data, key="waves", df=df_wave, pos=pos)
            _add_if_not_zero(data=data, key="currents", df=df_current, pos=pos)
            record[pos] = data

        pool.spawn_n(s3.put_obj, key, record)
    pool.waitall()
