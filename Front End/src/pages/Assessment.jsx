import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI, skillGapAPI } from '../services/api';
import './PageStyles.css';

// Common format version and universal skills (same for everyone, every industry)
const FORMAT_VERSION = '1.0';
const UNIVERSAL_SKILLS = [
  { id: 'communication', name: 'Communication' },
  { id: 'problemSolving', name: 'Problem Solving' },
  { id: 'teamwork', name: 'Teamwork' },
  { id: 'leadership', name: 'Leadership' },
  { id: 'creativity', name: 'Creativity' },
  { id: 'adaptability', name: 'Adaptability' },
];

// Fallback industries when API fails or returns empty — covers all major sectors worldwide
const FALLBACK_INDUSTRIES = [
  { industryId: 'technology', name: 'Technology' },
  { industryId: 'healthcare', name: 'Healthcare' },
  { industryId: 'finance', name: 'Finance' },
  { industryId: 'education', name: 'Education' },
  { industryId: 'manufacturing', name: 'Manufacturing' },
  { industryId: 'energy', name: 'Energy & Utilities' },
  { industryId: 'retail', name: 'Retail' },
  { industryId: 'construction', name: 'Construction' },
  { industryId: 'hospitality', name: 'Hospitality & Tourism' },
  { industryId: 'transportation', name: 'Transportation & Logistics' },
  { industryId: 'realestate', name: 'Real Estate' },
  { industryId: 'media', name: 'Media & Entertainment' },
  { industryId: 'legal', name: 'Legal' },
  { industryId: 'government', name: 'Government & Public Sector' },
  { industryId: 'agriculture', name: 'Agriculture & Food' },
  { industryId: 'mining', name: 'Mining & Natural Resources' },
  { industryId: 'professional', name: 'Professional Services' },
  { industryId: 'creative', name: 'Creative & Design' },
  { industryId: 'nonprofit', name: 'Non-profit & NGO' },
  { industryId: 'telecom', name: 'Telecommunications' },
  { industryId: 'aerospace', name: 'Aerospace & Defense' },
];

const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

const buildResultSummary = (data, industries = []) => {
  const parts = [];
  const ind = industries.find((i) => (i.industryId ?? i.industry_id) === data.industry);
  parts.push(`Industry: ${ind?.name ?? data.industry}`);
  parts.push(`Experience: ${data.preferences?.yearsExperience ?? '—'} years`);
  parts.push(`Work Style: ${data.preferences?.workStyle ?? '—'} | Environment: ${data.preferences?.workEnvironment ?? '—'}`);
  parts.push('');
  const uSkills = (data.universalSkills ?? []).map((s) => `${s.id}: ${s.level}/5`).join(', ');
  parts.push(`Universal Skills: ${uSkills || '—'}`);
  const dSkills = (data.domainSkills ?? []).map((s) => `${s.name ?? s.id}: ${s.level}/5`).join(', ');
  parts.push(`Domain Skills (${data.industry ?? '—'}): ${dSkills || '—'}`);
  return parts.join('\n');
};

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [industry, setIndustry] = useState('technology');
  const [industries, setIndustries] = useState([]);
  const [domainSkills, setDomainSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    let cancelled = false;
    skillGapAPI.getAll()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setIndustries(arr.length > 0 ? arr : FALLBACK_INDUSTRIES);
          const list = arr.length > 0 ? arr : FALLBACK_INDUSTRIES;
          if (list.length > 0 && !list.some((i) => (i.industryId ?? i.industry_id ?? i.id) === industry))
            setIndustry(list[0].industryId ?? list[0].industry_id ?? list[0].id ?? 'technology');
        }
      })
      .catch((err) => {
        console.error('Failed to load industries from API, using fallback:', err);
        if (!cancelled) setIndustries(FALLBACK_INDUSTRIES);
      });
    return () => { cancelled = true; };
  }, []);
  const [universalLevels, setUniversalLevels] = useState(
    Object.fromEntries(UNIVERSAL_SKILLS.map((s) => [s.id, 3]))
  );
  const [domainLevels, setDomainLevels] = useState({});
  const [preferences, setPreferences] = useState({
    workStyle: 'collaborative',
    workEnvironment: 'hybrid',
    yearsExperience: '0-2',
  });
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingSkills(true);
      try {
        const list = await skillGapAPI.getAll(industry);
        const arr = Array.isArray(list) ? list : [];
        const item = arr.find((i) => (i.industryId ?? i.industry_id) === industry) ?? arr[0];
        const top = item?.topDemandSkills ?? item?.top_demand_skills ?? [];
        const gap = item?.gapSkills ?? item?.gap_skills ?? [];
        const combined = [...new Set([...top, ...gap])];
        const skills = combined.map((s, i) => ({ id: `skill_${i}`, name: s }));
        if (!cancelled) {
          setDomainSkills(skills);
          setDomainLevels((prev) => {
            const next = { ...prev };
            skills.forEach((s) => {
              if (next[s.id] === undefined) next[s.id] = 2;
            });
            return next;
          });
        }
      } catch (err) {
        if (!cancelled) setDomainSkills([]);
        console.error(err);
      } finally {
        if (!cancelled) setLoadingSkills(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [industry]);

  const handleIndustryChange = (e) => {
    setIndustry(e.target.value);
  };

  const handleUniversalChange = (id, value) => {
    setUniversalLevels((prev) => ({ ...prev, [id]: parseInt(value, 10) }));
  };

  const handleDomainChange = (id, value) => {
    setDomainLevels((prev) => ({ ...prev, [id]: parseInt(value, 10) }));
  };

  const handlePrefChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const industryName = industries.find((i) => (i.industryId ?? i.industry_id) === industry)?.name ?? industry;

  const getCommonFormat = () => ({
    version: FORMAT_VERSION,
    industry,
    preferences: { ...preferences },
    universalSkills: UNIVERSAL_SKILLS.map((s) => ({ id: s.id, level: universalLevels[s.id] ?? 3 })),
    domainSkills: domainSkills.map((s) => ({ id: s.id, name: s.name, level: domainLevels[s.id] ?? 2 })),
  });

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClearForm = () => {
    if (!window.confirm('Clear all answers and start over? Your current progress will be reset.')) return;
    setCurrentStep(1);
    setIndustry(industries.length > 0 ? (industries[0].industryId ?? industries[0].industry_id ?? 'technology') : 'technology');
    setUniversalLevels(Object.fromEntries(UNIVERSAL_SKILLS.map((s) => [s.id, 3])));
    setDomainLevels({});
    setPreferences({ workStyle: 'collaborative', workEnvironment: 'hybrid', yearsExperience: '0-2' });
    localStorage.removeItem('assessmentData');
    localStorage.removeItem('assessmentCompleted');
  };

  const handleSubmit = async () => {
    const data = getCommonFormat();
    const answersJson = JSON.stringify(data);
    const resultSummary = buildResultSummary(data, industries);
    setSubmitting(true);
    try {
      await assessmentAPI.create({ answersJson, resultSummary });
      localStorage.setItem('assessmentData', answersJson);
      localStorage.setItem('assessmentCompleted', 'true');
      localStorage.setItem('profileProgress', '75');
      navigate('/recommendation', { state: { fromAssessment: true } });
    } catch (err) {
      console.error(err);
      localStorage.setItem('assessmentData', answersJson);
      localStorage.setItem('assessmentCompleted', 'true');
      navigate('/recommendation', { state: { fromAssessment: true } });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Select your industry</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Choose the industry you are interested in. The next steps will show skills relevant to that industry.
            </p>
            <div className="form-group">
              <label>Industry</label>
              <select value={industry} onChange={handleIndustryChange}>
                {(industries.length > 0 ? industries : FALLBACK_INDUSTRIES).map((i) => {
                  const id = i.industryId ?? i.industry_id ?? i.id;
                  const name = i.name ?? id;
                  return <option key={id} value={id}>{name}</option>;
                })}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Universal skills (all industries)</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Rate your level for these skills. They apply to every role and industry.
            </p>
            {UNIVERSAL_SKILLS.map((s) => (
              <div key={s.id} className="form-group">
                <label>{s.name} (1–5)</label>
                <select value={universalLevels[s.id] ?? 3} onChange={(e) => handleUniversalChange(s.id, e.target.value)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} – {LEVEL_LABELS[n]}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Domain skills — {industryName}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Rate your level for skills in demand in this industry.
            </p>
            {loadingSkills ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading skills...</p>
            ) : domainSkills.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No domain skills available. Proceed to next step.</p>
            ) : (
              domainSkills.map((s) => (
                <div key={s.id} className="form-group">
                  <label>{s.name} (1–5)</label>
                  <select value={domainLevels[s.id] ?? 2} onChange={(e) => handleDomainChange(s.id, e.target.value)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} – {LEVEL_LABELS[n]}</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Work preferences</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              These apply across all industries.
            </p>
            <div className="form-group">
              <label>Work style</label>
              <select value={preferences.workStyle} onChange={(e) => handlePrefChange('workStyle', e.target.value)}>
                <option value="collaborative">Collaborative team work</option>
                <option value="independent">Independent work</option>
                <option value="mixed">Mixed (both)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Work environment</label>
              <select value={preferences.workEnvironment} onChange={(e) => handlePrefChange('workEnvironment', e.target.value)}>
                <option value="remote">Remote</option>
                <option value="office">Office</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Years of experience</label>
              <select value={preferences.yearsExperience} onChange={(e) => handlePrefChange('yearsExperience', e.target.value)}>
                <option value="0-2">0–2 years</option>
                <option value="3-5">3–5 years</option>
                <option value="6-10">6–10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Review & submit</h3>
            <div className="review-section">
              <h4>Industry</h4>
              <p>{industryName}</p>
              <h4 style={{ marginTop: '1rem' }}>Universal skills</h4>
              <p>{UNIVERSAL_SKILLS.map((s) => `${s.name}: ${universalLevels[s.id] ?? 3}/5`).join(', ')}</p>
              <h4 style={{ marginTop: '1rem' }}>Domain skills</h4>
              <p>{domainSkills.map((s) => `${s.name}: ${domainLevels[s.id] ?? 2}/5`).join(', ') || '—'}</p>
              <h4 style={{ marginTop: '1rem' }}>Preferences</h4>
              <p>Work style: {preferences.workStyle} | Environment: {preferences.workEnvironment} | Experience: {preferences.yearsExperience}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="page-section">
      <div className="card">
        <h2>Comprehensive Skill Assessment</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          One common format for everyone, every industry. Your answers drive recommendations and job matches.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {renderStep()}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handlePrevious} disabled={currentStep === 1} style={{ opacity: currentStep === 1 ? 0.5 : 1 }}>
              Previous
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
              title="Clear all answers and start over"
            >
              Clear form
            </button>
          </div>
          {currentStep < totalSteps ? (
            <button onClick={handleNext} style={{ marginLeft: 'auto' }}>Next step</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto', background: 'var(--success-color)' }}>
              {submitting ? 'Saving…' : 'Generate recommendations'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Assessment;
