import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Navigation, Eye, EyeOff, Layers, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AIItinerary } from '../types';
import { geocodeLandmark } from '../utils/geocoder';

mapboxgl.accessToken = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN || '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapEvent {
  time: string;
  description: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}

interface ItineraryMapProps {
  itinerary: AIItinerary[];
  destinationName?: string;
}

// ─── Per-day colour palette ───────────────────────────────────────────────────
const DAY_COLORS = [
  { pin: '#DC2626', glow: 'rgba(220,38,38,0.55)',   bg: '#7F1D1D' }, // red
  { pin: '#9333EA', glow: 'rgba(147,51,234,0.55)',  bg: '#581C87' }, // purple
  { pin: '#0EA5E9', glow: 'rgba(14,165,233,0.55)',  bg: '#0C4A6E' }, // sky
  { pin: '#10B981', glow: 'rgba(16,185,129,0.55)',  bg: '#064E3B' }, // emerald
  { pin: '#F59E0B', glow: 'rgba(245,158,11,0.55)',  bg: '#78350F' }, // amber
  { pin: '#EC4899', glow: 'rgba(236,72,153,0.55)',  bg: '#831843' }, // pink
  { pin: '#06B6D4', glow: 'rgba(6,182,212,0.55)',   bg: '#164E63' }, // cyan
  { pin: '#84CC16', glow: 'rgba(132,204,22,0.55)',  bg: '#365314' }, // lime
];

// ─── Marker element factory ───────────────────────────────────────────────────
function createMarkerEl(
  stopIndex: number,
  dayIndex: number,
  col: typeof DAY_COLORS[0],
  isDimmed: boolean,
  isHighlighted: boolean
) {
  const size = isHighlighted ? 36 : isDimmed ? 22 : 28;
  const el = document.createElement('div');
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${col.pin};
    border: ${isHighlighted ? '3px' : '2px'} solid rgba(255,255,255,${isDimmed ? 0.5 : 0.9});
    box-shadow: 0 0 ${isHighlighted ? 20 : isDimmed ? 4 : 10}px ${col.glow},
                0 2px 8px rgba(0,0,0,${isDimmed ? 0.2 : 0.45});
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 900;
    font-size: ${isHighlighted ? 13 : isDimmed ? 8 : 10}px;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    opacity: ${isDimmed ? 0.45 : 1};
    position: relative;
  `;
  el.innerText = String(stopIndex + 1);
  return el;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ItineraryMap: React.FC<ItineraryMapProps> = ({ itinerary, destinationName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const markersRef   = useRef<mapboxgl.Marker[]>([]);
  const popupsRef    = useRef<mapboxgl.Popup[]>([]);

  const [loaded, setLoaded]               = useState(false);
  const [focusedDay, setFocusedDay]       = useState<number>(1); // 1 = Day 1 is default focused day
  const [mapStyle, setMapStyle]           = useState<'dark' | 'streets'>('streets');
  const [showRoutes, setShowRoutes]       = useState(false); // Default hide routes
  const [activeEvent, setActiveEvent]     = useState<(MapEvent & { dayNum: number }) | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false); // Default hide overlay

  // ── All valid locations across all days ────────────────────────────────────
  const allLocations = useCallback(() => {
    const result: Array<MapEvent & { lat: number; lng: number; dayNum: number; stopIdx: number }> = [];
    for (const day of itinerary) {
      let stopIdx = 0;
      for (const ev of day.events) {
        const geo = ev.locationName ? geocodeLandmark(ev.locationName) : null;
        const lat = geo ? geo.lat : ev.lat;
        const lng = geo ? geo.lng : ev.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          result.push({ ...ev, lat, lng, dayNum: day.day, stopIdx: stopIdx++ });
        }
      }
    }
    return result;
  }, [itinerary]);

  // ── Default centre ─────────────────────────────────────────────────────────
  const getDefaultCenter = useCallback((): [number, number] => {
    const locs = allLocations();
    if (locs.length > 0) return [locs[0].lng, locs[0].lat];
    return [55.2708, 25.2048]; // Dubai fallback
  }, [allLocations]);

  // ── Initialise Mapbox once ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: getDefaultCenter(),
      zoom: 11,
      pitch: 45,
      bearing: -8,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      // 3D buildings
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#1e293b',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.5, ['get', 'height']],
          'fill-extrusion-base':   ['interpolate', ['linear'], ['zoom'], 13, 0, 13.5, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.55,
        },
      });
      mapRef.current = map;
      setLoaded(true);
    });

    return () => { map.remove(); mapRef.current = null; setLoaded(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Switch map style ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    map.setStyle(mapStyle === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12');
    map.once('style.load', () => setLoaded(l => l)); // re-trigger marker draw
  }, [mapStyle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redraw ALL markers + routes whenever focus, itinerary, or style changes ─
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    // Clear existing
    markersRef.current.forEach(m => m.remove());
    popupsRef.current.forEach(p => p.remove());
    markersRef.current = [];
    popupsRef.current = [];

    // Remove old route layers
    for (let i = 0; i < 8; i++) {
      const id = `route-line-d${i}`;
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    }

    const bounds = new mapboxgl.LngLatBounds();
    const focusedBounds = new mapboxgl.LngLatBounds();
    let hasFocusedPoints = false;

    // Draw each day
    for (const day of itinerary) {
      if (focusedDay !== day.day) {
        continue; // Skip rendering other days entirely when a day is focused!
      }

      const dayIdx  = (day.day - 1) % DAY_COLORS.length;
      const col     = DAY_COLORS[dayIdx];
      const isDimmed = false; // Only focused day or all days are drawn (never dimmed)
      const isHighlightedDay = focusedDay === day.day;

      const dayLocs = day.events.map(e => {
        const geo = e.locationName ? geocodeLandmark(e.locationName) : null;
        return {
          ...e,
          lat: geo ? geo.lat : e.lat,
          lng: geo ? geo.lng : e.lng
        };
      }).filter(
        (e): e is MapEvent & { lat: number; lng: number } =>
          typeof e.lat === 'number' && typeof e.lng === 'number'
      );

      let stopIdx = 0;
      for (const loc of dayLocs) {
        const isHl = isHighlightedDay;
        const el = createMarkerEl(stopIdx, dayIdx, col, isDimmed, isHl);

        const popup = new mapboxgl.Popup({
          offset: 22,
          closeButton: false,
          className: 'idfc-popup',
          maxWidth: '240px',
        }).setHTML(`
          <div style="padding:12px 14px;font-family:system-ui,sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${col.pin};flex-shrink:0;"></div>
              <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:${col.pin};">
                Day ${day.day} · Stop ${stopIdx + 1} · ${loc.time}
              </span>
            </div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:4px;line-height:1.2;">
              ${loc.locationName || 'Location'}
            </div>
            <div style="font-size:11px;color:#475569;line-height:1.45;">
              ${loc.description}
            </div>
          </div>
        `);
        popupsRef.current.push(popup);

        const locRef = loc;
        el.addEventListener('mouseenter', () => {
          marker.setPopup(popup);
          popup.addTo(map);
        });
        el.addEventListener('mouseleave', () => popup.remove());
        el.addEventListener('click', () => {
          setActiveEvent({ ...locRef, dayNum: day.day });
          setFocusedDay(day.day);
        });

        const marker = new mapboxgl.Marker(el).setLngLat([loc.lng, loc.lat]).addTo(map);
        markersRef.current.push(marker);
        bounds.extend([loc.lng, loc.lat]);

        if (isHighlightedDay) {
          focusedBounds.extend([loc.lng, loc.lat]);
          hasFocusedPoints = true;
        }
        stopIdx++;
      }

      // Draw route line for this day
      if (showRoutes && dayLocs.length > 1) {
        const coords = dayLocs.map(l => [l.lng, l.lat]);
        const srcId = `route-line-d${dayIdx}`;
        map.addSource(srcId, {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
        });
        map.addLayer({
          id: srcId,
          type: 'line',
          source: srcId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': col.pin,
            'line-width': isDimmed ? 1 : isHighlightedDay ? 4 : 2.5,
            'line-opacity': isDimmed ? 0.25 : isHighlightedDay ? 0.95 : 0.65,
            'line-dasharray': isDimmed ? [2, 4] : [4, 2],
          },
        });
      }
    }

    // Fit camera
    const targetBounds = hasFocusedPoints ? focusedBounds : bounds;
    if (!targetBounds.isEmpty()) {
      map.fitBounds(targetBounds, {
        padding: { top: 80, bottom: 90, left: 80, right: sidebarOpen ? 260 : 80 },
        maxZoom: 15,
        duration: 1400,
        essential: true,
      });
    }
  }, [focusedDay, itinerary, loaded, showRoutes, sidebarOpen]);

  // ── Sidebar locations (focused day) ───────────────────────────────────────
  const sidebarLocs = allLocations().filter(l => l.dayNum === focusedDay);

  // ── Inject popup CSS ───────────────────────────────────────────────────────
  useEffect(() => {
    const id = 'mapbox-idfc-popup-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .idfc-popup {
        pointer-events: none !important;
      }
      .idfc-popup .mapboxgl-popup-content {
        border-radius: 16px !important;
        padding: 0 !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        border: 1px solid rgba(0,0,0,0.08) !important;
        overflow: hidden;
        pointer-events: none !important;
      }
      .idfc-popup .mapboxgl-popup-tip { display: none !important; }
      .mapboxgl-ctrl-attrib { font-size: 9px !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const activeDayColor = activeEvent
    ? DAY_COLORS[(activeEvent.dayNum - 1) % DAY_COLORS.length]
    : DAY_COLORS[0];

  return (
    <div className="relative w-full rounded-[28px] overflow-hidden shadow-2xl border border-slate-800 bg-slate-950"
         style={{ minHeight: '520px' }}>

      {/* ── Map Canvas ── */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '520px' }} />

      {/* ── Header Badge ── */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 border border-white/10 shadow-xl px-4 py-2.5 rounded-2xl"
             style={{ backgroundColor: '#0f172a' }}>
          <Compass size={13} className="text-red-500" style={{ animation: 'spin 8s linear infinite' }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {destinationName ? `${destinationName}` : 'Route Map'}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">
            · Day {focusedDay}
          </span>
        </div>
      </div>

      {/* ── Toggle buttons (top-right, left of NavControl) ── */}
      <div className="absolute top-4 right-[52px] z-20 flex gap-2 pointer-events-none">
        <button onClick={() => setShowRoutes(r => !r)} title={showRoutes ? 'Hide routes' : 'Show routes'}
          style={{ backgroundColor: '#0f172a' }}
          className="pointer-events-auto w-9 h-9 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600/80 transition-all shadow-lg">
          {showRoutes ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => setMapStyle(s => s === 'dark' ? 'streets' : 'dark')} title="Toggle map style"
          style={{ backgroundColor: '#0f172a' }}
          className="pointer-events-auto w-9 h-9 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-lg">
          <Layers size={14} />
        </button>
        <button onClick={() => setSidebarOpen(o => !o)} title="Toggle stop list"
          style={{ backgroundColor: '#0f172a' }}
          className="pointer-events-auto w-9 h-9 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-lg">
          {sidebarOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Day Focus Tabs (bottom bar) ─────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 flex-wrap pointer-events-none">
        {itinerary.map(day => {
          const col = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
          const isActive = focusedDay === day.day;
          return (
            <button
              key={day.day}
              onClick={() => { setFocusedDay(day.day); setActiveEvent(null); }}
              style={{
                backgroundColor: isActive ? col.pin : '#0f172a',
                borderColor: isActive ? col.pin : 'rgba(255,255,255,0.12)',
                boxShadow: isActive ? `0 0 14px ${col.glow}` : 'none',
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border backdrop-blur-xl transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isActive ? '#fff' : col.pin }} />
              Day {day.day}
            </button>
          );
        })}
      </div>

      {/* ── Stop Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && sidebarLocs.length > 0 && (
          <motion.div
            key="sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-20 w-56 max-h-[370px] overflow-y-auto space-y-1.5 scrollbar-thin"
          >
            {sidebarLocs.map((loc, idx) => {
              const col = DAY_COLORS[(loc.dayNum - 1) % DAY_COLORS.length];
              return (
                <motion.div
                  key={`${loc.dayNum}-${idx}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  role="button"
                  onClick={() => {
                    mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 900 });
                    setActiveEvent({ ...loc });
                    setFocusedDay(loc.dayNum);
                  }}
                  style={{ backgroundColor: '#090d16', cursor: 'pointer' }}
                  className="w-full text-left border border-slate-800 rounded-2xl p-2.5 shadow-2xl hover:border-slate-700 hover:bg-slate-900 transition-all group pointer-events-auto"
                >
                  <div className="flex items-start gap-2">
                    {/* Day color pill + stop number */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-0.5 pt-0.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black text-[9px] shadow"
                        style={{ background: col.pin, boxShadow: `0 0 6px ${col.glow}` }}
                      >
                        {loc.stopIdx + 1}
                      </div>
                      <span className="text-[8px] font-black uppercase" style={{ color: col.pin }}>D{loc.dayNum}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5 truncate">{loc.time}</p>
                      <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
                        {loc.locationName || loc.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Event Detail Card ── */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            key="event-detail"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            style={{ backgroundColor: '#090d16' }}
            className="absolute bottom-16 left-4 z-30 max-w-xs border border-slate-800 rounded-[20px] p-4 shadow-2xl pointer-events-auto"
          >
            <button onClick={() => setActiveEvent(null)}
              className="absolute top-3 right-3 w-6 h-6 bg-white/10 hover:bg-red-600/70 rounded-full flex items-center justify-center text-white transition-colors">
              <X size={11} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: activeDayColor.pin, boxShadow: `0 0 6px ${activeDayColor.glow}` }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeDayColor.pin }}>
                Day {activeEvent.dayNum} · {activeEvent.time}
              </span>
            </div>
            <h4 className="text-sm font-black text-white mb-1 leading-tight pr-6">
              {activeEvent.locationName || 'Location'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
              {activeEvent.description}
            </p>
            {activeEvent.lat && activeEvent.lng && (
              <p className="text-[9px] text-slate-600 font-mono mt-1.5">
                {activeEvent.lat.toFixed(4)}, {activeEvent.lng.toFixed(4)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {loaded && allLocations().length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl px-8 py-6 text-center border border-white/10 shadow-2xl">
            <Navigation size={32} className="text-red-500 mx-auto mb-3 opacity-60" />
            <p className="text-white font-black text-sm uppercase tracking-widest mb-1">No Locations Yet</p>
            <p className="text-slate-500 text-xs">Generate an AI itinerary to plot the route</p>
          </div>
        </div>
      )}

      {/* ── Loading overlay ── */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-xs font-bold uppercase tracking-widest">Loading Map…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryMap;
