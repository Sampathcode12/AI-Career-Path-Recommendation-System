import { prepareDb } from '../lib/db.js';
import { sendJson } from '../lib/http.js';

const FALLBACK_SPEC = 'General / Undeclared';

async function resolveSpecialization(db, input) {
  const exact = await db.collection('subject_career_paths').findOne({ specialization: input });
  if (exact) return input;

  const all = await db.collection('subject_career_paths').distinct('specialization');
  const ci = all.find((s) => s.toLowerCase() === input.toLowerCase());
  if (ci) return ci;
  return all.includes(FALLBACK_SPEC) ? FALLBACK_SPEC : input;
}

export async function handleIntakeSpecializations(req, res) {
  try {
    const db = await prepareDb();
    const specs = await db.collection('subject_career_paths').distinct('specialization');
    specs.sort((a, b) => a.localeCompare(b));
    sendJson(res, 200, specs.map((s) => ({ value: s, label: s })));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load specializations.' });
  }
}

export async function handleIntakeCareerPaths(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  const input = (url.searchParams.get('specialization') ?? '').trim();
  const q = (url.searchParams.get('q') ?? '').trim();

  if (!input) return sendJson(res, 400, { detail: 'specialization is required.' });

  try {
    const db = await prepareDb();
    const resolved = await resolveSpecialization(db, input);
    const filter = { specialization: resolved };
    let rows = await db.collection('subject_career_paths')
      .find(filter)
      .sort({ sort_order: 1, path_label: 1 })
      .toArray();

    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter((r) => r.path_label.toLowerCase().includes(lower));
    }

    sendJson(res, 200, {
      specialization: input,
      resolved_specialization: resolved,
      paths: rows.map((r) => ({ value: r.path_label, label: r.path_label })),
    });
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load career paths.' });
  }
}
