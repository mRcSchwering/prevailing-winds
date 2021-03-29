import React from "react";
import Plot from "react-plotly.js";
import { Text } from "grommet";
import { WindsRespType, MetaRespType } from "./queries";
import Spinner from "./SpinnerBrand";

type WindBinType = {
  bfts: number[];
  minKt: null | number;
  maxKt: null | number;
  color: string;
};

const windBins: WindBinType[] = [
  { bfts: [0, 1], minKt: null, maxKt: 3, color: "#ffffe0" },
  { bfts: [2, 3], minKt: 4, maxKt: 10, color: "#80a1bf" },
  { bfts: [4, 5], minKt: 11, maxKt: 21, color: "#00429d" },
  { bfts: [6, 7], minKt: 22, maxKt: 33, color: "#54479f" },
  { bfts: [8, 9], minKt: 34, maxKt: 47, color: "#a84da0" },
  { bfts: [10, 11], minKt: 48, maxKt: 55, color: "#b92650" },
  { bfts: [12, 13], minKt: 56, maxKt: null, color: "#ca0000" },
];

function createName(windBin: WindBinType): string {
  let kts = "";
  if (windBin.minKt && windBin.maxKt)
    kts = `${windBin.minKt} to ${windBin.maxKt} kt`;
  else if (windBin.minKt) kts = `>= ${windBin.minKt} kt`;
  else if (windBin.maxKt) kts = `<= ${windBin.maxKt} kt`;
  return `BFT ${windBin.bfts.join(" to ")} (${kts})`;
}

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

const layout = {
  margin: { t: 25 },
  paper_bgcolor: "rgba(0,0,0,0)",
  font: { size: 16 },
  showlegend: true,
  legend: {
    x: -0.2,
    y: -1,
  },
  polar: {
    barmode: "stack",
    bargap: 0,
    radialaxis: { visible: false, hovertemplate: "aaaaaaaaaaaa" },
    angularaxis: { direction: "clockwise" },
  },
  width: 400,
  height: 500,
};

type ChartProps = {
  winds: WindsRespType;
  meta: MetaRespType;
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
    return <Text>click somewhere on the chart</Text>;
  }

  // create series
  const bins = [];
  for (const windBin of windBins) {
    const name = createName(windBin);
    const bin = {
      marker: { color: windBin.color },
      name: name,
      type: "barpolar",
      r: [] as number[],
      theta: [] as string[],
      hovertemplate: `%{r:.2f}% %{theta}-winds<br>${name}<extra></extra>`,
    };

    const vels = props.meta.data.windVelocities.filter((d) =>
      windBin.bfts.includes(d.beaufortNumber)
    );
    for (const vel of vels) {
      for (const dir of props.meta.data.windDirections) {
        const filtered = props.winds.data.records.filter(
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

  return <Plot data={bins} layout={layout} config={config} />;
}
