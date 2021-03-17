import numpy as np  # type: ignore

# wind directions
# binning with index "i", lower boundary "s"
# key "k"
wind_dirs = [
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
wind_vels = [
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

