# Code-Level Database Connection Guide

## How Database Connection Works in Code

### 1. Configuration File (`config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Connection string - Set this in .env file
    DATABASE_URL: str = "sqlite:///./career_recommendation.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**What it does:**
- Reads connection string from environment variables
- Provides default value (SQLite) if not set
- Loads from `.env` file automatically

---

### 2. Database Connection File (`database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings

# Create engine - This is the connection to database
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,  # Verify connection before using
    pool_recycle=3600     # Recycle connections after 1 hour
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function - Used in API routes
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide database session
    finally:
        db.close()  # Close session when done
```

**What it does:**
- Creates connection pool to database
- Manages database sessions
- Provides `get_db()` function for API routes

---

### 3. Using Database in API Routes (`main.py`)

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # 'db' is the database session
    # Use it to query/insert data
    
    # Example: Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    
    # Example: Create new user
    new_user = User(email=user_data.email, name=user_data.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
```

**What it does:**
- `Depends(get_db)` injects database session
- `db.query()` - Query data
- `db.add()` - Add new record
- `db.commit()` - Save changes
- `db.refresh()` - Refresh object from database

---

## Complete Connection Flow

### Step 1: Set Connection String

**Create `.env` file:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/career_recommendation
```

### Step 2: Code Reads Connection String

```python
# config.py reads from .env
settings.DATABASE_URL  # Gets: postgresql://username:password@localhost:5432/career_recommendation
```

### Step 3: Create Database Engine

```python
# database.py creates engine
engine = create_engine(settings.DATABASE_URL)
# This establishes connection pool to database
```

### Step 4: Use in API Routes

```python
# main.py uses database
def signup(db: Session = Depends(get_db)):
    # db is connected to your database
    # You can now query/insert data
    user = db.query(User).filter(User.email == email).first()
```

---

## Example: Complete Signup Flow with Database

```python
@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists (Query database)
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # 3. Create new user object
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    # 4. Add to database session
    db.add(new_user)
    
    # 5. Commit to database (Actually save)
    db.commit()
    
    # 6. Refresh to get ID and other auto-generated fields
    db.refresh(new_user)
    
    # 7. Return created user
    return new_user
```

---

## Database Operations Cheat Sheet

### Query (SELECT)
```python
# Get all users
users = db.query(User).all()

# Get user by email
user = db.query(User).filter(User.email == email).first()

# Get user by ID
user = db.query(User).filter(User.id == user_id).first()

# Count users
count = db.query(User).count()
```

### Insert (CREATE)
```python
# Create new user
new_user = User(email="test@example.com", name="Test")
db.add(new_user)
db.commit()
db.refresh(new_user)
```

### Update
```python
# Update user
user = db.query(User).filter(User.id == user_id).first()
user.name = "New Name"
db.commit()
```

### Delete
```python
# Delete user
user = db.query(User).filter(User.id == user_id).first()
db.delete(user)
db.commit()
```

---

## Testing Database Connection

### Method 1: Test in Code
```python
from database import test_connection

if test_connection():
    print("✅ Database connected!")
else:
    print("❌ Database connection failed!")
```

### Method 2: Test via API
```bash
curl http://localhost:8000/api/database/test
```

### Method 3: Test in Python Shell
```python
from database import engine

# Test connection
with engine.connect() as connection:
    result = connection.execute("SELECT 1")
    print("Connected!", result.fetchone())
```

---

## Common Connection Issues

### Issue: "Connection refused"
**Solution:** Check if database server is running
```bash
# PostgreSQL
sudo systemctl status postgresql

# MySQL
sudo systemctl status mysql
```

### Issue: "Authentication failed"
**Solution:** Check username/password in connection string
```python
# Wrong
DATABASE_URL = "postgresql://wrong_user:wrong_pass@localhost:5432/db"

# Correct
DATABASE_URL = "postgresql://correct_user:correct_pass@localhost:5432/db"
```

### Issue: "Database does not exist"
**Solution:** Create database first (see DATABASE_CREATION_GUIDE.md)

### Issue: "Driver not found"
**Solution:** Install database driver
```bash
pip install psycopg2-binary  # PostgreSQL
pip install pymysql          # MySQL
pip install pyodbc           # SQL Server
```

---

## Connection String Format

```
database_type://username:password@host:port/database_name
```

**Example:**
```
postgresql://myuser:mypass@localhost:5432/career_recommendation
         ↑        ↑     ↑      ↑       ↑            ↑
         |        |     |      |       |            └─ Database name
         |        |     |      |       └─ Port (5432 for PostgreSQL)
         |        |     |      └─ Host (localhost)
         |        |     └─ Password
         |        └─ Username
         └─ Database type
```


