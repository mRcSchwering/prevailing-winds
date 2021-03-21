import React from "react";
import Plot from "react-plotly.js";
import { sampleData } from "./sampleData";

const layout = {
  title: "not yet in use",
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

export default function Chart(): JSX.Element {
  return <Plot data={sampleData} layout={layout} config={config} />;
}
