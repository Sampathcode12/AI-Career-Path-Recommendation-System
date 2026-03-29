/** Parse free-text Yes/No (and common variants) for API booleans. */
export function parseYesNo(text) {
  const t = (text ?? '').trim().toLowerCase();
  if (!t) return null;
  if (['y', 'yes', 'true', '1'].includes(t)) return true;
  if (['n', 'no', 'false', '0'].includes(t)) return false;
  return null;
}

/** Read API field whether backend sent snake_case or camelCase JSON. */
function pick(snap, snakeKey, camelKey) {
  if (!snap) return undefined;
  return snap[snakeKey] ?? snap[camelKey];
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
 * Body for POST/PUT /api/profile — must use camelCase for ASP.NET default JSON binding.
 */
export function buildProfilePayloadFromRecForm(form, snapshot) {
  const base = snapshot || {};
  const b = (snake, camel) => pick(base, snake, camel);

  const skillsStr = form.skillsText?.trim() || null;
  return {
    displayName: form.displayName?.trim() || null,
    skills: skillsStr ?? b('skills', 'skills') ?? null,
    interests: form.interests?.trim() || null,
    experienceLevel: b('experience_level', 'experienceLevel') ?? null,
    education: b('education', 'education') ?? null,
    preferredIndustries: b('preferred_industries', 'preferredIndustries') ?? null,
    location: b('location', 'location') ?? null,
    bio: b('bio', 'bio') ?? null,
    linkedInUrl: b('linked_in_url', 'linkedInUrl') ?? null,
    portfolioUrl: b('portfolio_url', 'portfolioUrl') ?? null,
    gender: form.gender?.trim() || null,
    ugCourse: form.ugCourse?.trim() || null,
    ugSpecialization: form.ugSpecialization?.trim() || null,
    ugCgpaOrPercentage: form.ugCgpaOrPercentage?.trim() || null,
    hasAdditionalCertifications: parseYesNo(form.hasCertsText),
    certificateCourseTitles: form.certTitles?.trim() || null,
    isWorking: parseYesNo(form.isWorkingText),
    firstJobTitle: form.firstJobTitle?.trim() || null,
    mastersField: form.mastersField?.trim() || null,
  };
}
