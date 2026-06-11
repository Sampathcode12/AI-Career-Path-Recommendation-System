import { prepareDb } from '../lib/db.js';
import { sendJson } from '../lib/http.js';

export async function handleHealthDb(_req, res) {
  try {
    const db = await prepareDb();
    await db.command({ ping: 1 });
    sendJson(res, 200, {
      ok: true,
      database: db.databaseName,
      provider: 'mongodb',
    });
  } catch (err) {
    sendJson(res, 503, {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      error_type: 'MongoConnection',
    });
  }
}
