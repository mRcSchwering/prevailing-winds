import pytest
from src.utils import (
    natural_series,
    fix_lng_degrees,
    full_minutes,
    get_lngs_map,
    get_lats_map,
)


@pytest.mark.parametrize(
    "n, m, exp",
    [
        (11, 14, [11, 12, 13]),
        (11, 14.1, [11, 12, 13, 14]),
        (11.1, 14, [12, 13]),
        (11.1, 14.1, [12, 13, 14]),
        (-14, -11, [-14, -13, -12]),
        (-13.9, -11, [-13, -12]),
        (-14, -10.5, [-14, -13, -12, -11]),
        (-13.9, -10.5, [-13, -12, -11]),
    ],
)
def test_correct_natural_intervals(n, m, exp):
    res = natural_series([n, m])
    assert res == exp


@pytest.mark.parametrize(
    "n, m, exp",
    [
        (11, 14, [11, 12, 13, 14]),
        (11, 14.1, [11, 12, 13, 14]),
        (11.1, 14, [11, 12, 13, 14]),
        (11.1, 14.1, [11, 12, 13, 14]),
        (-14, -11, [-14, -13, -12, -11]),
        (-13.9, -11, [-14, -13, -12, -11]),
        (-14, -10.5, [-14, -13, -12, -11]),
        (-13.9, -10.5, [-14, -13, -12, -11]),
    ],
)
def test_correct_full_minutes(n, m, exp):
    res = full_minutes([n, m])
    assert res == exp


@pytest.mark.parametrize(
    "lng, exp",
    [
        (170, 170),
        (180, 180),
        (181, -179),
        (190, -170),
        (-170, -170),
        (-180, -180),
        (-181, 179),
        (-190, 170),
        (0, 0),
        (10, 10),
        (-10, -10),
    ],
)
def test_fixing_lng_coords(lng, exp):
    sign = 1 if lng >= 0 else -1
    res = fix_lng_degrees(lng)
    assert res == exp
    res = fix_lng_degrees(lng + 360 * sign)
    assert res == exp
    res = fix_lng_degrees(lng + 2 * 360 * sign)
    assert res == exp


@pytest.mark.parametrize(
    "n, m, exp",
    [
        (
            11.2,
            13.1,
            {11: [11.25, 11.5, 11.75], 12: [12.0, 12.25, 12.5, 12.75], 13: [13.0]},
        ),
        (
            179.9,
            181.9,
            {
                179: [],
                -180: [-180.0, -179.75, -179.5, -179.25],
                -179: [-179.0, -178.75, -178.5, -178.25],
            },
        ),
        (
            -182.1,
            -179.9,
            {
                177: [],
                178: [178.0, 178.25, 178.5, 178.75],
                179: [179.0, 179.25, 179.5, 179.75],
                -180: [-180.0],
            },
        ),
    ],
)
def test_correct_lngs_map(n, m, exp):
    res = get_lngs_map(floor=n, ceil=m)
    assert set(res.keys()) == set(exp.keys())
    for key in res:
        assert res[key] == exp[key]


@pytest.mark.parametrize(
    "n, m, exp",
    [
        (
            11.2,
            13.1,
            {11: [11.25, 11.5, 11.75], 12: [12.0, 12.25, 12.5, 12.75], 13: [13.0]},
        ),
        (69.9, 71.1, {69: []}),
        (69.6, 71.1, {69: [69.75]}),
        (-71.2, -69.1, {-70: [-70.0, -69.75, -69.5, -69.25]}),
    ],
)
def test_correct_lats_map(n, m, exp):
    res = get_lats_map(floor=n, ceil=m)
    assert set(res.keys()) == set(exp.keys())
    for key in res:
        assert res[key] == exp[key]
