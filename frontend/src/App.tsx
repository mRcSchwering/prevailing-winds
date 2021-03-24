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
} from "grommet";
import { Analytics, FormClose } from "grommet-icons";
import Map, { INIT_ZOOM, Range } from "./Map";
import Chart from "./Chart";
import { convertDMS } from "./util";

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

function SideBarContent(props: {
  zoom: number;
  pos: { lat: number; lng: number } | null;
}): JSX.Element {
  const zoom = `${props.zoom} x`;
  const pos = props.pos ? convertDMS(props.pos.lat, props.pos.lng) : "-";

  return (
    <>
      <Text>
        Pos: {pos}
        <br />
        Zoom: {zoom}
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

  function handleMapClick(lat: number, lng: number, lats: Range, lngs: Range) {
    setPos({ lat, lng });
    console.log(lats, lngs);
  }

  function handleMapZoom(lvl: number) {
    setZoom(lvl);
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
          <Map onClick={handleMapClick} onZoomEnd={handleMapZoom} />
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
              <SideBarContent pos={pos} zoom={zoom} />
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
              <SideBarContent pos={pos} zoom={zoom} />
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
