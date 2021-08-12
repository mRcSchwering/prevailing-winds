"""
Here are some sanity checks before uploading the data to s3
"""
from pathlib import Path
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import matplotlib.pyplot as plt  # type: ignore
from src.util import (
    read_parquet,
    WIND_DIRS,
    WIND_VELS,
)

DATA_DIR = Path("/media/marc/Elements/copernicus/tmp")
WIND_VEL_I2B = {str(d["i"]): d["b"] for d in WIND_VELS}
WIND_VEL_I2K = {str(d["i"]): d["k"] for d in WIND_VELS}
WIND_DIR_I2K = {str(d["i"]): d["k"] for d in WIND_DIRS}
WIND_VEL_KS = [d["k"] for d in WIND_VELS]
WIND_DIR_KS = [d["k"] for d in WIND_DIRS]

# dfs have lng, lat indices

# Paris
# Jan 2020
# 3-9C, rain, fog, clear, 0-12m/s ave 4m/s winds
# July 2020
# 14-26C, rain, cloudy, clear, 0-9m/s ave 3m/s winds
coords_paris = (2.25, 48.75)

# Shanghai
# Jan 2020
# 5-10C, rain, fog, cloudy, 0-12m/s ave 4m/s winds
# July 2020
# 24-30C, rain, thunderstorm, fog, 0-9m/s ave 4m/s
coords_shanghai = (121.5, 31.25)

# Mumbai
# Jan 2020
# 19-30C, fog, cloudy, clear, 0-7m/s ave 2m/s winds
# July 2020
# 26-31C, rain, thunderstorm, fog, 0-9m/s ave 3m/s winds
coords_mumbai = (72.75, 19)

# Reykjavik
# Jan 2020
# -2-3C, rain, snow, hail, 0-21m/s ave 8m/s winds
# July 2020
# 9-13C, rain, fog, cloudy, 0-13m/s ave 4m/s winds
coords_reykjavik = (22, 64.25)

df = read_parquet(DATA_DIR / f"s3_tmps_2020_1.pq")
df.loc[coords_paris]  # 3.7-8.5C
df.loc[coords_shanghai]  # 5.5-9.8C
df.loc[coords_mumbai]  # 22.4-25.1C
df.loc[coords_reykjavik]  # 0.2-2.4.1C

df = read_parquet(DATA_DIR / f"s3_tmps_2020_7.pq")
df.loc[coords_paris]  # 13.9-25.1C
df.loc[coords_shanghai]  # 24.8-29.0C
df.loc[coords_mumbai]  # 26.6-27.7C
df.loc[coords_reykjavik]  # 13.7-15.1C

df = read_parquet(DATA_DIR / f"s3_prec_2020_1.pq")
df.loc[coords_paris]  # 90% dry, 10% light rain
df.loc[coords_shanghai]  # 70% dry, 30% light rain
df.loc[coords_mumbai]  # 100% dry
df.loc[coords_reykjavik]  # 80% dry, 20% light rain

df = read_parquet(DATA_DIR / f"s3_prec_2020_7.pq")
df.loc[coords_paris]  # 90% dry, 10% light rain
df.loc[coords_shanghai]  # 60% dry, 35% light rain, 5% Moderate rain
df.loc[coords_mumbai]  # 12% dry, 80% light rain, 6% Moderate rain, 2% Heavy rain
df.loc[coords_reykjavik]  # 80% dry, 19% light rain, 1% Moderate rain


def wind_vels(arr: np.array) -> np.array:
    tmp = pd.DataFrame(
        {"count": arr, "bft": [WIND_VEL_I2B[d.split("|")[1]] for d in arr.index]}
    )
    return tmp.groupby("bft").sum()


df = read_parquet(DATA_DIR / f"s3_winds_2020_1.pq")
wind_vels(df.loc[coords_paris])  # 0-8m/s ave 3m/s
wind_vels(df.loc[coords_shanghai])  # 0-8m/s ave 4m/s
wind_vels(df.loc[coords_mumbai])  # 1-8m/s ave 4m/s
wind_vels(df.loc[coords_reykjavik])  # 1-14m/s ave 9m/s

df = read_parquet(DATA_DIR / f"s3_winds_2020_7.pq")
wind_vels(df.loc[coords_paris])  # 0-8m/s ave 4m/s
wind_vels(df.loc[coords_shanghai])  # 0-8m/s ave 3m/s
wind_vels(df.loc[coords_mumbai])  # 0-10m/s ave 5m/s
wind_vels(df.loc[coords_reykjavik])  # 0-10m/s ave 5m/s


def plot(data):
    cm = plt.get_cmap("YlGnBu")
    colors = [cm(1.0 * i / len(WIND_VEL_KS)) for i in range(len(WIND_VEL_KS))]
    theta = np.linspace(0.0, 2 * np.pi, len(WIND_DIR_I2K), endpoint=False)
    bottoms = np.array([0 for _ in WIND_DIR_KS])

    ax = plt.subplot(111, projection="polar")
    ax.set_theta_zero_location("N")

    grps = data.groupby(["vel", "dir"])["count"].apply(list).to_dict()
    geoms = []
    for i, vel_k in enumerate(WIND_VEL_KS):
        counts = []
        for dir_k in WIND_DIR_KS:
            key = (vel_k, dir_k)
            if key in grps:
                counts.append(sum(grps[key]))
            else:
                counts.append(0)
        counts = np.array(counts)
        geom = ax.bar(theta, counts, width=np.pi / 8, bottom=bottoms, color=colors[i])
        geoms.append(geom)
        bottoms = counts + bottoms
    plt.legend(geoms, WIND_VEL_KS, loc="upper left", bbox_to_anchor=(-0.4, 0.7))
    plt.show()


def get_records(arr: np.array) -> pd.DataFrame:
    tmp = pd.DataFrame.from_records(
        [
            {"dir_i": i.split("|")[0], "vel_i": i.split("|")[1], "count": d}
            for i, d in arr.items()
        ]
    )
    tmp["dir"] = [WIND_DIR_I2K[d] for d in tmp["dir_i"]]
    tmp["vel"] = [WIND_VEL_I2K[d] for d in tmp["vel_i"]]
    return tmp


# visual checks
df = read_parquet(DATA_DIR / f"s3_winds_2020_1.pq")
plot(get_records(df.loc[coords_paris]))
plot(get_records(df.loc[coords_shanghai]))
plot(get_records(df.loc[coords_mumbai]))
plot(get_records(df.loc[coords_reykjavik]))

df = read_parquet(DATA_DIR / f"s3_winds_2020_7.pq")
plot(get_records(df.loc[coords_paris]))
plot(get_records(df.loc[coords_shanghai]))
plot(get_records(df.loc[coords_mumbai]))
plot(get_records(df.loc[coords_reykjavik]))
