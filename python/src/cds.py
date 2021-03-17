"""
Download historical data from cds.climate.copernicus.eu.

from: https://cds.climate.copernicus.eu/cdsapp#!/yourrequests?tab=form
doc: https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-land?tab=overview

"""
import cdsapi  # type: ignore

client = cdsapi.Client()

sparse_times = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
]

popular_variables = [
    "10m_u_component_of_wind",
    "10m_v_component_of_wind",
    "2m_dewpoint_temperature",
    "2m_temperature",
    "mean_sea_level_pressure",
    "mean_wave_direction",
    "mean_wave_period",
    "sea_surface_temperature",
    "significant_height_of_combined_wind_waves_and_swell",
    "surface_pressure",
    "total_precipitation",
]

all_months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
]

all_days = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
]

years = ["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]


def download_reanalysis(outfile: str, variable: str, year: str):
    """
    - using dataset: reanalysis-era5-single-levels (global hourly data back to 1981)
    - reduce file size by just taking every 3rd hour, -70 to 70 lat, and only 1 year and 1 variable
    """
    assert year in years
    assert variable in popular_variables
    client.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "variable": variable,
            "year": year,
            "month": all_months,
            "day": all_days,
            "time": sparse_times,
            "format": "grib",
            "area": [70, -180, -70, 180],
        },
        outfile,
    )
