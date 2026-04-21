// Dev default: same-origin `/api` → Vite proxy (vite.config.js). Production: vite.config injects __BUILD_API_BASE__ from
// VITE_API_BASE_URL or BACKEND_API_BASE_URL (Vercel env). If empty, falls back to `/api` (same-origin rewrites only).
function buildTimeApiBase() {
  const b = __BUILD_API_BASE__;
  return b != null && String(b).trim() !== '' ? String(b).replace(/\/$/, '') : '';
}

function resolveApiBaseUrl() {
  const injected = buildTimeApiBase();
  if (injected) return injected;
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '');
  }
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

/** Full configured API base path (for UI hints). Same as requests use. */
export function getResolvedApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * True when this is a production build still using same-origin `/api` on a public host (e.g. Vercel).
 * Means VITE_API_BASE_URL / BACKEND_API_BASE_URL was not set at build time — requests hit the static host and 404.
 */
export function isDeployedWithoutExplicitApiBase() {
  if (!import.meta.env.PROD) return false;
  if (API_BASE_URL !== '/api') return false;
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname || '';
  if (h === 'localhost' || h === '127.0.0.1') return false;
  return /\.vercel\.app$/i.test(h) || h.includes('vercel.app');
}

function isLikelyNetworkFailure(error) {
  if (!error) return false;
  if (error instanceof TypeError) return true;
  const msg = String(error.message || '');
  return msg === 'Failed to fetch' || msg === 'Load failed' || msg === 'NetworkError when attempting to fetch resource.';
}

/** Turns opaque fetch failures into an actionable message (backend down, wrong port, or proxy target). */
export function formatApiNetworkError(error) {
  if (!isLikelyNetworkFailure(error)) return null;
  if (import.meta.env.DEV) {
    const origin = getBackendHintOrigin();
    return (
      `Cannot reach the API at ${origin}. ` +
      `Start the Back-End project (http profile uses port 8000 — see Properties/launchSettings.json). ` +
      `If it exits immediately, fix startup/database errors first. ` +
      `With Vite dev, requests go to /api and are proxied; set VITE_DEV_API_PROXY_TARGET in Front End/.env.development if your API uses another URL.`
    );
  }
  const base = API_BASE_URL;
  let display = base;
  if (!/^https?:\/\//i.test(base)) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      display = `${window.location.origin}${base.startsWith('/') ? base : `/${base}`}`;
    }
  }
  return (
    `Could not reach the API (${display}). ` +
    `Your .NET API must be deployed to a public URL (localhost is not reachable from the internet). ` +
    `In Vercel → Project → Settings → Environment Variables, set VITE_API_BASE_URL to that API base URL (include the /api prefix if your routes live under /api), then redeploy. ` +
    `Ensure the backend allows CORS for this site’s origin.`
  );
}

/** Shown in user-facing errors. Override with VITE_API_BASE_URL if your API uses another origin/port. */
export function getBackendHintOrigin() {
  const injected = buildTimeApiBase();
  if (injected && /^https?:\/\//i.test(injected)) {
    try {
      return new URL(injected.replace(/\/api\/?$/, '')).origin;
    } catch {
      /* fall through */
    }
  }
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw && /^https?:\/\//i.test(String(raw))) {
    try {
      return new URL(String(raw).replace(/\/api\/?$/, '')).origin;
    } catch {
      /* fall through */
    }
  }
  const proxy = import.meta.env.VITE_DEV_API_PROXY_TARGET;
  if (import.meta.env.DEV && proxy && /^https?:\/\//i.test(String(proxy))) {
    try {
      return new URL(String(proxy).replace(/\/$/, '')).origin;
    } catch {
      /* fall through */
    }
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://your-deployed-api.example.com';
}

function parseApiErrorJson(body) {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail.trim();
  if (typeof body.title === 'string' && body.title.trim()) {
    const t = body.title.trim();
    if (t !== 'One or more validation errors occurred.') return t;
  }
  if (body.errors && typeof body.errors === 'object') {
    const parts = [];
    for (const v of Object.values(body.errors)) {
      if (Array.isArray(v)) parts.push(...v.map(String));
      else if (v != null) parts.push(String(v));
    }
    const s = parts.join(' ').trim();
    if (s) return s;
  }
  return null;
}

// Helper function for API calls
/** Exported so AuthContext can ignore corrupted token values (e.g. literal "undefined" from a past bug). */
export function getStoredAccessToken() {
  const raw = localStorage.getItem('access_token');
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return raw;
}

/** Set when career survey or profile is saved; Recommendations page calls POST /generate then clears this. */
export const CAREER_PROFILE_NEEDS_REC_REFRESH_KEY = 'career_profile_needs_rec_refresh';

export function markCareerProfileNeedsRecommendationRefresh() {
  try {
    localStorage.setItem(CAREER_PROFILE_NEEDS_REC_REFRESH_KEY, '1');
  } catch {
    /* private mode / quota */
  }
}

export function hasCareerProfileNeedsRecommendationRefresh() {
  try {
    return localStorage.getItem(CAREER_PROFILE_NEEDS_REC_REFRESH_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearCareerProfileNeedsRecommendationRefresh() {
  try {
    localStorage.removeItem(CAREER_PROFILE_NEEDS_REC_REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

async function apiCall(endpoint, options = {}) {
  const token = getStoredAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const text = await response.text();
      let body = {};
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = {};
        }
      }
      const fromBody = parseApiErrorJson(body);
      const fallback = `${response.status} ${response.statusText || ''}`.trim();
      const err = new Error(fromBody || fallback || 'Request failed');
      err.status = response.status;
      throw err;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    const networkMsg = formatApiNetworkError(error);
    if (networkMsg) {
      const wrapped = new Error(networkMsg);
      wrapped.cause = error;
      throw wrapped;
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  signup: (data) => apiCall('/auth/signup', {
    method: 'POST',
    body: data,
  }),
  
  login: (data) => apiCall('/auth/login-json', {
    method: 'POST',
    body: data,
  }),
  
  getCurrentUser: () => apiCall('/auth/me'),
};

// Profile API
export const profileAPI = {
  get: () => apiCall('/profile'),
  create: (data) => apiCall('/profile', {
    method: 'POST',
    body: data,
  }),
  update: (data) => apiCall('/profile', {
    method: 'PUT',
    body: data,
  }),
};

// Assessment API
export const assessmentAPI = {
  get: () => apiCall('/assessment'),
  create: (data) => apiCall('/assessment', {
    method: 'POST',
    body: data,
  }),
};

// Recommendations API
export const recommendationsAPI = {
  /** Whether backend has an API key (or Local) so Gemini/ChatGPT/etc. can run — no secrets returned. */
  getAiSetupStatus: () => apiCall('/recommendations/ai-setup-status'),
  generate: () => apiCall('/recommendations/generate', {
    method: 'POST',
  }),
  getAll: () => apiCall('/recommendations'),
  save: (id, saved) => apiCall(`/recommendations/${id}/save?saved=${saved}`, {
    method: 'PUT',
  }),
  chat: (message, conversationHistory = []) =>
    apiCall('/recommendations/chat', {
      method: 'POST',
      body: {
        message,
        // Backend accepts camelCase or snake_case; snake_case matches ConfigureHttpJsonOptions / ChatRequest
        conversation_history: (conversationHistory || [])
          .filter((m) => m && (m.role != null || m.content != null))
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      },
    }),
};

// Jobs API
export const jobsAPI = {
  search: (filters) => apiCall('/jobs/search', {
    method: 'POST',
    body: filters,
  }),
  /** Distinct categories from JobListings plus All — Job Search dropdown. */
  getCategories: () => apiCall('/jobs/categories', { cache: 'no-store' }),
  /** cache: no-store avoids stale GET lists when switching filters in dev tools / aggressive HTTP caches */
  getTop: (category, limit = 10, country = '') => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    const cat = category != null ? String(category).trim() : '';
    if (cat !== '') params.set('category', cat);
    const c = country != null ? String(country).trim() : '';
    if (c !== '') params.set('country', c);
    return apiCall(`/jobs/top?${params.toString()}`, { cache: 'no-store' });
  },
  getSaved: () => apiCall('/jobs/saved'),
  save: (jobData) => apiCall('/jobs/save', {
    method: 'POST',
    body: jobData,
  }),
  /** GET /jobs/role-search — Industry Skill Gap role picker; empty q returns latest listings. */
  roleSearch: (q, limit = 25) => {
    const params = new URLSearchParams();
    const trimmed = q != null ? String(q).trim() : '';
    if (trimmed) params.set('q', trimmed);
    if (limit != null) params.set('limit', String(limit));
    const qs = params.toString();
    return apiCall(`/jobs/role-search${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  },
  /** GET /jobs/skills-by-level — common posting skills aggregated by inferred Entry / Mid / Senior from titles. */
  skillsByLevel: (minCount = 1, maxPerLevel = 80) => {
    const params = new URLSearchParams();
    params.set('minCount', String(minCount));
    params.set('maxPerLevel', String(maxPerLevel));
    return apiCall(`/jobs/skills-by-level?${params.toString()}`, { cache: 'no-store' });
  },
  /** GET /jobs/title-suggestions — distinct titles for Job Search autocomplete (scoped by category/country). */
  titleSuggestions: (q, category = '', country = '', limit = 15) => {
    const params = new URLSearchParams();
    const trimmed = q != null ? String(q).trim() : '';
    if (trimmed) params.set('q', trimmed);
    const cat = category != null ? String(category).trim() : '';
    if (cat && cat !== 'All') params.set('category', cat);
    const c = country != null ? String(country).trim() : '';
    if (c) params.set('country', c);
    params.set('limit', String(limit));
    return apiCall(`/jobs/title-suggestions?${params.toString()}`, { cache: 'no-store' });
  },
  /** GET /jobs/role-insights — aggregated salary, growth, skills + industry education/certs for matching title. */
  roleInsights: (title, category = '', country = '') => {
    const params = new URLSearchParams();
    params.set('title', String(title).trim());
    const cat = category != null ? String(category).trim() : '';
    if (cat && cat !== 'All') params.set('category', cat);
    const c = country != null ? String(country).trim() : '';
    if (c) params.set('country', c);
    return apiCall(`/jobs/role-insights?${params.toString()}`, { cache: 'no-store' });
  },
};

// Colab-trained interest model (Python FastAPI) — proxied through .NET; see ml/HOWTO-USE-MODEL.md
export const mlAPI = {
  predictInterest: (body) =>
    apiCall('/ml/predict-interest', {
      method: 'POST',
      body: {
        interests: body.interests ?? '',
        skills: body.skills ?? '',
        certificateCourseTitle: body.certificateCourseTitle ?? body.certificate_course_title ?? '',
        ugCourse: body.ugCourse ?? body.ug_course ?? '',
        ugSpecialization: body.ugSpecialization ?? body.ug_specialization ?? '',
        topK: body.topK ?? body.top_k ?? 3,
      },
    }),
};

// Skill Gap API
export const skillGapAPI = {
  getAll: (industry) => apiCall(`/skill-gap${industry ? `?industry=${encodeURIComponent(industry)}` : ''}`),
};

// Market Trends API
export const marketTrendsAPI = {
  get: () => apiCall('/market-trends'),
};




