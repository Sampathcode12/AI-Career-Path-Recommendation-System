import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState({
    // Technical Skills
    programming: '3',
    dataAnalysis: '3',
    machineLearning: '2',
    webDevelopment: '2',
    database: '2',
    
    // Soft Skills
    communication: '3',
    leadership: '2',
    problemSolving: '3',
    teamwork: '3',
    creativity: '2',
    
    // Interests
    workStyle: 'collaborative',
    industry: 'technology',
    workEnvironment: 'hybrid',
    
    // Experience
    yearsExperience: '0-2',
    currentRole: '',
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleChange = (e) => {
    setAssessmentData({
      ...assessmentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Save assessment data
    localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
    localStorage.setItem('assessmentCompleted', 'true');
    
    // Calculate profile progress
    const newProgress = Math.min(100, 45 + 30); // Base + assessment completion
    localStorage.setItem('profileProgress', newProgress.toString());
    
    navigate('/recommendation');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Technical Skills Assessment</h3>
            <div className="form-group">
              <label>Programming & Coding (1-5)</label>
              <select name="programming" value={assessmentData.programming} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data Analysis (1-5)</label>
              <select name="dataAnalysis" value={assessmentData.dataAnalysis} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Machine Learning / AI (1-5)</label>
              <select name="machineLearning" value={assessmentData.machineLearning} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Web Development (1-5)</label>
              <select name="webDevelopment" value={assessmentData.webDevelopment} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Database Management (1-5)</label>
              <select name="database" value={assessmentData.database} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Soft Skills Assessment</h3>
            <div className="form-group">
              <label>Communication Skills (1-5)</label>
              <select name="communication" value={assessmentData.communication} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Leadership (1-5)</label>
              <select name="leadership" value={assessmentData.leadership} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Problem Solving (1-5)</label>
              <select name="problemSolving" value={assessmentData.problemSolving} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Teamwork (1-5)</label>
              <select name="teamwork" value={assessmentData.teamwork} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Creativity (1-5)</label>
              <select name="creativity" value={assessmentData.creativity} onChange={handleChange}>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Basic</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Work Preferences</h3>
            <div className="form-group">
              <label>Preferred Work Style</label>
              <select name="workStyle" value={assessmentData.workStyle} onChange={handleChange}>
                <option value="collaborative">Collaborative Team Work</option>
                <option value="independent">Independent Work</option>
                <option value="mixed">Mixed (Both)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Industry Interest</label>
              <select name="industry" value={assessmentData.industry} onChange={handleChange}>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="consulting">Consulting</option>
                <option value="startup">Startup</option>
              </select>
            </div>
            <div className="form-group">
              <label>Work Environment</label>
              <select name="workEnvironment" value={assessmentData.workEnvironment} onChange={handleChange}>
                <option value="remote">Remote</option>
                <option value="office">Office</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <select name="yearsExperience" value={assessmentData.yearsExperience} onChange={handleChange}>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Review & Submit</h3>
            <div className="review-section">
              <h4>Technical Skills Summary</h4>
              <p>Programming: {assessmentData.programming}/5</p>
              <p>Data Analysis: {assessmentData.dataAnalysis}/5</p>
              <p>Machine Learning: {assessmentData.machineLearning}/5</p>
              
              <h4 style={{ marginTop: '1.5rem' }}>Soft Skills Summary</h4>
              <p>Communication: {assessmentData.communication}/5</p>
              <p>Leadership: {assessmentData.leadership}/5</p>
              <p>Problem Solving: {assessmentData.problemSolving}/5</p>
              
              <h4 style={{ marginTop: '1.5rem' }}>Preferences</h4>
              <p>Work Style: {assessmentData.workStyle}</p>
              <p>Industry: {assessmentData.industry}</p>
              <p>Environment: {assessmentData.workEnvironment}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="page-section">
      <div className="card">
        <h2>Comprehensive Skill Assessment</h2>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--secondary-color), var(--accent-color))',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {renderStep()}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'space-between' }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          {currentStep < totalSteps ? (
            <button onClick={handleNext} style={{ marginLeft: 'auto' }}>
              Next Step
            </button>
          ) : (
            <button onClick={handleSubmit} style={{ marginLeft: 'auto', background: 'var(--success-color)' }}>
              Generate Recommendations
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Assessment;
