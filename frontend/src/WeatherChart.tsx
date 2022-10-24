import { Text, Box, Tip } from "grommet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudShowersHeavy,
  faWind,
  faWater,
  faTemperatureHalf,
} from "@fortawesome/free-solid-svg-icons";
import { WeatherRespType, MetaRespType } from "./queries";
import {
  WindRecord,
  WaveRecord,
  SeatmpRecord,
  PrecRecord,
  TmpRecord,
} from "./types";
import { windBins, rainBins, waveBins } from "./constants";
import {
  getMean,
  getStdMean,
  celsius2Fahrenheit,
  fmtCelsius,
  fmtFahrenheit,
  fmtMm,
  fmtIn,
  mm2inch,
  fmtKt,
  fmtFreq,
  fmtFt,
  fmtM,
  m2ft,
} from "./util";
import Spinner from "./SpinnerBrand";

function Tooltip(props: {
  text: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Tip
      plain
      content={
        <Box width="small" background="light-1" pad="xsmall" round="xsmall">
          <Text>{props.text}</Text>
        </Box>
      }
    >
      {props.children}
    </Tip>
  );
}

const iconContainerConfig: any = {
  gap: "small",
  direction: "row",
  align: "center",
  margin: "medium",
  width: "100px",
  height: "50px",
};

interface AirTmpsProps {
  tmps: TmpRecord[];
}

function AirTmps(props: AirTmpsProps): JSX.Element {
  const aveHiM = getMean(props.tmps.map((d) => d.highMean));
  const aveLoM = getMean(props.tmps.map((d) => d.lowMean));
  const aveHiS = getStdMean(props.tmps.map((d) => d.highStd));
  const aveLoS = getStdMean(props.tmps.map((d) => d.lowStd));

  const errorFactor = Math.pow(props.tmps.length, 0.5);
  const highC = Math.round(aveHiM + aveHiS / errorFactor);
  const lowC = Math.round(aveLoM - aveLoS / errorFactor);

  const hiCfmtd = fmtCelsius(highC);
  const loCfmtd = fmtCelsius(lowC);
  const hiFfmtd = fmtFahrenheit(celsius2Fahrenheit(highC));
  const loFfmtd = fmtFahrenheit(celsius2Fahrenheit(lowC));

  return (
    <Tooltip
      text={`Air temperature ranges from ${loCfmtd} to ${hiCfmtd} (${loFfmtd} - ${hiFfmtd})`}
    >
      <Box {...iconContainerConfig}>
        <FontAwesomeIcon icon={faTemperatureHalf} size="xl" />
        <Box direction="column">
          <Text>{hiCfmtd}</Text>
          <Text>{loCfmtd}</Text>
        </Box>
      </Box>
    </Tooltip>
  );
}

interface RainProps {
  rains: PrecRecord[];
}

function Rain(props: RainProps): JSX.Element {
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

  const dailyRain = aveRainMm.reduce((a, b) => a + b) * 24;
  const monthlyRain = dailyRain * 30;

  const dailyRainMmFmtd = fmtMm(dailyRain);
  const monthlyRainMmFmtd = fmtMm(monthlyRain);
  const dailyRainInFmtd = fmtIn(mm2inch(dailyRain));
  const monthlyRainInFmtd = fmtIn(mm2inch(monthlyRain));

  return (
    <Tooltip
      text={`On average it rains ${dailyRainMmFmtd} daily (${dailyRainInFmtd}) and ${monthlyRainMmFmtd} the whole month (${monthlyRainInFmtd})`}
    >
      <Box {...iconContainerConfig}>
        <FontAwesomeIcon icon={faCloudShowersHeavy} size="xl" />
        <Text>{dailyRainMmFmtd}</Text>
      </Box>
    </Tooltip>
  );
}

function fmtKtRange(lo: number | null, hi: number | null): string {
  if (lo !== null && hi !== null) return `${fmtKt(lo)} - ${fmtKt(hi)}`;
  if (lo === null && hi !== null) return `<= ${fmtKt(hi)}`;
  if (lo !== null && hi === null) return `>= ${fmtKt(lo)}`;
  return "";
}

interface WindProps {
  winds: WindRecord[];
}

function Wind(props: WindProps): JSX.Element {
  const totalWind = props.winds.map((d) => d.count).reduce((a, b) => a + b);
  const winds = windBins.map((bin) => {
    const cnts = props.winds
      .filter((d) => bin.bfts.includes(d.vel))
      .map((d) => d.count);
    const cnt = cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
    return {
      freq: cnt > 0 ? cnt / totalWind : 0,
      bfts: bin.bfts,
      minKt: bin.minKt,
      maxKt: bin.maxKt,
    };
  });

  const windsSrtd = winds.sort((a, b) => (a.freq > b.freq ? -1 : 1));

  const wind1 = windsSrtd[0];
  const ktRange1 = fmtKtRange(wind1.minKt, wind1.maxKt);
  const bftRange1 = `BFT ${wind1.bfts.join(" - ")}`;
  const freq1 = fmtFreq(wind1.freq);

  return (
    <Tooltip
      text={`Winds of ${bftRange1} (${ktRange1}) encountered most of the time with ${freq1}`}
    >
      <Box {...iconContainerConfig}>
        <FontAwesomeIcon icon={faWind} size="xl" />
        <Box direction="column">
          <Text>{wind1.maxKt && fmtKt(wind1.maxKt)}</Text>
          <Text>{wind1.minKt && fmtKt(wind1.minKt)}</Text>
        </Box>
      </Box>
    </Tooltip>
  );
}

function fmtAvgWaveHeight(lo: number | null, hi: number | null): string {
  if (lo !== null && hi !== null) return `${Math.round((lo + hi) / 2)} m`;
  if (lo !== null && hi === null) return `> ${Math.round(lo)} m`;
  if (lo === null && hi !== null) return `< ${Math.round(hi)} m`;
  return "-";
}

function fmtWaveRangeM(lo: number | null, hi: number | null): string {
  if (lo !== null && hi !== null) return `${fmtM(lo)} - ${fmtM(hi)}`;
  if (lo === null && hi !== null) return `<= ${fmtM(hi)}`;
  if (lo !== null && hi === null) return `>= ${fmtM(lo)}`;
  return "";
}

function fmtWaveRangeFt(lo: number | null, hi: number | null): string {
  if (lo !== null && hi !== null)
    return `${fmtFt(m2ft(lo))} - ${fmtFt(m2ft(hi))}`;
  if (lo === null && hi !== null) return `<= ${fmtFt(m2ft(hi))}`;
  if (lo !== null && hi === null) return `>= ${fmtFt(m2ft(lo))}`;
  return "";
}

interface WaterProps {
  tmps: SeatmpRecord[];
  waves: WaveRecord[];
}

function Water(props: WaterProps): JSX.Element {
  const totalWaves = props.waves.map((d) => d.count).reduce((a, b) => a + b);
  const waves = waveBins.map((bin) => {
    const cnts = props.waves
      .filter((d) => bin.dgs.includes(d.height))
      .map((d) => d.count);
    const cnt = cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
    return {
      freq: cnt > 0 ? cnt / totalWaves : 0,
      dgs: bin.dgs,
      maxM: bin.maxM,
      minM: bin.minM,
    };
  });

  const wavesSrtd = waves.sort((a, b) => (a.freq > b.freq ? -1 : 1));

  const wave1 = wavesSrtd[0];
  const avgWave1Fmtd = fmtAvgWaveHeight(wave1.minM, wave1.maxM);
  const waveRange1MFmtd = fmtWaveRangeM(wave1.minM, wave1.maxM);
  const waveRange1FtFmtd = fmtWaveRangeFt(wave1.minM, wave1.maxM);
  const freq1 = fmtFreq(wave1.freq);

  const tmps = props.tmps.map((d) => (d.highMean + d.lowMean) / 2);
  const avgTmp =
    tmps.length > 0 ? tmps.reduce((a, b) => a + b) / tmps.length : null;

  const tmpCfmtd = fmtCelsius(avgTmp);
  const tmpFfmtd = fmtFahrenheit(avgTmp && celsius2Fahrenheit(avgTmp));

  return (
    <Tooltip
      text={
        `Average water temperature is ${tmpCfmtd} (${tmpFfmtd}). ` +
        `Wave heights of ${waveRange1MFmtd} (${waveRange1FtFmtd}) are most often encoutered with ${freq1}`
      }
    >
      <Box {...iconContainerConfig}>
        <FontAwesomeIcon icon={faWater} size="xl" />
        <Box direction="column">
          <Text>{avgWave1Fmtd}</Text>
          <Text>{tmpCfmtd}</Text>
        </Box>
      </Box>
    </Tooltip>
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

  return (
    <Box direction="column" margin="medium">
      <Box direction="row" justify="around">
        <AirTmps tmps={props.weather.data.tmpRecords} />
        <Rain rains={props.weather.data.precRecords} />
      </Box>
      <Box direction="row" justify="around">
        <Wind winds={props.weather.data.windRecords} />
        <Water
          tmps={props.weather.data.seatmpRecords}
          waves={props.weather.data.waveRecords}
        />
      </Box>
    </Box>
  );
}
