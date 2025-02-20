from pathlib import Path
import tarfile
import zipfile
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


def get_tar_members(archive: Path) -> list[str]:
    """Get names of files that are members of a tar archive"""
    try:
        with tarfile.open(archive, "r:gz") as fh:
            return fh.getnames()
    except tarfile.ReadError:
        with zipfile.ZipFile(archive, "r") as zfh:
            return zfh.namelist()


def extract_tar_member(archive: Path, name: str, outfile: Path):
    """
    Extract single file from archive and write to outfile.
    """
    try:
        with tarfile.open(archive, "r:gz") as inf:
            fo = inf.extractfile(member=name)
            if fo is None:
                return
            with open(outfile, "wb") as output:
                shutil.copyfileobj(fo, output)
    except tarfile.ReadError:
        with zipfile.ZipFile(archive, "r") as zfh:
            zfh.extract(name, outfile.parent)
        (outfile.parent / name).rename(outfile)
