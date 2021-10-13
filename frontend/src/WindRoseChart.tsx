import React from "react";
import Plot from "react-plotly.js";
import { Text, Box, ResponsiveContext } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { getWindName } from "./util";
import { COLORS, windBins } from "./constants";
import Spinner from "./SpinnerBrand";
import Tooltip from "./Tooltip";

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

type WindRoseChartProps = {
  weather: WeatherRespType;
  meta: MetaRespType;
};

export default function WindRoseChart(props: WindRoseChartProps): JSX.Element {
  const size = React.useContext(ResponsiveContext);

  if (props.weather.loading || props.meta.loading) return <Spinner />;

  if (props.weather.error) {
    return <Text color="status-critical">{props.weather.error.message}</Text>;
  }
  if (props.meta.error) {
    return <Text color="status-critical">{props.meta.error.message}</Text>;
  }

  if (!props.meta.data || !props.weather.data) {
    return <Text>click somewhere on the chart</Text>;
  }

  const meta = props.meta.data;
  const winds = props.weather.data.windRecords;

  // create series
  const bins = [];
  for (const windBin of windBins) {
    const name = getWindName(windBin);
    const bin = {
      marker: { color: windBin.color },
      name: name,
      type: "barpolar",
      r: [] as number[],
      theta: [] as string[],
      hovertemplate: `%{r:.2f}% %{theta}-winds<br>${name}<extra></extra>`,
    };

    const vels = meta.windVelocities.filter((d) =>
      windBin.bfts.includes(d.beaufortNumber)
    );
    for (const vel of vels) {
      for (const dir of meta.windDirections) {
        const filtered = winds.filter(
          (d) => d.dir === dir.idx && d.vel === vel.idx
        );
        let count = 0;
        if (filtered.length > 0) {
          count = filtered.map((d) => d.count).reduce((a, b) => a + b);
        }
        const thetaIdx = bin.theta.indexOf(dir.name);
        if (bin.theta.indexOf(dir.name) === -1) {
          bin.r.push(count);
          bin.theta.push(dir.name);
        } else {
          bin.r[thetaIdx] = bin.r[thetaIdx] + count;
        }
      }
    }
    bins.push(bin);
  }

  // convert frequencies to counts
  let total = 0;
  for (const bin of bins) {
    total = total + bin.r.reduce((agg, d) => agg + d);
  }
  if (total > 0) {
    for (const bin of bins) {
      bin.r = bin.r.map((d) => (d / total) * 100);
    }
  }

  const L = size === "small" ? 35 : 50;
  const layout = {
    margin: { t: L, l: L, r: L, b: L },
    paper_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    polar: {
      barmode: "stack",
      bargap: 0,
      radialaxis: { visible: false, hovertemplate: "aaaaaaaaaaaa" },
      angularaxis: { direction: "clockwise" },
    },
    width: L * 8,
    height: L * 8,
    dragmode: false,
  };

  return (
    <Box margin={{ vertical: "small" }} align="end">
      <Box margin="small">
        <Tooltip text="Hours of all winds during that month. Angle represents wind direction (from which the wind is blowing), colour reqpresents wind strength, radius represents frequency." />
      </Box>
      <Box>
        <Plot data={bins} layout={layout} config={config} />
      </Box>
    </Box>
  );
}
