"""
- download hourly historic wind data from cds.climate.copernicus.eu
- average winds to full minutes of lat and lon
"""
from src.cds import download_reanalysis

years = [2020, 2019, 2018, 2017, 2016]


if __name__ == "__main__":
    for year in years:
        print(f"downloading files for {year}")
        u_file = f"data/wind_u_{year}.grib"
        v_file = f"data/wind_v_{year}.grib"

        download_reanalysis(u_file, "10m_u_component_of_wind", str(year))
        download_reanalysis(v_file, "10m_v_component_of_wind", str(year))

    print("done")
