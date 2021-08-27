import Plot from "react-plotly.js";
import { Text, Box } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { WindRecord, Meta, PrecRecord, TmpRecord } from "./types";
import { windBins, rainBins, COLORS } from "./constants";
import { getMean, getStdMean, getWindName, getTmpColor } from "./util";
import Spinner from "./SpinnerBrand";
import Tooltip from "./Tooltip";

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
      const name = getWindName(bin);
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
  const layout: any = {
    hovermode: "closest",
    margin: { t: 10, r: 30, l: 50, b: 50 },
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
      range: [-0.4, 1.5],
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
    },
  };

  if (props.tmps.length < 1) {
    return <Plot data={[]} layout={layout} config={config} />;
  }

  const aveHiM = getMean(props.tmps.map((d) => d.highMean));
  const aveLoM = getMean(props.tmps.map((d) => d.lowMean));
  const aveHiS = getStdMean(props.tmps.map((d) => d.highStd));
  const aveLoS = getStdMean(props.tmps.map((d) => d.lowStd));

  const hiColor = getTmpColor(aveHiM);
  const loColor = getTmpColor(aveLoM);

  const tickVals = [Math.round(aveLoM), Math.round(aveHiM)];
  layout.yaxis.tickvals = tickVals;
  layout.yaxis.ticktext = tickVals.map((d) => `${d}°C`);

  const traces = [
    {
      x: ["high"],
      y: [aveHiM],
      marker: { color: hiColor },
      hovertemplate: "%{y:.1f}°C<extra></extra>",
      error_y: {
        type: "constant",
        color: hiColor,
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
      marker: { color: loColor },
      hovertemplate: `${Math.round(aveLoM)}°C<extra></extra>`,
      error_y: {
        type: "constant",
        color: loColor,
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
    <Box direction="row" margin={{ vertical: "medium" }} justify="around">
      <Box margin="small" align="end">
        <Tooltip text="Averages of daily max and min temperatures in that month." />
        <TmpRanges
          meta={props.meta.data}
          tmps={props.weather.data.tmpRecords}
        />
      </Box>
      <Box margin="small" align="end">
        <Tooltip text="Hours of certain rains and winds in that month" />
        <WindRainBars
          meta={props.meta.data}
          winds={props.weather.data.windRecords}
          rains={props.weather.data.precRecords}
        />
      </Box>
    </Box>
  );
}
