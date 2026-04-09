import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import {
  OIL_SITES, REFINERIES, TERMINALS, US_BASES, GCC_BASES, IRAN_BASES,
  NUCLEAR_SITES, CITIES, INBOUND_LANE, OUTBOUND_LANE, PETROLINE,
  FUJAIRAH_PIPE, MAP_CENTER, MAP_ZOOM,
} from '../hormuz/config';

const LAYERS = [
  { key: 'lanes', label: 'Shipping Lanes', color: '#38BDF8', defaultOn: true },
  { key: 'pipes', label: 'Pipelines', color: '#F59E0B', defaultOn: true },
  { key: 'oil', label: 'Oil & Gas', color: '#C0392B', defaultOn: true },
  { key: 'ref', label: 'Refineries', color: '#A855F7', defaultOn: false },
  { key: 'term', label: 'Terminals', color: '#3B82F6', defaultOn: false },
  { key: 'us', label: 'US Bases', color: '#2980B9', defaultOn: true },
  { key: 'gcc', label: 'GCC Bases', color: '#27AE60', defaultOn: false },
  { key: 'ir', label: 'Iran Bases', color: '#C0392B', defaultOn: true },
  { key: 'nuc', label: 'Nuclear', color: '#E74C3C', defaultOn: true },
  { key: 'cities', label: 'Cities', color: '#4A4A4A', defaultOn: true },
];

function MarkerLayer({ items, color, size = 6 }) {
  return items.map((s, i) => (
    <CircleMarker
      key={i}
      center={s.pos}
      radius={size}
      pathOptions={{ color: '#FFFFFF', fillColor: color, fillOpacity: 0.85, weight: 1.5 }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <div style={{ fontWeight: 600, color: '#4A4A4A' }}>{s.flag && `${s.flag} `}{s.name}</div>
        {s.detail && <div style={{ fontSize: 11, color: '#666' }}>{s.detail}</div>}
        {s.cap && <div style={{ fontSize: 11, color: '#666' }}>Capacity: {s.cap}</div>}
      </Tooltip>
    </CircleMarker>
  ));
}

export default function MapPreview() {
  const [layers, setLayers] = useState(() => {
    const init = {};
    LAYERS.forEach(l => init[l.key] = l.defaultOn);
    return init;
  });

  // Inject satellite-adjacent styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-container { background: #AAD3DF; }
      .leaflet-tile-pane { filter: saturate(1.8) brightness(0.78) contrast(1.15) hue-rotate(-15deg); }
      .leaflet-tooltip {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid #B0A898 !important;
        color: #4A4A4A !important;
        border-radius: 4px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 11px !important;
        padding: 6px 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      }
      .leaflet-tooltip-top::before { border-top-color: #B0A898 !important; }
      .leaflet-tooltip-right::before { border-right-color: #B0A898 !important; }
      .city-label-preview {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .city-label-preview::before { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const toggle = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ background: '#1E2846', minHeight: '100vh', padding: 16, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#DCB96E', fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>
        MAP PREVIEW — Satellite-Adjacent Light Palette
      </h1>
      <div style={{ borderRadius: 8, overflow: 'hidden', height: 500 }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          minZoom={4}
          maxZoom={12}
          style={{ height: '100%', width: '100%', background: '#AAD3DF' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
          />

          {/* Chokepoint */}
          <CircleMarker
            center={[26.57, 56.25]}
            radius={14}
            pathOptions={{ color: '#C0392B', fillColor: '#C0392B', fillOpacity: 0.15, weight: 2, dashArray: '4,4' }}
          >
            <Tooltip direction="top">
              <div style={{ fontWeight: 700, color: '#4A4A4A' }}>Strait of Hormuz</div>
              <div style={{ fontSize: 11, color: '#666' }}>20M b/d at risk · 21 nm wide · ~20% global oil</div>
            </Tooltip>
          </CircleMarker>

          {/* Shipping lanes — muted route lines */}
          {layers.lanes && (
            <>
              <Polyline positions={INBOUND_LANE} pathOptions={{ color: '#D4CCC4', weight: 2.5, opacity: 0.6 }}>
                <Tooltip sticky>Inbound lane (Gulf of Oman → Persian Gulf)</Tooltip>
              </Polyline>
              <Polyline positions={OUTBOUND_LANE} pathOptions={{ color: '#D4CCC4', weight: 2.5, opacity: 0.6, dashArray: '6,4' }}>
                <Tooltip sticky>Outbound lane (Persian Gulf → Gulf of Oman)</Tooltip>
              </Polyline>
            </>
          )}

          {/* Pipelines */}
          {layers.pipes && (
            <>
              <Polyline positions={PETROLINE} pathOptions={{ color: '#F59E0B', weight: 2.5, opacity: 0.8 }}>
                <Tooltip sticky>Saudi E-W Petroline · 5M b/d · Abqaiq → Yanbu</Tooltip>
              </Polyline>
              <Polyline positions={FUJAIRAH_PIPE} pathOptions={{ color: '#F59E0B', weight: 2, opacity: 0.7, dashArray: '5,3' }}>
                <Tooltip sticky>UAE Fujairah Pipeline · 1.8M b/d · Habshan → Fujairah</Tooltip>
              </Polyline>
            </>
          )}

          {layers.oil && <MarkerLayer items={OIL_SITES} color="#C0392B" size={7} />}
          {layers.ref && <MarkerLayer items={REFINERIES} color="#A855F7" size={5} />}
          {layers.term && <MarkerLayer items={TERMINALS} color="#3B82F6" size={5} />}
          {layers.us && <MarkerLayer items={US_BASES} color="#2980B9" size={6} />}
          {layers.gcc && <MarkerLayer items={GCC_BASES} color="#27AE60" size={5} />}
          {layers.ir && <MarkerLayer items={IRAN_BASES} color="#C0392B" size={6} />}
          {layers.nuc && <MarkerLayer items={NUCLEAR_SITES} color="#E74C3C" size={7} />}

          {/* Cities — dark labels on light map */}
          {layers.cities && CITIES.map((c, i) => (
            <CircleMarker
              key={i}
              center={c.pos}
              radius={3}
              pathOptions={{ color: '#4A4A4A', fillColor: '#4A4A4A', fillOpacity: 0.9, weight: 0.5 }}
            >
              <Tooltip permanent direction="right" offset={[6, 0]} className="city-label-preview">
                <span style={{ fontSize: 10, color: '#4A4A4A', fontWeight: 500 }}>{c.name}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', marginTop: 12 }}>
        {LAYERS.map(l => (
          <button
            key={l.key}
            onClick={() => toggle(l.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 10,
              cursor: 'pointer', opacity: layers[l.key] ? 1 : 0.3,
              background: 'none', border: 'none', color: '#A0AEC0',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
