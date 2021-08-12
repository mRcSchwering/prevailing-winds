"""
Write all objects to S3:
- key: <year>/<month>/avgwinds_<lat>;<lng>.pkl
- file: keys and counts of winds where keys are (<direction>, <velocity>)
"""
from pathlib import Path
from typing import List
import sys
import pickle
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from src.util import read_parquet, bin_rain, count_rain_bins
import src.s3 as s3

TIME_RANGES = {"2020": [2020], "2016-2020": [2016, 2017, 2018]}
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
DATA_DIR = Path("/media/marc/Elements/copernicus/tmp")
IS_TEST = "test" in sys.argv[1:]


def create_prec_objs(years: List[int], label: str):
    print(f"\nCreating precipitation {label}...")
    for month in MONTHS:
        df = read_parquet(DATA_DIR / f"s2_prec_{years[0]}-{month}.pq")
        index = df.index.copy()

        bins = []
        for year in years:
            print(f"Creating precipitation {label}...")
            df = read_parquet(DATA_DIR / f"s2_prec_{year}-{month}.pq")
            assert df.index.equals(index)
            bins.append(bin_rain(df * 1000))

        counts = count_rain_bins(np.concatenate(bins, axis=1))
        df = pd.DataFrame(counts, index=df.index)
        df.drop(columns=0, inplace=True)

        for (lat, lng), row in df.iterrows():
            s3.write_wind_obj(
                obj=row.to_dict(),
                year=label,
                month=month,
                lat=lat,
                lng=lng,
                prefix="v2",
            )


single_years = [2020]
time_ranges = {"2016-2020": (2016, 2020)}


def upload_single_year(year: int):
    print(f"\nStarting year {year}...")

    with open(f"data/monthly_counts_{year}.pkl", "rb") as fh:
        data = pickle.load(fh)

    for month in data[year].keys():
        print(f"Starting {year}/{month}...")

        for lat, lng in data[year][month]:
            s3.write_wind_obj(
                obj=data[year][month][(lat, lng)],
                year=year,
                month=month,
                lat=lat,
                lng=lng,
            )


def upload_time_range(from_year: int, to_year: int, name: str):
    print(f"\nStarting timerange {name}...")
    full_time_range = list(range(from_year, to_year + 1))

    print(f"Aggregating all years...")
    res = {}  # type: ignore
    for year in full_time_range:
        with open(f"data/monthly_counts_{year}.pkl", "rb") as fh:
            data = pickle.load(fh)[year]

        for month in data:
            if month not in res:
                res[month] = {}

            for pos in data[month]:
                if pos not in res[month]:
                    res[month][pos] = {}

                for key, count in data[month][pos].items():
                    if key not in res[month][pos]:
                        res[month][pos][key] = count
                    else:
                        res[month][pos][key] = res[month][pos][key] + count

    print("Uploading objects...")
    for month in res.keys():
        print(f"Starting {name}/{month}...")
        for lat, lng in res[month]:
            s3.write_wind_obj(
                obj=res[month][(lat, lng)], year=name, month=month, lat=lat, lng=lng,
            )


if __name__ == "__main__":
    for year in single_years:
        # upload_single_year(year)  # TODO: put back in
        pass
    for key, years in time_ranges.items():
        upload_time_range(*years, name=key)

    print("\ndone")
