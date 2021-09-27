"""
Aggregate data over time ranges for each position

Waves: bin height, value counts for bins
Sea surface temperatures: calculate daily max and min, calculate means and SDs of these
Set `DATA_DIR` and `test` to try out.
    
    python s6_aggregate_water_data.py test
    python s6_aggregate_water_data.py

"""
from pathlib import Path
from typing import List
import sys
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from src.util import (
    read_parquet,
    write_parquet,
    WAVES,
)

TIME_RANGES = {"2020": [2020], "2016-2020": [2016, 2017, 2018, 2019, 2020]}
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
DATA_DIR = Path("/media/marc/Elements/copernicus/tmp")
IS_TEST = "test" in sys.argv[1:]


def bin_waves(arr: np.array) -> np.array:
    binned = np.digitize(arr, bins=[d["s"] for d in WAVES])
    binned[np.isnan(arr)] = -1
    return binned


def calc_waves(years: List[int], label: str):
    max_i = max(d["i"] for d in WAVES)
    for month in MONTHS[:1] if IS_TEST else MONTHS:
        df = read_parquet(DATA_DIR / f"s5_waves_{years[0]}-{month}.pq")
        index = df.index.copy()

        bins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s5_waves_{year}-{month}.pq")
            assert df.index.equals(index)
            bins.append(bin_waves(df))

        counts = np.apply_along_axis(
            lambda d: np.bincount(d[d >= 0], minlength=max_i + 1),
            axis=1,
            arr=np.concatenate(bins, axis=1),
        )

        df = pd.DataFrame(counts, index=index)
        df.drop(columns=0, inplace=True)
        write_parquet(data=df, file=DATA_DIR / f"s6_waves_{label}_{month}.pq")


def calc_seatmps(years: List[int], label: str):
    for month in MONTHS[:1] if IS_TEST else MONTHS:
        df = read_parquet(DATA_DIR / f"s5_seatmps_{years[0]}-{month}.pq")
        index = df.index.copy()

        maxs = []
        mins = []
        for year in years:
            print(f"Year {year}-{month}...")
            df = read_parquet(DATA_DIR / f"s5_seatmps_{year}-{month}.pq")
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
        write_parquet(data=df, file=DATA_DIR / f"s6_seatmps_{label}_{month}.pq")


if __name__ == "__main__":
    for label, years in TIME_RANGES.items():
        print(f"\nCreating sea temperatures {label}...")
        calc_seatmps(years=years, label=label)

    for label, years in TIME_RANGES.items():
        print(f"\nCreating waves {label}...")
        calc_waves(years=years, label=label)

    print("\ndone")
