# Sign Up Tables Setup - Complete Guide

## ✅ Tables for Sign Up Are Already Configured!

The backend **automatically creates all tables** needed for sign up when you run it.

---

## 📋 Tables Created for Sign Up

### **1. users Table** (Main table for sign up)

This table stores all user sign up information:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    hashed_password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    is_active BIT DEFAULT 1
);
```

**Columns:**
- `id` - Primary key (auto-increment)
- `email` - User email (unique, required for sign up)
- `name` - User name (required for sign up)
- `hashed_password` - Encrypted password (required for sign up)
- `created_at` - Account creation date
- `updated_at` - Last update date
- `is_active` - Account status

**This table is created automatically!**

---

## 🚀 How to Create Tables

### **Method 1: Automatic (Recommended)**

**Just run the backend:**
```bash
cd Back-End
python run.py
```

**What happens:**
1. Backend connects to SQL Server
2. **Automatically creates `users` table** (and all other tables)
3. Ready for sign up!

**Code in `main.py` (Line 29):**
```python
Base.metadata.create_all(bind=engine)
```

This line automatically creates all tables including the `users` table for sign up.

---

### **Method 2: Manual Script**

Run the verification script:

```bash
cd Back-End
python verify_tables.py
```

This script will:
- ✅ Test database connection
- ✅ Create all tables if missing
- ✅ Verify `users` table structure
- ✅ Check all required columns for sign up

---

### **Method 3: Direct Table Creation Script**

```bash
cd Back-End
python create_tables.py
```

---

## 📝 Sign Up Data Flow

### **When User Signs Up:**

1. **Frontend** sends sign up data:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

2. **Backend** receives at: `POST /api/auth/signup`

3. **Backend** saves to `users` table:
   ```python
   # In main.py - signup endpoint
   db_user = User(
       email=user_data.email,
       name=user_data.name,
       hashed_password=hashed_password
   )
   db.add(db_user)
   db.commit()  # Saves to SQL Server database
   ```

4. **SQL Server** stores in `users` table:
   ```sql
   INSERT INTO users (email, name, hashed_password, created_at, is_active)
   VALUES ('john@example.com', 'John Doe', '$2b$12$...', GETDATE(), 1);
   ```

5. **Backend** returns user data to frontend

---

## ✅ Verify Tables Are Created

### **Method 1: SQL Server Management Studio**

```sql
USE career_recommendation;
GO

-- Check if users table exists
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'users';
GO

-- View users table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users';
GO
```

### **Method 2: Run Verification Script**

```bash
python verify_tables.py
```

### **Method 3: Test Sign Up**

1. Run backend: `python run.py`
2. Start frontend: `npm run dev`
3. Go to sign up page
4. Create an account
5. If successful, table exists and works!

---

## 🔍 Complete Table Structure

### **users Table** (For Sign Up)
```sql
users
├── id (INT, Primary Key, Auto-increment)
├── email (NVARCHAR(255), Unique, NOT NULL)
├── name (NVARCHAR(255), NOT NULL)
├── hashed_password (NVARCHAR(255), NOT NULL)
├── created_at (DATETIME, Default: GETDATE())
├── updated_at (DATETIME, Nullable)
└── is_active (BIT, Default: 1)
```

### **user_profiles Table** (For Profile)
```sql
user_profiles
├── id (INT, Primary Key)
├── user_id (INT, Foreign Key → users.id)
├── full_name (NVARCHAR(255))
├── email (NVARCHAR(255))
├── education_level (NVARCHAR(255))
├── current_role (NVARCHAR(255))
├── location (NVARCHAR(255))
├── skills (TEXT)
├── interests (TEXT)
├── bio (TEXT)
├── linkedin (NVARCHAR(255))
├── portfolio (NVARCHAR(255))
├── profile_completion (FLOAT)
├── created_at (DATETIME)
└── updated_at (DATETIME)
```

---

## 🎯 Quick Setup for Sign Up

### **Step 1: Create Database**

```sql
CREATE DATABASE career_recommendation;
GO
```

### **Step 2: Verify .env File**

Check `Back-End\.env` has your connection string:
```env
DATABASE_URL=mssql+pyodbc://sa:%23compaq123@DESKTOP-NKDO1T4\SQLEXPRESS01:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server
```

### **Step 3: Run Backend**

```bash
cd Back-End
python run.py
```

**Tables are created automatically!**

### **Step 4: Test Sign Up**

1. Start frontend: `npm run dev`
2. Go to: http://localhost:5173/signup
3. Fill in: Name, Email, Password
4. Click "Sign Up"
5. User is saved to `users` table in SQL Server!

---

## 🔧 Troubleshooting

### **Issue: "Table 'users' does not exist"**

**Solution:**
```bash
# Run verification script
python verify_tables.py

# Or run backend (tables created automatically)
python run.py
```

### **Issue: "Cannot insert into users table"**

**Solution:**
1. Check if table exists: `SELECT * FROM users;`
2. Verify table structure: Run `verify_tables.py`
3. Check user permissions

### **Issue: "Email already exists"**

**Solution:** This is correct! The email must be unique. User already signed up.

---

## 📊 Check Sign Up Data

### **View All Users:**

```sql
USE career_recommendation;
GO

SELECT id, email, name, created_at, is_active
FROM users;
GO
```

### **View Specific User:**

```sql
SELECT * FROM users WHERE email = 'user@example.com';
GO
```

---

## ✅ Summary

**For Sign Up, you need:**

1. ✅ **Database created:** `CREATE DATABASE career_recommendation;`
2. ✅ **.env file configured:** With your SQL Server connection
3. ✅ **Run backend:** `python run.py`
4. ✅ **Tables created automatically:** Including `users` table
5. ✅ **Sign up works:** Users saved to SQL Server!

**No manual table creation needed!** Everything is automatic! 🎉

---

## 🎯 Your Current Status

- ✅ Database: `career_recommendation` (create this)
- ✅ Connection: Configured in `.env`
- ✅ Tables: Created automatically when you run backend
- ✅ Sign Up: Ready to save users to `users` table

**Just create the database and run the backend!** 🚀

