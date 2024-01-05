# coding=utf-8
"""
Collect values for each month-year and aggregate them

I have to be careful not to fill up my RAM.
Data for each month-year for all coordinates is collected in a
DataFrame which is written as a parquet file.
Column names in that DataFrame contain the day of the month (<day>-<hash>).

    DATA_DIR=my/data/dir IS_TEST=1 python s2_collect_values.py
    DATA_DIR=my/data/dir python s2_collect_values.py
    DATA_DIR=my/data/dir python s2_collect_values.py winds tmps

- messages for each file start at year-01-01 00:00:00 and are ordered by time
- lat-lon grid has 1/4 miles mesh
- lats go from -70 to 70
- lons go from -180 to 179.75
- there are missing values
"""
from typing import BinaryIO, Tuple
import multiprocessing as mp
import pupygrib
import pandas as pd  # type: ignore
from src.util import velocity, direction, randstr, write_parquet
from src.config import IS_TEST, DATA_DIR, ALL_YEARS, ALL_MONTHS, ARGS


def _collect_scalars(y: int, m: int, grib_file: BinaryIO) -> pd.DataFrame:
    """
    Collect in DataFrame with lat-lng index
    """
    print(f"Processing {y}-{m}...")
    dfs = []
    for msg in pupygrib.read(grib_file):
        time = msg.get_time()
        if time.year != y or time.month != m:
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


def _collect_vectors(
    y: int, m: int, grib_file_u: BinaryIO, grib_file_v: BinaryIO
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Calculate directions and velocities and collect in 2 DataFrames
    with lat-lng index each
    """
    print(f"Processing {y}-{m}...")
    dirs_dfs = []
    vels_dfs = []
    for u, v in zip(pupygrib.read(grib_file_u), pupygrib.read(grib_file_v)):
        time = u.get_time()
        if time.year != y or m != time.month:
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
    years = ALL_YEARS
    months = ALL_MONTHS
    if IS_TEST:
        years = years[:1]
        months = months[:1]

    vars = ["rains", "tmps", "seatmps", "winds", "waves"]
    if len(ARGS) > 0:
        vars = [d for d in ARGS if d in vars]

    if "rains" in vars:
        print("\nProcessing rains...")
        for year in years:
            infile = DATA_DIR / f"total_precipitation_{year}.grib"

            def process_rains(month: int):
                outfile = DATA_DIR / f"s2_prec_{year}-{month}.pq"
                with open(infile, "rb") as fh:
                    df = _collect_scalars(y=year, m=month, grib_file=fh)

                write_parquet(data=df, file=outfile)

            with mp.Pool(processes=3) as pool:
                pool.map(process_rains, months)

    if "tmps" in vars:
        print("\nProcessing tmps...")
        for year in years:
            infile = DATA_DIR / f"2m_temperature_{year}.grib"

            def process_tmps(month: int):
                outfile = DATA_DIR / f"s2_tmps_{year}-{month}.pq"

                with open(infile, "rb") as fh:
                    df = _collect_scalars(y=year, m=month, grib_file=fh)

                write_parquet(data=df, file=outfile)

            with mp.Pool(processes=3) as pool:
                pool.map(process_tmps, months)

    if "waves" in vars:
        print("\nProcessing waves...")
        for year in years:
            infile = (
                DATA_DIR
                / f"significant_height_of_combined_wind_waves_and_swell_{year}.grib"
            )

            def process_waves(month: int):
                outfile = DATA_DIR / f"s2_waves_{year}-{month}.pq"

                with open(infile, "rb") as fh:
                    df = _collect_scalars(y=year, m=month, grib_file=fh)

                write_parquet(data=df, file=outfile)

            with mp.Pool(processes=3) as pool:
                pool.map(process_waves, months)

    if "seatmps" in vars:
        print("\nProcessing seatmps...")
        for year in years:
            infile = DATA_DIR / f"sea_surface_temperature_{year}.grib"

            def process_seatmps(month: int):
                outfile = DATA_DIR / f"s2_seatmps_{year}-{month}.pq"

                with open(infile, "rb") as fh:
                    df = _collect_scalars(y=year, m=month, grib_file=fh)

                write_parquet(data=df, file=outfile)

            with mp.Pool(processes=3) as pool:
                pool.map(process_seatmps, months)

    if "winds" in vars:
        print("\nProcessing winds...")
        for year in years:
            u_file = DATA_DIR / f"10m_u_component_of_wind_{year}.grib"
            v_file = DATA_DIR / f"10m_v_component_of_wind_{year}.grib"

            def process_winds(month: int):
                dirs_outfile = DATA_DIR / f"s2_wind_dirs_{year}-{month}.pq"
                vels_outfile = DATA_DIR / f"s2_wind_vels_{year}-{month}.pq"

                with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
                    dirs, vels = _collect_vectors(
                        y=year, m=month, grib_file_u=fh_u, grib_file_v=fh_v
                    )

                write_parquet(data=dirs, file=dirs_outfile)
                write_parquet(data=vels, file=vels_outfile)

            with mp.Pool(processes=2) as pool:
                pool.map(process_winds, months)

    print("done")
