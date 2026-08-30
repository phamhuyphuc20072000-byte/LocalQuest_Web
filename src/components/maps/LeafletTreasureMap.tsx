import React, { useEffect, useRef } from 'react';
import { Waypoint, Quest } from '../../types';
import { MapPin, Sparkles, Compass, Volume2, ArrowRight } from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { formatPrice, img } from '../../data/quests';

declare const L: any;

export const CITY_COORDINATES: Record<string, [number, number]> = {
  'Tất cả': [16.0471, 108.2068],
  'Hà Nội': [21.0285, 105.8542],
  'TP. Hồ Chí Minh': [10.7769, 106.7009],
  'Hội An': [15.8801, 108.3380],
  'Huế': [16.4637, 107.5909],
  'Đà Lạt': [11.9404, 108.4583],
  'Ninh Bình': [20.2506, 105.9745]
};

export const CITY_DEFAULT_ZOOM: Record<string, number> = {
  'Tất cả': 6,
  'Hà Nội': 14,
  'TP. Hồ Chí Minh': 14,
  'Hội An': 15,
  'Huế': 14,
  'Đà Lạt': 14,
  'Ninh Bình': 13
};

interface LeafletTreasureMapProps {
  waypoints?: Waypoint[];
  quests?: Quest[];
  activeWaypointIndex?: number;
  onSelectWaypoint?: (index: number) => void;
  onSelectQuest?: (quest: Quest) => void;
  centerLat?: number;
  centerLng?: number;
  questName?: string;
  city?: string;
  height?: string | number;
  interactive?: boolean;
}

export function LeafletTreasureMap({
  waypoints = [],
  quests = [],
  activeWaypointIndex = 0,
  onSelectWaypoint,
  onSelectQuest,
  centerLat,
  centerLng,
  questName,
  city = 'Tất cả',
  height = 440,
  interactive = true
}: LeafletTreasureMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const { navigateToQuestDetail, playAudio } = useQuest();

  // Handle global popup clicks via container event delegation
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const questBtn = target.closest('[data-quest-id]') as HTMLElement;
      if (questBtn) {
        const questId = questBtn.getAttribute('data-quest-id');
        const found = quests.find((q) => q.id === questId);
        if (found) {
          if (onSelectQuest) {
            onSelectQuest(found);
          } else {
            navigateToQuestDetail(found);
          }
        }
      }

      const audioBtn = target.closest('[data-audio-wp-idx]') as HTMLElement;
      if (audioBtn) {
        const idx = parseInt(audioBtn.getAttribute('data-audio-wp-idx') || '0', 10);
        const wp = waypoints[idx];
        if (wp) {
          playAudio({
            title: wp.name,
            questName: questName || 'Hành Trình Di Sản',
            script: wp.script,
            city: city !== 'Tất cả' ? city : 'Việt Nam',
            waypointIndex: idx
          });
        }
      }
    };

    container.addEventListener('click', handleContainerClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
    };
  }, [quests, waypoints, questName, city, onSelectQuest, navigateToQuestDetail, playAudio]);

  // Main Leaflet map initialisation and lifecycle
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Inject custom heritage Leaflet CSS styles once
    if (!document.getElementById('leaflet-heritage-gold-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'leaflet-heritage-gold-styles';
      styleEl.innerHTML = `
        .leaflet-popup-content-wrapper {
          background: #FDFAF5 !important;
          color: #1A1D1A !important;
          border: 1.5px solid #D4AF37 !important;
          border-radius: 18px !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.3) !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-tip {
          background: #FDFAF5 !important;
          border: 1.5px solid #D4AF37 !important;
        }
        .leaflet-popup-close-button {
          color: #D4AF37 !important;
          padding: 8px !important;
          font-size: 16px !important;
          font-weight: bold !important;
          z-index: 10 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #C97D1A !important;
        }
        @keyframes goldPulseRing {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Default Coordinates calculation
    const defaultCoords = CITY_COORDINATES[city] || CITY_COORDINATES['Hà Nội'];
    const initLat = centerLat || (waypoints[0] ? waypoints[0].lat : defaultCoords[0]);
    const initLng = centerLng || (waypoints[0] ? waypoints[0].lng : defaultCoords[1]);
    const initZoom = CITY_DEFAULT_ZOOM[city] || 14;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLng],
        zoom: initZoom,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Warm CartoDB Voyager Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers and polyline
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // ==========================================
    // CASE A: WAYPOINTS OF A SINGLE QUEST
    // ==========================================
    if (waypoints && waypoints.length > 0) {
      const latlngs = waypoints.map((w) => [w.lat, w.lng]);

      // Golden Dashed Polyline
      const polyline = L.polyline(latlngs, {
        color: '#D4AF37',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = polyline;

      // Custom Royal Gold Crest Markers
      waypoints.forEach((wp, index) => {
        const isActive = index === activeWaypointIndex;
        const markerHtml = `
          <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isActive ? `
              <div style="position: absolute; inset: -6px; border-radius: 50%; border: 2px solid #D4AF37; animation: goldPulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: -2px; border-radius: 50%; background: rgba(212, 175, 55, 0.25); filter: blur(4px);"></div>
            ` : ''}
            <div style="
              position: relative;
              width: ${isActive ? '38px' : '32px'};
              height: ${isActive ? '38px' : '32px'};
              border-radius: 50%;
              background: ${isActive ? 'linear-gradient(135deg, #D4AF37 0%, #E6CA65 50%, #C97D1A 100%)' : '#0F2D1E'};
              color: ${isActive ? '#0F2D1E' : '#F3E5AB'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Fraunces', serif;
              font-weight: 800;
              font-size: ${isActive ? '15px' : '13px'};
              border: 2px solid ${isActive ? '#FFFFFF' : '#D4AF37'};
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 15px rgba(212, 175, 55, 0.4);
              transition: transform 0.2s ease;
            ">
              ${wp.id || index + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'gold-crest-waypoint-marker',
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });

        const marker = L.marker([wp.lat, wp.lng], { icon }).addTo(map);

        marker.on('click', () => {
          if (onSelectWaypoint) onSelectWaypoint(index);
        });

        // Vintage Heritage Popup Card for Waypoint
        const popupContent = `
          <div style="width: 250px; font-family: 'Outfit', sans-serif;">
            <div style="background: linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%); padding: 12px 14px; border-bottom: 1.5px solid rgba(212, 175, 55, 0.4); color: white;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <span style="background: rgba(212, 175, 55, 0.2); border: 1px solid rgba(212, 175, 55, 0.5); color: #F3E5AB; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                  TRẠM SỐ ${wp.id || index + 1} / ${waypoints.length}
                </span>
                <span style="font-size: 10px; color: #A7F3D0; font-family: 'JetBrains Mono', monospace;">+100 PTS</span>
              </div>
              <h4 style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 700; color: #FDFBF7; margin: 6px 0 0 0; line-height: 1.3;">
                ${wp.name}
              </h4>
            </div>

            <div style="padding: 12px 14px; background: #FDFAF5;">
              <p style="font-size: 11px; color: #44403C; line-height: 1.5; margin: 0 0 10px 0; font-style: italic;">
                "${wp.script ? wp.script.slice(0, 110) + '...' : 'Lắng nghe thuyết minh âm thanh di sản độc quyền từ nghệ nhân bản địa.'}"
              </p>

              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <button 
                  data-audio-wp-idx="${index}"
                  style="flex: 1; padding: 6px 10px; border-radius: 8px; background: linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%); color: #F3E5AB; border: 1px solid #D4AF37; font-size: 10px; font-weight: bold; font-family: 'JetBrains Mono', monospace; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
                >
                  <span>🎧 Nghe Audio Trạm</span>
                </button>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280, closeButton: true });
        markersRef.current.push(marker);
      });

      // Fit map bounds
      if (latlngs.length > 1) {
        map.fitBounds(latlngs, { padding: [45, 45], maxZoom: 16 });
      } else if (latlngs.length === 1) {
        map.setView(latlngs[0], 16);
      }
    }

    // ==========================================
    // CASE B: MULTI-QUEST EXPLORATION CATALOG
    // ==========================================
    else if (quests && quests.length > 0) {
      const questPoints: Array<[number, number]> = [];

      quests.forEach((quest, qIdx) => {
        // Retrieve representative coordinates (first waypoint or city coordinate)
        const lat = quest.waypoints?.[0]?.lat || (CITY_COORDINATES[quest.city]?.[0] || 21.0285) + (qIdx * 0.003 - 0.005);
        const lng = quest.waypoints?.[0]?.lng || (CITY_COORDINATES[quest.city]?.[1] || 105.8542) + (qIdx * 0.003 - 0.005);

        questPoints.push([lat, lng]);

        const markerHtml = `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid #D4AF37; animation: goldPulseRing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: ${qIdx * 0.3}s;"></div>
            <div style="
              position: relative;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%);
              color: #F3E5AB;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #D4AF37;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.4);
              font-family: 'Fraunces', serif;
              font-weight: 800;
              font-size: 13px;
              transition: transform 0.2s ease;
            ">
              <span>👑</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'gold-crest-quest-marker',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        // Vintage Heritage Invitation Card Popup
        const popupCardHtml = `
          <div style="width: 270px; font-family: 'Outfit', sans-serif; overflow: hidden; border-radius: 16px;">
            
            <!-- Card Thumbnail -->
            <div style="position: relative; height: 110px; width: 100%; overflow: hidden;">
              <img 
                src="${img(quest.imageId, 400, 220)}" 
                alt="${quest.name}" 
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);"></div>
              
              <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px;">
                <span style="background: rgba(15, 45, 30, 0.9); border: 1px solid rgba(212, 175, 55, 0.6); color: #F3E5AB; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
                  ${quest.city}
                </span>
                <span style="background: rgba(201, 125, 26, 0.9); color: white; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
                  ${quest.theme}
                </span>
              </div>

              <div style="position: absolute; bottom: 6px; left: 8px; right: 8px; display: flex; align-items: center; justify-content: space-between; color: white; font-family: 'JetBrains Mono', monospace; font-size: 10px;">
                <span>⏱️ ${quest.walkTime}</span>
                <span>⭐ ${quest.rating} (${quest.reviews})</span>
              </div>
            </div>

            <!-- Card Body -->
            <div style="padding: 12px 14px; background: #FDFAF5;">
              <h4 style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 700; color: #0F2D1E; margin: 0 0 4px 0; line-height: 1.3;">
                ${quest.name}
              </h4>
              <p style="font-size: 11px; color: #57534E; line-height: 1.4; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${quest.teaser}
              </p>

              <!-- Price & Action Button -->
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #E7E5E4; padding-top: 8px; margin-top: 4px;">
                <div>
                  <span style="font-size: 9px; color: #78716C; font-family: 'JetBrains Mono', monospace; display: block;">GIÁ VÉ</span>
                  <span style="font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; color: #C97D1A;">
                    ${formatPrice(quest.price)}
                  </span>
                </div>

                <button 
                  data-quest-id="${quest.id}"
                  style="padding: 7px 12px; border-radius: 10px; background: linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%); color: #F3E5AB; border: 1px solid #D4AF37; font-size: 11px; font-weight: bold; font-family: 'JetBrains Mono', monospace; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"
                >
                  <span>Khám Phá Ngay</span>
                  <span>→</span>
                </button>
              </div>
            </div>

          </div>
        `;

        marker.bindPopup(popupCardHtml, { maxWidth: 290, closeButton: true });
        markersRef.current.push(marker);
      });

      // Fit or center
      if (city !== 'Tất cả' && CITY_COORDINATES[city]) {
        map.setView(CITY_COORDINATES[city], CITY_DEFAULT_ZOOM[city] || 14, { animate: true });
      } else if (questPoints.length > 0) {
        map.fitBounds(questPoints, { padding: [50, 50], maxZoom: 14 });
      }
    } else {
      // Default City view
      if (CITY_COORDINATES[city]) {
        map.setView(CITY_COORDINATES[city], CITY_DEFAULT_ZOOM[city] || 14, { animate: true });
      }
    }
  }, [waypoints, quests, activeWaypointIndex, centerLat, centerLng, questName, city]);

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 group"
      style={{
        borderColor: '#D4AF37',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 25px rgba(212, 175, 55, 0.25)'
      }}
    >
      {/* Actual Map Render Target Container */}
      <div
        ref={mapContainerRef}
        className="z-0"
        style={{
          width: '100%',
          height: typeof height === 'number' ? `${height}px` : height,
          background: '#EAE6DF'
        }}
      />

      {/* Top Heritage Badge Overlay */}
      <div className="absolute top-3 left-3 z-[400] px-3.5 py-1.5 rounded-xl bg-[#0F2D1E]/90 backdrop-blur-md border border-[#D4AF37]/50 text-amber-200 text-xs font-mono flex items-center gap-2 shadow-xl pointer-events-none">
        <Sparkles size={13} className="text-amber-400 animate-spin [animation-duration:8s]" />
        <span className="font-bold tracking-wider uppercase">
          {waypoints.length > 0
            ? `LỘ TRÌNH KHO BÁU (${waypoints.length} TRẠM DỪNG)`
            : `BẢN ĐỒ KHO BÁU DI SẢN (${quests.length} QUESTS)`}
        </span>
      </div>

      {/* Bottom Floating Legend / City Tracker */}
      <div className="absolute bottom-3 right-3 z-[400] px-3 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-stone-700 text-stone-300 text-[10px] font-mono pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Tọa độ thực địa: {city}</span>
      </div>
    </div>
  );
}
