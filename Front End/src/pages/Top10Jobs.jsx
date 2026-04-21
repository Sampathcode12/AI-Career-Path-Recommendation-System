import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { StarIcon, GlobeIcon, TrendingUpIcon, SearchIcon } from '../components/Icons';
import { jobsAPI } from '../services/api';
import { plainSummaryFromDescription } from '../utils/jobDescription';
import './PageStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/** Top 10 page: job title/skill search + intro card ("Find skills & qualifications for a job"). */
const SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION = false;

const formatCurrentDateTime = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return { dateStr, timeStr };
};

const parseGrowthPercent = (growthStr) => parseInt(String(growthStr).replace(/\D/g, '') || '0', 10);

const step = (num, title, desc) => ({ step: num, title, description: desc });

const ALL_JOBS_MOCK = [
  {
    id: 1,
    rank: 1,
    title: 'Software Developer / Engineer',
    sector: 'Technology',
    category: 'Technology',
    salary: '$70,000 – $180,000',
    growth: '+22%',
    description: 'Design, build, and maintain software applications. High global demand with strong remote opportunities.',
    regions: 'USA, EU, India, Singapore, Canada',
    skills: ['Programming (Java, Python, C#, JavaScript)', 'Problem solving', 'Version control (Git)', 'Agile/Scrum', 'Debugging', 'Code review', 'REST APIs', 'Databases (SQL)'],
    qualifications: { education: "Bachelor's in Computer Science, Software Engineering, or related field", experience: '0–5+ years depending on level', certifications: 'Optional: AWS, Azure, Oracle, or vendor-specific certs' },
    careerPathSteps: [
      step(1, 'Foundation', 'Complete high school; focus on math, logic, and basic programming if available.'),
      step(2, 'Education', "Bachelor's degree in Computer Science, Software Engineering, or related (4 years). Bootcamps or self-study plus portfolio can substitute in some markets."),
      step(3, 'Entry level', 'Internship or Junior Developer role (0–2 years). Build projects, contribute to open source, learn version control and testing.'),
      step(4, 'Mid level', 'Software Developer (2–5 years). Own features, mentor juniors, deepen expertise in one stack or domain.'),
      step(5, 'Target role', 'Senior Software Engineer / Tech Lead. Design systems, drive technical decisions, and optionally move into architecture or management.'),
    ],
  },
  {
    id: 2,
    rank: 2,
    title: 'Data Scientist',
    sector: 'Technology & Analytics',
    category: 'Technology',
    salary: '$80,000 – $165,000',
    growth: '+36%',
    description: 'Extract insights from data using ML and statistics. Critical for AI-driven businesses worldwide.',
    regions: 'USA, UK, Germany, India, Australia',
    skills: ['Python / R', 'Statistics & probability', 'Machine learning', 'SQL & data modeling', 'Data visualization', 'Big data tools (Spark, Hadoop)', 'Deep learning frameworks', 'A/B testing'],
    qualifications: { education: "Master's or Bachelor's in Data Science, Statistics, CS, or related; strong math background", experience: '2–5+ years in analytics or ML', certifications: 'Google Data Analytics, AWS ML, Microsoft Data Scientist' },
    careerPathSteps: [
      step(1, 'Foundation', 'Strong math (calculus, linear algebra, statistics) and basic programming (Python or R).'),
      step(2, 'Education', "Bachelor's or Master's in Data Science, Statistics, CS, or related. Build portfolio with datasets and ML projects."),
      step(3, 'Entry level', 'Data Analyst or Junior Data Scientist (0–2 years). SQL, reporting, and simple models.'),
      step(4, 'Mid level', 'Data Scientist (2–5 years). End-to-end ML pipelines, A/B tests, and stakeholder communication.'),
      step(5, 'Target role', 'Senior Data Scientist / ML Engineer. Own strategy, advanced models, and mentorship.'),
    ],
  },
  {
    id: 3,
    rank: 3,
    title: 'Physician / Doctor',
    sector: 'Healthcare',
    category: 'Healthcare',
    salary: '$120,000 – $350,000',
    growth: '+3%',
    description: 'Diagnose and treat patients. Consistently among the highest-paid and most respected roles globally.',
    regions: 'USA, UK, Canada, Australia, UAE',
    skills: ['Clinical diagnosis', 'Patient care', 'Medical knowledge', 'Communication', 'Decision-making under pressure', 'Ethics & compliance', 'Record-keeping'],
    qualifications: { education: 'MD or DO (medical degree); residency and often fellowship', experience: 'Residency 3–7+ years; board certification', certifications: 'Board certification in specialty (e.g. Internal Medicine, Surgery)' },
    careerPathSteps: [
      step(1, 'Foundation', 'Strong science grades in high school (biology, chemistry, physics, math).'),
      step(2, 'Pre-med / Undergraduate', "Bachelor's with pre-med requirements (4 years). MCAT (or local equivalent) for admission."),
      step(3, 'Medical school', 'MD or DO degree (4 years). Clinical rotations in multiple specialties.'),
      step(4, 'Residency', 'Residency in chosen specialty (3–7 years). Supervised practice and exams.'),
      step(5, 'Target role', 'Board-certified Physician. Optional fellowship for sub-specialty; then independent practice or hospital role.'),
    ],
  },
  {
    id: 4,
    rank: 4,
    title: 'Nurse Practitioner',
    sector: 'Healthcare',
    category: 'Healthcare',
    salary: '$95,000 – $140,000',
    growth: '+45%',
    description: 'Advanced practice nursing with prescribing authority. Massive demand and work-life balance.',
    regions: 'USA, UK, Canada, Australia',
    skills: ['Patient assessment', 'Diagnosis & treatment planning', 'Prescribing medications', 'Patient education', 'Collaboration with physicians', 'Electronic health records'],
    qualifications: { education: "Master's or Doctorate in Nursing (MSN/DNP); RN license required", experience: 'Clinical hours during program; 1–2+ years RN experience often preferred', certifications: 'NP board certification (e.g. AANP, ANCC)' },
    careerPathSteps: [
      step(1, 'Foundation', 'High school diploma; focus on sciences. Prerequisites for nursing program.'),
      step(2, 'RN education', "Associate or Bachelor's in Nursing (ADN/BSN). Pass NCLEX-RN to become licensed RN."),
      step(3, 'RN experience', 'Work as Registered Nurse (1–2+ years recommended). Build clinical skills and decide on NP specialty.'),
      step(4, 'Advanced degree', "Master's or Doctorate in Nursing (MSN/DNP) with NP focus. Complete required clinical hours."),
      step(5, 'Target role', 'Pass NP board exam (e.g. AANP/ANCC). Practice as Nurse Practitioner; optional sub-specialty certification.'),
    ],
  },
  {
    id: 5,
    rank: 5,
    title: 'Information Security Analyst',
    sector: 'Cybersecurity',
    category: 'Technology',
    salary: '$75,000 – $150,000',
    growth: '+32%',
    description: 'Protect systems and data from cyber threats. Essential in every industry and region.',
    regions: 'USA, EU, UK, Israel, Singapore',
    skills: ['Network security', 'Vulnerability assessment', 'SIEM & monitoring', 'Incident response', 'Security policies', 'Penetration testing basics', 'Cryptography'],
    qualifications: { education: "Bachelor's in Cybersecurity, CS, IT, or related", experience: '2–5 years in IT or security', certifications: 'CISSP, CEH, CompTIA Security+, CISM' },
    careerPathSteps: [
      step(1, 'Foundation', 'Interest in technology and security. Basic networking and OS knowledge.'),
      step(2, 'Education', "Bachelor's in Cybersecurity, CS, or IT. Learn networking, systems, and security fundamentals."),
      step(3, 'Entry level', 'IT support, SOC analyst, or junior security role (0–2 years). Get first security certification (e.g. Security+).'),
      step(4, 'Mid level', 'Information Security Analyst (2–5 years). Run assessments, respond to incidents, improve controls.'),
      step(5, 'Target role', 'Senior analyst or specialist. Optional: CISSP, CEH, or CISM; move to lead or architect.'),
    ],
  },
  {
    id: 6,
    rank: 6,
    title: 'AI / Machine Learning Engineer',
    sector: 'Technology',
    category: 'Technology',
    salary: '$100,000 – $220,000',
    growth: '+40%',
    description: 'Build and deploy AI/ML models. At the forefront of digital transformation globally.',
    regions: 'USA, China, EU, India, UK',
    skills: ['Python, TensorFlow, PyTorch', 'ML algorithms & model tuning', 'MLOps & deployment', 'Data pipelines', 'NLP or computer vision (often)', 'Cloud (AWS/GCP/Azure)', 'Statistics'],
    qualifications: { education: "Bachelor's or Master's in CS, ML, or related; strong math/statistics", experience: '2–5+ years in ML/software', certifications: 'AWS ML, Google ML Engineer, Azure AI Engineer' },
    careerPathSteps: [
      step(1, 'Foundation', 'Strong math (linear algebra, calculus, stats) and programming (Python).'),
      step(2, 'Education', "Bachelor's or Master's in CS, ML, or related. Courses in ML, deep learning, and software engineering."),
      step(3, 'Entry level', 'ML intern or Junior ML Engineer (0–2 years). Train models, run experiments, support production pipelines.'),
      step(4, 'Mid level', 'ML Engineer (2–5 years). Own model lifecycle, MLOps, and cross-team delivery.'),
      step(5, 'Target role', 'Senior ML Engineer / AI Lead. Architecture, research collaboration, and team leadership.'),
    ],
  },
  {
    id: 7,
    rank: 7,
    title: 'Financial Manager',
    sector: 'Finance',
    category: 'Finance',
    salary: '$90,000 – $200,000',
    growth: '+16%',
    description: 'Oversee financial planning, reporting, and strategy. Key in corporate and banking sectors.',
    regions: 'USA, UK, Hong Kong, Singapore, Switzerland',
    skills: ['Financial analysis', 'Budgeting & forecasting', 'Reporting (GAAP/IFRS)', 'Risk management', 'Leadership', 'ERP systems', 'Excel & financial modeling'],
    qualifications: { education: "Bachelor's in Finance, Accounting, Economics; MBA often preferred", experience: '5+ years in finance or accounting', certifications: 'CPA, CFA, or CMA' },
    careerPathSteps: [
      step(1, 'Foundation', 'Strong math and analytical skills. Interest in business and markets.'),
      step(2, 'Education', "Bachelor's in Finance, Accounting, or Economics. Optional: MBA for senior roles."),
      step(3, 'Entry level', 'Financial Analyst or Accountant (0–3 years). Reporting, analysis, and compliance.'),
      step(4, 'Mid level', 'Senior Analyst or Finance Manager (3–7 years). Budgets, forecasts, and team coordination.'),
      step(5, 'Target role', 'Financial Manager / Director / CFO. Strategy, risk, and executive reporting. CPA/CFA/CMA often required.'),
    ],
  },
  {
    id: 8,
    rank: 8,
    title: 'Medical and Health Services Manager',
    sector: 'Healthcare',
    category: 'Healthcare',
    salary: '$70,000 – $150,000',
    growth: '+28%',
    description: 'Manage healthcare facilities and operations. Growing as healthcare systems expand.',
    regions: 'USA, UK, Canada, Australia, Germany',
    skills: ['Healthcare operations', 'Regulatory compliance', 'Budget & resource management', 'Staff leadership', 'Health IT systems', 'Quality improvement'],
    qualifications: { education: "Bachelor's or Master's in Health Administration, Public Health, or related", experience: '3–5+ years in healthcare admin or clinical', certifications: 'Optional: FACHE, CPHQ' },
    careerPathSteps: [
      step(1, 'Foundation', 'High school diploma. Interest in healthcare and management.'),
      step(2, 'Education', "Bachelor's in Health Administration, Public Health, Business, or related. Master's (MHA/MBA) for advancement."),
      step(3, 'Entry level', 'Coordinator or junior admin role in hospital, clinic, or insurer (0–3 years).'),
      step(4, 'Mid level', 'Department manager or operations lead (3–5+ years). Budgets, compliance, and process improvement.'),
      step(5, 'Target role', 'Medical and Health Services Manager / Director. Facility or system-wide operations; optional FACHE/CPHQ.'),
    ],
  },
  {
    id: 9,
    rank: 9,
    title: 'DevOps / Cloud Engineer',
    sector: 'Technology',
    category: 'Technology',
    salary: '$85,000 – $170,000',
    growth: '+25%',
    description: 'Automate infrastructure and deployments. Core to modern software delivery worldwide.',
    regions: 'USA, EU, India, UK, Canada',
    skills: ['CI/CD (Jenkins, GitHub Actions)', 'Containers (Docker, Kubernetes)', 'Cloud (AWS, Azure, GCP)', 'IaC (Terraform, CloudFormation)', 'Linux & scripting', 'Monitoring & logging'],
    qualifications: { education: "Bachelor's in CS, IT, or related", experience: '2–5+ years in DevOps, SRE, or sysadmin', certifications: 'AWS DevOps, Azure DevOps, CKA (Kubernetes)' },
    careerPathSteps: [
      step(1, 'Foundation', 'Comfort with command line, Linux basics, and scripting (Bash/Python).'),
      step(2, 'Education', "Bachelor's in CS or IT, or self-study + certs. Learn networking, OS, and one cloud provider."),
      step(3, 'Entry level', 'Sysadmin, support, or Junior DevOps (0–2 years). CI/CD, monitoring, and cloud basics.'),
      step(4, 'Mid level', 'DevOps / Cloud Engineer (2–5 years). Own pipelines, infrastructure as code, and reliability.'),
      step(5, 'Target role', 'Senior DevOps / SRE / Cloud Architect. Multi-cloud, security, and platform strategy.'),
    ],
  },
  {
    id: 10,
    rank: 10,
    title: 'Physician Assistant',
    sector: 'Healthcare',
    category: 'Healthcare',
    salary: '$90,000 – $130,000',
    growth: '+31%',
    description: 'Practice medicine under physician supervision. Strong demand and flexible settings.',
    regions: 'USA, UK, Canada, Netherlands',
    skills: ['Patient examination', 'Diagnosis & treatment', 'Prescribing (where permitted)', 'Procedures (suturing, casting)', 'Team collaboration', 'Patient communication'],
    qualifications: { education: "Master's from accredited PA program; prerequisite science courses", experience: 'Clinical rotations during program; some roles prefer 1+ years', certifications: 'PANCE (US); country-specific PA certification' },
    careerPathSteps: [
      step(1, 'Foundation', 'High school sciences. Prerequisites: biology, chemistry, anatomy, often patient-care hours.'),
      step(2, 'Undergraduate', "Bachelor's degree with PA program prerequisites (4 years). Gain healthcare experience (e.g. EMT, CNA)."),
      step(3, 'PA program', "Master's from accredited PA program (2–3 years). Didactic + clinical rotations."),
      step(4, 'Certification', 'Pass PANCE (US) or national PA exam. Apply for state license.'),
      step(5, 'Target role', 'Physician Assistant in clinic, hospital, or specialty. Optional sub-specialty certification.'),
    ],
  },
  {
    id: 11,
    rank: 11,
    title: 'Product Manager',
    sector: 'Technology',
    category: 'Technology',
    salary: '$85,000 – $165,000',
    growth: '+10%',
    description: 'Define product vision, roadmap, and requirements. Bridge between business, design, and engineering.',
    regions: 'USA, EU, UK, India, Singapore',
    skills: ['Roadmap planning', 'Stakeholder communication', 'User research', 'Agile/Scrum', 'Data-driven decisions', 'Prioritization', 'Writing PRDs'],
    qualifications: { education: "Bachelor's in Business, CS, or related; MBA optional", experience: '3–7+ years in product, project, or engineering', certifications: 'Optional: CSPO, CPMM' },
    careerPathSteps: [
      step(1, 'Foundation', 'Analytical and communication skills. Interest in users and technology.'),
      step(2, 'Education', "Bachelor's in Business, CS, Design, or related. Build side projects or internships."),
      step(3, 'Entry level', 'Associate PM, analyst, or project coordinator (0–2 years).'),
      step(4, 'Mid level', 'Product Manager (2–5 years). Own a product area, roadmap, and backlog.'),
      step(5, 'Target role', 'Senior PM / Director / VP Product. Strategy, portfolio, and team leadership.'),
    ],
  },
  {
    id: 12,
    rank: 12,
    title: 'UX Designer',
    sector: 'Technology',
    category: 'Creative & Design',
    salary: '$70,000 – $140,000',
    growth: '+13%',
    description: 'Design user experiences and interfaces. Research, wireframes, and usability testing.',
    regions: 'USA, EU, UK, Canada, Australia',
    skills: ['User research', 'Wireframing & prototyping', 'UI design', 'Usability testing', 'Figma/Sketch', 'Accessibility', 'Design systems'],
    qualifications: { education: "Bachelor's in Design, HCI, or related; strong portfolio", experience: '2–5+ years in UX/UI or product design', certifications: 'Optional: NN/g, IDF' },
    careerPathSteps: [
      step(1, 'Foundation', 'Interest in people and design. Basic visual design and empathy.'),
      step(2, 'Education', "Bachelor's or bootcamp in UX, HCI, or design. Build a portfolio of case studies."),
      step(3, 'Entry level', 'Junior UX/UI Designer or intern (0–2 years). Support research and design deliverables.'),
      step(4, 'Mid level', 'UX Designer (2–5 years). Own flows, run tests, and collaborate with dev and product.'),
      step(5, 'Target role', 'Senior UX Designer / Lead. Strategy, design systems, and mentoring.'),
    ],
  },
  {
    id: 13,
    rank: 13,
    title: 'Registered Nurse',
    sector: 'Healthcare',
    category: 'Healthcare',
    salary: '$55,000 – $95,000',
    growth: '+6%',
    description: 'Provide direct patient care in hospitals, clinics, and community settings.',
    regions: 'USA, UK, Canada, Australia, EU',
    skills: ['Patient care', 'Medication administration', 'Assessment & documentation', 'Care coordination', 'Communication', 'Critical thinking'],
    qualifications: { education: "Associate or Bachelor's in Nursing (ADN/BSN); NCLEX-RN", experience: '0–2+ years in clinical settings', certifications: 'BLS, ACLS; specialty certs optional' },
    careerPathSteps: [
      step(1, 'Foundation', 'High school diploma; sciences. Prerequisites for nursing program.'),
      step(2, 'Education', "ADN (2 years) or BSN (4 years). Pass NCLEX-RN for licensure."),
      step(3, 'Entry level', 'Staff RN in hospital or clinic (0–2 years). Build clinical skills.'),
      step(4, 'Mid level', 'Experienced RN or charge nurse (2–5+ years). Optional specialty (ICU, ER, etc.).'),
      step(5, 'Target role', 'Senior RN, NP track, or nurse manager. Optional: MSN, DNP, or NP.'),
    ],
  },
  {
    id: 14,
    rank: 14,
    title: 'Business Analyst',
    sector: 'Business & Technology',
    category: 'Business',
    salary: '$60,000 – $110,000',
    growth: '+11%',
    description: 'Analyze processes and requirements; bridge business needs and IT solutions.',
    regions: 'USA, UK, India, Canada, Australia',
    skills: ['Requirements gathering', 'Process modeling', 'Data analysis', 'Stakeholder management', 'Documentation', 'SQL & reporting'],
    qualifications: { education: "Bachelor's in Business, IT, or related", experience: '2–5+ years in analysis or operations', certifications: 'Optional: CBAP, PMI-PBA' },
    careerPathSteps: [
      step(1, 'Foundation', 'Analytical and communication skills. Interest in business and systems.'),
      step(2, 'Education', "Bachelor's in Business, IT, or related. Internships in operations or IT."),
      step(3, 'Entry level', 'Junior BA or analyst (0–2 years). Requirements and documentation.'),
      step(4, 'Mid level', 'Business Analyst (2–5 years). Lead discovery, process improvement, and projects.'),
      step(5, 'Target role', 'Senior BA / Product Owner / Consultant. Strategy and cross-organization initiatives.'),
    ],
  },
  {
    id: 15,
    rank: 15,
    title: 'Driver (Commercial / Transport)',
    sector: 'Transportation & Logistics',
    category: 'Transportation',
    salary: '$30,000 – $65,000',
    growth: '+4%',
    description: 'Drive vehicles for delivery, passenger transport, or logistics. Includes truck, bus, taxi, and ride-share drivers worldwide.',
    regions: 'USA, EU, UK, India, Australia, Global',
    skills: ['Safe driving', 'Route planning', 'Vehicle maintenance basics', 'Customer service', 'Time management', 'Regulatory compliance', 'GPS and logistics apps'],
    qualifications: { education: 'High school diploma or equivalent; valid driver\'s license for vehicle class', experience: '0–2+ years; commercial license (CDL/CPC) for trucks/buses', certifications: 'Commercial Driver\'s License (CDL), CPC for professional drivers in EU' },
    careerPathSteps: [
      step(1, 'Foundation', 'Valid driver\'s license; clean driving record. Minimum age per region (often 18–21 for commercial).'),
      step(2, 'Training', 'Driver training or vocational program. For truck/bus: commercial license (CDL) and any mandatory courses.'),
      step(3, 'Entry level', 'Local delivery, taxi, or ride-share (0–1 year). Build experience and safety record.'),
      step(4, 'Mid level', 'Commercial driver, long-haul or passenger transport (1–5 years). Optional hazardous goods or specialist endorsements.'),
      step(5, 'Target role', 'Senior driver, trainer, or fleet coordinator. Optional: own vehicle/operator license.'),
    ],
  },
  {
    id: 16,
    rank: 16,
    title: 'Cricketer (Professional Athlete)',
    sector: 'Sports',
    category: 'Sports',
    salary: 'Varies widely: $20,000 – $2M+',
    growth: 'Varies',
    description: 'Play cricket professionally at domestic or international level. Income from contracts, match fees, and endorsements.',
    regions: 'India, UK, Australia, Pakistan, Sri Lanka, South Africa, West Indies, Bangladesh',
    skills: ['Batting or bowling technique', 'Fitness & conditioning', 'Game strategy', 'Teamwork', 'Pressure handling', 'Discipline', 'Travel readiness'],
    qualifications: { education: 'No formal requirement; many complete school or degree alongside early career', experience: 'Youth and club cricket; domestic debut; international selection', certifications: 'None mandatory; fitness and anti-doping compliance' },
    careerPathSteps: [
      step(1, 'Foundation', 'Start young in school or club cricket. Develop batting/bowling and fitness.'),
      step(2, 'Age-group & club', 'Represent district/state age groups and clubs. Get coaching and play regularly.'),
      step(3, 'Domestic level', 'Break into first-class or List A domestic team. Perform consistently for selection.'),
      step(4, 'National contention', 'Earn national squad call-ups (Tests, ODIs, T20s). Build profile and endorsements.'),
      step(5, 'Target role', 'Regular international player or domestic star. Optional: coaching, commentary, or administration after playing.'),
    ],
  },
  {
    id: 17,
    rank: 17,
    title: 'School Teacher / Educator',
    sector: 'Education',
    category: 'Education',
    salary: '$40,000 – $85,000',
    growth: '+4%',
    description: 'Teach students in primary or secondary school. Plan lessons, assess progress, and support development.',
    regions: 'USA, UK, EU, India, Australia, Canada',
    skills: ['Lesson planning', 'Classroom management', 'Subject knowledge', 'Communication', 'Assessment', 'Differentiation', 'Patience and empathy'],
    qualifications: { education: "Bachelor's in Education or subject plus teaching credential (varies by country)", experience: 'Student teaching/practicum; 0–2+ years for full role', certifications: 'State or national teaching license/certification (e.g. QTS, B.Ed.)' },
    careerPathSteps: [
      step(1, 'Foundation', 'Complete high school. Strong grades in chosen subject and general education.'),
      step(2, 'Education', "Bachelor's in Education (B.Ed.) or degree in subject plus PGCE/diploma in teaching. Practicum placements."),
      step(3, 'Certification', 'Obtain teaching license or certification (e.g. QTS, state license).'),
      step(4, 'Entry to mid', 'Full-time teacher (0–5+ years). Develop classroom practice and optional subject lead.'),
      step(5, 'Target role', 'Senior teacher, department head, or move to leadership (e.g. principal). Optional: Master\'s in Education.'),
    ],
  },
  {
    id: 18,
    rank: 18,
    title: 'Accountant',
    sector: 'Finance & Accounting',
    category: 'Finance',
    salary: '$45,000 – $95,000',
    growth: '+6%',
    description: 'Prepare and examine financial records, ensure accuracy, and support tax and compliance. Works in firms, corporations, and public sector worldwide.',
    regions: 'USA, UK, EU, India, Australia, Canada, Singapore',
    skills: ['Financial reporting', 'Bookkeeping', 'Tax preparation', 'Excel & accounting software', 'GAAP/IFRS', 'Attention to detail', 'Analytical thinking', 'Audit support'],
    qualifications: { education: "Bachelor's in Accounting, Finance, or related; some roles require Master's or CPA track", experience: '0–4+ years; internships count for entry level', certifications: 'CPA (US), ACCA, CIMA, CA (varies by country)' },
    careerPathSteps: [
      step(1, 'Foundation', 'Strong math and analytical skills. High school diploma; some take accounting or business courses.'),
      step(2, 'Education', "Bachelor's in Accounting or Finance (4 years). Optional: Master's in Accounting or MBA for advancement."),
      step(3, 'Entry level', 'Staff Accountant or Junior Accountant (0–2 years). Bookkeeping, reconciliations, and reporting.'),
      step(4, 'Mid level', 'Accountant or Senior Accountant (2–5+ years). Lead month-end close, tax filings, or audit. Optional: CPA/ACCA.'),
      step(5, 'Target role', 'Senior Accountant, Controller, or move to Financial Manager. CPA or equivalent often required for senior roles.'),
    ],
  },
];

const previousYear = new Date().getFullYear() - 1;

/** Poll API for latest top jobs (ms). */
const TOP_JOBS_POLL_MS = 60_000;

function formatLastUpdated(d) {
  if (!d) return '';
  try {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(d);
  }
}

const matchSearch = (job, term) => {
  if (!term || !term.trim()) return true;
  const t = term.toLowerCase().trim();
  const inTitle = job.title.toLowerCase().includes(t);
  const inSector = job.sector.toLowerCase().includes(t);
  const inCategory = (job.category || '').toLowerCase().includes(t);
  const inSkill = job.skills.some((s) => s.toLowerCase().includes(t));
  const inDesc = job.description.toLowerCase().includes(t);
  return inTitle || inSector || inCategory || inSkill || inDesc;
};

const mapApiJob = (j, rank) => ({
  id: j.id,
  rank,
  title: j.title,
  sector: j.sector ?? j.category ?? '—',
  category: j.category ?? '—',
  salary: j.salaryRange ?? j.salary_range ?? '—',
  growth: j.growth ?? '—',
  description: j.description ?? '',
  regions: '—',
  skills: j.skills ?? [],
  qualifications: { education: '—', experience: '—', certifications: '—' },
  careerPathSteps: (j.careerPath ?? j.career_path ?? []).map((s) => ({
    step: s.step ?? 0,
    title: s.title ?? '',
    description: s.duration ?? '',
  })),
});

const Top10Jobs = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(() => formatCurrentDateTime());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [showSkillsPanel, setShowSkillsPanel] = useState(false);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const cancelledRef = useRef(false);

  const fetchTopJobs = useCallback(async ({ showFullSpinner } = {}) => {
    const silent = showFullSpinner === false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await jobsAPI.getTop('', 10);
      const arr = Array.isArray(data) ? data : [];
      if (!cancelledRef.current) {
        setJobs(arr.map((j, i) => mapApiJob(j, i + 1)));
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
      if (!cancelledRef.current && !silent) {
        setJobs([]);
      }
    } finally {
      if (!cancelledRef.current) {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    fetchTopJobs({ showFullSpinner: true });

    const pollId = setInterval(() => {
      fetchTopJobs({ showFullSpinner: false });
    }, TOP_JOBS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchTopJobs({ showFullSpinner: false });
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelledRef.current = true;
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchTopJobs]);

  const filteredJobs = useMemo(
    () => jobs.filter((j) => matchSearch(j, searchTerm)),
    [jobs, searchTerm]
  );

  const topJobsForChart = useMemo(() => filteredJobs.slice(0, 10), [filteredJobs]);

  const toggleJobSelection = (id) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedJobs = useMemo(() => jobs.filter((j) => selectedJobIds.has(j.id)), [jobs, selectedJobIds]);

  const growthChartData = useMemo(() => ({
    labels: topJobsForChart.map((j) => (j.title.length > 25 ? j.title.slice(0, 24) + '…' : j.title)),
    datasets: [
      {
        label: `Growth % (data through ${previousYear})`,
        data: topJobsForChart.map((j) => parseGrowthPercent(j.growth)),
        backgroundColor: topJobsForChart.map((_, i) => {
          const ratio = topJobsForChart.length ? i / topJobsForChart.length : 0;
          return `rgba(13, 115, 119, ${0.5 + ratio * 0.5})`;
        }),
        borderColor: 'rgba(13, 115, 119, 0.9)',
        borderWidth: 1,
      },
    ],
  }), [topJobsForChart]);

  const growthChartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Growth: +${ctx.raw}% (through ${previousYear})`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 50,
        title: { display: true, text: 'Growth %' },
        ticks: { callback: (v) => v + '%' },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true },
      },
    },
  }), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(formatCurrentDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="page-section">
      <div className="card">
        <div className="page-section-header">
          <GlobeIcon size={28} color="var(--accent)" />
          <h2>World&apos;s Top 10 Jobs</h2>
        </div>
        <div className="datetime-live-box">
          <div className="datetime-live-box__label">Current date & time (updates live)</div>
          <div className="datetime-live-box__value">
            {currentDateTime.dateStr} · {currentDateTime.timeStr}
          </div>
        </div>
        <p className="page-lede">
          Ranked by salary potential, global demand, growth rate, and work-life balance. Listings load from your database and
          refresh automatically about every minute and when you return to this tab.
        </p>
        <div className="top-jobs-live-row">
          {lastUpdated && (
            <p className="jobs-muted top-jobs-live-row__meta" aria-live="polite">
              Last updated: <strong>{formatLastUpdated(lastUpdated)}</strong>
              {refreshing ? ' · Updating…' : ''}
            </p>
          )}
          <div className="job-inline-actions top-jobs-live-row__actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading || refreshing}
              onClick={() => fetchTopJobs({ showFullSpinner: false })}
            >
              Refresh now
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/recommendation')}>
              Get My Recommendations
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="page-section-header">
          <TrendingUpIcon size={22} color="var(--accent)" />
          <h3>Job growth by role</h3>
        </div>
        <p className="page-lede">
          Estimated employment growth (%) by job — data through {previousYear}.
        </p>
        <div className="chart-panel-tall">
          {loading ? (
            <p className="jobs-loading">Loading job data...</p>
          ) : (
            <Bar data={growthChartData} options={growthChartOptions} />
          )}
        </div>
      </div>

      {SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION && (
        <div className="card">
          <h3>Find skills & qualifications for a job</h3>
          <p className="page-lede">
            Search by title or skill (e.g. &quot;driver&quot;, &quot;nurse&quot;, &quot;developer&quot;). Select one or more jobs below to view skills,
            qualifications, and career path.
          </p>
          <div className="job-filter-toolbar job-filter-toolbar--single">
            <div className="form-group form-group--toolbar form-group--grow-wide">
              <label htmlFor="top10-search" className="form-label-compact">Search jobs</label>
              <div className="job-search-input-row">
                <input
                  id="top10-search"
                  type="text"
                  placeholder="Job title, sector, or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                  Clear search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedJobIds.size > 0 && (
        <div className="card selection-banner">
          <span className="selection-banner__text">
            {selectedJobIds.size} job(s) selected — view details or compare main benefits
          </span>
          <div className="selection-banner__actions">
            <button type="button" className="btn btn-primary" onClick={() => { setShowSkillsPanel(true); setShowComparePanel(false); }}>View skills & career path</button>
            <button
              type="button"
              className="btn btn-cyan"
              onClick={() => { setShowComparePanel(true); setShowSkillsPanel(false); }}
            >
              Compare benefits
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedJobIds(new Set())}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      {showComparePanel && selectedJobs.length > 0 && (
        <div className="card card--stack-gap">
          <div className="panel-header-row">
            <h3>Compare main benefits</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowComparePanel(false)}>
              Close
            </button>
          </div>
          <p className="page-lede">
            Side-by-side comparison of key benefits for your selected jobs. Use this to decide which role fits you best.
          </p>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table__label">Benefit</th>
                  {selectedJobs.map((job) => (
                    <th key={job.id} className="compare-table__job">{job.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="compare-table__label">Salary (global)</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id}>{job.salary}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Growth</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id}>{job.growth}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Sector / Category</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id}>{job.sector} · {job.category || '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Key skills</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id} className="compare-table__compact">
                      {job.skills.slice(0, 4).join('; ')}{job.skills.length > 4 ? ' …' : ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Education</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id} className="compare-table__compact">{job.qualifications.education}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Experience</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id} className="compare-table__compact">{job.qualifications.experience}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Certifications</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id} className="compare-table__compact">{job.qualifications.certifications}</td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-table__label">Top regions</td>
                  {selectedJobs.map((job) => (
                    <td key={job.id} className="compare-table__compact">{job.regions}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSkillsPanel && selectedJobs.length > 0 && (
        <div className="card card--stack-gap">
          <div className="panel-header-row">
            <h3>Skills, qualifications & career path for selected jobs</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSkillsPanel(false)}>
              Close
            </button>
          </div>
          <p className="page-lede">
            For each role: required skills, qualifications, and a step-by-step career path from basic to target position.
          </p>
          <div className="panel-body-stack">
            {selectedJobs.map((job) => (
              <div key={job.id} className="job-detail-block">
                <h4>{job.title}</h4>
                <div>
                  <strong className="block-title">Skills</strong>
                  <ul>
                    {job.skills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="block-title">Qualifications</strong>
                  <ul>
                    <li><strong>Education:</strong> {job.qualifications.education}</li>
                    <li><strong>Experience:</strong> {job.qualifications.experience}</li>
                    <li><strong>Certifications:</strong> {job.qualifications.certifications}</li>
                  </ul>
                </div>
                {job.careerPathSteps && job.careerPathSteps.length > 0 && (
                  <div>
                    <strong className="block-title">Career path (step by step from basic)</strong>
                    <ol>
                      {job.careerPathSteps.map((s) => (
                        <li key={s.step}>
                          <strong>Step {s.step}: {s.title}</strong> — {s.description}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card job-search-results" aria-labelledby="top10-jobs-results-heading">
        <h3 id="top10-jobs-results-heading">Filtered results</h3>
        <p className="job-search-results__scope" aria-live="polite">
          {SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION && searchTerm.trim() ? (
            <>
              <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'role' : 'roles'} matching{' '}
              <strong>&quot;{searchTerm.trim()}&quot;</strong>
              {' '}
              — titles and skills from the Top 10 list; adjust the <strong>search</strong> field above to narrow results.
            </>
          ) : (
            <>
              <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'role' : 'roles'} from the Top 10 list
              {SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION ? (
                <>
                  {' '}
                  — use the <strong>search</strong> field above to filter by <strong>title</strong> or <strong>skill</strong>.
                </>
              ) : null}
            </>
          )}
        </p>

        {filteredJobs.length === 0 ? (
          <div className="job-search-results__empty-stack">
            <div
              className="card job-card job-search-results__empty-card"
              role="status"
              aria-label={SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION ? 'No jobs match this search' : 'No jobs to display'}
            >
              <div className="job-search-results__empty-inner">
                <div className="job-search-results__empty-icon" aria-hidden>
                  <SearchIcon size={28} color="currentColor" />
                </div>
                <p className="job-search-results__empty-kicker">No results found</p>
                <p className="job-search-results__empty-body">
                  {SHOW_FIND_SKILLS_QUALIFICATIONS_SECTION ? (
                    <>
                      No jobs match your search. Try different keywords (for example <strong>driver</strong>,{' '}
                      <strong>nurse</strong>, <strong>developer</strong>, or <strong>teacher</strong>), or clear the search to
                      see all roles again.
                    </>
                  ) : (
                    <>
                      No roles to display right now. Try <strong>Refresh now</strong> above, or check that the API is running
                      and returning job listings.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="jobs-stack">
            {filteredJobs.map((job) => {
              const descSummary = plainSummaryFromDescription(job.description);
              return (
                <div
                  key={job.id}
                  className={`card job-card job-card--selectable${selectedJobIds.has(job.id) ? ' job-card--selected' : ''}`}
                >
                  <div className="job-select-row">
                    <label className="job-select-row__check" title="Select to view skills & career path">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.has(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                      />
                      <span>Select</span>
                    </label>
                    <div className="job-select-row__main">
                      <div className="job-select-row__title-line">
                        <h4>{job.title}</h4>
                        <span className="job-pill">{job.sector}</span>
                        {job.category && (
                          <span className="job-pill job-pill--category">{job.category}</span>
                        )}
                      </div>
                      {descSummary ? (
                        <p className="job-select-row__desc">{descSummary}</p>
                      ) : (
                        <p className="job-select-row__desc jobs-muted">No short summary available.</p>
                      )}
                      <div className="job-select-row__meta">
                        <span><strong>Salary:</strong> {job.salary}</span>
                        <span><strong>Growth:</strong> {job.growth}</span>
                        <span className="job-select-row__regions">{job.regions}</span>
                      </div>
                    </div>
                    <StarIcon size={20} color="var(--accent)" className="job-select-row__star" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card card--stack-gap card--section-spaced">
        <h4>About this list</h4>
        <p className="jobs-muted">
          Rankings are based on commonly cited global indices (salary, demand, growth, work-life balance) and may vary by source and year. Use this as a starting point and explore roles that match your skills via Assessment and Recommendations.
        </p>
      </div>
    </section>
  );
};

export default Top10Jobs;
