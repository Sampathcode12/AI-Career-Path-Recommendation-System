import { prepareDb } from '../lib/db.js';
import { requireUser } from '../lib/requireUser.js';
import { sendJson } from '../lib/http.js';

function toResponse(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description ?? null,
    trend_data_json: row.trend_data_json ?? null,
    updated_at: row.updated_at,
  };
}

export async function handleMarketTrendsGet(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const rows = await db.collection('market_trends').find().sort({ category: 1 }).toArray();
    sendJson(res, 200, rows.map(toResponse));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load market trends.' });
  }
}
