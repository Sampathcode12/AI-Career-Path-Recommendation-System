"""
Script to create database tables automatically
Run this script to create all tables in your SQL Server database
"""
from database import Base, engine, test_connection
from models import User, UserProfile, Assessment, Recommendation, SavedJob

def create_tables():
    """Create all database tables"""
    print("=" * 60)
    print("Creating Database Tables...")
    print("=" * 60)
    
    # Test connection first
    print("\n1. Testing database connection...")
    if not test_connection():
        print("\n❌ Cannot connect to database. Please check your .env file.")
        return False
    
    # Create all tables
    print("\n2. Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # List created tables
        print("\n3. Created tables:")
        print("   - users")
        print("   - user_profiles")
        print("   - assessments")
        print("   - recommendations")
        print("   - saved_jobs")
        
        print("\n" + "=" * 60)
        print("✅ Database setup complete!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        print("\nTroubleshooting:")
        print("1. Check if database 'career_recommendation' exists")
        print("2. Verify connection string in .env file")
        print("3. Check if user has CREATE TABLE permissions")
        return False

if __name__ == "__main__":
    create_tables()

