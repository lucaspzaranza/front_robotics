'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useOdometry from '@/hooks/ros/useOdometry';

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [robotMarker, setRobotMarker] = useState<L.Marker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const odometry = useOdometry();

  // São Paulo coordinates
  const SP_COORDS = {
    lat: -23.55052,
    lng: -46.633308,
  };

  useEffect(() => {
    if (!mapRef.current || map) return;

    // Initialize map with a slight delay to ensure container is ready
    const timeoutId = setTimeout(() => {
      const newMap = L.map(mapRef.current!, {
        center: [SP_COORDS.lat, SP_COORDS.lng],
        zoom: 13,
        zoomControl: false, // We'll add zoom control in a better position
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(newMap);

      // Add zoom control to top-right
      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(newMap);

      // Create robot marker with custom icon
      const robotIcon = L.divIcon({
        className: 'robot-marker',
        html: `
          <div class="relative">
            <div class="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
            <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([SP_COORDS.lat, SP_COORDS.lng], {
        icon: robotIcon,
        title: 'Robot Position',
      }).addTo(newMap);

      setRobotMarker(marker);
      setMap(newMap);

      // Force a resize to ensure proper rendering
      setTimeout(() => {
        newMap.invalidateSize();
      }, 100);
    }, 0);

    return () => {
      clearTimeout(timeoutId);

      const mapToRemove: any = map;
      if (mapToRemove) {
        mapToRemove.remove();
      }
    };
  }, [map]);

  useEffect(() => {
    if (!robotMarker) return;

    if (odometry) {
      const newLat = SP_COORDS.lat + odometry.pose.pose.position.y * 0.0001;
      const newLng = SP_COORDS.lng + odometry.pose.pose.position.x * 0.0001;
      robotMarker.setLatLng([newLat, newLng]);
    }
  }, [robotMarker]);

  const toggleFullscreen = () => {
    const container = mapRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.classList.add('fullscreen');
    } else {
      container.classList.remove('fullscreen');
    }

    setIsFullscreen(!isFullscreen);

    // Ensure map renders correctly in fullscreen
    setTimeout(() => {
      map?.invalidateSize();
    }, 100);
  };

  return (
    <div className="relative w-[500px] h-[500px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full bg-gray-100" />

      {/* Map controls */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded-md bg-white shadow-md text-gray-800 hover:bg-gray-100"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>

      <style jsx global>{`
        .robot-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: inherit;
          z-index: 10; /* Add this line to ensure map stays below notifications */
        }
      `}</style>
    </div>
  );
}
