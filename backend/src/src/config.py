"""
Global config env vars > defaults

Environment variables have to be defined in template.yaml
as environment variables for Lambda functions.
"""
import datetime as dt

UTC_NOW = dt.datetime.utcnow()
UTC_NOW_TS = UTC_NOW.timestamp()

# AWS
AWS_REGION = "eu-central-1"
CONTENT_BUCKET_NAME = "prevailing-winds-data"

# CORS
# Note: this sets the response headers while the CORS config
#       in template.yaml creates an OPTIONS endpoint
# TODO: set CORS to prevailing-winds only
CORS_ALLOW_ORIGIN = "*"


# wind directions (see schema documentation)
wind_dirs = [
    {"i": 1, "n": "N", "a": 0.0},
    {"i": 2, "n": "NNE", "a": 22.5},
    {"i": 3, "n": "NE", "a": 45.0},
    {"i": 4, "n": "ENE", "a": 67.5},
    {"i": 5, "n": "E", "a": 90.0},
    {"i": 6, "n": "ESE", "a": 112.5},
    {"i": 7, "n": "SE", "a": 135.0},
    {"i": 8, "n": "SSE", "a": 157.5},
    {"i": 9, "n": "S", "a": 180.0},
    {"i": 10, "n": "SSW", "a": 202.5},
    {"i": 11, "n": "SW", "a": 225.0},
    {"i": 12, "n": "WSW", "a": 247.5},
    {"i": 13, "n": "W", "a": 270.0},
    {"i": 14, "n": "WNW", "a": 292.5},
    {"i": 15, "n": "NW", "a": 315.0},
    {"i": 16, "n": "NNW", "a": 337.5},
]

wind_dir_i2k = {d["i"]: d["k"] for d in wind_dirs}


# wind velocities (see schema documentation)
wind_vels = [
    {"i": 1, "n": "Calm", "b": 0, "from": "0", "to": "1"},
    {"i": 2, "n": "Light air", "b": 1, "from": "1", "to": "4"},
    {"i": 3, "n": "Light breeze", "b": 2, "from": "4", "to": "7"},
    {"i": 4, "n": "Gentle breeze", "b": 3, "from": "7", "to": "11"},
    {"i": 5, "n": "Moderate breeze", "b": 4, "from": "11", "to": "17"},
    {"i": 6, "n": "Fresh breeze", "b": 5, "from": "17", "to": "22"},
    {"i": 7, "n": "Strong breeze", "b": 6, "from": "22", "to": "28"},
    {"i": 8, "n": "Near gale", "b": 7, "from": "28", "to": "34"},
    {"i": 9, "n": "Gale", "b": 8, "from": "34", "41"},
    {"i": 10, "n": "Strong gale", "b": 9, "from": "41", "to": "48"},
    {"i": 11, "n": "Storm", "b": 10, "from": "48", "to": "56"},
    {"i": 12, "n": "Violent storm", "b": 11, "from": "56", "to": "64"},
    {"i": 13, "n": "Hurricane force", "b": 12, "from": "64"},
]

wind_vel_i2k = {d["i"]: d["k"] for d in wind_vels}
wind_vel_i2b = {d["i"]: d["b"] for d in wind_vels}
