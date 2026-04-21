import React, { useState, useEffect, useMemo, useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jobsAPI } from '../services/api';
import { jobDescriptionHtml, plainSummaryFromDescription } from '../utils/jobDescription';
import { JOB_SEARCH_INDUSTRIES_LEDE, getJobCategoryFilterLabel } from '../constants/jobIndustry';
import { JOB_COUNTRY_FILTER_OPTIONS, getJobCountryFilterLabel } from '../constants/jobCountry';
import { BriefcaseIcon, SearchIcon } from '../components/Icons';
import './PageStyles.css';

/** Filtered list — top N for chosen category + country */
const TOP_LIMIT = 10;

const TITLE_SUGGEST_DEBOUNCE_MS = 320;
const TITLE_SUGGEST_LIMIT = 15;
const LISTING_SEARCH_DEBOUNCE_MS = 320;
const LISTING_SEARCH_DROPDOWN_LIMIT = 20;

const mapStringCount = (x) => ({
  value: String(x.value ?? x.Value ?? '').trim(),
  count: Number(x.count ?? x.Count ?? 0) || 0,
});

const mapTitleSuggestion = (row) => ({
  title: String(row.title ?? row.Title ?? '').trim(),
  listingCount: Number(row.listingCount ?? row.ListingCount ?? 0) || 0,
});

const mapRoleInsights = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const hintsRaw = raw.industryHints ?? raw.IndustryHints;
  return {
    title: String(raw.title ?? raw.Title ?? '').trim(),
    matchingListingCount: Number(raw.matchingListingCount ?? raw.MatchingListingCount ?? 0) || 0,
    postingSalaryRanges: (raw.postingSalaryRanges ?? raw.PostingSalaryRanges ?? []).map(mapStringCount),
    postingGrowthLabels: (raw.postingGrowthLabels ?? raw.PostingGrowthLabels ?? []).map(mapStringCount),
    commonSkills: (raw.commonSkills ?? raw.CommonSkills ?? []).map(mapStringCount),
    industryHints: hintsRaw
      ? {
          industryName: String(hintsRaw.industryName ?? hintsRaw.IndustryName ?? '').trim(),
          demandGrowth: String(hintsRaw.demandGrowth ?? hintsRaw.DemandGrowth ?? '').trim(),
          typicalSalaryRange: hintsRaw.typicalSalaryRange ?? hintsRaw.TypicalSalaryRange ?? null,
          typicalEducation: hintsRaw.typicalEducation ?? hintsRaw.TypicalEducation ?? null,
          typicalCertifications: hintsRaw.typicalCertifications ?? hintsRaw.TypicalCertifications ?? null,
        }
      : null,
  };
};

function countryDisplayForJob(job, selectedCountryFilter) {
  const fromJob = (job.country || '').trim();
  if (fromJob) return fromJob;
  if (selectedCountryFilter) return getJobCountryFilterLabel(selectedCountryFilter);
  return '';
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
              {index >= 0 ? `#${index + 1}` : 'Search'}
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
        <div className="job-search-detail__scroll">
          <div
            className="job-search-detail__body job-card__desc job-card__desc--rich"
            dangerouslySetInnerHTML={{ __html: jobDescriptionHtml(job.description) }}
          />
          {job.careerPath?.length > 0 && (
            <div className="job-card__career-path job-search-detail__career-path">
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

const JobSearch = () => {
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [detailJob, setDetailJob] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([{ value: 'All', label: 'All categories' }]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [titleQuery, setTitleQuery] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestWrapRef = useRef(null);

  const [insightsTitle, setInsightsTitle] = useState(null);
  const [roleInsights, setRoleInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [listingSearchRaw, setListingSearchRaw] = useState([]);
  const [listingSearchLoading, setListingSearchLoading] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const data = await jobsAPI.titleSuggestions(titleQuery, category, country, TITLE_SUGGEST_LIMIT);
        const list = Array.isArray(data) ? data.map(mapTitleSuggestion).filter((r) => r.title) : [];
        if (!cancelled) setTitleSuggestions(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setTitleSuggestions([]);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    }, TITLE_SUGGEST_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [titleQuery, category, country]);

  useEffect(() => {
    const q = titleQuery.trim();
    if (!q) {
      setListingSearchRaw([]);
      setListingSearchLoading(false);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setListingSearchLoading(true);
      try {
        const data = await jobsAPI.search({
          query: q,
          category: category !== 'All' ? category : '',
          country: country || '',
        });
        if (!cancelled) setListingSearchRaw(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setListingSearchRaw([]);
      } finally {
        if (!cancelled) setListingSearchLoading(false);
      }
    }, LISTING_SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [titleQuery, category, country]);

  useEffect(() => {
    if (!insightsTitle) {
      setRoleInsights(null);
      setInsightsLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setInsightsLoading(true);
      try {
        const data = await jobsAPI.roleInsights(insightsTitle, category, country);
        if (!cancelled) setRoleInsights(mapRoleInsights(data));
      } catch (err) {
        console.error(err);
        if (!cancelled) setRoleInsights(null);
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [insightsTitle, category, country]);

  const onSuggestDocMouseDown = useCallback((e) => {
    if (!suggestWrapRef.current || suggestWrapRef.current.contains(e.target)) return;
    setSuggestOpen(false);
  }, []);

  useEffect(() => {
    if (!suggestOpen) return undefined;
    document.addEventListener('mousedown', onSuggestDocMouseDown);
    return () => document.removeEventListener('mousedown', onSuggestDocMouseDown);
  }, [suggestOpen, onSuggestDocMouseDown]);

  const pickTitleSuggestion = useCallback((title) => {
    setTitleQuery(title);
    setInsightsTitle(title);
    setSuggestOpen(false);
  }, []);

  const pickListingFromSearch = useCallback((rawRow) => {
    const job = mapJob(rawRow);
    setDetailJob(job);
    setInsightsTitle(job.title);
    setSuggestOpen(false);
  }, []);

  const clearTitleSearch = useCallback(() => {
    setTitleQuery('');
    setTitleSuggestions([]);
    setListingSearchRaw([]);
    setListingSearchLoading(false);
    setInsightsTitle(null);
    setRoleInsights(null);
    setSuggestOpen(false);
    setDetailJob(null);
  }, []);

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

  const mappedJobs = jobs.map(mapJob);
  const mappedListingSearch = useMemo(() => listingSearchRaw.map(mapJob), [listingSearchRaw]);

  const jobsAfterTopFilters = useMemo(() => {
    let list = mappedJobs;
    if (category !== 'All') list = list.filter((j) => jobMatchesUiCategory(j, category));
    if (country) list = list.filter((j) => jobMatchesSelectedCountry(j, country));
    return list;
  }, [mappedJobs, category, country]);

  const titleQueryTrimmed = titleQuery.trim();
  const displayedJobs = useMemo(() => {
    if (titleQueryTrimmed) return mappedListingSearch.slice(0, TOP_LIMIT);
    return jobsAfterTopFilters;
  }, [titleQueryTrimmed, mappedListingSearch, jobsAfterTopFilters]);

  const listingDropdownRows = useMemo(
    () => listingSearchRaw.slice(0, LISTING_SEARCH_DROPDOWN_LIMIT),
    [listingSearchRaw],
  );

  const detailJobIndex = detailJob ? displayedJobs.findIndex((j) => j.id === detailJob.id) : -1;
  const detailRankTitle =
    detailJobIndex >= 0
      ? country
        ? `Rank ${detailJobIndex + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)} · ${getJobCountryFilterLabel(country)}`
        : `Rank ${detailJobIndex + 1} — ${getJobCategoryFilterLabel(category, categoryOptions)}`
      : detailJob
        ? 'Opened from listing search — full job details (same as in Filtered results below)'
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

        <div className="skill-gap-role-search job-search-title-suggest" ref={suggestWrapRef}>
          <div className="form-group form-group--toolbar" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="jobsearch-title-q">Search jobs</label>
            <div className="skill-gap-role-search__row job-search-input-row">
              <input
                id="jobsearch-title-q"
                type="search"
                autoComplete="off"
                placeholder="Type to find listings (database search) and title ideas — uses category & country filters"
                value={titleQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setTitleQuery(v);
                  setSuggestOpen(true);
                  if (insightsTitle != null && v !== insightsTitle) {
                    setInsightsTitle(null);
                    setRoleInsights(null);
                  }
                }}
                onFocus={() => setSuggestOpen(true)}
                aria-expanded={suggestOpen}
                aria-controls="jobsearch-title-suggest-list"
                aria-autocomplete="list"
              />
              {(titleQuery || insightsTitle) && (
                <button type="button" className="btn btn-secondary btn-nowrap" onClick={clearTitleSearch}>
                  Clear
                </button>
              )}
            </div>
            {suggestOpen && (
              <ul
                id="jobsearch-title-suggest-list"
                className="skill-gap-role-suggestions"
                role="listbox"
                aria-label="Job listings and title suggestions"
              >
                {titleQueryTrimmed ? (
                  <>
                    <li className="job-search-suggest-section" aria-hidden>
                      Listings — select a row to open the same full details as in Filtered results
                    </li>
                    {listingSearchLoading && (
                      <li className="skill-gap-role-suggestions__status" role="status">
                        Searching listings…
                      </li>
                    )}
                    {!listingSearchLoading && listingDropdownRows.length === 0 && (
                      <li className="skill-gap-role-suggestions__status">
                        No listing rows match this text under the current category and country.
                      </li>
                    )}
                    {!listingSearchLoading &&
                      listingDropdownRows.map((row) => {
                        const j = mapJob(row);
                        const loc = [j.company, j.location, j.country].filter(Boolean).join(' · ');
                        return (
                          <li key={j.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              className="skill-gap-role-hit job-search-listing-hit"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => pickListingFromSearch(row)}
                            >
                              <span className="skill-gap-role-hit__title">{j.title}</span>
                              <span className="skill-gap-role-hit__meta">{loc || 'Listing'}</span>
                            </button>
                          </li>
                        );
                      })}
                    <li className="job-search-suggest-section" aria-hidden>
                      Title keywords — aggregated role summary
                    </li>
                  </>
                ) : null}
                {suggestLoading && (
                  <li className="skill-gap-role-suggestions__status" role="status">
                    Loading title suggestions…
                  </li>
                )}
                {!suggestLoading && titleSuggestions.length === 0 && (
                  <li className="skill-gap-role-suggestions__status">No matching titles — try another keyword or widen filters.</li>
                )}
                {!suggestLoading &&
                  titleSuggestions.map((s) => (
                    <li key={s.title} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className="skill-gap-role-hit"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickTitleSuggestion(s.title)}
                      >
                        <span className="skill-gap-role-hit__title">{s.title}</span>
                        <span className="skill-gap-role-hit__meta">
                          {s.listingCount} {s.listingCount === 1 ? 'listing' : 'listings'}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <p className="job-search-title-suggest__hint">
            <strong>Listings</strong> search the job database (respecting category and country) and open the full-detail view.{' '}
            <strong>Title keywords</strong> load aggregated salary, growth, skills, and industry education hints for that exact title.
          </p>
        </div>

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

      {insightsTitle && (
        <div className="card job-search-role-insights" aria-live="polite">
          <h3>Common details for selected role</h3>
          {insightsLoading && <p className="jobs-loading">Loading role summary…</p>}
          {!insightsLoading && !roleInsights && (
            <p className="job-search-role-insights__empty" role="alert">
              Could not load role summary. Check that you are signed in and the API is running.
            </p>
          )}
          {!insightsLoading && roleInsights && (
            <>
              <p className="job-search-role-insights__lede">
                <strong>{roleInsights.title}</strong> — based on{' '}
                <strong>{roleInsights.matchingListingCount}</strong>{' '}
                {roleInsights.matchingListingCount === 1 ? 'listing' : 'listings'} with this exact title
                {category !== 'All' && (
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
                ) : null}
                .
              </p>
              <div className="job-search-role-insights__grid">
                <div className="job-search-role-insights__col">
                  <h4 className="job-search-role-insights__col-title">From your listings</h4>
                  {roleInsights.matchingListingCount === 0 ? (
                    <p className="job-search-role-insights__empty">No rows match this title under the current filters.</p>
                  ) : (
                    <>
                      {roleInsights.postingSalaryRanges.length > 0 && (
                        <div className="job-search-role-insights__block">
                          <strong className="job-search-role-insights__label">Salary ranges mentioned</strong>
                          <ul className="job-search-role-insights__counts">
                            {roleInsights.postingSalaryRanges.map((row) => (
                              <li key={row.value}>
                                {row.value} <span className="job-search-role-insights__count">({row.count}×)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {roleInsights.postingGrowthLabels.length > 0 && (
                        <div className="job-search-role-insights__block">
                          <strong className="job-search-role-insights__label">Growth / outlook on postings</strong>
                          <ul className="job-search-role-insights__counts">
                            {roleInsights.postingGrowthLabels.map((row) => (
                              <li key={row.value}>
                                {row.value} <span className="job-search-role-insights__count">({row.count}×)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {roleInsights.commonSkills.length > 0 ? (
                        <div className="job-search-role-insights__block">
                          <strong className="job-search-role-insights__label">Common skills</strong>
                          <div className="job-skill-tags job-search-role-insights__skills">
                            {roleInsights.commonSkills.map((row) => (
                              <span key={row.value} className="job-skill-tag" title={`${row.count} postings`}>
                                {row.value}
                                <span className="job-search-role-insights__skill-count"> {row.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="job-search-role-insights__muted">No structured skills on these listings yet.</p>
                      )}
                    </>
                  )}
                </div>
                <div className="job-search-role-insights__col">
                  <h4 className="job-search-role-insights__col-title">Industry benchmark</h4>
                  {roleInsights.industryHints ? (
                    <>
                      <p className="job-search-role-insights__industry-name">{roleInsights.industryHints.industryName}</p>
                      {roleInsights.industryHints.typicalSalaryRange && (
                        <p>
                          <strong>Typical salary range:</strong> {roleInsights.industryHints.typicalSalaryRange}
                        </p>
                      )}
                      {roleInsights.industryHints.demandGrowth && (
                        <p className="job-card__stats-growth">
                          <strong>Industry demand growth:</strong> {roleInsights.industryHints.demandGrowth}
                        </p>
                      )}
                      {roleInsights.industryHints.typicalEducation && (
                        <div className="job-search-role-insights__block">
                          <strong className="job-search-role-insights__label">Typical education</strong>
                          <p className="job-search-role-insights__para">{roleInsights.industryHints.typicalEducation}</p>
                        </div>
                      )}
                      {roleInsights.industryHints.typicalCertifications && (
                        <div className="job-search-role-insights__block">
                          <strong className="job-search-role-insights__label">Common certifications</strong>
                          <p className="job-search-role-insights__para">{roleInsights.industryHints.typicalCertifications}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="job-search-role-insights__muted">
                      Industry qualification hints appear when your listings include a category that maps to the industry catalog
                      (e.g. Technology, Finance, Healthcare).
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="card job-search-results" aria-labelledby="job-search-results-heading">
        <h3 id="job-search-results-heading">Filtered results</h3>
        <p className="job-search-results__scope" aria-live="polite">
          {titleQueryTrimmed ? (
            <>
              Text search: up to <strong>{TOP_LIMIT}</strong> roles shown from{' '}
              <strong>{mappedListingSearch.length}</strong> database {mappedListingSearch.length === 1 ? 'match' : 'matches'}
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
              {displayedJobs.length > 0 && (
                <>
                  {' '}
                  — <strong>{displayedJobs.length}</strong> {displayedJobs.length === 1 ? 'role' : 'roles'} in this shortlist
                </>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </p>
        {!loading && country && displayedJobs.length > 0 && !titleQueryTrimmed && (
          <p className="job-search-results__country-note" role="note">
            Listings and career-path steps below are scoped to <strong>{getJobCountryFilterLabel(country)}</strong> — locations
            and employers match this market.
          </p>
        )}
        {titleQueryTrimmed && country && displayedJobs.length > 0 && (
          <p className="job-search-results__country-note" role="note">
            Listings and career-path steps below respect <strong>{getJobCountryFilterLabel(country)}</strong> when stored on each
            row.
          </p>
        )}

        {titleQueryTrimmed ? (
          listingSearchLoading ? (
            <p className="jobs-loading">Searching listings…</p>
          ) : displayedJobs.length === 0 ? (
            <div className="job-search-results__empty-stack">
              <div
                className="card job-card job-search-results__empty-card"
                role="status"
                aria-label="No job listings for this search"
              >
                <div className="job-search-results__empty-inner">
                  <div className="job-search-results__empty-icon" aria-hidden>
                    <SearchIcon size={28} color="currentColor" />
                  </div>
                  <p className="job-search-results__empty-kicker">No listings match your search</p>
                  <p className="job-search-results__empty-body">
                    Try different keywords, <strong>Clear</strong> the search bar, or widen category and country filters.
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
                  rankTitle={`Search hit ${index + 1} — ${mappedListingSearch.length} database ${
                    mappedListingSearch.length === 1 ? 'match' : 'matches'
                  } · ${getJobCategoryFilterLabel(category, categoryOptions)}${
                    country ? ` · ${getJobCountryFilterLabel(country)}` : ''
                  }`}
                  savedIds={savedIds}
                  onSave={handleSave}
                  onOpenDetails={setDetailJob}
                />
              ))}
            </div>
          )
        ) : loading ? (
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
          index={detailJobIndex >= 0 ? detailJobIndex : -1}
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
