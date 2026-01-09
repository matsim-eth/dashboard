import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDashboard } from "../../context/DashboardContext";
import { useLoadWithFallback } from "../../utils/useLoadWithFallback";

const DATASET_COLORS = {
  Microcensus: "#4A90E2",
  Synthetic: "#E07A5F",
};

const AverageDistance = ({ sidebarCollapsed, isExpanded = false, type = 'mode' }) => {
  const { selectedCanton, distanceType } = useDashboard();
  const [data, setData] = useState(null);
  const loadWithFallback = useLoadWithFallback();

  const xAxisLabel = type === 'mode' ? 'Mode' : 'Purpose';
  const titleSuffix = type === 'mode' ? 'All Modes' : 'All Purposes';

  // Trigger resize when sidebar collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const cantonKey = selectedCanton || "All";
    
    loadWithFallback(`avg_dist_data_${type}.json`)
      .then((jsonData) => {
        if (jsonData[cantonKey]) {
          setData(jsonData[cantonKey]);
        }
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [selectedCanton, type]);

  if (!data) return <div className="plot-loading">Loading...</div>;

  const items = Object.keys(data["Microcensus"]);
  const distanceKey = distanceType === "euclidean" ? "euclidean_distance" : "network_distance";

  return (
    <div className="plot-wrapper">
      <h4 className="plot-title">Average {distanceType === "euclidean" ? "Euclidean" : "Network"} Distance ({titleSuffix})</h4>
      <Plot
        data={[
          {
            type: "bar",
            x: items,
            y: items.map((i) => (data["Microcensus"][i][distanceKey] / 1000).toFixed(1)),
            name: "Microcensus",
            marker: { color: DATASET_COLORS.Microcensus },
            text: items.map((i) => (data["Microcensus"][i][distanceKey] / 1000).toFixed(1)),
            textposition: "auto",
          },
          {
            type: "bar",
            x: items,
            y: items.map((i) => (data["Synthetic"][i][distanceKey] / 1000).toFixed(1)),
            name: "Synthetic",
            marker: { color: DATASET_COLORS.Synthetic },
            text: items.map((i) => (data["Synthetic"][i][distanceKey] / 1000).toFixed(1)),
            textposition: "auto",
          },
        ]}
        layout={{
          xaxis: { 
            title: xAxisLabel, 
            tickangle: -45,
            tickfont: { size: 9 },
            titlefont: { size: 11 },
          },
          yaxis: { 
            title: {
              text: "Distance [km]",
              font: { size: 11 },
              standoff: 5
            },
            tickfont: { size: 9 },
          },
          barmode: "group",
          margin: { l: 50, r: 15, t: 5, b: 60 },
          legend: isExpanded 
            ? { orientation: "v", x: 1.02, y: 1, xanchor: "left", font: { size: 9 } }
            : { orientation: "h", y: 1.05, font: { size: 9 } },
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
            filename: `average-distance-${type}`,
            format: 'png',
            height: 800,
            width: 1200
          } 
        }}
      />
    </div>
  );
};

export default AverageDistance;
