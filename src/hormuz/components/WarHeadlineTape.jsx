import { useState, useEffect, useCallback, useRef } from 'react';
import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

const HEADLINE_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=Iran+IRGC+Hormuz+war+missile+strike+Israel&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
];

const WAR_KW = /iran|hormuz|irgc|tehran|strait|missile|attack|strike|military|sanctions|nuclear|houthi|war|israel|hezbollah|drone|navy/i;

function cleanTitle(t) { return t.replace(/\s-\s[^-]+$/, '').trim(); }

export default function WarHeadlineTape() {
  const [headlines, setHeadlines] = useState([]);
  const mountedRef = useRef(true);

  const fetchHeadlines = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        HEADLINE_FEEDS.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.items || []).map(item => ({ ...item, source: feed.source }));
        })
      );
      if (!mountedRef.current) return;

      const all = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000; // last 24 hours
      const filtered = all
        .filter(item => {
          if (!WAR_KW.test(item.title)) return false;
          const pubDate = new Date(item.pubDate);
          return !isNaN(pubDate.getTime()) && pubDate.getTime() > cutoff;
        })
        .map(item => cleanTitle(item.title));

      const seen = new Set();
      const deduped = filtered.filter(t => {
        const k = t.toLowerCase().slice(0, 40);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      setHeadlines(deduped.slice(0, 15));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchHeadlines();
    const id = setInterval(fetchHeadlines, 300000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchHeadlines]);

  return (
    <div className="bg-[#8B1A1A] border-b border-[#C94040]/50 flex items-center">
      <div className="bg-white text-[#8B1A1A] text-[10px] font-bold py-2 tracking-wider flex-shrink-0 z-10 w-[70px] text-center">
        ALERT
      </div>
      <div className="flex-1 overflow-hidden py-1.5">
        {headlines.length === 0 ? (
          <div className="text-white/50 text-[12px] px-5">Loading headlines...</div>
        ) : (
          <Marquee speed={30} pauseOnHover gradient={false}>
            {headlines.map((h, i) => (
              <span key={i} className="text-white text-[12px] px-6 border-r border-white/20">
                {h}
              </span>
            ))}
          </Marquee>
        )}
      </div>
    </div>
  );
}
