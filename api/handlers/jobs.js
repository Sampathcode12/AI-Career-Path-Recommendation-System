import { prepareDb } from '../lib/db.js';
import { nextSequence } from '../lib/counters.js';
import { requireUser } from '../lib/requireUser.js';
import { readJsonBody, sendJson } from '../lib/http.js';

const RX_ENTRY = /\b(junior|intern|internship|trainee|graduate|entry[-\s]?level|associate\s+(software|developer|engineer)|\bjr\.?\b)\b/i;
const RX_SENIOR = /\b(senior|principal(\s+|$)|staff\s+(software|engineer|data|ml)|\bsr\.?\b|chief\s+|director|vice\s+president|\bvp\b|architect|head\s+of|tech\s+lead|team\s+lead|engineering\s+manager|lead\s+(software|developer|engineer))\b/i;

const CATEGORY_TO_INDUSTRY = {
  Technology: 'technology',
  Finance: 'finance',
  Healthcare: 'healthcare',
  Education: 'education',
  Manufacturing: 'manufacturing',
  'Energy & Utilities': 'energy',
  Energy: 'energy',
  Retail: 'retail',
  Construction: 'construction',
  Hospitality: 'hospitality',
  Transportation: 'transportation',
  'Real Estate': 'realestate',
  Media: 'media',
  'Media & Entertainment': 'media',
  Legal: 'legal',
  Government: 'government',
  Agriculture: 'agriculture',
  Mining: 'mining',
  'Professional Services': 'professional',
  'Creative & Design': 'creative',
  Nonprofit: 'nonprofit',
  Telecom: 'telecom',
  Aerospace: 'aerospace',
  Marketing: 'marketing',
  Business: 'professional',
};

function jobToListing(j) {
  return {
    id: j.id,
    title: j.title,
    company: j.company ?? null,
    location: j.location ?? null,
    country: j.country ?? null,
    sector: j.sector ?? null,
    category: j.category ?? null,
    salary_range: j.salary_range ?? null,
    growth: j.growth ?? null,
    description: j.description ?? null,
    url: j.url ?? null,
    skills: j.skills ?? [],
    career_path: null,
  };
}

function matchesCategory(job, category) {
  const catLower = category.trim().toLowerCase();
  const jCat = (job.category ?? '').trim().toLowerCase();
  const jSec = (job.sector ?? '').trim().toLowerCase();
  return jCat === catLower
    || jSec === catLower
    || jSec.startsWith(`${catLower} `)
    || jSec.startsWith(`${catLower}&`)
    || jSec.startsWith(`${catLower}/`);
}

function filterJobs(jobs, { category, country, query, location, sector }) {
  let list = jobs;
  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((j) =>
      (j.title ?? '').toLowerCase().includes(q)
      || (j.company ?? '').toLowerCase().includes(q)
      || (j.sector ?? '').toLowerCase().includes(q)
      || (j.category ?? '').toLowerCase().includes(q));
  }
  if (location?.trim()) {
    const loc = location.trim().toLowerCase();
    list = list.filter((j) => (j.location ?? '').toLowerCase().includes(loc));
  }
  if (category?.trim() && category.trim().toLowerCase() !== 'all') {
    list = list.filter((j) => matchesCategory(j, category));
  }
  if (sector?.trim()) {
    const s = sector.trim().toLowerCase();
    list = list.filter((j) => (j.sector ?? '').toLowerCase().includes(s));
  }
  if (country?.trim()) {
    const c = country.trim();
    list = list.filter((j) => j.country === c);
  }
  return list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
}

function classifyLevel(title) {
  if (!title?.trim()) return 'Mid-level';
  if (RX_SENIOR.test(title)) return 'Senior-level';
  if (RX_ENTRY.test(title)) return 'Entry-level';
  return 'Mid-level';
}

function packCounts(dict, max) {
  return Object.entries(dict)
    .sort((a, b) => b[1].count - a[1].count || a[1].display.localeCompare(b[1].display))
    .slice(0, max)
    .map(([, v]) => ({ value: v.display, count: v.count }));
}

export async function handleJobsCategories(req, res) {
  if (!requireUser(req, res)) return;
  try {
    const db = await prepareDb();
    const cats = await db.collection('job_listings').distinct('category');
    const trimmed = cats.map((c) => (c ?? '').trim()).filter(Boolean).sort((a, b) => a.localeCompare(b));
    sendJson(res, 200, [{ value: 'All', label: 'All categories' }, ...trimmed.map((c) => ({ value: c, label: c }))]);
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load categories.' });
  }
}

export async function handleJobsSearch(req, res) {
  if (!requireUser(req, res)) return;
  const body = readJsonBody(req) ?? {};
  try {
    const db = await prepareDb();
    const all = await db.collection('job_listings').find().toArray();
    const list = filterJobs(all, {
      query: body.query ?? body.Query,
      location: body.location ?? body.Location,
      category: body.category ?? body.Category,
      sector: body.sector ?? body.Sector,
      country: body.country ?? body.Country,
    }).slice(0, 100);
    sendJson(res, 200, list.map(jobToListing));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Search failed.' });
  }
}

export async function handleJobsTop(req, res) {
  if (!requireUser(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');
  const category = url.searchParams.get('category') ?? '';
  const country = url.searchParams.get('country') ?? '';
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 10), 1), 100);

  try {
    const db = await prepareDb();
    const all = await db.collection('job_listings').find().toArray();
    const list = filterJobs(all, { category, country }).slice(0, limit);
    sendJson(res, 200, list.map(jobToListing));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load jobs.' });
  }
}

export async function handleJobsTitleSuggestions(req, res) {
  if (!requireUser(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const category = url.searchParams.get('category') ?? '';
  const country = url.searchParams.get('country') ?? '';
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 15), 1), 30);

  try {
    const db = await prepareDb();
    const all = await db.collection('job_listings').find().toArray();
    const filtered = filterJobs(all, { category, country });
    const counts = {};
    for (const j of filtered) {
      const t = (j.title ?? '').trim();
      if (!t) continue;
      if (q && !t.toLowerCase().includes(q)) continue;
      const key = t.toLowerCase();
      counts[key] = counts[key] ? { title: t, count: counts[key].count + 1 } : { title: t, count: 1 };
    }
    const list = Object.values(counts)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
      .slice(0, limit)
      .map((x) => ({ title: x.title, listing_count: x.count }));
    sendJson(res, 200, list);
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load suggestions.' });
  }
}

export async function handleJobsRoleSearch(req, res) {
  if (!requireUser(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 25), 1), 50);

  try {
    const db = await prepareDb();
    let list = await db.collection('job_listings').find().toArray();
    if (q) {
      list = list.filter((j) =>
        (j.title ?? '').toLowerCase().includes(q)
        || (j.company ?? '').toLowerCase().includes(q));
      list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    sendJson(res, 200, list.slice(0, limit).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company ?? null,
      location: j.location ?? null,
      category: j.category ?? null,
      sector: j.sector ?? null,
      skills: j.skills ?? [],
    })));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Role search failed.' });
  }
}

export async function handleJobsSkillsByLevel(req, res) {
  if (!requireUser(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');
  const minCount = Math.min(Math.max(Number(url.searchParams.get('minCount') || 1), 1), 100);
  const maxPerLevel = Math.min(Math.max(Number(url.searchParams.get('maxPerLevel') || 80), 5), 200);

  try {
    const db = await prepareDb();
    const jobs = await db.collection('job_listings').find({ skills: { $exists: true, $ne: [] } }).toArray();
    const buckets = { 'Entry-level': {}, 'Mid-level': {}, 'Senior-level': {} };

    for (const j of jobs) {
      const level = classifyLevel(j.title);
      const dict = buckets[level];
      for (const raw of j.skills ?? []) {
        const trimmed = String(raw).trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        dict[key] = dict[key] ? { display: dict[key].display, count: dict[key].count + 1 } : { display: trimmed, count: 1 };
      }
    }

    const pack = (dict) => Object.values(dict)
      .filter((v) => v.count >= minCount)
      .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
      .slice(0, maxPerLevel)
      .map((v) => ({ name: v.display, count: v.count }));

    sendJson(res, 200, [
      { level: 'Entry-level', skills: pack(buckets['Entry-level']) },
      { level: 'Mid-level', skills: pack(buckets['Mid-level']) },
      { level: 'Senior-level', skills: pack(buckets['Senior-level']) },
    ]);
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load skills by level.' });
  }
}

export async function handleJobsRoleInsights(req, res) {
  if (!requireUser(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');
  const title = (url.searchParams.get('title') ?? '').trim();
  const category = url.searchParams.get('category') ?? '';
  const country = url.searchParams.get('country') ?? '';

  if (!title) return sendJson(res, 400, { detail: "Query parameter 'title' is required." });

  try {
    const db = await prepareDb();
    const all = await db.collection('job_listings').find().toArray();
    const tLower = title.toLowerCase();
    let list = filterJobs(all, { category, country }).filter((j) => (j.title ?? '').trim().toLowerCase() === tLower);

    if (!list.length) {
      return sendJson(res, 200, {
        title,
        matching_listing_count: 0,
        posting_salary_ranges: [],
        posting_growth_labels: [],
        common_skills: [],
        industry_hints: null,
      });
    }

    const salaryDict = {};
    const growthDict = {};
    const skillDict = {};
    for (const j of list) {
      const sr = (j.salary_range ?? '').trim();
      if (sr) {
        const k = sr.toLowerCase();
        salaryDict[k] = salaryDict[k] ? { display: salaryDict[k].display, count: salaryDict[k].count + 1 } : { display: sr, count: 1 };
      }
      const gr = (j.growth ?? '').trim();
      if (gr) {
        const k = gr.toLowerCase();
        growthDict[k] = growthDict[k] ? { display: growthDict[k].display, count: growthDict[k].count + 1 } : { display: gr, count: 1 };
      }
      for (const sk of j.skills ?? []) {
        const trimmed = String(sk).trim();
        if (!trimmed) continue;
        const k = trimmed.toLowerCase();
        skillDict[k] = skillDict[k] ? { display: skillDict[k].display, count: skillDict[k].count + 1 } : { display: trimmed, count: 1 };
      }
    }

    const catCounts = {};
    for (const j of list) {
      const c = (j.category ?? '').trim();
      if (!c) continue;
      catCounts[c] = (catCounts[c] ?? 0) + 1;
    }
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const industryId = topCategory ? (CATEGORY_TO_INDUSTRY[topCategory] ?? topCategory.toLowerCase()) : null;

    let industryHints = null;
    if (industryId) {
      const gap = await db.collection('industry_skill_gaps').findOne({ industry_id: industryId });
      if (gap) {
        industryHints = {
          industry_name: gap.name,
          demand_growth: gap.demand_growth,
          typical_salary_range: gap.typical_salary_range ?? null,
          typical_education: gap.typical_education ?? null,
          typical_certifications: gap.typical_certifications ?? null,
        };
      }
    }

    sendJson(res, 200, {
      title,
      matching_listing_count: list.length,
      posting_salary_ranges: packCounts(salaryDict, 8),
      posting_growth_labels: packCounts(growthDict, 6),
      common_skills: packCounts(skillDict, 24),
      industry_hints: industryHints,
    });
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load role insights.' });
  }
}

export async function handleJobsSavedGet(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const rows = await db.collection('saved_jobs').find({ user_id: claims.id }).sort({ saved_at: -1 }).toArray();
    sendJson(res, 200, rows.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company ?? null,
      location: r.location ?? null,
      url: r.url ?? null,
      description: r.description ?? null,
      saved_at: r.saved_at,
    })));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load saved jobs.' });
  }
}

export async function handleJobsSave(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const body = readJsonBody(req) ?? {};
  const title = String(body.title ?? '').trim();
  if (!title) return sendJson(res, 400, { detail: 'Title is required.' });

  try {
    const db = await prepareDb();
    const row = {
      id: await nextSequence('saved_jobs'),
      user_id: claims.id,
      title,
      company: body.company ?? null,
      location: body.location ?? null,
      url: body.url ?? null,
      description: body.description ?? null,
      saved_at: new Date(),
    };
    await db.collection('saved_jobs').insertOne(row);
    sendJson(res, 200, {
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      url: row.url,
      description: row.description,
      saved_at: row.saved_at,
    });
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not save job.' });
  }
}
