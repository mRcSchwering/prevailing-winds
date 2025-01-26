"""Functions for ERA5 reanalysis"""

from pathlib import Path
import pandas as pd
import cdsapi
import pupygrib
from . import pq
from .config import Config

VARS = [
    "10m_u_component_of_wind",
    "10m_v_component_of_wind",
    "2m_temperature",
    "sea_surface_temperature",
    "significant_height_of_combined_wind_waves_and_swell",
    "total_precipitation",
]


def _download_dataset(
    outputdir: Path,
    variable: str,
    year: int,
    months: list[int],
    lat_range: tuple[int, int],
    lon_range: tuple[int, int],
):
    outfile = outputdir / f"raw_{variable}_{year}.grib"
    sparse_times = [0, 3, 6, 9, 12, 15, 18, 21]
    days = list(range(1, 32))
    client = cdsapi.Client()
    client.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": ["reanalysis"],
            "variable": [variable],
            "year": [str(year)],
            "month": [f"{d:02d}" for d in months],
            "day": [f"{d:02d}" for d in days],
            "time": [f"{d:02d}:00" for d in sparse_times],
            "data_format": "grib",
            "area": [max(lat_range), min(lon_range), min(lat_range), max(lon_range)],
        },
        str(outfile),
    )


def _extract_and_write_values(
    month: int, variable: str, inputdir: Path, outputdir: Path, year: int
):
    print(f"Processing {variable} {year}-{month}...")
    infile = inputdir / f"raw_{variable}_{year}.grib"
    outfile = outputdir / f"extracted_{variable}_{year}-{month}.pq"
    dfs = []
    with open(infile, "rb") as fh:
        for mi, msg in enumerate(pupygrib.read(fh)):
            time = msg.get_time()
            if time.year != year or time.month != month:
                continue

            lons, lats = msg.get_coordinates()
            values = msg.get_values()
            assert lats.shape == values.shape == lons.shape

            df = pd.DataFrame(
                {
                    "lat": lats.flatten(),
                    "lon": lons.flatten(),
                    f"{time.day}-{mi}": values.flatten(),
                }
            )
            # dataset already has fixed 0.25° resolution
            # each combination should only contain one row
            dfs.append(df.groupby(["lon", "lat"]).mean())

    df = pd.concat(dfs, axis=1)  # wide with NaNs
    pq.write_table(df=df, file=outfile)


def download(cnfg: Config):
    variables = [d for d in cnfg.download_variables if d in VARS]
    for year in cnfg.years:
        for variable in variables:
            print(f"Downloading {variable} {year}...")
            _download_dataset(
                outputdir=cnfg.outputdir,
                variable=variable,
                year=year,
                months=cnfg.months,
                lat_range=cnfg.lat_range,
                lon_range=cnfg.lon_range,
            )


def extract(cnfg: Config):
    variables = [d for d in cnfg.download_variables if d in VARS]
    for year in cnfg.years:
        for variable in variables:
            print(f"Extracting {variable} {year}...")
            for month in cnfg.months:
                _extract_and_write_values(
                    month=month,
                    inputdir=cnfg.inputdir,
                    outputdir=cnfg.outputdir,
                    year=year,
                    variable=variable,
                )
