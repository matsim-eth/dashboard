import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDashboard } from "../../context/DashboardContext";
import { useLoadWithFallback } from "../../utils/useLoadWithFallback";

const DATASET_COLORS = {
  Microcensus: "#4A90E2",
  Synthetic: "#E07A5F",
};

const DistanceHistogram = ({ sidebarCollapsed, isExpanded = false, type = 'mode' }) => {
  const { selectedCanton, distanceType, selectedMode, selectedPurpose } = useDashboard();
  const [euclideanData, setEuclideanData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const loadWithFallback = useLoadWithFallback();

  // Use mode or purpose based on type prop
  const selectedFilter = type === 'mode' ? selectedMode : selectedPurpose;

  // Trigger resize when sidebar collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const cantonKey = selectedCanton || "All";

    loadWithFallback(`histogram_euclidean_distance_${type}.json`)
      .then((jsonData) => {
        if (jsonData[cantonKey]) {
          setEuclideanData(jsonData[cantonKey]);
        }
      })
      .catch((error) => console.error("Error loading Euclidean JSON:", error));

    loadWithFallback(`histogram_network_distance_${type}.json`)
      .then((jsonData) => {
        if (jsonData[cantonKey]) {
          setNetworkData(jsonData[cantonKey]);
        }
      })
      .catch((error) => console.error("Error loading Network JSON:", error));
  }, [selectedCanton, type]);

  if (!euclideanData || !networkData) return <div className="plot-loading">Loading...</div>;

  // Use selected filter from context, default to first available
  const availableOptions = Object.keys(euclideanData);
  const currentOption = selectedFilter === "all" ? availableOptions[0] : selectedFilter;
  
  if (!euclideanData[currentOption] || !networkData[currentOption]) {
    return <div className="plot-loading">No data for selected {type}</div>;
  }

  // Select data based on distance type
  const data = distanceType === "euclidean" ? euclideanData : networkData;
  const distanceLabel = distanceType === "euclidean" ? "Euclidean" : "Network";

  const binWidth = data[currentOption].bin_width;
  const bins = data[currentOption].bins;
  const microMean = data[currentOption].microcensus_mean;
  const synthMean = data[currentOption].synthetic_mean;

  // Calculate max from both euclidean and network for consistent scale
  const maxY = Math.max(
    ...euclideanData[currentOption].microcensus_histogram,
    ...euclideanData[currentOption].synthetic_histogram,
    ...networkData[currentOption].microcensus_histogram,
    ...networkData[currentOption].synthetic_histogram
  );

  return (
    <div className="plot-wrapper">
      <h4 className="plot-title">{distanceLabel} Distance - {currentOption}</h4>
      <Plot
        data={[
          {
            type: "bar",
            x: bins,
            y: data[currentOption].microcensus_histogram,
            name: "Microcensus",
            marker: { color: DATASET_COLORS.Microcensus },
            opacity: 0.6,
            hovertemplate: "Range: [%{x:.1f} - %{customdata})<br>Percentage: %{y:.2f}%",
            customdata: bins.map((b) => (b + binWidth).toFixed(1)),
          },
          {
            type: "bar",
            x: bins,
            y: data[currentOption].synthetic_histogram,
            name: "Synthetic",
            marker: { color: DATASET_COLORS.Synthetic },
            opacity: 0.6,
            hovertemplate: "Range: [%{x:.1f} - %{customdata})<br>Percentage: %{y:.2f}%",
            customdata: bins.map((b) => (b + binWidth).toFixed(1)),
          },
          // Microcensus mean line
          {
            type: "scatter",
            mode: "lines",
            x: [microMean, microMean],
            y: [0, maxY * 0.8],
            name: "Microcensus Mean",
            line: { color: DATASET_COLORS.Microcensus, dash: "dot" },
            hoverinfo: "x",
            legendgroup: "microcensus-mean",
          },
          // Microcensus mean label
          {
            type: "scatter",
            mode: "text",
            x: [microMean],
            y: [maxY * 0.8],
            text: [`${microMean.toFixed(1)}`],
            textposition: "top center",
            showlegend: false,
            hoverinfo: "skip",
            legendgroup: "microcensus-mean",
          },
          // Synthetic mean line
          {
            type: "scatter",
            mode: "lines",
            x: [synthMean, synthMean],
            y: [0, maxY * 0.65],
            name: "Synthetic Mean",
            line: { color: DATASET_COLORS.Synthetic, dash: "dot" },
            hoverinfo: "x",
            legendgroup: "synthetic-mean",
          },
          // Synthetic mean label
          {
            type: "scatter",
            mode: "text",
            x: [synthMean],
            y: [maxY * 0.65],
            text: [`${synthMean.toFixed(1)}`],
            textposition: "top center",
            showlegend: false,
            hoverinfo: "skip",
            legendgroup: "synthetic-mean",
          },
        ]}
        layout={{
          xaxis: {
            title: { text: "Distance [m]", font: { size: 11 } },
            tickfont: { size: 9 },
            range: [-binWidth, binWidth * 25],
          },
          yaxis: {
            title: { text: "Percentage [%]", font: { size: 11 } },
            tickfont: { size: 9 },
            range: [0, 1.1 * maxY],
          },
          margin: { l: 45, r: 20, t: 5, b: 40 },
          showlegend: true,
          legend: { 
            orientation: "v", 
            x: 1.02, 
            y: 1,
            xanchor: "left",
            yanchor: "top",
            font: { size: 8 },
          },
          barmode: "overlay",
          bargap: 0,
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          autosize: true,
          annotations: [
            {
              x: 1.02,
              y: 0.0,
              xref: "paper",
              yref: "paper",
              text: `n(MC)=${data[currentOption].microcensus_sample_size}<br>n(Syn)=${data[currentOption].synthetic_sample_size}`,
              showarrow: false,
              font: { size: 8 },
              align: "left",
              xanchor: "left",
              yanchor: "bottom",
            },
          ],
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ 
          responsive: true, 
          displayModeBar: isExpanded ? 'hover' : false,
          toImageButtonOptions: { 
            filename: `distance-histogram-${type}`,
            format: 'png',
            height: 800,
            width: 1200
          } 
        }}
      />
    </div>
  );
};

export default DistanceHistogram;
