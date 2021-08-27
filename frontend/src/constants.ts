export const INIT_ZOOM = 6;
export const EXCLUSION_ZONES: [number, number] = [-70, 70];
export const INIT_POS: [number, number] = [46.0, -6.0];

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
  color: string;
};

// pos 0 will be left out in summary (should be "no wind")
export const windBins: WindBinType[] = [
  { bfts: [0, 1], minKt: null, maxKt: 3, color: COLORS.transparent },
  { bfts: [2, 3], minKt: 4, maxKt: 10, color: COLORS.grayBlue },
  { bfts: [4, 5], minKt: 11, maxKt: 21, color: COLORS.darkBlue },
  { bfts: [6, 7], minKt: 22, maxKt: 33, color: COLORS.purpleBlue },
  { bfts: [8, 9], minKt: 34, maxKt: 47, color: COLORS.purplePink },
  { bfts: [10, 11], minKt: 48, maxKt: 55, color: COLORS.pinkRed },
  { bfts: [12], minKt: 56, maxKt: null, color: COLORS.red },
];

export type RainBinType = {
  idx: number;
  name: string;
  color: string;
};

// pos 0 will be left out in summary (should be "no rain")
export const rainBins: RainBinType[] = [
  { idx: 1, name: "Dry<br>< 0.1 mm", color: COLORS.transparent },
  { idx: 2, name: "Light rain<br>0.1 to 2.5 mm", color: COLORS.grayBlue },
  { idx: 3, name: "Moderate rain<br>2.5 to 7.6 mm", color: COLORS.darkBlue },
  { idx: 4, name: "Heavy rain<br>7.6 to 50 mm", color: COLORS.purplePink },
  { idx: 5, name: "Violent rain<br>> 50 mm", color: COLORS.pinkRed },
];

export type TmpBinsType = {
  minC: number;
  maxC: number;
  color: string;
};

export const tmpBins: TmpBinsType[] = [
  { minC: 40, maxC: Infinity, color: COLORS.red },
  { minC: 30, maxC: 40, color: COLORS.pinkRed },
  { minC: 15, maxC: 30, color: COLORS.purplePink },
  { minC: 0, maxC: 15, color: COLORS.grayBlue },
  { minC: -15, maxC: 0, color: COLORS.darkBlue },
  { minC: -Infinity, maxC: -15, color: COLORS.purpleBlue },
];
