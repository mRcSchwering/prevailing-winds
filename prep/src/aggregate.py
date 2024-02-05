from itertools import product
from pathlib import Path
import numpy as np
import pandas as pd
from . import pq
from .util import direction, velocity
from .config import WAVES, DIRECTIONS, WIND_VELS, CURRENT_VELS


def _get_dirs(ufile: Path, vfile: Path, is_wind=True) -> pd.DataFrame:
    df_u = pq.read_table(ufile)
    df_v = pq.read_table(vfile)
    assert all(df_u.columns == df_v.columns)
    assert df_u.index.equals(df_v.index)
    dirs = {}
    for k in df_u.columns:
        dirs[k] = direction(u=df_u[k].to_numpy(), v=df_v[k].to_numpy(), is_wind=is_wind)
    return pd.DataFrame(dirs, index=df_u.index.copy())


def _get_velos(ufile: Path, vfile: Path) -> pd.DataFrame:
    df_u = pq.read_table(ufile)
    df_v = pq.read_table(vfile)
    assert all(df_u.columns == df_v.columns)
    assert df_u.index.equals(df_v.index)
    velos = {}
    for k in df_u.columns:
        velos[k] = velocity(u=df_u[k].to_numpy(), v=df_v[k].to_numpy())
    return pd.DataFrame(velos, index=df_u.index.copy())


def _bin(arr: np.ndarray, by: list[dict], nanval=-1) -> np.ndarray:
    binned = np.digitize(arr, bins=[d["s"] for d in by])
    binned[np.isnan(arr)] = nanval
    return binned


def temps(month: int, years: list[int], label: str, datadir: Path):
    invar = "2m_temperature"
    df = pq.read_table(datadir / f"extracted_{invar}_{years[0]}-{month}.pq")
    index = df.index.copy()

    maxs = []
    mins = []
    for year in years:
        print(f"Year {invar} {year}-{month}...")
        df = pq.read_table(datadir / f"extracted_{invar}_{year}-{month}.pq")
        assert df.index.equals(index)

        days = set(d.split("-")[0] for d in df.columns)
        for day in days:
            cols = [d for d in df.columns if d.split("-")[0] == day]
            mins.append(df[cols].min(axis=1).to_numpy())
            maxs.append(df[cols].max(axis=1).to_numpy())

    mins_arr = np.stack(mins, axis=1)
    maxs_arr = np.stack(maxs, axis=1)
    df = pd.DataFrame(
        {
            "high_mean": np.mean(maxs_arr, axis=1) - 273.15,
            "high_std": np.std(maxs_arr, axis=1),
            "low_mean": np.mean(mins_arr, axis=1) - 273.15,
            "low_std": np.std(mins_arr, axis=1),
        },
        index=df.index,
    )
    pq.write_table(df=df, file=datadir / f"aggregated_temp_{label}_{month}.pq")


def rains(month: int, years: list[int], label: str, datadir: Path):
    invar = "total_precipitation"
    df = pq.read_table(datadir / f"extracted_{invar}_{years[0]}-{month}.pq")
    index = df.index.copy()

    sums = []
    for year in years:
        print(f"Year {invar} {year}-{month}...")
        df = pq.read_table(datadir / f"extracted_{invar}_{year}-{month}.pq")
        assert df.index.equals(index)

        days = set(d.split("-")[0] for d in df.columns)
        for day in days:
            cols = [d for d in df.columns if d.split("-")[0] == day]
            sums.append(df[cols].sum(axis=1).to_numpy() * 1000)  # m to mm

    # the sums were only of every 3rd hour
    sums_arr = np.stack(sums, axis=1)
    df = pd.DataFrame(
        {
            "daily_mean": np.mean(sums_arr, axis=1) * 3,
            "daily_std": np.std(sums_arr, axis=1),
        },
        index=df.index,
    )
    pq.write_table(df=df, file=datadir / f"aggregated_rain_{label}_{month}.pq")


def seatemps(month: int, years: list[int], label: str, datadir: Path):
    invar = "sea_surface_temperature"
    df = pq.read_table(datadir / f"extracted_{invar}_{years[0]}-{month}.pq")
    index = df.index.copy()

    maxs = []
    mins = []
    for year in years:
        print(f"Year {invar} {year}-{month}...")
        df = pq.read_table(datadir / f"extracted_{invar}_{year}-{month}.pq")
        assert df.index.equals(index)

        days = set(d.split("-")[0] for d in df.columns)
        for day in days:
            cols = [d for d in df.columns if d.split("-")[0] == day]
            mins.append(df[cols].min(axis=1).to_numpy())
            maxs.append(df[cols].max(axis=1).to_numpy())

    mins_arr = np.stack(mins, axis=1)
    maxs_arr = np.stack(maxs, axis=1)
    df = pd.DataFrame(
        {
            "high_mean": np.mean(maxs_arr, axis=1) - 273.15,
            "high_std": np.std(maxs_arr, axis=1),
            "low_mean": np.mean(mins_arr, axis=1) - 273.15,
            "low_std": np.std(mins_arr, axis=1),
        },
        index=df.index,
    )
    pq.write_table(df=df, file=datadir / f"aggregated_seatemp_{label}_{month}.pq")


def waves(month: int, years: list[int], label: str, datadir: Path):
    invar = "significant_height_of_combined_wind_waves_and_swell"
    max_i = max(d["i"] for d in WAVES)
    df = pq.read_table(datadir / f"extracted_{invar}_{years[0]}-{month}.pq")
    index = df.index.copy()

    bins = []
    for year in years:
        print(f"Year {invar} {year}-{month}...")
        df = pq.read_table(datadir / f"extracted_{invar}_{year}-{month}.pq")
        assert df.index.equals(index)
        bins.append(_bin(df.to_numpy(), by=WAVES))

    counts = np.apply_along_axis(
        lambda d: np.bincount(d[d >= 0], minlength=max_i + 1),
        axis=1,
        arr=np.concatenate(bins, axis=1),
    )

    df = pd.DataFrame(counts, index=index)
    df.drop(columns=0, inplace=True)
    pq.write_table(df=df, file=datadir / f"aggregated_wave_{label}_{month}.pq")


def winds(month: int, years: list[int], label: str, datadir: Path):
    uvar = "10m_u_component_of_wind"
    vvar = "10m_v_component_of_wind"
    dir_idxs = [d["i"] for d in DIRECTIONS[:-1]]  # last one (17) is helper
    vel_idxs = [d["i"] for d in WIND_VELS]
    dir_vel_idxs = list(product(dir_idxs, vel_idxs))

    df = pq.read_table(datadir / f"extracted_{uvar}_{years[0]}-{month}.pq")
    index = df.index.copy()
    del df

    C = np.zeros((len(index), len(dir_vel_idxs)), dtype=int)
    for year in years:
        print(f"Year wind components {year}-{month}...")
        ufile = datadir / f"extracted_{uvar}_{year}-{month}.pq"
        vfile = datadir / f"extracted_{vvar}_{year}-{month}.pq"

        df = _get_dirs(ufile=ufile, vfile=vfile, is_wind=True)
        assert index.equals(df.index)
        D = _bin(df.to_numpy(), by=DIRECTIONS)
        D[D == 17] = 1  # 17 was helper
        del df

        df = _get_velos(ufile=ufile, vfile=vfile)
        assert index.equals(df.index)
        V = _bin(df.to_numpy(), by=WIND_VELS)
        del df

        for ci, (dr, vl) in enumerate(dir_vel_idxs):
            C[:, ci] += np.sum((D == dr) & (V == vl), axis=1)

    df = pd.DataFrame(C, index=index, columns=[f"{d}|{v}" for d, v in dir_vel_idxs])
    pq.write_table(df=df, file=datadir / f"aggregated_wind_{label}_{month}.pq")
    del df, C


def currents(month: int, years: list[int], label: str, datadir: Path):
    uvar = "rotated_zonal_velocity"
    vvar = "rotated_meridional_velocity"
    dir_idxs = [d["i"] for d in DIRECTIONS[:-1]]  # last one (17) is helper
    vel_idxs = [d["i"] for d in CURRENT_VELS]
    dir_vel_idxs = list(product(dir_idxs, vel_idxs))

    df = pq.read_table(datadir / f"extracted_{uvar}_{years[0]}-{month}.pq")
    index = df.index.copy()
    del df

    C = np.zeros((len(index), len(dir_vel_idxs)), dtype=int)
    for year in years:
        print(f"Year current components {year}-{month}...")
        ufile = datadir / f"extracted_{uvar}_{year}-{month}.pq"
        vfile = datadir / f"extracted_{vvar}_{year}-{month}.pq"

        df = _get_dirs(ufile=ufile, vfile=vfile, is_wind=False)
        assert index.equals(df.index)
        D = _bin(df.to_numpy(), by=DIRECTIONS)
        D[D == 17] = 1  # 17 was helper
        del df

        df = _get_velos(ufile=ufile, vfile=vfile)
        assert index.equals(df.index)
        V = _bin(df.to_numpy(), by=CURRENT_VELS)
        del df

        for ci, (dr, vl) in enumerate(dir_vel_idxs):
            C[:, ci] += np.sum((D == dr) & (V == vl), axis=1)

    df = pd.DataFrame(C, index=index, columns=[f"{d}|{v}" for d, v in dir_vel_idxs])
    pq.write_table(df=df, file=datadir / f"aggregated_current_{label}_{month}.pq")
    del df, C
