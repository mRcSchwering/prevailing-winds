import { EXCLUSION_ZONES, Tuple } from "./constants";

/**
 * Some formatting functions for DMS
 */

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
  return 1;
}

/**
 * Functions for getting lats/lngs for bounding rectangle
 * given a position and a padding factor
 */

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
