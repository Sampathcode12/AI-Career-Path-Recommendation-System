from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    full_name = Column(String)
    email = Column(String)
    education_level = Column(String)
    current_role = Column(String)
    location = Column(String)
    skills = Column(Text)  # JSON string or comma-separated
    interests = Column(Text)
    bio = Column(Text)
    linkedin = Column(String)
    portfolio = Column(String)
    profile_completion = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    assessment_data = Column(JSON)  # Store all assessment responses
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    career_title = Column(String, nullable=False)
    match_percentage = Column(Float, nullable=False)
    recommendation_data = Column(JSON)  # Store detailed recommendation data
    saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    job_title = Column(String, nullable=False)
    company = Column(String)
    location = Column(String)
    salary = Column(String)
    job_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


