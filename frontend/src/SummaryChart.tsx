import { Text, Box } from "grommet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudShowersHeavy,
  faWind,
  faWater,
  faTemperatureHalf,
} from "@fortawesome/free-solid-svg-icons";
import {
  WindRecord,
  WaveRecord,
  SeatempRecord,
  RainRecord,
  TempRecord,
  WeatherResult,
} from "./types";
import { windBins, waveBins } from "./constants";
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
import { Tooltip } from "./components";

const iconContainerConfig: any = {
  gap: "small",
  direction: "row",
  align: "center",
  margin: "medium",
  width: "100px",
  height: "50px",
};

function AirTmps(props: { tmps: TempRecord[] }): JSX.Element {
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

function Rain(props: { rains: RainRecord[] }): JSX.Element {
  const dailyRains = props.rains.map((d) => d.dailyMean);

  const dailySum = dailyRains.reduce((a, b) => a + b);
  const avgDailyRain = dailySum / dailyRains.length;
  const avgMonthlyRain = avgDailyRain * 30;

  const dailyRainMmFmtd = fmtMm(avgDailyRain);
  const monthlyRainMmFmtd = fmtMm(avgMonthlyRain);
  const dailyRainInFmtd = fmtIn(mm2inch(avgDailyRain));
  const monthlyRainInFmtd = fmtIn(mm2inch(avgMonthlyRain));

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

function Wind(props: {
  winds: WindRecord[];
  vel2bft: { [key: number]: number };
}): JSX.Element {
  const totalWind = props.winds.map((d) => d.count).reduce((a, b) => a + b);
  const winds = windBins.map((bin) => {
    const cnts = props.winds
      .filter((d) => bin.bfts.includes(props.vel2bft[d.vel]))
      .map((d) => d.count);
    const cnt = cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
    return {
      freq: cnt > 0 ? cnt / totalWind : 0,
      bfts: bin.bfts,
      minKt: bin.minKt,
      maxKt: bin.maxKt,
    };
  });

  let windsSrtd = winds;
  if (totalWind > 0)
    windsSrtd = winds.sort((a, b) => (a.freq > b.freq ? -1 : 1));

  const wind1 = windsSrtd[0];
  const ktRange1 = fmtKtRange(wind1.minKt, wind1.maxKt);
  const bftRange1 = `BFT ${wind1.bfts.join(" - ")}`;
  const freq1 = fmtFreq(wind1.freq);

  return (
    <Tooltip
      text={
        `Winds of ${bftRange1} (${ktRange1}) are most often encountered ` +
        ` making up ${freq1}`
      }
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
  if (lo !== null && hi !== null) return `${Math.round((lo + hi) / 2)}m`;
  if (lo !== null && hi === null) return `> ${Math.round(lo)}m`;
  if (lo === null && hi !== null) return `< ${Math.round(hi)}m`;
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

function Water(props: {
  tmps: SeatempRecord[];
  waves: WaveRecord[];
  height2dgs: { [key: number]: number };
}): JSX.Element {
  const totalWaves = props.waves.map((d) => d.count).reduce((a, b) => a + b);
  const waves = waveBins.map((bin) => {
    const cnts = props.waves
      .filter((d) => bin.dgs.includes(props.height2dgs[d.height]))
      .map((d) => d.count);
    const cnt = cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
    return {
      freq: totalWaves > 0 ? cnt / totalWaves : 0,
      dgs: bin.dgs,
      maxM: bin.maxM,
      minM: bin.minM,
    };
  });

  let wavesSrtd = waves;
  if (totalWaves > 0) waves.sort((a, b) => (a.freq > b.freq ? -1 : 1));

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
        `Wave heights of ${waveRange1MFmtd} (${waveRange1FtFmtd}) are most often encoutered ` +
        `making up ${freq1}`
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

export default function SummaryChart(props: {
  weather: WeatherResult;
  height2dgs: { [key: number]: number };
  vel2bft: { [key: number]: number };
}): JSX.Element {
  return (
    <Box
      direction="column"
      margin={{ horizontal: "medium", vertical: "large" }}
    >
      <Box direction="row" justify="around">
        <AirTmps tmps={props.weather.tempRecords} />
        <Rain rains={props.weather.rainRecords} />
      </Box>
      <Box direction="row" justify="around">
        <Wind winds={props.weather.windRecords} vel2bft={props.vel2bft} />
        <Water
          tmps={props.weather.seatempRecords}
          waves={props.weather.waveRecords}
          height2dgs={props.height2dgs}
        />
      </Box>
    </Box>
  );
}
