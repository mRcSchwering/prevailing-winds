import React from "react";
import Plot from "react-plotly.js";
import { Text, Box, ResponsiveContext } from "grommet";
import { WeatherRespType, MetaRespType } from "./queries";
import { getWindName } from "./util";
import { COLORS, windBins } from "./constants";
import Spinner from "./SpinnerBrand";
import Tooltip from "./Tooltip";
import { Meta, WindRecord } from "./types";

function CollapseCheckBox(props: {
  checked: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <Box onClick={props.onClick} alignSelf="center">
      <Text
        weight={props.checked ? "bold" : "normal"}
        color={props.checked ? COLORS.primary : "gray"}
      >
        {props.checked ? "collapsed" : "collapse"}
      </Text>
    </Box>
  );
}

const config = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
};

type WindRoseProps = {
  meta: Meta;
  winds: WindRecord[];
  size: string;
};

function WindRose(props: WindRoseProps): JSX.Element {
  // create series
  const bins = [];
  for (const windBin of windBins) {
    const name = getWindName(windBin);
    const bin = {
      marker: { color: windBin.color },
      name: name,
      type: "barpolar",
      r: [] as number[],
      theta: [] as string[],
      hovertemplate: `%{r:.2f}% %{theta}-winds<br>${name}<extra></extra>`,
    };

    const vels = props.meta.windVelocities.filter((d) =>
      windBin.bfts.includes(d.beaufortNumber)
    );
    for (const vel of vels) {
      for (const dir of props.meta.windDirections) {
        const filtered = props.winds.filter(
          (d) => d.dir === dir.idx && d.vel === vel.idx
        );
        let count = 0;
        if (filtered.length > 0) {
          count = filtered.map((d) => d.count).reduce((a, b) => a + b);
        }
        const thetaIdx = bin.theta.indexOf(dir.name);
        if (bin.theta.indexOf(dir.name) === -1) {
          bin.r.push(count);
          bin.theta.push(dir.name);
        } else {
          bin.r[thetaIdx] = bin.r[thetaIdx] + count;
        }
      }
    }
    bins.push(bin);
  }

  // convert frequencies to counts
  let total = 0;
  for (const bin of bins) {
    total = total + bin.r.reduce((agg, d) => agg + d);
  }
  if (total > 0) {
    for (const bin of bins) {
      bin.r = bin.r.map((d) => (d / total) * 100);
    }
  }

  const L = props.size === "small" ? 35 : 50;
  const layout = {
    margin: { t: L, l: L, r: L, b: L },
    paper_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    polar: {
      barmode: "stack",
      bargap: 0,
      radialaxis: { visible: false, hovertemplate: "aaaaaaaaaaaa" },
      angularaxis: { direction: "clockwise" },
    },
    width: L * 8,
    height: L * 8,
    dragmode: false,
  };

  return <Plot data={bins} layout={layout} config={config} />;
}

interface WindRainBarsProps {
  winds: WindRecord[];
  meta: Meta;
}

function WindRainBars(props: WindRainBarsProps): JSX.Element {
  const layout = {
    hovermode: "closest",
    margin: { t: 10, r: 40, l: 50, b: 50 },
    paper_bgcolor: COLORS.transparent,
    plot_bgcolor: COLORS.transparent,
    font: { size: 16 },
    showlegend: false,
    barmode: "stack",
    bargap: 5,
    width: 200,
    height: 300,
    xaxis: { fixedrange: true },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      fixedrange: true,
      tickvals: [0, 50, 100],
      ticktext: ["0%", "50%", "100%"],
      range: [0, 100],
    },
  };

  const windSums = windBins.map((bin) => {
    const velIdxs = props.meta.windVelocities
      .filter((d) => bin.bfts.includes(d.beaufortNumber))
      .map((d) => d.idx);
    const cnts = props.winds
      .filter((d) => velIdxs.includes(d.vel))
      .map((d) => d.count);
    return cnts.length > 0 ? cnts.reduce((a, b) => a + b) : 0;
  });

  const windTotal = windSums.reduce((a, b) => a + b);
  const windFreqs =
    windTotal > 0
      ? windSums.map((d) => d / windTotal)
      : new Array(windSums.length).fill(0);

  const windTraces = windBins
    .map((bin, i) => {
      const name = getWindName(bin);
      const pct = Math.round(windFreqs[i] * 100);
      return {
        marker: { color: bin.color },
        name: name,
        type: "bar",
        x: ["wind"],
        y: [pct],
        hovertemplate: `${pct}% ${name}<extra></extra>`,
      };
    })
    .filter((d) => d.y[0] > 0);

  return (
    <Plot data={[...windTraces.reverse()]} layout={layout} config={config} />
  );
}

type WindChartProps = {
  weather: WeatherRespType;
  meta: MetaRespType;
};

export default function WindChart(props: WindChartProps): JSX.Element {
  const size = React.useContext(ResponsiveContext);
  const [collapsed, setCollapsed] = React.useState(false);

  if (props.weather.loading || props.meta.loading) return <Spinner />;

  if (props.weather.error) {
    return <Text color="status-critical">{props.weather.error.message}</Text>;
  }
  if (props.meta.error) {
    return <Text color="status-critical">{props.meta.error.message}</Text>;
  }

  if (!props.meta.data || !props.weather.data) {
    return <Text>click somewhere on the chart</Text>;
  }

  return (
    <Box margin={{ vertical: "small" }} align="end">
      <Box margin="small" align="end" width="100%">
        <CollapseCheckBox
          checked={collapsed}
          onClick={() => setCollapsed((d) => !d)}
        />
        <Tooltip text="Hours of all winds during that month. Angle represents wind direction (from which the wind is blowing), colour reqpresents wind strength, radius represents frequency." />
      </Box>
      <Box>
        {collapsed ? (
          <WindRainBars
            meta={props.meta.data}
            winds={props.weather.data.windRecords}
          />
        ) : (
          <WindRose
            meta={props.meta.data}
            winds={props.weather.data.windRecords}
            size={size}
          />
        )}
      </Box>
    </Box>
  );
}
