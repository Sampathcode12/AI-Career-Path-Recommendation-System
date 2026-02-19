import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PageStyles.css';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    educationLevel: '',
    currentRole: '',
    location: '',
    skills: '',
    interests: '',
    bio: '',
    linkedIn: '',
    portfolio: '',
  });

  const [profileProgress, setProfileProgress] = useState(0);

  useEffect(() => {
    // Load saved profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setFormData(parsed);
    }
    calculateProgress();
  }, []);

  const calculateProgress = () => {
    const fields = ['fullName', 'email', 'educationLevel', 'currentRole', 'skills', 'interests', 'bio'];
    const filledFields = fields.filter(field => formData[field] && formData[field].trim() !== '').length;
    const progress = Math.round((filledFields / fields.length) * 100);
    setProfileProgress(progress);
    localStorage.setItem('profileProgress', progress.toString());
  };

  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
    calculateProgress();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(formData));
    calculateProgress();
    alert('Profile saved successfully!');
  };

  const skillTags = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <section className="page-section">
      {/* Profile Progress Card */}
      <div className="card">
        <h2>Profile Completion</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>Complete your profile</span>
              <span style={{ fontWeight: '600', color: 'var(--secondary-color)' }}>{profileProgress}%</span>
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
                background: 'linear-gradient(90deg, var(--secondary-color), var(--accent-color))',
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Education Level *</label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required>
                <option value="">Select education level</option>
                <option value="high-school">High School</option>
                <option value="associate">Associate Degree</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
                <option value="other">Other</option>
              </select>
            </div>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
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
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--secondary-color)',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Career Interests *</label>
            <textarea
              name="interests"
              placeholder="Describe your career interests and goals..."
              value={formData.interests}
              onChange={handleChange}
              rows="3"
              required
            />
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

          <button type="submit">Save Profile</button>
        </form>
      </div>
    </section>
  );
};

export default Profile;
