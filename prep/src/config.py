from pathlib import Path

VERSION_PREFIX = "v5"

# compass directions
# binning with index "i", lower boundary "s"
# in azimut, key "k"
DIRECTIONS: list[dict] = [
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
WIND_VELS: list[dict] = [
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


# current velocities
# binning with index "i", lower boundary "s"
# in knots, key "k" (a label)
CURRENT_VELS: list[dict] = [
    {"i": 1, "k": "less than 0.5 kt", "s": 0},
    {"i": 2, "k": "0.5 to 1 kt", "s": 0.5},
    {"i": 3, "k": "1 to 1.5 kt", "s": 1.0},
    {"i": 4, "k": "1.5 to 2 kt", "s": 1.5},
    {"i": 5, "k": "2 to 2.5 kt", "s": 2.0},
    {"i": 6, "k": "2.5 to 3 kt", "s": 2.5},
    {"i": 7, "k": "greater than 3kt", "s": 3.0},
]


# Douglas scale of sea state
# binning with index "i", lower boundary "s"
# in m wave height, key "k", Douglas degree "d"
WAVES: list[dict] = [
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


# variables
# internal name -> dataset variable names
VARMAP = {
    "wind": [
        "10m_u_component_of_wind",
        "10m_v_component_of_wind",
    ],
    "current": [
        "rotated_zonal_velocity",
        "rotated_meridional_velocity",
    ],
    "temp": ["2m_temperature"],
    "seatemp": ["sea_surface_temperature"],
    "wave": ["significant_height_of_combined_wind_waves_and_swell"],
    "rain": ["total_precipitation"],
}


class Config:
    """Common config"""

    def __init__(
        self,
        variables: list[str],
        years: list[int],
        months: list[int],
        datadir: Path,
        nproc: int,
        is_test: bool,
        lat_range=(-70, 70),
        lon_range=(-180, 180),
        resolution=0.25,
    ):
        if is_test:
            years = years[:1]
            months = months[:1]
            lat_range = (-5, 5)
            lon_range = (-5, 5)

        self.variables = variables
        self.download_variables = [d for v in variables for d in VARMAP[v]]
        self.years = years
        self.months = months
        self.nproc = nproc
        self.datadir = datadir
        self.lat_range = lat_range
        self.lon_range = lon_range
        self.resolution = resolution

        self.time_ranges = {f"{max(years)}": [max(years)]}
        if len(years) > 1:
            self.time_ranges[f"{min(years)}-{max(years)}"] = years

        assert min(years) >= 2000
        assert min(lon_range) >= -180 and max(lon_range) <= 180
        assert min(lat_range) >= -70 and max(lat_range) <= 70
        assert resolution >= 0.25

    @classmethod
    def pop_from_kwargs(cls, kwargs: dict) -> "Config":
        return cls(
            variables=kwargs.pop("variables"),
            years=kwargs.pop("years"),
            months=kwargs.pop("months"),
            datadir=Path(kwargs.pop("datadir")),
            nproc=kwargs.pop("nproc"),
            is_test=kwargs.pop("test"),
        )
