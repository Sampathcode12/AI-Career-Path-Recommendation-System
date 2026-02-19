# Database Connection Setup File

## 📍 File Location

**Create this file:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

---

## 🔧 Step-by-Step Setup

### Step 1: Create `.env` File

1. Navigate to: `C:\Project\AI-Career-Path-Recommendation-System\Back-End`
2. Create a new file named: `.env` (no extension)
3. Copy the content below

---

### Step 2: SQL Server Connection String

**For SQL Server (Default Instance):**
```env
DATABASE_URL=mssql+pyodbc://sa:YourPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**For SQL Server Express:**
```env
DATABASE_URL=mssql+pyodbc://sa:YourPassword@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**For Windows Authentication:**
```env
DATABASE_URL=mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

---

### Step 3: Complete `.env` File Content

Copy and paste this into your `.env` file:

```env
# ============================================
# SQL SERVER DATABASE CONNECTION
# ============================================
# Update the connection string with your SQL Server details

# SQL Server Connection String
# Format: mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# Replace these values:
# - sa → Your SQL Server username
# - YourPassword123 → Your SQL Server password
# - localhost → Your SQL Server server name
#   * Default: localhost
#   * Express: localhost\SQLEXPRESS
#   * Remote: Your server IP or name

# ============================================
# SECURITY SETTINGS
# ============================================
SECRET_KEY=your-secret-key-change-this-in-production-use-a-random-string-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

### Step 4: Update Connection String

**Replace these values in the `.env` file:**

1. **Username:** Change `sa` to your SQL Server username
2. **Password:** Change `YourPassword123` to your actual SQL Server password
3. **Server:** Change `localhost` if needed:
   - Default SQL Server: `localhost`
   - SQL Server Express: `localhost\SQLEXPRESS`
   - Remote server: `192.168.1.100` or server name

**Example after update:**
```env
DATABASE_URL=mssql+pyodbc://career_user:MySecurePass123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

### Step 5: Verify Setup

1. **Check file exists:**
   ```
   Back-End\.env
   ```

2. **Test connection:**
   ```bash
   cd Back-End
   python run.py
   ```

3. **Look for:**
   ```
   ✅ Database connection successful!
   ```

---

## 📝 Connection String Format Explained

```
mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
         ↑        ↑       ↑        ↑      ↑      ↑                    ↑
         |        |       |        |      |      |                    └─ ODBC Driver name
         |        |       |        |      |      └─ Database name
         |        |       |        |      └─ Port (1433 for SQL Server)
         |        |       |        └─ Server address
         |        |       └─ Password
         |        └─ Username
         └─ Database type (SQL Server with pyodbc)
```

---

## 🔍 Where Connection String is Used

### **1. `.env` File** (You create this)
```
Back-End\.env
```
Contains: `DATABASE_URL=...`

### **2. `config.py`** (Reads from .env)
```
Back-End\config.py
Line 12: DATABASE_URL: str = "..."
```
Reads connection string from `.env` file

### **3. `database.py`** (Uses connection string)
```
Back-End\database.py
Line 4: from config import settings
Line 47: engine = create_engine(settings.DATABASE_URL)
```
Creates database connection using the connection string

### **4. `main.py`** (Uses database)
```
Back-End\main.py
Line 8: from database import get_db
```
Uses database connection in API routes

---

## ✅ Quick Checklist

- [ ] Create `.env` file in `Back-End` folder
- [ ] Add `DATABASE_URL` with your SQL Server connection string
- [ ] Update username, password, and server name
- [ ] Add `SECRET_KEY` and other settings
- [ ] Save `.env` file
- [ ] Test connection: `python run.py`
- [ ] Verify: See "✅ Database connection successful!"

---

## 🚨 Important Notes

1. **`.env` file is NOT in repository** (for security)
2. **Each developer must create their own `.env` file**
3. **Never commit `.env` to git** (it's in `.gitignore`)
4. **Keep passwords secure** - don't share `.env` file

---

## 📍 File Path Summary

| File | Path | Purpose |
|------|------|---------|
| `.env` | `Back-End\.env` | **🔴 CREATE THIS - Put connection string here** |
| `config.py` | `Back-End\config.py` | Reads from `.env` |
| `database.py` | `Back-End\database.py` | Uses connection string |
| `main.py` | `Back-End\main.py` | Uses database connection |

---

## 🎯 Summary

**Main File to Create:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**What to put in it:**
```env
DATABASE_URL=mssql+pyodbc://sa:YourPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**That's it!** The backend will automatically read this file and connect to your SQL Server database.

