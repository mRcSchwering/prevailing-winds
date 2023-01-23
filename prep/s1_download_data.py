"""
Download hourly historic wind data from cds.climate.copernicus.eu

Need to have `.cdsapirc` configured with token.
Careful, this can be > 100GB.

    DATA_DIR=my/data/dir IS_TEST=1 python s1_download_data.py
    DATA_DIR=my/data/dir python s1_download_data.py
    DATA_DIR=my/data/dir python s1_download_data.py 2022 2021

"""
import src.cds as cds
from src.config import DATA_DIR, IS_TEST, ALL_YEARS, ARGS


if __name__ == "__main__":
    print(f"data dir: {DATA_DIR}")
    if IS_TEST:
        print("testrun")

    variables = [
        "10m_u_component_of_wind",
        "10m_v_component_of_wind",
        "2m_temperature",
        "sea_surface_temperature",
        "significant_height_of_combined_wind_waves_and_swell",
        "total_precipitation",
    ]

    years = ALL_YEARS
    if len(ARGS) > 0:
        years = [int(d) for d in ARGS]
    if IS_TEST:
        years = years[:1]

    for year in years:
        for var in variables:
            print(f"downloading {var} for {year}...")
            cds.download_reanalysis(
                outfile=DATA_DIR / f"{var}_{year}.grib",
                variable=var,
                year=str(year),
                test=IS_TEST,
            )

    print("done")
