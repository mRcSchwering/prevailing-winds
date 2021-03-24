export function toDegreesMinutesAndSeconds(coordinate: number): string {
  var absolute = Math.abs(coordinate);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  return degrees + "° " + minutes + "' " + seconds + "''";
}

export function convertLatDMS(lat: number): string {
  var val = toDegreesMinutesAndSeconds(lat);
  var card = lat >= 0 ? "N" : "S";
  return val + " " + card;
}

export function convertLngDMS(lng: number): string {
  var val = toDegreesMinutesAndSeconds(lng);
  var card = lng >= 0 ? "E" : "W";
  return val + " " + card;
}

export function convertDMS(lat: number, lng: number): string {
  var latitude = toDegreesMinutesAndSeconds(lat);
  var latitudeCardinal = lat >= 0 ? "N" : "S";

  var longitude = toDegreesMinutesAndSeconds(lng);
  var longitudeCardinal = lng >= 0 ? "E" : "W";

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

export function getFloor(d: number): number {
  return Math.round(d) - 0.5;
}

export function getCeil(d: number): number {
  return Math.round(d) + 0.5;
}
