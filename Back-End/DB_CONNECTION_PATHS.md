# Database Connection Paths - Where to Find & Configure

## 📍 Connection String Locations

### **Primary Location: `.env` File (Recommended)**

**Path:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**How to create:**
1. Navigate to: `Back-End` folder
2. Create a new file named: `.env`
3. Add your connection string:

```env
DATABASE_URL=mssql+pyodbc://sa:YourPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**✅ This is the BEST place to put your connection string!**

---

### **Secondary Location: `config.py` File**

**Path:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\config.py
```

**Current location in code:**
- Line 9-18: Database connection string configuration
- Line 9: Default connection string (SQL Server example)

**To modify:**
```python
# In config.py, line 9:
DATABASE_URL: str = "mssql+pyodbc://sa:YourPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server"
```

**Note:** `.env` file takes priority over `config.py` default value.

---

## 🔍 How Connection String is Read

### **Flow:**
```
.env file → config.py → database.py → main.py
```

### **Step 1: `config.py` (Line 1-32)**
**Path:** `Back-End\config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "..."  # Default value
    
    class Config:
        env_file = ".env"  # Reads from .env file first

settings = Settings()  # Creates settings object
```

**What it does:**
- First tries to read from `.env` file
- If `.env` doesn't exist, uses default value
- Makes `settings.DATABASE_URL` available

---

### **Step 2: `database.py` (Line 1-83)**
**Path:** `Back-End\database.py`

```python
from config import settings  # Imports connection string

engine = create_engine(settings.DATABASE_URL)  # Uses connection string
```

**What it does:**
- Gets connection string from `config.py`
- Creates database engine
- Establishes connection pool

---

### **Step 3: `main.py` (Line 8)**
**Path:** `Back-End\main.py`

```python
from database import get_db  # Gets database connection

@app.post("/api/auth/signup")
def signup(db: Session = Depends(get_db)):
    # 'db' is your database connection
    # Use it to query/insert data
```

**What it does:**
- Uses database connection in API routes
- Provides `db` session for database operations

---

## 📂 Complete File Structure

```
C:\Project\AI-Career-Path-Recommendation-System\
└── Back-End\
    ├── .env                          ← 🔴 PUT CONNECTION STRING HERE (Create this file)
    ├── config.py                     ← Reads connection string from .env
    ├── database.py                   ← Uses connection string to connect
    ├── main.py                       ← Uses database connection in API
    ├── models.py                     ← Database table definitions
    └── requirements.txt               ← Dependencies
```

---

## 🎯 Quick Setup Guide

### **Step 1: Create `.env` File**

**Location:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**Create the file:**
1. Open `Back-End` folder
2. Create new file named `.env` (no extension, just `.env`)
3. Add this content:

```env
# SQL Server Connection String
DATABASE_URL=mssql+pyodbc://sa:YourPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# Security Settings
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Replace:**
- `sa` → Your SQL Server username
- `YourPassword` → Your SQL Server password
- `localhost` → Your SQL Server address (use `localhost\SQLEXPRESS` for Express)

---

### **Step 2: Verify Connection String Format**

**For SQL Server:**
```
mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
```

**Example:**
```
mssql+pyodbc://sa:MyPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**For SQL Server Express:**
```
mssql+pyodbc://sa:MyPassword123@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

## 🔧 How to Check Current Connection String

### **Method 1: Check `.env` File**
```bash
# Navigate to Back-End folder
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End

# View .env file (Windows)
type .env

# Or open in notepad
notepad .env
```

### **Method 2: Check `config.py`**
```python
# Open Back-End\config.py
# Look at line 9 for default value
```

### **Method 3: Test via API**
```bash
# Start backend
python run.py

# Visit in browser
http://localhost:8000/api/database/test
```

---

## 📝 Connection String Examples

### **SQL Server (Default Instance)**
```env
DATABASE_URL=mssql+pyodbc://sa:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### **SQL Server Express**
```env
DATABASE_URL=mssql+pyodbc://sa:password@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### **SQL Server with Custom User**
```env
DATABASE_URL=mssql+pyodbc://career_user:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### **Windows Authentication**
```env
DATABASE_URL=mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

### **Remote SQL Server**
```env
DATABASE_URL=mssql+pyodbc://username:password@192.168.1.100:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

## 🚨 Important Notes

### **1. `.env` File Priority**
- If `.env` exists → Uses connection string from `.env`
- If `.env` doesn't exist → Uses default from `config.py`

### **2. Never Commit `.env` to Git**
- `.env` file is in `.gitignore`
- Contains sensitive passwords
- Each developer should create their own `.env`

### **3. File Locations Summary**

| File | Path | Purpose |
|------|------|---------|
| `.env` | `Back-End\.env` | **🔴 PUT CONNECTION STRING HERE** |
| `config.py` | `Back-End\config.py` | Reads from `.env`, provides default |
| `database.py` | `Back-End\database.py` | Uses connection string to connect |
| `main.py` | `Back-End\main.py` | Uses database in API routes |

---

## ✅ Quick Checklist

- [ ] Create `.env` file in `Back-End` folder
- [ ] Add `DATABASE_URL` with your SQL Server connection string
- [ ] Update username, password, and server name
- [ ] Save `.env` file
- [ ] Run backend: `python run.py`
- [ ] Check connection: Visit `http://localhost:8000/api/database/test`

---

## 🎯 Summary

**Main Connection String Location:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**How it flows:**
1. `.env` file → Contains connection string
2. `config.py` → Reads from `.env`
3. `database.py` → Uses connection string
4. `main.py` → Uses database connection

**Action Required:**
Create `.env` file in `Back-End` folder with your SQL Server connection string!


