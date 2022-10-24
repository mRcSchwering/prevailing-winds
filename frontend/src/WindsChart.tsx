import React from "react";
import Plot from "react-plotly.js";
import { Box, ResponsiveContext } from "grommet";
import { getWindName } from "./util";
import { COLORS, windBins, dirBins } from "./constants";
import { TooltipIcon } from "./Tooltip";
import { WeatherResult, WindRecord } from "./types";

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

type WindRoseProps = {
  winds: WindRecord[];
  size: string;
  vel2bft: { [key: number]: number };
};

function WindRose(props: WindRoseProps): JSX.Element {
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

    for (const dir of dirBins) {
      const fltrd = props.winds.filter(
        (d) => d.dir === dir.idx && windBin.bfts.includes(props.vel2bft[d.vel])
      );
      bin.r.push(
        fltrd.length > 0 ? fltrd.map((d) => d.count).reduce((a, b) => a + b) : 0
      );
      bin.theta.push(dir.name);
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

  const L = props.size === "small" ? 35 : 50;
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

  return <Plot data={bins} layout={layout} config={config} />;
}

type WindChartProps = {
  weather: WeatherResult;
  vel2bft: { [key: number]: number };
};

export default function WindChart(props: WindChartProps): JSX.Element {
  const size = React.useContext(ResponsiveContext);
  return (
    <Box margin={{ vertical: "small" }} align="end">
      <Box margin="small" align="end">
        <TooltipIcon text="Hours of all winds during that month. Angle represents wind direction (from which the wind is blowing), colour reqpresents wind strength, radius represents frequency." />
      </Box>
      <Box>
        <WindRose
          winds={props.weather.windRecords}
          size={size}
          vel2bft={props.vel2bft}
        />
      </Box>
    </Box>
  );
}
