"""
Write all objects to s3

One object for every position x month x time range => ~20M objects.

Vanilla from home 1 month, 100 records: 18s => 20 days
Subroutines from home 1 month, 100 records: 7s => 8 days


    python s4_upload_objs.py test
    python s4_upload_objs.py

"""
from pathlib import Path
import sys
import eventlet  # type: ignore

eventlet.monkey_patch()
from src.util import read_parquet
import src.s3 as s3
import time

TIME_RANGES = ["2020", "2016-2020"]
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
PREFIX = "v2"
DATA_DIR = Path("data/tmp")
IS_TEST = "test" in sys.argv[1:]

# TODO: check https://stackoverflow.com/questions/27478568/how-to-upload-small-files-to-amazon-s3-efficiently-in-python
# mit https://eventlet.net/


if __name__ == "__main__":
    t0 = time.time()
    for time_range in TIME_RANGES:
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            print(f"Processing {time_range}/{month}...")

            prec = read_parquet(DATA_DIR / f"s3_prec_{time_range}_{month}.pq")
            prec.columns = [str(d) for d in prec.columns]
            tmps = read_parquet(DATA_DIR / f"s3_tmps_{time_range}_{month}.pq")
            tmps.rename(
                columns={
                    "high_mean": "highMean",
                    "high_std": "highStd",
                    "low_mean": "lowMean",
                    "low_std": "lowStd",
                },
                inplace=True,
            )
            winds = read_parquet(DATA_DIR / f"s3_winds_{time_range}_{month}.pq")
            winds.columns = [tuple(d.split("|")) for d in winds.columns]

            assert prec.index.equals(tmps.index)
            assert tmps.index.equals(winds.index)
            n = len(prec.index)

            pool = eventlet.GreenPool()
            for i, (lng, lat) in enumerate(prec.index):
                if i % 40000 == 0:
                    print(f"...{i/n*100:.0f}% done...")
                if IS_TEST and i > 100:
                    break

                key = f"{PREFIX}/{time_range}/{month}/{lat:.2f}/{lng:.2f}/data.pkl"
                data = {
                    "prec": prec.loc[(lng, lat)].to_dict(),
                    "tmps": tmps.loc[(lng, lat)].to_dict(),
                    "winds": winds.loc[(lng, lat)].to_dict(),
                }
                # s3.put_obj(key=key, obj=data)
                pool.spawn_n(s3.put_obj, key, data)
            pool.waitall()

    print(time.time() - t0)
    print("\ndone")
