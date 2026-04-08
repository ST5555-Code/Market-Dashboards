import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import PanelCard from '@shared/components/PanelCard';
import { OIL_SITES, MILITARY_BASES, MAP_CENTER, MAP_ZOOM } from '../config';

// Custom marker icons
function makeIcon(color, size = 10) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid #1E2846;box-shadow:0 0 4px ${color}80;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const oilIcon = makeIcon('#DCB96E', 12);
const militaryIcon = makeIcon('#C94040', 10);
const chokeIcon = makeIcon('#FF4444', 16);

export default function HormuzMap() {
  return (
    <PanelCard title="Strait of Hormuz — Strategic Map">
      <div className="rounded overflow-hidden" style={{ height: 500 }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          minZoom={5}
          maxZoom={12}
          style={{ height: '100%', width: '100%', background: '#0a1628' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri"
            className="map-tiles-dark"
          />

          {/* Oil infrastructure */}
          {OIL_SITES.map((site, i) => (
            <Marker
              key={`oil-${i}`}
              position={site.pos}
              icon={site.flag === '!' ? chokeIcon : oilIcon}
            >
              <Tooltip direction="top" offset={[0, -8]} className="custom-tooltip">
                <span className="font-semibold">{site.label}</span>
                <br />
                <span className="text-xs">{site.detail}</span>
              </Tooltip>
            </Marker>
          ))}

          {/* Military bases */}
          {MILITARY_BASES.map((base, i) => (
            <Marker key={`mil-${i}`} position={base.pos} icon={militaryIcon}>
              <Tooltip direction="top" offset={[0, -8]} className="custom-tooltip">
                <span className="font-semibold">{base.label}</span>
                <br />
                <span className="text-xs">{base.flag} — {base.detail}</span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[9px] text-txt-secondary">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" /> Oil Infrastructure
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-neg inline-block" /> Military / Nuclear
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#FF4444] inline-block" /> Chokepoint
        </span>
      </div>
    </PanelCard>
  );
}
