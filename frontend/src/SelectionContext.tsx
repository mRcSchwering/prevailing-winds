import React from "react";
import { Range } from "./Map";
import { INIT_ZOOM } from "./constants";
import { suggestAreaFactor } from "./util";

type SelectionContextType = {
  pos: { lat: number; lng: number } | null;
  rect: { lats: Range; lngs: Range } | null;
  zoomLvl: number;
  areaFactor: number;
  updatePos: (d: MapClickType) => void;
  updateZoom: (d: number) => void;
};

const defaultContext = {
  pos: null,
  rect: null,
  zoomLvl: INIT_ZOOM,
  areaFactor: suggestAreaFactor(INIT_ZOOM),
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
  rect: { lats: Range; lngs: Range } | null;
  zoomLvl: number;
  areaFactor: number;
};

type MapClickType = {
  lat: number;
  lng: number;
  lats: Range;
  lngs: Range;
};

// TODO: areafactor ist einen click hinter zoom

export function SelectionContextProvider(props: SelectionContextProviderProps) {
  const [state, setState] = React.useState<SelectionContextStateType>({
    pos: null,
    rect: null,
    zoomLvl: INIT_ZOOM,
    areaFactor: suggestAreaFactor(INIT_ZOOM),
  });

  function updatePos({ lat, lng, lats, lngs }: MapClickType) {
    setState((prev) => ({
      ...prev,
      pos: { lat, lng },
      rect: { lats, lngs },
      areaFactor: suggestAreaFactor(prev.zoomLvl),
    }));
  }

  function updateZoom(lvl: number) {
    setState((prev) => ({
      ...prev,
      zoomLvl: lvl,
    }));
  }

  return (
    <SelectionContext.Provider value={{ ...state, updatePos, updateZoom }}>
      {props.children}
    </SelectionContext.Provider>
  );
}
