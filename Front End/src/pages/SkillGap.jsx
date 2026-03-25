import React, { useState, useEffect } from 'react';
import { ChartIcon } from '../components/Icons';
import { skillGapAPI } from '../services/api';
import { ALL_INDUSTRIES_LEDE_LONG } from '../constants/jobIndustry';
import './PageStyles.css';

const SkillGap = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [industrySkillGaps, setIndustrySkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await skillGapAPI.getAll();
        if (!cancelled) setIndustrySkillGaps(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setIndustrySkillGaps([]);
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const mapItem = (i) => ({
    id: i.industryId ?? i.industry_id,
    name: i.name,
    description: i.description,
    demandGrowth: i.demandGrowth ?? i.demand_growth,
    topDemandSkills: i.topDemandSkills ?? i.top_demand_skills ?? [],
    gapSkills: i.gapSkills ?? i.gap_skills ?? [],
    supplyLevel: i.supplyLevel ?? i.supply_level ?? 'Medium',
    topRegions: i.topRegions ?? i.top_regions ?? [],
    typicalSalaryRange: i.typicalSalaryRange ?? i.typical_salary_range,
    typicalEducation: i.typicalEducation ?? i.typical_education,
    typicalCertifications: i.typicalCertifications ?? i.typical_certifications,
  });

  const items = industrySkillGaps.map(mapItem);
  const current = selectedIndustry ? items.find((i) => i.id === selectedIndustry) : null;

  return (
    <section className="page-section">
      <div className="card">
        <h2>Industry Skill Gap Analysis</h2>
        <p className="page-lede">
          See which skills are in high demand vs. supply by industry. Use this to plan learning and close gaps.
          Covers major industries worldwide: {ALL_INDUSTRIES_LEDE_LONG}
        </p>

        {loading ? (
          <p className="jobs-loading">Loading industries...</p>
        ) : (
          <>
            <div className="industry-select-grid">
              {items.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  className={`industry-select-btn${selectedIndustry === ind.id ? ' industry-select-btn--active' : ''}`}
                  onClick={() => setSelectedIndustry(selectedIndustry === ind.id ? null : ind.id)}
                >
                  {ind.name}
                </button>
              ))}
            </div>

            {current ? (
              <div className="industry-detail-panel">
                <h3>{current.name} — Industry overview</h3>
                {current.description && (
                  <p className="industry-desc">{current.description}</p>
                )}
                <div className="industry-stat-row">
                  <ChartIcon size={20} color="var(--accent)" />
                  <span className="industry-stat-row__accent">Demand growth: {current.demandGrowth}</span>
                  <span className="jobs-muted">• Supply level: {current.supplyLevel}</span>
                  {current.typicalSalaryRange && (
                    <span className="jobs-muted">• Typical salary: {current.typicalSalaryRange}</span>
                  )}
                </div>
                <div className="split-detail-grid">
                  <div>
                    <h4>Top demand skills</h4>
                    <ul>
                      {current.topDemandSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="gap-heading">Largest skill gaps (prioritize learning)</h4>
                    <ul>
                      {current.gapSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="industry-meta-grid">
                  {current.topRegions?.length > 0 && (
                    <div>
                      <h4>Top hiring regions</h4>
                      <p>{current.topRegions.join(', ')}</p>
                    </div>
                  )}
                  {current.typicalEducation && (
                    <div>
                      <h4>Typical education</h4>
                      <p>{current.typicalEducation}</p>
                    </div>
                  )}
                  {current.typicalCertifications && (
                    <div>
                      <h4>Typical certifications</h4>
                      <p>{current.typicalCertifications}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="jobs-muted">Select an industry above to view skill gap analysis.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SkillGap;
