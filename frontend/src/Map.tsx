import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
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
};

function MyComponent(props: {
  onClick: (lat: number, lng: number) => void;
}): null {
  const map = useMapEvents({
    click: (e) => {
      props.onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type MarkerType = {
  lat: number;
  lng: number;
  text: JSX.Element;
} | null;

export default function Map(): JSX.Element {
  const [marker, setMarker] = React.useState<MarkerType>(null);
  const [provider, setProvider] = React.useState<"stadia" | "esri">("stadia");

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

  return (
    <MapContainer
      style={{ flex: 1, height: "100%" }}
      center={[46.0, -6.0]}
      zoom={6}
      scrollWheelZoom={true}
    >
      <TileLayer {...PROVIDERS[provider]} />
      <MyComponent onClick={handleSetMarker} />
      {marker && (
        <Marker position={[marker.lat, marker.lng]}>
          <Popup>{marker.text}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
