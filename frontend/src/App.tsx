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
import { Notification, FormClose } from "grommet-icons";
import { useTestPkl, TestPklData } from "./queries";
import Plot from "react-plotly.js";

const sampleData = [
  {
    r: [
      20.0,
      7.5,
      15.0,
      22.5,
      2.5,
      2.5,
      12.5,
      22.5,
      20.0,
      7.5,
      15.0,
      22.5,
      2.5,
      2.5,
      12.5,
      22.5,
    ],
    theta: [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "EES",
      "ES",
      "SES",
      "S",
      "SWS",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
    name: "< 5 m/s",
    marker: { color: "rgb(242,240,247)" },
    type: "barpolar",
  },
  {
    r: [
      40.0,
      30.0,
      30.0,
      35.0,
      7.5,
      7.5,
      32.5,
      40.0,
      40.0,
      30.0,
      30.0,
      35.0,
      7.5,
      7.5,
      32.5,
      40.0,
    ],
    theta: [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "EES",
      "ES",
      "SES",
      "S",
      "SWS",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
    name: "5-8 m/s",
    marker: { color: "rgb(203,201,226)" },
    type: "barpolar",
  },
  {
    r: [
      57.5,
      50.0,
      45.0,
      35.0,
      20.0,
      22.5,
      37.5,
      55.0,
      57.5,
      50.0,
      45.0,
      35.0,
      20.0,
      22.5,
      37.5,
      55.0,
    ],
    theta: [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "EES",
      "ES",
      "SES",
      "S",
      "SWS",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
    name: "8-11 m/s",
    marker: { color: "rgb(158,154,200)" },
    type: "barpolar",
  },
  {
    r: [
      50.0,
      72.5,
      70.0,
      45.0,
      22.5,
      42.5,
      40.0,
      62.5,
      77.5,
      72.5,
      70.0,
      45.0,
      22.5,
      42.5,
      40.0,
      62.5,
    ],
    theta: [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "EES",
      "ES",
      "SES",
      "S",
      "SWS",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
    name: "11-14 m/s",
    marker: { color: "rgb(106,81,163)" },
    type: "barpolar",
  },
];

const layout = {
  title: "asd",
  font: { size: 16 },
  showlegend: true,
  legend: {
    x: 0.7,
    y: -0.5,
  },
  polar: {
    barmode: "stack",
    bargap: 0,
    radialaxis: { visible: false },
    angularaxis: { direction: "clockwise" },
  },
  width: 400,
  height: 480,
};

const config = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: [
    "zoom2d",
    "lasso2d",
    "zoomIn2d",
    "zoomOut2d",
    "select2d",
  ],
};

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

function AppBody(): JSX.Element {
  return (
    <Box flex align="center" justify="center">
      app body
    </Box>
  );
}

function SideBarContent(props: {
  data?: TestPklData;
  loadData: () => void;
}): JSX.Element {
  return (
    <>
      sidebar
      <Button primary label="get data" onClick={props.loadData} />
      <Text>N Records: {props.data?.length}</Text>
      <Plot data={sampleData} layout={layout} config={config} />
    </>
  );
}

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [loadTestPkl, { data }] = useTestPkl();
  const size = React.useContext(ResponsiveContext);

  return (
    <Box fill>
      <AppBar>
        <Heading level="3" margin="none">
          My App
        </Heading>
        <Button
          icon={<Notification />}
          onClick={() => setShowSidebar(!showSidebar)}
        />
      </AppBar>
      <Box direction="row" flex overflow={{ horizontal: "hidden" }}>
        <AppBody />
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
              <SideBarContent data={data} loadData={loadTestPkl} />
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
              <SideBarContent data={data} loadData={loadTestPkl} />
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
