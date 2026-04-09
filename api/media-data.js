// /api/media-data.js — Server-side proxy for TMDB + iTunes
// Avoids CORS issues by fetching from server

const TMDB_KEY = process.env.VITE_TMDB_API_KEY;
const ITUNES_URL = 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/10/songs.json';

const STUDIO_MAP = {
  'Walt Disney Pictures': 'Disney', 'Marvel Studios': 'Disney', 'Pixar': 'Disney',
  'Lucasfilm Ltd.': 'Disney', '20th Century Studios': 'Disney', 'Searchlight Pictures': 'Disney',
  'Warner Bros. Pictures': 'Warner', 'New Line Cinema': 'Warner', 'DC Studios': 'Warner',
  'Universal Pictures': 'Universal', 'Illumination': 'Universal', 'DreamWorks Animation': 'Universal',
  'Focus Features': 'Universal', 'Blumhouse Productions': 'Universal',
  'Columbia Pictures': 'Sony', 'Sony Pictures': 'Sony', 'TriStar Pictures': 'Sony',
  'Screen Gems': 'Sony', 'Sony Pictures Animation': 'Sony',
  'Paramount Pictures': 'Paramount', 'Paramount Animation': 'Paramount',
  'Lionsgate': 'Lionsgate', 'Lionsgate Films': 'Lionsgate', 'Summit Entertainment': 'Lionsgate',
  'A24': 'A24', 'NEON': 'NEON',
};

function mapStudio(companies) {
  for (const co of companies || []) {
    if (STUDIO_MAP[co.name]) return STUDIO_MAP[co.name];
  }
  return 'Other';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://market-dashboards.vercel.app');
  res.setHeader('Content-Type', 'application/json');

  const type = req.query?.type;

  // iTunes Music Charts
  if (type === 'music') {
    try {
      const r = await fetch(ITUNES_URL, {
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) throw new Error(`iTunes ${r.status}`);
      const data = await r.json();
      const songs = (data.feed?.results || []).slice(0, 8).map((s, i) => ({
        rank: i + 1,
        name: s.name,
        artist: s.artistName,
        artwork: s.artworkUrl100,
        url: s.url,
      }));
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json({ songs });
    } catch (e) {
      return res.status(502).json({ error: e.message });
    }
  }

  // TMDB Studio Momentum
  if (type === 'studios') {
    if (!TMDB_KEY) return res.status(500).json({ error: 'TMDB key not configured' });
    try {
      const r = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&page=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!r.ok) throw new Error(`TMDB ${r.status}`);
      const data = await r.json();

      // Fetch details for each movie to get production companies
      const counts = {};
      const details = await Promise.allSettled(
        (data.results || []).slice(0, 20).map(async (m) => {
          const dr = await fetch(
            `https://api.themoviedb.org/3/movie/${m.id}?api_key=${TMDB_KEY}&language=en-US`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (!dr.ok) return null;
          return dr.json();
        })
      );

      for (const d of details) {
        if (d.status === 'fulfilled' && d.value) {
          const studio = mapStudio(d.value.production_companies);
          counts[studio] = (counts[studio] || 0) + 1;
        }
      }

      const sorted = Object.entries(counts)
        .map(([studio, count]) => ({ studio, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ studios: sorted });
    } catch (e) {
      return res.status(502).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Missing type param (music or studios)' });
}
