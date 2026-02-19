import React, { useState, useEffect } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { CheckIcon } from '../components/Icons';
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

const Recommendation = () => {
  const [savedCareers, setSavedCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedCareers');
    if (saved) {
      setSavedCareers(JSON.parse(saved));
    }
  }, []);

  const careers = [
    {
      id: 1,
      title: 'Data Scientist',
      match: 87,
      salary: '$95,000 - $140,000',
      growth: '+18%',
      description: 'Analyze complex data to help organizations make data-driven decisions.',
      skills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
      requirements: {
        education: "Bachelor's in Computer Science, Data Science, or related",
        experience: '2-5 years',
        certifications: ['Machine Learning', 'Data Analytics', 'Python Programming']
      },
      learningPath: [
        { step: 1, title: 'Learn Python Fundamentals', duration: '2-3 months' },
        { step: 2, title: 'Master Data Analysis Tools', duration: '1-2 months' },
        { step: 3, title: 'Study Machine Learning', duration: '3-4 months' },
        { step: 4, title: 'Build Portfolio Projects', duration: '2-3 months' },
      ]
    },
    {
      id: 2,
      title: 'Software Engineer',
      match: 82,
      salary: '$85,000 - $130,000',
      growth: '+15%',
      description: 'Design, develop, and maintain software applications and systems.',
      skills: ['JavaScript', 'React', 'Node.js', 'System Design'],
      requirements: {
        education: "Bachelor's in Computer Science or Software Engineering",
        experience: '1-4 years',
        certifications: ['Full Stack Development', 'Cloud Computing']
      },
      learningPath: [
        { step: 1, title: 'Learn Programming Fundamentals', duration: '3-4 months' },
        { step: 2, title: 'Master Web Technologies', duration: '2-3 months' },
        { step: 3, title: 'Learn Software Architecture', duration: '2-3 months' },
        { step: 4, title: 'Build Real Projects', duration: '3-4 months' },
      ]
    },
    {
      id: 3,
      title: 'Business Analyst',
      match: 76,
      salary: '$70,000 - $110,000',
      growth: '+12%',
      description: 'Bridge the gap between business needs and technical solutions.',
      skills: ['SQL', 'Business Analysis', 'Project Management', 'Communication'],
      requirements: {
        education: "Bachelor's in Business, IT, or related field",
        experience: '1-3 years',
        certifications: ['Business Analysis', 'Agile/Scrum', 'SQL']
      },
      learningPath: [
        { step: 1, title: 'Learn Business Fundamentals', duration: '2-3 months' },
        { step: 2, title: 'Master Data Analysis', duration: '1-2 months' },
        { step: 3, title: 'Study Project Management', duration: '2-3 months' },
        { step: 4, title: 'Gain Industry Experience', duration: '3-6 months' },
      ]
    },
  ];

  const toggleSave = (careerId) => {
    const updated = savedCareers.includes(careerId)
      ? savedCareers.filter(id => id !== careerId)
      : [...savedCareers, careerId];
    setSavedCareers(updated);
    localStorage.setItem('savedCareers', JSON.stringify(updated));
  };

  const barData = {
    labels: careers.map(c => c.title),
    datasets: [
      {
        label: 'Match Percentage',
        data: careers.map(c => c.match),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const radarData = selectedCareer ? {
    labels: ['Technical Skills', 'Communication', 'Problem Solving', 'Leadership', 'Creativity', 'Teamwork'],
    datasets: [
      {
        label: 'Your Skills',
        data: [3.5, 3, 3.5, 2, 2, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
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
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: 500,
          },
          color: '#2c3e50',
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Career Match Percentage',
        font: {
          family: 'Inter, sans-serif',
          size: 18,
          weight: 600,
        },
        color: '#2c3e50',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: 12,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          color: '#6c757d',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 500,
          },
          color: '#2c3e50',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <section className="page-section">
      <div className="card">
        <h2>Recommended Careers</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Based on your assessment, here are the top career paths that match your skills and interests.
        </p>
        
        {/* Career Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {careers.map((career) => (
            <div
              key={career.id}
              className="career-card"
              style={{
                border: selectedCareer?.id === career.id ? '2px solid var(--secondary-color)' : '1px solid var(--border-light)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCareer(career)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{career.title}</h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--secondary-color)',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {career.match}% Match
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{career.description}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                    <span><strong>Salary:</strong> {career.salary}</span>
                    <span><strong>Growth:</strong> <span style={{ color: 'var(--success-color)' }}>{career.growth}</span></span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(career.id);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: savedCareers.includes(career.id) ? 'var(--success-color)' : 'transparent',
                    border: `1px solid ${savedCareers.includes(career.id) ? 'var(--success-color)' : 'var(--border-color)'}`,
                    color: savedCareers.includes(career.id) ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {savedCareers.includes(career.id) ? (
                    <>
                      <CheckIcon size={16} color="white" style={{ marginRight: '0.25rem', display: 'inline-block' }} />
                      Saved
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-container">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Selected Career Details */}
      {selectedCareer && (
        <div className="card">
          <h3>{selectedCareer.title} - Detailed Analysis</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h4>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {selectedCareer.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.375rem 0.75rem',
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
            </div>
            <div>
              <h4>Requirements</h4>
              <p><strong>Education:</strong> {selectedCareer.requirements.education}</p>
              <p><strong>Experience:</strong> {selectedCareer.requirements.experience}</p>
            </div>
          </div>

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
                    borderLeft: '4px solid var(--secondary-color)',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--secondary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {step.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{step.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration: {step.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {radarData && (
            <div style={{ marginTop: '2rem' }}>
              <h4>Skill Gap Analysis</h4>
              <div style={{ height: '400px', marginTop: '1rem' }}>
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Recommendation;
