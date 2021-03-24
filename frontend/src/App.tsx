import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  Box,
  Button,
  Heading,
  Collapsible,
  Grommet,
  ResponsiveContext,
  Layer,
  Text,
  RangeInput,
} from "grommet";
import { Analytics, FormClose } from "grommet-icons";
import Map, { INIT_ZOOM, Range } from "./Map";
import Chart from "./Chart";
import { convertDMS, suggestAreaFactor, factor2area } from "./util";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const theme = {
  global: {
    colors: {
      brand: "#228BE6",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

function AppBar(props: any): JSX.Element {
  return (
    <Box
      tag="header"
      direction="row"
      align="center"
      justify="between"
      background="brand"
      pad={{ left: "medium", right: "small", vertical: "small" }}
      elevation="medium"
      style={{ zIndex: 1 }}
      {...props}
    />
  );
}

type SideBarContentProps = {
  zoom: number;
  pos: { lat: number; lng: number } | null;
  areaFactor: number;
  onAreaFactorChange?: (factor: number) => void;
};

function SideBarContent(props: SideBarContentProps): JSX.Element {
  const zoom = `${props.zoom} x`;
  const pos = props.pos ? convertDMS(props.pos.lat, props.pos.lng) : "-";

  function handleChangeAreaFactor(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const factor = parseInt(e.target.value);
    if (props.onAreaFactorChange) props.onAreaFactorChange(factor);
  }

  return (
    <>
      <RangeInput
        value={props.areaFactor}
        onChange={handleChangeAreaFactor}
        min={1}
        max={4}
      />
      <Text>
        Pos: {pos}
        <br />
        Zoom: {zoom}
        <br />
        Area Factor: {props.areaFactor}
        <br />
        Area: {factor2area(props.areaFactor)} M<sup>2</sup>
      </Text>
      <Chart />
    </>
  );
}

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [pos, setPos] = React.useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zoom, setZoom] = React.useState<number>(INIT_ZOOM);
  const size = React.useContext(ResponsiveContext);
  const initFactor = suggestAreaFactor(zoom);
  const [areaFactor, setAreaFactor] = React.useState(initFactor);

  function handleMapClick(lat: number, lng: number, lats: Range, lngs: Range) {
    setPos({ lat, lng });
  }

  function handleMapZoom(lvl: number) {
    setZoom(lvl);
    setAreaFactor(suggestAreaFactor(lvl));
  }

  return (
    <Box fill>
      <AppBar>
        <Heading level="3" margin="none">
          My App
        </Heading>
        {size === "small" && (
          <Button
            icon={<Analytics />}
            onClick={() => setShowSidebar(!showSidebar)}
          />
        )}
      </AppBar>
      <Box flex direction="row" overflow={{ horizontal: "hidden" }}>
        <Box flex justify="center">
          <Map
            areaFactor={areaFactor}
            onClick={handleMapClick}
            onZoomEnd={handleMapZoom}
          />
        </Box>
        {!showSidebar || size !== "small" ? (
          <Collapsible direction="horizontal" open={showSidebar}>
            <Box
              flex
              width="400px"
              background="light-2"
              elevation="small"
              align="center"
              justify="center"
            >
              <SideBarContent
                pos={pos}
                zoom={zoom}
                areaFactor={areaFactor}
                onAreaFactorChange={setAreaFactor}
              />
            </Box>
          </Collapsible>
        ) : (
          <Layer>
            <Box
              background="light-2"
              tag="header"
              justify="end"
              align="center"
              direction="row"
            >
              <Button
                icon={<FormClose />}
                onClick={() => setShowSidebar(false)}
              />
            </Box>
            <Box fill background="light-2" align="center" justify="center">
              <SideBarContent
                pos={pos}
                zoom={zoom}
                areaFactor={areaFactor}
                onAreaFactorChange={setAreaFactor}
              />
            </Box>
          </Layer>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Grommet theme={theme} full>
        <AppContent />
      </Grommet>
    </ApolloProvider>
  );
}

export default App;
