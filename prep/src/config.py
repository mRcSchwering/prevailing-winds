"""Some generic config"""
import os
import sys
from pathlib import Path
import datetime as dt


THIS_YEAR = dt.date.today().year
ALL_YEARS = list(range(THIS_YEAR - 5, THIS_YEAR))
ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

TIME_RANGES = {
    f"{ALL_YEARS[-1]}": [ALL_YEARS[-1]],
    f"{ALL_YEARS[0]}-{ALL_YEARS[-1]}": ALL_YEARS,
}

ARGS = sys.argv[1:]
VERSION_PREFIX = "v4"
IS_TEST = "IS_TEST" in os.environ
DATA_DIR = Path(os.environ.get("DATA_DIR", "data/tmp"))
