import { prepareDb } from '../lib/db.js';
import { requireUser } from '../lib/requireUser.js';
import { sendJson } from '../lib/http.js';

function toResponse(row) {
  return {
    id: row.id,
    industry_id: row.industry_id,
    name: row.name,
    description: row.description ?? null,
    demand_growth: row.demand_growth,
    top_demand_skills: row.top_demand_skills ?? [],
    gap_skills: row.gap_skills ?? [],
    supply_level: row.supply_level,
    top_regions: row.top_regions?.length ? row.top_regions : null,
    typical_salary_range: row.typical_salary_range ?? null,
    typical_education: row.typical_education ?? null,
    typical_certifications: row.typical_certifications ?? null,
  };
}

export async function handleSkillGapGetAll(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const url = new URL(req.url || '/', 'http://localhost');
  const industry = url.searchParams.get('industry');

  try {
    const db = await prepareDb();
    const filter = industry && industry !== 'all' ? { industry_id: industry } : {};
    const rows = await db.collection('industry_skill_gaps').find(filter).sort({ name: 1 }).toArray();
    sendJson(res, 200, rows.map(toResponse));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load skill gaps.' });
  }
}
