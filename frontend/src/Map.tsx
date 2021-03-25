import React from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  LayersControl,
  Rectangle,
} from "react-leaflet";
import Leaflet from "leaflet";
import { getFloor, getCeil, excludePoles } from "./util";
import { SelectionContext } from "./SelectionContext";
import { INIT_ZOOM } from "./constants";

export const INIT_POS: [number, number] = [46.0, -6.0];

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

export type Range = [number, number];

type MarkerType = {
  bottomLeft: Range;
  topRight: Range;
} | null;

function AreaMarker(): JSX.Element | null {
  const [marker, setMarker] = React.useState<MarkerType>(null);
  const { updatePos, areaFactor } = React.useContext(SelectionContext);

  function handleSetMarker(lats: Range, lngs: Range) {
    const bottomLeft: Range = [lats[0], lngs[0]];
    const topRight: Range = [lats[1], lngs[1]];
    setMarker({
      bottomLeft: bottomLeft,
      topRight: topRight,
    });
  }

  useMapEvents({
    click: (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const lats: Range = [
        excludePoles(getFloor(lat, areaFactor)),
        excludePoles(getCeil(lat, areaFactor)),
      ];
      const lngs: Range = [getFloor(lng, areaFactor), getCeil(lng, areaFactor)];
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
      style={{ flex: 1, height: "100%" }}
      center={INIT_POS}
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
      <AreaMarker />
      <ZoomEndEvent trigger={handleOnZoomEnd} />
    </MapContainer>
  );
}
