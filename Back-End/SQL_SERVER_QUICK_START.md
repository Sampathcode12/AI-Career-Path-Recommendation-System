# SQL Server Quick Start - 5 Steps

## Step 1: Install SQL Server

Download SQL Server Express (free):
https://www.microsoft.com/en-us/sql-server/sql-server-downloads

- Choose "Express" edition
- Remember your **SA password** during installation

---

## Step 2: Install ODBC Driver

Download and install:
https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

- Install "ODBC Driver 17 for SQL Server"

---

## Step 3: Create Database

Open **SQL Server Management Studio (SSMS)** or **Azure Data Studio**:

```sql
CREATE DATABASE career_recommendation;
GO
```

**Or using command line:**
```cmd
sqlcmd -S localhost -U sa -P YourPassword -Q "CREATE DATABASE career_recommendation"
```

---

## Step 4: Set Connection String

Create `.env` file in `Back-End` folder:

```env
DATABASE_URL=mssql+pyodbc://sa:YourSAPassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Replace:**
- `sa` → Your SQL Server username (or create a new user)
- `YourSAPassword` → Your SQL Server password
- `localhost` → Your SQL Server address (use `localhost\SQLEXPRESS` for Express edition)

---

## Step 5: Install & Run

```bash
cd Back-End
pip install -r requirements.txt
python run.py
```

**You should see:**
```
✅ Database connection successful!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Tables are created automatically!** 🎉

---

## Connection String Examples

### Local SQL Server (Default Instance):
```
mssql+pyodbc://sa:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### SQL Server Express:
```
mssql+pyodbc://sa:password@localhost\SQLEXPRESS:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### With Custom User:
```
mssql+pyodbc://career_user:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### Windows Authentication:
```
mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

---

## Troubleshooting

**"Driver not found"**
→ Install ODBC Driver 17 for SQL Server

**"Login failed"**
→ Check username/password in connection string

**"Database does not exist"**
→ Create database first (Step 3)

**"Connection timeout"**
→ Check SQL Server is running
→ Verify server name (use `localhost\SQLEXPRESS` for Express)

---

## Test Connection

Visit: http://localhost:8000/api/database/test

Should return:
```json
{
  "status": "connected",
  "database_url": "localhost:1433/career_recommendation"
}
```

---

## That's It!

Your backend is now connected to SQL Server! 🚀

See `SQL_SERVER_SETUP.md` for detailed instructions.


