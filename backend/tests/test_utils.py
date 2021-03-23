import pytest
from src.utils import natural_series  # type: ignore


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
