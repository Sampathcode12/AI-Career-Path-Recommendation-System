const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'API request failed' }));
      throw new Error(error.detail || 'API request failed');
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
  generate: () => apiCall('/recommendations/generate', {
    method: 'POST',
  }),
  getAll: () => apiCall('/recommendations'),
  save: (id, saved) => apiCall(`/recommendations/${id}/save?saved=${saved}`, {
    method: 'PUT',
  }),
};

// Jobs API
export const jobsAPI = {
  search: (filters) => apiCall('/jobs/search', {
    method: 'POST',
    body: filters,
  }),
  getSaved: () => apiCall('/jobs/saved'),
  save: (jobData) => apiCall('/jobs/save', {
    method: 'POST',
    body: jobData,
  }),
};

// Market Trends API
export const marketTrendsAPI = {
  get: () => apiCall('/market-trends'),
};




