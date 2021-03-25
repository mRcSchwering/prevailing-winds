"""GraphQL Query resolvers"""
from itertools import product
from ariadne import QueryType  # type: ignore
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE
from src.config import (
    TIME_RANGES,
    MONTHS,
    MONTH_NAMES,
    WIND_DIRS,
    WIND_VELS,
    EMERGENCY_BREAK,
)
import src.s3 as s3
from src.utils import natural_series


query = QueryType()


@query.field("meta")
def resolve_meta(*_, **unused):
    del unused
    return {
        "ciPipelineId": CI_PIPELINE_ID,
        "buildDate": BUILD_DATE,
        "timeRanges": TIME_RANGES,
        "months": MONTH_NAMES,
        "windDirections": WIND_DIRS,
        "windVelocities": WIND_VELS,
    }


@query.field("winds")
def resolve_winds(*_, **kwargs):
    inputs = kwargs["input"]
    time_range = inputs["timeRange"]
    month = inputs["month"]
    lat_range = (inputs["fromLat"], inputs["toLat"])
    lng_range = (inputs["fromLng"], inputs["toLng"])

    if time_range not in TIME_RANGES:
        raise ValueError(f"timeRange must be one of: {TIME_RANGES}")
    if max(lat_range) < -70 or min(lat_range) > 70:
        raise ValueError("only latitutes -70 to 70 are covered")
    if max(lng_range) < -180 or min(lng_range) > 180:
        raise ValueError("only longitudes -180 to 180 are covered")
    if month not in MONTH_NAMES:
        raise ValueError(f"Month must be one of {MONTH_NAMES}")

    lats = natural_series(lat_range)
    lats = [d for d in lats if d <= 70 and d >= -70]
    lngs = natural_series(lng_range)
    lngs = [d for d in lngs if d <= 180 and d >= -180]

    if len(lats) * len(lngs) > EMERGENCY_BREAK:
        raise ValueError(f"Stop: tried to download {len(lats) * len(lngs):,} objs")

    total = {}
    for lat, lng in product(lats, lngs):
        obj = s3.get_obj(years=time_range, month=MONTHS[month], lat=lat, lng=lng)
        for key, count in obj.items():
            if key in total:
                total[key] += count
            else:
                total[key] = count

    records = [{"dir": k[0], "vel": k[1], "count": d} for k, d in total.items()]
    return {"records": records}


queries = (query,)

