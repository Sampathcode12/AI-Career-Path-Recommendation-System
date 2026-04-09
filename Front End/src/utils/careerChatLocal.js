/**
 * Rule-based Career Advisor replies using only the careers already shown on the page.
 * Used when POST /recommendations/chat fails (proxy 500, API down, etc.).
 */
const AMBIGUOUS_WORDS = new Set([
  'data',
  'senior',
  'junior',
  'lead',
  'staff',
  'software',
  'web',
  'cloud',
  'digital',
  'product',
  'business',
  'machine',
  'user',
  'full',
  'front',
  'back',
  'mobile',
  'ux',
  'ui',
  'it',
  'ai',
]);

function containsAny(hay, needles) {
  const h = hay.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function findCareerByMessage(msg, careers) {
  if (!msg?.trim() || !careers?.length) return null;
  const userMsg = msg.trim();
  const ordered = [...careers]
    .filter((c) => c?.title)
    .sort((a, b) => (b.title?.length || 0) - (a.title?.length || 0));

  for (const c of ordered) {
    if (userMsg.toLowerCase().includes(c.title.toLowerCase())) return c;
  }
  for (const c of ordered) {
    const words = c.title.split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (w.length < 4) continue;
      if (AMBIGUOUS_WORDS.has(w.toLowerCase())) continue;
      if (userMsg.toLowerCase().includes(w.toLowerCase())) return c;
    }
  }
  return null;
}

function formatCareerCard(c) {
  const parts = [`${c.title}:`];
  if (c.description) parts.push(c.description);
  if (c.match != null) parts.push(`Estimated fit: ${c.match}%.`);
  if (c.salary && c.salary !== 'N/A') parts.push(`Salary range (from your list): ${c.salary}.`);
  if (c.growth) parts.push(`Growth outlook: ${c.growth}.`);
  if (Array.isArray(c.skills) && c.skills.length)
    parts.push(`Skills: ${c.skills.join(', ')}.`);
  if (Array.isArray(c.learningPath) && c.learningPath.length) {
    const steps = c.learningPath
      .map((s) => `${s.title}${s.duration ? ` (${s.duration})` : ''}`)
      .join('; ');
    parts.push(`Learning path: ${steps}.`);
  }
  return parts.join(' ');
}

function extractLastUserLine(history) {
  if (!Array.isArray(history) || !history.length) return '';
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m?.role === 'user' && typeof m.content === 'string' && m.content.trim()) {
      return m.content.trim();
    }
  }
  return '';
}

/**
 * @param {string} message
 * @param {Array<{ title: string, description?: string, match?: number, salary?: string, growth?: string, skills?: string[], learningPath?: Array<{ title: string, duration?: string }> }>} careers
 * @param {Array<{ role: string, content: string }>} historySnapshot — prior turns (same as sent to API)
 */
export function buildLocalCareerChatReply(message, careers, historySnapshot = []) {
  const msg = (typeof message === 'string' ? message : '').trim();
  if (!msg) return null;
  if (!careers?.length) return null;

  const lower = msg.toLowerCase();
  const combined =
    `${extractLastUserLine(historySnapshot)} ${msg}`.trim();

  if (containsAny(lower, ['hi', 'hello', 'hey']) && lower.length < 40) {
    const titles = careers
      .slice(0, 5)
      .map((c) => c.title)
      .join(', ');
    const more = careers.length > 5 ? ` and ${careers.length - 5} more` : '';
    return `Hi. I’m answering from the careers on this page (${titles}${more}). Ask about a role by name, salaries, or skills.`;
  }

  if (
    containsAny(lower, ['salary', 'pay', 'wage', 'income', 'compensation', 'earn', 'money'])
  ) {
    const lines = careers.slice(0, 8).map((c) => {
      const sal = c.salary && c.salary !== 'N/A' ? c.salary : 'Not specified on the card';
      return `- ${c.title}: ${sal}`;
    });
    return (
      'Salary info from your current list (verify on local job sites):\n' + lines.join('\n')
    );
  }

  if (containsAny(lower, ['skill', 'learn', 'requirement'])) {
    const lines = careers.slice(0, 8).map((c) => {
      const sk = Array.isArray(c.skills) && c.skills.length ? c.skills.join(', ') : '(see description on the card)';
      return `- ${c.title}: ${sk}`;
    });
    return 'Skills from your list:\n' + lines.join('\n');
  }

  const vague =
    containsAny(lower, [
      'tell me more',
      'more about',
      'more detail',
      'go on',
      'continue',
      'what else',
      'elaborate',
    ]) || lower === 'more';
  const about = findCareerByMessage(msg, careers) || (vague ? findCareerByMessage(combined, careers) : null);
  if (about) return formatCareerCard(about);

  const fallbackLines = careers.slice(0, 6).map((c) => {
    const bits = [];
    if (c.match != null) bits.push(`${c.match}% fit`);
    if (c.salary && c.salary !== 'N/A') bits.push(c.salary);
    return `- ${c.title}${bits.length ? `: ${bits.join(' · ')}` : ''}`;
  });
  return (
    'Here’s a quick recap of the careers on this page. Name a role for more detail.\n' +
    fallbackLines.join('\n')
  );
}
