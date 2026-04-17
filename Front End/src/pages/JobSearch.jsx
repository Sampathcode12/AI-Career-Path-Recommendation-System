import React, { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';
import { jobsAPI } from '../services/api';
import { JOB_SEARCH_INDUSTRIES_LEDE, getJobCategoryFilterLabel } from '../constants/jobIndustry';
import { JOB_COUNTRY_FILTER_OPTIONS, getJobCountryFilterLabel } from '../constants/jobCountry';
import { BriefcaseIcon, SearchIcon } from '../components/Icons';
import './PageStyles.css';

/** Filtered list — top N for chosen category + country */
const TOP_LIMIT = 10;

function countryDisplayForJob(job, selectedCountryFilter) {
  const fromJob = (job.country || '').trim();
  if (fromJob) return fromJob;
  if (selectedCountryFilter) return getJobCountryFilterLabel(selectedCountryFilter);
  return '';
}

/** External job feeds often ship HTML descriptions; sanitize before rendering. */
function jobDescriptionHtml(raw) {
  const s = raw == null ? '' : String(raw);
  return DOMPurify.sanitize(s);
}

const SUMMARY_MAX_LEN = 220;

/** Plain-text preview for list cards (strips HTML safely). */
function plainSummaryFromDescription(raw, maxLen = SUMMARY_MAX_LEN) {
  const s = raw == null ? '' : String(raw);
  if (!s.trim()) return '';
  try {
    const doc = new DOMParser().parseFromString(jobDescriptionHtml(s), 'text/html');
    const text = doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen).trim()}…`;
  } catch {
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  }
}

function companyThumbInitial(company) {
  const c = (company || '').trim();
  if (!c) return '';
  const m = c.match(/[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : '?';
}

function JobSearchJobDetailModal({
  job,
  index,
  selectedCountryFilter,
  rankTitle,
  savedIds,
  onSave,
  onClose,
}) {
  const titleId = useId();

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!job) return undefined;
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [job, onKeyDown]);

  if (!job) return null;

  const cLabel = countryDisplayForJob(job, selectedCountryFilter);
  const subtitle = [job.company, cLabel || null].filter(Boolean).join(' • ') || '—';

  const node = (
    <div
      className="job-search-detail__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="job-search-detail__panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="job-search-detail__header">
          <div className="job-search-detail__header-top">
            <span className="job-search-results__rank" title={rankTitle}>
              #{index + 1}
            </span>
            <button type="button" className="job-search-detail__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <h2 id={titleId} className="job-search-detail__title">
            {job.title}
          </h2>
          <div className="job-search-detail__meta-row">
            {(job.category || job.sector) && (
              <span className="sector-label">{job.category || job.sector}</span>
            )}
            {cLabel && <span className="job-pill job-pill--country">{cLabel}</span>}
          </div>
          <p className="job-search-detail__subtitle">{subtitle}</p>
        </div>
        <div
          className="job-search-detail__body job-card__desc job-card__desc--rich"
          dangerouslySetInnerHTML={{ __html: jobDescriptionHtml(job.description) }}
        />
        <div className="job-search-detail__footer">
          <div className="job-card__stats job-search-detail__stats">
            {((job.country || '').trim() || selectedCountryFilter) && (
              <span>
                <strong>Country:</strong> {cLabel || '—'}
              </span>
            )}
            {job.salary && (
              <span>
                <strong>Salary:</strong> {job.salary}
              </span>
            )}
            {job.growth && (
              <span className="job-card__stats-growth">
                <strong>Growth:</strong> {job.growth}
              </span>
            )}
            {job.category && (
              <span>
                <strong>Category:</strong> {job.category}
              </span>
            )}
          </div>
          {job.skills?.length > 0 && (
            <div className="job-skill-tags job-search-detail__skills">
              {job.skills.map((s, i) => (
                <span key={i} className="job-skill-tag">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="job-search-detail__actions">
            <button type="button" className="btn btn-secondary btn-nowrap" onClick={() => onSave(job)}>
              {savedIds.includes(job.id) ? 'Saved' : 'Save Job'}
            </button>
            <button type="button" className="btn btn-secondary btn-nowrap" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

function JobSearchJobCard({
  job,
  index,
  selectedCountryFilter,
  rankTitle,
  savedIds,
  onSave,
  onOpenDetails,
}) {
  const cLabel = countryDisplayForJob(job, selectedCountryFilter);
  const summary = plainSummaryFromDescription(job.description);
  const initial = companyThumbInitial(job.company);
  const thumbLabel = `View full details for ${job.title}`;

  return (
    <div className="card job-card job-card--search-list">
      <div className="job-card__row job-card__row--search">
        <button
          type="button"
          className="job-card__thumb"
          onClick={() => onOpenDetails(job)}
          aria-label={thumbLabel}
          title={thumbLabel}
        >
          {initial ? (
            <span className="job-card__thumb-initial" aria-hidden>
              {initial}
            </span>
          ) : (
            <BriefcaseIcon size={28} color="currentColor" className="job-card__thumb-icon" aria-hidden />
          )}
        </button>
        <div className="job-card__body">
          <div className="job-card__title-row">
            <span className="job-search-results__rank" title={rankTitle}>
              #{index + 1}
            </span>
            <h3 className="job-card__title">{job.title}</h3>
            {(job.category || job.sector) && (
              <span className="sector-label">{job.category || job.sector}</span>
            )}
            {cLabel && (
              <span className="job-pill job-pill--country" title="Job country / market">
                {cLabel}
              </span>
            )}
          </div>
          <p className="job-card__subtitle">{job.company || '—'}</p>
          {summary ? (
            <p className="job-card__desc-preview">{summary}</p>
          ) : (
            <p className="job-card__desc-preview job-card__desc-preview--muted">No short summary available.</p>
          )}
          <button type="button" className="btn-link-inline job-card__open-details" onClick={() => onOpenDetails(job)}>
            View full details
          </button>
          <div className="job-card__stats">
            {((job.country || '').trim() || selectedCountryFilter) && (
              <span>
                <strong>Country:</strong> {cLabel || '—'}
              </span>
            )}
            {job.salary && (
              <span>
                <strong>Salary:</strong> {job.salary}
              </span>
            )}
            {job.growth && (
              <span className="job-card__stats-growth">
                <strong>Growth:</strong> {job.growth}
              </span>
            )}
            {job.category && (
              <span>
                <strong>Category:</strong> {job.category}
              </span>
            )}
          </div>
          {job.skills?.length > 0 && (
            <div className="job-skill-tags">
              {job.skills.map((s, i) => (
                <span key={i} className="job-skill-tag">
                  {s}
                </span>
              ))}
            </div>
          )}
          {job.careerPath?.length > 0 && (
            <div className="job-card__career-path">
              <h4 className="job-card__career-path-heading">
                Career path
                {selectedCountryFilter ? (
                  <>
                    {' '}
                    for <strong>{getJobCountryFilterLabel(selectedCountryFilter)}</strong>
                  </>
                ) : null}
              </h4>
              <ol className="job-card__career-path-list">
                {job.careerPath.map((step) => (
                  <li key={step.step}>
                    <strong>
                      Step {step.step}: {step.title}
                    </strong>
                    {step.duration ? <> — {step.duration}</> : null}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <div className="job-card__actions">
          <button type="button" className="btn btn-secondary btn-nowrap" onClick={() => onSave(job)}>
            {savedIds.includes(job.id) ? 'Saved' : 'Save Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Align with JobService: category or sector exact (case-insensitive), or sector starts with "Cat &", "Cat /", etc. */
const jobMatchesUiCategory = (job, cat) => {
  if (!cat || cat === 'All') return true;
  const c = cat.trim().toLowerCase();
  const jc = (job.category || '').trim().toLowerCase();
  const js = (job.sector || '').trim().toLowerCase();
  if (jc === c || js === c) return true;
  if (js.startsWith(`${c} `) || js.startsWith(`${c}&`) || js.startsWith(`${c}/`)) return true;
  return false;
};

/** Keep UI aligned with the country filter; hide rows whose stored country disagrees (stale cache / bad data). */
const jobMatchesSelectedCountry = (job, selectedCountry) => {
  if (!selectedCountry || !String(selectedCountry).trim()) return true;
  const want = String(selectedCountry).trim();
  const got = (job.country || '').trim();
  if (!got) return true;
  return got === want;
};

const mapCareerStep = (s) => ({
  step: s.step ?? s.Step ?? 0,
  title: s.title ?? s.Title ?? '',
  duration: s.duration ?? s.Duration ?? '',
});

const JobSearch = () => {
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [detailJob, setDetailJob] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([{ value: 'All', label: 'All categories' }]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      try {
        const data = await jobsAPI.getCategories();
        const list = Array.isArray(data) ? data : [];
        const normalized = list
          .map((row) => ({
            value: String(row.value ?? row.Value ?? '').trim(),
            label: String(row.label ?? row.Label ?? row.value ?? row.Value ?? '').trim()
              || String(row.value ?? row.Value ?? ''),
          }))
          .filter((o) => o.value);
        if (!cancelled) {
          setCategoryOptions(normalized.length ? normalized : [{ value: 'All', label: 'All categories' }]);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setCategoryOptions([{ value: 'All', label: 'All categories' }]);
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await jobsAPI.getTop(category === 'All' ? '' : category, TOP_LIMIT, country);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setJobs(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, country]);

  const handleSave = async (job) => {
    try {
      await jobsAPI.save({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
      });
      setSavedIds((prev) => [...prev, job.id]);
    } catch (err) {
      console.error(err);
    }
  };

  const mapJob = (j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    country: j.country ?? j.Country ?? null,
    sector: j.sector,
    category: j.category,
    salary: j.salaryRange ?? j.salary_range,
    growth: j.growth,
    description: j.description,
    url: j.url,
    skills: j.skills ?? [],
    careerPath: (j.careerPath ?? j.career_path ?? []).map(mapCareerStep),
  });

  const mappedJobs = jobs.map(mapJob);
  const displayedJobs = useMemo(() => {
    let list = mappedJobs;
    if (category !== 'All') list = list.filter((j) => jobMatchesUiCategory(j, category));
    if (country) list = list.filter((j) => jobMatchesSelectedCountry(j, country));
    return list;
  }, [mappedJobs, category, country]);

  const detailJobIndex = detailJob ? displayedJobs.findIndex((j) => j.id === detailJob.id) : -1;
  const detailRankTitle =
    detailJobIndex >= 0
      ? country
        ? `Rank ${detailJobIndex + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)} · ${getJobCountryFilterLabel(country)}`
        : `Rank ${detailJobIndex + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)}`
      : '';

  return (
    <section className="page-section">
      <div className="card">
        <h2>Job Search & Career Details</h2>
        <p className="page-lede">
          Refine by sector and country — {JOB_SEARCH_INDUSTRIES_LEDE} Choose a <strong>job category</strong> and{' '}
          <strong>country</strong>; the list shows <strong>up to {TOP_LIMIT}</strong> matching jobs from the database (often fewer
          when a country has little seeded data — imported listings are mostly remote or major markets).
        </p>
        <div className="job-filter-toolbar job-filter-toolbar--category-country">
          <div className="form-group form-group--toolbar form-group--grow">
            <label htmlFor="jobsearch-category">Job category</label>
            <select
              id="jobsearch-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categoriesLoading}
              aria-busy={categoriesLoading}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group form-group--toolbar form-group--grow">
            <label htmlFor="jobsearch-country">Country</label>
            <select id="jobsearch-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              {JOB_COUNTRY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card job-search-results" aria-labelledby="job-search-results-heading">
        <h3 id="job-search-results-heading">Filtered results</h3>
        <p className="job-search-results__scope" aria-live="polite">
          Up to <strong>{TOP_LIMIT}</strong> matching roles
          {category === 'All' ? (
            <> — <strong>all categories</strong></>
          ) : (
            <>
              {' '}
              in <strong>{getJobCategoryFilterLabel(category, categoryOptions)}</strong>
            </>
          )}
          {country ? (
            <>
              {' '}
              — <strong>{getJobCountryFilterLabel(country)}</strong>
            </>
          ) : (
            <> — <strong>all countries</strong></>
          )}
          {!loading && displayedJobs.length > 0 && (
            <>
              {' '}
              — <strong>{displayedJobs.length}</strong> {displayedJobs.length === 1 ? 'role' : 'roles'}
            </>
          )}
        </p>
        {!loading && country && displayedJobs.length > 0 && (
          <p className="job-search-results__country-note" role="note">
            Listings and career-path steps below are scoped to <strong>{getJobCountryFilterLabel(country)}</strong> — locations
            and employers match this market.
          </p>
        )}

        {loading ? (
          <p className="jobs-loading">Loading jobs…</p>
        ) : displayedJobs.length === 0 ? (
          <div className="job-search-results__empty-stack">
            <div
              className="card job-card job-search-results__empty-card"
              role="status"
              aria-label="No job listings for this filter"
            >
              <div className="job-search-results__empty-inner">
                <div className="job-search-results__empty-icon" aria-hidden>
                  <SearchIcon size={28} color="currentColor" />
                </div>
                <p className="job-search-results__empty-kicker">No results found</p>
                <p className="job-search-results__empty-body">
                  No jobs match your filters
                  {category !== 'All' && <> for <strong>{getJobCategoryFilterLabel(category, categoryOptions)}</strong></>}
                  {country ? <> in <strong>{getJobCountryFilterLabel(country)}</strong></> : null}. Try{' '}
                  <strong>All categories</strong> or <strong>All countries</strong>, or pick another combination. Run{' '}
                  <code>dotnet ef database update</code> if the API reports a missing <strong>Country</strong> column, then
                  restart the API to seed and backfill countries.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="jobs-stack">
            {displayedJobs.map((job, index) => (
              <JobSearchJobCard
                key={job.id}
                job={job}
                index={index}
                selectedCountryFilter={country}
                rankTitle={
                  country
                    ? `Rank ${index + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)} · ${getJobCountryFilterLabel(country)}`
                    : `Rank ${index + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)}`
                }
                savedIds={savedIds}
                onSave={handleSave}
                onOpenDetails={setDetailJob}
              />
            ))}
          </div>
        )}
      </div>

      {detailJob && (
        <JobSearchJobDetailModal
          job={detailJob}
          index={detailJobIndex >= 0 ? detailJobIndex : 0}
          selectedCountryFilter={country}
          rankTitle={detailRankTitle}
          savedIds={savedIds}
          onSave={handleSave}
          onClose={() => setDetailJob(null)}
        />
      )}
    </section>
  );
};

export default JobSearch;
