from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration - SQL Server
    # Update this connection string with your SQL Server credentials
    
    # SQL Server Connection String Format:
    # mssql+pyodbc://username:password@server:port/database?driver=ODBC+Driver+17+for+SQL+Server
    
    # Example with SQL Server Authentication:
    DATABASE_URL: str = "mssql+pyodbc://sa:YourPassword123@localhost:1433/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server"
    
    # Example with Windows Authentication:
    # DATABASE_URL: str = "mssql+pyodbc://localhost/career_recommendation?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
    
    # Alternative using pymssql (simpler, but less features):
    # DATABASE_URL: str = "mssql+pymssql://username:password@localhost:1433/career_recommendation"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production-use-env-variable"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Configuration
    API_V1_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
