import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar, Radar } from 'react-chartjs-2';
import { CheckIcon, ChatIcon } from '../components/Icons';
import RecommendationChatbot from '../components/RecommendationChatbot';
import { recommendationsAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './PageStyles.css';

const RECOMMENDATION_SKILL_OPTIONS = [
  'Programming / coding',
  'Data analysis',
  'Machine learning / AI',
  'Communication',
  'Project management',
  'Research',
  'Teaching / training',
  'Design / UX',
  'Sales / marketing',
  'Finance / accounting',
  'Leadership',
  'Problem solving',
  'Writing',
  'Public speaking',
];

function parseSkillsString(s) {
  if (!s || typeof s !== 'string') return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function mapProfileToRecForm(profile, user) {
  const snap = profile || null;
  const allSkills = parseSkillsString(snap?.skills);
  const selectedSkills = allSkills.filter((s) => RECOMMENDATION_SKILL_OPTIONS.includes(s));
  const otherSkills = allSkills.filter((s) => !RECOMMENDATION_SKILL_OPTIONS.includes(s)).join(', ');
  return {
    displayName: (snap?.display_name ?? user?.name ?? '').trim(),
    gender: snap?.gender ?? '',
    ugCourse: snap?.ug_course ?? '',
    ugSpecialization: snap?.ug_specialization ?? '',
    interests: snap?.interests ?? '',
    selectedSkills,
    otherSkills,
    ugCgpaOrPercentage: snap?.ug_cgpa_or_percentage ?? '',
    hasCerts: snap?.has_additional_certifications === true ? 'yes' : snap?.has_additional_certifications === false ? 'no' : '',
    certTitles: snap?.certificate_course_titles ?? '',
    isWorking: snap?.is_working === true ? 'yes' : snap?.is_working === false ? 'no' : '',
    firstJobTitle: snap?.first_job_title ?? '',
    mastersField: snap?.masters_field ?? '',
  };
}

function mergeSkillsForPayload(form) {
  const extra = parseSkillsString(form.otherSkills);
  return [...new Set([...(form.selectedSkills || []), ...extra])];
}

function buildProfilePayloadFromRecForm(form, snapshot) {
  const base = snapshot || {};
  const merged = mergeSkillsForPayload(form);
  const skillsStr = merged.length ? merged.join(', ') : null;
  return {
    display_name: form.displayName?.trim() || null,
    skills: skillsStr ?? base.skills ?? null,
    interests: form.interests?.trim() || base.interests || null,
    experience_level: base.experience_level ?? null,
    education: base.education ?? null,
    preferred_industries: base.preferred_industries ?? null,
    location: base.location ?? null,
    bio: base.bio ?? null,
    linked_in_url: base.linked_in_url ?? null,
    portfolio_url: base.portfolio_url ?? null,
    gender: form.gender?.trim() || null,
    ug_course: form.ugCourse?.trim() || null,
    ug_specialization: form.ugSpecialization?.trim() || null,
    ug_cgpa_or_percentage: form.ugCgpaOrPercentage?.trim() || null,
    has_additional_certifications: form.hasCerts === 'yes' ? true : form.hasCerts === 'no' ? false : null,
    certificate_course_titles: form.certTitles?.trim() || null,
    is_working: form.isWorking === 'yes' ? true : form.isWorking === 'no' ? false : null,
    first_job_title: form.firstJobTitle?.trim() || null,
    masters_field: form.mastersField?.trim() || null,
  };
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const mapApiToCareer = (r) => ({
  id: r.id,
  title: r.title,
  match: r.match_percentage ?? 75,
  salary: r.salary_range ?? 'N/A',
  growth: r.growth ?? '',
  description: r.description ?? '',
  skills: r.skills ?? [],
  requirements: {
    education: "Bachelor's or related",
    experience: '1-5 years',
    certifications: [],
  },
  learningPath: (r.learning_path ?? []).map((lp) => ({
    step: lp.step,
    title: lp.title,
    duration: lp.duration ?? '',
  })),
  saved: r.saved ?? false,
});

const SAMPLE_RECOMMENDATIONS = [
  { id: 1, title: 'Data Scientist', match: 87, salary: '$95,000 - $140,000', growth: '+18%', description: 'Analyze complex data to help organizations make data-driven decisions.', skills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'], requirements: { education: "Bachelor's in Computer Science, Data Science, or related", experience: '2-5 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Python Fundamentals', duration: '2-3 months' }, { step: 2, title: 'Master Data Analysis Tools', duration: '1-2 months' }, { step: 3, title: 'Study Machine Learning', duration: '3-4 months' }, { step: 4, title: 'Build Portfolio Projects', duration: '2-3 months' }], saved: false },
  { id: 2, title: 'Software Engineer', match: 82, salary: '$85,000 - $130,000', growth: '+15%', description: 'Design, develop, and maintain software applications and systems.', skills: ['JavaScript', 'React', 'Node.js', 'System Design'], requirements: { education: "Bachelor's in Computer Science or Software Engineering", experience: '1-4 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Programming Fundamentals', duration: '3-4 months' }, { step: 2, title: 'Master Web Technologies', duration: '2-3 months' }, { step: 3, title: 'Learn Software Architecture', duration: '2-3 months' }, { step: 4, title: 'Build Real Projects', duration: '3-4 months' }], saved: false },
  { id: 3, title: 'Business Analyst', match: 76, salary: '$70,000 - $110,000', growth: '+12%', description: 'Bridge the gap between business needs and technical solutions.', skills: ['SQL', 'Business Analysis', 'Project Management', 'Communication'], requirements: { education: "Bachelor's in Business, IT, or related field", experience: '1-3 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Business Fundamentals', duration: '2-3 months' }, { step: 2, title: 'Master Data Analysis', duration: '1-2 months' }, { step: 3, title: 'Study Project Management', duration: '2-3 months' }, { step: 4, title: 'Gain Industry Experience', duration: '3-6 months' }], saved: false },
];

const Recommendation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const fromAssessment = location.state?.fromAssessment === true;
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [recForm, setRecForm] = useState(() => mapProfileToRecForm(null, null));
  const [profileSnapshot, setProfileSnapshot] = useState(null);
  const [profileFormLoading, setProfileFormLoading] = useState(true);
  const [recFormError, setRecFormError] = useState('');

  const persistRecProfile = useCallback(async (form, snap) => {
    const payload = buildProfilePayloadFromRecForm(form, snap);
    if (snap) {
      const updated = await profileAPI.update(payload);
      setProfileSnapshot(updated);
    } else {
      const created = await profileAPI.create({
        ...payload,
        preferred_industries: payload.preferred_industries || 'technology',
        interests: payload.interests || 'General / exploring careers',
        skills: payload.skills || 'Not specified',
      });
      setProfileSnapshot(created);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setProfileFormLoading(true);
      let snap = null;
      try {
        try {
          snap = await profileAPI.get();
        } catch (pe) {
          if (pe?.status !== 404) console.error(pe);
        }
        if (cancelled) return;
        setProfileSnapshot(snap);
        setRecForm(mapProfileToRecForm(snap, user));
      } finally {
        if (!cancelled) setProfileFormLoading(false);
      }

      try {
        if (fromAssessment) {
          const formVals = mapProfileToRecForm(snap, user);
          await persistRecProfile(formVals, snap);
          if (cancelled) return;
          try {
            const refreshed = await profileAPI.get();
            if (!cancelled) setProfileSnapshot(refreshed);
          } catch {
            /* ignore */
          }
          const gen = await recommendationsAPI.generate();
          const genList = Array.isArray(gen) ? gen.map(mapApiToCareer) : [];
          if (!cancelled) setCareers(genList.length > 0 ? genList : SAMPLE_RECOMMENDATIONS);
        } else {
          const data = await recommendationsAPI.getAll();
          const list = Array.isArray(data) ? data.map(mapApiToCareer) : [];
          if (cancelled) return;
          if (list.length > 0) {
            setCareers(list);
          } else {
            const gen = await recommendationsAPI.generate();
            const genList = Array.isArray(gen) ? gen.map(mapApiToCareer) : [];
            if (cancelled) return;
            setCareers(genList.length > 0 ? genList : SAMPLE_RECOMMENDATIONS);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setCareers(SAMPLE_RECOMMENDATIONS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [fromAssessment, user, persistRecProfile]);

  const toggleSkill = (skill) => {
    setRecForm((prev) => {
      const next = new Set(prev.selectedSkills);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return { ...prev, selectedSkills: Array.from(next) };
    });
  };

  const handleGenerate = async () => {
    setRecFormError('');
    if (!recForm.interests?.trim()) {
      setRecFormError('Please describe your interests.');
      return;
    }
    if (!mergeSkillsForPayload(recForm).length) {
      setRecFormError('Select at least one skill and/or enter additional skills (comma-separated).');
      return;
    }
    setGenerating(true);
    setChatHistory([]);
    try {
      await persistRecProfile(recForm, profileSnapshot);
      const data = await recommendationsAPI.generate();
      const list = Array.isArray(data) ? data.map(mapApiToCareer) : [];
      setCareers(list.length > 0 ? list : SAMPLE_RECOMMENDATIONS);
    } catch (err) {
      console.error(err);
      setCareers(SAMPLE_RECOMMENDATIONS);
    } finally {
      setGenerating(false);
    }
  };

  const toggleSave = async (careerId, currentlySaved) => {
    try {
      await recommendationsAPI.save(careerId, !currentlySaved);
      setCareers((prev) =>
        prev.map((c) => (c.id === careerId ? { ...c, saved: !currentlySaved } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatSend = async (msg) => {
    const message = (typeof msg === 'string' ? msg : '').trim();
    if (!message || chatLoading) return;
    const userEntry = { role: 'user', content: message };
    setChatHistory((h) => [...h, userEntry]);
    setChatLoading(true);
    try {
      const historyForApi = [...chatHistory, userEntry].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await recommendationsAPI.chat(message, historyForApi);
      const reply = res?.reply ?? 'Sorry, I could not get a response. Make sure OpenAI:ApiKey is configured.';
      setChatHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || 'Failed to send message. Please try again.';
      let displayMsg = errMsg;
      if (errMsg.includes('401')) displayMsg = 'Please log in again.';
      else if (errMsg.includes('403')) displayMsg = 'Access denied.';
      else if (errMsg.includes('503') || errMsg.toLowerCase().includes('unavailable')) displayMsg = 'AI service unavailable. Add OpenAI:ApiKey to configuration (see docs/OPENAI-SETUP.md).';
      else if (errMsg.includes('API request failed') || errMsg.includes('Failed to fetch')) displayMsg = 'Could not reach the server. Make sure the backend is running at http://localhost:8000 and try again.';
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', content: displayMsg },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const barData = {
    labels: careers.map((c) => c.title),
    datasets: [
      {
        label: 'Match Percentage',
        data: careers.map((c) => c.match),
        backgroundColor: [
          'rgba(13, 115, 119, 0.85)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ].slice(0, careers.length),
        borderColor: [
          'rgba(13, 115, 119, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ].slice(0, careers.length),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const radarData = selectedCareer
    ? {
        labels: ['Technical Skills', 'Communication', 'Problem Solving', 'Leadership', 'Creativity', 'Teamwork'],
        datasets: [
          {
            label: 'Your Skills',
            data: [3.5, 3, 3.5, 2, 2, 3],
            backgroundColor: 'rgba(13, 115, 119, 0.12)',
            borderColor: 'rgba(13, 115, 119, 1)',
            borderWidth: 2,
          },
          {
            label: 'Required Skills',
            data: [4.5, 3.5, 4, 3, 3.5, 4],
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            borderColor: 'rgba(6, 182, 212, 1)',
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter, sans-serif', size: 14, weight: 500 }, color: '#2c3e50', padding: 15 } },
      title: { display: true, text: 'Career Match Percentage', font: { family: 'Inter, sans-serif', size: 18, weight: 600 }, color: '#2c3e50', padding: { top: 10, bottom: 20 } },
      tooltip: { backgroundColor: 'rgba(30, 41, 59, 0.95)', padding: 12, borderColor: 'rgba(13, 115, 119, 0.4)', borderWidth: 1, cornerRadius: 8 },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { font: { size: 12 }, color: '#6c757d' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { ticks: { font: { size: 12, weight: 500 }, color: '#2c3e50' }, grid: { display: false } },
    },
  };

  return (
    <section className="page-section">
      <div className="card">
        <h2>AI-Based Career Recommendation</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Fill in the questionnaire below (aligned with our career survey). Your answers are saved to your profile and used with your assessment to generate recommendations.
        </p>

        {profileFormLoading ? (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Loading your profile…</p>
        ) : (
          <div
            className="recommendation-input-form"
            style={{
              marginBottom: '1.75rem',
              padding: '1.25rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            {recFormError && (
              <div className="error-message" style={{ marginBottom: '1rem' }} role="alert">
                {recFormError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="rec-name">What is your name?</label>
                <input
                  id="rec-name"
                  type="text"
                  value={recForm.displayName}
                  onChange={(e) => setRecForm((f) => ({ ...f, displayName: e.target.value }))}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="rec-gender">What is your gender?</label>
                <select
                  id="rec-gender"
                  value={recForm.gender}
                  onChange={(e) => setRecForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rec-ug-course">What was your course in UG?</label>
                <input
                  id="rec-ug-course"
                  type="text"
                  value={recForm.ugCourse}
                  onChange={(e) => setRecForm((f) => ({ ...f, ugCourse: e.target.value }))}
                  placeholder="e.g. B.Sc. Computer Science"
                />
              </div>
              <div className="form-group">
                <label htmlFor="rec-ug-spec">UG specialization / major subject</label>
                <input
                  id="rec-ug-spec"
                  type="text"
                  value={recForm.ugSpecialization}
                  onChange={(e) => setRecForm((f) => ({ ...f, ugSpecialization: e.target.value }))}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rec-interests">What are your interests?</label>
                <textarea
                  id="rec-interests"
                  rows={3}
                  value={recForm.interests}
                  onChange={(e) => setRecForm((f) => ({ ...f, interests: e.target.value }))}
                  placeholder="Career areas, domains, or activities you enjoy"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>What are your skills? (select any; add more below)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {RECOMMENDATION_SKILL_OPTIONS.map((skill) => (
                    <label
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '999px',
                        border: `1px solid ${recForm.selectedSkills.includes(skill) ? 'var(--accent)' : 'var(--border-light)'}`,
                        background: recForm.selectedSkills.includes(skill) ? 'rgba(13, 115, 119, 0.1)' : 'transparent',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={recForm.selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rec-skills-extra">Additional skills (comma-separated)</label>
                <input
                  id="rec-skills-extra"
                  type="text"
                  value={recForm.otherSkills}
                  onChange={(e) => setRecForm((f) => ({ ...f, otherSkills: e.target.value }))}
                  placeholder="e.g. Python, SQL, Figma"
                />
              </div>
              <div className="form-group">
                <label htmlFor="rec-cgpa">Average CGPA or percentage (UG)</label>
                <input
                  id="rec-cgpa"
                  type="text"
                  value={recForm.ugCgpaOrPercentage}
                  onChange={(e) => setRecForm((f) => ({ ...f, ugCgpaOrPercentage: e.target.value }))}
                  placeholder="e.g. 3.5 / 75%"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Did you do any certification courses additionally?</span>
                <label style={{ marginRight: '1.25rem' }}>
                  <input
                    type="radio"
                    name="rec-certs"
                    checked={recForm.hasCerts === 'yes'}
                    onChange={() => setRecForm((f) => ({ ...f, hasCerts: 'yes' }))}
                  />
                  {' '}Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="rec-certs"
                    checked={recForm.hasCerts === 'no'}
                    onChange={() => setRecForm((f) => ({ ...f, hasCerts: 'no' }))}
                  />
                  {' '}No
                </label>
              </div>
              {recForm.hasCerts === 'yes' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="rec-cert-titles">Certificate course title(s)</label>
                  <input
                    id="rec-cert-titles"
                    type="text"
                    value={recForm.certTitles}
                    onChange={(e) => setRecForm((f) => ({ ...f, certTitles: e.target.value }))}
                    placeholder="e.g. AWS Cloud Practitioner"
                  />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Are you working?</span>
                <label style={{ marginRight: '1.25rem' }}>
                  <input
                    type="radio"
                    name="rec-work"
                    checked={recForm.isWorking === 'yes'}
                    onChange={() => setRecForm((f) => ({ ...f, isWorking: 'yes' }))}
                  />
                  {' '}Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="rec-work"
                    checked={recForm.isWorking === 'no'}
                    onChange={() => setRecForm((f) => ({ ...f, isWorking: 'no' }))}
                  />
                  {' '}No
                </label>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rec-first-job">First job title in your current field (if working); otherwise NA</label>
                <input
                  id="rec-first-job"
                  type="text"
                  value={recForm.firstJobTitle}
                  onChange={(e) => setRecForm((f) => ({ ...f, firstJobTitle: e.target.value }))}
                  placeholder="e.g. Junior Analyst or NA"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rec-masters">Masters after UG? If yes, mention field (e.g. Masters in Mathematics)</label>
                <input
                  id="rec-masters"
                  type="text"
                  value={recForm.mastersField}
                  onChange={(e) => setRecForm((f) => ({ ...f, mastersField: e.target.value }))}
                  placeholder="Leave blank if no masters"
                />
              </div>
            </div>
          </div>
        )}

        {careers.length === 0 && !loading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No recommendations yet. Generate AI-powered recommendations based on your profile and assessment.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || profileFormLoading}
            >
              {generating ? 'Generating...' : 'Generate Recommendations'}
            </button>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
              Or try sample recommendations to explore the interface:
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCareers(SAMPLE_RECOMMENDATIONS)}
              style={{ marginTop: '0.5rem' }}
            >
              Show Sample Recommendations
            </button>
          </div>
        )}

        {careers.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={handleGenerate}
              disabled={generating || profileFormLoading}
              style={{ marginRight: '0.5rem' }}
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            {fromAssessment ? 'Generating recommendations based on your assessment…' : 'Loading recommendations…'}
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {careers.map((career) => (
                <div
                  key={career.id}
                  className="career-card"
                  style={{
                    border: selectedCareer?.id === career.id ? '2px solid var(--accent)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedCareer(career)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>{career.title}</h3>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'rgba(13, 115, 119, 0.08)',
                            color: 'var(--accent)',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                          }}
                        >
                          {career.match}% Match
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{career.description}</p>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                        <span><strong>Salary:</strong> {career.salary}</span>
                        {career.growth && (
                          <span><strong>Growth:</strong> <span style={{ color: 'var(--success-color)' }}>{career.growth}</span></span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatOpen(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid var(--accent)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title="Ask questions about this career"
                      >
                        <ChatIcon size={16} color="currentColor" />
                        Ask
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(career.id, career.saved);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: career.saved ? 'var(--success-color)' : 'transparent',
                          border: `1px solid ${career.saved ? 'var(--success-color)' : 'var(--border-color)'}`,
                          color: career.saved ? 'white' : 'var(--text-secondary)',
                        }}
                      >
                        {career.saved ? (
                          <>
                            <CheckIcon size={16} color="white" style={{ marginRight: '0.25rem', display: 'inline-block' }} />
                            Saved
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {careers.length > 0 && (
              <div className="chart-container">
                <Bar data={barData} options={chartOptions} />
              </div>
            )}
          </>
        )}
      </div>

      {selectedCareer && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{selectedCareer.title} - Detailed Analysis</h3>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Ask questions about this career"
            >
              <ChatIcon size={16} color="currentColor" />
              Ask about this career
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h4>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {(selectedCareer.skills?.length ? selectedCareer.skills : ['See learning path']).map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'rgba(13, 115, 119, 0.08)',
                      color: 'var(--accent)',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4>Requirements</h4>
              <p><strong>Education:</strong> {selectedCareer.requirements.education}</p>
              <p><strong>Experience:</strong> {selectedCareer.requirements.experience}</p>
            </div>
          </div>
          {selectedCareer.learningPath?.length > 0 && (
            <div>
              <h4>Recommended Learning Path</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {selectedCareer.learningPath.map((step) => (
                  <div
                    key={step.step}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--accent)',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                    >
                      {step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{step.title}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Duration: {step.duration || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {radarData && (
            <div style={{ marginTop: '2rem' }}>
              <h4>Skill Gap Analysis</h4>
              <div style={{ height: '400px', marginTop: '1rem' }}>
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat: opens when user clicks "Ask" on a career */}
      {careers.length > 0 && (
        <RecommendationChatbot
          onSend={handleChatSend}
          chatHistory={chatHistory}
          chatLoading={chatLoading}
          disabled={false}
          open={chatOpen}
          onOpenChange={setChatOpen}
          showFloatingButton={false}
        />
      )}

      {/* Similar AI career tools reference */}
      <div className="card">
        <h3>Similar AI Career Tools</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Other AI-powered systems that match skills with jobs: LinkedIn, Eightfold.ai, FuturU, Jobscan, HiringCafe, Magnet.me, Promilo. Most use resume analysis, skill matching, and job market data.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <strong>LinkedIn</strong> — AI job matching, career advice
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <strong>Eightfold.ai</strong> — Career paths, skill gaps
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <strong>FuturU</strong> — Career fit score, market trends
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <strong>Jobscan</strong> — CV vs job description matching
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
          For software students: LinkedIn (must-have), Eightfold.ai (career path), Jobscan (CV improvement). Keep GitHub + portfolio updated.
        </p>
      </div>
    </section>
  );
};

export default Recommendation;
