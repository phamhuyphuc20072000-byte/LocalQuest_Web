import React, { useEffect, useRef } from 'react';

interface WaypointLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export function GuideMapStudio({
  city,
  waypoints,
  onSelectLocation
}: {
  city: string;
  waypoints: WaypointLocation[];
  onSelectLocation: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current).setView([21.0285, 105.8542], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      map.on('click', (e: any) => {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstance.current = map;
    }

    const map = mapInstance.current;

    if (city === 'Hà Nội') map.setView([21.0285, 105.8542], 14);
    else if (city === 'TP. Hồ Chí Minh') map.setView([10.7769, 106.7009], 14);
    else if (city === 'Hội An') map.setView([15.8801, 108.3380], 15);
    else if (city === 'Huế') map.setView([16.4637, 107.5909], 14);

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const coords: [number, number][] = [];
    waypoints.forEach(wp => {
      coords.push([wp.lat, wp.lng]);
      const customIcon = L.divIcon({
        className: 'guide-wp-marker',
        html: `<div style="background:#1C4A32; color:#F5F0E8; border:2px solid #C97D1A; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-family:'JetBrains Mono', monospace; box-shadow:0 3px 8px rgba(0,0,0,0.3);">${wp.id}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);
      marker.bindTooltip(`Trạm ${wp.id}: ${wp.name}`, { permanent: true, direction: 'top', offset: [0, -15] });
      markersRef.current.push(marker);
    });

    if (coords.length > 1) {
      polylineRef.current = L.polyline(coords, { color: '#C97D1A', weight: 4, dashArray: '6, 8', opacity: 0.8 }).addTo(map);
    }
  }, [city, waypoints]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, background: 'rgba(245,240,232,0.95)', borderRadius: 4, padding: '8px 14px', backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1C4A32', margin: 0, fontWeight: 600 }}>📍 Click vào điểm bất kỳ trên bản đồ để thêm Trạm Quest (Tọa độ GPS thực tế)</p>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '380px', zIndex: 1, cursor: 'crosshair', borderRadius: '6px' }} />
    </div>
  );
}
