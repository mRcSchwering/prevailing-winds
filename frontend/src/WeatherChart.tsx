import Plot from "react-plotly.js";
import { Text, Box, Tip } from "grommet";
import { Sun, Moon, Cloud } from "grommet-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudShowersHeavy,
  faSun,
  faMoon,
  faWind,
  faWater,
  faTemperatureHigh,
  faTemperatureLow,
  faTemperatureHalf,
} from "@fortawesome/free-solid-svg-icons";
import { WeatherRespType, MetaRespType } from "./queries";
import { WindRecord, Meta, PrecRecord, TmpRecord } from "./types";
import { windBins, rainBins, COLORS } from "./constants";
import {
  getMean,
  getStdMean,
  getWindName,
  getTmpColor,
  celsius2Fahrenheit,
} from "./util";
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
  rains: PrecRecord[];
  tmps: TmpRecord[];
  meta: Meta;
}

function TmpRanges(props: TmpRangesProps): JSX.Element {
  const aveHiM = getMean(props.tmps.map((d) => d.highMean));
  const aveLoM = getMean(props.tmps.map((d) => d.lowMean));
  const aveHiS = getStdMean(props.tmps.map((d) => d.highStd));
  const aveLoS = getStdMean(props.tmps.map((d) => d.lowStd));

  const errorFactor = Math.pow(props.tmps.length, 0.5);
  const highC = Math.round(aveHiM + aveHiS / errorFactor);
  const lowC = Math.round(aveLoM - aveLoS / errorFactor);
  const highF = Math.round(celsius2Fahrenheit(highC));
  const lowF = Math.round(celsius2Fahrenheit(lowC));

  const highStr = `${highC}°C or ${highF}°F`;
  const lowStr = `${lowC}°C or ${lowF}°F`;
  const hiColor = getTmpColor(highC);
  const loColor = getTmpColor(highC);

  const rainBinSums = rainBins.map((bin) => {
    const cnts = props.rains
      .filter((d) => d.amt === bin.idx)
      .map((d) => d.count);
    return cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
  });

  const totalRain = rainBinSums.reduce((a, b) => a + b);
  const aveRainMm = rainBins.map((bin, i) => {
    const freq = rainBinSums[i] > 0 ? rainBinSums[i] / totalRain : 0;
    return freq * bin.avgMm;
  });
  const aveRainMmDaily = Math.round(aveRainMm.reduce((a, b) => a + b) * 24);
  const aveRainMonthly = Math.round(aveRainMmDaily * 30);

  return (
    <Box gap="medium" margin="medium">
      <Tip content={`${highStr} during the day`}>
        <Box direction="row" align="center">
          <Sun color={hiColor} size="large" />
          <Text>{highC}°C</Text>
        </Box>
      </Tip>
      <Tip content={`${lowStr} during the night`}>
        <Box direction="row" align="center">
          <Moon color={loColor} size="large" />
          <Text>{lowC}°C</Text>
        </Box>
      </Tip>
      <Tip
        content={`${aveRainMmDaily} mm rain daily and ${aveRainMonthly} mm the whole month`}
      >
        <Box direction="row" align="center">
          <Cloud color={COLORS.darkBlue} size="large" />
          <Text>{aveRainMmDaily} mm</Text>
        </Box>
      </Tip>
    </Box>
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
    return (
      <Box direction="column" margin="medium">
        <Box direction="row" justify="around">
          <Box
            gap="small"
            direction="row"
            align="center"
            margin="medium"
            width="100px"
            height="50px"
          >
            <FontAwesomeIcon icon={faTemperatureHalf} size="xl" />
            <Box direction="column">
              <Text>22 °C</Text>
              <Text>18 °C</Text>
            </Box>
          </Box>
          <Box
            gap="small"
            direction="row"
            align="center"
            margin="medium"
            width="100px"
            height="50px"
          >
            <FontAwesomeIcon icon={faCloudShowersHeavy} size="xl" />
            <Text>22 mm</Text>
          </Box>
        </Box>
        <Box direction="row" justify="around">
          <Box
            gap="small"
            direction="row"
            align="center"
            margin="medium"
            width="100px"
            height="50px"
          >
            <FontAwesomeIcon icon={faWind} size="xl" />
            <Text>15 kt</Text>
          </Box>
          <Box
            gap="small"
            direction="row"
            align="center"
            margin="medium"
            width="100px"
            height="50px"
          >
            <FontAwesomeIcon icon={faWater} size="xl" />
            <Text>2-3 m</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!props.meta.data || !props.weather.data) {
    return <Text>click somewhere on the chart</Text>;
  }

  return (
    <Box direction="row" margin={{ vertical: "medium" }} justify="around">
      <Box margin="small" align="end">
        <TmpRanges
          meta={props.meta.data}
          tmps={props.weather.data.tmpRecords}
          rains={props.weather.data.precRecords}
        />
      </Box>
      <Box margin="small" align="end">
        <Tooltip text="Hours of certain rains and winds in that month" />
        <Box>
          <WindRainBars
            meta={props.meta.data}
            winds={props.weather.data.windRecords}
            rains={props.weather.data.precRecords}
          />
        </Box>
      </Box>
    </Box>
  );
}
