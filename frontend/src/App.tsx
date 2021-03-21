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
  RadioButtonGroup,
} from "grommet";
import { Analytics, FormClose } from "grommet-icons";
import { useTestPkl, TestPklData } from "./queries";
import Map from "./Map";
import Chart from "./Chart";

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
  data?: TestPklData;
  loadData: () => void;
  mapProvider: "stadia" | "esri";
  onChangeMapProvider: (s: "stadia" | "esri") => void;
}): JSX.Element {
  function handleMapProviderChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.onChangeMapProvider(e.target.value as "stadia" | "esri");
  }

  return (
    <>
      sidebar
      <Button primary label="get data" onClick={props.loadData} />
      <Text>N Records: {props.data?.length}</Text>
      <Chart />
      <RadioButtonGroup
        name="mapProvider"
        value={props.mapProvider}
        options={["stadia", "esri"]}
        onChange={handleMapProviderChange}
      />
    </>
  );
}

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [loadTestPkl, { data }] = useTestPkl();
  const size = React.useContext(ResponsiveContext);
  const [mapProvider, setMapProvider] = React.useState<"stadia" | "esri">(
    "stadia"
  );

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
          <Map provider={mapProvider} />
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
                data={data}
                loadData={loadTestPkl}
                mapProvider={mapProvider}
                onChangeMapProvider={setMapProvider}
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
                data={data}
                loadData={loadTestPkl}
                mapProvider={mapProvider}
                onChangeMapProvider={setMapProvider}
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
