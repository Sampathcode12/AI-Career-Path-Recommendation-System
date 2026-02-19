import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { ChartIcon, TrendingUpIcon, GlobeIcon } from '../components/Icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './PageStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const demandData = {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'Data Science Jobs',
        data: [100, 115, 130, 145, 165, 185],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Software Engineering',
        data: [100, 108, 118, 128, 140, 152],
        borderColor: 'rgba(6, 182, 212, 1)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const skillDistribution = {
    labels: ['Technical', 'Soft Skills', 'Domain Knowledge', 'Tools'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendingSkills = [
    { name: 'Machine Learning', growth: '+25%', demand: 'Very High' },
    { name: 'Cloud Computing', growth: '+22%', demand: 'Very High' },
    { name: 'Cybersecurity', growth: '+20%', demand: 'High' },
    { name: 'Data Engineering', growth: '+18%', demand: 'High' },
    { name: 'DevOps', growth: '+15%', demand: 'High' },
  ];

  const salaryRanges = [
    { role: 'Entry Level', range: '$60k - $85k', growth: '+12%' },
    { role: 'Mid Level', range: '$85k - $120k', growth: '+15%' },
    { role: 'Senior Level', range: '$120k - $180k', growth: '+18%' },
    { role: 'Lead/Principal', range: '$180k - $250k+', growth: '+20%' },
  ];

  return (
    <section className="page-section">
      <div className="card">
        <h2>Job Market Trends & Insights</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Real-time market data and trends to help you make informed career decisions.
        </p>

        {/* Market Demand Chart */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Job Market Demand Growth (2020-2025)</h3>
          <div style={{ height: '350px', marginTop: '1rem' }}>
            <Line
              data={demandData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    padding: 12,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
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

        {/* Trending Skills */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Trending Skills in 2024</h3>
          <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
            {trendingSkills.map((skill, index) => (
              <div key={index} className="card skill-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{skill.name}</h4>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--success-color)',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {skill.growth}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Demand: <strong>{skill.demand}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="card stat-card">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <ChartIcon size={40} color="var(--secondary-color)" />
            </div>
            <h3 style={{ margin: '0.5rem 0', fontSize: '2rem', color: 'var(--secondary-color)' }}>$95,000</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Average Salary</p>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: '600' }}>
              +15% from last year
            </p>
          </div>
          <div className="card stat-card">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <TrendingUpIcon size={40} color="var(--accent-color)" />
            </div>
            <h3 style={{ margin: '0.5rem 0', fontSize: '2rem', color: 'var(--accent-color)' }}>+18%</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Yearly Growth</p>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Job market expansion
            </p>
          </div>
          <div className="card stat-card">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <GlobeIcon size={40} color="var(--secondary-color)" />
            </div>
            <h3 style={{ margin: '0.5rem 0', fontSize: '2rem', color: 'var(--secondary-color)' }}>5</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Top Hiring Regions</p>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              USA, UK, Canada, Germany, Singapore
            </p>
          </div>
        </div>

        {/* Salary Ranges */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Salary Ranges by Experience Level</h3>
          <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
            {salaryRanges.map((level, index) => (
              <div key={index} className="card">
                <h4 style={{ marginBottom: '0.5rem' }}>{level.role}</h4>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--secondary-color)', margin: '0.5rem 0' }}>
                  {level.range}
                </p>
                <p style={{ margin: 0, color: 'var(--success-color)', fontSize: '0.875rem' }}>
                  Growth: {level.growth}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="card">
          <h3>Required Skills Distribution</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '250px', height: '250px' }}>
              <Doughnut
                data={skillDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Technical Skills</span>
                  <strong>40%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'var(--secondary-color)' }}></div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Soft Skills</span>
                  <strong>25%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: 'var(--accent-color)' }}></div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Domain Knowledge</span>
                  <strong>20%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '20%', height: '100%', background: 'rgba(139, 92, 246, 1)' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Tools & Technologies</span>
                  <strong>15%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: 'var(--success-color)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
