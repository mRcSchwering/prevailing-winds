"""
Aggregate data over time ranges for each position

Winds: bin directions, bin velocities, calculate value counts of each combination
Precipitation: bin precipitation, value counts for bins
Temperatures: calculate daily max and min, calculate means and SDs of these
Waves: bin height, value counts for bins
Sea surface temperatures: calculate daily max and min, calculate means and SDs of these
Set `DATA_DIR` and `test` to try out.
    
    my/data/dir python s3_aggregate_data.py test
    my/data/dir python s3_aggregate_data.py

"""
from typing import List
from itertools import product
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from src.config import IS_TEST, DATA_DIR, TIME_RANGES, ALL_MONTHS
from src.util import read_parquet, write_parquet, WIND_DIRS, WIND_VELS, RAINS, WAVES

WINDS = list(product((d["i"] for d in WIND_DIRS[:-1]), (d["i"] for d in WIND_VELS)))


def _bin_wind_dirs(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in WIND_DIRS])


def _bin_wind_vels(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in WIND_VELS])


def _bin_rain(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in RAINS])


def _bin_waves(arr: np.array) -> np.array:
    binned = np.digitize(arr, bins=[d["s"] for d in WAVES])
    binned[np.isnan(arr)] = -1
    return binned


def _calc_tmps(years: List[int], label: str):
    for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
        df = read_parquet(DATA_DIR / f"s2_tmps_{years[0]}-{month}.pq")
        index = df.index.copy()

        maxs = []
        mins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_tmps_{year}-{month}.pq")
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
        write_parquet(data=df, file=DATA_DIR / f"s3_tmps_{label}_{month}.pq")


def _calc_prec(years: List[int], label: str):
    max_i = max(d["i"] for d in RAINS)
    for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
        df = read_parquet(DATA_DIR / f"s2_prec_{years[0]}-{month}.pq")
        index = df.index.copy()

        bins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_prec_{year}-{month}.pq")
            assert df.index.equals(index)
            bins.append(_bin_rain(df * 1000))  # convert m to mm

        counts = np.apply_along_axis(
            lambda d: np.bincount(d, minlength=max_i + 1),
            axis=1,
            arr=np.concatenate(bins, axis=1),
        )

        df = pd.DataFrame(counts, index=index)
        df.drop(columns=0, inplace=True)
        write_parquet(data=df, file=DATA_DIR / f"s3_prec_{label}_{month}.pq")


def _calc_winds(years: List[int], label: str):
    for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
        dirs = read_parquet(DATA_DIR / f"s2_wind_dirs_{years[0]}-{month}.pq")
        index = dirs.index.copy()

        counts = pd.DataFrame(0, index=index, columns=[f"{d}|{v}" for d, v in WINDS])
        for year in years:
            print(f"Year {year}-{month}...")
            dirs = read_parquet(DATA_DIR / f"s2_wind_dirs_{year}-{month}.pq")
            vels = read_parquet(DATA_DIR / f"s2_wind_vels_{year}-{month}.pq")

            if IS_TEST:
                dirs = dirs.iloc[:, :10]
                vels = vels.iloc[:, :10]

            assert all(dirs.columns == vels.columns)
            assert index.equals(dirs.index) and index.equals(vels.index)
            cols = dirs.columns

            dir_idxs = pd.DataFrame(_bin_wind_dirs(dirs), index=index, columns=cols)
            dir_idxs.replace(to_replace=17, value=1, inplace=True)  # 17 was helper
            vel_idxs = pd.DataFrame(_bin_wind_vels(vels), index=index, columns=cols)
            del dirs
            del vels

            for col in cols:
                strs = dir_idxs[col].astype(str) + "|" + vel_idxs[col].astype(str)
                for wind in strs.unique():
                    rows = strs.where(strs == wind).dropna().index
                    counts.loc[rows, wind] += 1

        write_parquet(data=counts, file=DATA_DIR / f"s3_winds_{label}_{month}.pq")


def _calc_waves(years: List[int], label: str):
    max_i = max(d["i"] for d in WAVES)
    for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
        df = read_parquet(DATA_DIR / f"s2_waves_{years[0]}-{month}.pq")
        index = df.index.copy()

        bins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_waves_{year}-{month}.pq")
            assert df.index.equals(index)
            bins.append(_bin_waves(df))

        counts = np.apply_along_axis(
            lambda d: np.bincount(d[d >= 0], minlength=max_i + 1),
            axis=1,
            arr=np.concatenate(bins, axis=1),
        )

        df = pd.DataFrame(counts, index=index)
        df.drop(columns=0, inplace=True)
        write_parquet(data=df, file=DATA_DIR / f"s3_waves_{label}_{month}.pq")


def _calc_seatmps(years: List[int], label: str):
    for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
        df = read_parquet(DATA_DIR / f"s2_seatmps_{years[0]}-{month}.pq")
        index = df.index.copy()

        maxs = []
        mins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_seatmps_{year}-{month}.pq")
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
        write_parquet(data=df, file=DATA_DIR / f"s3_seatmps_{label}_{month}.pq")


if __name__ == "__main__":
    for label_, years_ in TIME_RANGES.items():
        print(f"\nCreating temperatures {label_}...")
        _calc_tmps(years=years_, label=label_)

    for label_, years_ in TIME_RANGES.items():
        print(f"\nCreating precipitation {label_}...")
        _calc_prec(years=years_, label=label_)

    for label_, years_ in TIME_RANGES.items():
        print(f"\nCreating winds {label_}...")
        _calc_winds(years=years_, label=label_)

    for label_, years_ in TIME_RANGES.items():
        print(f"\nCreating sea temperatures {label_}...")
        _calc_seatmps(years=years_, label=label_)

    for label_, years_ in TIME_RANGES.items():
        print(f"\nCreating waves {label_}...")
        _calc_waves(years=years_, label=label_)

    print("\ndone")
