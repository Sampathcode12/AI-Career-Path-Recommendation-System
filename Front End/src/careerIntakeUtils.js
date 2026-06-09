import {
  UG_COURSE_OPTIONS,
  UG_SPECIALIZATION_OPTIONS,
  normalizeIntakeOptionValue,
} from './constants/careerIntakeOptions';

/** Parse free-text Yes/No (and common variants) for API booleans. */
export function parseYesNo(text) {
  const t = (text ?? '').trim().toLowerCase();
  if (!t) return null;
  if (['y', 'yes', 'true', '1'].includes(t)) return true;
  if (['n', 'no', 'false', '0'].includes(t)) return false;
  return null;
}

/** Read profile JSON: snake_case (.NET default here), camelCase, or PascalCase. */
function pick(snap, snakeKey, camelKey) {
  if (!snap || typeof snap !== 'object') return undefined;
  const pascal =
    camelKey && camelKey.length > 0
      ? camelKey.charAt(0).toUpperCase() + camelKey.slice(1)
      : null;
  const keys = [snakeKey, camelKey, pascal].filter(Boolean);
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(snap, k)) continue;
    const val = snap[k];
    if (val != null && val !== '') return val;
  }
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(snap, k)) continue;
    const val = snap[k];
    if (val !== undefined) return val;
  }
  return undefined;
}

const CAREER_INTAKE_DRAFT_PREFIX = 'career_intake_draft_v1';

/** Stable key per logged-in user for browser draft of the career survey form. */
export function careerIntakeDraftStorageKey(user) {
  if (!user || typeof user !== 'object') return null;
  const id =
    user.id ??
    user.Id ??
    user.user_id ??
    user.userId ??
    user.sub ??
    user.email ??
    user.Email;
  if (id == null || id === '') return null;
  return `${CAREER_INTAKE_DRAFT_PREFIX}:${id}`;
}

export function loadCareerIntakeDraft(user) {
  const key = careerIntakeDraftStorageKey(user);
  if (!key || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return o;
  } catch {
    return null;
  }
}

export function saveCareerIntakeDraft(user, recForm) {
  const key = careerIntakeDraftStorageKey(user);
  if (!key || typeof localStorage === 'undefined' || !recForm) return;
  try {
    localStorage.setItem(key, JSON.stringify(recForm));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Merge one intake field: prefer a non-empty API value (saved profile), else local draft, else base.
 * Avoids wiping the form when the API returns null/empty for fields that were never persisted but exist in draft.
 */
function mergeIntakeField(fromApi, draftVal, baseVal, key) {
  if (key === 'hasCertsText' || key === 'isWorkingText') {
    const apiOk = fromApi === 'Yes' || fromApi === 'No';
    const drOk = draftVal === 'Yes' || draftVal === 'No';
    if (apiOk) return fromApi;
    if (drOk) return draftVal;
    return '';
  }
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  if (s(fromApi)) return typeof fromApi === 'string' ? fromApi.trim() : String(fromApi);
  if (s(draftVal)) return typeof draftVal === 'string' ? draftVal.trim() : String(draftVal);
  if (s(baseVal)) return typeof baseVal === 'string' ? baseVal.trim() : String(baseVal);
  return '';
}

/**
 * Form state when opening the career survey: non-empty API wins; otherwise draft; otherwise defaults.
 */
export function buildInitialRecForm(snap, user) {
  const base = mapProfileToRecForm(null, user);
  const fromApi = mapProfileToRecForm(snap, user);
  const draft = loadCareerIntakeDraft(user) || {};
  const allowed = new Set(Object.keys(base));
  const cleanDraft = {};
  for (const k of Object.keys(draft)) {
    if (allowed.has(k)) cleanDraft[k] = draft[k];
  }
  const out = { ...base };
  for (const k of Object.keys(base)) {
    out[k] = mergeIntakeField(fromApi[k], cleanDraft[k], base[k], k);
  }
  out.ugCourse = normalizeIntakeOptionValue(out.ugCourse, UG_COURSE_OPTIONS);
  out.ugSpecialization = normalizeIntakeOptionValue(out.ugSpecialization, UG_SPECIALIZATION_OPTIONS);
  return out;
}

/** Normalize dropdown canonical values after loading from API only (e.g. after save). */
export function normalizeRecFormIntakeFields(form) {
  if (!form || typeof form !== 'object') return form;
  return {
    ...form,
    ugCourse: normalizeIntakeOptionValue(form.ugCourse, UG_COURSE_OPTIONS),
    ugSpecialization: normalizeIntakeOptionValue(form.ugSpecialization, UG_SPECIALIZATION_OPTIONS),
  };
}

/** True when saved profile has the same minimum fields required to submit the career survey (subject + interests + skills). */
export function isCareerIntakeComplete(profileSnap) {
  return getCareerIntakeMissingFields(profileSnap).length === 0;
}

/** Labels for fields still missing from a saved profile (empty = complete). */
export function getCareerIntakeMissingFields(profileSnap) {
  if (!profileSnap || typeof profileSnap !== 'object') {
    return ['UG specialization (major subject)', 'career interest path', 'skills'];
  }
  const f = mapProfileToRecForm(profileSnap, { name: '' });
  const missing = [];
  if (!f.ugSpecialization?.trim()) missing.push('UG specialization (major subject)');
  if (!f.interests?.trim()) missing.push('career interest path');
  if (!f.skillsText?.trim()) missing.push('skills');
  return missing;
}

export function mapProfileToRecForm(profile, user) {
  const snap = profile || null;
  const bool = (s, c) => pick(snap, s, c);
  return {
    displayName: String(pick(snap, 'display_name', 'displayName') ?? user?.name ?? '').trim(),
    gender: pick(snap, 'gender', 'gender') ?? '',
    ugCourse: pick(snap, 'ug_course', 'ugCourse') ?? '',
    ugSpecialization: pick(snap, 'ug_specialization', 'ugSpecialization') ?? '',
    interests: pick(snap, 'interests', 'interests') ?? '',
    skillsText: typeof pick(snap, 'skills', 'skills') === 'string' ? pick(snap, 'skills', 'skills') : '',
    ugCgpaOrPercentage: pick(snap, 'ug_cgpa_or_percentage', 'ugCgpaOrPercentage') ?? '',
    hasCertsText:
      bool('has_additional_certifications', 'hasAdditionalCertifications') === true
        ? 'Yes'
        : bool('has_additional_certifications', 'hasAdditionalCertifications') === false
          ? 'No'
          : '',
    certTitles: pick(snap, 'certificate_course_titles', 'certificateCourseTitles') ?? '',
    isWorkingText:
      bool('is_working', 'isWorking') === true ? 'Yes' : bool('is_working', 'isWorking') === false ? 'No' : '',
    firstJobTitle: pick(snap, 'first_job_title', 'firstJobTitle') ?? '',
    mastersField: pick(snap, 'masters_field', 'mastersField') ?? '',
  };
}

/**
 * Body for POST/PUT /api/profile — snake_case keys to match ASP.NET JsonNamingPolicy.SnakeCaseLower.
 */
export function buildProfilePayloadFromRecForm(form, snapshot) {
  const base = snapshot || {};
  const b = (snake, camel) => pick(base, snake, camel);

  const skillsStr = form.skillsText?.trim() || null;
  return {
    display_name: form.displayName?.trim() || null,
    skills: skillsStr ?? b('skills', 'skills') ?? null,
    interests: form.interests?.trim() || null,
    experience_level: b('experience_level', 'experienceLevel') ?? null,
    education: b('education', 'education') ?? null,
    preferred_industries: b('preferred_industries', 'preferredIndustries') ?? null,
    location: b('location', 'location') ?? null,
    bio: b('bio', 'bio') ?? null,
    linked_in_url: b('linked_in_url', 'linkedInUrl') ?? null,
    portfolio_url: b('portfolio_url', 'portfolioUrl') ?? null,
    gender: form.gender?.trim() || null,
    ug_course: form.ugCourse?.trim() || null,
    ug_specialization: form.ugSpecialization?.trim() || null,
    ug_cgpa_or_percentage: form.ugCgpaOrPercentage?.trim() || null,
    has_additional_certifications: parseYesNo(form.hasCertsText),
    certificate_course_titles: form.certTitles?.trim() || null,
    is_working: parseYesNo(form.isWorkingText),
    first_job_title: form.firstJobTitle?.trim() || null,
    masters_field: form.mastersField?.trim() || null,
  };
}
