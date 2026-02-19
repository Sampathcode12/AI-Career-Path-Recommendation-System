# SQL Server Setup Guide - Complete Tutorial

## Step 1: Install SQL Server

### Option A: SQL Server Express (Free)
1. Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Choose "Express" edition (free)
3. Run installer and follow setup wizard
4. Remember your **SA password** (you'll need it!)

### Option B: SQL Server Developer Edition (Free)
- Same as above, but choose "Developer" edition
- Full features, free for development

### Option C: SQL Server LocalDB (Lightweight)
- Included with Visual Studio
- Good for development

---

## Step 2: Install ODBC Driver

### Windows:
1. Download: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
2. Install "ODBC Driver 17 for SQL Server" (or newer)
3. Verify installation:
   - Open "ODBC Data Sources (64-bit)" from Windows search
   - Go to "Drivers" tab
   - Look for "ODBC Driver 17 for SQL Server"

### Linux:
```bash
# Ubuntu/Debian
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql17
```

### Mac:
```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew update
HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install msodbcsql17 mssql-tools
```

---

## Step 3: Create Database

### Method 1: Using SQL Server Management Studio (SSMS)

1. **Download SSMS** (if not installed):
   - https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

2. **Connect to SQL Server:**
   - Server name: `localhost` or `localhost\SQLEXPRESS` (for Express)
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: (your SA password)

3. **Create Database:**
   ```sql
   CREATE DATABASE career_recommendation;
   GO
   ```

4. **Verify:**
   ```sql
   USE career_recommendation;
   GO
   SELECT DB_NAME() AS CurrentDatabase;
   ```

### Method 2: Using Command Line (sqlcmd)

**Windows:**
```cmd
sqlcmd -S localhost -U sa -P YourPassword
```

**Then run:**
```sql
CREATE DATABASE career_recommendation;
GO
EXIT
```

**Linux/Mac:**
```bash
sqlcmd -S localhost -U sa -P YourPassword -Q "CREATE DATABASE career_recommendation"
```

### Method 3: Using Azure Data Studio

1. Download: https://azure.microsoft.com/en-us/products/data-studio/
2. Connect to SQL Server
3. Run: `CREATE DATABASE career_recommendation;`

---

## Step 4: Create Database User (Recommended)

### Create User in SSMS or sqlcmd:

```sql
-- Connect to SQL Server
USE master;
GO

-- Create login
CREATE LOGIN career_user WITH PASSWORD = 'YourSecurePassword123!';
GO

-- Create user in database
USE career_recommendation;
GO

CREATE USER career_user FOR LOGIN career_user;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER career_user;
GO
```

**Or use SA account** (less secure, but simpler for development):
- Just use `sa` username and your SA password

---

## Step 5: Configure Connection String

### Option A: Using .env File (Recommended)

Create `.env` file in `Back-End` folder:

**For SQL Server Authentication:**
```env
DATABASE_URL=mssql+pyodbc://career_user:YourSecurePassword123!@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# Or using SA account:
# DATABASE_URL=mssql+pyodbc://sa:YourSAPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**For Windows Authentication:**
```env
DATABASE_URL=mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

### Option B: Direct in config.py

Edit `config.py`:
```python
DATABASE_URL: str = "mssql+pyodbc://username:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server"
```

---

## Step 6: Install Python Driver

```bash
cd Back-End
pip install pyodbc
```

**Verify installation:**
```python
python -c "import pyodbc; print('✅ pyodbc installed successfully')"
```

---

## Step 7: Test Connection

### Test in Python:
```python
import pyodbc

try:
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=localhost;'
        'DATABASE=career_recommendation;'
        'UID=career_user;'
        'PWD=YourSecurePassword123!'
    )
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### Test via Backend:
```bash
cd Back-End
python run.py
```

You should see:
```
✅ Database connection successful!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Or visit: http://localhost:8000/api/database/test

---

## Connection String Formats

### Format 1: SQL Server Authentication (Username/Password)
```
mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
```

**Example:**
```
mssql+pyodbc://sa:MyPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### Format 2: Windows Authentication
```
mssql+pyodbc://server/database?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

**Example:**
```
mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

### Format 3: Using pymssql (Alternative)
```
mssql+pymssql://username:password@server:port/database
```

**Example:**
```
mssql+pymssql://sa:MyPassword123@localhost:1433/career_recommendation
```

---

## Common Connection String Examples

### Local SQL Server Express:
```
mssql+pyodbc://sa:password@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### Remote SQL Server:
```
mssql+pyodbc://username:password@192.168.1.100:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### SQL Server with Instance Name:
```
mssql+pyodbc://username:password@localhost\INSTANCENAME:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### With Special Characters in Password:
If password contains special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Example:**
```
Password: MyP@ss#123
Encoded: MyP%40ss%23123
Connection: mssql+pyodbc://user:MyP%40ss%23123@localhost:1433/db?driver=ODBC+Driver+17+for+SQL+Server
```

---

## Troubleshooting

### Issue: "Driver not found"
**Solution:**
1. Install ODBC Driver 17 for SQL Server
2. Verify in ODBC Data Sources (64-bit) → Drivers tab
3. Check driver name matches exactly in connection string

### Issue: "Login failed for user"
**Solution:**
1. Verify username and password are correct
2. Check SQL Server Authentication is enabled
3. Verify user has permissions on database

### Issue: "Cannot open database"
**Solution:**
1. Verify database exists: `SELECT name FROM sys.databases;`
2. Check user has access: `USE career_recommendation;`
3. Grant permissions: `ALTER ROLE db_owner ADD MEMBER username;`

### Issue: "Connection timeout"
**Solution:**
1. Check SQL Server is running
2. Verify firewall allows port 1433
3. Check server name/instance name is correct

### Issue: "pyodbc not found"
**Solution:**
```bash
pip install pyodbc
# Or
pip install -r requirements.txt
```

---

## Enable SQL Server Authentication

If you get "Windows Authentication only" error:

1. Open SQL Server Management Studio
2. Right-click server → Properties
3. Go to "Security" page
4. Select "SQL Server and Windows Authentication mode"
5. Click OK
6. Restart SQL Server service

---

## Verify SQL Server is Running

### Windows:
```cmd
# Check service status
sc query MSSQLSERVER

# Or check in Services app
# Look for "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"
```

### Linux:
```bash
sudo systemctl status mssql-server
```

---

## Quick Test Script

Create `test_sql_server.py` in `Back-End` folder:

```python
import pyodbc

# Update these values
SERVER = 'localhost'
DATABASE = 'career_recommendation'
USERNAME = 'sa'  # or your username
PASSWORD = 'YourPassword'  # your password

try:
    conn = pyodbc.connect(
        f'DRIVER={{ODBC Driver 17 for SQL Server}};'
        f'SERVER={SERVER};'
        f'DATABASE={DATABASE};'
        f'UID={USERNAME};'
        f'PWD={PASSWORD}'
    )
    print("✅ Connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT @@VERSION")
    row = cursor.fetchone()
    print(f"SQL Server Version: {row[0]}")
    
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

Run: `python test_sql_server.py`

---

## Next Steps

After successful connection:
1. ✅ Database created
2. ✅ Connection string configured
3. ✅ Python driver installed
4. ✅ Connection tested

**Now run the backend:**
```bash
python run.py
```

Tables will be created automatically! 🎉

---

## Summary

1. **Install SQL Server** (Express/Developer edition)
2. **Install ODBC Driver 17** for SQL Server
3. **Create database:** `CREATE DATABASE career_recommendation;`
4. **Create user** (optional, or use SA)
5. **Set connection string** in `.env` file
6. **Install pyodbc:** `pip install pyodbc`
7. **Test connection:** `python run.py`

You're ready to go! 🚀


