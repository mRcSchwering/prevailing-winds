import React from "react";
import { Box, Select, Heading } from "grommet";
import Spinner from "./SpinnerBrand";
import Chart from "./Chart";
import { convertDMS, rect2area } from "./util";
import { useMeta, useWinds } from "./queries";
import { SelectionContext } from "./SelectionContext";

export default function SideBarContent(): JSX.Element {
  const { pos, rect } = React.useContext(SelectionContext);

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

  React.useEffect(() => {
    if (rect) {
      loadWinds({
        variables: {
          timeRange: timeRange,
          month: month,
          fromLat: rect.lats[0],
          toLat: rect.lats[1],
          fromLng: rect.lngs[0],
          toLng: rect.lngs[1],
        },
      });
    }
  }, [rect, timeRange, month, loadWinds]);

  let inputs = <Spinner />;
  if (!metaResp.loading) {
    if (metaResp.data) {
      const timeRanges = metaResp.data.timeRanges;
      const months = metaResp.data.months;
      inputs = (
        <>
          <Select
            margin="xsmall"
            options={timeRanges}
            value={timeRange}
            onChange={({ option }) => setTimeRange(option)}
          />
          <Select
            margin="xsmall"
            options={months}
            value={month}
            onChange={({ option }) => setMonth(option)}
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
        <Chart winds={windsResp} meta={metaResp} />
      </Box>
    </>
  );
}
