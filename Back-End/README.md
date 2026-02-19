# AI Career Path Recommendation System - Backend API

FastAPI backend for the AI Career Path Recommendation System.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **User Management**: User registration, login, and profile management
- **Skill Assessment**: Multi-step skill assessment system
- **Career Recommendations**: AI-powered career path recommendations
- **Job Search**: Job search with filtering capabilities
- **Market Trends**: Real-time market trends and insights
- **Database**: SQLAlchemy ORM with SQLite (can be switched to PostgreSQL)

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLite (default) / PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)

## Installation

1. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables** (optional):
Create a `.env` file in the Back-End directory:
```
DATABASE_URL=sqlite:///./career_recommendation.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Running the Server

### Development Mode:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (form data)
- `POST /api/auth/login-json` - Login (JSON body)
- `GET /api/auth/me` - Get current user info

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile

### Assessment
- `POST /api/assessment` - Create/update assessment
- `GET /api/assessment` - Get user assessment

### Recommendations
- `POST /api/recommendations/generate` - Generate recommendations
- `GET /api/recommendations` - Get user recommendations
- `PUT /api/recommendations/{id}/save` - Save/unsave recommendation

### Jobs
- `POST /api/jobs/search` - Search jobs
- `GET /api/jobs/saved` - Get saved jobs
- `POST /api/jobs/save` - Save a job

### Market Trends
- `GET /api/market-trends` - Get market trends data

## Database

The database is automatically created on first run. The default database is SQLite (`career_recommendation.db`).

To use PostgreSQL, update the `DATABASE_URL` in `config.py` or `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

## Example API Calls

### Sign Up
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET "http://localhost:8000/api/profile" \
  -H "Authorization: Bearer <your-token>"
```

## Project Structure

```
Back-End/
├── main.py              # FastAPI application and routes
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic schemas for validation
├── database.py          # Database configuration
├── auth.py              # Authentication utilities
├── services.py          # Business logic services
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Development

### Adding New Endpoints

1. Define the schema in `schemas.py`
2. Add the route in `main.py`
3. Implement business logic in `services.py` if needed
4. Update this README

### Database Migrations

For production, consider using Alembic for database migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Security Notes

- Change the `SECRET_KEY` in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for production
- Add input validation and sanitization
- Use PostgreSQL for production databases

## License

This project is part of a university final project.


