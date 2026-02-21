"""
Script to verify and create tables for sign up functionality
Run this to ensure all tables exist for user registration
"""
from database import Base, engine, test_connection, SessionLocal
from models import User, UserProfile, Assessment, Recommendation, SavedJob
from sqlalchemy import inspect

def verify_and_create_tables():
    """Verify tables exist, create if missing"""
    print("=" * 70)
    print("VERIFYING DATABASE TABLES FOR SIGN UP")
    print("=" * 70)
    
    # Test connection
    print("\n1. Testing database connection...")
    if not test_connection():
        print("\n❌ Cannot connect to database!")
        print("   Please check your .env file and SQL Server connection.")
        return False
    
    print("   ✅ Database connection successful!")
    
    # Create all tables
    print("\n2. Creating/verifying tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("   ✅ Tables created/verified successfully!")
        
        # Verify tables exist
        print("\n3. Verifying table structure...")
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        required_tables = ['users', 'user_profiles', 'assessments', 'recommendations', 'saved_jobs']
        
        print("\n   Required tables:")
        all_exist = True
        for table in required_tables:
            if table in existing_tables:
                print(f"   ✅ {table} - EXISTS")
            else:
                print(f"   ❌ {table} - MISSING")
                all_exist = False
        
        if not all_exist:
            print("\n   ⚠️  Some tables are missing. Creating them now...")
            Base.metadata.create_all(bind=engine)
            print("   ✅ All tables created!")
        
        # Check users table structure
        print("\n4. Checking 'users' table structure (for sign up)...")
        if 'users' in existing_tables:
            columns = inspector.get_columns('users')
            print("   Columns in 'users' table:")
            for col in columns:
                print(f"      - {col['name']} ({col['type']})")
            
            # Verify required columns for sign up
            required_columns = ['id', 'email', 'name', 'hashed_password']
            column_names = [col['name'] for col in columns]
            
            print("\n   Required columns for sign up:")
            all_columns_exist = True
            for req_col in required_columns:
                if req_col in column_names:
                    print(f"      ✅ {req_col}")
                else:
                    print(f"      ❌ {req_col} - MISSING!")
                    all_columns_exist = False
            
            if all_columns_exist:
                print("\n   ✅ All required columns exist! Sign up will work correctly.")
            else:
                print("\n   ⚠️  Missing required columns. Recreating table...")
                Base.metadata.drop_all(bind=engine, tables=[User.__table__])
                Base.metadata.create_all(bind=engine)
                print("   ✅ Table recreated with all columns!")
        
        print("\n" + "=" * 70)
        print("✅ DATABASE SETUP COMPLETE!")
        print("=" * 70)
        print("\nTables ready for:")
        print("  ✅ User Sign Up")
        print("  ✅ User Login")
        print("  ✅ Profile Management")
        print("  ✅ Assessments")
        print("  ✅ Recommendations")
        print("  ✅ Job Search")
        print("\nYou can now run: python run.py")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check if database 'career_recommendation' exists")
        print("2. Verify connection string in .env file")
        print("3. Check if user 'sa' has CREATE TABLE permissions")
        print("4. Ensure ODBC Driver 17 is installed")
        return False

if __name__ == "__main__":
    verify_and_create_tables()

