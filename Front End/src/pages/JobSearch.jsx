import React, { useState } from 'react';
import './PageStyles.css';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    salary: '',
    jobType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const jobs = [
    {
      id: 1,
      title: 'Senior Data Scientist',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000',
      type: 'Full-time',
      experience: '3-5 years',
      posted: '2 days ago',
      match: 92,
      description: 'We are looking for an experienced Data Scientist to join our team...',
      requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Data Analytics Inc',
      location: 'Remote',
      salary: '$95,000 - $130,000',
      type: 'Full-time',
      experience: '2-4 years',
      posted: '5 days ago',
      match: 87,
      description: 'Join our growing data science team to build innovative ML solutions...',
      requirements: ['Python', 'R', 'TensorFlow', 'Data Visualization'],
    },
    {
      id: 3,
      title: 'Junior Data Scientist',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: '$75,000 - $95,000',
      type: 'Full-time',
      experience: '0-2 years',
      posted: '1 week ago',
      match: 82,
      description: 'Great opportunity for entry-level data scientists to grow their career...',
      requirements: ['Python', 'SQL', 'Statistics', 'Machine Learning Basics'],
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter jobs based on search and filters
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesExperience = !filters.experience || job.experience === filters.experience;
    const matchesType = !filters.jobType || job.type === filters.jobType;
    
    return matchesSearch && matchesLocation && matchesExperience && matchesType;
  });

  return (
    <section className="page-section">
      {/* Search Section */}
      <div className="card">
        <h2>Job Search & Career Details</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search Job Title or Company (e.g., Data Scientist)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '250px' }}
            />
            <button type="submit">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: showFilters ? 'var(--accent-color)' : 'var(--bg-tertiary)', color: showFilters ? 'white' : 'var(--text-primary)' }}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </form>

        {showFilters && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Location</label>
              <input
                type="text"
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Experience Level</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              >
                <option value="">All Levels</option>
                <option value="0-2 years">Entry (0-2 years)</option>
                <option value="2-4 years">Mid (2-4 years)</option>
                <option value="3-5 years">Senior (3-5 years)</option>
                <option value="5+ years">Expert (5+ years)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Salary Range</label>
              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
              >
                <option value="">Any</option>
                <option value="50-75">$50k - $75k</option>
                <option value="75-100">$75k - $100k</option>
                <option value="100-130">$100k - $130k</option>
                <option value="130+">$130k+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredJobs.map((job) => (
          <div key={job.id} className="card job-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0 }}>{job.title}</h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--success-color)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {job.match}% Match
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>
                  {job.company} • {job.location}
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                  {job.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <span><strong>Salary:</strong> {job.salary}</span>
                  <span><strong>Type:</strong> {job.type}</span>
                  <span><strong>Experience:</strong> {job.experience}</span>
                  <span style={{ color: 'var(--text-light)' }}>Posted {job.posted}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.requirements.map((req, index) => (
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
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button style={{ whiteSpace: 'nowrap' }}>Apply Now</button>
                <button
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Save Job
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Career Overview */}
      <div className="card">
        <h3>Career Overview: Data Scientist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4>Education & Qualifications</h4>
            <p><strong>Education:</strong> Bachelor's Degree in Computer Science, IT, Data Science or related field.</p>
            <p><strong>Recommended Certifications:</strong> Machine Learning, Data Analytics, Python Programming.</p>
          </div>
          <div>
            <h4>Experience & Requirements</h4>
            <p><strong>Experience Required:</strong> 0–2 years (Entry), 3–5 years (Mid-level).</p>
            <p><strong>Age Limit:</strong> No strict limit (Most employers prefer 21–40).</p>
          </div>
          <div>
            <h4>Compensation & Market</h4>
            <p><strong>Salary Range (Global Average):</strong> $70,000 – $130,000 per year.</p>
            <p><strong>Current Market Demand:</strong> High Demand (+18% yearly growth).</p>
            <p><strong>Top Hiring Regions:</strong> USA, UK, Canada, Germany, Singapore.</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h4>Required Skills</h4>
          <ul style={{ columns: 2, columnGap: '2rem', marginTop: '1rem' }}>
            <li>Python & R Programming</li>
            <li>Machine Learning Algorithms</li>
            <li>Data Visualization (Power BI / Tableau)</li>
            <li>SQL & Database Management</li>
            <li>Statistics & Probability</li>
            <li>Big Data Technologies</li>
            <li>Cloud Computing (AWS, Azure, GCP)</li>
            <li>Deep Learning Frameworks</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default JobSearch;
