import React from "react";
import { INIT_ZOOM, Tuple } from "./constants";

type SelectionContextType = {
  pos: { lat: number; lng: number } | null;
  rect: { lats: Tuple; lngs: Tuple } | null;
  zoomLvl: number;
  posZoomLvl: number | null;
  updatePos: (d: MapClickType) => void;
  updateZoom: (d: number) => void;
};

const defaultContext = {
  pos: null,
  rect: null,
  zoomLvl: INIT_ZOOM,
  posZoomLvl: null,
  updatePos: () => {},
  updateZoom: () => {},
};

export const SelectionContext = React.createContext<SelectionContextType>(
  defaultContext
);

type SelectionContextProviderProps = {
  children: React.ReactNode;
};

type SelectionContextStateType = {
  pos: { lat: number; lng: number } | null;
  rect: { lats: Tuple; lngs: Tuple } | null;
  posZoomLvl: number | null;
};

type MapClickType = {
  lat: number;
  lng: number;
  lats: Tuple;
  lngs: Tuple;
};

export function SelectionContextProvider(props: SelectionContextProviderProps) {
  const [zoom, setZoom] = React.useState<number>(INIT_ZOOM);
  const [state, setState] = React.useState<SelectionContextStateType>({
    pos: null,
    rect: null,
    posZoomLvl: null,
  });

  function updatePos({ lat, lng, lats, lngs }: MapClickType) {
    setState((prev) => ({
      ...prev,
      pos: { lat, lng },
      rect: { lats, lngs },
      posZoomLvl: zoom,
    }));
  }

  function updateZoom(lvl: number) {
    setZoom(lvl);
  }

  return (
    <SelectionContext.Provider
      value={{ ...state, updatePos, updateZoom, zoomLvl: zoom }}
    >
      {props.children}
    </SelectionContext.Provider>
  );
}
