import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, mlAPI } from '../services/api';
import { mapProfileToRecForm, buildProfilePayloadFromRecForm } from '../careerIntakeUtils';
import CareerIntakeFormFields from '../components/CareerIntakeFormFields';
import './PageStyles.css';

/**
 * Single place to enter career background (survey) data — used by Home, Recommendations, and Assessment flows.
 */
const CareerSurvey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recForm, setRecForm] = useState(() => mapProfileToRecForm(null, null));
  const [profileSnapshot, setProfileSnapshot] = useState(null);
  const [profileFormLoading, setProfileFormLoading] = useState(true);
  const [recFormError, setRecFormError] = useState('');
  const [savingIntake, setSavingIntake] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [mlPreview, setMlPreview] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState('');

  const persistRecProfile = useCallback(async (form, snap) => {
    const payload = buildProfilePayloadFromRecForm(form, snap);
    if (snap) {
      const updated = await profileAPI.update(payload);
      setProfileSnapshot(updated);
    } else {
      const created = await profileAPI.create({
        ...payload,
        preferredIndustries: payload.preferredIndustries || 'technology',
        interests: payload.interests || 'General / exploring careers',
        skills: payload.skills || 'Not specified',
      });
      setProfileSnapshot(created);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setProfileFormLoading(true);
      setRecFormError('');
      setSaveMessage('');
      let snap = null;
      try {
        try {
          snap = await profileAPI.get();
        } catch (e) {
          if (e?.status !== 404) console.error(e);
        }
        if (!cancelled) {
          setProfileSnapshot(snap);
          setRecForm(mapProfileToRecForm(snap, user));
        }
      } finally {
        if (!cancelled) setProfileFormLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const validateIntake = () => {
    if (!recForm.interests?.trim()) {
      setRecFormError('Please describe your interests.');
      return false;
    }
    if (!recForm.skillsText?.trim()) {
      setRecFormError('Please enter your skills (free text, comma or semicolon separated).');
      return false;
    }
    return true;
  };

  const handleMlPredict = async () => {
    setMlError('');
    setMlPreview(null);
    if (!validateIntake()) return;
    setMlLoading(true);
    try {
      const res = await mlAPI.predictInterest({
        interests: recForm.interests,
        skills: recForm.skillsText,
        certificateCourseTitle: recForm.certTitles || '',
        ugCourse: recForm.ugCourse || '',
        ugSpecialization: recForm.ugSpecialization || '',
        topK: 3,
      });
      const available = res.available ?? res.Available;
      if (available) {
        setMlPreview({
          category: res.predicted_category ?? res.predictedCategory,
          classes: res.classes ?? res.Classes,
          topPredictions: res.top_predictions ?? res.topPredictions,
        });
      } else {
        setMlError(res.message ?? res.Message ?? 'ML preview unavailable.');
      }
    } catch (err) {
      console.error(err);
      setMlError(err?.message || 'Could not run ML preview. Log in and ensure the API is running.');
    } finally {
      setMlLoading(false);
    }
  };

  const handleSaveOnly = async () => {
    setRecFormError('');
    setSaveMessage('');
    if (!validateIntake()) return;
    setSavingIntake(true);
    try {
      await persistRecProfile(recForm, profileSnapshot);
      try {
        const refreshed = await profileAPI.get();
        setProfileSnapshot(refreshed);
      } catch {
        /* ignore */
      }
      localStorage.setItem('assessmentCompleted', 'true');
      setSaveMessage('Saved to your profile.');
    } catch (err) {
      console.error(err);
      setRecFormError(err?.message || 'Could not save. Please log in and try again.');
    } finally {
      setSavingIntake(false);
    }
  };

  const handleSaveAndViewRecommendations = async () => {
    setRecFormError('');
    setSaveMessage('');
    if (!validateIntake()) return;
    setSavingIntake(true);
    try {
      await persistRecProfile(recForm, profileSnapshot);
      try {
        const refreshed = await profileAPI.get();
        setProfileSnapshot(refreshed);
      } catch {
        /* ignore */
      }
      localStorage.setItem('assessmentCompleted', 'true');
      navigate('/recommendation', { state: { fromCareerSurvey: true } });
    } catch (err) {
      console.error(err);
      setRecFormError(err?.message || 'Could not save. Please log in and try again.');
    } finally {
      setSavingIntake(false);
    }
  };

  return (
    <section className="page-section">
      <div className="card">
        <h2>Career background (survey)</h2>
        <p className="page-lede">
          Enter your details once here — they are saved to your profile and used for AI recommendations. Use{' '}
          <strong>Save &amp; view recommendations</strong> to open the recommendations page and generate careers from this
          survey (and any saved assessment). Optional:{' '}
          <Link to="/assessment">skill assessment</Link> for richer context.{' '}
          <Link to="/home">Home</Link>
          {' · '}
          <Link to="/recommendation">Recommendations</Link>
        </p>

        {saveMessage && (
          <p className="jobs-muted" style={{ color: 'var(--success)' }} role="status">
            {saveMessage}
          </p>
        )}

        {profileFormLoading ? (
          <p className="jobs-muted">Loading your profile…</p>
        ) : (
          <>
            <CareerIntakeFormFields
              recForm={recForm}
              setRecForm={setRecForm}
              recFormError={recFormError}
              idPrefix="career-survey"
            />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={savingIntake}
                onClick={handleSaveOnly}
              >
                {savingIntake ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={savingIntake}
                onClick={handleSaveAndViewRecommendations}
              >
                Save &amp; view recommendations
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={savingIntake || mlLoading || profileFormLoading}
                onClick={handleMlPredict}
                title="Uses your Colab model via Python API — see ml/HOWTO-USE-MODEL.md"
              >
                {mlLoading ? 'Predicting…' : 'Preview interest category (ML)'}
              </button>
            </div>
            {mlPreview && (
              <p
                className="jobs-muted"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(13, 115, 119, 0.08)',
                  border: '1px solid rgba(13, 115, 119, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                }}
                role="status"
              >
                <strong>ML model (interests):</strong> predicted category{' '}
                <code style={{ fontSize: '0.9em' }}>{mlPreview.category}</code>
                {Array.isArray(mlPreview.topPredictions) && mlPreview.topPredictions.length > 0 ? (
                  <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                    Top picks:{' '}
                    {mlPreview.topPredictions
                      .map(
                        (t) =>
                          `${t.label ?? t.Label} (${((t.probability ?? t.Probability ?? 0) * 100).toFixed(1)}%)`
                      )
                      .join(' · ')}
                  </span>
                ) : null}
                {Array.isArray(mlPreview.classes) && mlPreview.classes.length > 0 ? (
                  <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    All classes: {mlPreview.classes.join(', ')}
                  </span>
                ) : null}
              </p>
            )}
            {mlError && (
              <p className="jobs-muted" style={{ marginTop: '0.5rem', color: 'var(--danger, #b91c1c)' }} role="alert">
                {mlError}
              </p>
            )}
            <p className="jobs-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem', maxWidth: '42rem' }}>
              For careers tailored to this survey (not the generic template list), configure a free{' '}
              <strong>Gemini</strong> API key on the backend — see <code style={{ fontSize: '0.85em' }}>docs/OPENAI-SETUP.md</code>.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default CareerSurvey;
