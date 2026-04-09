// /api/admin-save.js — Save symbols.json to GitHub via server-side token
// No browser-side PAT needed. Protected by ADMIN_PIN.

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_PIN = process.env.ADMIN_PIN || 'admin';
const REPO = 'ST5555-Code/Market-Dashboards';
const FILE_PATH = 'public/config/symbols.json';
const BRANCH = 'main';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://market-dashboards.vercel.app');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }


  const { pin, symbols } = req.body || {};

  if ((pin || '').trim() !== (ADMIN_PIN || '').trim()) {
    return res.status(403).json({ error: 'Invalid PIN' });
  }

  if (!symbols || typeof symbols !== 'object') {
    return res.status(400).json({ error: 'Missing symbols data' });
  }

  try {
    // Get current file SHA (required for update)
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!getRes.ok) throw new Error(`GitHub GET ${getRes.status}`);
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // Commit updated file
    const content = Buffer.from(JSON.stringify(symbols, null, 2) + '\n').toString('base64');
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update symbols.json via admin panel',
          content,
          sha,
          branch: BRANCH,
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub PUT ${putRes.status}: ${errText.slice(0, 200)}`);
    }

    return res.status(200).json({ ok: true, message: 'Saved and deploying' });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
