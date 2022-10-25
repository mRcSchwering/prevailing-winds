import { WaveBinType } from "./constants";

function adjustLng(lng: number): number {
  const lngAdj = lng % 360;
  if (lngAdj > 180) return (lngAdj % 180) - 180;
  if (lngAdj < -180) return (lngAdj % 180) + 180;
  return lngAdj;
}

function toDegreesMinutesSeconds(coordinate: number): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  return degrees + "° " + minutes + "' " + seconds + "''";
}

/**
 * Convert a numeric latitude to degrees, minutes, seconds with cardinal sign.
 * E.g. `52.51456` to `"52° 30' 52'' N"`
 */
export function convertLatDMS(lat: number): string {
  const val = toDegreesMinutesSeconds(lat);
  const card = lat >= 0 ? "N" : "S";
  return val + " " + card;
}

/**
 * Convert a numeric longitude to degrees, minutes, seconds with cardinal sign.
 * Handle numbers < -180 or > 180 as rotating around earth eastwards or westwards.
 * E.g. `-513.4059` to `"153° 24' 21'' W"`
 */
export function convertLngDMS(lng: number): string {
  let lngAdj = adjustLng(lng);
  const val = toDegreesMinutesSeconds(lngAdj);
  const card = lngAdj >= 0 ? "E" : "W";
  return val + " " + card;
}

/**
 * Convert numeric longitude and latitude to degrees, minutes, seconds with cardinal signs.
 * Handles longitude < -180 or > 180 as rotating around earth eastwards or westwards.
 * E.g. `52.51456, -513.4059` to `"52° 30' 52'' N - 153° 24' 21'' W"`
 */
export function convertDMS(lat: number, lng: number): string {
  const latitude = toDegreesMinutesSeconds(lat);
  const latitudeCardinal = lat >= 0 ? "N" : "S";

  let lngAdj = adjustLng(lng);
  const longitude = toDegreesMinutesSeconds(lngAdj);
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
 * Convert temperature from Celsius to Fahrenheit
 */
export function celsius2Fahrenheit(cel: number): number {
  return (cel * 9) / 5 + 32;
}

/**
 * Convert length in mm to inch
 */
export function mm2inch(mm: number): number {
  return mm / 25.4;
}

/**
 * Convert meter to feet
 */
export function m2ft(m: number): number {
  return m * 3.281;
}

/**
 * Format temperature in degrees Celsius
 */
export function fmtCelsius(d: number | null): string {
  return `${d ? Math.round(d) : "-"}°C`;
}

/**
 * Format temperature in degrees Fahrenheit
 */
export function fmtFahrenheit(d: number | null): string {
  return `${d ? Math.round(d) : "-"}°F`;
}

/**
 * Format length as mm
 */
export function fmtMm(d: number | null): string {
  return `${d ? Math.round(d) : "-"}mm`;
}

/**
 * Format length as inch
 */
export function fmtIn(d: number | null): string {
  return `${d ? Math.round(d) : "-"}in`;
}

/**
 * Format velocity as knots
 */
export function fmtKt(d: number | null): string {
  return `${d ? Math.round(d) : "-"}kt`;
}

/**
 * Format frequency as percentage (will be multiplied by 100)
 */
export function fmtFreq(d: number | null): string {
  return `${d ? Math.round(d * 100) : "-"}%`;
}

/**
 * Format length as meter
 */
export function fmtM(d: number | null): string {
  return `${d ? Math.round(d * 10) / 10 : "-"}m`;
}

/**
 * Format length as foot
 */
export function fmtFt(d: number | null): string {
  return `${d ? Math.round(d) : "-"}ft`;
}

/**
 * Format numeric categories
 */
export function fmtNumCats(d: number[]): string {
  if (d.length === 0) return "-";
  return d.length > 1 ? `${Math.min(...d)} to ${Math.max(...d)}` : `${d[0]}`;
}

/**
 * Format numeric range described by upper and lower boundary
 */
export function fmtNumRange(lo: number | null, hi: number | null): string {
  if (lo === null && hi === null) return "-";
  if (lo !== null && hi === null) return `>${lo}`;
  if (lo === null && hi !== null) return `<${hi}`;
  return `${lo}-${hi}`;
}

/**
 * prepare name for a wave bin
 */
export function getWaveName(waveBin: WaveBinType): string {
  let m = fmtNumRange(waveBin.minM, waveBin.maxM);
  const dgs = fmtNumCats(waveBin.dgs);
  return `${waveBin.label}<br>Douglas degree ${dgs}<br>${m}m wave height`;
}
