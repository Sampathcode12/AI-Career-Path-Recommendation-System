// Dev default: same-origin `/api` → Vite proxy (vite.config.js → VITE_DEV_API_PROXY_TARGET or http://localhost:8000).
// That matches launchSettings and avoids mixed direct/proxy setups. Override with VITE_API_BASE_URL when needed.
// Production default: full URL (set VITE_API_BASE_URL in deploy env if the API is elsewhere).
function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '');
  }
  return import.meta.env.DEV ? '/api' : 'http://localhost:8000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

/** Shown in user-facing errors. Override with VITE_API_BASE_URL if your API uses another origin/port. */
export function getBackendHintOrigin() {
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
  return 'http://localhost:8000';
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
  getTop: (category, limit = 10) => apiCall(`/jobs/top?category=${encodeURIComponent(category || '')}&limit=${limit}`),
  getSaved: () => apiCall('/jobs/saved'),
  save: (jobData) => apiCall('/jobs/save', {
    method: 'POST',
    body: jobData,
  }),
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




