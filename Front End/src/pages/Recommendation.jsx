import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bar, Radar } from 'react-chartjs-2';
import { CheckIcon, ChatIcon } from '../components/Icons';
import RecommendationChatbot from '../components/RecommendationChatbot';
import { recommendationsAPI } from '../services/api';
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
  match: r.match_percentage ?? r.matchPercentage ?? 75,
  salary: r.salary_range ?? r.salaryRange ?? 'N/A',
  growth: r.growth ?? '',
  description: r.description ?? '',
  skills: r.skills ?? [],
  requirements: {
    education: "Bachelor's or related",
    experience: '1-5 years',
    certifications: [],
  },
  learningPath: (r.learning_path ?? r.learningPath ?? []).map((lp) => ({
    step: lp.step,
    title: lp.title,
    duration: lp.duration ?? '',
  })),
  saved: r.saved ?? false,
});

const API_BASE_HINT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/** POST /generate returns { recommendations, generation_source } or (legacy) a bare array. */
function parseGenerateResponse(data) {
  if (Array.isArray(data)) {
    return { rows: data, generationSource: null };
  }
  if (data && typeof data === 'object') {
    const rows =
      data.recommendations ?? data.Recommendations ?? data.items ?? data.Items ?? [];
    const generationSource =
      data.generation_source ?? data.generationSource ?? data.GenerationSource ?? null;
    return { rows: Array.isArray(rows) ? rows : [], generationSource };
  }
  return { rows: [], generationSource: null };
}

const SAMPLE_RECOMMENDATIONS = [
  { id: 1, title: 'Data Scientist', match: 87, salary: '$95,000 - $140,000', growth: '+18%', description: 'Analyze complex data to help organizations make data-driven decisions.', skills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'], requirements: { education: "Bachelor's in Computer Science, Data Science, or related", experience: '2-5 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Python Fundamentals', duration: '2-3 months' }, { step: 2, title: 'Master Data Analysis Tools', duration: '1-2 months' }, { step: 3, title: 'Study Machine Learning', duration: '3-4 months' }, { step: 4, title: 'Build Portfolio Projects', duration: '2-3 months' }], saved: false },
  { id: 2, title: 'Software Engineer', match: 82, salary: '$85,000 - $130,000', growth: '+15%', description: 'Design, develop, and maintain software applications and systems.', skills: ['JavaScript', 'React', 'Node.js', 'System Design'], requirements: { education: "Bachelor's in Computer Science or Software Engineering", experience: '1-4 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Programming Fundamentals', duration: '3-4 months' }, { step: 2, title: 'Master Web Technologies', duration: '2-3 months' }, { step: 3, title: 'Learn Software Architecture', duration: '2-3 months' }, { step: 4, title: 'Build Real Projects', duration: '3-4 months' }], saved: false },
  { id: 3, title: 'Business Analyst', match: 76, salary: '$70,000 - $110,000', growth: '+12%', description: 'Bridge the gap between business needs and technical solutions.', skills: ['SQL', 'Business Analysis', 'Project Management', 'Communication'], requirements: { education: "Bachelor's in Business, IT, or related field", experience: '1-3 years', certifications: [] }, learningPath: [{ step: 1, title: 'Learn Business Fundamentals', duration: '2-3 months' }, { step: 2, title: 'Master Data Analysis', duration: '1-2 months' }, { step: 3, title: 'Study Project Management', duration: '2-3 months' }, { step: 4, title: 'Gain Industry Experience', duration: '3-6 months' }], saved: false },
];

const Recommendation = () => {
  const location = useLocation();
  const fromAssessment = location.state?.fromAssessment === true;
  const fromCareerSurvey = location.state?.fromCareerSurvey === true;
  const regenerateOnLoad = fromAssessment || fromCareerSurvey;
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingAskCareer, setPendingAskCareer] = useState(null);
  /** True when API failed or UI is showing sample / offline template rows. */
  const [usingTemplateRecommendations, setUsingTemplateRecommendations] = useState(false);
  /** From last generate: ai | template_no_key | template_llm_failed | template_error | offline | null */
  const [generationSource, setGenerationSource] = useState(null);
  /** From GET /recommendations/ai-setup-status — tells us if Gemini/OpenAI key is configured on the server. */
  const [aiSetupStatus, setAiSetupStatus] = useState(null);
  const [aiSetupLoaded, setAiSetupLoaded] = useState(false);

  const refreshAiSetupStatus = useCallback(async () => {
    try {
      const setup = await recommendationsAPI.getAiSetupStatus();
      setAiSetupStatus({
        llmConfigured: Boolean(setup.llm_configured ?? setup.llmConfigured),
        provider: setup.provider ?? '',
        model: setup.model ?? '',
      });
    } catch {
      setAiSetupStatus(null);
    } finally {
      setAiSetupLoaded(true);
    }
  }, []);

  const applyRecommendationList = useCallback((payload, options = {}) => {
    const fromApiError = options.fromApiError === true;
    let rows;
    let source;

    if (fromApiError) {
      rows = [];
      source = 'offline';
    } else if (Array.isArray(payload)) {
      rows = payload;
      source = options.generationSource ?? null;
    } else {
      const parsed = parseGenerateResponse(payload);
      rows = parsed.rows;
      source = parsed.generationSource ?? options.generationSource ?? null;
    }

    const genList = rows.map(mapApiToCareer);
    const list =
      genList.length > 0
        ? genList
        : SAMPLE_RECOMMENDATIONS.map((c, i) => ({ ...c, id: -(i + 1) }));

    const isOfflineSample = list.some((c) => c.id < 0);
    const isNonAiGenerate =
      source === 'template_no_key' ||
      source === 'template_llm_failed' ||
      source === 'template_error';

    setGenerationSource(source);
    setUsingTemplateRecommendations(Boolean(fromApiError || isOfflineSample || isNonAiGenerate));
    setCareers(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setUsingTemplateRecommendations(false);
      setGenerationSource(null);
      setAiSetupLoaded(false);
      try {
        await refreshAiSetupStatus();
        if (cancelled) return;

        if (regenerateOnLoad) {
          const gen = await recommendationsAPI.generate();
          if (!cancelled) applyRecommendationList(gen);
        } else {
          const data = await recommendationsAPI.getAll();
          const list = Array.isArray(data) ? data.map(mapApiToCareer) : [];
          if (cancelled) return;
          if (list.length > 0) {
            setCareers(list);
            setGenerationSource(null);
            setUsingTemplateRecommendations(list.some((c) => c.id < 0));
          } else {
            const gen = await recommendationsAPI.generate();
            if (cancelled) return;
            applyRecommendationList(gen);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          applyRecommendationList([], { fromApiError: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [regenerateOnLoad, applyRecommendationList, refreshAiSetupStatus]);

  const handleGenerate = async () => {
    setGenerating(true);
    setChatHistory([]);
    try {
      const data = await recommendationsAPI.generate();
      applyRecommendationList(data);
      await refreshAiSetupStatus();
    } catch (err) {
      console.error(err);
      applyRecommendationList([], { fromApiError: true });
      await refreshAiSetupStatus();
    } finally {
      setGenerating(false);
    }
  };

  const toggleSave = async (careerId, currentlySaved) => {
    if (careerId < 0) return;
    try {
      await recommendationsAPI.save(careerId, !currentlySaved);
      setCareers((prev) =>
        prev.map((c) => (c.id === careerId ? { ...c, saved: !currentlySaved } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const askAboutCareer = (careerTitle) => {
    setChatOpen(true);
    setPendingAskCareer(careerTitle);
  };

  useEffect(() => {
    if (!pendingAskCareer || !chatOpen || chatLoading) return;
    const title = pendingAskCareer;
    setPendingAskCareer(null);
    // Defer until after chat panel paints so the UI is open before the request runs
    const t = window.setTimeout(() => {
      handleChatSend(`Tell me more about ${title}`);
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAskCareer, chatOpen, chatLoading]);

  const handleChatSend = async (msg) => {
    const message = (typeof msg === 'string' ? msg : '').trim();
    if (!message || chatLoading) return;
    // Snapshot prior turns inside the state updater so history is never stale (multi-turn like ChatGPT/Gemini)
    let historySnapshot = [];
    setChatHistory((h) => {
      historySnapshot = h.map((m) => ({ role: m.role, content: m.content }));
      return [...h, { role: 'user', content: message }];
    });
    setChatLoading(true);
    try {
      const res = await recommendationsAPI.chat(message, historySnapshot);
      const reply =
        (typeof res?.reply === 'string' && res.reply) ||
        (typeof res?.data?.reply === 'string' && res.data.reply) ||
        'Sorry, I could not get a response. Try again in a moment.';
      setChatHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || 'Failed to send message. Please try again.';
      let displayMsg = errMsg;
      if (errMsg.includes('401')) displayMsg = 'Please log in again.';
      else if (errMsg.includes('403')) displayMsg = 'Access denied.';
      else if (errMsg.includes('503') || errMsg.toLowerCase().includes('unavailable')) displayMsg = 'The server could not complete chat right now. Check that the backend is running and try again.';
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

  const showConnectAiPanel =
    aiSetupLoaded && aiSetupStatus && !aiSetupStatus.llmConfigured;

  const showOrangeTemplateBanner =
    usingTemplateRecommendations &&
    !loading &&
    !(generationSource === 'template_no_key' && showConnectAiPanel);

  return (
    <section className="page-section">
      <div className="card">
        <h2>AI-Based Career Recommendation</h2>
        <p className="page-lede" style={{ marginBottom: '1.25rem' }}>
          Recommendations use your saved <Link to="/career-survey">career survey</Link> (interests, skills, UG fields) and
          skill assessment. When the survey ML service is running (<code style={{ fontSize: '0.85em' }}>ml/predict_api.py</code>
          + <code style={{ fontSize: '0.85em' }}>ML:PythonPredictBaseUrl</code>), generate/regenerate also uses that model to
          steer career paths; with a configured Gemini/OpenAI key, the list is AI-ranked using both.
        </p>

        {showConnectAiPanel && (
          <div
            role="status"
            style={{
              marginBottom: '1.25rem',
              padding: '0.85rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              color: 'var(--text)',
            }}
          >
            <strong>Turn on the built-in AI (Gemini / ChatGPT / Groq / Ollama):</strong> your backend is set to{' '}
            <code style={{ fontSize: '0.85em' }}>{aiSetupStatus.provider || 'Gemini'}</code>
            {aiSetupStatus.model ? (
              <>
                {' '}
                with model <code style={{ fontSize: '0.85em' }}>{aiSetupStatus.model}</code>
              </>
            ) : null}
            , but <strong>no API key is loaded</strong>, so the app cannot call Google or OpenAI yet — you only see generic
            template careers until a key is set.
            <br />
            <span style={{ display: 'block', marginTop: '0.5rem' }}>
              <strong>Free Gemini (easiest):</strong>{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                create a key in Google AI Studio
              </a>
              , then put it in <code style={{ fontSize: '0.85em' }}>Back-End/appsettings.json</code> →{' '}
              <code style={{ fontSize: '0.85em' }}>AI:Gemini:ApiKey</code>, or set env{' '}
              <code style={{ fontSize: '0.85em' }}>GEMINI_API_KEY</code>, or{' '}
              <code style={{ fontSize: '0.85em' }}>dotnet user-secrets set &quot;AI:Gemini:ApiKey&quot; &quot;…&quot;</code>{' '}
              in the Back-End folder. For OpenAI or Groq, set <code style={{ fontSize: '0.85em' }}>AI:Provider</code> and
              the matching key (see <code style={{ fontSize: '0.85em' }}>docs/OPENAI-SETUP.md</code>). Restart the API, then
              click <strong>Regenerate</strong>.
            </span>
          </div>
        )}

        {showOrangeTemplateBanner && (
          <p
            role="status"
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              color: 'var(--text)',
            }}
          >
            {generationSource === 'template_no_key' && (
              <>
                <strong>Not AI-personalized yet:</strong> No API key is configured on the server. Use the blue box above
                (if visible) or see <code style={{ fontSize: '0.85em' }}>docs/OPENAI-SETUP.md</code>, restart the API, then{' '}
                <strong>Regenerate</strong>.
              </>
            )}
            {generationSource === 'template_llm_failed' && (
              <>
                <strong>AI call failed:</strong> A key may be set, but the provider did not return usable recommendations
                (wrong model name, quota, network, or invalid JSON). Check the API console, try{' '}
                <code style={{ fontSize: '0.85em' }}>gemini-2.0-flash</code> in appsettings, and restart the backend. Showing
                template careers until generation succeeds — click <strong>Regenerate</strong> after fixing.
              </>
            )}
            {generationSource === 'offline' && (
              <>
                <strong>Could not reach the API:</strong> the browser request failed (backend not running, wrong URL, or
                session expired). Confirm the API is up at <code style={{ fontSize: '0.85em' }}>{API_BASE_HINT}</code>,
                check <code style={{ fontSize: '0.85em' }}>VITE_API_BASE_URL</code> in the front end, and log in again if
                you see 401 errors. After the connection works, add a Gemini/OpenAI key (see{' '}
                <code style={{ fontSize: '0.85em' }}>docs/OPENAI-SETUP.md</code>) and click <strong>Regenerate</strong>.
              </>
            )}
            {generationSource === 'template_error' && (
              <>
                <strong>Server error while saving recommendations:</strong> check backend logs and SQL connection. After
                fixing, click <strong>Regenerate</strong>. For personalized careers you still need an AI API key — see{' '}
                <code style={{ fontSize: '0.85em' }}>docs/OPENAI-SETUP.md</code>.
              </>
            )}
            {(generationSource === null || generationSource === undefined) && (
              <>
                <strong>Demo / sample data:</strong> you are seeing local example careers (not from your profile). Use{' '}
                <strong>Regenerate</strong> after the API is connected, or configure an AI key as in the blue box above.
              </>
            )}
          </p>
        )}

        {careers.length === 0 && !loading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No recommendations yet. Generate AI-powered recommendations based on your profile and assessment.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Recommendations'}
            </button>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
              Or try sample recommendations to explore the interface:
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => applyRecommendationList([], { fromApiError: true })}
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
              disabled={generating}
              style={{ marginRight: '0.5rem' }}
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            {fromCareerSurvey
              ? 'Generating recommendations from your career survey…'
              : fromAssessment
                ? 'Generating recommendations based on your assessment…'
                : 'Loading recommendations…'}
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
                          askAboutCareer(career.title);
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
              onClick={() => askAboutCareer(selectedCareer.title)}
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
          onNewChat={() => {
            if (!chatLoading) setChatHistory([]);
          }}
          chatHistory={chatHistory}
          chatLoading={chatLoading}
          disabled={false}
          open={chatOpen}
          onOpenChange={setChatOpen}
          showFloatingButton={true}
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
