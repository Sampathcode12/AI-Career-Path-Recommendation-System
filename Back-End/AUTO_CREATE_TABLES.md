# Automatic Table Creation - Setup Guide

## ✅ Tables Are Created Automatically!

The backend **automatically creates all tables** when you run it. No manual table creation needed!

---

## How It Works

### **Automatic Table Creation**

When you run `python run.py`, the backend automatically:

1. **Connects to your database** (using connection string from `.env`)
2. **Creates all tables** if they don't exist
3. **Ready to use!**

**Code in `main.py` (Line 28):**
```python
# Create database tables
Base.metadata.create_all(bind=engine)
```

This line automatically creates all tables defined in `models.py`:
- ✅ `users` table
- ✅ `user_profiles` table
- ✅ `assessments` table
- ✅ `recommendations` table
- ✅ `saved_jobs` table

---

## Setup Steps

### Step 1: Create Database (One Time Only)

Open **SQL Server Management Studio** and run:

```sql
CREATE DATABASE career_recommendation;
GO
```

**That's it!** You only need to create the database itself, not the tables.

---

### Step 2: Update .env File

Your `.env` file is already configured with:
- Server: `DESKTOP-NKDO1T4\SQLEXPRESS01`
- Login: `sa`
- Password: `#compaq123` (URL encoded)
- Database: `career_recommendation`

**File location:**
```
Back-End\.env
```

---

### Step 3: Run Backend

```bash
cd Back-End
python run.py
```

**What happens:**
1. Backend connects to SQL Server
2. **Automatically creates all tables** (if they don't exist)
3. Shows: `✅ Database connection successful!`
4. Ready to use!

---

## Manual Table Creation (Optional)

If you want to create tables manually or separately, use:

```bash
cd Back-End
python create_tables.py
```

This script will:
- Test database connection
- Create all tables
- Show success message

---

## Verify Tables Created

### Method 1: Check in SQL Server Management Studio

```sql
USE career_recommendation;
GO

-- List all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';
GO
```

You should see:
- users
- user_profiles
- assessments
- recommendations
- saved_jobs

### Method 2: Check via Backend

After running `python run.py`, try to:
1. Sign up a new user
2. If successful, tables are created and working!

---

## Table Structure

### **users** table
- id (Primary Key)
- email (Unique)
- name
- hashed_password
- created_at
- updated_at
- is_active

### **user_profiles** table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- full_name
- email
- education_level
- current_role
- location
- skills
- interests
- bio
- linkedin
- portfolio
- profile_completion
- created_at
- updated_at

### **assessments** table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- assessment_data (JSON)
- completed
- created_at
- updated_at

### **recommendations** table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- career_title
- match_percentage
- recommendation_data (JSON)
- saved
- created_at

### **saved_jobs** table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- job_title
- company
- location
- salary
- job_data (JSON)
- created_at

---

## Troubleshooting

### Issue: "Table already exists"
**Solution:** This is normal! Tables are only created if they don't exist. Safe to ignore.

### Issue: "Cannot create table"
**Solution:**
1. Check if database exists: `SELECT DB_NAME()`
2. Verify user has CREATE TABLE permission
3. Check connection string in `.env`

### Issue: "Database does not exist"
**Solution:** Create database first:
```sql
CREATE DATABASE career_recommendation;
GO
```

---

## Summary

✅ **No manual table creation needed!**
✅ **Tables created automatically on first run**
✅ **Just create the database, update .env, and run backend**
✅ **Everything else is automatic!**

---

## Quick Start

1. **Create database:**
   ```sql
   CREATE DATABASE career_recommendation;
   ```

2. **Update .env** (already done with your password)

3. **Run backend:**
   ```bash
   python run.py
   ```

4. **Tables are created automatically!** 🎉

---

## Your Current Setup

- ✅ Database: `career_recommendation`
- ✅ Server: `DESKTOP-NKDO1T4\SQLEXPRESS01`
- ✅ Login: `sa`
- ✅ Password: `#compaq123` (configured in .env)
- ✅ Tables: Will be created automatically!

**You're all set!** Just run `python run.py` and everything will work! 🚀

