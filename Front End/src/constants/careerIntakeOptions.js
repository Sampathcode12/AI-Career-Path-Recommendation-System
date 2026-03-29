/** Sentinel: user enters custom text (stored in same profile field). */
export const INTAKE_OTHER = '__other__';

/**
 * Source list (maintained in logical chunks); exported list is flat, deduped, A–Z by label — no region UI.
 */
const UG_COURSE_SOURCE = [
  {
    group: 'Worldwide — Science, arts & commerce',
    items: [
      { value: 'B.Sc', label: 'B.Sc / B.S. / BS — Bachelor of Science' },
      { value: 'B.A', label: 'B.A / BA — Bachelor of Arts' },
      { value: 'B.Com', label: 'B.Com / B.Comm / BComm — Bachelor of Commerce' },
      { value: 'BBA', label: 'BBA / BBM / BMS — Bachelor of Business Administration' },
      { value: 'BCA', label: 'BCA — Bachelor of Computer Applications' },
      { value: 'BFA', label: 'BFA — Bachelor of Fine Arts' },
      { value: 'BMus', label: 'BMus / B.Mus — Bachelor of Music' },
      { value: 'B.Des', label: 'B.Des — Bachelor of Design' },
      { value: 'B.Ed', label: 'B.Ed / BEd — Bachelor of Education' },
      { value: 'BSW', label: 'BSW — Bachelor of Social Work' },
      { value: 'B.Lib.I.Sc', label: 'B.Lib.I.Sc / BLIS — Bachelor of Library & Information Science' },
      { value: 'B.J.M.C.', label: 'BJMC / BMC / BA Journalism — Journalism & Mass Communication' },
    ],
  },
  {
    group: 'Worldwide — Engineering & technology',
    items: [
      { value: 'B.E.', label: 'B.E. — Bachelor of Engineering' },
      { value: 'B.Tech', label: 'B.Tech / BTech — Bachelor of Technology' },
      { value: 'B.Eng', label: 'B.Eng / BEng — Bachelor of Engineering (UK / Commonwealth style)' },
      { value: 'B.Arch', label: 'B.Arch — Bachelor of Architecture' },
      { value: 'B.Plan', label: 'B.Plan / BURP — Bachelor of Planning / Urban Planning' },
      { value: 'B.IT', label: 'B.IT / BIT — Bachelor of Information Technology' },
      { value: 'BIS', label: 'BIS — Bachelor of Information Systems' },
      { value: 'BSBA', label: 'BSBA — Bachelor of Science in Business Administration' },
      { value: 'BAS', label: 'BAS / B.A.S. — Bachelor of Applied Science' },
      { value: 'Integrated B.Tech–M.Tech', label: 'Integrated / dual B.Tech + M.Tech (or B.E. + M.E.)' },
      { value: 'Integrated BS–MS', label: 'Integrated BS–MS / B.Sc–M.Sc (undergraduate entry)' },
    ],
  },
  {
    group: 'Worldwide — Health sciences (first professional degree)',
    items: [
      { value: 'MBBS', label: 'MBBS / MBChB / MD (undergraduate medicine)' },
      { value: 'BDS', label: 'BDS — Bachelor of Dental Surgery' },
      { value: 'B.Pharm', label: 'B.Pharm / BPharm — Bachelor of Pharmacy' },
      { value: 'Pharm.D (UG)', label: 'Pharm.D — Doctor of Pharmacy (undergraduate / pre-licensure)' },
      { value: 'B.Sc Nursing', label: 'B.Sc Nursing / BSN — Bachelor of Science in Nursing' },
      { value: 'BNurs', label: 'BNurs / BN — Bachelor of Nursing' },
      { value: 'BPT', label: 'BPT — Bachelor of Physiotherapy / Physical Therapy (UG)' },
      { value: 'BOT', label: 'BOT — Bachelor of Occupational Therapy' },
      { value: 'BAMS', label: 'BAMS — Bachelor of Ayurvedic Medicine & Surgery' },
      { value: 'BHMS', label: 'BHMS — Bachelor of Homeopathic Medicine & Surgery' },
      { value: 'BUMS', label: 'BUMS — Bachelor of Unani Medicine & Surgery' },
      { value: 'BVSc', label: 'BVSc & AH — Bachelor of Veterinary Science' },
      { value: 'BASLP', label: 'BASLP — Audiology & Speech-Language Pathology' },
      { value: 'B.Optom', label: 'B.Optom — Bachelor of Optometry' },
      { value: 'BMLT', label: 'BMLT / BSc MLT — Medical Laboratory Technology' },
      { value: 'BPH', label: 'BPH — Bachelor of Public Health (UG)' },
    ],
  },
  {
    group: 'Worldwide — Law, agriculture & environment',
    items: [
      { value: 'LL.B', label: 'LL.B / LLB — Bachelor of Laws' },
      { value: 'B.Sc Agriculture', label: 'B.Sc Agriculture / BS Agriculture' },
      { value: 'B.Sc Horticulture', label: 'B.Sc Horticulture' },
      { value: 'B.Sc Forestry', label: 'B.Sc Forestry / BS Forestry' },
      { value: 'B.Sc Fisheries', label: 'B.Sc Fisheries / Aquaculture' },
      { value: 'B.Sc Environmental Science', label: 'B.Sc Environmental Science / Sustainability' },
      { value: 'B.Sc Food Technology', label: 'B.Sc / B.Tech Food Technology' },
      { value: 'B.Sc Biotechnology', label: 'B.Sc / B.Tech Biotechnology' },
    ],
  },
  {
    group: 'North America — United States & Canada',
    items: [
      { value: 'Associate of Arts (AA)', label: 'Associate of Arts (AA)' },
      { value: 'Associate of Science (AS)', label: 'Associate of Science (AS)' },
      { value: 'Associate of Applied Science (AAS)', label: 'Associate of Applied Science (AAS)' },
      { value: 'BS (United States)', label: 'BS — Bachelor of Science (United States)' },
      { value: 'BA (United States)', label: 'BA — Bachelor of Arts (United States)' },
      { value: 'BBA (United States)', label: 'BBA — Bachelor of Business Administration (US)' },
      { value: 'BComm (Canada)', label: 'BComm — Bachelor of Commerce (Canada)' },
      { value: 'BMath (Canada)', label: 'BMath — Bachelor of Mathematics (Canada)' },
      { value: 'BCS (North America)', label: 'BCS — Bachelor of Computer Science (North America)' },
      { value: 'BEng (Canada)', label: 'BEng — Bachelor of Engineering (Canada)' },
    ],
  },
  {
    group: 'United Kingdom & Ireland',
    items: [
      { value: 'BSc (Hons) UK', label: 'BSc (Hons) — Bachelor of Science with Honours (UK)' },
      { value: 'BA (Hons) UK', label: 'BA (Hons) — Bachelor of Arts with Honours (UK)' },
      { value: 'BEng (Hons) UK', label: 'BEng (Hons) — Bachelor of Engineering (UK)' },
      { value: 'MEng (UG UK)', label: 'MEng — integrated Master of Engineering (UG entry, UK)' },
      { value: 'LLB (Hons) UK', label: 'LLB (Hons) — Bachelor of Laws (UK)' },
      { value: 'MBChB UK', label: 'MBChB — Bachelor of Medicine & Bachelor of Surgery (UK)' },
      { value: 'Foundation Degree UK', label: 'Foundation Degree (UK, Level 5)' },
    ],
  },
  {
    group: 'Europe — Bologna & national degrees',
    items: [
      { value: 'Bachelor (Bologna 180 ECTS)', label: 'Bachelor / Bakkalaureus — Bologna 3-year (EU)' },
      { value: 'Licence (France)', label: 'Licence — France (3 ans)' },
      { value: 'Licenciatura (Spain)', label: 'Grado / Licenciatura — Spain' },
      { value: 'Laurea triennale (Italy)', label: 'Laurea triennale — Italy (3-year)' },
      { value: 'Bachelor (Germany)', label: 'Bachelor (B.A. / B.Sc. / B.Eng.) — Germany' },
      { value: 'Bachelor (Netherlands)', label: 'Bachelor — Netherlands (WO / HBO)' },
      { value: 'Kandidat / Bachelor (Nordics)', label: 'Kandidat / Bachelor — Nordic countries' },
      { value: 'Inżynier (Poland)', label: 'Inżynier (BEng equivalent) — Poland' },
      { value: 'Diplomstudium / Bakk. (AT/DE legacy)', label: 'Diplom (FH) / legacy first degree — Austria / Germany' },
    ],
  },
  {
    group: 'South Asia — India, Pakistan, Bangladesh, Nepal, Sri Lanka',
    items: [
      { value: 'B.Tech (India)', label: 'B.Tech — India' },
      { value: 'B.E. (India)', label: 'B.E. — Bachelor of Engineering (India)' },
      { value: 'B.Arch (India)', label: 'B.Arch — India' },
      { value: 'B.Pharm (India)', label: 'B.Pharm — India' },
      { value: 'B.P.Ed', label: 'B.P.Ed — Physical Education (India)' },
      { value: 'B.El.Ed', label: 'B.El.Ed — Elementary Education (India)' },
      { value: 'BHMCT', label: 'BHMCT — Hotel Management & Catering (India)' },
      { value: 'BHM (India)', label: 'BHM — Hotel Management (India)' },
      { value: 'BTTM', label: 'BTTM — Tourism & Travel Management (India)' },
      { value: 'BID', label: 'BID — Interior Design (India)' },
      { value: 'BFT', label: 'BFT — Fashion Technology (India)' },
      { value: 'LL.B (5yr integrated India)', label: 'B.A. LL.B / B.Com LL.B / B.Tech LL.B — integrated law (India)' },
      { value: 'MBBS (South Asia)', label: 'MBBS — South Asia' },
      { value: 'BDS (South Asia)', label: 'BDS — South Asia' },
      { value: 'DPT (Pakistan)', label: 'DPT — Doctor of Physical Therapy (Pakistan, UG)' },
    ],
  },
  {
    group: 'East & Southeast Asia',
    items: [
      { value: '学士 (Japan)', label: '学士 (Gakushi) — Japan Bachelor' },
      { value: '학사 (South Korea)', label: '학사 (Haksa) — South Korea Bachelor' },
      { value: '本科 (China)', label: '本科 (Běnkē) — China undergraduate degree' },
      { value: '學士 (Taiwan)', label: '學士 — Taiwan Bachelor' },
      { value: 'Sarjana Muda (Malaysia)', label: 'Sarjana Muda / Sijil — Malaysia Bachelor' },
      { value: 'Sarjana (Indonesia)', label: 'Sarjana (S1) — Indonesia Bachelor' },
      { value: 'BS / AB (Philippines)', label: 'BS / AB — Philippines Bachelor' },
      { value: 'Cử nhân (Vietnam)', label: 'Cử nhân — Vietnam Bachelor' },
      { value: 'ปริญญาตรี (Thailand)', label: 'ปริญญาตรี — Thailand Bachelor' },
    ],
  },
  {
    group: 'Latin America & Caribbean',
    items: [
      { value: 'Licenciatura (Latin America)', label: 'Licenciatura — Latin America (4–5 years)' },
      { value: 'Grado (Latin America)', label: 'Grado — undergraduate degree (Spanish-speaking)' },
      { value: 'Ingeniería (pregrado)', label: 'Ingeniería — Engineering (pregrado)' },
      { value: 'Tecnólogo', label: 'Tecnólogo / Técnico superior — technological degree' },
      { value: 'Bacharel (Brazil)', label: 'Bacharel / Licenciatura — Brazil' },
      { value: 'Título intermedio / técnico', label: 'Título técnico / tecnológico (undergraduate-level)' },
    ],
  },
  {
    group: 'Middle East, Africa & Oceania',
    items: [
      { value: 'Bachelor (Middle East)', label: 'Bachelor — Middle East (English-medium universities)' },
      { value: 'LLB (Middle East)', label: 'LLB / Sharia-related first degree (UG)' },
      { value: 'Bachelor (Sub-Saharan Africa)', label: 'Bachelor — Sub-Saharan Africa (university degree)' },
      { value: 'Bachelor (Australia)', label: 'Bachelor Degree — Australia' },
      { value: 'Bachelor (New Zealand)', label: 'Bachelor Degree — New Zealand' },
    ],
  },
  {
    group: 'Other & foundation',
    items: [
      { value: 'Undergraduate Diploma', label: 'Undergraduate / advanced diploma (post-secondary, pre-Bachelor)' },
      { value: 'Foundation year / Pathway', label: 'Foundation year / Pathway programme (leads to Bachelor)' },
      { value: 'Higher National Diploma (HND)', label: 'HND / HNC — UK & international' },
      { value: 'Still studying (UG)', label: 'Currently enrolled — undergraduate (not yet completed)' },
    ],
  },
];

function uniqueUgCoursesByValue(items) {
  const map = new Map();
  for (const o of items) {
    if (!map.has(o.value)) map.set(o.value, o);
  }
  return [...map.values()];
}

/** All UG courses in one flat, alphabetical list (searchable in the UI). */
export const UG_COURSE_OPTIONS = uniqueUgCoursesByValue(
  UG_COURSE_SOURCE.flatMap((g) => g.items)
).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

/** Common majors / specializations — pairs with UG course in surveys */
export const UG_SPECIALIZATION_OPTIONS = [
  { value: 'Computer Science / IT', label: 'Computer Science / IT' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data Science / AI', label: 'Data Science / AI' },
  { value: 'Electronics & Communication', label: 'Electronics & Communication' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biotechnology / Life Sciences', label: 'Biotechnology / Life Sciences' },
  { value: 'Commerce / Accounting', label: 'Commerce / Accounting' },
  { value: 'Finance / Banking', label: 'Finance / Banking' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'English / Literature', label: 'English / Literature' },
  { value: 'Journalism / Media', label: 'Journalism / Media' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Law', label: 'Law' },
  { value: 'General / Undeclared', label: 'General / Undeclared' },
];

export function intakeSelectValue(storedValue, predefinedValues) {
  const v = (storedValue ?? '').trim();
  if (!v) return '';
  if (predefinedValues.includes(v)) return v;
  return INTAKE_OTHER;
}

/** Suggested career interests per UG specialization (tap-to-add in the form). */
export const INTERESTS_BY_SPECIALIZATION = {
  'Computer Science / IT': [
    'Software development',
    'Web & mobile applications',
    'Cloud computing',
    'Cybersecurity',
    'Open source & community',
    'Systems & networks',
    'Human–computer interaction',
  ],
  'Software Engineering': [
    'Building reliable software products',
    'Agile & DevOps',
    'API design & microservices',
    'Testing & quality assurance',
    'Performance engineering',
    'Technical leadership',
  ],
  'Data Science / AI': [
    'Machine learning',
    'Data analysis & visualization',
    'Natural language processing',
    'MLOps & model deployment',
    'Statistics & experimentation',
    'Ethical & responsible AI',
  ],
  'Electronics & Communication': [
    'Embedded systems',
    'IoT & sensors',
    'Signal processing',
    'Wireless & RF',
    'VLSI / chip design',
    'Robotics hardware',
  ],
  'Electrical Engineering': [
    'Power systems & energy',
    'Control & automation',
    'Renewable energy',
    'Electric vehicles',
    'Smart grids',
    'Industrial automation',
  ],
  'Mechanical Engineering': [
    'Product design & CAD',
    'Manufacturing & production',
    'Automotive & mobility',
    'HVAC & thermal systems',
    'Aerospace structures',
    'Robotics & mechatronics',
  ],
  'Civil Engineering': [
    'Structural design',
    'Transportation & highways',
    'Sustainable construction',
    'Urban planning',
    'Water resources',
    'Project management (infra)',
  ],
  'Information Technology': [
    'IT infrastructure',
    'Enterprise systems',
    'Database administration',
    'IT support & operations',
    'Business analysis',
    'Digital transformation',
  ],
  Mathematics: [
    'Applied mathematics',
    'Actuarial & risk',
    'Operations research',
    'Teaching & academia',
    'Mathematical modeling',
    'Cryptography & theory',
  ],
  Physics: [
    'Research & lab work',
    'Medical physics',
    'Materials science',
    'Astronomy & space',
    'Teaching & science communication',
    'Data-driven physics',
  ],
  Chemistry: [
    'R&D in industry',
    'Pharmaceutical chemistry',
    'Environmental chemistry',
    'Quality & lab analysis',
    'Teaching',
    'Green & sustainable chemistry',
  ],
  'Biotechnology / Life Sciences': [
    'Research & development',
    'Biotech industry',
    'Healthcare innovation',
    'Genomics & bioinformatics',
    'Clinical trials support',
    'Agricultural biotech',
  ],
  'Commerce / Accounting': [
    'Financial accounting',
    'Auditing & assurance',
    'Taxation',
    'Corporate finance support',
    'ERP & systems accounting',
    'Startup bookkeeping',
  ],
  'Finance / Banking': [
    'Investment analysis',
    'Risk & compliance',
    'Retail & corporate banking',
    'FinTech',
    'Wealth management',
    'Financial modeling',
  ],
  Marketing: [
    'Digital marketing',
    'Brand management',
    'Market research',
    'Content & social media',
    'Growth & performance marketing',
    'Product marketing',
  ],
  'Human Resources': [
    'Talent acquisition',
    'Learning & development',
    'HR analytics',
    'Employee relations',
    'Compensation & benefits',
    'Organizational development',
  ],
  Economics: [
    'Economic research',
    'Public policy',
    'Development economics',
    'Data analytics for policy',
    'Consulting',
    'International trade',
  ],
  Psychology: [
    'Clinical & counseling paths',
    'Organizational psychology',
    'Research & academia',
    'UX / human factors',
    'Mental health awareness',
    'Education & training',
  ],
  'English / Literature': [
    'Writing & editing',
    'Publishing',
    'Teaching & ESL',
    'Content strategy',
    'Creative writing',
    'Communications',
  ],
  'Journalism / Media': [
    'News & reporting',
    'Broadcast & video',
    'Documentary',
    'Media production',
    'Public relations',
    'Digital storytelling',
  ],
  Nursing: [
    'Patient care',
    'Community health',
    'Critical care',
    'Public health nursing',
    'Nursing education',
    'Telehealth',
  ],
  Pharmacy: [
    'Clinical pharmacy',
    'Pharmaceutical industry',
    'Regulatory affairs',
    'Community pharmacy',
    'Research & development',
    'Drug safety',
  ],
  Law: [
    'Corporate law',
    'Litigation',
    'Public interest & policy',
    'Compliance',
    'Intellectual property',
    'Legal tech',
  ],
  'General / Undeclared': [
    'Exploring multiple career paths',
    'Internships & hands-on experience',
    'Leadership & teamwork',
    'Communication skills',
    'Problem solving',
    'Social impact careers',
  ],
};

const DEFAULT_INTEREST_SUGGESTIONS = INTERESTS_BY_SPECIALIZATION['General / Undeclared'];

/** Every UG_SPECIALIZATION_OPTIONS.value must have a non-empty list here (dev check below). */
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  for (const o of UG_SPECIALIZATION_OPTIONS) {
    const list = INTERESTS_BY_SPECIALIZATION[o.value];
    if (!Array.isArray(list) || list.length === 0) {
      console.error(
        `[careerIntakeOptions] INTERESTS_BY_SPECIALIZATION missing or empty for specialization: "${o.value}"`
      );
    }
  }
}

/**
 * Returns curated suggestion chips for the interests field (static data, not from API).
 * - Exact match on dropdown `value` → that major’s list (all 24 majors covered).
 * - Empty specialization → same suggestions as “General / Undeclared”.
 * - Custom “Other” text (not in dropdown) → general suggestions.
 *
 * @param {string | undefined} specializationValue - stored UG specialization (predefined value or custom text)
 * @param {string[]} predefinedSpecValues - values from UG_SPECIALIZATION_OPTIONS
 */
export function getSuggestedInterestsForSpecialization(specializationValue, predefinedSpecValues) {
  const v = (specializationValue ?? '').trim();
  if (!v) return DEFAULT_INTEREST_SUGGESTIONS;
  if (predefinedSpecValues.includes(v) && INTERESTS_BY_SPECIALIZATION[v]) {
    return INTERESTS_BY_SPECIALIZATION[v];
  }
  return DEFAULT_INTEREST_SUGGESTIONS;
}
