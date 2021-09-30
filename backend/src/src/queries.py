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
    WAVES,
)
import src.s3 as s3
from src.utils import get_lngs_map, get_lats_map


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
        "waveHeights": WAVES,
    }


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
    seatmps = []
    for lat, lng in product(lats_map, lngs_map):
        obj = s3.get_obj_v2(years=time_range, month=MONTHS[month], lat=lat, lng=lng)
        for pos in product(lats_map[lat], lngs_map[lng]):
            data = obj[pos]
            tmps.append(data["tmps"])
            for key, count in data["winds"].items():
                winds[key] += count
            for key, count in data["prec"].items():
                prec[key] += count
            if "seatmps" in data:
                seatmps.append(data["seatmps"])

    return {
        "windRecords": [
            {"dir": k[0], "vel": k[1], "count": d} for k, d in winds.items()
        ],
        "precRecords": [{"amt": k, "count": d} for k, d in prec.items()],
        "tmpRecords": tmps,
        "seatmpRecords": seatmps,
    }


queries = (query,)
