import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDashboard } from '../../context/DashboardContext';

// Canton bounding boxes for zooming
const CANTON_BOUNDS = {
  "All": [[5.9, 45.8], [10.5, 47.8]],
  "Zurich": [[8.35, 47.15], [8.99, 47.7]],
  "Bern": [[6.85, 46.32], [8.46, 47.35]],
  "Geneve": [[5.95, 46.12], [6.32, 46.37]],
  "Vaud": [[6.07, 46.2], [7.24, 46.98]],
  "Aargau": [[7.71, 47.13], [8.46, 47.62]],
  "StGallen": [[8.79, 46.87], [9.68, 47.53]],
  "Luzern": [[7.83, 46.76], [8.52, 47.27]],
  "Ticino": [[8.38, 45.82], [9.17, 46.64]],
  "Valais": [[6.77, 45.85], [8.48, 46.66]],
  "Basel-Stadt": [[7.55, 47.51], [7.68, 47.6]],
  "Basel-Landschaft": [[7.32, 47.33], [7.97, 47.57]],
  "Fribourg": [[6.74, 46.44], [7.39, 47.01]],
  "Solothurn": [[7.34, 47.07], [7.95, 47.5]],
  "Graubunden": [[8.65, 46.17], [10.49, 47.07]],
  "Thurgau": [[8.63, 47.37], [9.4, 47.7]],
  "Schaffhausen": [[8.4, 47.65], [8.87, 47.82]],
  "Neuchatel": [[6.44, 46.82], [7.07, 47.14]],
  "Schwyz": [[8.42, 46.88], [9.0, 47.23]],
  "Zug": [[8.36, 47.05], [8.62, 47.27]],
  "Glarus": [[8.76, 46.79], [9.23, 47.17]],
  "Jura": [[6.84, 47.14], [7.56, 47.51]],
  "Nidwalden": [[8.2, 46.77], [8.57, 47.0]],
  "Obwalden": [[8.02, 46.72], [8.42, 47.0]],
  "Uri": [[8.38, 46.41], [8.93, 46.99]],
  "AppenzellAusserrhoden": [[9.19, 47.3], [9.61, 47.48]],
  "AppenzellInnerrhoden": [[9.35, 47.24], [9.51, 47.37]],
};

const CantonMap = ({ sidebarCollapsed, isExpanded = false }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { selectedCanton } = useDashboard();
  const initialCantonRef = useRef(selectedCanton); // Store initial canton on mount

  // Trigger map resize when sidebar collapses/expands
  useEffect(() => {
    if (!map.current) return;
    const timer = setTimeout(() => {
      map.current.resize();
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [8.2275, 46.8182], // Switzerland center
      zoom: 5.5, // Zoomed out more to fit all of Switzerland
      attributionControl: false,
      preserveDrawingBuffer: true, // Required for html2canvas export
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
    });

    map.current.on('load', () => {
      // Add canton boundaries source
      map.current.addSource('cantons', {
        type: 'geojson',
        data: 'https://matsim-eth.github.io/webmap/data/TLM_KANTONSGEBIET.geojson'
      });

      // Canton fill layer
      map.current.addLayer({
        id: 'canton-fills',
        type: 'fill',
        source: 'cantons',
        paint: {
          'fill-color': '#6366f1',
          'fill-opacity': 0.1
        }
      });

      // Canton border layer
      map.current.addLayer({
        id: 'canton-borders',
        type: 'line',
        source: 'cantons',
        paint: {
          'line-color': '#6366f1',
          'line-width': 1
        }
      });

      // Highlighted canton layer
      map.current.addLayer({
        id: 'canton-highlight',
        type: 'fill',
        source: 'cantons',
        paint: {
          'fill-color': '#6366f1',
          'fill-opacity': 0.4
        },
        filter: ['==', 'NAME', '']
      });

      // Apply initial canton selection if one was already selected
      const initCanton = initialCantonRef.current;
      if (initCanton && initCanton !== "All") {
        const bounds = CANTON_BOUNDS[initCanton] || CANTON_BOUNDS["All"];
        map.current.fitBounds(bounds, {
          padding: isExpanded ? 50 : 20,
          duration: 0
        });
        map.current.setFilter('canton-highlight', ['==', 'NAME', initCanton]);
      }
    });
  }, []);

  // Update map when canton changes or expanded state changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const bounds = CANTON_BOUNDS[selectedCanton] || CANTON_BOUNDS["All"];
    
    map.current.fitBounds(bounds, {
      padding: isExpanded ? 50 : 20,
      duration: 500
    });

    // Update highlight filter
    if (selectedCanton === "All") {
      map.current.setFilter('canton-highlight', ['==', 'NAME', '']);
    } else {
      // Match canton name in geojson (may need adjustment based on actual data)
      map.current.setFilter('canton-highlight', ['==', 'NAME', selectedCanton]);
    }
  }, [selectedCanton, isExpanded]);

  return (
    <div className="canton-map-container">
      <div ref={mapContainer} className="canton-map" />
    </div>
  );
};

export default CantonMap;
