import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { skillGapAPI, jobsAPI } from '../services/api';
import './PageStyles.css';

/** Map JobListing.Category to IndustrySkillGaps.industryId (industry-skill-gaps.json). */
const JOB_CATEGORY_TO_GAP_INDUSTRY = {
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
};

const DEBOUNCE_MS = 350;
const ROLE_SEARCH_LIMIT = 30;
const DEFAULT_LEVEL_MIN = 2;
/** Set to true to show the aggregated "Common skills by career level" block again. */
const SHOW_SKILLS_BY_CAREER_LEVEL = false;

const mapGapItem = (i) => ({
  id: i.industryId ?? i.industry_id,
  name: i.name,
  topDemandSkills: i.topDemandSkills ?? i.top_demand_skills ?? [],
  gapSkills: i.gapSkills ?? i.gap_skills ?? [],
  demandGrowth: i.demandGrowth ?? i.demand_growth,
  supplyLevel: i.supplyLevel ?? i.supply_level ?? 'Medium',
});

const mapRoleHit = (r) => ({
  id: r.id,
  title: r.title,
  company: r.company,
  category: r.category,
  sector: r.sector,
  skills: Array.isArray(r.skills) ? r.skills : Array.isArray(r.Skills) ? r.Skills : [],
});

const mapLevelGroup = (g) => ({
  level: g.level ?? g.Level ?? '',
  skills: (g.skills ?? g.Skills ?? []).map((s) => ({
    name: s.name ?? s.Name ?? '',
    count: s.count ?? s.Count ?? 0,
  })),
});

function resolveGapIndustryId(job, gapIdSet) {
  const cat = (job.category || '').trim();
  if (JOB_CATEGORY_TO_GAP_INDUSTRY[cat]) return JOB_CATEGORY_TO_GAP_INDUSTRY[cat];
  const catLower = cat.toLowerCase();
  if (gapIdSet.has(catLower)) return catLower;
  const sec = (job.sector || '').trim();
  const secLower = sec.toLowerCase();
  if (gapIdSet.has(secLower)) return secLower;
  for (const id of gapIdSet) {
    if (secLower.startsWith(`${id} `) || secLower.startsWith(`${id}&`) || secLower.startsWith(`${id}/`)) return id;
  }
  return null;
}

function skillSetLower(skills) {
  return new Set((skills || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean));
}

function skillsNotOnPosting(industrySkills, postingSkillSet) {
  return (industrySkills || []).filter((s) => !postingSkillSet.has(String(s).trim().toLowerCase()));
}

const SkillGap = () => {
  const [industrySkillGaps, setIndustrySkillGaps] = useState([]);
  const [loadingGaps, setLoadingGaps] = useState(true);

  const [query, setQuery] = useState('');
  const [roleHits, setRoleHits] = useState([]);
  const [loadingHits, setLoadingHits] = useState(false);
  const [hitsOpen, setHitsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const wrapRef = useRef(null);

  const [levelGroups, setLevelGroups] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(SHOW_SKILLS_BY_CAREER_LEVEL);
  const [levelMinCount, setLevelMinCount] = useState(DEFAULT_LEVEL_MIN);
  const [levelError, setLevelError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingGaps(true);
      try {
        const data = await skillGapAPI.getAll();
        if (!cancelled) setIndustrySkillGaps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setIndustrySkillGaps([]);
      } finally {
        if (!cancelled) setLoadingGaps(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoadingHits(true);
      try {
        const data = await jobsAPI.roleSearch(query, ROLE_SEARCH_LIMIT);
        if (!cancelled) setRoleHits(Array.isArray(data) ? data.map(mapRoleHit) : []);
      } catch (err) {
        if (!cancelled) setRoleHits([]);
        console.error(err);
      } finally {
        if (!cancelled) setLoadingHits(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    if (!SHOW_SKILLS_BY_CAREER_LEVEL) {
      setLevelGroups([]);
      setLevelError(null);
      setLoadingLevels(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingLevels(true);
      setLevelError(null);
      try {
        const data = await jobsAPI.skillsByLevel(levelMinCount, 80);
        if (!cancelled) setLevelGroups(Array.isArray(data) ? data.map(mapLevelGroup) : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLevelGroups([]);
          setLevelError('Could not load level summary.');
        }
      } finally {
        if (!cancelled) setLoadingLevels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelMinCount]);

  const onDocMouseDown = useCallback((e) => {
    if (!wrapRef.current || wrapRef.current.contains(e.target)) return;
    setHitsOpen(false);
  }, []);

  useEffect(() => {
    if (!hitsOpen) return undefined;
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [hitsOpen, onDocMouseDown]);

  const gapItems = useMemo(() => industrySkillGaps.map(mapGapItem), [industrySkillGaps]);
  const gapIdSet = useMemo(() => new Set(gapItems.map((g) => g.id)), [gapItems]);

  const matchedIndustry = useMemo(() => {
    if (!selectedRole) return null;
    const id = resolveGapIndustryId(selectedRole, gapIdSet);
    if (!id) return null;
    return gapItems.find((g) => g.id === id) ?? null;
  }, [selectedRole, gapItems, gapIdSet]);

  const postingSkillSet = useMemo(() => skillSetLower(selectedRole?.skills), [selectedRole]);

  const gapFocusSkills = useMemo(() => {
    if (!matchedIndustry || !selectedRole) return [];
    const fromGaps = skillsNotOnPosting(matchedIndustry.gapSkills, postingSkillSet);
    const fromTop = skillsNotOnPosting(matchedIndustry.topDemandSkills, postingSkillSet);
    const seen = new Set();
    const out = [];
    for (const s of [...fromGaps, ...fromTop]) {
      const k = String(s).trim().toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(s);
    }
    return out;
  }, [matchedIndustry, selectedRole, postingSkillSet]);

  /** Posting tags first; if the listing has none but industry matches, show typical industry skills. */
  const skillsNeededForRole = useMemo(() => {
    if (!selectedRole) return { source: 'none', skills: [] };
    const fromPosting = (selectedRole.skills || []).map((s) => String(s).trim()).filter(Boolean);
    if (fromPosting.length > 0) {
      return { source: 'posting', skills: fromPosting };
    }
    if (matchedIndustry) {
      const seen = new Set();
      const out = [];
      for (const s of [...matchedIndustry.topDemandSkills, ...matchedIndustry.gapSkills]) {
        const k = String(s).trim().toLowerCase();
        if (!k || seen.has(k)) continue;
        seen.add(k);
        out.push(String(s).trim());
      }
      return { source: 'industry_typical', skills: out };
    }
    return { source: 'none', skills: [] };
  }, [selectedRole, matchedIndustry]);

  const pickRole = (role) => {
    setSelectedRole(role);
    setHitsOpen(false);
    setQuery(role.title);
  };

  const clearRole = () => {
    setSelectedRole(null);
    setQuery('');
    setHitsOpen(true);
  };

  const levelTotal = levelGroups.reduce((n, g) => n + (g.skills?.length ?? 0), 0);

  return (
    <section className="page-section">
      <div className="card">
        <h2>Industry Skill Gap Analysis</h2>
        <p className="page-lede skill-gap-page-lede">
          <strong>Search</strong> for a job role from your database, then compare <strong>skills on that posting</strong> with{' '}
          <strong>industry demand and gap skills</strong> from the catalog when the role category matches.
        </p>

        <div className="skill-gap-role-search" ref={wrapRef}>
          <div className="form-group form-group--toolbar" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="skill-gap-role-q">Search job roles</label>
            <div className="skill-gap-role-search__row">
              <input
                id="skill-gap-role-q"
                type="search"
                autoComplete="off"
                placeholder="Job title or company — loaded from API"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHitsOpen(true);
                  if (selectedRole && e.target.value !== selectedRole.title) setSelectedRole(null);
                }}
                onFocus={() => setHitsOpen(true)}
                aria-expanded={hitsOpen}
                aria-controls="skill-gap-role-listbox"
              />
              {selectedRole && (
                <button type="button" className="btn btn-secondary btn-nowrap" onClick={clearRole}>
                  Clear
                </button>
              )}
            </div>
          </div>
          {hitsOpen && (
            <ul id="skill-gap-role-listbox" className="skill-gap-role-suggestions" role="listbox">
              {loadingHits && <li className="skill-gap-role-suggestions__status">Searching…</li>}
              {!loadingHits && roleHits.length === 0 && (
                <li className="skill-gap-role-suggestions__status">No roles found.</li>
              )}
              {!loadingHits &&
                roleHits.map((r) => (
                  <li key={r.id} role="option">
                    <button
                      type="button"
                      className="skill-gap-role-hit"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickRole(r)}
                    >
                      <span className="skill-gap-role-hit__title">{r.title}</span>
                      <span className="skill-gap-role-hit__meta">
                        {[r.company, r.category].filter(Boolean).join(' • ') || '—'}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {loadingGaps && <p className="jobs-loading">Loading industry skill catalog…</p>}

        {!loadingGaps && selectedRole && (
          <div className="industry-detail-panel skill-gap-selected">
            <h3 className="skill-gap-selected__title">{selectedRole.title}</h3>
            <p className="jobs-muted skill-gap-selected__meta">
              {[selectedRole.company, selectedRole.category].filter(Boolean).join(' • ') || '—'}
            </p>
            {matchedIndustry && (
              <p className="skill-gap-selected__kpi jobs-muted">
                Industry demand growth: <strong>{matchedIndustry.demandGrowth}</strong>
                {' · '}
                Supply: <strong>{matchedIndustry.supplyLevel}</strong>
              </p>
            )}

            <div className="skill-gap-skills-needed">
              <h4 className="skill-gap-skills-needed__title">Skills needed for this role</h4>
              {skillsNeededForRole.skills.length > 0 ? (
                <>
                  <ul className="skill-gap-skills-needed__list">
                    {skillsNeededForRole.skills.map((s, i) => (
                      <li key={`${s}-${i}`}>{s}</li>
                    ))}
                  </ul>
                  {skillsNeededForRole.source === 'posting' && (
                    <p className="jobs-muted skill-gap-skills-needed__note">From skills tagged on this job listing.</p>
                  )}
                  {skillsNeededForRole.source === 'industry_typical' && (
                    <p className="jobs-muted skill-gap-skills-needed__note">
                      This listing has no skill tags. These are common skills employers look for in this industry (from the
                      catalog).
                    </p>
                  )}
                </>
              ) : (
                <p className="jobs-muted">
                  No skills are listed on this posting, and no industry skill profile matches this role{"'"}s category — add
                  skills to listings in the database or pick a role whose category maps to the catalog.
                </p>
              )}
            </div>

            <div className="split-detail-grid">
              {matchedIndustry ? (
                <>
                  <div>
                    <h4>Industry — high demand skills</h4>
                    <ul>
                      {matchedIndustry.topDemandSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="gap-heading">Industry — skill gaps (short supply)</h4>
                    <ul>
                      {matchedIndustry.gapSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="split-detail-grid__full">
                  <p className="jobs-muted">
                    No industry skill-gap profile matches this role{"'"}s category. The skills above are only what appears on
                    the posting (if any).
                  </p>
                </div>
              )}
            </div>

            {matchedIndustry && gapFocusSkills.length > 0 && (
              <div className="skill-gap-focus-block">
                <h4 className="gap-heading">Gap focus for this role</h4>
                <p className="jobs-muted skill-gap-focus-block__lede">
                  In-demand or shortage skills from the industry catalog that are <strong>not</strong> listed on this posting
                  — useful targets to close your personal gap.
                </p>
                <ul className="skill-gap-focus-list">
                  {gapFocusSkills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!loadingGaps && !selectedRole && (
          <p className="jobs-muted">Select a job role from the search results to see skill gap analysis for that role.</p>
        )}
      </div>

      {SHOW_SKILLS_BY_CAREER_LEVEL && (
        <div className="card skill-gap-level-card-outer">
          <h3 className="skill-gap-level-card-outer__heading">Common skills by career level (all postings)</h3>
          <p className="page-lede skill-gap-page-lede">
            Aggregated from all job listings: inferred <strong>Entry / Mid / Senior</strong> from titles. Count = postings at
            that level with that skill tag.
          </p>
          <div className="skill-gap-toolbar">
            <label htmlFor="skill-gap-min-count" className="skill-gap-toolbar__label">
              Min. postings per skill
            </label>
            <select
              id="skill-gap-min-count"
              value={levelMinCount}
              onChange={(e) => setLevelMinCount(Number(e.target.value))}
            >
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
            </select>
          </div>
          {loadingLevels && <p className="jobs-loading">Loading level summary…</p>}
          {levelError && <p className="jobs-muted">{levelError}</p>}
          {!loadingLevels && !levelError && levelTotal === 0 && (
            <p className="jobs-muted">No aggregated skills for this threshold.</p>
          )}
          {!loadingLevels && !levelError && levelTotal > 0 && (
            <div className="skill-gap-level-grid">
              {levelGroups.map((g) => (
                <div key={g.level} className="skill-gap-level-card">
                  <h4 className="skill-gap-level-card__title">{g.level}</h4>
                  <p className="skill-gap-level-card__hint">Common skills (by frequency)</p>
                  <ul className="skill-gap-skill-list">
                    {g.skills.map((s) => (
                      <li key={`${g.level}-${s.name}`} className="skill-gap-skill-list__item">
                        <span className="skill-gap-skill-list__name">{s.name}</span>
                        <span className="skill-gap-skill-list__count">×{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SkillGap;
