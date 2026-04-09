import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import PanelCard from '@shared/components/PanelCard';
import {
  OIL_SITES, REFINERIES, TERMINALS, US_BASES, GCC_BASES, IRAN_BASES,
  NUCLEAR_SITES, CITIES, INBOUND_LANE, OUTBOUND_LANE, PETROLINE,
  FUJAIRAH_PIPE, MAP_CENTER, MAP_ZOOM,
} from '../config';

const LAYERS = [
  { key: 'lanes', label: 'Shipping Lanes', color: '#38BDF8', defaultOn: true },
  { key: 'pipes', label: 'Pipelines', color: '#F59E0B', defaultOn: true },
  { key: 'oil', label: 'Oil & Gas', color: '#DCB96E', defaultOn: true },
  { key: 'ref', label: 'Refineries', color: '#A855F7', defaultOn: false },
  { key: 'term', label: 'Terminals', color: '#3B82F6', defaultOn: false },
  { key: 'us', label: 'US Bases', color: '#60A5FA', defaultOn: true },
  { key: 'gcc', label: 'GCC Bases', color: '#4CAF7D', defaultOn: false },
  { key: 'ir', label: 'Iran Bases', color: '#C94040', defaultOn: true },
  { key: 'nuc', label: 'Nuclear', color: '#FF6B6B', defaultOn: true },
  { key: 'cities', label: 'Cities', color: '#A0AEC0', defaultOn: true },
];

function MarkerLayer({ items, color, size = 6 }) {
  return items.map((s, i) => (
    <CircleMarker
      key={i}
      center={s.pos}
      radius={size}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 1.5 }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <div style={{ fontWeight: 600 }}>{s.flag && `${s.flag} `}{s.name}</div>
        {s.detail && <div style={{ fontSize: 11 }}>{s.detail}</div>}
        {s.cap && <div style={{ fontSize: 11 }}>Capacity: {s.cap}</div>}
      </Tooltip>
    </CircleMarker>
  ));
}

export default function HormuzMap() {
  const [layers, setLayers] = useState(() => {
    const init = {};
    LAYERS.forEach(l => init[l.key] = l.defaultOn);
    return init;
  });

  const toggle = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <PanelCard title="Strategic Map">
      <div className="rounded overflow-hidden" style={{ height: 340 }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          minZoom={4}
          maxZoom={12}
          style={{ height: '100%', width: '100%', background: '#141E35' }}
          scrollWheelZoom={true}
        >
          {/* CartoDB Dark Matter — dark navy ocean, subtle labels, no CSS filter needed */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
          />

          {/* Chokepoint */}
          <CircleMarker
            center={[26.57, 56.25]}
            radius={14}
            pathOptions={{ color: '#C94040', fillColor: '#C94040', fillOpacity: 0.15, weight: 2, dashArray: '4,4' }}
          >
            <Tooltip direction="top">
              <div style={{ fontWeight: 700 }}>Strait of Hormuz</div>
              <div style={{ fontSize: 11 }}>20M b/d at risk · 21 nm wide</div>
              <div style={{ fontSize: 11 }}>~27% global seaborne oil · ~20% global LNG</div>
            </Tooltip>
          </CircleMarker>

          {/* Shipping lanes */}
          {layers.lanes && (
            <>
              <Polyline positions={INBOUND_LANE} pathOptions={{ color: '#38BDF8', weight: 2.5, opacity: 0.85 }}>
                <Tooltip sticky>Inbound lane (Gulf of Oman → Persian Gulf)</Tooltip>
              </Polyline>
              <Polyline positions={OUTBOUND_LANE} pathOptions={{ color: '#38BDF8', weight: 2.5, opacity: 0.85, dashArray: '6,4' }}>
                <Tooltip sticky>Outbound lane (Persian Gulf → Gulf of Oman)</Tooltip>
              </Polyline>
            </>
          )}

          {/* Pipelines */}
          {layers.pipes && (
            <>
              <Polyline positions={PETROLINE} pathOptions={{ color: '#F59E0B', weight: 2.5, opacity: 0.9 }}>
                <Tooltip sticky>Saudi E-W Petroline · 5M b/d · Abqaiq → Yanbu</Tooltip>
              </Polyline>
              <Polyline positions={FUJAIRAH_PIPE} pathOptions={{ color: '#F59E0B', weight: 2, opacity: 0.75, dashArray: '5,3' }}>
                <Tooltip sticky>UAE Fujairah Pipeline · 1.8M b/d · Habshan → Fujairah</Tooltip>
              </Polyline>
            </>
          )}

          {layers.oil && <MarkerLayer items={OIL_SITES} color="#DCB96E" size={7} />}
          {layers.ref && <MarkerLayer items={REFINERIES} color="#A855F7" size={5} />}
          {layers.term && <MarkerLayer items={TERMINALS} color="#3B82F6" size={5} />}
          {layers.us && <MarkerLayer items={US_BASES} color="#60A5FA" size={6} />}
          {layers.gcc && <MarkerLayer items={GCC_BASES} color="#4CAF7D" size={5} />}
          {layers.ir && <MarkerLayer items={IRAN_BASES} color="#C94040" size={6} />}
          {layers.nuc && <MarkerLayer items={NUCLEAR_SITES} color="#FF6B6B" size={7} />}

          {/* Cities — small white dots with labels */}
          {layers.cities && CITIES.map((c, i) => (
            <CircleMarker
              key={i}
              center={c.pos}
              radius={3}
              pathOptions={{ color: '#A0AEC0', fillColor: '#A0AEC0', fillOpacity: 0.9, weight: 0.5 }}
            >
              <Tooltip permanent direction="right" offset={[6, 0]} className="city-label">
                <span style={{ fontSize: 9, color: '#A0AEC0' }}>{c.name}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Clickable legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {LAYERS.map(l => (
          <button
            key={l.key}
            onClick={() => toggle(l.key)}
            className={`flex items-center gap-1 text-[8px] cursor-pointer transition-opacity ${layers[l.key] ? 'opacity-100' : 'opacity-30'}`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-txt-secondary">{l.label}</span>
          </button>
        ))}
      </div>
    </PanelCard>
  );
}
