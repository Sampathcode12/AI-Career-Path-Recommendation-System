import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, authAPI } from '../services/api';
import './PageStyles.css';
import './Profile.css';

const PROFILE_INDUSTRIES = [
  { id: 'technology', name: 'Technology' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'finance', name: 'Finance' },
  { id: 'education', name: 'Education' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'energy', name: 'Energy & Utilities' },
  { id: 'retail', name: 'Retail' },
  { id: 'construction', name: 'Construction' },
  { id: 'hospitality', name: 'Hospitality & Tourism' },
  { id: 'transportation', name: 'Transportation & Logistics' },
  { id: 'realestate', name: 'Real Estate' },
  { id: 'media', name: 'Media & Entertainment' },
  { id: 'legal', name: 'Legal' },
  { id: 'government', name: 'Government & Public Sector' },
  { id: 'agriculture', name: 'Agriculture & Food' },
  { id: 'mining', name: 'Mining & Natural Resources' },
  { id: 'professional', name: 'Professional Services' },
  { id: 'creative', name: 'Creative & Design' },
  { id: 'nonprofit', name: 'Non-profit & NGO' },
  { id: 'telecom', name: 'Telecommunications' },
  { id: 'aerospace', name: 'Aerospace & Defense' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    educationEntries: [{ level: '', field: '', certs: '' }],
    currentRole: '',
    location: '',
    skills: '',
    interests: '',
    preferredIndustries: [],
    bio: '',
    linkedIn: '',
    portfolio: '',
    gender: '',
    ugCourse: '',
    ugSpecialization: '',
    ugCgpaOrPercentage: '',
    hasAdditionalCertifications: '',
    certificateCourseTitles: '',
    isWorking: '',
    firstJobTitle: '',
    mastersField: '',
  });
  const [profileProgress, setProfileProgress] = useState(0);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const calculateProgress = useCallback((data) => {
    const hasEducation = Array.isArray(data.educationEntries) && data.educationEntries.some(e => e?.level?.trim());
    const fields = [
      () => data.fullName?.trim(),
      () => data.email?.trim(),
      () => hasEducation,
      () => data.currentRole?.trim(),
      () => data.skills?.trim(),
      () => data.interests?.trim(),
      () => data.bio?.trim(),
      () => Array.isArray(data.preferredIndustries) && data.preferredIndustries.length > 0,
    ];
    const filledFields = fields.filter(fn => fn()).length;
    return Math.round((filledFields / fields.length) * 100);
  }, []);

  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({ ...prev, fullName: user.name || '', email: user.email || '' }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const profile = await profileAPI.get();
        if (cancelled) return;
        setHasExistingProfile(true);
        const edu = profile.education ?? '';
        const eduEntries = [];
        if (edu.includes(';;')) {
          edu.split(';;').forEach(entry => {
            const p = entry.split('|');
            eduEntries.push({ level: p[0] || '', field: p[1] || '', certs: p[2] || '' });
          });
        } else if (edu.trim()) {
          const p = edu.split('|');
          eduEntries.push({ level: p[0] || '', field: p[1] || '', certs: p[2] || '' });
        }
        if (eduEntries.length === 0) eduEntries.push({ level: '', field: '', certs: '' });
        const prefInd = (profile.preferred_industries ?? profile.preferredIndustries ?? '')
          ? String(profile.preferred_industries ?? profile.preferredIndustries).split(',').map(s => s.trim()).filter(Boolean)
          : [];
        setFormData(prev => ({
          ...prev,
          fullName: profile.display_name ?? user.name ?? prev.fullName,
          email: user.email || prev.email,
          educationEntries: eduEntries,
          currentRole: profile.experience_level ?? '',
          location: profile.location ?? '',
          skills: profile.skills ?? '',
          interests: profile.interests ?? '',
          preferredIndustries: prefInd,
          bio: profile.bio ?? '',
          linkedIn: profile.linked_in_url ?? '',
          portfolio: profile.portfolio_url ?? '',
          gender: profile.gender ?? '',
          ugCourse: profile.ug_course ?? '',
          ugSpecialization: profile.ug_specialization ?? '',
          ugCgpaOrPercentage: profile.ug_cgpa_or_percentage ?? '',
          hasAdditionalCertifications: profile.has_additional_certifications === true ? 'yes' : profile.has_additional_certifications === false ? 'no' : '',
          certificateCourseTitles: profile.certificate_course_titles ?? '',
          isWorking: profile.is_working === true ? 'yes' : profile.is_working === false ? 'no' : '',
          firstJobTitle: profile.first_job_title ?? '',
          mastersField: profile.masters_field ?? '',
        }));
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          try {
            await authAPI.getCurrentUser();
            setHasExistingProfile(false);
            setFormData(prev => ({ ...prev, fullName: user.name || '', email: user.email || '', educationEntries: [{ level: '', field: '', certs: '' }] }));
            setError('Could not load profile. You can add your details below.');
          } catch (authErr) {
            if (authErr?.status === 401) {
              logout();
              navigate('/login', { replace: true, state: { from: { pathname: '/profile' } } });
            } else {
              setError('Session may have expired or the server is unavailable. Please try again or log in.');
            }
          }
          return;
        }
        if (err.status === 404 || err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
          setHasExistingProfile(false);
          setFormData(prev => ({ ...prev, fullName: user.name || '', email: user.email || '', educationEntries: [{ level: '', field: '', certs: '' }] }));
        } else {
          setError(err.message || 'Failed to load profile');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    setProfileProgress(calculateProgress(formData));
  }, [formData, calculateProgress]);

  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
  };

  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      educationEntries: [...(prev.educationEntries || []), { level: '', field: '', certs: '' }],
    }));
  };

  const removeEducationEntry = (index) => {
    setFormData(prev => {
      const entries = [...(prev.educationEntries || [])];
      if (entries.length <= 1) return prev;
      entries.splice(index, 1);
      return { ...prev, educationEntries: entries };
    });
  };

  const updateEducationEntry = (index, field, value) => {
    setFormData(prev => {
      const entries = [...(prev.educationEntries || [])];
      if (!entries[index]) return prev;
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, educationEntries: entries };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.preferredIndustries?.length) {
      setError('Please select at least one interesting industry.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const entries = formData.educationEntries || [];
      const eduValue = entries
        .map(e => [e.level, e.field, e.certs].filter(Boolean).join('|'))
        .filter(s => s.trim())
        .join(';;') || null;
      const payload = {
        display_name: formData.fullName?.trim() || null,
        education: eduValue,
        experience_level: formData.currentRole || null,
        location: formData.location || null,
        skills: formData.skills || null,
        interests: formData.interests || null,
        bio: formData.bio || null,
        linked_in_url: formData.linkedIn || null,
        portfolio_url: formData.portfolio || null,
        preferred_industries: Array.isArray(formData.preferredIndustries) && formData.preferredIndustries.length > 0
          ? formData.preferredIndustries.join(',')
          : null,
        gender: formData.gender || null,
        ug_course: formData.ugCourse || null,
        ug_specialization: formData.ugSpecialization || null,
        ug_cgpa_or_percentage: formData.ugCgpaOrPercentage || null,
        has_additional_certifications: formData.hasAdditionalCertifications === 'yes' ? true : formData.hasAdditionalCertifications === 'no' ? false : null,
        certificate_course_titles: formData.certificateCourseTitles || null,
        is_working: formData.isWorking === 'yes' ? true : formData.isWorking === 'no' ? false : null,
        first_job_title: formData.firstJobTitle || null,
        masters_field: formData.mastersField || null,
      };
      if (hasExistingProfile) {
        await profileAPI.update(payload);
      } else {
        await profileAPI.create(payload);
        setHasExistingProfile(true);
      }
      setProfileProgress(calculateProgress(formData));
      alert('Profile saved successfully!');
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const skillTags = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
  const hasEducation = Array.isArray(formData.educationEntries) && formData.educationEntries.some(e => e?.level?.trim());
  const hasAnyDetail = formData.fullName || formData.email || hasEducation || formData.currentRole ||
    formData.location || formData.skills || formData.interests || formData.bio || formData.linkedIn || formData.portfolio ||
    (formData.preferredIndustries && formData.preferredIndustries.length > 0) ||
    formData.gender || formData.ugCourse || formData.ugSpecialization || formData.ugCgpaOrPercentage ||
    formData.certificateCourseTitles || formData.firstJobTitle || formData.mastersField ||
    formData.hasAdditionalCertifications || formData.isWorking;

  const detailItem = (label, value) =>
    value ? (
      <div key={label} className="profile-detail-row">
        <span className="profile-detail-label">{label}</span>
        <span className="profile-detail-value">{value}</span>
      </div>
    ) : null;

  return (
    <section className="page-section">
      {/* Profile details summary - shown when data is loaded */}
      {!loading && (user || hasAnyDetail) && (
        <div className="card profile-details-card">
          <h2>Profile Details</h2>
          <div className="profile-details-grid">
            {detailItem('Full Name', formData.fullName)}
            {detailItem('Email', formData.email)}
            {(() => {
              const levelLabels = { 'high-school': 'High School', 'associate': 'Associate Degree', 'bachelor': "Bachelor's Degree", 'master': "Master's Degree", 'phd': 'PhD', 'other': 'Other' };
              const entries = formData.educationEntries || [];
              const lines = entries
                .filter(e => e?.level?.trim())
                .map(e => {
                  const level = levelLabels[e.level] || e.level;
                  const parts = [level, e.field, e.certs].filter(Boolean);
                  return parts.join(' — ');
                });
              return lines.length > 0 ? (
                <div key="education" className="profile-detail-row">
                  <span className="profile-detail-label">Education</span>
                  <span className="profile-detail-value">{lines.join('; ')}</span>
                </div>
              ) : null;
            })()}
            {formData.preferredIndustries?.length > 0 && (
              <div key="industries" className="profile-detail-row">
                <span className="profile-detail-label">Industries of interest</span>
                <span className="profile-detail-value">
                  {formData.preferredIndustries.map(id => PROFILE_INDUSTRIES.find(i => i.id === id)?.name ?? id).join(', ')}
                </span>
              </div>
            )}
            {detailItem('Current Role', formData.currentRole)}
            {detailItem('Location', formData.location)}
            {formData.skills && (
              <div key="skills" className="profile-detail-row">
                <span className="profile-detail-label">Skills</span>
                <div className="profile-detail-value profile-detail-tags">
                  {skillTags.map((skill, index) => (
                    <span key={index} className="profile-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {detailItem('Career Interests', formData.interests)}
            {detailItem('Gender', formData.gender)}
            {detailItem('UG course', formData.ugCourse)}
            {detailItem('UG specialization / major', formData.ugSpecialization)}
            {detailItem('UG CGPA or %', formData.ugCgpaOrPercentage)}
            {formData.hasAdditionalCertifications && (
              <div key="certs-yesno" className="profile-detail-row">
                <span className="profile-detail-label">Additional certifications</span>
                <span className="profile-detail-value">{formData.hasAdditionalCertifications === 'yes' ? 'Yes' : 'No'}</span>
              </div>
            )}
            {detailItem('Certificate course title(s)', formData.certificateCourseTitles)}
            {formData.isWorking && (
              <div key="working" className="profile-detail-row">
                <span className="profile-detail-label">Working</span>
                <span className="profile-detail-value">{formData.isWorking === 'yes' ? 'Yes' : 'No'}</span>
              </div>
            )}
            {detailItem('First job title (or NA)', formData.firstJobTitle)}
            {detailItem('Masters (after UG)', formData.mastersField)}
            {detailItem('Bio', formData.bio)}
            {formData.linkedIn && (
              <div key="linkedin" className="profile-detail-row">
                <span className="profile-detail-label">LinkedIn</span>
                <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="profile-detail-link">
                  {formData.linkedIn}
                </a>
              </div>
            )}
            {formData.portfolio && (
              <div key="portfolio" className="profile-detail-row">
                <span className="profile-detail-label">Portfolio</span>
                <a href={formData.portfolio} target="_blank" rel="noopener noreferrer" className="profile-detail-link">
                  {formData.portfolio}
                </a>
              </div>
            )}
          </div>
          {!hasAnyDetail && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: 0 }}>
              Complete the form below to add your profile details.
            </p>
          )}
        </div>
      )}

      {/* Profile Progress Card */}
      <div className="card">
        <h2>Profile Completion</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>Complete your profile</span>
              <span style={{ fontWeight: '600', color: 'var(--accent)' }}>{profileProgress}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${profileProgress}%`,
                height: '100%',
                background: 'var(--accent)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {profileProgress < 50 && 'Complete more fields to unlock better recommendations'}
              {profileProgress >= 50 && profileProgress < 100 && 'Great progress! Keep going!'}
              {profileProgress === 100 && 'Profile complete! You\'re all set!'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="card">
        <h2>User Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Complete your education, qualifications, and interests to get better career recommendations.
        </p>
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>}
        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Education & Qualifications Section - Add multiple entries */}
          <div className="profile-section">
            <h3 className="profile-section-title">Education & Qualifications</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Add your education details. You can add multiple degrees or certifications.
            </p>
            {(formData.educationEntries || []).map((entry, index) => (
              <div key={index} className="profile-edu-entry">
                <div className="profile-edu-entry-header">
                  <span className="profile-edu-entry-label">Education #{index + 1}</span>
                  {(formData.educationEntries?.length || 1) > 1 && (
                    <button
                      type="button"
                      className="profile-edu-remove"
                      onClick={() => removeEducationEntry(index)}
                      aria-label="Remove this education entry"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="profile-edu-grid">
                  <div className="form-group">
                    <label>Education Level</label>
                    <select
                      value={entry.level}
                      onChange={(e) => updateEducationEntry(index, 'level', e.target.value)}
                    >
                      <option value="">Select qualification</option>
                      <option value="high-school">High School</option>
                      <option value="associate">Associate Degree</option>
                      <option value="bachelor">Bachelor&apos;s Degree</option>
                      <option value="master">Master&apos;s Degree</option>
                      <option value="phd">PhD / Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science, Business Administration"
                      value={entry.field}
                      onChange={(e) => updateEducationEntry(index, 'field', e.target.value)}
                    />
                  </div>
                  <div className="form-group profile-edu-full">
                    <label>Certifications & Qualifications</label>
                    <input
                      type="text"
                      placeholder="e.g., AWS, PMP, CPA, RN (comma-separated)"
                      value={entry.certs}
                      onChange={(e) => updateEducationEntry(index, 'certs', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="profile-edu-add"
              onClick={addEducationEntry}
            >
              + Add Education
            </button>
          </div>

          <div className="profile-section">
            <h3 className="profile-section-title">UG &amp; career background (for recommendations)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Matches the career survey used for AI recommendations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
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
                <label>UG course</label>
                <input
                  type="text"
                  value={formData.ugCourse}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ugCourse: e.target.value }))}
                  placeholder="e.g. B.Sc. Computer Science"
                />
              </div>
              <div className="form-group">
                <label>UG specialization / major</label>
                <input
                  type="text"
                  value={formData.ugSpecialization}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ugSpecialization: e.target.value }))}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="form-group">
                <label>UG CGPA or percentage</label>
                <input
                  type="text"
                  value={formData.ugCgpaOrPercentage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ugCgpaOrPercentage: e.target.value }))}
                  placeholder="e.g. 3.5 / 75%"
                />
              </div>
              <div className="form-group profile-edu-full">
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Additional certification courses?</span>
                <label style={{ marginRight: '1.25rem' }}>
                  <input
                    type="radio"
                    name="profile-certs"
                    checked={formData.hasAdditionalCertifications === 'yes'}
                    onChange={() => setFormData((prev) => ({ ...prev, hasAdditionalCertifications: 'yes' }))}
                  />
                  {' '}Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="profile-certs"
                    checked={formData.hasAdditionalCertifications === 'no'}
                    onChange={() => setFormData((prev) => ({ ...prev, hasAdditionalCertifications: 'no' }))}
                  />
                  {' '}No
                </label>
              </div>
              {formData.hasAdditionalCertifications === 'yes' && (
                <div className="form-group profile-edu-full">
                  <label>Certificate course title(s)</label>
                  <input
                    type="text"
                    value={formData.certificateCourseTitles}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certificateCourseTitles: e.target.value }))}
                    placeholder="e.g. AWS Cloud Practitioner"
                  />
                </div>
              )}
              <div className="form-group profile-edu-full">
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Are you working?</span>
                <label style={{ marginRight: '1.25rem' }}>
                  <input
                    type="radio"
                    name="profile-working"
                    checked={formData.isWorking === 'yes'}
                    onChange={() => setFormData((prev) => ({ ...prev, isWorking: 'yes' }))}
                  />
                  {' '}Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="profile-working"
                    checked={formData.isWorking === 'no'}
                    onChange={() => setFormData((prev) => ({ ...prev, isWorking: 'no' }))}
                  />
                  {' '}No
                </label>
              </div>
              <div className="form-group profile-edu-full">
                <label>First job title in current field (or NA)</label>
                <input
                  type="text"
                  value={formData.firstJobTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstJobTitle: e.target.value }))}
                  placeholder="e.g. Junior Analyst or NA"
                />
              </div>
              <div className="form-group profile-edu-full">
                <label>Masters after UG (field); leave blank if none</label>
                <input
                  type="text"
                  value={formData.mastersField}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mastersField: e.target.value }))}
                  placeholder="e.g. Masters in Mathematics"
                />
              </div>
            </div>
          </div>

          {/* User Interests Section */}
          <div className="profile-section">
            <h3 className="profile-section-title">User Interests</h3>
            <div className="form-group">
              <label>Industries of Interest *</label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Select industries you are interested in working in
              </p>
              <div className="profile-industry-grid">
                {PROFILE_INDUSTRIES.map((i) => (
                  <label
                    key={i.id}
                    className={`profile-industry-chip ${formData.preferredIndustries.includes(i.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferredIndustries.includes(i.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.preferredIndustries, i.id]
                          : formData.preferredIndustries.filter((id) => id !== i.id);
                        setFormData((prev) => ({ ...prev, preferredIndustries: next }));
                      }}
                    />
                    <span>{i.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group profile-interests-textarea">
              <label>Career Interests & Goals *</label>
              <textarea
                name="interests"
                placeholder="Describe your career interests, goals, and what you enjoy working on..."
                value={formData.interests}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Current Role</label>
              <input
                type="text"
                name="currentRole"
                placeholder="e.g., Software Developer"
                value={formData.currentRole}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input
                type="url"
                name="linkedIn"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedIn}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Skills * (comma-separated)</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., Python, JavaScript, Machine Learning, Communication"
              value={formData.skills}
              onChange={handleChange}
              required
            />
            {skillTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {skillTags.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.75rem',
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
            )}
          </div>

          <div className="form-group">
            <label>Professional Bio</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself, your experience, and career aspirations..."
              value={formData.bio}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Portfolio/Website</label>
            <input
              type="url"
              name="portfolio"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Profile;
