import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
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
            </div>
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
