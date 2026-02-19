# How to Create .env File

## Why .env File is Not Found?

The `.env` file is **not included in the repository** because it contains sensitive information (passwords, connection strings). You need to **create it yourself**.

---

## ✅ Method 1: Copy Template File (Easiest)

### Step 1: Find the Template
Look for this file in `Back-End` folder:
```
env.template
```

### Step 2: Copy and Rename
1. Copy `env.template` file
2. Rename the copy to `.env` (just `.env`, no extension)
3. Open `.env` file
4. Update the connection string with your SQL Server details

---

## ✅ Method 2: Create Manually

### Step 1: Navigate to Back-End Folder
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End
```

### Step 2: Create New File

**Option A: Using Notepad**
1. Right-click in the folder → New → Text Document
2. Name it: `.env` (make sure it's just `.env`, not `.env.txt`)
3. If Windows asks about changing extension, click "Yes"

**Option B: Using Command Prompt**
```cmd
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End
echo. > .env
```

**Option C: Using PowerShell**
```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End
New-Item -Name ".env" -ItemType File
```

### Step 3: Add Content

Open `.env` file and add:

```env
# SQL Server Connection String
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# Security Settings
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important:** Replace:
- `sa` → Your SQL Server username
- `YourPassword123` → Your SQL Server password
- `localhost` → Your SQL Server address (use `localhost\SQLEXPRESS` for Express)

### Step 4: Save File

Save the file. Make sure it's named exactly `.env` (not `.env.txt`)

---

## ✅ Method 3: Using VS Code or Any Editor

1. Open `Back-End` folder in VS Code
2. Click "New File" button
3. Name it: `.env`
4. Paste this content:

```env
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Update the connection string
6. Save (Ctrl+S)

---

## 🔍 Verify .env File Exists

### Check if file was created:

**Using File Explorer:**
1. Go to `Back-End` folder
2. Enable "Show hidden files" in View options
3. Look for `.env` file

**Using Command Prompt:**
```cmd
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End
dir .env
```

**Using PowerShell:**
```powershell
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End
Test-Path .env
# Should return: True
```

---

## 📝 Complete .env File Content

Copy and paste this into your `.env` file:

```env
# SQL Server Database Configuration
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# Security Settings
SECRET_KEY=your-secret-key-change-this-in-production-use-a-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Update these values:**
- `sa` → Your SQL Server username
- `YourPassword123` → Your actual SQL Server password
- `localhost` → Your SQL Server server name
  - For default: `localhost`
  - For Express: `localhost\SQLEXPRESS`
  - For remote: `192.168.1.100` or server IP

---

## 🎯 Connection String Examples

### Default SQL Server:
```env
DATABASE_URL=mssql+pyodbc://sa:MyPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### SQL Server Express:
```env
DATABASE_URL=mssql+pyodbc://sa:MyPassword@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### With Custom User:
```env
DATABASE_URL=mssql+pyodbc://career_user:MyPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### Windows Authentication:
```env
DATABASE_URL=mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

---

## ✅ After Creating .env File

1. **Verify file exists:**
   ```
   Back-End\.env
   ```

2. **Update connection string** with your SQL Server details

3. **Test connection:**
   ```bash
   cd Back-End
   python run.py
   ```

4. **Check output:**
   Should see: `✅ Database connection successful!`

---

## 🚨 Common Issues

### Issue: "File is named .env.txt instead of .env"
**Solution:**
- Windows hides file extensions by default
- Rename file and remove `.txt` extension
- Or use command: `ren .env.txt .env`

### Issue: "File not found error"
**Solution:**
- Make sure file is in `Back-End` folder (not parent folder)
- Check file name is exactly `.env` (not `env` or `.env.txt`)
- Enable "Show hidden files" in File Explorer

### Issue: "Connection still fails"
**Solution:**
- Check connection string format
- Verify SQL Server is running
- Test connection string in `test_sql_server.py`

---

## 📍 File Location

Your `.env` file should be here:
```
C:\Project\AI-Career-Path-Recommendation-System\Back-End\.env
```

**Same folder as:**
- `config.py`
- `main.py`
- `database.py`
- `requirements.txt`

---

## Summary

1. ✅ `.env` file is NOT in repository (for security)
2. ✅ You need to CREATE it yourself
3. ✅ Copy `env.template` OR create manually
4. ✅ Update connection string with your SQL Server details
5. ✅ Save file as `.env` (not `.env.txt`)

**Quick Command:**
```cmd
cd C:\Project\AI-Career-Path-Recommendation-System\Back-End
copy env.template .env
notepad .env
```

Then update the connection string and save!


