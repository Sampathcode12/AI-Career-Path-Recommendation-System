/** Built-in careers when LLM/ML unavailable — mirrors Back-End/Services/RecommendationTemplateCatalog.cs */
export const CAREERS = [
  ['Digital Marketing Specialist', 'Plan and run campaigns across search, social, and content; measure performance and optimize for growth.', 'Marketing'],
  ['Marketing Analyst', 'Turn market, campaign, and customer data into insights that guide positioning and revenue.', 'Marketing'],
  ['Content Strategist', 'Plan messaging and content across channels; align stories with brand, audience, and business goals.', 'Marketing'],
  ['Software Developer', 'Build applications and systems. Strong fit if you like problem-solving and coding.', 'Technology'],
  ['DevOps Engineer', 'Bridge development and operations; focus on CI/CD and cloud infrastructure.', 'Technology'],
  ['Data Analyst', 'Analyze data to drive decisions. Good fit for analytical and detail-oriented people.', 'Data'],
  ['Data Scientist', 'Use statistics, machine learning, and programming to build models, run experiments, and deliver insights.', 'Data'],
  ['Product Manager', 'Define product vision and work with engineering and design.', 'Product'],
  ['UX Designer', 'Design user experiences and interfaces. Ideal for creative and user-focused individuals.', 'Design'],
  ['Corporate Counsel', 'Advise the business on contracts, risk, and regulatory matters; partner with leadership on strategy.', 'Legal'],
  ['Litigation Associate', 'Prepare cases, research precedent, and represent clients in disputes or support trial teams.', 'Legal'],
  ['Compliance Officer', 'Design and monitor policies so the organization meets laws and industry regulations.', 'Legal'],
  ['Legal Technology Specialist', 'Implement e-discovery, contract automation, and legal workflows with modern tools.', 'Legal'],
  ['Paralegal / Legal Analyst', 'Support attorneys with research, filings, case files, and document preparation.', 'Legal'],
  ['Healthcare Administrator', 'Coordinate operations, quality, and resources in clinics, hospitals, or health systems.', 'Healthcare'],
  ['Clinical Research Associate', 'Run studies and trials; ensure protocols, data integrity, and participant safety.', 'Healthcare'],
  ['Registered Nurse (Care Coordination)', 'Guide patient care plans, education, and handoffs across care teams.', 'Healthcare'],
  ['Instructional Designer', 'Build learning experiences, assessments, and curricula for schools or corporate training.', 'Education'],
  ['K-12 Educator / Curriculum Lead', 'Teach or lead subject and curriculum development in schools or learning programs.', 'Education'],
  ['HR Business Partner', 'Align people strategy with managers: hiring, performance, engagement, and policy.', 'Human Resources'],
  ['Talent Acquisition Specialist', 'Source, interview, and hire candidates; improve employer brand and hiring process.', 'Human Resources'],
  ['Financial Analyst', 'Model revenue, costs, and forecasts; support budgeting, reporting, and investment decisions.', 'Finance'],
  ['Business Analyst', 'Translate business needs into requirements, processes, and solutions with stakeholders and tech teams.', 'Business'],
];

const STOP = new Set([
  'the', 'and', 'for', 'you', 'are', 'with', 'not', 'but', 'can', 'our', 'your', 'has', 'have', 'was', 'were', 'been',
  'from', 'they', 'will', 'would', 'could', 'this', 'that', 'into', 'about', 'also', 'any', 'more', 'some', 'than', 'then',
  'when', 'what', 'which', 'who', 'how', 'all', 'each', 'both', 'such', 'only', 'over', 'after', 'before', 'between',
  'under', 'while', 'during', 'very', 'just', 'like', 'well', 'years', 'year', 'work', 'want', 'help', 'make', 'good', 'new',
  'use', 'using', 'etc', 'per', 'may', 'one', 'two', 'his', 'her', 'its', 'had', 'did',
]);

function buildSurveyBlob(profile) {
  if (!profile) return '';
  return [
    profile.interests, profile.skills, profile.ug_specialization, profile.ug_course,
    profile.certificate_course_titles, profile.preferred_industries, profile.masters_field,
    profile.bio, profile.first_job_title, profile.experience_level, profile.education, profile.location,
  ].map((s) => s ?? '').join(' ');
}

function tokenize(blob) {
  if (!blob.trim()) return [];
  const lower = blob.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
  return [...new Set(lower.filter((t) => t.length >= 3 && !STOP.has(t)))];
}

function inferCluster(profile) {
  const blob = buildSurveyBlob(profile).toLowerCase();
  if (blob.trim().length < 3) return null;
  if (/legal|litigation|attorney|lawyer|paralegal|counsel|compliance|regulatory|court|law firm|bar exam|juris|\blaw\b/.test(blob)) return 'law';
  if (/nurse|nursing|clinical|healthcare|hospital|patient care|medical|pharma/.test(blob)) return 'healthcare';
  if (/teach|education|curriculum|classroom|k-12|academic/.test(blob)) return 'education';
  if (/human resource|recruit|talent acquisition|\bhr\b/.test(blob)) return 'human_resources';
  if (/product manager|product owner|product roadmap/.test(blob)) return 'product';
  if (/\bux\b|\bui\b|user experience|figma|design/.test(blob) && !/instructional/.test(blob)) return 'design';
  if (/market|brand|social media|seo|campaign|content/.test(blob) && !/legal/.test(blob)) return 'marketing';
  if (/data science|machine learning|statistics|python.*data/.test(blob)) return 'data_science';
  if (/software|developer|programming|devops|full stack|backend|frontend/.test(blob)) return 'technology';
  if (/business analyst|business analysis/.test(blob)) return 'business';
  if (/finance|accounting|investment|financial/.test(blob)) return 'finance';
  return null;
}

function orderForCluster(cluster) {
  const list = CAREERS.map(([title, desc, category]) => ({ title, desc, category }));
  if (!cluster) return list;
  const c = cluster.toLowerCase().replace(/[\s-]+/g, '_');
  const score = (item) => {
    const blob = `${item.title} ${item.desc} ${item.category}`.toLowerCase();
    if (c.includes('legal') || c === 'law') return item.category === 'Legal' ? 0 : blob.includes('legal') ? 1 : 6;
    if (c.includes('health')) return item.category === 'Healthcare' ? 0 : 6;
    if (c.includes('education')) return item.category === 'Education' ? 0 : 6;
    if (c.includes('human')) return item.category === 'Human Resources' ? 0 : 6;
    if (c.includes('product')) return item.category === 'Product' ? 0 : 6;
    if (c.includes('design')) return item.category === 'Design' ? 0 : 6;
    if (c.includes('market')) return item.category === 'Marketing' ? 0 : 6;
    if (c.includes('data')) return item.title.toLowerCase().includes('data') ? 0 : 6;
    if (c.includes('tech')) return item.category === 'Technology' ? 0 : 6;
    if (c.includes('business')) return item.category === 'Business' ? 0 : 6;
    if (c.includes('finance')) return item.category === 'Finance' ? 0 : 6;
    return 3;
  };
  return [...list].sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title));
}

function orderByOverlap(profile) {
  const list = CAREERS.map(([title, desc, category]) => ({ title, desc, category }));
  const tokens = tokenize(buildSurveyBlob(profile));
  if (!tokens.length) return list;
  const score = (item) => {
    const text = `${item.title} ${item.desc} ${item.category}`.toLowerCase();
    return tokens.reduce((n, t) => (text.includes(t) ? n + 1 : n), 0);
  };
  if (Math.max(...list.map(score)) === 0) return list;
  return [...list].sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title));
}

function marketHints(category) {
  const map = {
    Marketing: ['$55,000 - $95,000', '+12%'],
    Data: ['$70,000 - $120,000', '+18%'],
    Product: ['$85,000 - $130,000', '+14%'],
    Design: ['$65,000 - $110,000', '+13%'],
    Technology: ['$80,000 - $125,000', '+16%'],
    Legal: ['$70,000 - $160,000', '+8%'],
    Healthcare: ['$65,000 - $120,000', '+14%'],
    Education: ['$45,000 - $85,000', '+6%'],
    'Human Resources': ['$55,000 - $100,000', '+10%'],
    Business: ['$65,000 - $105,000', '+12%'],
    Finance: ['$70,000 - $105,000', '+10%'],
  };
  return map[category] ?? ['See market data', '+12%'];
}

export function hasMinimumCareerIntake(profile) {
  if (!profile) return false;
  return !!(String(profile.ug_specialization ?? '').trim()
    && String(profile.interests ?? '').trim()
    && String(profile.skills ?? '').trim());
}

/** Up to 10 template rows for recommendation generation. */
export function buildTemplateRows(profile) {
  const max = 10;
  const cluster = inferCluster(profile);
  const fillOrder = cluster ? orderForCluster(cluster) : orderByOverlap(profile);
  const matches = [87, 83, 80, 77, 74, 71, 69, 67, 65, 63];
  const used = new Set();
  const rows = [];
  for (const item of fillOrder) {
    if (rows.length >= max) break;
    if (!used.add(item.title)) continue;
    const [salary, growth] = marketHints(item.category);
    rows.push({
      title: item.title,
      desc: item.desc,
      category: item.category,
      match: matches[rows.length] ?? 62,
      salary,
      growth,
    });
  }
  return rows;
}
