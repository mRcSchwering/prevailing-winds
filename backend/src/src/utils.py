"""
functions that didnt find a better place yet
"""
from typing import List


def natural_series(nums: List[float]) -> List[int]:
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
