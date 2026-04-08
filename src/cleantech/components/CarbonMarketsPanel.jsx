import PanelCard from '@shared/components/PanelCard';
import { CARBON_MARKETS } from '../config';

export default function CarbonMarketsPanel() {
  return (
    <PanelCard title="Carbon & Credit Markets">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {CARBON_MARKETS.map((m) => (
          <div key={m.label} className="bg-navy rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-txt-secondary">{m.label}</span>
              <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                m.tag === 'LIVE' ? 'bg-pos/15 text-pos' : 'bg-gold/15 text-gold'
              }`}>
                {m.tag}
              </span>
            </div>
            <div className="text-[16px] font-bold text-txt-primary tabular-nums">
              {m.price} <span className="text-[9px] text-txt-secondary font-normal">{m.unit}</span>
            </div>
            <div className="text-[8px] text-txt-secondary mt-0.5">{m.source}</div>
          </div>
        ))}
      </div>
      <div className="text-[8px] text-txt-secondary mt-2 text-center">~ = weekly manual update</div>
    </PanelCard>
  );
}
