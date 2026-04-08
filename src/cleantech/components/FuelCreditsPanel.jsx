import PanelCard from '@shared/components/PanelCard';
import { FUEL_CREDITS } from '../config';

export default function FuelCreditsPanel() {
  return (
    <PanelCard title="Fuel Credits" compact>
      <div className="flex flex-col gap-2">
        {FUEL_CREDITS.map((m) => (
          <div key={m.label} className="bg-navy rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-txt-secondary">{m.label}</span>
              <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                m.tag === 'LIVE' ? 'bg-pos/15 text-pos' : 'bg-gold/15 text-gold'
              }`}>{m.tag}</span>
            </div>
            <div className="text-[16px] font-bold text-txt-primary tabular-nums leading-tight">
              {m.price} <span className="text-[9px] text-txt-secondary font-normal">{m.unit}</span>
            </div>
            <div className="text-[7px] text-txt-secondary">{m.source}</div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
