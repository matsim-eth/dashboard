import React from 'react';
import './ControlsBar.css';
import { useDashboard } from '../context/DashboardContext';
import cantonAlias from '../utils/canton_alias.json';

const CANTONS = [
  "All", "Aargau", "AppenzellAusserrhoden", "AppenzellInnerrhoden", 
  "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Geneve", 
  "Glarus", "Graubunden", "Jura", "Luzern", "Neuchatel", "Nidwalden", 
  "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "StGallen", 
  "Ticino", "Thurgau", "Uri", "Valais", "Vaud", "Zug", "Zurich"
];

const MODES = [
  { id: "all", label: "All Modes" },
  { id: "bike", label: "Bike" },
  { id: "car", label: "Car" },
  { id: "car_passenger", label: "Car Passenger" },
  { id: "pt", label: "Public Transport" },
  { id: "walk", label: "Walk" },
];

const PURPOSES = [
  { id: "all", label: "All Purposes" },
  { id: "education", label: "Education" },
  { id: "home", label: "Home" },
  { id: "leisure", label: "Leisure" },
  { id: "other", label: "Other" },
  { id: "shop", label: "Shop" },
  { id: "work", label: "Work" },
];

const ControlsBar = ({ activeTab }) => {
  const { 
    selectedCanton, setSelectedCanton,
    distanceType, setDistanceType,
    selectedMode, setSelectedMode,
    selectedPurpose, setSelectedPurpose
  } = useDashboard();

  // Determine which filter to show based on active tab
  const showModeFilter = activeTab === 'mode';
  const showPurposeFilter = activeTab === 'purpose';

  return (
    <div className="controls-bar">
      {/* Canton Dropdown */}
      <div className="control-group">
        <label className="control-label">Canton</label>
        <select 
          className="control-select"
          value={selectedCanton}
          onChange={(e) => setSelectedCanton(e.target.value)}
        >
          {CANTONS.map((canton) => (
            <option key={canton} value={canton}>
              {cantonAlias[canton] || canton}
            </option>
          ))}
        </select>
      </div>

      {/* Distance Type Toggle */}
      <div className="control-group">
        <label className="control-label">Distance Type</label>
        <div className="toggle-group">
          <button 
            className={`toggle-btn ${distanceType === 'euclidean' ? 'active' : ''}`}
            onClick={() => setDistanceType('euclidean')}
          >
            Euclidean
          </button>
          <button 
            className={`toggle-btn ${distanceType === 'network' ? 'active' : ''}`}
            onClick={() => setDistanceType('network')}
          >
            Network
          </button>
        </div>
      </div>

      {/* Mode Toggle - only show on Mode tab */}
      {showModeFilter && (
        <div className="control-group">
          <label className="control-label">Mode</label>
          <div className="toggle-group mode-toggle">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                className={`toggle-btn ${selectedMode === mode.id ? 'active' : ''}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purpose Toggle - only show on Purpose tab */}
      {showPurposeFilter && (
        <div className="control-group">
          <label className="control-label">Purpose</label>
          <div className="toggle-group mode-toggle">
            {PURPOSES.map((purpose) => (
              <button
                key={purpose.id}
                className={`toggle-btn ${selectedPurpose === purpose.id ? 'active' : ''}`}
                onClick={() => setSelectedPurpose(purpose.id)}
              >
                {purpose.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlsBar;
