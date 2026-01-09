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

const DepartureTimeLine = ({ sidebarCollapsed, isExpanded = false, type = 'mode' }) => {
  const { selectedCanton, selectedMode, selectedPurpose } = useDashboard();
  const [plotData, setPlotData] = useState(null);
  const loadWithFallback = useLoadWithFallback();

  // Select colors and filter based on type
  const colors = type === 'mode' ? MODE_COLORS : PURPOSE_COLORS;
  const selectedFilter = type === 'mode' ? selectedMode : selectedPurpose;
  const filterKey = type === 'mode' ? 'mode' : 'purpose';
  const titlePrefix = type === 'mode' ? 'Mode' : 'Purpose';

  // Trigger resize when sidebar collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  useEffect(() => {
    loadWithFallback(`lineplot_departure_time_data_${type}.json`)
      .then((jsonData) => {
        const cantonKey = selectedCanton || "All";
        if (jsonData[cantonKey]) {
          setPlotData(jsonData[cantonKey]);
        }
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [selectedCanton, type]);

  if (!plotData) return <div className="plot-loading">Loading...</div>;

  const generateTraces = (data, datasetName, lineStyle) => {
    const items = selectedFilter === "all" 
      ? [...new Set(data.map((entry) => entry[filterKey]))]
      : [selectedFilter];

    return items.map((item) => {
      const filtered = data.filter((entry) => entry[filterKey] === item);
      if (filtered.length === 0) return null;

      return {
        type: "scatter",
        mode: "lines+markers",
        x: filtered.map((entry) => entry.variable_midpoint),
        y: filtered.map((entry) => entry.percentage),
        name: item,
        line: { color: colors[item] || "#999", dash: lineStyle },
        marker: { size: 4 },
        legendgroup: item,
        showlegend: false,
      };
    }).filter(Boolean);
  };

  const traces = [
    ...generateTraces(plotData.microcensus, "Microcensus", "solid"),
    ...generateTraces(plotData.synthetic, "Synthetic", "dash"),
  ];

  // Add dummy traces for color legend (as squares)
  const items = selectedFilter === "all" 
    ? Object.keys(colors)
    : [selectedFilter];
  
  const colorTraces = items.map(item => ({
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

  // Filter tick labels to show every other one
  const tickVals = plotData.tick_vals || [];
  const tickLabels = plotData.tick_labels || [];
  const filteredTickVals = tickVals.filter((_, i) => i % 2 === 0);
  const filteredTickLabels = tickLabels.filter((_, i) => i % 2 === 0);

  return (
    <div className="plot-wrapper">
      <h4 className="plot-title">{titlePrefix} Share by Departure Time</h4>
      <Plot
        data={allTraces}
        layout={{
          xaxis: {
            title: "Departure Time",
            tickmode: "array",
            tickvals: filteredTickVals,
            ticktext: filteredTickLabels,
            tickangle: 45,
            tickfont: { size: 9 },
            titlefont: { size: 11 },
          },
          yaxis: { 
            title: {
              text: `${titlePrefix} Share [%]`,
              font: { size: 11 },
              standoff: 10
            },
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
          margin: { l: 50, r: 15, t: 5, b: 65 },
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
            filename: `departure-time-${type}`,
            format: 'png',
            height: 800,
            width: 1200
          } 
        }}
      />
    </div>
  );
};

export default DepartureTimeLine;
