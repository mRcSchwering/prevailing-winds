# coding=utf-8
"""
Collect values for each month-year and aggregate them

I have to be careful not to fill up my RAM.
Data for each month-year for all coordinates is collected in a
DataFrame which is written as a parquet file.
Column names in that DataFrame contain the day of the month (<day>-<hash>).
Set `DATA_DIR` and run directly.
`test` only runs 1 year, 1 month.

    DATA_DIR=my/data/dir python s2_collect_values.py test
    DATA_DIR=my/data/dir python s2_collect_values.py

- messages for each file start at year-01-01 00:00:00 and are ordered by time
- lat-lon grid has 1/4 miles mesh
- lats go from -70 to 70
- lons go from -180 to 179.75
- there are missing values
"""
from typing import BinaryIO, Tuple
import pupygrib
import pandas as pd  # type: ignore
from src.util import velocity, direction, randstr, write_parquet
from src.config import IS_TEST, DATA_DIR, ALL_YEARS, ALL_MONTHS


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

        # TODO: this hack should be unnecessary by now
        # hack because issue: https://gitlab.com/gorilladev/pupygrib/-/issues/1
        # bm = np.frombuffer(msg.bitmap.buf, dtype="u1", offset=6)  # type: ignore
        # msg.bitmap.bitmap = np.unpackbits(bm)  # type: ignore

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


def _collect_winds(
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

    print("\nProcessing prec...")
    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        infile = DATA_DIR / f"total_precipitation_{year}.grib"
        for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_prec_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                prec = _collect_scalars(y=year, m=month, grib_file=fh)

            write_parquet(data=prec, file=outfile)
    del prec

    print("\nProcessing tmps...")
    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        infile = DATA_DIR / f"2m_temperature_{year}.grib"
        for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_tmps_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                tmps = _collect_scalars(y=year, m=month, grib_file=fh)

            write_parquet(data=tmps, file=outfile)
    del tmps

    print("\nProcessing winds...")
    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        u_file = DATA_DIR / f"10m_u_component_of_wind_{year}.grib"
        v_file = DATA_DIR / f"10m_v_component_of_wind_{year}.grib"
        for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
            dirs_outfile = DATA_DIR / "tmp" / f"s2_wind_dirs_{year}-{month}.pq"
            vels_outfile = DATA_DIR / "tmp" / f"s2_wind_vels_{year}-{month}.pq"

            with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
                dirs, vels = _collect_winds(
                    y=year, m=month, grib_file_u=fh_u, grib_file_v=fh_v
                )

            write_parquet(data=dirs, file=dirs_outfile)
            write_parquet(data=vels, file=vels_outfile)
    del dirs, vels

    print("\nProcessing waves...")
    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        infile = (
            DATA_DIR
            / f"significant_height_of_combined_wind_waves_and_swell_{year}.grib"
        )
        for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_waves_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                waves = _collect_scalars(y=year, m=month, grib_file=fh)

            write_parquet(data=waves, file=outfile)
    del waves

    print("\nProcessing seatmps...")
    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        infile = DATA_DIR / f"sea_surface_temperature_{year}.grib"
        for month in ALL_MONTHS[:1] if IS_TEST else ALL_MONTHS:
            outfile = DATA_DIR / "tmp" / f"s2_seatmps_{year}-{month}.pq"

            with open(infile, "rb") as fh:
                seatmps = _collect_scalars(y=year, m=month, grib_file=fh)

            write_parquet(data=seatmps, file=outfile)
    del seatmps

    print("done")
