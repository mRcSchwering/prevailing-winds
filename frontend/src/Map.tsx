import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Rectangle,
} from "react-leaflet";
import Leaflet from "leaflet";
import { convertLatDMS, convertLngDMS, getFloor, getCeil } from "./util";

// from https://leaflet-extras.github.io/leaflet-providers/preview/
const PROVIDERS = {
  esri: {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
  },
  stadia: {
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    maxZoom: 20,
  },
  openSeaMap: {
    attribution:
      'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
    url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
  },
};

export const INIT_ZOOM = 6;

function ZoomEndEvent(props: { trigger: () => void }): null {
  useMapEvents({
    zoomend: () => props.trigger(),
  });
  return null;
}

export type Range = [number, number];

type MarkerType = {
  lat: number;
  lng: number;
  text: JSX.Element;
  bottomLeft: Range;
  topRight: Range;
} | null;

type AreaMarkerProps = {
  onClick: (lat: number, lng: number, latRange: Range, lngRange: Range) => void;
};

function AreaMarker(props: AreaMarkerProps): JSX.Element | null {
  const [marker, setMarker] = React.useState<MarkerType>(null);

  function handleSetMarker(lat: number, lng: number, lats: Range, lngs: Range) {
    const bottomLeft: Range = [lats[0], lngs[0]];
    const topRight: Range = [lats[1], lngs[1]];
    setMarker({
      lat,
      lng,
      bottomLeft: bottomLeft,
      topRight: topRight,
      text: (
        <div>
          <strong>
            {convertLatDMS(lat)}
            <br />
            {convertLngDMS(lng)}
          </strong>
        </div>
      ),
    });
  }

  useMapEvents({
    click: (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const lats: Range = [getFloor(lat), getCeil(lat)];
      const lngs: Range = [getFloor(lng), getCeil(lng)];
      handleSetMarker(lat, lng, lats, lngs);
      if (props.onClick) {
        props.onClick(lat, lng, lats, lngs);
      }
    },
  });

  const blackOptions = { stroke: false, fill: true, fillColor: "black" };

  return marker ? (
    <>
      <Rectangle
        bounds={[marker.bottomLeft, marker.topRight]}
        pathOptions={blackOptions}
      />
      <Marker position={[marker.lat, marker.lng]}>
        <Popup>{marker.text}</Popup>
      </Marker>
    </>
  ) : null;
}

type MapProps = {
  onClick?: (
    lat: number,
    lng: number,
    latRange: Range,
    lngRange: Range
  ) => void;
  onZoomEnd?: (lvl: number) => void;
};

export default function Map(props: MapProps): JSX.Element {
  const [map, setMap] = React.useState<Leaflet.Map | null>(null);

  function handleSetMarker(
    lat: number,
    lng: number,
    latRange: Range,
    lngRange: Range
  ) {
    if (props.onClick) props.onClick(lat, lng, latRange, lngRange);
  }

  function handleOnZoomEnd() {
    if (map) {
      const lvl = map.getZoom();
      if (props.onZoomEnd) props.onZoomEnd(lvl);
    }
  }

  return (
    <MapContainer
      style={{ flex: 1, height: "100%" }}
      center={[46.0, -6.0]}
      zoom={INIT_ZOOM}
      whenCreated={setMap}
      scrollWheelZoom={true}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="esri">
          <TileLayer {...PROVIDERS.esri} />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="stadia">
          <TileLayer {...PROVIDERS.stadia} />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay name="OpenSeaMap">
          <TileLayer {...PROVIDERS.openSeaMap} />
        </LayersControl.Overlay>
      </LayersControl>
      <AreaMarker onClick={handleSetMarker} />
      <ZoomEndEvent trigger={handleOnZoomEnd} />
    </MapContainer>
  );
}
