# Quick Start: Create Table for Sign Up

## ✅ Table Already Created Automatically!

The `users` table for sign up is **automatically created** when you run the backend.

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Create Database**

Open **SQL Server Management Studio** and run:

```sql
CREATE DATABASE career_recommendation;
GO
```

### **Step 2: Run Backend**

```bash
cd Back-End
python run.py
```

**This automatically creates the `users` table!**

### **Step 3: Test Sign Up**

1. Start frontend: `npm run dev`
2. Go to: http://localhost:5173/signup
3. Create an account
4. User is saved to `users` table!

---

## 📋 Users Table Structure

The `users` table stores all sign up information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary Key (Auto-increment) |
| `email` | NVARCHAR(255) | User email (Unique, Required) |
| `name` | NVARCHAR(255) | User name (Required) |
| `hashed_password` | NVARCHAR(255) | Encrypted password (Required) |
| `created_at` | DATETIME2 | Account creation date |
| `updated_at` | DATETIME2 | Last update date |
| `is_active` | BIT | Account status (Default: 1) |

---

## 🔧 Manual Table Creation (Optional)

If you want to create the table manually, run:

### **Option 1: SQL Script**

Open `create_users_table.sql` in SQL Server Management Studio and execute it.

### **Option 2: Python Script**

```bash
cd Back-End
python verify_tables.py
```

This will verify and create all tables including `users`.

---

## ✅ Verify Table Exists

### **Check in SQL Server:**

```sql
USE career_recommendation;
GO

-- Check if table exists
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'users';
GO

-- View table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users';
GO

-- View all users (after sign up)
SELECT id, email, name, created_at, is_active
FROM users;
GO
```

---

## 📊 Sign Up Data Flow

1. **User fills sign up form** (Name, Email, Password)
2. **Frontend sends to backend:** `POST /api/auth/signup`
3. **Backend saves to `users` table:**
   ```python
   db_user = User(
       email="user@example.com",
       name="John Doe",
       hashed_password="$2b$12$..."  # Encrypted
   )
   db.add(db_user)
   db.commit()  # Saved to SQL Server!
   ```
4. **Data stored in SQL Server `users` table**

---

## 🎯 Your Current Setup

- ✅ **Database:** `career_recommendation` (create this)
- ✅ **Connection:** Configured in `.env`
- ✅ **Table:** `users` (created automatically)
- ✅ **Sign Up:** Ready to save users!

---

## 📝 Summary

**For Sign Up:**

1. ✅ Create database: `CREATE DATABASE career_recommendation;`
2. ✅ Run backend: `python run.py` (creates `users` table automatically)
3. ✅ Sign up works! Users saved to SQL Server

**No manual table creation needed!** 🎉

---

## 🔍 Files Reference

| File | Purpose |
|------|---------|
| `models.py` | Defines `users` table structure |
| `main.py` | Creates tables automatically (Line 29) |
| `verify_tables.py` | Verify/create tables manually |
| `create_users_table.sql` | SQL script for manual creation |
| `.env` | Database connection string |

---

**Everything is ready! Just create the database and run the backend!** 🚀

