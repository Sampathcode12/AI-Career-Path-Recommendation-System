from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import urllib.parse

def get_database_url():
    """Get database URL with proper encoding for special characters"""
    db_url = settings.DATABASE_URL
    
    # Handle SQL Server connection strings with special characters
    if "mssql" in db_url or "sqlserver" in db_url.lower():
        # Parse and encode password if it contains special characters
        parsed = urllib.parse.urlparse(db_url)
        if parsed.password:
            # URL encode special characters in password
            encoded_password = urllib.parse.quote_plus(parsed.password)
            db_url = db_url.replace(parsed.password, encoded_password)
    
    return db_url

# Create database engine
def create_database_engine():
    """Create database engine based on database type"""
    db_url = get_database_url()
    
    # Connection arguments based on database type
    connect_args = {}
    
    if "sqlite" in db_url:
        connect_args = {"check_same_thread": False}
    elif "mysql" in db_url:
        connect_args = {
            "charset": "utf8mb4",
            "connect_timeout": 10
        }
    elif "mssql" in db_url or "sqlserver" in db_url.lower():
        connect_args = {
            "timeout": 30,
            "autocommit": False,
            "fast_executemany": True  # Faster inserts for SQL Server
        }
    elif "postgresql" in db_url:
        connect_args = {
            "connect_timeout": 10
        }
    
    # SQL Server specific engine configuration
    engine_kwargs = {
        "connect_args": connect_args,
        "pool_pre_ping": True,  # Verify connections before using
        "echo": False  # Set to True for SQL query logging
    }
    
    # Add pool_recycle for non-SQLite databases
    if "sqlite" not in db_url:
        engine_kwargs["pool_recycle"] = 3600  # Recycle connections after 1 hour
    
    return create_engine(db_url, **engine_kwargs)

engine = create_database_engine()

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """Dependency function to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test database connection
def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            # Use text() for SQL Server compatibility
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check if SQL Server is running")
        print("2. Verify connection string in .env file")
        print("3. Check if ODBC Driver 17 is installed")
        print("4. Verify database exists")
        return False
