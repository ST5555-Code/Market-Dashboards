import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

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

export default function NewsFeedPanel({ title, feeds, keywords, limit = 14, interval = 600000 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const keywordsRegex = keywords ? new RegExp(keywords.join('|'), 'i') : null;

  const fetchFeeds = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const results = await Promise.allSettled(
        feeds.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`, {
            signal: AbortSignal.timeout(8000), // 8s per feed max
          });
          if (!res.ok) return [];
          const json = await res.json();
          return (json.items || []).map(item => ({ ...item, feedSource: feed.source }));
        })
      );
      if (!mountedRef.current) return;

      let allItems = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);

      if (keywordsRegex) {
        allItems = allItems.filter(item => keywordsRegex.test(item.title + ' ' + (item.description || '')));
      }

      const seen = new Set();
      const deduped = allItems
        .map(item => ({
          ...item,
          source: extractSource(item.title) || item.feedSource,
          title: cleanTitle(item.title),
        }))
        .filter(item => {
          const key = item.title.toLowerCase().slice(0, 50);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      deduped.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setItems(deduped.slice(0, limit));
      setLastUpdated(new Date());
    } catch { /* silent */ } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, [feeds, keywordsRegex, limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchFeeds();
    const id = setInterval(fetchFeeds, interval);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchFeeds, interval]);

  return (
    <PanelCard title={title} loading={loading} lastUpdated={lastUpdated} onRefresh={fetchFeeds}>
      <div className="max-h-[350px] overflow-y-auto">
        {items.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No headlines</p>
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
            </div>
          </a>
        ))}
      </div>
    </PanelCard>
  );
}
