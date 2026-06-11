/** Keyword cluster inference when Python ML is unavailable on Vercel. */
export function inferClusterFromBody(blob) {
  const lower = String(blob ?? '').toLowerCase();
  if (lower.trim().length < 3) return null;
  if (/legal|litigation|attorney|lawyer|paralegal|counsel|compliance|regulatory|court|law firm|bar exam|juris|\blaw\b/.test(lower)) return 'law';
  if (/nurse|nursing|clinical|healthcare|hospital|patient care|medical|pharma/.test(lower)) return 'healthcare';
  if (/teach|education|curriculum|classroom|k-12|academic/.test(lower)) return 'education';
  if (/human resource|recruit|talent acquisition|\bhr\b/.test(lower)) return 'human_resources';
  if (/product manager|product owner|product roadmap/.test(lower)) return 'product';
  if (/\bux\b|\bui\b|user experience|figma|design/.test(lower) && !/instructional/.test(lower)) return 'design';
  if (/market|brand|social media|seo|campaign|content/.test(lower) && !/legal/.test(lower)) return 'marketing';
  if (/data science|machine learning|statistics|python.*data/.test(lower)) return 'data_science';
  if (/software|developer|programming|devops|full stack|backend|frontend/.test(lower)) return 'technology';
  if (/business analyst|business analysis/.test(lower)) return 'business';
  if (/finance|accounting|investment|financial/.test(lower)) return 'finance';
  return 'technology';
}
