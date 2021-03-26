import React from "react";
import { Box, Select, Heading } from "grommet";
import Spinner from "./SpinnerBrand";
import Chart from "./Chart";
import { convertDMS, rect2area } from "./util";
import { useWinds, MetaRespType } from "./queries";
import { SelectionContext } from "./SelectionContext";

type SideBarProps = {
  timeRange: string;
  month: string;
  metaResp: MetaRespType;
  onTimeRangeChange: (timeRange: string) => void;
  onMonthChange: (month: string) => void;
};

export default function SideBar(props: SideBarProps): JSX.Element {
  const { pos, rect } = React.useContext(SelectionContext);
  const [loadWinds, windsResp] = useWinds();
  const meta = props.metaResp;

  React.useEffect(() => {
    if (rect) {
      loadWinds({
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
  }, [rect, props.timeRange, props.month, loadWinds]);

  let inputs = <Spinner />;
  if (!meta.loading) {
    if (meta.data) {
      const timeRanges = meta.data.timeRanges;
      const months = meta.data.months;
      inputs = (
        <>
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
          {pos ? convertDMS(pos.lat, pos.lng) : "-"}
        </Heading>
        <Heading level={4} margin={{ bottom: "20px", top: "0px" }}>
          {rect && (
            <>
              {rect2area(rect.lats, rect.lngs)} M<sup>2</sup>
            </>
          )}
        </Heading>
        <Chart winds={windsResp} meta={meta} />
      </Box>
    </>
  );
}
