import { CAREERS } from './templateCatalog.js';

function containsAny(hay, needles) {
  return needles.some((n) => hay.includes(n));
}

function isGreeting(lower) {
  const t = lower.replace(/[.!?…]+$/g, '').trim();
  return ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'hiya', 'yo'].includes(t)
    || t.startsWith('hi ') || t.startsWith('hello ') || t.startsWith('hey ');
}

function extractCurrentUserMessage(full) {
  const marker = '\n\nCurrent message: ';
  const i = full.lastIndexOf(marker);
  if (i >= 0) {
    const tail = full.slice(i + marker.length).trim();
    if (tail) return tail;
  }
  return full.trim();
}

function findCareerMention(msg, recs) {
  const ordered = [...recs].filter((r) => r.title).sort((a, b) => b.title.length - a.title.length);
  for (const r of ordered) {
    if (msg.toLowerCase().includes(r.title.toLowerCase())) return r;
  }
  const ambiguous = new Set(['data', 'senior', 'software', 'product', 'business', 'digital', 'ux', 'ui']);
  for (const r of ordered) {
    for (const word of r.title.split(/\s+/)) {
      if (word.length < 4 || ambiguous.has(word.toLowerCase())) continue;
      if (msg.toLowerCase().includes(word.toLowerCase())) return r;
    }
  }
  return null;
}

function buildGreeting(recs) {
  const titles = recs.slice(0, 5).map((r) => r.title).join(', ');
  const more = recs.length > 5 ? ` and ${recs.length - 5} more` : '';
  return `Hi. I am answering from your current recommendations (${titles}${more}). Ask about salaries, skills, learning paths, or say which role you want to explore.`;
}

function buildSalarySummary(recs) {
  const rows = recs.slice(0, 8);
  const lines = rows.map((r) => `- ${r.title}: ${r.salary_range || 'Not specified in your data'}`);
  return `Salary ranges stored with your recommendations:\n${lines.join('\n')}\nVerify on current job postings for your country and city.`;
}

function buildSkillsSummary(recs) {
  const lines = recs.slice(0, 8).map((r) => {
    const skills = r.skills?.length ? r.skills.join(', ') : '(no skill list stored; try the description on the card)';
    return `- ${r.title}: ${skills}`;
  });
  return `Skills mentioned for your recommendations:\n${lines.join('\n')}`;
}

function buildDefaultSummary(recs) {
  const lines = recs.slice(0, 6).map((r) => {
    const bits = [];
    if (r.match_percentage != null) bits.push(`${r.match_percentage}% fit`);
    if (r.category) bits.push(r.category);
    if (r.salary_range) bits.push(r.salary_range);
    return `- ${r.title}: ${bits.join(' · ')}`;
  });
  return `Here is a quick recap of your recommendations. Ask about salary, skills, learning path, or name a specific role.\n${lines.join('\n')}`;
}

function buildSingleCareer(r) {
  const parts = [`${r.title}:`];
  if (r.description) parts.push(r.description);
  if (r.category) parts.push(`Category: ${r.category}.`);
  if (r.match_percentage != null) parts.push(`Estimated fit: ${r.match_percentage}%.`);
  if (r.salary_range) parts.push(`Salary range (from your data): ${r.salary_range}.`);
  if (r.growth) parts.push(`Growth outlook: ${r.growth}.`);
  if (r.skills?.length) parts.push(`Skills: ${r.skills.join(', ')}.`);
  return parts.join(' ');
}

export function buildChatReply(userMessage, recs) {
  const msg = (userMessage ?? '').trim();
  if (!recs?.length) {
    return 'You do not have career recommendations saved yet. Generate recommendations from this page (or complete your career survey), then you can ask about salaries, skills, learning paths, or how roles compare.';
  }

  const route = extractCurrentUserMessage(msg);
  const lower = route.toLowerCase();

  if (isGreeting(lower)) return buildGreeting(recs);
  if (containsAny(lower, ['salary', 'pay', 'wage', 'money', 'earn', 'income', 'compensation'])) return buildSalarySummary(recs);
  if (containsAny(lower, ['skill', 'skills', 'learn', 'need to know', 'requirement'])) return buildSkillsSummary(recs);
  if (containsAny(lower, ['saved', 'bookmark', 'favorite'])) {
    return 'You can save careers you like with the bookmark control on each card. Saved items stay on your list when you come back.';
  }

  const about = findCareerMention(route, recs);
  if (about) return buildSingleCareer(about);

  return buildDefaultSummary(recs);
}

export function buildTemplateCatalogReply(userMessage) {
  const now = new Date().toISOString();
  const fake = CAREERS.map(([title, desc, category], i) => ({
    id: -(i + 1),
    title,
    description: desc,
    category,
    match_percentage: 75 + i,
    salary_range: 'See market data',
    growth: '+10–15%',
    skills: ['Communication', 'Problem solving', 'Domain knowledge'],
    created_at: now,
  }));
  return buildChatReply(userMessage, fake);
}
