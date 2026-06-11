import { prepareDb } from '../lib/db.js';
import { nextSequence } from '../lib/counters.js';
import { requireUser } from '../lib/requireUser.js';
import { readJsonBody, sendJson } from '../lib/http.js';

function toResponse(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    answers_json: row.answers_json ?? null,
    result_summary: row.result_summary ?? null,
    created_at: row.created_at,
  };
}

export async function handleAssessmentGet(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const row = await db.collection('assessments')
      .find({ user_id: claims.id })
      .sort({ created_at: -1 })
      .limit(1)
      .next();
    if (!row) return sendJson(res, 404, { detail: 'No assessment found.' });
    sendJson(res, 200, toResponse(row));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load assessment.' });
  }
}

export async function handleAssessmentCreate(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const body = readJsonBody(req) ?? {};
  const answersJson = body.answers_json ?? body.answersJson ?? null;
  const resultSummary = body.result_summary ?? body.resultSummary ?? null;

  try {
    const db = await prepareDb();
    const row = {
      id: await nextSequence('assessments'),
      user_id: claims.id,
      answers_json: answersJson,
      result_summary: resultSummary,
      created_at: new Date(),
    };
    await db.collection('assessments').insertOne(row);
    sendJson(res, 200, toResponse(row));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not save assessment.' });
  }
}
