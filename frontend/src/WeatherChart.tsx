import Plot from "react-plotly.js";
import { Text, Box } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { WindRecord, Meta, PrecRecord, TmpRecord } from "./types";
import Spinner from "./SpinnerBrand";

type WindBinType = {
  bfts: number[];
  minKt: null | number;
  maxKt: null | number;
  color: string;
};

// TODO: define these in central place
// pos 0 will be left out in summary (should be "no wind")
const windBins: WindBinType[] = [
  { bfts: [0, 1], minKt: null, maxKt: 3, color: "rgba(0,0,0,0)" },
  { bfts: [2, 3], minKt: 4, maxKt: 10, color: "#80a1bf" },
  { bfts: [4, 5], minKt: 11, maxKt: 21, color: "#00429d" },
  { bfts: [6, 7], minKt: 22, maxKt: 33, color: "#54479f" },
  { bfts: [8, 9], minKt: 34, maxKt: 47, color: "#a84da0" },
  { bfts: [10, 11], minKt: 48, maxKt: 55, color: "#b92650" },
  { bfts: [12], minKt: 56, maxKt: null, color: "#ca0000" },
];

// TODO: derive from meta?
// pos 0 will be left out in summary (should be "no rain")
const rainBins = [
  { idx: 1, name: "Dry<br>< 0.1 mm", color: "rgba(0,0,0,0)" },
  { idx: 2, name: "Light rain<br>0.1 to 2.5 mm", color: "#80a1bf" },
  { idx: 3, name: "Moderate rain<br>2.5 to 7.6 mm", color: "#00429d" },
  { idx: 4, name: "Heavy rain<br>7.6 to 50 mm", color: "#b92650" },
  { idx: 5, name: "Violent rain<br>> 50 mm", color: "#ca0000" },
];

function createWindName(windBin: WindBinType): string {
  let kts = "";
  if (windBin.minKt && windBin.maxKt)
    kts = `${windBin.minKt} to ${windBin.maxKt} kt`;
  else if (windBin.minKt) kts = `>= ${windBin.minKt} kt`;
  else if (windBin.maxKt) kts = `<= ${windBin.maxKt} kt`;
  return `BFT ${windBin.bfts.join(" to ")}<br>${kts}`;
}

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

interface WindRainBarsProps {
  rains: PrecRecord[];
  winds: WindRecord[];
  meta: Meta;
}

function WindRainBars(props: WindRainBarsProps): JSX.Element {
  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 40, l: 50, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { size: 16 },
    showlegend: false,
    barmode: "stack",
    bargap: 5,
    width: 200,
    height: 300,
    xaxis: { fixedrange: true },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
      tickvals: [0, 50, 100],
      ticktext: ["0%", "50%", "100%"],
      range: [0, 100],
    },
  };

  const windSums = windBins.map((bin) => {
    const velIdxs = props.meta.windVelocities
      .filter((d) => bin.bfts.includes(d.beaufortNumber))
      .map((d) => d.idx);
    const cnts = props.winds
      .filter((d) => velIdxs.includes(d.vel))
      .map((d) => d.count);
    return cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
  });

  const windTotal = windSums.reduce((a, b) => a + b);
  const windFreqs =
    windTotal > 0
      ? windSums.map((d) => d / windTotal)
      : new Array(windSums.length).fill(0);

  const rainSums = rainBins.map((bin) => {
    const cnts = props.rains
      .filter((d) => d.amt === bin.idx)
      .map((d) => d.count);
    return cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
  });

  const rainTotal = rainSums.reduce((a, b) => a + b);
  const rainFreqs =
    rainTotal > 0
      ? rainSums.map((d) => d / rainTotal)
      : new Array(rainSums.length).fill(0);

  const windTraces = windBins
    .map((bin, i) => {
      const name = createWindName(bin);
      const pct = Math.round(windFreqs[i] * 100);
      return {
        marker: { color: bin.color },
        name: name,
        type: "bar",
        x: ["wind"],
        y: [pct],
        hovertemplate: `${pct}% ${name}<extra></extra>`,
      };
    })
    .filter((d) => d.y[0] > 0);

  const rainTraces = rainBins
    .map((bin, i) => {
      const pct = Math.round(rainFreqs[i] * 100);
      return {
        marker: { color: bin.color },
        name: bin.name,
        type: "bar",
        x: ["rain"],
        y: [pct],
        hovertemplate: `${pct}% ${bin.name}<extra></extra>`,
      };
    })
    .filter((d) => d.y[0] > 0);

  return (
    <Plot
      data={[...windTraces.reverse(), ...rainTraces.reverse()]}
      layout={layout}
      config={config}
    />
  );
}

interface TmpRangesProps {
  tmps: TmpRecord[];
  meta: Meta;
}

function TmpRanges(props: TmpRangesProps): JSX.Element {
  // average means
  const aveHiM =
    props.tmps.map((d) => d.highMean).reduce((a, b) => a + b) /
    props.tmps.length;
  const aveLoM =
    props.tmps.map((d) => d.lowMean).reduce((a, b) => a + b) /
    props.tmps.length;

  // average vars of stds
  const aveHiS = Math.pow(
    props.tmps.map((d) => Math.pow(d.highStd, 2)).reduce((a, b) => a + b) /
      props.tmps.length,
    0.5
  );
  const aveLoS = Math.pow(
    props.tmps.map((d) => Math.pow(d.lowStd, 2)).reduce((a, b) => a + b) /
      props.tmps.length,
    0.5
  );

  const lo = aveLoM - 1.2 * aveLoS;
  const hi = aveHiM + 1.2 * aveHiS;
  const tickVals = [lo, (lo + hi) / 2, hi].map(Math.round);

  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 30, l: 30, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { size: 16 },
    showlegend: false,
    width: 100,
    height: 300,
    xaxis: { fixedrange: true, showgrid: false, showline: false },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
      tickvals: tickVals,
      ticktext: tickVals.map((d) => `${d}°C`),
      range: [lo, hi],
    },
  };

  const traces = [
    {
      x: ["high"],
      y: [aveHiM],
      marker: { color: "#85144B" },
      hovertemplate: `${Math.round(aveHiM)}°C<extra></extra>`,
      error_y: {
        type: "constant",
        color: "#85144B",
        value: aveHiS,
        thickness: 1.5,
        width: 3,
        opacity: 1,
      },
      type: "scatter",
    },
    {
      x: ["low"],
      y: [aveLoM],
      marker: { color: "#85144B" },
      hovertemplate: `${Math.round(aveLoM)}°C<extra></extra>`,
      error_y: {
        type: "constant",
        color: "#85144B",
        value: aveLoS,
        thickness: 1.5,
        width: 3,
        opacity: 1,
      },
      type: "scatter",
    },
  ];

  return <Plot data={traces} layout={layout} config={config} />;
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

  return (
    <Box direction="row">
      <TmpRanges meta={props.meta.data} tmps={props.weather.data.tmpRecords} />
      <WindRainBars
        meta={props.meta.data}
        winds={props.weather.data.windRecords}
        rains={props.weather.data.precRecords}
      />
    </Box>
  );
}
