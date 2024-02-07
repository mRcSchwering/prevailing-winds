import React from "react";
import { Box, Select, Heading, Tabs, Tab, Text } from "grommet";
import { Spinner } from "./components";
import SummaryChart from "./SummaryChart";
import WaveChart from "./WaveChart";
import WindsChart from "./WindsChart";
import CurrentsChart from "./CurrentsChart";
import { convertDMS } from "./util";
import { useWeather, MetaRespType } from "./queries";
import { SelectionContext } from "./SelectionContext";

interface TimeRangeInputsProps {
  metaResp: MetaRespType;
  timeRange: string;
  month: string;
  onTimeRangeChange: (timeRange: string) => void;
  onMonthChange: (month: string) => void;
}

function TimeRangeInputs(props: TimeRangeInputsProps): JSX.Element {
  if (props.metaResp.loading) return <Spinner />;
  if (!props.metaResp.data)
    return <Text color="status-critical">{props.metaResp.error?.message}</Text>;

  const timeRanges = props.metaResp.data.timeRanges;
  const months = props.metaResp.data.months;

  return (
    <Box direction="row">
      <Select
        margin="xsmall"
        options={timeRanges}
        value={props.timeRange}
        onChange={({ option }) => props.onTimeRangeChange(option)}
      />
      <Select
        margin="xsmall"
        options={months}
        value={props.month}
        onChange={({ option }) => props.onMonthChange(option)}
      />
    </Box>
  );
}

function ChartContainer(props: {
  isLoading: boolean;
  hasError: boolean;
  hasData: boolean;
  children: React.ReactNode;
}): JSX.Element {
  if (props.isLoading) {
    return (
      <Box margin="medium">
        <Spinner />
      </Box>
    );
  }

  if (props.hasError) {
    return (
      <Box margin="medium">
        <Text color="status-critical" textAlign="center">
          Failed to load weather data :(
        </Text>
      </Box>
    );
  }

  if (!props.hasData) {
    return (
      <Box margin="medium">
        <Text textAlign="center">click somewhere on the chart</Text>
      </Box>
    );
  }

  return <Box>{props.children}</Box>;
}

type SideBarProps = {
  timeRange: string;
  month: string;
  metaResp: MetaRespType;
  onTimeRangeChange: (timeRange: string) => void;
  onMonthChange: (month: string) => void;
};

export default function SideBar(props: SideBarProps): JSX.Element {
  const { pos, rect } = React.useContext(SelectionContext);
  const [loadWeather, weatherResp] = useWeather();

  React.useEffect(() => {
    if (rect) {
      loadWeather({
        variables: {
          timeRange: props.timeRange,
          month: props.month,
          fromLat: rect.lats[0],
          toLat: rect.lats[1],
          fromLng: rect.lngs[0],
          toLng: rect.lngs[1],
        },
      });
    }
  }, [rect, props.timeRange, props.month, loadWeather]);

  if (!props.metaResp.data) {
    return (
      <>
        <Box pad="medium">
          <TimeRangeInputs
            metaResp={props.metaResp}
            timeRange={props.timeRange}
            month={props.month}
            onTimeRangeChange={props.onTimeRangeChange}
            onMonthChange={props.onMonthChange}
          />
        </Box>
        <Box align="center">
          <Heading level={4} margin={{ vertical: "20px" }}>
            {pos ? convertDMS(pos.lat, pos.lng) : "-"}
          </Heading>
        </Box>
      </>
    );
  }

  const height2dgs: { [key: number]: number } =
    props.metaResp.data.waveHeights.reduce(
      (o, d) => ({ ...o, [d.idx]: d.douglasDegree }),
      {}
    );

  const vel2bft: { [key: number]: number } =
    props.metaResp.data.windVelocities.reduce(
      (o, d) => ({ ...o, [d.idx]: d.beaufortNumber }),
      {}
    );

  return (
    <>
      <Box pad="medium">
        <TimeRangeInputs
          metaResp={props.metaResp}
          timeRange={props.timeRange}
          month={props.month}
          onTimeRangeChange={props.onTimeRangeChange}
          onMonthChange={props.onMonthChange}
        />
      </Box>
      <Box align="center">
        <Heading level={4} margin={{ vertical: "20px" }}>
          {pos ? convertDMS(pos.lat, pos.lng) : "-"}
        </Heading>
        <Tabs>
          <Tab title="Brief">
            <ChartContainer
              isLoading={weatherResp.loading}
              hasError={!!weatherResp.error}
              hasData={!!weatherResp.data}
            >
              {weatherResp.data && (
                <SummaryChart
                  weather={weatherResp.data}
                  height2dgs={height2dgs}
                  vel2bft={vel2bft}
                />
              )}
            </ChartContainer>
          </Tab>
          <Tab title="Wind">
            <ChartContainer
              isLoading={weatherResp.loading}
              hasError={!!weatherResp.error}
              hasData={!!weatherResp.data}
            >
              {weatherResp.data && (
                <WindsChart weather={weatherResp.data} vel2bft={vel2bft} />
              )}
            </ChartContainer>
          </Tab>
          <Tab title="Wave">
            <ChartContainer
              isLoading={weatherResp.loading}
              hasError={!!weatherResp.error}
              hasData={!!weatherResp.data}
            >
              {weatherResp.data && (
                <WaveChart weather={weatherResp.data} height2dgs={height2dgs} />
              )}
            </ChartContainer>
          </Tab>
          <Tab title="Current">
            <ChartContainer
              isLoading={weatherResp.loading}
              hasError={!!weatherResp.error}
              hasData={!!weatherResp.data}
            >
              {weatherResp.data && <CurrentsChart weather={weatherResp.data} />}
            </ChartContainer>
          </Tab>
        </Tabs>
      </Box>
    </>
  );
}
