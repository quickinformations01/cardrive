import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Driver, VehicleType } from '../types';

interface InteractiveMapProps {
  pickupLocation: { lat: number; lng: number; address: string } | null;
  dropoffLocation: { lat: number; lng: number; address: string } | null;
  drivers: Driver[];
  selectedVehicleType?: VehicleType;
  onMapClick?: (lat: number, lng: number) => void;
  activeTripDriverLocation?: { lat: number; lng: number } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickupLocation,
  dropoffLocation,
  drivers,
  selectedVehicleType,
  onMapClick,
  activeTripDriverLocation
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);

  // Default center: Lahore Liberty Market / Gulberg
  const defaultLat = pickupLocation?.lat || 31.5204;
  const defaultLng = pickupLocation?.lng || 74.3587;

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersGroup.current = L.layerGroup().addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      leafletMap.current = map;
    }

    return () => {
      // Keep map instance persistent
    };
  }, []);

  // Update markers when props change
  useEffect(() => {
    const map = leafletMap.current;
    const group = markersGroup.current;
    if (!map || !group) return;

    group.clearLayers();

    const bounds = L.latLngBounds([]);

    // Pickup Marker (Green Pin)
    if (pickupLocation) {
      const pickupIcon = L.divIcon({
        className: 'custom-pin-pickup',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-slate-950 font-black text-xs shadow-lg">
              A
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const pickupMarker = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: pickupIcon })
        .bindPopup(`<b>Pickup Location</b><br/>${pickupLocation.address}`);
      group.addLayer(pickupMarker);
      bounds.extend([pickupLocation.lat, pickupLocation.lng]);
    }

    // Dropoff Marker (Red Pin)
    if (dropoffLocation) {
      const dropoffIcon = L.divIcon({
        className: 'custom-pin-dropoff',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg">
              B
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const dropoffMarker = L.marker([dropoffLocation.lat, dropoffLocation.lng], { icon: dropoffIcon })
        .bindPopup(`<b>Destination</b><br/>${dropoffLocation.address}`);
      group.addLayer(dropoffMarker);
      bounds.extend([dropoffLocation.lat, dropoffLocation.lng]);
    }

    // Route Polyline if both pickup and dropoff exist
    if (pickupLocation && dropoffLocation) {
      const polyline = L.polyline([
        [pickupLocation.lat, pickupLocation.lng],
        [dropoffLocation.lat, dropoffLocation.lng]
      ], {
        color: '#10b981',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      });
      group.addLayer(polyline);
    }

    // Driver Markers (Active & Subscribed Online Drivers)
    drivers.forEach(driver => {
      if (!driver.isOnline || driver.status !== 'approved') return;

      // Filter by vehicle type if selected
      if (selectedVehicleType && driver.vehicle.type !== selectedVehicleType) return;

      let vehicleEmoji = '🚗';
      if (driver.vehicle.type === 'bike') vehicleEmoji = '🏍️';
      if (driver.vehicle.type === 'rickshaw') vehicleEmoji = '🛺';
      if (driver.vehicle.type === 'suv') vehicleEmoji = '🚙';

      const driverIcon = L.divIcon({
        className: 'custom-driver-icon',
        html: `
          <div class="p-1 rounded-full bg-slate-900/90 border-2 border-emerald-400 text-lg flex items-center justify-center shadow-lg transform hover:scale-125 transition-transform">
            ${vehicleEmoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const driverMarker = L.marker([driver.lat, driver.lng], { icon: driverIcon })
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif;">
            <b>${driver.fullName}</b> (${driver.rating} ★)<br/>
            ${driver.vehicle.brand} ${driver.vehicle.model} - ${driver.vehicle.regNumber}<br/>
            <span style="color: #059669; font-weight: bold;">0% Commission Driver</span>
          </div>
        `);
      
      group.addLayer(driverMarker);
      bounds.extend([driver.lat, driver.lng]);
    });

    // Active En Route Driver Position
    if (activeTripDriverLocation) {
      const activeIcon = L.divIcon({
        className: 'active-driver-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-10 h-10 rounded-full bg-emerald-400/40 animate-ping"></span>
            <div class="p-1.5 rounded-full bg-emerald-500 border-2 border-slate-950 text-xl shadow-xl">
              🚖
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const activeMarker = L.marker([activeTripDriverLocation.lat, activeTripDriverLocation.lng], { icon: activeIcon });
      group.addLayer(activeMarker);
      bounds.extend([activeTripDriverLocation.lat, activeTripDriverLocation.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [pickupLocation, dropoffLocation, drivers, selectedVehicleType, activeTripDriverLocation]);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Helper overlay tag */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 shadow-md flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Tap map to set Location</span>
      </div>
    </div>
  );
};
