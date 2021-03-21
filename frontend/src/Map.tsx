import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from "react-leaflet";
import Leaflet from "leaflet";
import { convertLatDMS, convertLngDMS } from "./util";

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

type MarkerType = {
  lat: number;
  lng: number;
  text: JSX.Element;
} | null;

type LocationMarkerProps = {
  onClick: (lat: number, lng: number) => void;
};

function LocationMarker(props: LocationMarkerProps): JSX.Element | null {
  const [marker, setMarker] = React.useState<MarkerType>(null);

  function handleSetMarker(lat: number, lng: number) {
    const latTxt = convertLatDMS(lat);
    const lngTxt = convertLngDMS(lng);
    setMarker({
      lat,
      lng,
      text: (
        <span>
          {latTxt}
          <br />
          {lngTxt}
        </span>
      ),
    });
  }

  useMapEvents({
    click: (e) => {
      handleSetMarker(e.latlng.lat, e.latlng.lng);
      if (props.onClick) {
        props.onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return marker ? (
    <Marker position={[marker.lat, marker.lng]}>
      <Popup>{marker.text}</Popup>
    </Marker>
  ) : null;
}

type MapProps = {
  onClick?: (lat: number, lng: number) => void;
  onZoomEnd?: (lvl: number) => void;
};

export default function Map(props: MapProps): JSX.Element {
  const [map, setMap] = React.useState<Leaflet.Map | null>(null);

  function handleSetMarker(lat: number, lng: number) {
    if (props.onClick) props.onClick(lat, lng);
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
        <LayersControl.BaseLayer checked name="stadia">
          <TileLayer {...PROVIDERS.stadia} />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="esri">
          <TileLayer {...PROVIDERS.esri} />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay name="OpenSeaMap">
          <TileLayer {...PROVIDERS.openSeaMap} />
        </LayersControl.Overlay>
      </LayersControl>
      <LocationMarker onClick={handleSetMarker} />
      <ZoomEndEvent trigger={handleOnZoomEnd} />
    </MapContainer>
  );
}
