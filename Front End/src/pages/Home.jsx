import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Doughnut, Line } from 'react-chartjs-2';
import { TargetIcon, ChartIcon, BookIcon, BriefcaseIcon, SearchIcon, TrendingUpIcon } from '../components/Icons';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './PageStyles.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileProgress, setProfileProgress] = useState(45);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  useEffect(() => {
    // Simulate checking profile completion
    const progress = localStorage.getItem('profileProgress');
    if (progress) {
      setProfileProgress(parseInt(progress));
    }
    const assessment = localStorage.getItem('assessmentCompleted');
    if (assessment === 'true') {
      setAssessmentCompleted(true);
    }
  }, []);

  const handleGetStarted = () => {
    navigate('/profile');
  };

  const handleAssessment = () => {
    navigate('/assessment');
  };

  const progressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [profileProgress, 100 - profileProgress],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(226, 232, 240, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const skillTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Skill Growth',
        data: [20, 35, 45, 50, 60, 75],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const quickStats = [
    { label: 'Recommended Careers', value: '3', icon: TargetIcon },
    { label: 'Skills Assessed', value: '8', icon: ChartIcon },
    { label: 'Learning Paths', value: '5', icon: BookIcon },
    { label: 'Job Matches', value: '12', icon: BriefcaseIcon },
  ];

  return (
    <section className="page-section">
      <div className="card">
        <h2>Welcome{user?.name ? `, ${user.name}` : ''}</h2>
        <p>
          Your personalized career journey dashboard. Track your progress, discover opportunities, and achieve your career goals.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button onClick={handleGetStarted}>Complete Your Profile</button>
          <button onClick={handleAssessment} style={{ background: 'var(--accent-color)' }}>
            {assessmentCompleted ? 'Retake Assessment' : 'Take Assessment'}
          </button>
        </div>
      </div>

      {/* Profile Progress */}
      <div className="card">
        <h3>Profile Completion</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '150px', height: '150px' }}>
            <Doughnut
              data={progressData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: false },
                },
                cutout: '70%',
              }}
            />
            <div style={{
              position: 'relative',
              top: '-120px',
              textAlign: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'var(--secondary-color)'
            }}>
              {profileProgress}%
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Profile Progress</span>
                <span style={{ fontWeight: '600' }}>{profileProgress}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${profileProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--secondary-color), var(--accent-color))',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Complete your profile to get more accurate career recommendations and unlock all features.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3>Your Career Insights</h3>
        <div className="dashboard-grid">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <IconComponent size={40} color="var(--secondary-color)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Growth Trend */}
      <div className="card">
        <h3>Your Skill Growth Trend</h3>
        <div style={{ height: '300px', marginTop: '1rem' }}>
          <Line
            data={skillTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  padding: 12,
                  titleFont: { size: 14, weight: 600 },
                  bodyFont: { size: 13 },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { color: 'var(--text-secondary)' },
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                },
                x: {
                  ticks: { color: 'var(--text-secondary)' },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={() => navigate('/recommendation')}
            style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <TargetIcon size={32} color="white" />
            <span>View Recommendations</span>
          </button>
          <button
            onClick={() => navigate('/jobsearch')}
            style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <SearchIcon size={32} color="white" />
            <span>Search Jobs</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <TrendingUpIcon size={32} color="white" />
            <span>Market Trends</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
