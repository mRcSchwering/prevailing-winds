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


# deny single request downloading more than n objs
EMERGENCY_BREAK = 100

# check which are already prepared
TIME_RANGES = ("2016-2020", "2020")

MONTHS = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "Apr": 4,
    "May": 5,
    "Jun": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12,
}
MONTH_NAMES = list(MONTHS)


# wind directions (see schema documentation)
WIND_DIRS = [
    {"idx": 1, "name": "N", "angle": 0.0},
    {"idx": 2, "name": "NNE", "angle": 22.5},
    {"idx": 3, "name": "NE", "angle": 45.0},
    {"idx": 4, "name": "ENE", "angle": 67.5},
    {"idx": 5, "name": "E", "angle": 90.0},
    {"idx": 6, "name": "ESE", "angle": 112.5},
    {"idx": 7, "name": "SE", "angle": 135.0},
    {"idx": 8, "name": "SSE", "angle": 157.5},
    {"idx": 9, "name": "S", "angle": 180.0},
    {"idx": 10, "name": "SSW", "angle": 202.5},
    {"idx": 11, "name": "SW", "angle": 225.0},
    {"idx": 12, "name": "WSW", "angle": 247.5},
    {"idx": 13, "name": "W", "angle": 270.0},
    {"idx": 14, "name": "WNW", "angle": 292.5},
    {"idx": 15, "name": "NW", "angle": 315.0},
    {"idx": 16, "name": "NNW", "angle": 337.5},
]
WIND_DIR_IDXS = [str(d["idx"]) for d in WIND_DIRS]


# wind velocities (see schema documentation)
WIND_VELS = [
    {"idx": 1, "beaufortName": "Calm", "beaufortNumber": 0, "fromKt": "0", "toKt": "1"},
    {
        "idx": 2,
        "beaufortName": "Light air",
        "beaufortNumber": 1,
        "fromKt": "1",
        "toKt": "4",
    },
    {
        "idx": 3,
        "beaufortName": "Light breeze",
        "beaufortNumber": 2,
        "fromKt": "4",
        "toKt": "7",
    },
    {
        "idx": 4,
        "beaufortName": "Gentle breeze",
        "beaufortNumber": 3,
        "fromKt": "7",
        "toKt": "11",
    },
    {
        "idx": 5,
        "beaufortName": "Moderate breeze",
        "beaufortNumber": 4,
        "fromKt": "11",
        "toKt": "17",
    },
    {
        "idx": 6,
        "beaufortName": "Fresh breeze",
        "beaufortNumber": 5,
        "fromKt": "17",
        "toKt": "22",
    },
    {
        "idx": 7,
        "beaufortName": "Strong breeze",
        "beaufortNumber": 6,
        "fromKt": "22",
        "toKt": "28",
    },
    {
        "idx": 8,
        "beaufortName": "Near gale",
        "beaufortNumber": 7,
        "fromKt": "28",
        "toKt": "34",
    },
    {
        "idx": 9,
        "beaufortName": "Gale",
        "beaufortNumber": 8,
        "fromKt": "34",
        "toKt": "41",
    },
    {
        "idx": 10,
        "beaufortName": "Strong gale",
        "beaufortNumber": 9,
        "fromKt": "41",
        "toKt": "48",
    },
    {
        "idx": 11,
        "beaufortName": "Storm",
        "beaufortNumber": 10,
        "fromKt": "48",
        "toKt": "56",
    },
    {
        "idx": 12,
        "beaufortName": "Violent storm",
        "beaufortNumber": 11,
        "fromKt": "56",
        "toKt": "64",
    },
    {
        "idx": 13,
        "beaufortName": "Hurricane force",
        "beaufortNumber": 12,
        "fromKt": "64",
    },
]
WIND_VEL_IDXS = [str(d["idx"]) for d in WIND_VELS]


# precipitation intensities
RAINS = [
    {"idx": 1, "name": "Dry", "fromMm": "0", "toMm": "0.1"},
    {"idx": 2, "name": "Light rain", "fromMm": "0.1", "toMm": "2.5"},
    {"idx": 3, "name": "Moderate rain", "fromMm": "2.5", "toMm": "7.6"},
    {"idx": 4, "name": "Heavy rain", "fromMm": "7.6", "toMm": "50.0"},
    {"idx": 5, "name": "Violent rain", "fromMm": "50.0"},
]


# Douglas scale of sea state
WAVES = [
    {
        "idx": 1,
        "douglasDegree": 0,
        "douglasName": "Calm (glassy)",
        "fromM": "0.0",
        "toM": "0.01",
    },
    {
        "idx": 2,
        "douglasDegree": 1,
        "douglasName": "Calm (rippled)",
        "fromM": "0.01",
        "toM": "0.1",
    },
    {
        "idx": 3,
        "douglasDegree": 2,
        "douglasName": "Smooth",
        "fromM": "0.1",
        "toM": "0.5",
    },
    {
        "idx": 4,
        "douglasDegree": 3,
        "douglasName": "Slight",
        "fromM": "0.5",
        "toM": "1.25",
    },
    {
        "idx": 5,
        "douglasDegree": 4,
        "douglasName": "Moderate",
        "fromM": "1.25",
        "toM": "2.5",
    },
    {"idx": 6, "douglasDegree": 5, "douglasName": "Rough", "fromM": "2.5", "toM": "4"},
    {
        "idx": 7,
        "douglasDegree": 6,
        "douglasName": "Very rough",
        "fromM": "4",
        "toM": "6",
    },
    {"idx": 8, "douglasDegree": 7, "douglasName": "High", "fromM": "6", "toM": "9"},
    {
        "idx": 9,
        "douglasDegree": 8,
        "douglasName": "Very high",
        "fromM": "9",
        "toM": "14",
    },
    {"idx": 10, "douglasDegree": 9, "douglasName": "Phenomenal", "fromM": "14"},
]
