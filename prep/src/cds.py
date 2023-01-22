"""
Download historical data from cds.climate.copernicus.eu.

from: https://cds.climate.copernicus.eu/cdsapp#!/yourrequests?tab=form
doc: https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-land?tab=overview

"""
from typing import Union
from pathlib import Path
import datetime as dt
import cdsapi  # type: ignore

client = cdsapi.Client()

_SPARSE_TIMES = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
]

_ALL_MONTHS = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
]

_ALL_DAYS = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
]


def download_reanalysis(
    outfile: Union[str, Path], variable: str, year: str, test=False
):
    """
    - using dataset: reanalysis-era5-single-levels (global hourly data back to 1981)
    - reduce file size by just taking every 3rd hour, -70 to 70 lat, and only 1 year and 1 variable
    """
    this_year = dt.date.today().year
    assert year in [str(d) for d in range(this_year - 20, this_year)]
    client.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "variable": variable,
            "year": year,
            "month": _ALL_MONTHS[:1] if test else _ALL_MONTHS,
            "day": _ALL_DAYS[:1] if test else _ALL_DAYS,
            "time": _SPARSE_TIMES[:1] if test else _SPARSE_TIMES,
            "format": "grib",
            "area": [70, 179, 69, 180] if test else [70, -180, -70, 180],
        },
        str(outfile),
    )
