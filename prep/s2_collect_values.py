# coding=utf-8
"""
Collect values for each month-year and aggregate them

I have to be careful not to fill up my RAM.
Data for each month-year for all coordinates is collected in a
DataFrame which is written as a parquet file.
Column names in that DataFrame contain the day of the month (<day>-<hash>).
Set `DATA_DIR` and run directly.
`test` only runs 1 year, 1 month.

    python s2_collect_values.py test
    python s2_collect_values.py

- messages for each file start at year-01-01 00:00:00 and are ordered by time
- lat-lon grid has 1/4 miles mesh
- lats go from -70 to 70
- lons go from -180 to 179.75
"""
from pathlib import Path
import sys
from typing import BinaryIO, Tuple
import pupygrib
import pandas as pd  # type: ignore
from src.util import velocity, direction, randstr, write_parquet

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


def collect_winds(
    year: int, month: int, grib_file_u: BinaryIO, grib_file_v: BinaryIO
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Calculate directions and velocities and collect in 2 DataFrames
    with lat-lng index each
    """
    print(f"Processing {year}-{month}...")
    dirs_dfs = []
    vels_dfs = []
    for u, v in zip(pupygrib.read(grib_file_u), pupygrib.read(grib_file_v)):
        time = u.get_time()
        if time.year != year or month != time.month:
            continue
        assert time == v.get_time()

        lons_u, lats_u = u.get_coordinates()
        lons_v, lats_v = v.get_coordinates()
        assert (lons_u == lons_v).all()
        assert (lats_u == lats_v).all()

        values_u = u.get_values()
        values_v = v.get_values()
        assert values_u.shape == values_v.shape == lons_u.shape

        df = pd.DataFrame(
            {
                "lat": lats_u.flatten(),
                "lon": lons_u.flatten(),
                "u": values_u.flatten(),
                "v": values_v.flatten(),
            }
        )
        df = df.groupby(["lon", "lat"]).mean()
        key = f"{time.day}-{randstr()}"  # same key = important
        dirs_df = pd.DataFrame({key: direction(u=df["u"], v=df["v"])}, index=df.index)
        vels_df = pd.DataFrame({key: velocity(u=df["u"], v=df["v"])}, index=df.index)
        dirs_dfs.append(dirs_df)
        vels_dfs.append(vels_df)

    return pd.concat(dirs_dfs, axis=1), pd.concat(vels_dfs, axis=1)


if __name__ == "__main__":

    print("\nProcessing prec...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"total_precipitation_{year}.grib"
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_prec_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                prec = collect_scalars(year=year, month=month, grib_file=fh)

            write_parquet(data=prec, file=outfile)
    del prec

    print("\nProcessing tmps...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"2m_temperature_{year}.grib"
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_tmps_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                tmps = collect_scalars(year=year, month=month, grib_file=fh)

            write_parquet(data=tmps, file=outfile)
    del tmps

    print("\nProcessing winds...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        u_file = DATA_DIR / f"10m_u_component_of_wind_{year}.grib"
        v_file = DATA_DIR / f"10m_v_component_of_wind_{year}.grib"
        for month in MONTHS[:1] if IS_TEST else MONTHS:
            dirs_outfile = DATA_DIR / "tmp" / f"s2_wind_dirs_{year}-{month}.pq"
            vels_outfile = DATA_DIR / "tmp" / f"s2_wind_vels_{year}-{month}.pq"

            with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
                dirs, vels = collect_winds(
                    year=year, month=month, grib_file_u=fh_u, grib_file_v=fh_v
                )

            write_parquet(data=dirs, file=dirs_outfile)
            write_parquet(data=vels, file=vels_outfile)
    del dirs, vels

    print("done")

