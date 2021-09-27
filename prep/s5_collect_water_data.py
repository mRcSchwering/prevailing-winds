# coding=utf-8
"""
Collect sea tmp and wave height values for each month-year and aggregate them

I have to be careful not to fill up my RAM.
Data for each month-year for all coordinates is collected in a
DataFrame which is written as a parquet file.
Column names in that DataFrame contain the day of the month (<day>-<hash>).
Set `DATA_DIR` and run directly.
`test` only runs 1 year, 1 month.

    python s5_collect_water_data.py test
    python s5_collect_water_data.py

- messages for each file start at year-01-01 00:00:00 and are ordered by time
- lat-lon grid has 1/4 miles mesh
- lats go from -70 to 70
- lons go from -180 to 179.75
- there are missing values
- need little hack because of pupygrib bug (https://gitlab.com/gorilladev/pupygrib/-/issues/1)
"""
from pathlib import Path
from typing import BinaryIO
import sys
import pupygrib
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from src.util import randstr, write_parquet

YEARS = [2020, 2019, 2018, 2017, 2016]
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
DATA_DIR = Path("/media/marc/Elements/copernicus")
IS_TEST = "test" in sys.argv[1:]


def collect_scalars(year: int, month: int, grib_file: BinaryIO) -> pd.DataFrame:
    """
    Collect in DataFrame with lat-lng index
    """
    print(f"Processing {year}-{month}...")
    dfs = []
    for msg in pupygrib.read(grib_file):
        time = msg.get_time()
        if time.year != year or time.month != month:
            continue

        # hack because issue: https://gitlab.com/gorilladev/pupygrib/-/issues/1
        bm = np.frombuffer(msg.bitmap.buf, dtype="u1", offset=6)  # type: ignore
        msg.bitmap.bitmap = np.unpackbits(bm)  # type: ignore

        lons, lats = msg.get_coordinates()
        values = msg.get_values()
        assert lats.shape == values.shape == lons.shape

        df = pd.DataFrame(
            {
                "lat": lats.flatten(),
                "lon": lons.flatten(),
                f"{time.day}-{randstr()}": values.flatten(),
            }
        )
        dfs.append(df.groupby(["lon", "lat"]).mean())

    return pd.concat(dfs, axis=1)


if __name__ == "__main__":

    print("\nProcessing waves...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = (
            DATA_DIR
            / f"significant_height_of_combined_wind_waves_and_swell_{year}.grib"
        )
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            outfile = DATA_DIR / "tmp" / f"s5_waves_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                waves = collect_scalars(year=year, month=month, grib_file=fh)

            write_parquet(data=waves, file=outfile)
    del waves

    print("\nProcessing seatmps...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"sea_surface_temperature_{year}.grib"
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            outfile = DATA_DIR / "tmp" / f"s5_seatmps_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                seatmps = collect_scalars(year=year, month=month, grib_file=fh)

            write_parquet(data=seatmps, file=outfile)
    del seatmps

