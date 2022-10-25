import Plot from "react-plotly.js";
import { Box } from "grommet";
import { waveBins, COLORS, WaveBinType } from "./constants";
import { fmtNumRange, fmtNumCats, fmtFreq } from "./util";
import { WeatherResult } from "./types";
import { TooltipIcon } from "./components";

function getWaveName(waveBin: WaveBinType): string {
  let m = fmtNumRange(waveBin.minM, waveBin.maxM);
  const dgs = fmtNumCats(waveBin.dgs);
  return `${waveBin.label}<br>Douglas degree ${dgs}<br>${m}m wave height`;
}

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
    margin: { t: 30, r: 50, l: 100, b: 20 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    barmode: "stack",
    width: 220,
    height: 300,
    xaxis: { fixedrange: true },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
      tickvals: [0, 0.5, 1],
      ticktext: ["0%", "50%", "100%"],
      range: [0, 1],
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
      const name = getWaveName(bin);
      return {
        marker: { color: bin.color },
        name: name,
        type: "bar",
        x: ["sea state"],
        y: [freq],
        hovertemplate: `${fmtFreq(freq)} ${name}<extra></extra>`,
      };
    })
    .filter((d) => d.y[0] > 0);

  return (
    <Box margin={{ vertical: "medium" }}>
      <Box margin="small" align="end">
        <TooltipIcon
          text={
            "Relative amount certain sea conditions are experienced during this month. " +
            "Hover over the bars to see details."
          }
        />
      </Box>
      <Plot data={[...traces.reverse()]} layout={layout} config={config} />
    </Box>
  );
}
