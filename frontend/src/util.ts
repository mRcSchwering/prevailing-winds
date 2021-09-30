import {
  EXCLUSION_ZONES,
  Tuple,
  WindBinType,
  WaveBinType,
  tmpBins,
  seatmpBins,
} from "./constants";

/**
 * Some formatting functions for DMS
 */

export function adjustLng(lng: number): number {
  const lngAdj = lng % 360;
  if (lngAdj > 180) return (lngAdj % 180) - 180;
  if (lngAdj < -180) return (lngAdj % 180) + 180;
  return lngAdj;
}

export function toDegreesMinutesAndSeconds(coordinate: number): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  return degrees + "° " + minutes + "' " + seconds + "''";
}

export function convertLatDMS(lat: number): string {
  const val = toDegreesMinutesAndSeconds(lat);
  const card = lat >= 0 ? "N" : "S";
  return val + " " + card;
}

export function convertLngDMS(lng: number): string {
  let lngAdj = adjustLng(lng);
  const val = toDegreesMinutesAndSeconds(lngAdj);
  const card = lngAdj >= 0 ? "E" : "W";
  return val + " " + card;
}

export function convertDMS(lat: number, lng: number): string {
  const latitude = toDegreesMinutesAndSeconds(lat);
  const latitudeCardinal = lat >= 0 ? "N" : "S";

  let lngAdj = adjustLng(lng);
  const longitude = toDegreesMinutesAndSeconds(lngAdj);
  const longitudeCardinal = lngAdj >= 0 ? "E" : "W";

  return (
    latitude +
    " " +
    latitudeCardinal +
    " - " +
    longitude +
    " " +
    longitudeCardinal
  );
}

/**
 * I need this because I often have to adjust for varying distances between meridians.
 * I'm estimating distances between lngs at given lat like this:
 * l_lng = cos(d_lat) * 60M
 */
export function cosine(degree: number): number {
  return Math.cos((degree * Math.PI) / 180);
}

/**
 * suggesting a reasonable padding factor for given zoom level
 * factor below 1 doesnt make sense because data points are per degree
 * avoid too high factor because it would mean that a lot of datapoints
 * would need to be aggregated -> slow
 */
export function suggestPadFactor(zoomLvl: number): number {
  if (zoomLvl <= 5) return 4;
  if (zoomLvl <= 6) return 3;
  if (zoomLvl <= 7) return 2;
  if (zoomLvl <= 8) return 1;
  return 0.5;
}

/**
 * Functions for getting lats/lngs for bounding rectangle
 * given a position and a padding factor
 */

export function getLatFloor(degree: number, pad: number): number {
  return degree - 0.5 * pad;
}

export function getLngFloor(degree: number, pad: number): number {
  return degree - 0.5 * pad;
}

export function getLatCeil(degree: number, pad: number): number {
  return degree + 0.5 * pad;
}

export function getLngCeil(degree: number, pad: number): number {
  return degree + 0.5 * pad;
}

export function excludePoles(d: number): number {
  return Math.min(Math.max(d, EXCLUSION_ZONES[0]), EXCLUSION_ZONES[1]);
}

/**
 * Calculate (and format) area in M from bounding rect.
 * Adjusts longitude distances based on mean latitude.
 */
export function rect2area(lats: Tuple, lngs: Tuple): string {
  const v = (lats[1] - lats[0]) * 60;
  const aveLat = (lats[0] + lats[1]) / 2;
  const u = (lngs[1] - lngs[0]) * 60 * cosine(aveLat);
  return new Intl.NumberFormat().format(Math.round(u * v));
}

/**
 * Arithmetic mean of number array
 */
export function getMean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
}

/**
 * Average standard deviations by calculating the arithmetic
 * mean of their variances.
 */
export function getStdMean(arr: number[]): number {
  return Math.pow(getMean(arr.map((d) => Math.pow(d, 2))), 0.5);
}

/**
 * prepare name for a wind bin
 */
export function getWindName(windBin: WindBinType): string {
  let kts = "";
  if (windBin.minKt && windBin.maxKt)
    kts = `${windBin.minKt}-${windBin.maxKt} kt`;
  else if (windBin.minKt) kts = `>= ${windBin.minKt} kt`;
  else if (windBin.maxKt) kts = `<= ${windBin.maxKt} kt`;
  let kmhs = "";
  if (windBin.minKmh && windBin.maxKmh)
    kmhs = `${windBin.minKmh}-${windBin.maxKmh} km/h`;
  else if (windBin.minKmh) kmhs = `>= ${windBin.minKmh} km/h`;
  else if (windBin.maxKmh) kmhs = `<= ${windBin.maxKmh} km/h`;
  return `BFT ${windBin.bfts.join(" to ")}<br>${kts} or ${kmhs}`;
}

/**
 * prepare name for a wave bin
 */
export function getWaveName(waveBin: WaveBinType): string {
  let ms = "";
  if (waveBin.minM && waveBin.maxM) ms = `${waveBin.minM}-${waveBin.maxM} m`;
  else if (waveBin.minM) ms = `>= ${waveBin.minM} m`;
  else if (waveBin.maxM) ms = `<= ${waveBin.maxM} m`;
  return `${waveBin.label}<br>Douglas degree ${waveBin.dgs.join(
    " to "
  )}<br>${ms} wave height`;
}

/**
 * get hex color for a certain temperature in degrees celsius
 */
export function getTmpColor(celsius: number): string {
  return tmpBins.filter((d) => d.maxC >= celsius && d.minC < celsius)[0].color;
}

/**
 * get hex color for a certain sea temperature in degrees celsius
 */
export function getSeatmpColor(celsius: number): string {
  return seatmpBins.filter((d) => d.maxC >= celsius && d.minC < celsius)[0]
    .color;
}
