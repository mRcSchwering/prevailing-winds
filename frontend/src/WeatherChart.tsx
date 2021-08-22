import Plot from "react-plotly.js";
import { Text, Box } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { WindRecord, Meta, PrecRecord } from "./types";
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
  { bfts: [12], minKt: 56, maxKt: null, color: "#ca0000" },
];

const rainBins = [
  { idx: 1, name: "Dry (< 0.1 mm)", color: "#ffffe0" },
  { idx: 2, name: "Light rain (0.1 to 2.5 mm)", color: "#80a1bf" },
  { idx: 3, name: "Moderate rain (2.5 to 7.6 mm)", color: "#00429d" },
  { idx: 4, name: "Heavy rain (7.6 to 50 mm)", color: "#b92650" },
  { idx: 5, name: "Violent rain (> 50 mm)", color: "#ca0000" },
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
  displayModeBar: false,
};

interface WindBarsProps {
  winds: WindRecord[];
  meta: Meta;
}

function WindBars(props: WindBarsProps): JSX.Element {
  const layout = {
    margin: { t: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { size: 16 },
    showlegend: false,
    barmode: "stack",
    bargap: 0,
    width: 200,
    height: 300,
    xaxis: { fixedrange: true },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      fixedrange: true,
      range: [0, 100],
    },
  };

  const traces = [];
  for (const bin of windBins) {
    const name = createName(bin);
    const trace = {
      marker: { color: bin.color },
      name: name,
      type: "bar",
      x: ["wind"],
      y: [0],
      hovertemplate: `%{y:.0f}% ${name}<extra></extra>`,
    };

    const velIdxs = props.meta.windVelocities
      .filter((d) => bin.bfts.includes(d.beaufortNumber))
      .map((d) => d.idx);
    const filtered = props.winds.filter((d) => velIdxs.includes(d.vel));
    if (filtered.length > 0) {
      trace.y[0] = filtered.map((d) => d.count).reduce((a, b) => a + b);
    }
    if (trace.y[0] > 0) traces.push(trace);
  }

  // convert frequencies to counts
  let total = traces.map((d) => d.y[0]).reduce((agg, d) => agg + d);
  if (total > 0) {
    for (const trace of traces) {
      trace.y = trace.y.map((d) => (d / total) * 100);
    }
  }

  return (
    <Plot
      data={traces.filter((d, i) => d.y[0] > 0.4 && i !== 0)}
      layout={layout}
      config={config}
    />
  );
}

interface RainBarsProps {
  rains: PrecRecord[];
  meta: Meta;
}

function RainBars(props: RainBarsProps): JSX.Element {
  const layout = {
    margin: { t: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { size: 16 },
    showlegend: false,
    barmode: "stack",
    bargap: 0,
    width: 200,
    height: 300,
    xaxis: { fixedrange: true },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      fixedrange: true,
      range: [0, 100],
    },
  };

  const traces = [];
  for (const bin of rainBins) {
    const trace = {
      marker: { color: bin.color },
      name: bin.name,
      type: "bar",
      x: ["rain"],
      y: [0],
      hovertemplate: `%{y:.0f}% ${bin.name}<extra></extra>`,
    };
    const cnts = props.rains
      .filter((d) => d.amt === bin.idx)
      .map((d) => d.count);
    if (cnts.length > 0) trace.y[0] = cnts.reduce((a, b) => a + b);
    traces.push(trace);
  }

  // convert frequencies to counts
  let total = traces.map((d) => d.y[0]).reduce((agg, d) => agg + d);
  if (total > 0) {
    for (const trace of traces) {
      trace.y = trace.y.map((d) => (d / total) * 100);
    }
  }

  return (
    <Plot
      data={traces.filter((d, i) => d.y[0] > 0.4 && i !== 0)}
      layout={layout}
      config={config}
    />
  );
}

type WeatherChartProps = {
  weather: WeatherRespType;
  meta: MetaRespType;
};

export default function WeatherChart(props: WeatherChartProps): JSX.Element {
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
  const prec = props.weather.data.precRecords;
  const tmps = props.weather.data.tmpRecords;

  return (
    <Box direction="row">
      <WindBars meta={props.meta.data} winds={props.weather.data.windRecords} />
      <RainBars meta={props.meta.data} rains={props.weather.data.precRecords} />
    </Box>
  );
}
