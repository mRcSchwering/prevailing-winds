import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Rectangle,
} from "react-leaflet";
import Leaflet from "leaflet";
import {
  getLngFloor,
  getLngCeil,
  getLatFloor,
  getLatCeil,
  excludePoles,
  suggestPadFactor,
  cosine,
} from "./util";
import { SelectionContext } from "./SelectionContext";
import { INIT_ZOOM, INIT_POS, Tuple } from "./constants";

// from https://leaflet-extras.github.io/leaflet-providers/preview/
const PROVIDERS = {
  esri: {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 12,
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

function ZoomEndEvent(props: { trigger: () => void }): null {
  useMapEvents({
    zoomend: () => props.trigger(),
  });
  return null;
}

type MarkerType = {
  bottomLeft: Tuple;
  topRight: Tuple;
} | null;

function AreaMarker(): JSX.Element | null {
  const [marker, setMarker] = React.useState<MarkerType>(null);
  const { updatePos, zoomLvl } = React.useContext(SelectionContext);

  function handleSetMarker(lats: Tuple, lngs: Tuple) {
    const bottomLeft: Tuple = [lats[0], lngs[0]];
    const topRight: Tuple = [lats[1], lngs[1]];
    setMarker({
      bottomLeft: bottomLeft,
      topRight: topRight,
    });
  }

  useMapEvents({
    click: (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const pad = suggestPadFactor(zoomLvl);
      const adjPad = pad / cosine(lat);
      const lats: Tuple = [
        excludePoles(getLatFloor(lat, pad)),
        excludePoles(getLatCeil(lat, pad)),
      ];
      const lngs: Tuple = [getLngFloor(lng, adjPad), getLngCeil(lng, adjPad)];
      handleSetMarker(lats, lngs);
      updatePos({
        lat,
        lng,
        lats,
        lngs,
      });
    },
  });

  return marker ? (
    <Rectangle
      bounds={[marker.bottomLeft, marker.topRight]}
      pathOptions={{
        stroke: false,
        fill: true,
        fillColor: "black",
      }}
      interactive={false}
    />
  ) : null;
}

export default function Map(): JSX.Element {
  const [map, setMap] = React.useState<Leaflet.Map | null>(null);
  const { updateZoom } = React.useContext(SelectionContext);

  function handleOnZoomEnd() {
    if (map) {
      const lvl = map.getZoom();
      updateZoom(lvl);
    }
  }

  return (
    <MapContainer
      style={{ flex: 1, height: "100%", zIndex: 1 }}
      center={INIT_POS}
      zoom={INIT_ZOOM}
      whenCreated={setMap}
      scrollWheelZoom={true}
    >
      <TileLayer {...PROVIDERS.esri} zIndex={1} />
      <TileLayer {...PROVIDERS.openSeaMap} zIndex={2} />
      <AreaMarker />
      <ZoomEndEvent trigger={handleOnZoomEnd} />
    </MapContainer>
  );
}
