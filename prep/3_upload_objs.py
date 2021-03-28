"""
Write all objects to S3:
- key: <year>/<month>/avgwinds_<lat>;<lng>.pkl
- file: keys and counts of winds where keys are (<direction>, <velocity>)
"""
import pickle
import src.s3 as s3

years = [2020]


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


if __name__ == "__main__":
    for year in years:
        upload_single_year(year)
    print("\ndone")
