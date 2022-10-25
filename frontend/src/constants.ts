export type Tuple = [number, number];

export const INIT_ZOOM = 6;
export const EXCLUSION_ZONES: Tuple = [-70, 70];
export const INIT_POS: Tuple = [46.0, -6.0];

export const donateSrc = "https://www.buymeacoffee.com/mRcSchwering";

export const COLORS = {
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
  darkGray: "#666666",
  primary: "#6aa6d7",
};

export type DirBinType = {
  idx: number;
  name: string;
};

export const dirBins: DirBinType[] = [
  { idx: 1, name: "N" },
  { idx: 2, name: "NNE" },
  { idx: 3, name: "NE" },
  { idx: 4, name: "ENE" },
  { idx: 5, name: "E" },
  { idx: 6, name: "ESE" },
  { idx: 7, name: "SE" },
  { idx: 8, name: "SSE" },
  { idx: 9, name: "S" },
  { idx: 10, name: "SSW" },
  { idx: 11, name: "SW" },
  { idx: 12, name: "WSW" },
  { idx: 13, name: "W" },
  { idx: 14, name: "WNW" },
  { idx: 15, name: "NW" },
  { idx: 16, name: "NNW" },
];

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

// pos 0 will be left out in summary (should be "no waves")
export const waveBins: WaveBinType[] = [
  {
    dgs: [0, 1, 2],
    minM: null,
    maxM: 0.5,
    label: "Calm",
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
    label: "Very High",
    color: COLORS.lightPurpleBlue,
  },
];

export type RainBinType = {
  idx: number;
  avgMm: number;
};

// pos 0 will be left out in summary (should be "no rain")
export const rainBins: RainBinType[] = [
  {
    idx: 1,
    avgMm: 0,
  },
  {
    idx: 2,
    avgMm: 1.3,
  },
  {
    idx: 3,
    avgMm: 5,
  },
  {
    idx: 4,
    avgMm: 28,
  },
  {
    idx: 5,
    avgMm: 50,
  },
];
