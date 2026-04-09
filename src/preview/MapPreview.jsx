import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  OIL_SITES, REFINERIES, TERMINALS, US_BASES, GCC_BASES, IRAN_BASES,
  NUCLEAR_SITES, INBOUND_LANE, OUTBOUND_LANE, PETROLINE,
  FUJAIRAH_PIPE, MAP_CENTER, MAP_ZOOM,
} from '../hormuz/config';

// Emoji icons for specific categories
const refineryIcon = L.divIcon({ html: `<div style="font-size:18px;line-height:1;">🏭</div>`, className: '', iconAnchor: [9, 9] });
const usBaseIcon = L.divIcon({ html: `<div style="font-size:16px;line-height:1;">🇺🇸</div>`, className: '', iconAnchor: [8, 8] });
const iranBaseIcon = L.divIcon({ html: `<div style="font-size:16px;line-height:1;">🇮🇷</div>`, className: '', iconAnchor: [8, 8] });
const nuclearIcon = L.divIcon({ html: `<div style="font-size:18px;line-height:1;">☢️</div>`, className: '', iconAnchor: [9, 9] });

const LAYERS = [
  { key: 'lanes', label: 'Shipping Lanes', color: '#38BDF8' },
  { key: 'pipes', label: 'Pipelines', color: '#F59E0B' },
  { key: 'oil', label: 'Oil & Gas', color: '#C0392B' },
  { key: 'ref', label: '🏭 Refineries', emoji: true },
  { key: 'term', label: 'Terminals', color: '#3B82F6' },
  { key: 'us', label: '🇺🇸 US Bases', emoji: true },
  { key: 'gcc', label: 'GCC Bases', color: '#27AE60' },
  { key: 'ir', label: '🇮🇷 Iran Bases', emoji: true },
  { key: 'nuc', label: '☢️ Nuclear', emoji: true },
];

const DEFAULTS = { lanes: true, pipes: true, oil: true, ref: false, term: false, us: true, gcc: false, ir: true, nuc: true };

// CircleMarker layer for Oil, Terminals, GCC
function MarkerLayer({ items, color, size = 6 }) {
  return items.map((s, i) => (
    <CircleMarker
      key={i}
      center={s.pos}
      radius={size}
      pathOptions={{ color: '#FFFFFF', fillColor: color, fillOpacity: 0.85, weight: 1.5 }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <div style={{ fontWeight: 600 }}>{s.flag && `${s.flag} `}{s.name}</div>
        {s.detail && <div style={{ fontSize: 11 }}>{s.detail}</div>}
        {s.cap && <div style={{ fontSize: 11 }}>Capacity: {s.cap}</div>}
      </Tooltip>
    </CircleMarker>
  ));
}

// Emoji Marker layer for Refineries, Bases, Nuclear
function EmojiMarkerLayer({ items, icon }) {
  return items.map((s, i) => (
    <Marker key={i} position={s.pos} icon={icon}>
      <Tooltip direction="top" offset={[0, -8]}>
        <div style={{ fontWeight: 600 }}>{s.flag && `${s.flag} `}{s.name}</div>
        {s.detail && <div style={{ fontSize: 11 }}>{s.detail}</div>}
        {s.cap && <div style={{ fontSize: 11 }}>Capacity: {s.cap}</div>}
      </Tooltip>
    </Marker>
  ));
}

export default function MapPreview() {
  const [layers, setLayers] = useState(() => ({ ...DEFAULTS }));

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-container {
        background: #1A3A5C;
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        font-size: 12px;
        letter-spacing: 0.02em;
      }
      .leaflet-tile-pane { filter: none; }
      .leaflet-overlay-pane canvas,
      .leaflet-tile-pane .leaflet-layer:last-child img {
        opacity: 0.9;
      }
      .leaflet-tooltip {
        background: rgba(28, 35, 51, 0.95) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        color: #FFFFFF !important;
        border-radius: 4px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 11px !important;
        padding: 6px 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
      }
      .leaflet-tooltip-top::before { border-top-color: rgba(255,255,255,0.2) !important; }
      .leaflet-tooltip-right::before { border-right-color: rgba(255,255,255,0.2) !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const toggle = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ background: '#1E2846', minHeight: '100vh', padding: 16, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#DCB96E', fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>
        MAP PREVIEW — Satellite Imagery
      </h1>
      <div style={{ borderRadius: 8, overflow: 'hidden', height: 500 }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          minZoom={4}
          maxZoom={12}
          style={{ height: '100%', width: '100%', background: '#1A3A5C' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA'
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            opacity={1.0}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            opacity={1.0}
          />

          {/* Chokepoint */}
          <CircleMarker
            center={[26.57, 56.25]}
            radius={14}
            pathOptions={{ color: '#C0392B', fillColor: '#C0392B', fillOpacity: 0.15, weight: 2, dashArray: '4,4' }}
          >
            <Tooltip direction="top">
              <div style={{ fontWeight: 700 }}>Strait of Hormuz</div>
              <div style={{ fontSize: 11 }}>20M b/d at risk · 21 nm wide · ~20% global oil</div>
            </Tooltip>
          </CircleMarker>

          {/* Shipping lanes — bolder */}
          {layers.lanes && (
            <>
              <Polyline positions={INBOUND_LANE} pathOptions={{ color: '#D4CCC4', weight: 3, opacity: 0.6 }}>
                <Tooltip sticky>Inbound lane (Gulf of Oman → Persian Gulf)</Tooltip>
              </Polyline>
              <Polyline positions={OUTBOUND_LANE} pathOptions={{ color: '#D4CCC4', weight: 3, opacity: 0.6, dashArray: '6,4' }}>
                <Tooltip sticky>Outbound lane (Persian Gulf → Gulf of Oman)</Tooltip>
              </Polyline>
            </>
          )}

          {/* Pipelines — bolder */}
          {layers.pipes && (
            <>
              <Polyline positions={PETROLINE} pathOptions={{ color: '#F59E0B', weight: 4, opacity: 0.8 }}>
                <Tooltip sticky>Saudi E-W Petroline · 5M b/d · Abqaiq → Yanbu</Tooltip>
              </Polyline>
              <Polyline positions={FUJAIRAH_PIPE} pathOptions={{ color: '#F59E0B', weight: 4, opacity: 0.7, dashArray: '5,3' }}>
                <Tooltip sticky>UAE Fujairah Pipeline · 1.8M b/d · Habshan → Fujairah</Tooltip>
              </Polyline>
            </>
          )}

          {/* CircleMarker layers */}
          {layers.oil && <MarkerLayer items={OIL_SITES} color="#C0392B" size={7} />}
          {layers.term && <MarkerLayer items={TERMINALS} color="#3B82F6" size={5} />}
          {layers.gcc && <MarkerLayer items={GCC_BASES} color="#27AE60" size={5} />}

          {/* Emoji Marker layers */}
          {layers.ref && <EmojiMarkerLayer items={REFINERIES} icon={refineryIcon} />}
          {layers.us && <EmojiMarkerLayer items={US_BASES} icon={usBaseIcon} />}
          {layers.ir && <EmojiMarkerLayer items={IRAN_BASES} icon={iranBaseIcon} />}
          {layers.nuc && <EmojiMarkerLayer items={NUCLEAR_SITES} icon={nuclearIcon} />}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px 16px', marginTop: 12,
        background: 'rgba(28, 35, 51, 0.92)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6, padding: '8px 12px',
      }}>
        {LAYERS.map(l => (
          <button
            key={l.key}
            onClick={() => toggle(l.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 10,
              cursor: 'pointer', opacity: layers[l.key] ? 1 : 0.3,
              background: 'none', border: 'none', color: '#FFFFFF',
            }}
          >
            {l.emoji ? null : (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            )}
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
