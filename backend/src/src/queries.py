"""GraphQL Query resolvers"""
from itertools import product
from ariadne import QueryType  # type: ignore
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE
from src.config import (
    TIME_RANGES,
    MONTHS,
    MONTH_NAMES,
    WIND_DIRS,
    WIND_DIR_IDXS,
    WIND_VELS,
    WIND_VEL_IDXS,
    EMERGENCY_BREAK,
    RAINS,
)
import src.s3 as s3
from src.utils import natural_series, fix_lng_degrees, get_lngs_map, get_lats_map


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
        "precIntensities": RAINS,
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
    if month not in MONTH_NAMES:
        raise ValueError(f"Month must be one of {MONTH_NAMES}")

    lats = natural_series(lat_range)
    lats = [d for d in lats if d <= 70 and d >= -70]

    lng_range = [fix_lng_degrees(d) for d in lng_range]
    if lng_range[0] <= lng_range[1]:
        lngs = natural_series(lng_range)
    else:
        lngs = natural_series([lng_range[0], 180]) + natural_series(
            [-180, lng_range[1]]
        )

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


@query.field("weather")
def resolve_weather(*_, **kwargs):
    inputs = kwargs["input"]
    time_range = inputs["timeRange"]
    month = inputs["month"]
    from_lat = inputs["fromLat"]
    to_lat = inputs["toLat"]
    from_lng = inputs["fromLng"]
    to_lng = inputs["toLng"]

    if time_range not in TIME_RANGES:
        raise ValueError(f"timeRange must be one of: {TIME_RANGES}")
    if month not in MONTH_NAMES:
        raise ValueError(f"Month must be one of {MONTH_NAMES}")

    lats_map = get_lats_map(floor=from_lat, ceil=to_lat)
    lngs_map = get_lngs_map(floor=from_lng, ceil=to_lng)
    if len(lats_map) * len(lngs_map) > EMERGENCY_BREAK:
        raise ValueError(
            f"Stop: tried to download {len(lats_map) * len(lngs_map):,} objs"
        )

    winds = {(d, v): 0 for d, v in product(WIND_DIR_IDXS, WIND_VEL_IDXS)}
    prec = {str(d["idx"]): 0 for d in RAINS}
    tmps = []
    for lat, lng in product(lats_map, lngs_map):
        obj = s3.get_obj_v2(years=time_range, month=MONTHS[month], lat=lat, lng=lng)
        for pos in product(lats_map[lat], lngs_map[lng]):
            data = obj[pos]
            tmps.append(data["tmps"])
            for key, count in data["winds"].items():
                winds[key] += count
            for key, count in data["prec"].items():
                prec[key] += count

    return {
        "windRecords": [
            {"dir": k[0], "vel": k[1], "count": d} for k, d in winds.items()
        ],
        "precRecords": [{"amt": k, "count": d} for k, d in prec.items()],
        "tmpRecords": tmps,
    }


queries = (query,)
