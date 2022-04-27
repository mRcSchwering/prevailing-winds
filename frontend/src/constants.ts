export const INIT_ZOOM = 6;
export const EXCLUSION_ZONES: [number, number] = [-70, 70];
export const INIT_POS: [number, number] = [46.0, -6.0];

export const donateSrc =
  "https://www.paypal.com/donate/?hosted_button_id=W9R9KQYFCESAS";

export const COLORS = {
  boneWhite: "#ffffe0",
  grayBlue: "#80a1bf",
  darkBlue: "#00429d",
  purpleBlue: "#54479f",
  purplePink: "#a84da0",
  pinkRed: "#b92650",
  red: "#ca0000",
  transparent: "rgba(0,0,0,0)",
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
    color: COLORS.grayBlue,
  },
  {
    bfts: [4, 5],
    minKt: 11,
    maxKt: 21,
    minKmh: 20,
    maxKmh: 38,
    color: COLORS.darkBlue,
  },
  {
    bfts: [6, 7],
    minKt: 22,
    maxKt: 33,
    minKmh: 39,
    maxKmh: 61,
    color: COLORS.purpleBlue,
  },
  {
    bfts: [8, 9],
    minKt: 34,
    maxKt: 47,
    minKmh: 62,
    maxKmh: 88,
    color: COLORS.purplePink,
  },
  {
    bfts: [10, 11],
    minKt: 48,
    maxKt: 55,
    minKmh: 89,
    maxKmh: 117,
    color: COLORS.pinkRed,
  },
  {
    bfts: [12],
    minKt: 64,
    maxKt: null,
    minKmh: 118,
    maxKmh: null,
    color: COLORS.red,
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
    dgs: [0, 1],
    minM: null,
    maxM: 0.1,
    label: "Calm",
    color: COLORS.transparent,
  },
  {
    dgs: [2, 3],
    minM: 0.1,
    maxM: 1.25,
    label: "Smooth/Slight",
    color: COLORS.grayBlue,
  },
  {
    dgs: [4],
    minM: 1.25,
    maxM: 2.5,
    label: "Moderate",
    color: COLORS.darkBlue,
  },
  {
    dgs: [5],
    minM: 2.5,
    maxM: 4,
    label: "Rough",
    color: COLORS.purpleBlue,
  },
  {
    dgs: [6],
    minM: 4,
    maxM: 6,
    label: "Very rough",
    color: COLORS.purplePink,
  },
  {
    dgs: [7],
    minM: 6,
    maxM: 9,
    label: "High",
    color: COLORS.pinkRed,
  },
  {
    dgs: [8, 9],
    minM: 9,
    maxM: null,
    label: "Very high/Phenomenal",
    color: COLORS.red,
  },
];

export type RainBinType = {
  idx: number;
  name: string;
  color: string;
};

// pos 0 will be left out in summary (should be "no rain")
export const rainBins: RainBinType[] = [
  { idx: 1, name: "Dry<br>< 0.1 mm<br>< 0.004 in", color: COLORS.transparent },
  {
    idx: 2,
    name: "Light rain<br>0.1-2.5 mm<br>0.004-0.098 in",
    color: COLORS.grayBlue,
  },
  {
    idx: 3,
    name: "Moderate rain<br>2.5-7.6 mm<br>0.098-0.30 in",
    color: COLORS.darkBlue,
  },
  {
    idx: 4,
    name: "Heavy rain<br>7.6-50 mm<br>0.30-2.0 in",
    color: COLORS.purplePink,
  },
  {
    idx: 5,
    name: "Violent rain<br>> 50 mm<br>> 2.0 in",
    color: COLORS.pinkRed,
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
