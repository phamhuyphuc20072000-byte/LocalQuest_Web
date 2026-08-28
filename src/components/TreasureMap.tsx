import React, { useEffect, useRef } from 'react';
import { Quest, QUESTS, formatPrice } from '../data/quests';

export function TreasureMap({ onQuestClick, selectedCity }: { onQuestClick: (q: Quest) => void; selectedCity: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const filtered = selectedCity === 'Tất cả' || !selectedCity ? QUESTS : QUESTS.filter(q => q.city === selectedCity);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current).setView([21.0285, 105.8542], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);
      mapInstance.current = map;
    }

    const map = mapInstance.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    filtered.forEach(q => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background:#C97D1A; color:#FDFAF5; border:2px solid #132E1F; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-family:'JetBrains Mono', monospace; box-shadow:0 3px 10px rgba(0,0,0,0.3); cursor:pointer;">${q.id}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([q.lat, q.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:'Outfit',sans-serif; padding:4px; max-width:200px;">
          <h4 style="font-family:'Fraunces',serif; font-size:15px; font-weight:600; margin:0 0 4px; color:#1A1A18;">${q.name}</h4>
          <p style="font-size:12px; color:#6B6355; margin:0 0 8px;">📍 ${q.city} · <strong>${formatPrice(q.price)}</strong></p>
          <button id="quest-popup-btn-${q.id}" style="background:#1C4A32; color:#FDFAF5; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer; width:100%;">Xem Chi Tiết →</button>
        </div>
      `);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`quest-popup-btn-${q.id}`);
          if (btn) btn.onclick = () => onQuestClick(q);
        }, 50);
      });

      markersRef.current.push(marker);
    });

    if (selectedCity === 'Hà Nội') map.setView([21.0285, 105.8542], 13);
    else if (selectedCity === 'TP. Hồ Chí Minh') map.setView([10.7769, 106.7009], 13);
    else if (selectedCity === 'Hội An') map.setView([15.8801, 108.3380], 14);
    else if (selectedCity === 'Huế') map.setView([16.4637, 107.5909], 13);
    else if (filtered.length > 0 && markersRef.current.length > 0) {
      try {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.2));
      } catch (e) {}
    }
  }, [selectedCity, filtered]);

  return (
    <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(107,99,85,0.2)' }}>
      <div ref={mapRef} style={{ height: 340, width: '100%', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(245,240,232,0.95)', borderRadius: 4, padding: '6px 10px', backdropFilter: 'blur(4px)', zIndex: 1000, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', margin: 0 }}>🧭 BẢN ĐỒ KHO BÁU — Click marker để xem Quest</p>
      </div>
    </div>
  );
}
