import PanelCard from '@shared/components/PanelCard';
import { STREAMING_SCOREBOARD } from '../config';

export default function StreamingScoreboard() {
  return (
    <PanelCard title="Streaming Scoreboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {STREAMING_SCOREBOARD.map((s) => (
          <div key={s.name} className="bg-navy rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-txt-secondary mb-1">{s.name}</div>
            <div className="text-[18px] font-bold text-txt-primary tabular-nums">{s.subs}</div>
            <div className="text-[8px] text-txt-secondary">subscribers</div>
          </div>
        ))}
      </div>
      <div className="text-[8px] text-txt-secondary mt-2 text-center">Latest reported figures · ~ = estimated</div>
    </PanelCard>
  );
}
