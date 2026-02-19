# Quick Setup Guide: Database Connection

## Step-by-Step Setup

### 1. Choose Your Database

**For Development (Easiest):**
- Use **SQLite** - No installation needed, works immediately

**For Production:**
- **PostgreSQL** (Recommended)
- **MySQL/MariaDB**
- **SQL Server**

---

### 2. Install Database Driver

Open terminal in `Back-End` folder and run:

**For PostgreSQL:**
```bash
pip install psycopg2-binary
```

**For MySQL:**
```bash
pip install pymysql
```

**For SQL Server:**
```bash
pip install pyodbc
```

---

### 3. Create Database

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

### 4. Set Connection String

Create `.env` file in `Back-End` folder:

**PostgreSQL:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/career_recommendation
```

**MySQL:**
```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/career_recommendation
```

**SQL Server:**
```env
DATABASE_URL=mssql+pyodbc://username:password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**SQLite (Default):**
```env
DATABASE_URL=sqlite:///./career_recommendation.db
```

---

### 5. Test Connection

```bash
cd Back-End
python run.py
```

Check console for: `✅ Database connection successful!`

Or visit: http://localhost:8000/api/database/test

---

### 6. Connect Frontend to Backend

The frontend is already configured! Just make sure:

1. **Backend is running** on `http://localhost:8000`
2. **Frontend is running** on `http://localhost:5173`
3. **API service** is in `Front End/src/services/api.js`

The frontend automatically connects to the backend API, which then connects to your database.

---

## Connection String Examples

### PostgreSQL
```
postgresql://postgres:mypassword@localhost:5432/career_recommendation
```

### MySQL
```
mysql+pymysql://root:mypassword@localhost:3306/career_recommendation
```

### SQL Server
```
mssql+pyodbc://sa:mypassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### SQLite (No setup needed)
```
sqlite:///./career_recommendation.db
```

---

## How It Works

```
Frontend (React) 
    ↓ HTTP Requests
Backend (FastAPI) 
    ↓ SQL Queries
Database (SQL)
```

**Frontend → Backend:** Uses REST API (HTTP/JSON)
**Backend → Database:** Uses SQLAlchemy (SQL queries)

---

## Troubleshooting

**Connection Failed?**
- Check database server is running
- Verify username/password
- Check port number
- Ensure database exists

**Import Error?**
- Install database driver: `pip install <driver>`
- Check requirements.txt

**CORS Error?**
- Backend CORS is configured in main.py
- Frontend URL should be in allow_origins list

---

## Need Help?

See detailed guides:
- `connection_strings.md` - All connection string formats
- `DATABASE_SETUP.md` - Complete setup guide
- `README.md` - Full API documentation


