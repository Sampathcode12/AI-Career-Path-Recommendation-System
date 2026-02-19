"""
Quick test script to verify SQL Server connection
Update the connection details below and run: python test_sql_server.py
"""

import pyodbc

# ============================================
# UPDATE THESE VALUES
# ============================================
SERVER = 'localhost'  # Use 'localhost\SQLEXPRESS' for Express edition
DATABASE = 'career_recommendation'
USERNAME = 'sa'  # Your SQL Server username
PASSWORD = 'YourPassword'  # Your SQL Server password
# ============================================

def test_connection():
    """Test SQL Server connection"""
    try:
        print("Testing SQL Server connection...")
        print(f"Server: {SERVER}")
        print(f"Database: {DATABASE}")
        print(f"Username: {USERNAME}")
        print("-" * 50)
        
        # Build connection string
        conn_str = (
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'SERVER={SERVER};'
            f'DATABASE={DATABASE};'
            f'UID={USERNAME};'
            f'PWD={PASSWORD}'
        )
        
        # Connect
        conn = pyodbc.connect(conn_str)
        print("✅ Connection successful!")
        
        # Get SQL Server version
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        print(f"\nSQL Server Version:")
        print(version.split('\n')[0])
        
        # Check if database exists
        cursor.execute("SELECT DB_NAME() AS CurrentDatabase")
        db_name = cursor.fetchone()[0]
        print(f"\nCurrent Database: {db_name}")
        
        # Test query
        cursor.execute("SELECT 1 AS test")
        result = cursor.fetchone()
        print(f"Test Query Result: {result[0]}")
        
        conn.close()
        print("\n✅ All tests passed! SQL Server is ready to use.")
        return True
        
    except pyodbc.Error as e:
        print(f"\n❌ Connection failed!")
        print(f"Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check if SQL Server is running")
        print("2. Verify username and password")
        print("3. Check if database exists")
        print("4. Verify ODBC Driver 17 is installed")
        print("5. For Express edition, use: localhost\\SQLEXPRESS")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("SQL Server Connection Test")
    print("=" * 50)
    print()
    
    test_connection()
    
    print("\n" + "=" * 50)
    print("Next Steps:")
    print("1. Update .env file with connection string")
    print("2. Run: python run.py")
    print("=" * 50)


