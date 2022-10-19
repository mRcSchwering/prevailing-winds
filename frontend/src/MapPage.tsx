import React from "react";
import { Box, Button, ResponsiveContext, Layer } from "grommet";
import { FormClose } from "grommet-icons";
import { useMeta } from "./queries";
import Map from "./Map";
import SideBar from "./SideBar";
import AppBar from "./AppBar";
import svg from "./windRose-white.svg";

function Icon(): JSX.Element {
  return (
    <Box width="40px" margin="none">
      <img src={svg} alt="windrose" />
    </Box>
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
    <Delayed waitBeforeShow={0.1}>
      <Box
        width="400px"
        background="white"
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
        background="white"
        tag="header"
        justify="end"
        align="center"
        direction="row"
      >
        <Button icon={<FormClose />} onClick={props.hide} />
      </Box>
      <Box fill background="white" align="center" justify="start">
        {props.children}
      </Box>
    </Layer>
  );
}

export default function MapPage(): JSX.Element {
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
        {size === "small" && (
          <Button
            margin="none"
            plain={true}
            icon={<Icon />}
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
