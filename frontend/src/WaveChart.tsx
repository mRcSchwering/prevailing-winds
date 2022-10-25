import Plot from "react-plotly.js";
import { Box } from "grommet";
import { waveBins, COLORS } from "./constants";
import { getWaveName, fmtFreq } from "./util";
import { WeatherResult } from "./types";

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

interface WaveChartProps {
  weather: WeatherResult;
  height2dgs: { [key: number]: number };
}

export default function WaveChart(props: WaveChartProps): JSX.Element {
  if (props.weather.waveRecords.length < 1) return <Box></Box>;

  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 70, l: 70, b: 50 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    orientation: "h",
    bargap: 5,
    width: 400,
    height: 300,
    yaxis: { fixedrange: true, type: "category" },
    xaxis: {
      title: "frequency",
      range: [0, 100],
    },
  };

  const total = props.weather.waveRecords
    .map((d) => d.count)
    .reduce((a, b) => a + b);

  const traces = waveBins
    .map((bin) => {
      const cnts = props.weather.waveRecords
        .filter((d) => bin.dgs.includes(props.height2dgs[d.height]))
        .map((d) => d.count);
      const freq = cnts.length > 0 ? cnts.reduce((a, b) => a + b) / total : 0;
      const pct = Math.round(freq * 100);
      const name = getWaveName(bin);
      return {
        marker: { color: bin.color },
        name: name,
        type: "bar",
        y: [""],
        x: [pct],
        hovertemplate: `${pct}% ${name}<extra></extra>`,
      };
    })
    .filter((d) => d.x[0] > 0);

  return (
    <Box margin={{ vertical: "medium" }}>
      <Plot data={[...traces.reverse()]} layout={layout} config={config} />
    </Box>
  );
}

export function WaveChart2(): JSX.Element {
  const waveRecords = [
    { count: 13, height: 1 },
    { count: 2, height: 3 },
    { count: 10, height: 5 },
    { count: 7, height: 0 },
    { count: 9, height: 1 },
    { count: 1, height: 6 },
    { count: 0, height: 7 },
    { count: 11, height: 0 },
    { count: 3, height: 7 },
    { count: 1, height: 8 },
  ];

  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 70, l: 70, b: 50 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
    font: { size: 12 },
    showlegend: false,
    bargap: 0.2,
    width: 400,
    height: 400,
    yaxis: {
      fixedrange: true,
      showgrid: false,
      zeroline: false,
      visible: false,
    },
    xaxis: {
      range: [0, 100],
      showgrid: false,
      zeroline: false,
      visible: false,
    },
  };

  const total = waveRecords.map((d) => d.count).reduce((a, b) => a + b);

  const traces = waveBins.map((bin) => {
    const cnts = waveRecords
      .filter((d) => bin.dgs.includes(d.height))
      .map((d) => d.count);
    const freq = cnts.length > 0 ? cnts.reduce((a, b) => a + b) / total : 0;
    const pct = Math.round(freq * 100);
    const name = getWaveName(bin);
    return {
      orientation: "h",
      name: name,
      type: "bar",
      y: [bin.label],
      x: [pct],
      text: [bin.label],
      textposition: "outside",
      insidetextanchor: "start",
      marker: {
        color: bin.color,
      },
      hovertemplate: `${pct}% ${name}<extra></extra>`,
    };
  });

  return (
    <Box margin={{ vertical: "medium" }}>
      <Plot
        data={[...traces.slice(1).reverse()]}
        layout={layout}
        config={config}
      />
    </Box>
  );
}
