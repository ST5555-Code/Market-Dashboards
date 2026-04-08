import PanelCard from '@shared/components/PanelCard';
import { FUEL_CREDITS } from '../config';

export default function FuelCreditsPanel() {
  return (
    <PanelCard title="Fuel Credits" compact>
      {FUEL_CREDITS.map((m) => (
        <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
          <div>
            <span className="text-[10px] text-txt-secondary">{m.label}</span>
            <span className={`text-[7px] font-bold ml-1 px-1 py-0.5 rounded ${
              m.tag === 'LIVE' ? 'bg-pos/15 text-pos' : 'bg-gold/15 text-gold'
            }`}>{m.tag}</span>
          </div>
          <div className="text-right">
            <span className="text-[13px] font-bold text-txt-primary tabular-nums">{m.price}</span>
            <span className="text-[8px] text-txt-secondary ml-1">{m.unit}</span>
          </div>
        </div>
      ))}
      <div className="text-[7px] text-txt-secondary text-center mt-1">~ = weekly manual</div>
    </PanelCard>
  );
}
