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
  Grommet,
  ResponsiveContext,
  Layer,
} from "grommet";
import { Analytics, FormClose } from "grommet-icons";
import { useMeta } from "./queries";
import Map from "./Map";
import SideBar from "./SideBar";
import { SelectionContextProvider } from "./SelectionContext";

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
      style={{ zIndex: "1" }}
      {...props}
    />
  );
}

type DelayedProps = {
  waitBeforeShow: number;
  children: React.ReactNode;
};

/**
 * Using this as a tool to let the Map load first before
 * the sidebar loads.
 * Problem is, size is always on medium first, which means
 * there will be an attempt to render the sidebar in the beginning.
 * Which means the map will leave some space for the sidebar.
 * On a mobile phone this will take the entire view.
 */
function Delayed(props: DelayedProps): JSX.Element {
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setHidden(false);
    }, props.waitBeforeShow);
  }, [props.waitBeforeShow]);

  return hidden ? <></> : <>{props.children}</>;
}

type StaticContainerProps = {
  children: React.ReactNode;
};

function StaticContainer(props: StaticContainerProps): JSX.Element {
  return (
    <Delayed waitBeforeShow={0}>
      <Box
        width="400px"
        background="light-2"
        elevation="small"
        align="center"
        justify="start"
      >
        {props.children}
      </Box>
    </Delayed>
  );
}

type LayerContainerProps = {
  show: boolean;
  hide: () => void;
  children: React.ReactNode;
};

function LayerContainer(props: LayerContainerProps): JSX.Element | null {
  if (!props.show) return null;
  return (
    <Layer>
      <Box
        background="light-2"
        tag="header"
        justify="end"
        align="center"
        direction="row"
      >
        <Button icon={<FormClose />} onClick={props.hide} />
      </Box>
      <Box fill background="light-2" align="center" justify="start">
        {props.children}
      </Box>
    </Layer>
  );
}

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const size = React.useContext(ResponsiveContext);

  const metaResp = useMeta();
  const [timeRange, setTimeRange] = React.useState("");
  const [month, setMonth] = React.useState("");

  React.useEffect(() => {
    if (metaResp.data?.timeRanges && metaResp.data?.months) {
      setTimeRange(metaResp.data.timeRanges[0]);
      setMonth(metaResp.data.months[0]);
    }
  }, [metaResp.data?.timeRanges, metaResp.data?.months]);

  const sideBar = (
    <SideBar
      metaResp={metaResp}
      timeRange={timeRange}
      month={month}
      onTimeRangeChange={setTimeRange}
      onMonthChange={setMonth}
    />
  );

  return (
    <Box fill>
      <AppBar>
        <Heading level="3" margin="none">
          Map
        </Heading>
        {size === "small" && (
          <Button
            icon={<Analytics />}
            onClick={() => setShowSidebar(!showSidebar)}
          />
        )}
      </AppBar>
      <Box flex direction="row" overflow={{ horizontal: "hidden" }}>
        <Map />
        {size !== "small" ? (
          <StaticContainer>{sideBar}</StaticContainer>
        ) : (
          <LayerContainer show={showSidebar} hide={() => setShowSidebar(false)}>
            {sideBar}
          </LayerContainer>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <SelectionContextProvider>
        <Grommet theme={theme} full>
          <AppContent />
        </Grommet>
      </SelectionContextProvider>
    </ApolloProvider>
  );
}

export default App;
