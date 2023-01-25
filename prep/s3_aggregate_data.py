"""
Aggregate data over time ranges for each position

Winds: bin directions, bin velocities, calculate value counts of each combination
Precipitation: bin precipitation, value counts for bins
Temperatures: calculate daily max and min, calculate means and SDs of these
Waves: bin height, value counts for bins
Sea surface temperatures: calculate daily max and min, calculate means and SDs of these
Careful, this can take a few hours and uses >10GB RAM.
    
    DATA_DIR=my/data/dir IS_TEST=1 python s3_aggregate_data.py
    DATA_DIR=my/data/dir python s3_aggregate_data.py
    DATA_DIR=my/data/dir python s3_aggregate_data.py winds tmps

"""
from typing import List
from itertools import product
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from src.config import IS_TEST, DATA_DIR, TIME_RANGES, ALL_MONTHS, THIS_YEAR, ARGS
from src.util import read_parquet, write_parquet, WIND_DIRS, WIND_VELS, WAVES

WINDS = list(product((d["i"] for d in WIND_DIRS[:-1]), (d["i"] for d in WIND_VELS)))


def _bin_wind_dirs(arr: np.ndarray) -> np.ndarray:
    return np.digitize(arr, bins=[d["s"] for d in WIND_DIRS])


def _bin_wind_vels(arr: np.ndarray) -> np.ndarray:
    return np.digitize(arr, bins=[d["s"] for d in WIND_VELS])


def _bin_waves(arr: np.ndarray) -> np.ndarray:
    binned = np.digitize(arr, bins=[d["s"] for d in WAVES])
    binned[np.isnan(arr)] = -1
    return binned


def _calc_tmps(years: List[int], months: List[int], label: str):
    for month in months:
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


def _calc_prec(years: List[int], months: List[int], label: str):
    for month in months:
        df = read_parquet(DATA_DIR / f"s2_prec_{years[0]}-{month}.pq")
        index = df.index.copy()

        sums = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s2_prec_{year}-{month}.pq")
            assert df.index.equals(index)
            
            days = set(d.split("-")[0] for d in df.columns)
            for day in days:
                cols = [d for d in df.columns if d.split("-")[0] == day]
                sums.append(df[cols].sum(axis=1).to_numpy() * 1000) # m to mm

        sums_arr = np.stack(sums, axis=1)
        df = pd.DataFrame(
            {
                "daily_mean": np.mean(sums_arr, axis=1),
                "daily_std": np.std(sums_arr, axis=1),
            },
            index=df.index,
        )
        write_parquet(data=df, file=DATA_DIR / f"s3_prec_{label}_{month}.pq")


def _calc_winds(years: List[int], months: List[int], label: str):
    windstrs = [f"{d}|{v}" for d, v in WINDS]
    for month in months:
        dirs = read_parquet(DATA_DIR / f"s2_wind_dirs_{years[0]}-{month}.pq")
        index = dirs.index.copy()
        del dirs

        C = np.zeros((len(index), len(WINDS)), dtype=int)        
        for year in years:
            print(f"Year {year}-{month}...")
            
            dirs = read_parquet(DATA_DIR / f"s2_wind_dirs_{year}-{month}.pq")
            assert index.equals(dirs.index)
            cols = dirs.columns.copy()

            D = _bin_wind_dirs(dirs)
            D[D == 17] = 1  # 17 was helper
            del dirs

            vels = read_parquet(DATA_DIR / f"s2_wind_vels_{year}-{month}.pq")
            assert index.equals(vels.index)
            assert all(cols == vels.columns)

            V = _bin_wind_vels(vels)
            del vels

            for ci, (dr, vl) in enumerate(WINDS):
                C[:, ci] += np.sum((D == dr) & (V == vl), axis=1)

        counts = pd.DataFrame(C, index=index, columns=windstrs)
        write_parquet(data=counts, file=DATA_DIR / f"s3_winds_{label}_{month}.pq")
        del counts, C


def _calc_waves(years: List[int], months: List[int], label: str):
    max_i = max(d["i"] for d in WAVES)
    for month in months:
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


def _calc_seatmps(years: List[int], months: List[int], label: str):
    for month in months:
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
    all_months = ALL_MONTHS
    time_ranges = TIME_RANGES
    if IS_TEST:
        all_months = ALL_MONTHS[:1]
        time_ranges = {str(THIS_YEAR): time_ranges[str(THIS_YEAR)]}

    vars = ["rains", "tmps", "seatmps", "winds", "waves"]
    if len(ARGS) > 0:
        vars = [d for d in ARGS if d in vars]

    if "tmps" in vars:
        for label_, years_ in time_ranges.items():
            print(f"\nCreating tmps {label_}...")
            _calc_tmps(years=years_, months=all_months, label=label_)

    if "rains" in vars:
        for label_, years_ in time_ranges.items():
            print(f"\nCreating rains {label_}...")
            _calc_prec(years=years_, months=all_months, label=label_)

    if "winds" in vars:
        for label_, years_ in time_ranges.items():
            print(f"\nCreating winds {label_}...")
            _calc_winds(years=years_, months=all_months, label=label_)

    if "seatmps" in vars:
        for label_, years_ in time_ranges.items():
            print(f"\nCreating seatmps {label_}...")
            _calc_seatmps(years=years_, months=all_months, label=label_)

    if "waves" in vars:
        for label_, years_ in time_ranges.items():
            print(f"\nCreating waves {label_}...")
            _calc_waves(years=years_, months=all_months, label=label_)

    print("\ndone")
