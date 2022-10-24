import Plot from "react-plotly.js";
import { Box } from "grommet";
import { WaveRecord, WeatherResult } from "./types";
import { waveBins, COLORS } from "./constants";
import { getWaveName } from "./util";

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

interface WaveBarsProps {
  waves: WaveRecord[];
  height2dgs: { [key: number]: number };
}

function WaveBars(props: WaveBarsProps): JSX.Element {
  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 70, l: 70, b: 50 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
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

  const sums = waveBins.map((bin) => {
    const cnts = props.waves
      .filter((d) => bin.dgs.includes(props.height2dgs[d.height]))
      .map((d) => d.count);
    return cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
  });

  const total = sums.reduce((a, b) => a + b);
  const freqs =
    total > 0 ? sums.map((d) => d / total) : new Array(sums.length).fill(0);

  const traces = waveBins
    .map((bin, i) => {
      const pct = Math.round(freqs[i] * 100);
      const name = getWaveName(bin);
      return {
        marker: { color: bin.color },
        name: name,
        type: "bar",
        x: ["sea state"],
        y: [pct],
        hovertemplate: `${pct}% ${name}<extra></extra>`,
      };
    })
    .filter((d) => d.y[0] > 0);

  return <Plot data={[...traces.reverse()]} layout={layout} config={config} />;
}

type WaterChartProps = {
  weather: WeatherResult;
  height2dgs: { [key: number]: number };
};

export default function WaterChart(props: WaterChartProps): JSX.Element {
  return (
    <Box margin={{ vertical: "medium" }}>
      <WaveBars
        waves={props.weather.waveRecords}
        height2dgs={props.height2dgs}
      />
    </Box>
  );
}
