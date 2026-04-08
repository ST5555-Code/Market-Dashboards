// /api/symbols.js — Serve stock symbol config for all dashboards
// Edit /config/symbols.json via the admin panel and push to update.
// Reads from the static config bundled at build time.

import { readFileSync } from 'fs';
import { join } from 'path';

let symbols;
try {
  const filePath = join(process.cwd(), 'public', 'config', 'symbols.json');
  symbols = JSON.parse(readFileSync(filePath, 'utf8'));
} catch {
  symbols = {};
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json(symbols);
}
