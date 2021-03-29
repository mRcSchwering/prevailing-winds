import React from "react";
import { Box, Heading, Paragraph, Anchor } from "grommet";
import AppBar from "./AppBar";

const windyLink = (
  <Anchor href="https://www.windy.com/" label="windy.com" target="_blank" />
);

const repoLink = (
  <Anchor
    href="https://github.com/mRcSchwering/prevailing-winds"
    label="github.com"
    target="_blank"
  />
);

const copernicusLink = (
  <Anchor
    href="https://cds.climate.copernicus.eu/"
    label="cds.climate.copernicus.eu"
    target="_blank"
  />
);

const gdprLink = (
  <Anchor href="https://gdpr.eu/cookies/" label="gdpr.eu" target="_blank" />
);

const era5Link = (
  <Anchor
    href="https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-single-levels?tab=overview"
    label="ERA5 hourly data on single levels from 1979 to present (cds.climate.copernicus.eu)"
    target="_blank"
  />
);

const dataprepLink = (
  <Anchor
    href="https://github.com/mRcSchwering/prevailing-winds/blob/main/prep/2_calc_avg_winds.py"
    label="prep/2_calc_avg_winds.py (github.com)"
    target="_blank"
  />
);

export default function AboutPage(): JSX.Element {
  return (
    <Box fill>
      <AppBar />
      <Box flex align="center" pad="medium" overflow={{ horizontal: "hidden" }}>
        <Heading level="3">About</Heading>
        <Paragraph>
          There are many great apps like {windyLink} that show you the current
          winds (and more) with short-term predictions. However, I didn't really
          find anything with historic wind data for long-term planning,
          <i> e.g.</i> when planning a Törn or passage. So I made this app. The
          code is all on {repoLink}. The data is derived from {copernicusLink}{" "}
          datasets.
        </Paragraph>
        <Paragraph>
          You might have noticed there was no <b>cookie banner</b> you had to
          click away ({gdprLink}). This is because I don't track any information
          about you and don't give anything to third-party vendors.
        </Paragraph>
        <Heading level="4">Data</Heading>
        <Paragraph>
          I used {era5Link} as a basis for calculating wind strengths and
          directions. This dataset is a ECMWF reanalysis which holds hourly data
          of a lot of variables like wind, pressure, temperature. Winds were
          regridded to a regular lat-lon grid of 0.25 degrees. To reduce the
          download sizes I only took every 3rd hour (00:00, 03:00, 06:00, ...)
          and exluded 20° from the poles (70°S to 70°N).
        </Paragraph>
        <Paragraph>
          The data is prepared by averaging the wind vectors over certain areas.
          I chose to average over the area of 1°N and 1°E at every full degree
          lat-lng. With the lat-lon regridded data points every 0.25 degree this
          is an average over 16 data points at each full degree lat-lng. At the
          equator this area spans 3,600M<sup>2</sup>. Going further to either
          pole this area gets smaller. Then, I used the Beaufort scale for
          binning wind velocities and the 16 traditional compass rose bearings
          (N, NNE, NE, ...) for binning wind directions. If you are interested
          in the details, this data preparation is done in {dataprepLink}.
        </Paragraph>
      </Box>
    </Box>
  );
}
