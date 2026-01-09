import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDashboard } from "../../context/DashboardContext";
import { useLoadWithFallback } from "../../utils/useLoadWithFallback";

const MODE_COLORS = {
  car: "#636efa",
  car_passenger: "#ef553b",
  pt: "#00cc96",
  bike: "#ab63fa",
  walk: "#ffa15a",
};

const PURPOSE_COLORS = {
  education: "#636efa",
  home: "#ef553b",
  leisure: "#00cc96",
  other: "#ab63fa",
  shop: "#ffa15a",
  work: "#FFEE8C",
};

const ShareLinePlot = ({ sidebarCollapsed, isExpanded = false, type = 'mode' }) => {
  const { selectedCanton, distanceType, selectedMode, selectedPurpose } = useDashboard();
  const [plotData, setPlotData] = useState(null);
  const loadWithFallback = useLoadWithFallback();

  // Select colors and filter based on type
  const colors = type === 'mode' ? MODE_COLORS : PURPOSE_COLORS;
  const selectedFilter = type === 'mode' ? selectedMode : selectedPurpose;
  const filterKey = type === 'mode' ? 'mode' : 'purpose';
  const titlePrefix = type === 'mode' ? 'Mode' : 'Purpose';

  // Map distance type to the variable name used in the data files
  const selectedVariable = distanceType === "euclidean" ? "euclidean_distance" : "network_distance";

  // Trigger resize when sidebar collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const filename = `lineplot_${selectedVariable}_data_${type}.json`;

    loadWithFallback(filename)
      .then((jsonData) => {
        const cantonKey = selectedCanton || "All";
        const cantonData = jsonData[cantonKey];
        if (cantonData && cantonData.microcensus && cantonData.synthetic) {
          setPlotData(cantonData);
        } else {
          console.error(`No data found for canton: ${cantonKey}`);
          setPlotData(null);
        }
      })
      .catch((error) => console.error(`Error loading ${selectedVariable} data:`, error));
  }, [selectedVariable, selectedCanton, type]);

  if (!plotData) return <div className="plot-loading">Loading...</div>;

  const generateTraces = (data, datasetName, lineStyle) => {
    const uniqueItems = [...new Set(data.map((entry) => entry[filterKey]))];
    const filteredItems = selectedFilter === "all" ? uniqueItems : uniqueItems.filter(i => i === selectedFilter);

    return filteredItems.map((item) => {
      const filtered = data.filter((entry) => entry[filterKey] === item);
      if (filtered.length === 0) return null;

      return {
        type: "scatter",
        mode: "lines+markers",
        x: filtered.map((entry) => entry.variable_midpoint),
        y: filtered.map((entry) => entry.percentage),
        name: item,
        line: {
          color: colors[item] || "#7f7f7f",
          dash: lineStyle,
        },
        marker: { size: 4 },
        legendgroup: item,
        showlegend: false,
      };
    }).filter(Boolean);
  };

  const tickVals = plotData.tick_vals || [];
  const tickLabels = plotData.tick_labels || [];

  const traces = [
    ...generateTraces(plotData.microcensus, "MC", "solid"),
    ...generateTraces(plotData.synthetic, "Syn", "dash"),
  ];

  // Add dummy traces for color legend (as squares)
  const colorTraces = (selectedFilter === "all" 
    ? Object.keys(colors)
    : [selectedFilter]
  ).map(item => ({
    type: "scatter",
    mode: "markers",
    x: [null],
    y: [null],
    name: item,
    marker: { color: colors[item], size: 10, symbol: "square" },
    showlegend: true,
    legendgroup: item,
    legendrank: 1,
  }));

  // Add dummy traces for line style legend
  const lineStyleTraces = [
    {
      type: "scatter",
      mode: "lines",
      x: [null],
      y: [null],
      name: "Microcensus",
      line: { color: "#666", dash: "solid", width: 2 },
      showlegend: true,
      legendgroup: "linestyle",
      legendrank: 2,
    },
    {
      type: "scatter",
      mode: "lines",
      x: [null],
      y: [null],
      name: "Synthetic",
      line: { color: "#666", dash: "dash", width: 2 },
      showlegend: true,
      legendgroup: "linestyle",
      legendrank: 2,
    },
  ];

  const allTraces = [...traces, ...colorTraces, ...lineStyleTraces];

  const distanceLabel = distanceType === "euclidean" ? "Euclidean Distance" : "Network Distance";

  return (
    <div className="plot-wrapper">
      <h4 className="plot-title">{titlePrefix} Share by {distanceLabel}</h4>
      <Plot
        data={allTraces}
        layout={{
          xaxis: {
            title: {
              text: distanceLabel,
              font: { size: 11 },
              standoff: 10,
            },
            tickmode: "array",
            tickvals: tickVals,
            ticktext: tickLabels,
            tickangle: 45,
            tickfont: { size: 8 },
          },
          yaxis: {
            title: { text: `${titlePrefix} Share [%]`, font: { size: 11 } },
            tickfont: { size: 9 },
          },
          legend: { 
            orientation: "v", 
            x: 1.02, 
            y: 1,
            xanchor: "left",
            yanchor: "top",
            font: { size: 8 },
            tracegroupgap: type === 'mode' ? 5 : 2,
          },
          margin: { l: 45, r: 15, t: 5, b: 70 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          autosize: true,
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ 
          responsive: true, 
          displayModeBar: isExpanded ? 'hover' : false,
          toImageButtonOptions: { 
            filename: `${type}-share-by-distance`,
            format: 'png',
            height: 800,
            width: 1200
          } 
        }}
      />
    </div>
  );
};

export default ShareLinePlot;
