from typing import Union, List
from pathlib import Path
import random
import string
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import pyarrow as pa  # type: ignore
import pyarrow.parquet as pq  # type: ignore


# wind directions
# binning with index "i", lower boundary "s"
# in azimut, key "k"
WIND_DIRS: List[dict] = [
    {"i": 1, "k": "N", "s": -11.25},
    {"i": 2, "k": "NNE", "s": 11.25},
    {"i": 3, "k": "NE", "s": 33.75},
    {"i": 4, "k": "ENE", "s": 56.25},
    {"i": 5, "k": "E", "s": 78.75},
    {"i": 6, "k": "ESE", "s": 101.25},
    {"i": 7, "k": "SE", "s": 123.75},
    {"i": 8, "k": "SSE", "s": 146.25},
    {"i": 9, "k": "S", "s": 168.75},
    {"i": 10, "k": "SSW", "s": 191.25},
    {"i": 11, "k": "SW", "s": 213.75},
    {"i": 12, "k": "WSW", "s": 236.25},
    {"i": 13, "k": "W", "s": 258.75},
    {"i": 14, "k": "WNW", "s": 281.25},
    {"i": 15, "k": "NW", "s": 303.75},
    {"i": 16, "k": "NNW", "s": 326.25},
    {"i": 17, "k": "N", "s": 348.75},
]

# wind velocities
# binning with index "i", lower boundary "s"
# in knots, key "k", beaufort scale "b"
WIND_VELS: List[dict] = [
    {"i": 1, "k": "Calm", "b": 0, "s": 0},
    {"i": 2, "k": "Light air", "b": 1, "s": 1},
    {"i": 3, "k": "Light breeze", "b": 2, "s": 4},
    {"i": 4, "k": "Gentle breeze", "b": 3, "s": 7},
    {"i": 5, "k": "Moderate breeze", "b": 4, "s": 11},
    {"i": 6, "k": "Fresh breeze", "b": 5, "s": 17},
    {"i": 7, "k": "Strong breeze", "b": 6, "s": 22},
    {"i": 8, "k": "Near gale", "b": 7, "s": 28},
    {"i": 9, "k": "Gale", "b": 8, "s": 34},
    {"i": 10, "k": "Strong gale", "b": 9, "s": 41},
    {"i": 11, "k": "Storm", "b": 10, "s": 48},
    {"i": 12, "k": "Violent storm", "b": 11, "s": 56},
    {"i": 13, "k": "Hurricane force", "b": 12, "s": 64},
]


# precipitation classes
# binning with index "i", lower boundary "s"
# in mm rain per hour, key "k"
RAINS: List[dict] = [
    {"i": 1, "k": "Dry", "s": 0.0},
    {"i": 2, "k": "Light rain", "s": 0.1},
    {"i": 3, "k": "Moderate rain", "s": 2.5},
    {"i": 4, "k": "Heavy rain", "s": 7.6},
    {"i": 5, "k": "Violent rain", "s": 50.0},
]

# Douglas scale of sea state
# binning with index "i", lower boundary "s"
# in m wave height, key "k", Douglas degree "d"
WAVES: List[dict] = [
    {"i": 1, "d": 0, "k": "Calm (glassy)", "s": 0.0},
    {"i": 2, "d": 1, "k": "Calm (rippled)", "s": 0.01},
    {"i": 3, "d": 2, "k": "Smooth", "s": 0.1},
    {"i": 4, "d": 3, "k": "Slight", "s": 0.5},
    {"i": 5, "d": 4, "k": "Moderate", "s": 1.25},
    {"i": 6, "d": 5, "k": "Rough", "s": 2.5},
    {"i": 7, "d": 6, "k": "Very rough", "s": 4},
    {"i": 8, "d": 7, "k": "High", "s": 6},
    {"i": 9, "d": 8, "k": "Very high", "s": 9},
    {"i": 10, "d": 9, "k": "Phenomenal", "s": 14},
]


def direction(u: np.array, v: np.array) -> np.array:
    """
    Get wind angle in degrees (direction where wind is comming from).
    
    u: eastwards - horizontal speed of air moving towards east
    v: northward - horizontal speed of air moving towards north
    """
    return (u > 0) * 180 + 90 - np.degrees(np.arctan(v / u))


def velocity(u: np.array, v: np.array) -> np.array:
    """
    Get wind speed in kt from u/v in m/s
    
    u: eastwards - horizontal speed of air moving towards east
    v: northward - horizontal speed of air moving towards north
    """
    return np.sqrt(u ** 2 + v ** 2) * 1.94384


def chunk(l: list, n: int):
    """Split list into chunks of max-size n"""
    for i in range(0, len(l), n):
        yield l[i : i + n]


def randstr(n: int = 6) -> str:
    chars = string.ascii_lowercase + string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=n))


def write_parquet(data: pd.DataFrame, file: Union[str, Path]):
    pq.write_table(pa.Table.from_pandas(data), file)


def read_parquet(file: Union[str, Path]) -> pd.DataFrame:
    return pq.read_table(file).to_pandas()
