import { useState, useEffect, useRef } from 'react';

// Loads stock list from /api/symbols for a given dashboard key
// Falls back to provided defaults if API fails
export default function useSymbols(dashboardKey, defaults = []) {
  const [stocks, setStocks] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchSymbols() {
      try {
        const res = await fetch('/config/symbols.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!mountedRef.current) return;

        const dashboard = data[dashboardKey];
        if (!dashboard) return;

        const stockList = dashboard.stocks || dashboard;
        if (!Array.isArray(stockList)) return;

        // Map sector codes to display names
        const sectorMap = dashboard._sectors || {};
        const defaultNames = {
          major: 'Majors', etf: 'ETFs', oil: 'Oil E&P', gas: 'Gas',
          ofs: 'Oilfield Services', power: 'Power / Utilities',
          solar: 'Solar', wind: 'Wind', nuclear: 'Nuclear',
          h2: 'Hydrogen / Fuel Cell', mineral: 'Critical Minerals',
        };
        const mapped = stockList.map(s => ({
          ...s,
          sector: sectorMap[s.sector] || defaultNames[s.sector] || s.sector || '?',
        }));

        setStocks(mapped);
      } catch {
        // silent — keep defaults
      } finally {
        if (mountedRef.current) setLoaded(true);
      }
    }

    fetchSymbols();
    return () => { mountedRef.current = false; };
  }, [dashboardKey]);

  return { stocks, loaded };
}
