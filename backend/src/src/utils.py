"""
functions that didnt find a better place yet
"""

# in s3 there is one obj for each full minutes lat-lng
# which has data for a quarter mile grid
OBJ_COORD_PARTS = [0.0, 0.25, 0.5, 0.75]


def natural_series(nums: list[float]) -> list[int]:
    """
    get natural numbers in half closed interval [n;m)
    where n and m is min and max of nums
    """
    n = min(nums)
    m = max(nums)
    floor = int(n) if n - int(n) < 0.0001 else int(n + 1)
    ceil = int(m) if m - int(m) < 0.0001 else int(m + 1)
    return list(range(floor, ceil))


def fix_lng_degrees(lng: float) -> float:
    """
    For a lng degree outside [-180;180] return the appropriate
    degree assuming -180 = 180°W and 180 = 180°E.
    """
    sign = 1 if lng > 0 else -1
    lng_adj = (abs(lng) % 360) * sign
    if lng_adj > 180:
        return (lng_adj % 180) - 180
    elif lng_adj < -180:
        return lng_adj % 180
    return lng_adj


def full_minutes(nums: list[float]) -> list[int]:
    """
    Get a series of natural numbers from the smallest to the highest
    supplied number for fetching weather data by coordinates.

    Weather data is saved in objects by full lat-lng coordinates.
    Each object contains again data for 16 positions by quarters of lat-lng
    coordinates. They were produced by looping through full minutes and
    adding 0.0, 0.25, 0.5, 0.75 respectively. For negative coordinates this
    can be a bit akward. _E.g._

    - object with lat 69 has lats: 69.0, 69.25, 69.5, 69.75
    - but object with lat -70 has lats: -70.0, -69.75, -69.5, -69.25

    So, here I would need to include lat -70 in order to get data for
    lats -69.75 to -69.25.
    """
    n = min(nums)
    m = max(nums)
    floor = int(n) if n > 0 or int(n) - n < 0.0001 else int(n) - 1
    ceil = int(m) + 1 if m > 0 or int(m) - m < 0.0001 else int(m)
    return list(range(floor, ceil))


def get_lngs_map(floor: float, ceil: float) -> dict[int, list[float]]:
    """
    Get map of lngs in full minutes with quarter minutes as keys.

    Series considers lng range is [-180;179] and how objects are stored in s3.
    """
    floor = fix_lng_degrees(floor)
    ceil = fix_lng_degrees(ceil)
    if floor <= ceil:
        full = full_minutes([floor, ceil])
    else:
        full = full_minutes([floor, 180]) + full_minutes([-180, ceil])
    out = {}
    out = {d: [d + dd for dd in OBJ_COORD_PARTS] for d in full[1:-1]}
    start = full[0]
    out[start] = [start + d for d in OBJ_COORD_PARTS if start + d >= floor]
    end = full[-1]
    out[end] = [end + d for d in OBJ_COORD_PARTS if end + d <= ceil]
    return {k: d for k, d in out.items() if -180 <= k < 180}


def get_lats_map(floor: float, ceil: float) -> dict[int, list[float]]:
    """
    Get map of lats in full minutes with quarter minutes as keys.

    Series considers lat range is [-70;69] and how objects are stored in s3.
    """
    full = full_minutes([floor, ceil])
    out = {d: [d + dd for dd in OBJ_COORD_PARTS] for d in full[1:-1]}
    start = full[0]
    out[start] = [start + d for d in OBJ_COORD_PARTS if start + d >= floor]
    end = full[-1]
    out[end] = [end + d for d in OBJ_COORD_PARTS if end + d <= ceil]
    return {k: d for k, d in out.items() if -70 <= k < 70}
