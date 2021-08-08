"""
Collect values for each month-year and aggregate them

Winds will be binned by direction x velocity.
Temperatures and precipitation values will be collected in lists.
Set `DATA_DIR` and run directly.

    python s2_aggregate_values.py test
    python s2_aggregate_values.py

- messages for each file start at year-01-01 00:00:00 and are ordered by time
- lat-lon grid has 1/4 miles mesh
- lats go from -70 to 70
- lons go from -180 to 179.75
"""
from pathlib import Path
import pickle
import sys
import pupygrib
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from src.util import velocity, direction, wind_vels, wind_dirs

YEARS = [2020, 2019, 2018, 2017, 2016]
DATA_DIR = Path("/media/marc/Elements/copernicus")
IS_TEST = "test" in sys.argv[1:]


def get_prec(lats: np.array, lons: np.array, vals: np.array) -> pd.DataFrame:
    df = pd.DataFrame(
        {"lon": lons.flatten(), "lat": lats.flatten(), "prec": vals.flatten()}
    )
    return df.groupby(["lon", "lat"]).mean()


def get_tmps(lats: np.array, lons: np.array, vals: np.array) -> pd.DataFrame:
    df = pd.DataFrame(
        {"lon": lons.flatten(), "lat": lats.flatten(), "tmp": vals.flatten()}
    )
    return df.groupby(["lon", "lat"]).mean()


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


if __name__ == "__main__":

    print("Processing prec...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"total_precipitation_{year}.grib"
        outfile = DATA_DIR / f"s2_prec_{year}.pkl"

        all_prec: dict = {}
        with open(infile, "rb") as fh:
            prev_month = -1
            for msg in pupygrib.read(fh):
                time = msg.get_time()
                if year != time.year:
                    continue
                if IS_TEST and time.month > 1:
                    break
                if prev_month != time.month:
                    print(f"Processing prec... msg of {time.month}/{year}")
                    prev_month = time.month

                lons, lats = msg.get_coordinates()
                values = msg.get_values()
                assert lats.shape == values.shape == lons.shape
                prec = get_prec(lats=lats, lons=lons, vals=values)

                # collect values
                for (lon, lat), row in prec.iterrows():
                    pos = (f"{lat:.2f}", f"{lon:.2f}")
                    if year not in all_prec:
                        all_prec[year] = {}
                    if time.month not in all_prec[year]:
                        all_prec[year][time.month] = {}
                    if pos not in all_prec[year][time.month]:
                        all_prec[time.year][time.month][pos] = []
                    all_prec[year][time.month][pos].append(row["prec"])

        with open(outfile, "wb") as fh:
            pickle.dump(all_prec, fh)
    del all_prec

    print("Processing tmps...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        infile = DATA_DIR / f"2m_temperature_{year}.grib"
        outfile = DATA_DIR / f"s2_tmps_{year}.pkl"

        all_tmps: dict = {}
        with open(infile, "rb") as fh:
            prev_month = -1
            for msg in pupygrib.read(fh):
                time = msg.get_time()
                if year != time.year:
                    continue
                if IS_TEST and time.month > 1:
                    break
                if prev_month != time.month:
                    print(f"Processing tmps... msg of {time.month}/{year}")
                    prev_month = time.month

                lons, lats = msg.get_coordinates()
                values = msg.get_values()
                assert lats.shape == values.shape == lons.shape
                tmps = get_tmps(lats=lats, lons=lons, vals=values)

                # collect values
                for (lon, lat), row in tmps.iterrows():
                    pos = (f"{lat:.2f}", f"{lon:.2f}")
                    if year not in all_tmps:
                        all_tmps[year] = {}
                    if time.month not in all_tmps[year]:
                        all_tmps[year][time.month] = {}
                    if pos not in all_tmps[year][time.month]:
                        all_tmps[year][time.month][pos] = []
                    all_tmps[year][time.month][pos].append(row["tmp"])

        with open(outfile, "wb") as fh:
            pickle.dump(all_tmps, fh)
    del all_tmps

    print("Processing winds...")
    for year in YEARS[:1] if IS_TEST else YEARS:
        u_file = DATA_DIR / f"10m_u_component_of_wind_{year}.grib"
        v_file = DATA_DIR / f"10m_v_component_of_wind_{year}.grib"
        outfile = DATA_DIR / f"s2_winds_{year}.pkl"

        all_winds: dict = {}
        with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
            prev_month = -1
            for u, v in zip(pupygrib.read(fh_u), pupygrib.read(fh_v)):
                time = u.get_time()
                if year != time.year:
                    continue
                if IS_TEST and time.month > 1:
                    break
                if prev_month != time.month:
                    print(f"Processing winds... msg of {time.month}/{year}")
                    prev_month = time.month
                assert time == v.get_time()

                lons_u, lats_u = u.get_coordinates()
                lons_v, lats_v = v.get_coordinates()
                assert (lons_u == lons_v).all()
                assert (lats_u == lats_v).all()

                values_u = u.get_values()
                values_v = v.get_values()
                assert values_u.shape == values_v.shape == lons_u.shape

                winds = get_winds(
                    lats=lats_u, lons=lons_u, arr_u=values_u, arr_v=values_v
                )

                # count occurences
                for (lon, lat), row in winds.iterrows():
                    pos = (f"{lat:.2f}", f"{lon:.2f}")
                    wind = (int(row["dir_i"]), int(row["vel_i"]))
                    if year not in all_winds:
                        all_winds[year] = {}
                    if time.month not in all_winds[year]:
                        all_winds[year][time.month] = {}
                    if pos not in all_winds[year][time.month]:
                        all_winds[year][time.month][pos] = {}
                    if wind not in all_winds[year][time.month][pos]:
                        all_winds[year][time.month][pos][wind] = 0
                    all_winds[year][time.month][pos][wind] += 1

        with open(outfile, "wb") as fh:
            pickle.dump(all_winds, fh)
    del all_winds

    print("done")
