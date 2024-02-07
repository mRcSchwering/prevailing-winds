import React from "react";
import Plot from "react-plotly.js";
import { Box, ResponsiveContext } from "grommet";
import { fmtNumRange } from "./util";
import { COLORS, currentBins, dirBins, CurrentBinType } from "./constants";
import { TooltipIcon } from "./components";
import { WeatherResult, CurrentRecord } from "./types";

function getCurrentName(windBin: CurrentBinType): string {
  const kt = fmtNumRange(windBin.minKt, windBin.maxKt);
  const kmh = fmtNumRange(windBin.minKmh, windBin.maxKmh);
  return `${kt}kt or ${kmh}km/h`;
}

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

type CurrentRoseProps = {
  currents: CurrentRecord[];
  size: string;
};

function CurrentRose(props: CurrentRoseProps): JSX.Element {
  // create series
  const bins = [];
  for (const currentBin of currentBins) {
    const name = getCurrentName(currentBin);
    const bin = {
      marker: { color: currentBin.color },
      name: name,
      type: "barpolar",
      r: [] as number[],
      theta: [] as string[],
      hovertemplate: `%{r:.2f}% %{theta}-currents<br>${name}<extra></extra>`,
    };

    for (const dir of dirBins) {
      const fltrd = props.currents.filter(
        (d) => d.dir === dir.idx && d.vel === currentBin.idx
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

type CurrentChartProps = {
  weather: WeatherResult;
};

export default function CurrentsChart(props: CurrentChartProps): JSX.Element {
  const size = React.useContext(ResponsiveContext);
  return (
    <Box margin={{ vertical: "small" }}>
      <Box margin="small" align="end">
        <TooltipIcon
          text={
            "Average movement of water over 1 month. " +
            "Angle represents current direction (to which water is moving), colour reqpresents current velocity. " +
            "Radius represents the likelihood of experiencing this current in the given month."
          }
        />
      </Box>
      <CurrentRose currents={props.weather.currentRecords} size={size} />
    </Box>
  );
}
