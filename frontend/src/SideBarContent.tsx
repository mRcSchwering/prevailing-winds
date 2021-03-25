import React from "react";
import { Box, Select, Heading } from "grommet";
import Spinner from "./SpinnerBrand";
import Chart from "./Chart";
import { convertDMS } from "./util";
import { useMetaResp, useWindResp } from "./queries";

type SideBarContentProps = {
  windResp: useWindResp;
  metaResp: useMetaResp;
  selectedTimeRange: string;
  selectedMonth: string;
  pos: { lat: number; lng: number } | null;
  area: string;
  onTimeRangeChange?: (timeRange: string) => void;
  onMonthChange?: (month: string) => void;
};

export default function SideBarContent(
  props: SideBarContentProps
): JSX.Element {
  const pos = props.pos ? convertDMS(props.pos.lat, props.pos.lng) : "-";

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
            margin="xsmall"
            options={timeRanges}
            value={props.selectedTimeRange}
            onChange={handleTimeRangeChange}
          />
          <Select
            margin="xsmall"
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
      </Box>
      <Box align="center">
        <Heading level={4} margin={{ bottom: "0px", top: "20px" }}>
          {pos}
        </Heading>
        <Heading level={4} margin={{ bottom: "20px", top: "0px" }}>
          {props.area && (
            <>
              {props.area} M<sup>2</sup>
            </>
          )}
        </Heading>
        <Chart winds={props.windResp} meta={props.metaResp} />
      </Box>
    </>
  );
}
