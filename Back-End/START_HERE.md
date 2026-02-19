# 🚀 START HERE - Complete Setup Guide

## Quick Start (3 Steps)

### Step 1: Create Database

**SQLite (Easiest - No Installation):**
```bash
# No setup needed! Database created automatically
```

**PostgreSQL:**
```sql
CREATE DATABASE career_recommendation;
```

**MySQL:**
```sql
CREATE DATABASE career_recommendation;
```

**SQL Server:**
```sql
CREATE DATABASE career_recommendation;
```

---

### Step 2: Set Connection String

Create `.env` file in `Back-End` folder:

```env
# For PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/career_recommendation

# For MySQL
# DATABASE_URL=mysql+pymysql://username:password@localhost:3306/career_recommendation

# For SQL Server
# DATABASE_URL=mssql+pyodbc://username:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# For SQLite (Default)
# DATABASE_URL=sqlite:///./career_recommendation.db

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

### Step 3: Run Backend

```bash
cd Back-End
pip install -r requirements.txt
python run.py
```

**That's it!** Tables are created automatically. You should see:
```
✅ Database connection successful!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## How It All Connects

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  - User enters email/password                               │
│  - Calls: POST /api/auth/signup                            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP Request (JSON)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  1. Receives request                                        │
│  2. Reads connection string from .env                       │
│  3. Connects to database                                    │
│  4. Queries/Inserts data                                    │
│  5. Returns response                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │ SQL Queries
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQL)                           │
│  - Stores user data                                         │
│  - Returns query results                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Flow Explanation

### 1. Connection String Setup

**`.env` file:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/career_recommendation
```

**`config.py` reads it:**
```python
settings.DATABASE_URL  # Gets the connection string
```

**`database.py` connects:**
```python
engine = create_engine(settings.DATABASE_URL)  # Connects to database
```

---

### 2. Signup Flow

**Frontend sends:**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Backend code (`main.py`):**
```python
@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # db is connected to your database
    
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    
    # Hash password
    hashed = get_password_hash(user_data.password)
    
    # Create user
    new_user = User(email=user_data.email, name=user_data.name, 
                    hashed_password=hashed)
    
    # Save to database
    db.add(new_user)
    db.commit()  # Actually saves to database
    
    return new_user
```

**Database receives:**
```sql
INSERT INTO users (email, name, hashed_password) 
VALUES ('user@example.com', 'John Doe', '$2b$12$...');
```

---

### 3. Login Flow

**Frontend sends:**
```json
POST /api/auth/login-json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend code (`main.py`):**
```python
@app.post("/api/auth/login-json")
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user in database
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        return error("Wrong password")
    
    # Create token
    token = create_access_token({"sub": user.email})
    
    return {"access_token": token, "user": user}
```

**Database query:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
-- Then verify password hash
```

---

## Test It!

### 1. Start Backend
```bash
cd Back-End
python run.py
```

### 2. Test Signup
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"test123"}'
```

### 3. Test Login
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 4. Check Database
```sql
SELECT * FROM users;
-- You should see your test user!
```

---

## File Structure

```
Back-End/
├── .env                    # Connection string (YOU CREATE THIS)
├── config.py              # Reads connection string
├── database.py            # Connects to database
├── models.py             # Database table definitions
├── schemas.py            # Request/response structures
├── auth.py               # Password hashing & JWT
├── main.py              # API routes (signup/login)
└── requirements.txt     # Dependencies
```

---

## Need More Details?

- **Database Creation:** See `DATABASE_CREATION_GUIDE.md`
- **Code Connection:** See `CODE_CONNECTION_GUIDE.md`
- **Signup/Login:** See `SIGNUP_LOGIN_EXPLAINED.md`
- **Complete Tutorial:** See `COMPLETE_TUTORIAL.md`
- **Connection Strings:** See `connection_strings.md`

---

## Common Issues

**"Connection refused"**
→ Check if database server is running

**"Database does not exist"**
→ Create database first (see Step 1)

**"Driver not found"**
→ Install driver: `pip install psycopg2-binary` (or pymysql, pyodbc)

**"Authentication failed"**
→ Check username/password in connection string

---

## You're Ready!

1. ✅ Database created
2. ✅ Connection string set in `.env`
3. ✅ Backend running
4. ✅ Signup/Login working!

Now connect your frontend and start building! 🎉


