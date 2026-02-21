-- ============================================================================
-- CREATE USERS TABLE FOR SIGN UP
-- ============================================================================
-- This SQL script creates the users table for storing sign up information
-- Run this in SQL Server Management Studio if you want to create manually
-- ============================================================================

USE career_recommendation;
GO

-- Drop table if exists (optional - only if you want to recreate)
-- DROP TABLE IF EXISTS users;
-- GO

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    hashed_password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 NULL,
    is_active BIT DEFAULT 1
);
GO

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
GO

-- Verify table was created
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO

PRINT '✅ Users table created successfully!';
PRINT 'Table is ready for sign up functionality.';
GO

