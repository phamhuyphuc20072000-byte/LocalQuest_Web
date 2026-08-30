import React, { useEffect, useRef } from 'react';
import { Waypoint } from '../../types';
import { PlusCircle, MapPin, Sparkles, Navigation, Trash2 } from 'lucide-react';
import { CITY_COORDINATES, CITY_DEFAULT_ZOOM } from './LeafletTreasureMap';

declare const L: any;

interface LeafletStudioMapProps {
  waypoints: Waypoint[];
  onAddWaypoint: (lat: number, lng: number) => void;
  onUpdateWaypointCoord?: (index: number, lat: number, lng: number) => void;
  onRemoveWaypoint?: (index: number) => void;
  onSelectWaypoint?: (index: number) => void;
  activeWaypointIndex?: number;
  city?: string;
  centerLat?: number;
  centerLng?: number;
  height?: string | number;
}

export function LeafletStudioMap({
  waypoints,
  onAddWaypoint,
  onUpdateWaypointCoord,
  onRemoveWaypoint,
  onSelectWaypoint,
  activeWaypointIndex = 0,
  city = 'Hà Nội',
  centerLat,
  centerLng,
  height = 440
}: LeafletStudioMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Initialize or update Map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Inject studio styling if not present
    if (!document.getElementById('leaflet-studio-gold-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'leaflet-studio-gold-styles';
      styleEl.innerHTML = `
        .leaflet-popup-content-wrapper {
          background: #FDFAF5 !important;
          color: #1A1D1A !important;
          border: 1.5px solid #D4AF37 !important;
          border-radius: 16px !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: #FDFAF5 !important;
          border: 1.5px solid #D4AF37 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    const defaultCoords = CITY_COORDINATES[city] || CITY_COORDINATES['Hà Nội'];
    const initLat = centerLat || (waypoints[0] ? waypoints[0].lat : defaultCoords[0]);
    const initLng = centerLng || (waypoints[0] ? waypoints[0].lng : defaultCoords[1]);
    const initZoom = CITY_DEFAULT_ZOOM[city] || 15;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLng],
        zoom: initZoom,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Voyager warm tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Handle map click to add station
      map.on('click', (e: any) => {
        onAddWaypoint(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Pan when city changes if no waypoints or when requested
    if (CITY_COORDINATES[city] && waypoints.length === 0) {
      map.flyTo(CITY_COORDINATES[city], CITY_DEFAULT_ZOOM[city] || 15, { duration: 1.2 });
    }

    // Remove old layers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (waypoints.length > 0) {
      const latlngs = waypoints.map((w) => [w.lat, w.lng]);

      // Golden Dashed Trail
      const polyline = L.polyline(latlngs, {
        color: '#D4AF37',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = polyline;

      // Numbered Royal Gold Station Markers
      waypoints.forEach((wp, index) => {
        const isActive = index === activeWaypointIndex;
        const markerHtml = `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isActive ? `
              <div style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid #D4AF37; animation: goldPulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            ` : ''}
            <div style="
              width: ${isActive ? '34px' : '30px'};
              height: ${isActive ? '34px' : '30px'};
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: ${isActive ? 'linear-gradient(135deg, #D4AF37 0%, #C97D1A 100%)' : '#0F2D1E'};
              color: ${isActive ? '#0F2D1E' : '#F3E5AB'};
              font-family: 'Fraunces', serif;
              font-weight: 800;
              font-size: ${isActive ? '14px' : '12px'};
              border: 2px solid ${isActive ? '#FFFFFF' : '#D4AF37'};
              box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(212, 175, 55, 0.4);
            ">
              ${wp.id || index + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'studio-gold-marker',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([wp.lat, wp.lng], { 
          icon,
          draggable: true 
        }).addTo(map);

        // Allow dragging marker to fine-tune GPS coordinate
        marker.on('dragend', (event: any) => {
          const newPos = event.target.getLatLng();
          if (onUpdateWaypointCoord) {
            onUpdateWaypointCoord(index, Number(newPos.lat.toFixed(5)), Number(newPos.lng.toFixed(5)));
          }
        });

        marker.on('click', () => {
          if (onSelectWaypoint) onSelectWaypoint(index);
        });

        // Popup with station information
        const popupContent = `
          <div style="width: 220px; font-family: 'Outfit', sans-serif; padding: 10px 12px; background: #FDFAF5; border-radius: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
              <span style="background: #0F2D1E; color: #F3E5AB; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
                TRẠM SỐ ${wp.id || index + 1}
              </span>
              <span style="font-size: 9px; color: #78716C; font-family: 'JetBrains Mono', monospace;">
                ${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}
              </span>
            </div>
            <h4 style="font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700; color: #0F2D1E; margin: 0 0 4px 0;">
              ${wp.name || `Trạm Dừng #${index + 1}`}
            </h4>
            <p style="font-size: 10px; color: #57534E; margin: 0; line-height: 1.3;">
              💡 Kéo thả biểu tượng để tinh chỉnh tọa độ GPS thực địa.
            </p>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 240, closeButton: false });
        markersRef.current.push(marker);
      });

      // Fit bounds if multiple points
      if (latlngs.length > 1) {
        map.fitBounds(latlngs, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [waypoints, activeWaypointIndex, city, centerLat, centerLng]);

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300"
      style={{
        borderColor: '#D4AF37',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35), 0 0 20px rgba(212, 175, 55, 0.2)'
      }}
    >
      {/* Map Target */}
      <div
        ref={mapContainerRef}
        className="z-0"
        style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height, background: '#EAE6DF' }}
      />

      {/* Top Banner Guide */}
      <div className="absolute top-3 left-3 z-[400] px-3.5 py-1.5 rounded-xl bg-[#0F2D1E]/95 backdrop-blur-md border border-[#D4AF37]/50 text-amber-200 text-xs font-mono flex items-center gap-2 shadow-xl">
        <PlusCircle size={14} className="text-amber-400 animate-pulse" />
        <span className="font-bold">CLICK VÀO BẢN ĐỒ ĐỂ TẠO TRẠM DỪNG HOẶC KÉO THẢ GPS</span>
      </div>

      {/* Bottom Status */}
      <div className="absolute bottom-3 right-3 z-[400] px-3 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-stone-700 text-stone-300 text-[10px] font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Khu vực: {city} ({waypoints.length} Trạm đã ghim)</span>
      </div>
    </div>
  );
}
