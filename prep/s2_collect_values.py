# coding=utf-8
"""
Collect values for each month-year and aggregate them

Winds will be binned by direction x velocity.
Temperatures and precipitation values will be collected.
Set `DATA_DIR` and run directly.

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
import numpy as np  # type: ignore
import pyarrow as pa  # type: ignore
import pyarrow.parquet as pq  # type: ignore
from src.util import velocity, direction, wind_vels, wind_dirs

YEARS = [2020, 2019, 2018, 2017, 2016]
DATA_DIR = Path("/media/marc/Elements/copernicus")
IS_TEST = "test" in sys.argv[1:]


def get_winds(
    lats: np.array, lons: np.array, arr_u: np.array, arr_v: np.array
) -> pd.DataFrame:
    """
    Calculate direction and velocity for each average and
    bin them to 16 directions and Beaufort wind speeds.
    """
    df = pd.DataFrame(
        {
            "lon": lons.flatten(),
            "lat": lats.flatten(),
            "u": arr_u.flatten(),
            "v": arr_v.flatten(),
        }
    )
    df = df.groupby(["lon", "lat"]).mean()

    # get direction and velocity
    df["dir"] = direction(u=df["u"], v=df["v"])
    df["vel"] = velocity(u=df["u"], v=df["v"])

    # bin directions and velocities
    df["dir_i"] = np.digitize(df["dir"], bins=[d["s"] for d in wind_dirs])
    df["vel_i"] = np.digitize(df["vel"], bins=[d["s"] for d in wind_vels])

    return df


def collect_winds(
    grib_file_u: BinaryIO, grib_file_v: BinaryIO
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    dirs_dfs = []
    vels_dfs = []
    for i, (u, v) in enumerate(
        zip(pupygrib.read(grib_file_u), pupygrib.read(grib_file_v))
    ):
        if IS_TEST and i > 10:
            break

        time = u.get_time()
        if time.year != year:
            continue
        assert time == v.get_time()

        if i % 500 == 0:
            print(f"Processing msg {i:,} ({year}-{time.month})...")

        lons_u, lats_u = u.get_coordinates()
        lons_v, lats_v = v.get_coordinates()
        assert (lons_u == lons_v).all()
        assert (lats_u == lats_v).all()

        values_u = u.get_values()
        values_v = v.get_values()
        assert values_u.shape == values_v.shape == lons_u.shape

        df = pd.DataFrame(
            {
                "lon": lons_u.flatten(),
                "lat": lats_u.flatten(),
                "u": values_u.flatten(),
                "v": values_v.flatten(),
            }
        )
        df = df.groupby(["lon", "lat"]).mean()
        df["dir"] = direction(u=df["u"], v=df["v"])
        df["vel"] = velocity(u=df["u"], v=df["v"])

        dirs_binned = np.digitize(df["dir"], bins=[d["s"] for d in wind_dirs])
        vels_binned = np.digitize(df["vel"], bins=[d["s"] for d in wind_vels])
        dirs_df = pd.DataFrame(
            {f"{year}-{time.month}/{i}": dirs_binned}, index=df.index
        )
        vels_df = pd.DataFrame(
            {f"{year}-{time.month}/{i}": vels_binned}, index=df.index
        )
        dirs_dfs.append(dirs_df)
        vels_dfs.append(vels_df)

    return pd.concat(dirs_dfs, axis=1), pd.concat(vels_dfs, axis=1)


def collect_scalars(grib_file: BinaryIO) -> pd.DataFrame:
    dfs = []
    for i, msg in enumerate(pupygrib.read(grib_file)):
        if IS_TEST and i > 10:
            break

        time = msg.get_time()
        if time.year != year:
            continue

        if i % 500 == 0:
            print(f"Processing msg {i:,} ({year}-{time.month})...")

        lons, lats = msg.get_coordinates()
        values = msg.get_values()
        assert lats.shape == values.shape == lons.shape

        df = pd.DataFrame(
            {
                "lon": lons.flatten(),
                "lat": lats.flatten(),
                f"{year}-{time.month}/{i}": values.flatten(),
            }
        )
        dfs.append(df.groupby(["lon", "lat"]).mean())

    return pd.concat(dfs, axis=1)


if __name__ == "__main__":

    print("\nProcessing prec...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"total_precipitation_{year}.grib"
        outfile = DATA_DIR / f"s2_prec_{year}.pq"

        with open(infile, "rb") as fh:
            prec = collect_scalars(grib_file=fh)

        pq.write_table(pq.pa.Table.from_pandas(prec), outfile)
    del prec

    print("\nProcessing tmps...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"2m_temperature_{year}.grib"
        outfile = DATA_DIR / f"s2_tmps_{year}.pq"

        with open(infile, "rb") as fh:
            tmps = collect_scalars(grib_file=fh)

        pq.write_table(pq.pa.Table.from_pandas(tmps), outfile)
    del tmps

    print("Processing winds...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        u_file = DATA_DIR / f"10m_u_component_of_wind_{year}.grib"
        v_file = DATA_DIR / f"10m_v_component_of_wind_{year}.grib"
        dirs_outfile = DATA_DIR / f"s2_wind_dirs_{year}.pq"
        vels_outfile = DATA_DIR / f"s2_wind_vels_{year}.pq"

        with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
            dirs, vels = collect_winds(grib_file_u=fh_u, grib_file_v=fh_v)

        pq.write_table(pq.pa.Table.from_pandas(dirs), dirs_outfile)
        pq.write_table(pq.pa.Table.from_pandas(vels), vels_outfile)
    del dirs, vels

    print("done")
