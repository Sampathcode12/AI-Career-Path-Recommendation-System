import { prepareDb } from '../lib/db.js';
import { nextSequence } from '../lib/counters.js';
import { requireUser } from '../lib/requireUser.js';
import { readJsonBody, sendJson } from '../lib/http.js';
import { buildTemplateRows, hasMinimumCareerIntake } from '../lib/templateCatalog.js';
import { buildChatReply, buildTemplateCatalogReply } from '../lib/chatFallback.js';

function recToResponse(row) {
  let match = null;
  let salary = null;
  let growth = null;
  let skills = null;
  let learningPath = null;

  if (row.metadata_json) {
    try {
      const meta = typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json;
      match = meta.match_percentage ?? meta.matchPercentage ?? null;
      salary = meta.salary_range ?? meta.salaryRange ?? null;
      growth = meta.growth ?? null;
      skills = meta.skills ?? null;
      learningPath = meta.learning_path ?? meta.learningPath ?? null;
    } catch {
      /* ignore */
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description ?? null,
    category: row.category ?? null,
    saved: !!row.saved,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    match_percentage: match,
    salary_range: salary,
    growth,
    skills,
    learning_path: learningPath,
  };
}

function geminiConfigured() {
  return !!(process.env.GEMINI_API_KEY || process.env.GEMINI_APIKEY);
}

export async function handleRecommendationsAiSetupStatus(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;
  sendJson(res, 200, {
    llm_configured: geminiConfigured(),
    provider: geminiConfigured() ? 'Gemini' : 'None',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  });
}

export async function handleRecommendationsGetAll(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const rows = await db.collection('career_recommendations')
      .find({ user_id: claims.id })
      .sort({ sort_order: 1 })
      .toArray();
    sendJson(res, 200, rows.map(recToResponse));
  } catch {
    sendJson(res, 200, []);
  }
}

export async function handleRecommendationsGenerate(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const profile = await db.collection('user_profiles').findOne({ user_id: claims.id });
    if (!hasMinimumCareerIntake(profile)) {
      return sendJson(res, 200, { recommendations: [], generation_source: 'survey_required' });
    }

    const templateRows = buildTemplateRows(profile);
    await db.collection('career_recommendations').deleteMany({ user_id: claims.id });

    const now = new Date();
    const docs = [];
    for (let i = 0; i < templateRows.length; i++) {
      const row = templateRows[i];
      docs.push({
        id: await nextSequence('career_recommendations'),
        user_id: claims.id,
        title: row.title,
        description: row.desc,
        category: row.category,
        saved: false,
        sort_order: i,
        created_at: now,
        metadata_json: JSON.stringify({
          match_percentage: row.match,
          salary_range: row.salary,
          growth: row.growth,
          skills: ['Communication', 'Problem solving', 'Domain knowledge'],
        }),
      });
    }
    if (docs.length) await db.collection('career_recommendations').insertMany(docs);

    const generationSource = geminiConfigured() ? 'template_no_key' : 'template_no_key';
    sendJson(res, 200, {
      recommendations: docs.map(recToResponse),
      generation_source: generationSource,
    });
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not generate recommendations.' });
  }
}

export async function handleRecommendationSave(req, res, params) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const id = Number(params.id);
  const url = new URL(req.url || '/', 'http://localhost');
  const saved = url.searchParams.get('saved') === 'true';

  try {
    const db = await prepareDb();
    const row = await db.collection('career_recommendations').findOne({ id, user_id: claims.id });
    if (!row) return sendJson(res, 404, { detail: 'Recommendation not found.' });
    await db.collection('career_recommendations').updateOne({ id, user_id: claims.id }, { $set: { saved } });
    const updated = await db.collection('career_recommendations').findOne({ id });
    sendJson(res, 200, recToResponse(updated));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not update recommendation.' });
  }
}

export async function handleRecommendationsChat(req, res) {
  try {
    const claims = requireUser(req, res);
    if (!claims) return;

    const body = readJsonBody(req) ?? {};
    const message = String(body.message ?? '').trim();
    if (!message) return sendJson(res, 400, { detail: 'Message is required.' });

    const db = await prepareDb();
    const rows = await db.collection('career_recommendations')
      .find({ user_id: claims.id })
      .sort({ sort_order: 1 })
      .toArray();
    const recs = rows.map(recToResponse);
    const reply = recs.length
      ? buildChatReply(message, recs)
      : buildTemplateCatalogReply(message);

    sendJson(res, 200, { reply });
  } catch {
    sendJson(res, 200, {
      reply:
        'I could not finish that reply. Your recommendations are still listed above—try asking about a specific job title from those cards.',
    });
  }
}
