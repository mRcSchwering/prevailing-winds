"""
- download hourly historic wind data from cds.climate.copernicus.eu
- average winds to full minutes of lat and lon
- count monthly occurence of wind direction x velocity
- save as pickled dict
"""
import pickle
import pupygrib
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from src.cds import download_reanalysis
from src.util import velocity, direction, wind_vels, wind_dirs

years = [2020]


def get_avg_winds(
    lats: np.array, lons: np.array, u: np.array, v: np.array
) -> pd.DataFrame:
    """
    Round lats and lons to full minute and calculate mean u and v vectors
    to get average wind within 60 x 60 miles.
    With 1/4 minute marks thats 16 measurements for each vector.

    Calculate direction and velocity for each average and
    bin them to 16 directions and Beaufort wind speeds.
    """
    df = pd.DataFrame(
        {
            "lon": np.rint(lons.flatten()),
            "lat": np.rint(lats.flatten()),
            "u": u.flatten(),
            "v": v.flatten(),
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
    for year in years:
        print(f"downloading files for {year}")
        u_file = f"data/wind_u_{year}.grib"
        v_file = f"data/wind_v_{year}.grib"
        outfile = f"data/monthly_counts_{year}.pkl"

        download_reanalysis(u_file, "10m_u_component_of_wind", str(year))
        download_reanalysis(v_file, "10m_v_component_of_wind", str(year))

        with open(u_file, "rb") as fh_u, open(v_file, "rb") as fh_v:
            total: dict = {}

            prev_month = 0
            for u, v in zip(pupygrib.read(fh_u), pupygrib.read(fh_v)):
                time = u.get_time()
                year = time.year
                month = time.month
                if prev_month != month:
                    print(f"process msg of {month}/{year}")
                    prev_month = month
                assert time == v.get_time()

                lons_u, lats_u = u.get_coordinates()
                lons_v, lats_v = v.get_coordinates()
                assert (lons_u == lons_v).all()
                assert (lats_u == lats_v).all()

                values_u = u.get_values()
                values_v = v.get_values()
                assert values_u.shape == values_v.shape == lons_u.shape

                df = get_avg_winds(lats=lats_u, lons=lons_u, u=values_u, v=values_v)

                # count occurences
                for (lon, lat), row in df.iterrows():
                    pos = (int(lat), int(lon))
                    wind = (int(row["dir_i"]), int(row["vel_i"]))
                    if year not in total:
                        total[year] = {}
                    if month not in total[year]:
                        total[year][month] = {}
                    if pos not in total[year][month]:
                        total[year][month][pos] = {}
                    if wind not in total[year][month][pos]:
                        total[year][month][pos][wind] = 0
                    total[year][month][pos][wind] += 1

        with open(outfile, "wb") as fh:
            pickle.dump(total, fh)

    print("done")
