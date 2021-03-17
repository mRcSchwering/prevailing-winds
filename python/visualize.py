import pickle
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import matplotlib.pyplot as plt  # type: ignore
from src.util import wind_dirs, wind_vels

wind_dir_ks = [d["k"] for d in wind_dirs[:-1]]
wind_vel_ks = [d["k"] for d in wind_vels]
dir_i_2_k = {d["i"]: d["k"] for d in wind_dirs}
vel_i_2_k = {d["i"]: d["k"] for d in wind_vels}


with open("data/monthly_counts_2020.pkl", "rb") as fh:
    data = pickle.load(fh)


def get_records(year: int, month: int, lat: int, lon: int) -> pd.DataFrame:
    df = pd.DataFrame.from_records(
        [
            {"dir_i": k[0], "vel_i": k[1], "count": d}
            for k, d in data[year][month][(lat, lon)].items()
        ]
    )
    df["dir"] = [dir_i_2_k[d] for d in df["dir_i"]]
    df["vel"] = [vel_i_2_k[d] for d in df["vel_i"]]
    return df


def plot(df):
    cm = plt.get_cmap("YlGnBu")
    colors = [cm(1.0 * i / len(wind_vel_ks)) for i in range(len(wind_vel_ks))]
    theta = np.linspace(0.0, 2 * np.pi, len(dir_i_2_k) - 1, endpoint=False)
    bottoms = np.array([0 for _ in wind_dir_ks])

    ax = plt.subplot(111, projection="polar")
    ax.set_theta_zero_location("N")

    grps = df.groupby(["vel", "dir"])["count"].groups
    geoms = []
    for i, vel_k in enumerate(wind_vel_ks):
        counts = []
        for dir_k in wind_dir_ks:
            key = (vel_k, dir_k)
            if key in grps:
                counts.append(sum(grps[key]))
            else:
                counts.append(0)
        counts = np.array(counts)
        geom = ax.bar(theta, counts, width=np.pi / 8, bottom=bottoms, color=colors[i])
        geoms.append(geom)
        bottoms = counts + bottoms
    plt.legend(geoms, wind_vel_ks, loc="upper left", bbox_to_anchor=(-0.4, 0.7))
    plt.show()


plot(get_records(year=2020, month=2, lat=25, lon=40))

