"""Functions for ORAS5 reanalysis"""

from pathlib import Path
import multiprocessing as mp
from functools import partial
import numpy as np
import pandas as pd
import cdsapi
from netCDF4 import Dataset  # pylint: disable=no-name-in-module
from . import pq
from .util import get_tar_members, extract_tar_member
from .config import Config

# available in ORAS5
VARS = ["rotated_zonal_velocity", "rotated_meridional_velocity"]


def _digitize(df: pd.DataFrame, var: str, interval: tuple[float, float], res: float):
    for target in np.arange(interval[0], interval[1] + res, res):
        mask = (df[var] >= target - res / 2) & (df[var] < target + res / 2)
        df.loc[mask, var] = target


def _download_dataset(datadir: Path, variable: str, year: int, months: list[int]):
    outfile = datadir / f"raw_{variable}_{year}.tar.gz"
    client = cdsapi.Client()
    client.retrieve(
        "reanalysis-oras5",
        {
            "product_type": "operational",
            "format": "tgz",
            "vertical_resolution": "all_levels",
            "variable": variable,
            "year": str(year),
            "month": [f"{d:02d}" for d in months],
        },
        str(outfile),
    )


def _get_members_by_month(
    datadir: Path, variable: str, year: int, req_months: list[int]
) -> dict[int, str]:
    archive = datadir / f"raw_{variable}_{year}.tar.gz"
    out = {}
    extng_months = set()
    for member in get_tar_members(archive):
        if member.endswith(".nc"):
            timestr = member.split("control_monthly_highres_3D_")[1].split("_")[0]
            assert year == int(timestr[:4]), member
            month = int(timestr[4:])
            if month in req_months:
                extng_months.add(month)
                out[month] = member
    assert extng_months == set(req_months), extng_months
    return out


def _rm_mask(masked: np.ma.MaskedArray, fill=np.nan) -> np.ndarray:
    return np.where(masked.mask, fill, masked.data).astype(masked.dtype)


def _extract_and_write_values(
    month: int,
    member: str,
    variable: str,
    year: int,
    datadir: Path,
    resolution: float,
    lon_range: tuple[int, int],
    lat_range: tuple[int, int],
    max_depth=5,
    lat_name="nav_lat",
    lon_name="nav_lon",
    depth_name="deptht",
    velo_names=("vozocrte", "vomecrtn"),
):
    print(f"Processing {variable} {year}-{month}...")
    infile = datadir / f"raw_{variable}_{year}.tar.gz"
    outfile = datadir / f"extracted_{variable}_{year}-{month}.pq"
    tmpfile = datadir / f"{variable}_{year}_{month}.nc"
    extract_tar_member(archive=infile, name=member, outfile=tmpfile)

    ds = Dataset(tmpfile, "r", format="NETCDF4")
    varnames = set(ds.variables.keys())
    assert {lat_name, lon_name, depth_name} <= varnames, varnames
    intersect = list(set(velo_names) & varnames)
    assert len(intersect) == 1, varnames
    velo_name = intersect[0]

    depths = _rm_mask(ds.variables[depth_name][:])  # (75,) depth in m
    lats = _rm_mask(ds.variables[lat_name][:])  # (1021, 1442) lat in degrees
    lons = _rm_mask(ds.variables[lon_name][:])  # (1021, 1442) lon in degrees
    vals = _rm_mask(ds.variables[velo_name][:])  # (1, 74, 1021, 1442) in m/s
    vals = vals[0, depths < max_depth]

    dfdict = {
        "lat": lats.flatten().tolist(),
        "lon": lons.flatten().tolist(),
    }
    for layer_i in range(vals.shape[0]):
        dfdict[f"l{layer_i}"] = vals[layer_i].flatten().tolist()

    # resolution is undefined, can have duplicated lon-lat rows
    # after normalizing grid to 0.25° resolution
    df = pd.DataFrame(dfdict)
    lat_mask = (df["lat"] >= min(lat_range)) & (df["lat"] <= max(lat_range))
    lon_mask = (df["lon"] >= min(lon_range)) & (df["lon"] <= max(lon_range))
    df = df.loc[lat_mask & lon_mask]
    _digitize(df=df, var="lon", interval=lon_range, res=resolution)
    _digitize(df=df, var="lat", interval=lat_range, res=resolution)
    df = df.groupby(["lon", "lat"]).mean()
    df.sort_index(inplace=True)
    pq.write_table(df=df, file=outfile)
    tmpfile.unlink(missing_ok=True)


def download(cnfg: Config):
    variables = [d for d in cnfg.download_variables if d in VARS]
    for year in cnfg.years:
        for variable in variables:
            print(f"Downloading {variable} {year}...")
            _download_dataset(
                datadir=cnfg.datadir,
                variable=variable,
                year=year,
                months=cnfg.months,
            )


def extract(cnfg: Config):
    variables = [d for d in cnfg.download_variables if d in VARS]
    for year in cnfg.years:
        for variable in variables:
            print(f"Extracting {variable} {year}...")
            member_map = _get_members_by_month(
                datadir=cnfg.datadir,
                variable=variable,
                year=year,
                req_months=cnfg.months,
            )
            _extract = partial(
                _extract_and_write_values,
                datadir=cnfg.datadir,
                year=year,
                variable=variable,
                resolution=cnfg.resolution,
                lat_range=cnfg.lat_range,
                lon_range=cnfg.lon_range,
            )
            args = [(k, d) for k, d in member_map.items()]
            with mp.Pool(cnfg.nproc) as pool:
                pool.starmap(_extract, args)
