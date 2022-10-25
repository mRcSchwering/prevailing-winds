import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Rectangle,
} from "react-leaflet";
import Leaflet from "leaflet";
import { SelectionContext } from "./SelectionContext";
import { INIT_ZOOM, INIT_POS, Tuple, EXCLUSION_ZONES } from "./constants";

// from https://leaflet-extras.github.io/leaflet-providers/preview/
const PROVIDERS = {
  esri: {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 12,
  },
  openSeaMap: {
    attribution:
      'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
    url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
    maxZoom: 12,
  },
};

const cosine = (d: number) => Math.cos((d * Math.PI) / 180);
const getFloor = (d: number, p: number) => d - 0.5 * p;
const getCeil = (d: number, p: number) => d + 0.5 * p;
const exclPoles = (d: number) =>
  Math.min(Math.max(d, EXCLUSION_ZONES[0]), EXCLUSION_ZONES[1]);

function suggestPadFactor(zoomLvl: number): number {
  if (zoomLvl <= 5) return 4;
  if (zoomLvl <= 6) return 3;
  if (zoomLvl <= 7) return 2;
  if (zoomLvl <= 8) return 1;
  return 0.5;
}

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
        exclPoles(getFloor(lat, pad)),
        exclPoles(getCeil(lat, pad)),
      ];
      const lngs: Tuple = [getFloor(lng, adjPad), getCeil(lng, adjPad)];
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
