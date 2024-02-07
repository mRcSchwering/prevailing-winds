import React from "react";
import { Box, Heading, Paragraph, Anchor, Image } from "grommet";
import AppBar from "./AppBar";
import { donateSrc } from "./constants";

const donateLink = (
  <Anchor href={donateSrc} label="bymeacoffee.com" target="_blank" />
);

const donateBtn = (
  <Anchor href={donateSrc} target="_blank">
    <Box width="small">
      <Image src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg" />
    </Box>
  </Anchor>
);

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

const oras5Link = (
  <Anchor
    href="https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-oras5?tab=overview"
    label="ORAS5 global ocean reanalysis monthly data from 1958 to present (cds.climate.copernicus.eu)"
    target="_blank"
  />
);

const dataprepLink = (
  <Anchor
    href="https://github.com/mRcSchwering/prevailing-winds/tree/main/prep"
    label="prep/ (github.com)"
    target="_blank"
  />
);

const cloudflareLink = (
  <Anchor
    href="https://www.cloudflare.com/"
    label="Cloudflare"
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
          <i> e.g.</i> when planning a holiday or a passage. So I made this app.
          The code is all on {repoLink}. The data is derived from{" "}
          {copernicusLink} datasets.
        </Paragraph>
        <Heading level="4">Data</Heading>
        <Paragraph>
          I used {era5Link} as a basis for calculating weather data. This
          dataset is a ECMWF reanalysis which holds hourly data of a lot of
          variables like wind, pressure, temperature. Winds were regridded to a
          regular lat-lon grid of 0.25 degrees. To reduce the download sizes I
          only took every 3rd hour (00:00, 03:00, 06:00, ...) of the previous 5
          years and exluded 20° from the poles (70°S to 70°N). Additionally,{" "}
          {oras5Link} is used to calculate ocean currents. This dataset is also
          a ECMWF reanalysis, but on a monthly basis. Among other variables it
          provides the average movement of water by month. It is a 3D model with
          a resolution of approximately 0.25 degrees. For details about data
          preparation see {dataprepLink}. When you select an area on the map you
          always see aggregated data for this particular area, month, over the
          selected years.
        </Paragraph>
        <Paragraph></Paragraph>
        <Heading level="3">Cookie Policy</Heading>
        <Paragraph>
          You might have noticed there was no <b>cookie banner</b> you had to
          click away ({gdprLink}). This is because I don't track any information
          about you and don't give anything to third-party vendors. There are
          some cookies from {cloudflareLink}. These are technically necessary
          for delivering this website though.
        </Paragraph>
        <Heading level="3">Donate</Heading>
        <Paragraph>
          All my apps are free, I never use ads, or sell data to third parties.
          If you want to support me somehow, you can donate with this on{" "}
          {donateLink}. Thanks in advance.
        </Paragraph>
        <Box pad="medium" style={{ minHeight: "100px" }}>
          {donateBtn}
        </Box>
      </Box>
    </Box>
  );
}
