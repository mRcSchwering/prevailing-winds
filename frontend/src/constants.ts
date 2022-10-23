export const INIT_ZOOM = 6;
export const EXCLUSION_ZONES: [number, number] = [-70, 70];
export const INIT_POS: [number, number] = [46.0, -6.0];

export const donateSrc = "https://www.buymeacoffee.com/mRcSchwering";

export const COLORS = {
  boneWhite: "#ffffe0",
  grayBlue: "#80a1bf",
  darkBlue: "#00429d",
  purpleBlue: "#54479f",
  purplePink: "#a84da0",
  pinkRed: "#b92650",
  red: "#ca0000",
  transparent: "rgba(0,0,0,0)",
  purpleGreen1: "#a19eed",
  purpleGreen2: "#9aaeeb",
  purpleGreen3: "#95c3e9",
  purpleGreen4: "#8de7e4",
  purpleGreen5: "#90ecc5",
  lightPinkRed: "#f2a2be",
  redYellow1: "#f291a8",
  redYellow2: "#ffb999",
  redYellow3: "#ffd599",
  redYellow4: "#ffe799",
  redYellow5: "#fff699",
  lightPurpleBlue: "#da8eed",
  lightGray: "#f4f3f3",
  darkGray: "#666666",
  primary: "#6aa6d7",
};

export type Tuple = [number, number];

export type WindBinType = {
  bfts: number[];
  minKt: null | number;
  maxKt: null | number;
  minKmh: null | number;
  maxKmh: null | number;
  color: string;
};

// pos 0 will be left out in summary (should be "no wind")
export const windBins: WindBinType[] = [
  {
    bfts: [0, 1],
    minKt: null,
    maxKt: 3,
    minKmh: null,
    maxKmh: 5,
    color: COLORS.transparent,
  },
  {
    bfts: [2, 3],
    minKt: 4,
    maxKt: 10,
    minKmh: 6,
    maxKmh: 19,
    color: COLORS.purpleGreen5,
  },
  {
    bfts: [4],
    minKt: 11,
    maxKt: 16,
    minKmh: 20,
    maxKmh: 28,
    color: COLORS.purpleGreen4,
  },
  {
    bfts: [5],
    minKt: 17,
    maxKt: 21,
    minKmh: 29,
    maxKmh: 38,
    color: COLORS.purpleGreen3,
  },
  {
    bfts: [6, 7],
    minKt: 22,
    maxKt: 33,
    minKmh: 39,
    maxKmh: 61,
    color: COLORS.purpleGreen2,
  },
  {
    bfts: [8, 9],
    minKt: 34,
    maxKt: 47,
    minKmh: 62,
    maxKmh: 88,
    color: COLORS.purpleGreen1,
  },
  {
    bfts: [10, 11],
    minKt: 48,
    maxKt: 55,
    minKmh: 89,
    maxKmh: 117,
    color: COLORS.lightPinkRed,
  },
  {
    bfts: [12],
    minKt: 64,
    maxKt: null,
    minKmh: 118,
    maxKmh: null,
    color: COLORS.lightPinkRed,
  },
];

export type WaveBinType = {
  dgs: number[];
  label: string;
  minM: null | number;
  maxM: null | number;
  color: string;
};

// pos 0 will be left out in summary (should be "no wind")
export const waveBins: WaveBinType[] = [
  {
    dgs: [0, 1, 2],
    minM: null,
    maxM: 0.5,
    label: "Calm to Smooth",
    color: COLORS.transparent,
  },
  {
    dgs: [3],
    minM: 0.5,
    maxM: 1.25,
    label: "Slight",
    color: COLORS.redYellow5,
  },
  {
    dgs: [4],
    minM: 1.25,
    maxM: 2.5,
    label: "Moderate",
    color: COLORS.redYellow4,
  },
  {
    dgs: [5],
    minM: 2.5,
    maxM: 4,
    label: "Rough",
    color: COLORS.redYellow3,
  },
  {
    dgs: [6],
    minM: 4,
    maxM: 6,
    label: "Very rough",
    color: COLORS.redYellow2,
  },
  {
    dgs: [7],
    minM: 6,
    maxM: 9,
    label: "High",
    color: COLORS.redYellow1,
  },
  {
    dgs: [8, 9],
    minM: 9,
    maxM: null,
    label: "Very High to Phenomenal",
    color: COLORS.lightPurpleBlue,
  },
];

export type RainBinType = {
  idx: number;
  name: string;
  color: string;
  avgMm: number;
};

// pos 0 will be left out in summary (should be "no rain")
export const rainBins: RainBinType[] = [
  {
    idx: 1,
    name: "Dry<br>< 0.1 mm<br>< 0.004 in",
    color: COLORS.transparent,
    avgMm: 0,
  },
  {
    idx: 2,
    name: "Light rain<br>0.1-2.5 mm<br>0.004-0.098 in",
    color: COLORS.grayBlue,
    avgMm: 1.3,
  },
  {
    idx: 3,
    name: "Moderate rain<br>2.5-7.6 mm<br>0.098-0.30 in",
    color: COLORS.darkBlue,
    avgMm: 5,
  },
  {
    idx: 4,
    name: "Heavy rain<br>7.6-50 mm<br>0.30-2.0 in",
    color: COLORS.purplePink,
    avgMm: 28,
  },
  {
    idx: 5,
    name: "Violent rain<br>> 50 mm<br>> 2.0 in",
    color: COLORS.pinkRed,
    avgMm: 50,
  },
];

export type TmpBinsType = {
  minC: number;
  maxC: number;
  color: string;
};

export const tmpBins: TmpBinsType[] = [
  { minC: 35, maxC: Infinity, color: COLORS.pinkRed },
  { minC: 15, maxC: 35, color: COLORS.purplePink },
  { minC: -5, maxC: 15, color: COLORS.purpleBlue },
  { minC: -Infinity, maxC: -5, color: COLORS.darkBlue },
];

export const seatmpBins: TmpBinsType[] = [
  { minC: 15, maxC: Infinity, color: COLORS.purplePink },
  { minC: 5, maxC: 15, color: COLORS.purpleBlue },
  { minC: -Infinity, maxC: 5, color: COLORS.darkBlue },
];
