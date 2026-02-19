# Database Connection Guide: Frontend ↔ Backend ↔ Database

## Architecture Overview

```
┌─────────────┐         HTTP/REST API         ┌─────────────┐         SQL Connection         ┌─────────────┐
│   Frontend  │ ────────────────────────────> │   Backend   │ ────────────────────────────> │  Database   │
│   (React)  │ <──────────────────────────── │  (FastAPI)  │ <──────────────────────────── │  (SQL/DB)   │
└─────────────┘         JSON Responses        └─────────────┘         SQL Queries            └─────────────┘
```

**Important:** The frontend does NOT connect directly to the database. It connects to the backend API, which then connects to the database.

---

## Part 1: Backend ↔ Database Connection

### Step 1: Choose Your Database

Choose one of the following:
- **SQLite** (Default - Easy setup, good for development)
- **PostgreSQL** (Recommended for production)
- **MySQL/MariaDB** (Popular choice)
- **SQL Server** (Microsoft ecosystem)

### Step 2: Install Database Driver

Based on your choice, install the appropriate driver:

**For PostgreSQL:**
```bash
pip install psycopg2-binary
```

**For MySQL:**
```bash
pip install pymysql
# OR
pip install mysqlclient
```

**For SQL Server:**
```bash
pip install pyodbc
# OR
pip install pymssql
```

### Step 3: Create Database

**PostgreSQL:**
```sql
CREATE DATABASE career_recommendation;
```

**MySQL:**
```sql
CREATE DATABASE career_recommendation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**SQL Server:**
```sql
CREATE DATABASE career_recommendation;
```

### Step 4: Configure Connection String

Create a `.env` file in the `Back-End` directory:

```env
# PostgreSQL Example
DATABASE_URL=postgresql://username:password@localhost:5432/career_recommendation

# MySQL Example
# DATABASE_URL=mysql+pymysql://username:password@localhost:3306/career_recommendation

# SQL Server Example
# DATABASE_URL=mssql+pyodbc://username:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# SQLite (Default - No setup needed)
# DATABASE_URL=sqlite:///./career_recommendation.db

SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Step 5: Test Backend Connection

```bash
cd Back-End
python run.py
```

Check the console for connection status. The database tables will be created automatically.

---

## Part 2: Frontend ↔ Backend Connection

### Step 1: Create API Service in Frontend

Create a new file: `Front End/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';

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
      const error = await response.json();
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
```

### Step 2: Update AuthContext to Use API

Update `Front End/src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token by getting current user
      authAPI.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      // Auto login after signup
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Step 3: Update Login Component

Update `Front End/src/pages/Login.jsx`:

```javascript
// ... existing imports ...
import { authAPI } from '../services/api';

const Login = () => {
  // ... existing state ...
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Token is stored in AuthContext
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
};
```

### Step 4: Update SignUp Component

Update `Front End/src/pages/SignUp.jsx` similarly to use `authAPI.signup()`.

---

## Complete Connection Flow

### Example: User Login Flow

1. **User enters credentials** in Frontend (React)
2. **Frontend sends POST request** to `http://localhost:8000/api/auth/login-json`
3. **Backend receives request**, validates credentials against Database
4. **Backend queries Database** using SQL: `SELECT * FROM users WHERE email = ?`
5. **Database returns user data** to Backend
6. **Backend generates JWT token** and returns to Frontend
7. **Frontend stores token** in localStorage
8. **Frontend uses token** for subsequent API calls

### Example: Get Profile Flow

1. **Frontend sends GET request** with `Authorization: Bearer <token>`
2. **Backend validates token** and extracts user ID
3. **Backend queries Database**: `SELECT * FROM user_profiles WHERE user_id = ?`
4. **Database returns profile data**
5. **Backend sends JSON response** to Frontend
6. **Frontend displays profile** in UI

---

## Testing the Connection

### Test Backend → Database:

```bash
cd Back-End
python run.py
# Check console for "✅ Database connection successful!"
```

### Test Frontend → Backend:

1. Start Backend: `python run.py` (should be on port 8000)
2. Start Frontend: `npm run dev` (should be on port 5173)
3. Open browser: http://localhost:5173
4. Try to sign up or login
5. Check browser Network tab to see API calls

### Common Issues:

**CORS Error:**
- Backend CORS is configured in `main.py`
- Make sure frontend URL is in `allow_origins`

**Connection Refused:**
- Check if backend is running on port 8000
- Verify API_BASE_URL in frontend matches backend URL

**401 Unauthorized:**
- Check if token is being sent in headers
- Verify token is valid and not expired

---

## Production Considerations

1. **Use environment variables** for API URLs
2. **Enable HTTPS** for secure connections
3. **Use connection pooling** (already configured)
4. **Implement rate limiting** on backend
5. **Use environment-specific database URLs**
6. **Secure database credentials** (never commit to git)


