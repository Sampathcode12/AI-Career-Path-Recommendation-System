from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Profile Schemas
class ProfileCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    education_level: Optional[str] = None
    current_role: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str]
    email: Optional[str]
    education_level: Optional[str]
    current_role: Optional[str]
    location: Optional[str]
    skills: Optional[str]
    interests: Optional[str]
    bio: Optional[str]
    linkedin: Optional[str]
    portfolio: Optional[str]
    profile_completion: float
    
    class Config:
        from_attributes = True

# Assessment Schemas
class AssessmentCreate(BaseModel):
    assessment_data: Dict[str, Any]

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_data: Dict[str, Any]
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationCreate(BaseModel):
    career_title: str
    match_percentage: float
    recommendation_data: Dict[str, Any]

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    career_title: str
    match_percentage: float
    recommendation_data: Dict[str, Any]
    saved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class RecommendationRequest(BaseModel):
    assessment_id: Optional[int] = None

# Job Search Schemas
class JobSearchRequest(BaseModel):
    search_term: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    type: str
    experience: str
    description: str
    requirements: List[str]
    match: float
    posted: str

# Market Trends Schemas
class MarketTrendsResponse(BaseModel):
    trending_skills: List[Dict[str, Any]]
    salary_ranges: List[Dict[str, Any]]
    demand_growth: Dict[str, Any]
    skill_distribution: Dict[str, Any]


