import React from "react";
import Plot from "react-plotly.js";
import { Text } from "grommet";
import { sampleData } from "./sampleData";
import {
  useWindResp,
  useMetaResp,
  WindRecord,
  WindDirection,
  WindVelocity,
} from "./queries";
import Spinner from "./SpinnerBrand";

// TODO: backend regel 0-360 stimmt nicht
// TODO: wie will ich hier bins machen?
// TODO: vllt im backend schon frequencies berechnen?

const COLORS = [
  "#ffffe0",
  "#eeeedb",
  "#dedcd5",
  "#cfcbcf",
  "#c0bac7",
  "#b2aac0",
  "#a599b7",
  "#9988ad",
  "#8f77a2",
  "#876695",
  "#825485",
  "#813e70",
  "#94003a",
];

const layout = {
  title: "not yet in use",
  font: { size: 16 },
  showlegend: true,
  legend: {
    x: 0.7,
    y: -0.5,
  },
  polar: {
    barmode: "stack",
    bargap: 0,
    radialaxis: { visible: false },
    angularaxis: { direction: "clockwise" },
  },
  width: 400,
  height: 480,
};

const config = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: [
    "zoom2d",
    "lasso2d",
    "zoomIn2d",
    "zoomOut2d",
    "select2d",
  ],
};

type ChartProps = {
  winds: useWindResp;
  meta: useMetaResp;
};

export default function Chart(props: ChartProps): JSX.Element {
  if (props.winds.loading || props.meta.loading) return <Spinner />;

  if (props.winds.error) {
    return <Text color="status-critical">{props.winds.error.message}</Text>;
  }
  if (props.meta.error) {
    return <Text color="status-critical">{props.meta.error.message}</Text>;
  }

  if (!props.meta.data || !props.winds.data) {
    return <Text color="status-critical">something went wrong</Text>;
  }

  const allDirIdxs = props.meta.data.windDirections.map((d) => d.idx);
  const allVelIdxs = props.meta.data.windVelocities.map((d) => d.idx);
  const winds = props.winds.data.records;

  const series = [];
  for (const i in allVelIdxs) {
    const vel = props.meta.data.windVelocities[i];
    const ser = {
      marker: { color: COLORS[i] },
      name: `${vel.fromKt} - ${vel.toKt}`,
      type: "barpolar",
      r: [] as number[],
      theta: [] as string[],
    };
    for (const j in allDirIdxs) {
      const dir = props.meta.data.windDirections[j];
      const filtered = winds.filter(
        (d) => d.dir === dir.idx && d.vel === vel.idx
      );
      let count = 0;
      if (filtered.length > 0) {
        count = filtered.map((d) => d.count).reduce((a, b) => a + b);
      }
      ser.r.push(count);
      ser.theta.push(dir.name);
    }
    series.push(ser);
  }

  return <Plot data={series} layout={layout} config={config} />;
}
