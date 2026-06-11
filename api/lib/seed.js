import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './mongodb.js';
import { nextSequence } from './counters.js';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../data');
let seeded = false;

function loadJson(name) {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
}

function parseJsonArray(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const DEFAULT_JOBS = [
  { title: 'Software Developer', company: 'TechCorp', category: 'Technology', sector: 'Technology', country: 'United States', salary_range: '$85k - $120k', growth: '+15%', skills: ['JavaScript', 'React', 'Node.js', 'Git'], description: 'Build and maintain web applications.' },
  { title: 'Data Scientist', company: 'DataWorks', category: 'Technology', sector: 'Technology', country: 'United States', salary_range: '$95k - $140k', growth: '+18%', skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'], description: 'Analyze data and build predictive models.' },
  { title: 'DevOps Engineer', company: 'CloudScale', category: 'Technology', sector: 'Technology', country: 'United Kingdom', salary_range: '$90k - $130k', growth: '+16%', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], description: 'Automate deployment and cloud infrastructure.' },
  { title: 'Registered Nurse', company: 'City Hospital', category: 'Healthcare', sector: 'Healthcare', country: 'United States', salary_range: '$65k - $95k', growth: '+12%', skills: ['Patient Care', 'Clinical Systems', 'Communication'], description: 'Provide direct patient care in clinical settings.' },
  { title: 'Financial Analyst', company: 'Global Finance', category: 'Finance', sector: 'Finance', country: 'United States', salary_range: '$70k - $105k', growth: '+10%', skills: ['Excel', 'Financial Modeling', 'SQL'], description: 'Support budgeting, forecasting, and reporting.' },
  { title: 'UX Designer', company: 'DesignHub', category: 'Creative & Design', sector: 'Creative', country: 'Canada', salary_range: '$70k - $110k', growth: '+13%', skills: ['Figma', 'User Research', 'Prototyping'], description: 'Design intuitive product experiences.' },
  { title: 'Product Manager', company: 'ProductLab', category: 'Technology', sector: 'Technology', country: 'Singapore', salary_range: '$95k - $140k', growth: '+14%', skills: ['Roadmapping', 'Agile', 'Stakeholder Management'], description: 'Define product strategy and delivery.' },
  { title: 'Cybersecurity Analyst', company: 'SecureNet', category: 'Technology', sector: 'Technology', country: 'Germany', salary_range: '$80k - $125k', growth: '+20%', skills: ['SIEM', 'Network Security', 'Incident Response'], description: 'Monitor and protect organizational systems.' },
  { title: 'Digital Marketing Specialist', company: 'BrandPulse', category: 'Marketing', sector: 'Marketing', country: 'United States', salary_range: '$55k - $85k', growth: '+12%', skills: ['SEO', 'Google Analytics', 'Content Strategy'], description: 'Run digital campaigns and measure growth.' },
  { title: 'Business Analyst', company: 'ConsultCo', category: 'Professional Services', sector: 'Business', country: 'United States', salary_range: '$65k - $100k', growth: '+11%', skills: ['Requirements', 'Process Mapping', 'SQL'], description: 'Bridge business needs and technology solutions.' },
];

export async function ensureSeeded() {
  if (seeded) return;
  const db = await getDb();

  const skillGapCount = await db.collection('industry_skill_gaps').countDocuments();
  if (skillGapCount === 0) {
    const rows = loadJson('industry-skill-gaps.json');
    await db.collection('industry_skill_gaps').insertMany(
      rows.map((r, i) => ({
        id: i + 1,
        industry_id: r.industryId,
        name: r.name,
        description: r.description,
        demand_growth: r.demandGrowth,
        top_demand_skills: parseJsonArray(r.topDemandSkillsJson),
        gap_skills: parseJsonArray(r.gapSkillsJson),
        supply_level: r.supplyLevel,
        top_regions: parseJsonArray(r.topRegionsJson),
        typical_salary_range: r.typicalSalaryRange,
        typical_education: r.typicalEducation,
        typical_certifications: r.typicalCertifications,
      })),
    );
  }

  const trendCount = await db.collection('market_trends').countDocuments();
  if (trendCount === 0) {
    const rows = loadJson('market-trends.json');
    await db.collection('market_trends').insertMany(
      rows.map((r, i) => ({
        id: i + 1,
        category: r.category,
        title: r.title,
        description: r.description,
        trend_data_json: r.trendDataJson,
        updated_at: new Date(),
      })),
    );
  }

  const pathCount = await db.collection('subject_career_paths').countDocuments();
  if (pathCount === 0) {
    const rows = loadJson('subject-career-paths.json');
    await db.collection('subject_career_paths').insertMany(
      rows.map((r, i) => ({
        id: i + 1,
        specialization: r.specialization,
        path_label: r.path_label,
        sort_order: r.sort_order ?? i + 1,
      })),
    );
  }

  const jobCount = await db.collection('job_listings').countDocuments();
  if (jobCount === 0) {
    const jobs = [];
    for (const j of DEFAULT_JOBS) {
      jobs.push({
        id: await nextSequence('job_listings'),
        title: j.title,
        company: j.company,
        location: j.country,
        country: j.country,
        sector: j.sector,
        category: j.category,
        salary_range: j.salary_range,
        growth: j.growth,
        description: j.description,
        url: null,
        skills: j.skills,
        career_path_json: null,
      });
    }
    await db.collection('job_listings').insertMany(jobs);
  }

  seeded = true;
}
