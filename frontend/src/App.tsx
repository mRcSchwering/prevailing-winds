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
  RangeInput,
  Select,
} from "grommet";
import Spinner from "./SpinnerBrand";
import { Analytics, FormClose } from "grommet-icons";
import Map, { INIT_ZOOM, Range } from "./Map";
import Chart from "./Chart";
import { convertDMS, suggestAreaFactor, factor2area } from "./util";
import { useMeta, useMetaResp, useWinds, useWindResp } from "./queries";

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
  windResp: useWindResp;
  metaResp: useMetaResp;
  selectedTimeRange: string;
  selectedMonth: string;
  pos: { lat: number; lng: number } | null;
  areaFactor: number;
  onAreaFactorChange?: (factor: number) => void;
  onTimeRangeChange?: (timeRange: string) => void;
  onMonthChange?: (month: string) => void;
};

function SideBarContent(props: SideBarContentProps): JSX.Element {
  const pos = props.pos ? convertDMS(props.pos.lat, props.pos.lng) : "-";

  function handleChangeAreaFactor(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const factor = parseInt(e.target.value);
    if (props.onAreaFactorChange) props.onAreaFactorChange(factor);
  }

  function handleTimeRangeChange({ option }: { option: string }) {
    if (props.onTimeRangeChange) props.onTimeRangeChange(option);
  }

  function handleMonthChange({ option }: { option: string }) {
    if (props.onMonthChange) props.onMonthChange(option);
  }

  let inputs = <Spinner />;
  if (!props.metaResp.loading) {
    if (props.metaResp.data) {
      const timeRanges = props.metaResp.data.timeRanges;
      const months = props.metaResp.data.months;
      inputs = (
        <>
          <Select
            options={timeRanges}
            value={props.selectedTimeRange}
            onChange={handleTimeRangeChange}
          />
          <Select
            options={months}
            value={props.selectedMonth}
            onChange={handleMonthChange}
          />
        </>
      );
    }
  }

  return (
    <>
      <Box pad="medium">
        <Box direction="row">{inputs}</Box>
        <strong>{pos}</strong>
        <RangeInput
          value={props.areaFactor}
          onChange={handleChangeAreaFactor}
          min={1}
          max={4}
        />
        <span>
          area: {factor2area(props.areaFactor)} M<sup>2</sup>
        </span>
      </Box>
      <Chart winds={props.windResp} meta={props.metaResp} />
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
  const metaResp = useMeta();
  const [timeRange, setTimeRange] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [loadWinds, windsResp] = useWinds();

  React.useEffect(() => {
    if (metaResp.data?.timeRanges && metaResp.data?.months) {
      setTimeRange(metaResp.data.timeRanges[0]);
      setMonth(metaResp.data.months[0]);
    }
  }, [metaResp]);

  function handleMapClick(lat: number, lng: number, lats: Range, lngs: Range) {
    setPos({ lat, lng });
    if (timeRange !== "" && lats[1] - lats[0] > 0 && lngs[1] - lngs[0] > 0) {
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
              justify="center"
            >
              <SideBarContent
                windResp={windsResp}
                selectedTimeRange={timeRange}
                selectedMonth={month}
                metaResp={metaResp}
                pos={pos}
                areaFactor={areaFactor}
                onAreaFactorChange={setAreaFactor}
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
                areaFactor={areaFactor}
                onAreaFactorChange={setAreaFactor}
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
