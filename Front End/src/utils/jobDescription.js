import DOMPurify from 'dompurify';

/** External job feeds often ship HTML descriptions; sanitize before rendering as HTML. */
export function jobDescriptionHtml(raw) {
  const s = raw == null ? '' : String(raw);
  return DOMPurify.sanitize(s);
}

const DEFAULT_SUMMARY_MAX_LEN = 220;

/** Plain-text preview for list cards (strips HTML safely). */
export function plainSummaryFromDescription(raw, maxLen = DEFAULT_SUMMARY_MAX_LEN) {
  const s = raw == null ? '' : String(raw);
  if (!s.trim()) return '';
  try {
    const doc = new DOMParser().parseFromString(jobDescriptionHtml(s), 'text/html');
    const text = doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen).trim()}…`;
  } catch {
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  }
}
