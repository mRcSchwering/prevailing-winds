from pathlib import Path
import sys
import pupygrib
import pandas as pd  # type: ignore
import numpy as np  # type: ignore

YEARS = [2020, 2019, 2018, 2017, 2016]
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
DATA_DIR = Path("/media/marc/Elements/copernicus")
IS_TEST = "test" in sys.argv[1:]

filename = "significant_height_of_combined_wind_waves_and_swell_2017"

with open(DATA_DIR / f"{filename}.grib", "rb") as fh:
    for msg in pupygrib.read(fh):

        # hack because issue: https://gitlab.com/gorilladev/pupygrib/-/issues/1
        bm = np.frombuffer(msg.bitmap.buf, dtype="u1", offset=6)  # type: ignore
        msg.bitmap.bitmap = np.unpackbits(bm)  # type: ignore

        time = msg.get_time()
        lons, lats = msg.get_coordinates()
        values = msg.get_values()
        break

values.max()
