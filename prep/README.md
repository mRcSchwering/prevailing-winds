# Data Preparation

The data is from [cds.climate.copernicus.eu](https://cds.climate.copernicus.eu/).
I'm using a few years of the [ERA5 hourly data on single levels from 1979 to present (cds.climate.copernicus.eu)](https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-single-levels?tab=overview) dataset.
This dataset is a ECMWF reanalysis which holds hourly data of a lot of variables like wind, pressure, temperature.
Data points were regridded to a regular lat-lon grid of 0.25 degrees.
To reduce the download sizes I only took every 3rd hour (00:00, 03:00, 06:00, ...) and exluded 20° from the poles (70°S to 70°N).

> last download 02.08.2021

## Winds

The data is prepared by averaging the wind vectors over certain areas.
Winds are given in u- and v-vectors.
I chose to average over the area of 1°N and 1°E at every full degree lat-lng.
With the lat-lon regridded data points every 0.25 degree this is an average over 16 data points at each full degree lat-lng.
At the equator this area spans 3,600M2. Going further to either pole this area gets smaller.
The actual directions and velocities have to be calculated from the u- and v-vector averages.
(Note: 180° addition here because I want the direction the wind is comming from!)
Then, I used the Beaufort scale for binning wind velocities and the 16 traditional compass rose bearings (N, NNE, NE, ...) for binning wind directions per month.

- [1_download_data.py](./1_download_data.py) download everything
- [2_calc_avg_winds.py](./2_calc_avg_winds.py) calculate and bin directions and velocities from vector averages
- [3_upload_objs.py](./3_upload_objs.py) upload objects to S3
