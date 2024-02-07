"""GraphQL Query resolvers"""

from itertools import product
from ariadne import QueryType
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE
from src.config import (
    TIME_RANGES,
    MONTHS,
    MONTH_NAMES,
    DIRECTIONS,
    DIR_IDXS,
    WINDS,
    WIND_IDXS,
    EMERGENCY_BREAK,
    WAVES,
    CURRENTS,
    CURRENT_IDXS,
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
        "directions": DIRECTIONS,
        "windVelocities": WINDS,
        "waveHeights": WAVES,
        "currentVelocities": CURRENTS,
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

    # TODO: new variables:
    # wind, rain, current, temp, seatemp, wave

    lats_map = get_lats_map(floor=from_lat, ceil=to_lat)
    lngs_map = get_lngs_map(floor=from_lng, ceil=to_lng)
    if len(lats_map) * len(lngs_map) > EMERGENCY_BREAK:
        raise ValueError(
            f"Stop: tried to download {len(lats_map) * len(lngs_map):,} objs"
        )

    winds = {(d, v): 0 for d, v in product(DIR_IDXS, WIND_IDXS)}
    currents = {(d, v): 0 for d, v in product(DIR_IDXS, CURRENT_IDXS)}
    waves = {str(d["idx"]): 0 for d in WAVES}
    rains = []
    temps = []
    seatemps = []
    for lat, lng in product(lats_map, lngs_map):
        obj = s3.get_obj(years=time_range, month=MONTHS[month], lat=lat, lng=lng)
        for pos in product(lngs_map[lng], lats_map[lat]):
            data = obj[pos]
            if "temps" in data:
                temps.append(data["temps"])
            if "rains" in data:
                rains.append(data["rains"])
            if "winds" in data:
                for key, count in data["winds"].items():
                    winds[key] += count
            if "currents" in data:
                for key, count in data["currents"].items():
                    currents[key] += count
            if "seatemps" in data:
                seatemps.append(data["seatemps"])
            if "waves" in data:
                for key, count in data["waves"].items():
                    waves[key] += count

    return {
        "windRecords": [
            {"dir": k[0], "vel": k[1], "count": d} for k, d in winds.items()
        ],
        "currentRecords": [
            {"dir": k[0], "vel": k[1], "count": d} for k, d in currents.items()
        ],
        "rainRecords": rains,
        "tempRecords": temps,
        "seatempRecords": seatemps,
        "waveRecords": [{"height": k, "count": d} for k, d in waves.items()],
    }


queries = (query,)
