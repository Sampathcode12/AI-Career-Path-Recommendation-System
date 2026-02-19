# Database Connection Strings Guide

This guide shows how to configure connection strings for different SQL databases.

## Connection String Format

### SQLite (Default - Development)
```
sqlite:///./career_recommendation.db
```
**No installation needed** - Works out of the box

---

### PostgreSQL

#### Connection String Format:
```
postgresql://username:password@host:port/database_name
```

#### Examples:

**Local PostgreSQL:**
```
postgresql://postgres:mypassword@localhost:5432/career_recommendation
```

**Remote PostgreSQL:**
```
postgresql://user:pass@192.168.1.100:5432/career_recommendation
```

**With SSL:**
```
postgresql://user:pass@host:5432/dbname?sslmode=require
```

#### Installation:
```bash
pip install psycopg2-binary
```

---

### MySQL / MariaDB

#### Connection String Format:
```
mysql+pymysql://username:password@host:port/database_name
```

#### Examples:

**Local MySQL:**
```
mysql+pymysql://root:mypassword@localhost:3306/career_recommendation
```

**Remote MySQL:**
```
mysql+pymysql://user:pass@192.168.1.100:3306/career_recommendation
```

**With charset:**
```
mysql+pymysql://user:pass@localhost:3306/career_recommendation?charset=utf8mb4
```

#### Installation:
```bash
pip install pymysql
# OR
pip install mysqlclient
```

---

### SQL Server (Microsoft)

#### Connection String Format:
```
mssql+pyodbc://username:password@host:port/database_name?driver=ODBC+Driver+17+for+SQL+Server
```

#### Examples:

**Local SQL Server (Windows Authentication):**
```
mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
```

**SQL Server with Username/Password:**
```
mssql+pyodbc://sa:mypassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**Remote SQL Server:**
```
mssql+pyodbc://user:pass@192.168.1.100:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

**Alternative (using pymssql):**
```
mssql+pymssql://username:password@host:port/database_name
```

#### Installation:

**For pyodbc (Recommended):**
```bash
pip install pyodbc
```
*Note: You need to install ODBC Driver for SQL Server on your system*

**For pymssql (Alternative):**
```bash
pip install pymssql
```

---

## Setting Up Connection String

### Method 1: Environment Variable (.env file)

Create a `.env` file in the `Back-End` directory:

```env
# For PostgreSQL
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/career_recommendation

# For MySQL
# DATABASE_URL=mysql+pymysql://root:mypassword@localhost:3306/career_recommendation

# For SQL Server
# DATABASE_URL=mssql+pyodbc://sa:mypassword@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server

# For SQLite (Default)
# DATABASE_URL=sqlite:///./career_recommendation.db

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Method 2: Direct in config.py

Edit `config.py` and update the `DATABASE_URL`:

```python
DATABASE_URL: str = "postgresql://user:pass@localhost:5432/career_recommendation"
```

---

## Special Characters in Passwords

If your password contains special characters, they need to be URL-encoded:

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
| ` ` (space) | `%20` |

**Example:**
```
Password: MyP@ss#123
Encoded: MyP%40ss%23123
Connection String: postgresql://user:MyP%40ss%23123@localhost:5432/db
```

---

## Testing Connection

After setting up your connection string, test it:

```python
# In Python shell or test script
from database import test_connection
test_connection()
```

Or run the backend and check the startup logs.

---

## Database Setup Steps

### 1. Create Database

**PostgreSQL:**
```sql
CREATE DATABASE career_recommendation;
```

**MySQL:**
```sql
CREATE DATABASE career_recommendation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**SQL Server:**
```sql
CREATE DATABASE career_recommendation;
```

### 2. Update Connection String

Set the connection string in `.env` file or `config.py`

### 3. Install Required Driver

Install the appropriate driver based on your database choice (see examples above)

### 4. Run Backend

The database tables will be created automatically on first run:
```bash
python run.py
```

---

## Troubleshooting

### Connection Refused
- Check if database server is running
- Verify host and port are correct
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check if user has proper permissions
- For SQL Server, verify authentication mode

### Driver Not Found
- Install the required database driver
- For SQL Server, install ODBC Driver
- Check if driver is in system PATH

### Database Does Not Exist
- Create the database first (see Database Setup Steps)
- Verify database name in connection string


