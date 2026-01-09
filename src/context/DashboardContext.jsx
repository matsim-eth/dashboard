import React, { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [selectedCanton, setSelectedCanton] = useState("All");
  const [distanceType, setDistanceType] = useState("euclidean"); // "euclidean" or "network"
  const [selectedMode, setSelectedMode] = useState("all"); // "all", "bike", "car", "car_passenger", "pt", "walk"
  const [selectedPurpose, setSelectedPurpose] = useState("all"); // "all", "education", "work", "leisure", "shopping", "business", "escort"

  const value = {
    selectedCanton, setSelectedCanton,
    distanceType, setDistanceType,
    selectedMode, setSelectedMode,
    selectedPurpose, setSelectedPurpose,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
