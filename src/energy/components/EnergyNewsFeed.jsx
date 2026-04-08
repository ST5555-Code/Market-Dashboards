import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';
import { NEWS_FEEDS } from '../config';

const ENERGY_KEYWORDS = /oil|gas|crude|brent|wti|lng|upstream|e&p|permian|shale|energy|petroleum|opec|refin|pipeline|midstream|drilling|offshore|hydrocarbon/i;

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function cleanTitle(title) {
  return title.replace(/\s-\s[^-]+$/, '').trim();
}

function extractSource(title) {
  const m = title.match(/\s-\s([^-]+)$/);
  return m ? m[1].trim() : null;
}

function deriveTag(text) {
  const t = text.toLowerCase();
  if (t.match(/acqui|merger|buyout|takeover/)) return { label: 'M&A', cls: 'bg-neg/15 text-neg' };
  if (t.includes('opec')) return { label: 'OPEC', cls: 'bg-gold/15 text-gold' };
  if (t.match(/price|barrel|rally|decline|surge/)) return { label: 'Price', cls: 'bg-[#5A82AF]/15 text-[#5A82AF]' };
  if (t.match(/financ|debt|bond|note|loan/)) return { label: 'Finance', cls: 'bg-purple-500/15 text-purple-400' };
  return null;
}

export default function EnergyNewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchFeeds = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        NEWS_FEEDS.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.items || []).map(item => ({ ...item, feedSource: feed.source }));
        })
      );
      if (!mountedRef.current) return;

      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Filter for energy, deduplicate
      const seen = new Set();
      const filtered = allItems
        .filter(item => ENERGY_KEYWORDS.test(item.title + ' ' + (item.description || '')))
        .map(item => ({
          ...item,
          source: extractSource(item.title) || item.feedSource,
          title: cleanTitle(item.title),
          tag: deriveTag(item.title + ' ' + (item.description || '')),
        }))
        .filter(item => {
          const key = item.title.toLowerCase().slice(0, 50);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setItems(filtered.slice(0, 14));
      setLastUpdated(new Date());
    } catch { /* silent */ } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchFeeds();
    const id = setInterval(fetchFeeds, 600000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchFeeds]);

  return (
    <PanelCard title="Energy Business News" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchFeeds}>
      <div className="max-h-[280px] overflow-y-auto">
        {items.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No energy headlines</p>
        )}
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
          >
            <p className="text-[11px] text-txt-primary leading-snug">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] text-txt-secondary uppercase">{item.source}</span>
              <span className="text-[8px] text-txt-secondary">{timeAgo(item.pubDate)}</span>
              {item.tag && (
                <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${item.tag.cls}`}>
                  {item.tag.label}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </PanelCard>
  );
}
