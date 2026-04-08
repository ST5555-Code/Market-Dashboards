import PanelCard from '@shared/components/PanelCard';
import { SPORTS_RIGHTS } from '../config';

export default function SportsRightsPanel() {
  return (
    <PanelCard title="Sports Broadcast Rights">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-txt-secondary text-[9px] uppercase tracking-wider">
            <th className="text-left py-1">League</th>
            <th className="text-right py-1">Annual</th>
            <th className="text-right py-1">Expires</th>
            <th className="text-left py-1 pl-3">Holders</th>
          </tr>
        </thead>
        <tbody>
          {SPORTS_RIGHTS.map((r) => (
            <tr key={r.league} className="border-t border-white/5">
              <td className="py-1.5 text-gold font-semibold">{r.league}</td>
              <td className="py-1.5 text-right text-txt-primary font-medium tabular-nums">{r.annual}</td>
              <td className="py-1.5 text-right text-txt-secondary tabular-nums">{r.expires}</td>
              <td className="py-1.5 pl-3 text-txt-secondary text-[9px]">{r.holders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelCard>
  );
}
