"""
Download hourly historic wind data from cds.climate.copernicus.eu

Edit `DATA_DIR` and run directly.
Need to have `.cdsapirc` configured with token.
This can run for really long because each file needs to get approved first
(which can take several hours).
Add pos arg `test` for a test run.

    DATA_DIR=my/data/dir python s1_download_data.py test
    DATA_DIR=my/data/dir python s1_download_data.py

"""
import src.cds as cds
from src.config import DATA_DIR, IS_TEST, ALL_YEARS


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

    for year in ALL_YEARS[:1] if IS_TEST else ALL_YEARS:
        for var in variables:
            print(f"downloading {var} for {year}...")
            cds.download_reanalysis(
                outfile=DATA_DIR / f"{var}_{year}.grib",
                variable=var,
                year=str(year),
                test=IS_TEST,
            )

    print("done")
