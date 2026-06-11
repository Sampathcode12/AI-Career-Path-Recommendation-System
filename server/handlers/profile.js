import { prepareDb } from '../lib/db.js';
import { nextSequence } from '../lib/counters.js';
import { requireUser } from '../lib/requireUser.js';
import { readJsonBody, sendJson } from '../lib/http.js';

function pick(body, snake, camel) {
  if (body == null) return undefined;
  if (body[snake] !== undefined) return body[snake];
  return body[camel];
}

function profileToResponse(p, displayName) {
  return {
    id: p.id,
    user_id: p.user_id,
    display_name: displayName ?? p.display_name ?? null,
    skills: p.skills ?? null,
    interests: p.interests ?? null,
    experience_level: p.experience_level ?? null,
    education: p.education ?? null,
    preferred_industries: p.preferred_industries ?? null,
    location: p.location ?? null,
    bio: p.bio ?? null,
    linked_in_url: p.linked_in_url ?? null,
    portfolio_url: p.portfolio_url ?? null,
    gender: p.gender ?? null,
    ug_course: p.ug_course ?? null,
    ug_specialization: p.ug_specialization ?? null,
    ug_cgpa_or_percentage: p.ug_cgpa_or_percentage ?? null,
    has_additional_certifications: p.has_additional_certifications ?? null,
    certificate_course_titles: p.certificate_course_titles ?? null,
    is_working: p.is_working ?? null,
    first_job_title: p.first_job_title ?? null,
    masters_field: p.masters_field ?? null,
    updated_at: p.updated_at ?? null,
  };
}

function mapRequestToFields(body) {
  return {
    skills: pick(body, 'skills', 'skills'),
    interests: pick(body, 'interests', 'interests'),
    experience_level: pick(body, 'experience_level', 'experienceLevel'),
    education: pick(body, 'education', 'education'),
    preferred_industries: pick(body, 'preferred_industries', 'preferredIndustries'),
    location: pick(body, 'location', 'location'),
    bio: pick(body, 'bio', 'bio'),
    linked_in_url: pick(body, 'linked_in_url', 'linkedInUrl'),
    portfolio_url: pick(body, 'portfolio_url', 'portfolioUrl'),
    display_name: pick(body, 'display_name', 'displayName'),
    gender: pick(body, 'gender', 'gender'),
    ug_course: pick(body, 'ug_course', 'ugCourse'),
    ug_specialization: pick(body, 'ug_specialization', 'ugSpecialization'),
    ug_cgpa_or_percentage: pick(body, 'ug_cgpa_or_percentage', 'ugCgpaOrPercentage'),
    has_additional_certifications: pick(body, 'has_additional_certifications', 'hasAdditionalCertifications'),
    certificate_course_titles: pick(body, 'certificate_course_titles', 'certificateCourseTitles'),
    is_working: pick(body, 'is_working', 'isWorking'),
    first_job_title: pick(body, 'first_job_title', 'firstJobTitle'),
    masters_field: pick(body, 'masters_field', 'mastersField'),
  };
}

async function loadUserName(db, userId) {
  const user = await db.collection('users').findOne({ id: userId });
  return user?.name ?? null;
}

export async function handleProfileGet(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  try {
    const db = await prepareDb();
    const profile = await db.collection('user_profiles').findOne({ user_id: claims.id });
    if (!profile) return sendJson(res, 404, { detail: 'Profile not found.' });
    const name = await loadUserName(db, claims.id);
    sendJson(res, 200, profileToResponse(profile, name));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load profile.' });
  }
}

export async function handleProfileCreate(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const body = readJsonBody(req) ?? {};
  const fields = mapRequestToFields(body);

  try {
    const db = await prepareDb();
    const existing = await db.collection('user_profiles').findOne({ user_id: claims.id });
    if (existing) return sendJson(res, 400, { detail: 'Profile already exists. Use PUT to update.' });

    if (fields.display_name?.trim()) {
      await db.collection('users').updateOne({ id: claims.id }, { $set: { name: fields.display_name.trim() } });
    }

    const now = new Date();
    const profile = {
      id: await nextSequence('user_profiles'),
      user_id: claims.id,
      ...fields,
      updated_at: now,
    };
    await db.collection('user_profiles').insertOne(profile);
    const name = await loadUserName(db, claims.id);
    sendJson(res, 200, profileToResponse(profile, name));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not create profile.' });
  }
}

export async function handleProfileUpdate(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const body = readJsonBody(req) ?? {};
  const fields = mapRequestToFields(body);

  try {
    const db = await prepareDb();
    let profile = await db.collection('user_profiles').findOne({ user_id: claims.id });
    if (!profile) {
      req.body = body;
      return handleProfileCreate(req, res);
    }

    if (fields.display_name?.trim()) {
      await db.collection('users').updateOne({ id: claims.id }, { $set: { name: fields.display_name.trim() } });
    }

    const patch = { updated_at: new Date() };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    await db.collection('user_profiles').updateOne({ user_id: claims.id }, { $set: patch });
    profile = await db.collection('user_profiles').findOne({ user_id: claims.id });
    const name = await loadUserName(db, claims.id);
    sendJson(res, 200, profileToResponse(profile, name));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not update profile.' });
  }
}
