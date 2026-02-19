# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd Back-End
pip install -r requirements.txt
```

## Step 2: Run the Server

### Option 1: Using Python script
```bash
python run.py
```

### Option 2: Using Uvicorn directly
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Step 3: Access the API

- **API Base URL**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc

## Step 4: Test the API

### Sign Up a New User
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123456"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Copy the `access_token` from the response.

### Get Profile (with token)
```bash
curl -X GET "http://localhost:8000/api/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Frontend Integration

The backend is configured to accept requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (React default)
- http://127.0.0.1:5173

To connect your frontend, update the API base URL in your frontend code to:
```
http://localhost:8000
```

## Database

The database file (`career_recommendation.db`) will be automatically created on first run.

To reset the database, simply delete the `.db` file and restart the server.

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it in `run.py` or use:
```bash
uvicorn main:app --reload --port 8001
```

### Import Errors
Make sure you're in the `Back-End` directory and have activated your virtual environment.

### CORS Errors
If you get CORS errors, check that your frontend URL is in the `allow_origins` list in `main.py`.


