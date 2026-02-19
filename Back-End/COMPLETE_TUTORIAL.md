# Complete Tutorial: Database Setup + Signup/Login Backend

## Part 1: Create Database

### Step 1: Choose Your Database

**Easiest Option - SQLite (No Installation):**
- Works immediately, no setup needed
- Good for development/testing

**Production Options:**
- PostgreSQL (Recommended)
- MySQL
- SQL Server

---

### Step 2: Create Database (Choose One)

#### Option A: SQLite (Easiest)
**No installation needed!** Database file will be created automatically.

#### Option B: PostgreSQL
```sql
-- Open PostgreSQL (psql or pgAdmin)
CREATE DATABASE career_recommendation;
```

#### Option C: MySQL
```sql
-- Open MySQL command line
CREATE DATABASE career_recommendation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Option D: SQL Server
```sql
-- Open SQL Server Management Studio
CREATE DATABASE career_recommendation;
```

---

### Step 3: Set Connection String

Create `.env` file in `Back-End` folder:

**For SQLite:**
```env
DATABASE_URL=sqlite:///./career_recommendation.db
```

**For PostgreSQL:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/career_recommendation
```

**For MySQL:**
```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/career_recommendation
```

**For SQL Server:**
```env
DATABASE_URL=mssql+pyodbc://username:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

## Part 2: Code-Level Database Connection

### How It Works:

```
.env file → config.py → database.py → main.py (API routes)
```

### Step 1: `.env` File (Connection String)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/career_recommendation
```

### Step 2: `config.py` (Reads Connection String)
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./career_recommendation.db"  # Default
    
    class Config:
        env_file = ".env"  # Reads from .env file

settings = Settings()  # Now settings.DATABASE_URL has your connection string
```

### Step 3: `database.py` (Creates Connection)
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings

# Create engine - This connects to your database
engine = create_engine(settings.DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provides database connection
    finally:
        db.close()  # Closes connection when done
```

### Step 4: `main.py` (Uses Database in API)
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # 'db' is your database connection
    # You can now query/insert data
    
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    
    # Create new user
    new_user = User(email=user_data.email, name=user_data.name)
    db.add(new_user)
    db.commit()  # Save to database
    
    return new_user
```

---

## Part 3: Signup & Login Backend Implementation

### File Structure:
```
Back-End/
├── models.py          # Database table definitions
├── schemas.py         # Request/response data structures
├── auth.py            # Password hashing & JWT tokens
├── database.py        # Database connection
├── main.py           # API routes (signup/login)
└── config.py         # Configuration
```

---

### Step 1: Database Model (`models.py`)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
```

**What it does:**
- Defines the `users` table structure
- Creates columns: id, email, name, password, etc.
- Tables are created automatically when backend starts

---

### Step 2: Request/Response Schemas (`schemas.py`)

```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
```

**What it does:**
- `UserCreate`: Data structure for signup request
- `UserLogin`: Data structure for login request
- `UserResponse`: Data structure for API response
- `Token`: JWT token response

---

### Step 3: Authentication Functions (`auth.py`)

```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def authenticate_user(db: Session, email: str, password: str):
    """Check if email/password is correct"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
```

**What it does:**
- Hashes passwords securely (bcrypt)
- Verifies passwords during login
- Creates JWT tokens for authentication
- Authenticates users

---

### Step 4: Signup Endpoint (`main.py`)

```python
@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    User Signup Flow:
    1. Check if email already exists
    2. Hash the password
    3. Create new user in database
    4. Return created user
    """
    
    # Step 1: Check if user already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Step 2: Hash password (never store plain passwords!)
    hashed_password = get_password_hash(user_data.password)
    
    # Step 3: Create new user object
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    # Step 4: Add to database
    db.add(db_user)
    db.commit()  # Save to database
    db.refresh(db_user)  # Get auto-generated ID
    
    # Step 5: Return created user
    return db_user
```

**Flow:**
1. Frontend sends: `{email, name, password}`
2. Backend checks if email exists
3. Backend hashes password
4. Backend saves user to database
5. Backend returns user data

---

### Step 5: Login Endpoint (`main.py`)

```python
@app.post("/api/auth/login-json", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User Login Flow:
    1. Verify email and password
    2. Create JWT token
    3. Return token and user info
    """
    
    # Step 1: Authenticate user (check email/password)
    user = authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # Step 2: Create JWT token
    access_token = create_access_token(data={"sub": user.email})
    
    # Step 3: Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
```

**Flow:**
1. Frontend sends: `{email, password}`
2. Backend verifies email/password against database
3. Backend creates JWT token
4. Backend returns token + user info
5. Frontend stores token for future requests

---

## Part 4: Complete Setup Steps

### Step 1: Install Dependencies
```bash
cd Back-End
pip install -r requirements.txt
```

### Step 2: Create Database
```sql
-- Choose your database and run:
CREATE DATABASE career_recommendation;
```

### Step 3: Set Connection String
Create `.env` file:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/career_recommendation
SECRET_KEY=your-secret-key-here
```

### Step 4: Run Backend
```bash
python run.py
```

**Tables are created automatically!** You'll see:
```
✅ Database connection successful!
```

### Step 5: Test Signup
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123456"
  }'
```

### Step 6: Test Login
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

---

## Part 5: How Frontend Connects

### Frontend → Backend Connection

**1. API Service (`Front End/src/services/api.js`):**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';

export const authAPI = {
  signup: (data) => fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  login: (data) => fetch(`${API_BASE_URL}/auth/login-json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};
```

**2. Use in React Component:**
```javascript
import { authAPI } from '../services/api';

const handleSignup = async () => {
  const response = await authAPI.signup({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'password123'
  });
  console.log('User created:', response);
};
```

---

## Complete Flow Diagram

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ HTTP POST /api/auth/signup
       │ {email, name, password}
       ▼
┌─────────────┐
│   Backend   │
│  (FastAPI)  │
└──────┬──────┘
       │ 1. Check if email exists
       │ 2. Hash password
       │ 3. INSERT INTO users
       ▼
┌─────────────┐
│  Database   │
│   (SQL)     │
└─────────────┘
       │
       │ User saved
       ▼
┌─────────────┐
│   Backend   │ Returns user data
└──────┬──────┘
       │ JSON Response
       ▼
┌─────────────┐
│   Frontend  │ Displays success
└─────────────┘
```

---

## Summary

1. **Create Database:** Run SQL command to create database
2. **Set Connection String:** Put in `.env` file
3. **Backend Connects:** `database.py` reads connection string and connects
4. **Signup Works:** Backend saves user to database
5. **Login Works:** Backend verifies password and returns token
6. **Frontend Connects:** Uses API service to call backend endpoints

Everything is already implemented! Just:
1. Create database
2. Set connection string in `.env`
3. Run backend
4. Test with frontend!


