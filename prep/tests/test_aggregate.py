import numpy as np
from src.aggregate import _bin
from src.config import WAVES, WIND_VELS, CURRENT_VELS, DIRECTIONS


def test_bin_dirs():
    l0 = [0, 45, 90, 135, 180, 225, 270, 315, 360]
    l1 = [20, 65, 110, 155, 200, 245, 290, 335, 380]
    res = _bin(np.array([l0, l1]), by=DIRECTIONS)
    assert res[0].tolist() == [1, 3, 5, 7, 9, 11, 13, 15, 17]
    assert res[1].tolist() == [2, 4, 6, 8, 10, 12, 14, 16, 17]


def test_bin_wind_vels():
    l0 = [0, 1, 4, 7, 11, 17, 22, 28, 34]
    l1 = [41, 48, 56, 64, 100, 0.5, 1.5, 4.5, 7.5]
    res = _bin(np.array([l0, l1]), by=WIND_VELS)
    assert res[0].tolist() == [1, 2, 3, 4, 5, 6, 7, 8, 9]
    assert res[1].tolist() == [10, 11, 12, 13, 13, 1, 2, 3, 4]


def test_bin_current_vels():
    l0 = [0, 0.4, 0.6, 1.0, 1.4, 1.6]
    l1 = [1.8, 2.0, 2.2, 2.6, 3.0, 3.5]
    res = _bin(np.array([l0, l1]), by=CURRENT_VELS)
    assert res[0].tolist() == [1, 1, 2, 3, 3, 4]
    assert res[1].tolist() == [4, 5, 5, 6, 7, 7]


def test_bin_waves():
    l0 = [0, 0.01, 0.1, 0.5, 1.25]
    l1 = [2.5, 4, 6, 9, 14]
    res = _bin(np.array([l0, l1]), by=WAVES)
    assert res[0].tolist() == [1, 2, 3, 4, 5]
    assert res[1].tolist() == [6, 7, 8, 9, 10]
