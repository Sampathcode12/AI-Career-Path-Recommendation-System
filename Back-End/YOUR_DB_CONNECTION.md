# Your Database Connection Setup

## 📋 Your SQL Server Details

Based on your connection dialog:

- **Server Name:** `DESKTOP-NKDO1T4\SQLEXPRESS01`
- **Authentication:** SQL Server Authentication
- **Login:** `sa`
- **Password:** (Enter your password in .env file)
- **Database:** `career_recommendation` (create this first)

---

## 🔧 Step 1: Create Database

Open **SQL Server Management Studio** and connect using your credentials, then run:

```sql
CREATE DATABASE career_recommendation;
GO
```

---

## 🔧 Step 2: Update .env File

**File Location:**
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**Current Content:**
```env
DATABASE_URL=mssql+pyodbc://sa:YOUR_PASSWORD_HERE@DESKTOP-NKDO1T4\SQLEXPRESS01:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=your-secret-key-change-this-in-production-use-a-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Action Required:**
1. Open `.env` file
2. Replace `YOUR_PASSWORD_HERE` with your actual SQL Server password
3. Save the file

---

## 📝 Connection String Format

```
mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
```

**Your Connection String:**
```
mssql+pyodbc://sa:YOUR_PASSWORD@DESKTOP-NKDO1T4\SQLEXPRESS01:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

## ⚠️ Special Characters in Password

If your password contains special characters, you need to URL encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `\` | `%5C` |
| ` ` (space) | `%20` |

**Example:**
- Password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`
- Connection: `mssql+pyodbc://sa:MyP%40ss%23123@DESKTOP-NKDO1T4\SQLEXPRESS01:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server`

---

## ✅ Step 3: Test Connection

After updating the password in `.env` file:

```bash
cd Back-End
python run.py
```

**You should see:**
```
✅ Database connection successful!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🔍 Verify Connection

Visit: http://localhost:8000/api/database/test

Should return:
```json
{
  "status": "connected",
  "database": "DESKTOP-NKDO1T4\\SQLEXPRESS01:1433/career_recommendation",
  "database_type": "SQL Server"
}
```

---

## 📍 File Locations

| File | Path | Status |
|------|------|--------|
| `.env` | `Back-End\.env` | ✅ Created - **Update password** |
| `config.py` | `Back-End\config.py` | ✅ Reads from .env |
| `database.py` | `Back-End\database.py` | ✅ Uses connection string |
| `main.py` | `Back-End\main.py` | ✅ Uses database |

---

## 🎯 Quick Checklist

- [ ] Create database: `CREATE DATABASE career_recommendation;`
- [ ] Open `.env` file in `Back-End` folder
- [ ] Replace `YOUR_PASSWORD_HERE` with your actual password
- [ ] URL encode special characters if needed
- [ ] Save `.env` file
- [ ] Run: `python run.py`
- [ ] Verify: See "✅ Database connection successful!"

---

## 📞 Connection String Template

Copy this and replace `YOUR_PASSWORD`:

```env
DATABASE_URL=mssql+pyodbc://sa:YOUR_PASSWORD@DESKTOP-NKDO1T4\SQLEXPRESS01:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**That's it!** Your backend will connect to your SQL Server database.

