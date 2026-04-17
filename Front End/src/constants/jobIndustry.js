/**
 * Job Search category options come from GET /api/jobs/categories (distinct JobListing.Category).
 * @param {{ value: string, label: string }[]} options rows from the API (see jobsAPI.getCategories)
 */
export function getJobCategoryFilterLabel(value, options = []) {
  const opt = options.find((o) => o.value === value);
  return opt?.label ?? value ?? '';
}

/** Short lede for job search cards */
export const JOB_SEARCH_INDUSTRIES_LEDE =
  'Medicine, healthcare, education, schools, technology, finance, energy, retail, logistics, public sector, agriculture, telecom, aerospace, and more worldwide.';

/** Longer list for skill-gap / global copy */
export const ALL_INDUSTRIES_LEDE_LONG =
  'Technology, Healthcare (medicine & clinical roles), Finance, Education (schools, universities, EdTech), Manufacturing, Energy & Utilities, Retail, Construction, Hospitality & Tourism, Transportation & Logistics, Real Estate, Media & Entertainment, Legal, Government & Public Sector, Agriculture & Food, Mining & Natural Resources, Professional Services, Creative & Design, Non-profit & NGO, Telecommunications, Aerospace & Defense, and more.';
