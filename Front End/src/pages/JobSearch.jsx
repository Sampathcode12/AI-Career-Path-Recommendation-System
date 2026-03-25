import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import { JOB_CATEGORY_FILTER_OPTIONS, JOB_SEARCH_INDUSTRIES_LEDE } from '../constants/jobIndustry';
import './PageStyles.css';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  const search = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.search({
        query: searchTerm || undefined,
        location: location || undefined,
        category: category === 'All' ? undefined : category,
        sector: undefined,
      });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    search();
  };

  const handleSave = async (job) => {
    try {
      await jobsAPI.save({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
      });
      setSavedIds((prev) => [...prev, job.id]);
    } catch (err) {
      console.error(err);
    }
  };

  const mapJob = (j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    sector: j.sector,
    category: j.category,
    salary: j.salaryRange ?? j.salary_range,
    growth: j.growth,
    description: j.description,
    url: j.url,
    skills: j.skills ?? [],
    careerPath: j.careerPath ?? j.career_path ?? [],
  });

  const mappedJobs = jobs.map(mapJob);

  return (
    <section className="page-section">
      <div className="card">
        <h2>Job Search & Career Details</h2>
        <p className="page-lede">
          Search roles across all industries — {JOB_SEARCH_INDUSTRIES_LEDE} Filters match the same categories used on Top 10 Jobs and recommendations.
        </p>
        <form onSubmit={handleSearch} className="job-filter-toolbar">
          <div className="form-group form-group--toolbar form-group--grow">
            <label htmlFor="jobsearch-category">Job category</label>
            <select id="jobsearch-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {JOB_CATEGORY_FILTER_OPTIONS.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
              ))}
            </select>
          </div>
          <div className="form-group form-group--toolbar form-group--grow-wide">
            <label htmlFor="jobsearch-q">Search</label>
            <input
              id="jobsearch-q"
              type="text"
              placeholder="Job title, sector, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group form-group--toolbar form-group--location">
            <label htmlFor="jobsearch-loc">Location</label>
            <input
              id="jobsearch-loc"
              type="text"
              placeholder="City or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <p className="jobs-loading">Loading jobs...</p>
      ) : (
        <div className="jobs-stack">
          {mappedJobs.length === 0 ? (
            <div className="card">
              <p className="jobs-muted">No jobs match. Try a different category or search term.</p>
            </div>
          ) : (
            mappedJobs.map((job) => (
              <div key={job.id} className="card job-card">
                <div className="job-card__row">
                  <div className="job-card__body">
                    <div className="job-card__title-row">
                      <h3 className="job-card__title">{job.title}</h3>
                      {job.sector && <span className="sector-label">{job.sector}</span>}
                    </div>
                    <p className="job-card__subtitle">
                      {job.company} • {job.location || '—'}
                    </p>
                    <p className="job-card__desc">{job.description}</p>
                    <div className="job-card__stats">
                      {job.salary && <span><strong>Salary:</strong> {job.salary}</span>}
                      {job.growth && (
                        <span className="job-card__stats-growth"><strong>Growth:</strong> {job.growth}</span>
                      )}
                      {job.category && <span><strong>Category:</strong> {job.category}</span>}
                    </div>
                    {job.skills?.length > 0 && (
                      <div className="job-skill-tags">
                        {job.skills.map((s, i) => (
                          <span key={i} className="job-skill-tag">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="job-card__actions">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-nowrap"
                      >
                        Apply
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-nowrap"
                      onClick={() => handleSave(job)}
                    >
                      {savedIds.includes(job.id) ? 'Saved' : 'Save Job'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default JobSearch;
