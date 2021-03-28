"""
Write all objects to S3:
- key: <year>/<month>/avgwinds_<lat>;<lng>.pkl
- file: keys and counts of winds where keys are (<direction>, <velocity>)
"""
import pickle
import src.s3 as s3

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
