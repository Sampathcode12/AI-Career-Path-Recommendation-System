# Database Creation Guide

## Step-by-Step: Create Database for Career Recommendation System

### Option 1: PostgreSQL (Recommended)

#### Step 1: Install PostgreSQL
Download from: https://www.postgresql.org/download/

#### Step 2: Open PostgreSQL Command Line
- Windows: Open "SQL Shell (psql)" or "pgAdmin"
- Mac/Linux: Open terminal and type `psql`

#### Step 3: Create Database
```sql
-- Connect to PostgreSQL (default user is usually 'postgres')
-- Enter password when prompted

-- Create database
CREATE DATABASE career_recommendation;

-- Connect to the new database
\c career_recommendation

-- Verify database was created
\l
```

#### Step 4: Create User (Optional but Recommended)
```sql
-- Create a new user
CREATE USER career_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE career_recommendation TO career_user;

-- Grant schema privileges
\c career_recommendation
GRANT ALL ON SCHEMA public TO career_user;
```

#### Step 5: Connection String
```
postgresql://career_user:your_secure_password@localhost:5432/career_recommendation
```

---

### Option 2: MySQL

#### Step 1: Install MySQL
Download from: https://dev.mysql.com/downloads/mysql/

#### Step 2: Open MySQL Command Line
```bash
mysql -u root -p
```

#### Step 3: Create Database
```sql
-- Create database
CREATE DATABASE career_recommendation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE career_recommendation;

-- Verify
SHOW DATABASES;
```

#### Step 4: Create User (Optional)
```sql
-- Create user
CREATE USER 'career_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON career_recommendation.* TO 'career_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

#### Step 5: Connection String
```
mysql+pymysql://career_user:your_secure_password@localhost:3306/career_recommendation
```

---

### Option 3: SQL Server

#### Step 1: Install SQL Server
Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads

#### Step 2: Open SQL Server Management Studio (SSMS)
Connect to your SQL Server instance

#### Step 3: Create Database
```sql
-- Create database
CREATE DATABASE career_recommendation;

-- Use the database
USE career_recommendation;
```

#### Step 4: Create Login (Optional)
```sql
-- Create login
CREATE LOGIN career_user WITH PASSWORD = 'your_secure_password';

-- Create user in database
USE career_recommendation;
CREATE USER career_user FOR LOGIN career_user;

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER career_user;
```

#### Step 5: Connection String
```
mssql+pyodbc://career_user:your_secure_password@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

---

### Option 4: SQLite (Easiest - No Installation Needed)

#### Step 1: No Installation Required!
SQLite is included with Python

#### Step 2: Database Created Automatically
The database file will be created automatically when you run the backend:
```
career_recommendation.db
```

#### Step 3: Connection String
```
sqlite:///./career_recommendation.db
```

---

## Quick Test: Verify Database Creation

### PostgreSQL
```bash
psql -U career_user -d career_recommendation -c "SELECT version();"
```

### MySQL
```bash
mysql -u career_user -p career_recommendation -e "SELECT VERSION();"
```

### SQL Server
```sql
SELECT @@VERSION;
```

### SQLite
```bash
sqlite3 career_recommendation.db "SELECT sqlite_version();"
```

---

## Next Steps

After creating the database:
1. Set connection string in `.env` file
2. Install database driver (see requirements.txt)
3. Run backend: `python run.py`
4. Tables will be created automatically!


