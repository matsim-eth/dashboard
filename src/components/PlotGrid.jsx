import React, { useState } from 'react';
import './PlotGrid.css';
import CantonMap from './plots/CantonMap';
import DistanceHistogram from './plots/DistanceHistogram';
import DepartureTimeLine from './plots/DepartureTimeLine';
import ByDistanceStacked from './plots/ByDistanceStacked';
import AverageDistance from './plots/AverageDistance';
import ShareLinePlot from './plots/ShareLinePlot';
import PlotExpanded from './PlotExpanded';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';

const TAB_LABELS = {
  home: 'Home',
  demographics: 'Demographics',
  mode: 'Mode',
  purpose: 'Purpose',
  stops: 'Stops',
};

const PlotGrid = ({ sidebarCollapsed, activeTab }) => {
  const [expandedPlot, setExpandedPlot] = useState(null);

  const modePlots = [
    { id: 'canton-map', component: CantonMap, title: 'Canton Map' },
    { id: 'distance-histogram', component: DistanceHistogram, title: 'Distance Histogram', props: { type: 'mode' } },
    { id: 'departure-time', component: DepartureTimeLine, title: 'Mode Share by Departure Time', props: { type: 'mode' } },
    { id: 'mode-distance-stacked', component: ByDistanceStacked, title: 'Mode Distribution by Distance Travelled', props: { type: 'mode' } },
    { id: 'average-distance', component: AverageDistance, title: 'Average Distance', props: { type: 'mode' } },
    { id: 'mode-share-line', component: ShareLinePlot, title: 'Mode Share by Distance', props: { type: 'mode' } },
  ];

  const purposePlots = [
    { id: 'canton-map-purpose', component: CantonMap, title: 'Canton Map' },
    { id: 'distance-histogram-purpose', component: DistanceHistogram, title: 'Distance Histogram', props: { type: 'purpose' } },
    { id: 'departure-time-purpose', component: DepartureTimeLine, title: 'Purpose Share by Departure Time', props: { type: 'purpose' } },
    { id: 'purpose-distance-stacked', component: ByDistanceStacked, title: 'Purpose Distribution by Distance Travelled', props: { type: 'purpose' } },
    { id: 'average-distance-purpose', component: AverageDistance, title: 'Average Distance', props: { type: 'purpose' } },
    { id: 'purpose-share-line', component: ShareLinePlot, title: 'Purpose Share by Distance', props: { type: 'purpose' } },
  ];

  // set plots based on active tab
  let plots = null;
  if (activeTab === 'mode') {
    plots = modePlots;
  } else if (activeTab === 'purpose') {
    plots = purposePlots;
  }

  // placeholders for other tabs
  if (!plots) {
    return (
      <div className="plot-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="plot-card">
            <div className="plot-placeholder">
              {TAB_LABELS[activeTab] || activeTab} (WIP) - Plot {i}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="plot-grid">
        {plots.map((plot) => {
          const PlotComponent = plot.component;
          return (
            <div key={plot.id} className="plot-card">
              <PlotComponent sidebarCollapsed={sidebarCollapsed} {...(plot.props || {})} />
              <button 
                className="plot-expand-btn"
                onClick={() => setExpandedPlot(plot)}
                title="Expand plot"
              >
                <FontAwesomeIcon icon={faExpand} />
              </button>
            </div>
          );
        })}
      </div>

      <PlotExpanded
        isOpen={expandedPlot !== null}
        onClose={() => setExpandedPlot(null)}
        expandedComponent={expandedPlot}
      />
    </>
  );
};

export default PlotGrid;
