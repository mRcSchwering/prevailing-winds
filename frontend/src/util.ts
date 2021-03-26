import { EXCLUSION_ZONES, Tuple } from "./constants";

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
  const val = toDegreesMinutesAndSeconds(lng);
  const card = lng >= 0 ? "E" : "W";
  return val + " " + card;
}

export function convertDMS(lat: number, lng: number): string {
  const latitude = toDegreesMinutesAndSeconds(lat);
  const latitudeCardinal = lat >= 0 ? "N" : "S";

  const longitude = toDegreesMinutesAndSeconds(lng);
  const longitudeCardinal = lng >= 0 ? "E" : "W";

  return (
    latitude +
    " " +
    latitudeCardinal +
    "\n" +
    longitude +
    " " +
    longitudeCardinal
  );
}

export function cosine(degree: number): number {
  return Math.cos((degree * Math.PI) / 180);
}

export function suggestPadFactor(zoomLvl: number): number {
  if (zoomLvl <= 5) return 4;
  if (zoomLvl <= 6) return 3;
  if (zoomLvl <= 7) return 2;
  return 1;
}

export function getLatFloor(degree: number, pad: number): number {
  return Math.round(degree) - 0.5 * pad;
}

export function getLngFloor(degree: number, pad: number): number {
  return Math.round(degree) - 0.5 * pad;
}

export function getLatCeil(degree: number, pad: number): number {
  return Math.round(degree) + 0.5 * pad;
}

export function getLngCeil(degree: number, pad: number): number {
  return Math.round(degree) + 0.5 * pad;
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
