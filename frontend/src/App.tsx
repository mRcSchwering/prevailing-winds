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
} from "grommet";
import { Analytics, FormClose } from "grommet-icons";
import Map, { INIT_ZOOM, Range } from "./Map";
import { suggestAreaFactor, factor2area } from "./util";
import { useMeta, useWinds } from "./queries";
import SideBarContent from "./SideBarContent";

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

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [pos, setPos] = React.useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zoom, setZoom] = React.useState<number>(INIT_ZOOM);
  const size = React.useContext(ResponsiveContext);
  const initFactor = suggestAreaFactor(zoom);
  const [areaFactor, setAreaFactor] = React.useState(initFactor);
  const [selectedArea, setSelectedArea] = React.useState("");
  const metaResp = useMeta();
  const [timeRange, setTimeRange] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [loadWinds, windsResp] = useWinds();

  React.useEffect(() => {
    if (metaResp.data?.timeRanges && metaResp.data?.months) {
      setTimeRange(metaResp.data.timeRanges[0]);
      setMonth(metaResp.data.months[0]);
    }
  }, [metaResp.data?.timeRanges, metaResp.data?.months]);

  function handleMapClick(lat: number, lng: number, lats: Range, lngs: Range) {
    setPos({ lat, lng });
    setSelectedArea(factor2area(areaFactor));
    if (timeRange !== "" && month !== "") {
      loadWinds({
        variables: {
          timeRange: timeRange,
          month: month,
          fromLat: lats[0],
          toLat: lats[1],
          fromLng: lngs[0],
          toLng: lngs[1],
        },
      });
    }
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
              justify="start"
            >
              <SideBarContent
                windResp={windsResp}
                selectedTimeRange={timeRange}
                selectedMonth={month}
                metaResp={metaResp}
                pos={pos}
                area={selectedArea}
                onMonthChange={setMonth}
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
                windResp={windsResp}
                selectedTimeRange={timeRange}
                selectedMonth={month}
                metaResp={metaResp}
                pos={pos}
                area={selectedArea}
                onMonthChange={setMonth}
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
