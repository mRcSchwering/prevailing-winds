from pathlib import Path
import tarfile
import shutil
import numpy as np


def direction(u: np.ndarray, v: np.ndarray, is_wind=True) -> np.ndarray:
    """
    Get angle in degrees from u/v

    u: eastwards - horizontal speed moving towards east
    v: northward - horizontal speed moving towards north
    is_wind: turn direction by 180 degrees (where wind is comming from)
    """
    u_ = u.copy()
    u_[u_ == 0.0] = 1e-3
    flip = u_ > 0 if is_wind else u_ < 0
    return flip * 180 + 90 - np.degrees(np.arctan(v / u_))


def velocity(u: np.ndarray, v: np.ndarray) -> np.ndarray:
    """
    Get speed in kt from u/v in m/s

    u: eastwards - horizontal speed moving towards east
    v: northward - horizontal speed moving towards north
    """
    return np.sqrt(u**2 + v**2) * 1.94384


def chunk(l: list, n: int):
    """Split list into chunks of max-size n"""
    for i in range(0, len(l), n):
        yield l[i : i + n]


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


def get_tar_members(archive: Path, mode="r:gz") -> list[str]:
    """Get names of files that are members of a tar archive"""
    with tarfile.open(archive, mode) as fh:
        return fh.getnames()


def extract_tar_member(archive: Path, name: str, outfile: Path, mode="r:gz"):
    """
    Extract single file from archive and write to outfile.
    """
    with tarfile.open(archive, mode) as inf:
        fo = inf.extractfile(member=name)
        if fo is None:
            return
        with open(outfile, "wb") as output:
            shutil.copyfileobj(fo, output)
