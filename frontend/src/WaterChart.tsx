import Plot from "react-plotly.js";
import { Text, Box } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { Meta, WaveRecord, SeatmpRecord } from "./types";
import { waveBins, COLORS } from "./constants";
import { getMean, getStdMean, getTmpColor, getWaveName } from "./util";
import Spinner from "./SpinnerBrand";
import Tooltip from "./Tooltip";

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

interface WaveBarsProps {
  waves: WaveRecord[];
  meta: Meta;
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
    const hghtIdxs = props.meta.waveHeights
      .filter((d) => bin.dgs.includes(d.douglasDegree))
      .map((d) => d.idx);
    const cnts = props.waves
      .filter((d) => hghtIdxs.includes(d.height))
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

interface SeatmpRangesProps {
  seatmps: SeatmpRecord[];
  meta: Meta;
}

function SeatmpRanges(props: SeatmpRangesProps): JSX.Element {
  const layout: any = {
    hovermode: "closest",
    margin: { t: 10, r: 30, l: 70, b: 50 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    width: 150,
    height: 300,
    xaxis: {
      fixedrange: true,
      showgrid: false,
      showline: false,
      range: [-0.8, 0.8],
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
    },
  };

  if (props.seatmps.length < 1) {
    return <Plot data={[]} layout={layout} config={config} />;
  }

  const aveHiM = getMean(props.seatmps.map((d) => d.highMean));
  const aveLoM = getMean(props.seatmps.map((d) => d.lowMean));
  const aveHiS = getStdMean(props.seatmps.map((d) => d.highStd));
  const aveLoS = getStdMean(props.seatmps.map((d) => d.lowStd));

  const ave = getMean([aveHiM, aveLoM]);
  const std = getStdMean([aveHiS, aveLoS]);
  const color = getTmpColor(aveHiM);

  layout.yaxis.tickvals = [
    Math.round((ave + 0.7 * std) * 10) / 10,
    Math.round((ave - 0.7 * std) * 10) / 10,
  ];
  layout.yaxis.ticktext = (layout.yaxis.tickvals as number[]).map(
    (d) => `${d}°C`
  );

  const traces = [
    {
      x: ["tmp"],
      y: [ave],
      marker: { color: color },
      hovertemplate: "%{y:.1f}°C<extra></extra>",
      error_y: {
        type: "constant",
        color: color,
        value: std,
        thickness: 1.5,
        width: 3,
        opacity: 1,
      },
      type: "scatter",
    },
  ];

  return <Plot data={traces} layout={layout} config={config} />;
}

type WaterChartProps = {
  weather: WeatherRespType;
  meta: MetaRespType;
};

export default function WaterChart(props: WaterChartProps): JSX.Element {
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
    <Box direction="row" margin={{ vertical: "medium" }} justify="around">
      <Box margin="small" align="end">
        <Tooltip text="Average daily sea surface temperatures in that month." />
        <Box style={{ minWidth: "150px", minHeight: "300px" }}>
          <SeatmpRanges
            meta={props.meta.data}
            seatmps={props.weather.data.seatmpRecords}
          />
        </Box>
      </Box>
      <Box margin="small" align="end">
        <Tooltip text="Hours of certain wave heights in that month. Combined wind waves and swell." />
        <Box style={{ minWidth: "150px", minHeight: "300px" }}>
          <WaveBars
            meta={props.meta.data}
            waves={props.weather.data.waveRecords}
          />
        </Box>
      </Box>
    </Box>
  );
}
