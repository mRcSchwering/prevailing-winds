"""
Aggregate data over time ranges for each position

Winds: bin directions, bin velocities, calculate value counts of each combination
Precipitation: bin precipitation, value counts for bins
Temperatures: calculate daily max and min, calculate means and SDs of these
Set `DATA_DIR` and `test` to try out.
    
    python s3_aggregate_data.py test
    python s3_aggregate_data.py

"""
from pathlib import Path
from typing import List
from itertools import product
import sys
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from src.util import (
    read_parquet,
    write_parquet,
    WIND_DIRS,
    WIND_VELS,
    RAINS,
)

TIME_RANGES = {"2020": [2020], "2016-2020": [2016, 2017, 2018, 2019, 2020]}
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
WINDS = list(product((d["i"] for d in WIND_DIRS[:-1]), (d["i"] for d in WIND_VELS)))
DATA_DIR = Path("/media/marc/Elements/copernicus/tmp")
IS_TEST = "test" in sys.argv[1:]


def bin_wind_dirs(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in WIND_DIRS])


def bin_wind_vels(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in WIND_VELS])


def bin_rain(arr: np.array) -> np.array:
    return np.digitize(arr, bins=[d["s"] for d in RAINS])


def calc_tmps(years: List[int], label: str):
    for month in MONTHS[:1] if IS_TEST else MONTHS:
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


def calc_prec(years: List[int], label: str):
    max_i = max(d["i"] for d in RAINS)
    for month in MONTHS[:1] if IS_TEST else MONTHS:
        df = read_parquet(DATA_DIR / f"s2_prec_{years[0]}-{month}.pq")
        index = df.index.copy()

        bins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_prec_{year}-{month}.pq")
            assert df.index.equals(index)
            bins.append(bin_rain(df * 1000))  # convert m to mm

        counts = np.apply_along_axis(
            lambda d: np.bincount(d, minlength=max_i + 1),
            axis=1,
            arr=np.concatenate(bins, axis=1),
        )

        df = pd.DataFrame(counts, index=index)
        df.drop(columns=0, inplace=True)
        write_parquet(data=df, file=DATA_DIR / f"s3_prec_{label}_{month}.pq")


def calc_winds(years: List[int], label: str):
    for month in MONTHS[:1] if IS_TEST else MONTHS:
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

            dir_idxs = pd.DataFrame(bin_wind_dirs(dirs), index=index, columns=cols)
            dir_idxs.replace(to_replace=17, value=1, inplace=True)  # 17 was helper
            vel_idxs = pd.DataFrame(bin_wind_vels(vels), index=index, columns=cols)
            del dirs
            del vels

            for col in cols:
                strs = dir_idxs[col].astype(str) + "|" + vel_idxs[col].astype(str)
                for wind in strs.unique():
                    rows = strs.where(strs == wind).dropna().index
                    counts.loc[rows, wind] += 1

        write_parquet(data=counts, file=DATA_DIR / f"s3_winds_{label}_{month}.pq")


if __name__ == "__main__":
    for label, years in TIME_RANGES.items():
        print(f"\nCreating temperatures {label}...")
        calc_tmps(years=years, label=label)

    for label, years in TIME_RANGES.items():
        print(f"\nCreating precipitation {label}...")
        calc_prec(years=years, label=label)

    for label, years in TIME_RANGES.items():
        print(f"\nCreating winds {label}...")
        calc_winds(years=years, label=label)

    print("\ndone")
