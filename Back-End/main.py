from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from database import Base, engine, get_db, test_connection
from sqlalchemy import text
from models import User, UserProfile, Assessment, Recommendation, SavedJob
from schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ProfileCreate, ProfileResponse,
    AssessmentCreate, AssessmentResponse,
    RecommendationResponse, RecommendationRequest,
    JobSearchRequest, JobResponse,
    MarketTrendsResponse
)
from auth import (
    authenticate_user, get_password_hash, create_access_token,
    get_current_active_user, get_current_user
)
from config import settings
from services import (
    RecommendationService, ProfileService, JobService, MarketTrendsService
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Career Path Recommendation System API",
    description="Backend API for AI-powered career recommendation system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTHENTICATION ROUTES ====================

@app.post("/api/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/auth/login-json", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with JSON body (alternative to form data)"""
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

# ==================== PROFILE ROUTES ====================

@app.get("/api/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@app.post("/api/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create or update user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    # Calculate profile completion
    profile_dict = profile_data.dict()
    profile_dict['user_id'] = current_user.id
    completion = ProfileService.calculate_profile_completion(profile_dict)
    
    if profile:
        # Update existing profile
        for key, value in profile_data.dict(exclude_unset=True).items():
            setattr(profile, key, value)
        profile.profile_completion = completion
    else:
        # Create new profile
        profile = UserProfile(
            user_id=current_user.id,
            **profile_data.dict(),
            profile_completion=completion
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return profile

@app.put("/api/profile", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update profile fields
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    # Recalculate completion
    profile_dict = profile.dict()
    profile_dict.update(profile_data.dict(exclude_unset=True))
    profile.profile_completion = ProfileService.calculate_profile_completion(profile_dict)
    
    db.commit()
    db.refresh(profile)
    return profile

# ==================== ASSESSMENT ROUTES ====================

@app.post("/api/assessment", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create or update assessment"""
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    
    if assessment:
        assessment.assessment_data = assessment_data.assessment_data
        assessment.completed = True
    else:
        assessment = Assessment(
            user_id=current_user.id,
            assessment_data=assessment_data.assessment_data,
            completed=True
        )
        db.add(assessment)
    
    db.commit()
    db.refresh(assessment)
    return assessment

@app.get("/api/assessment", response_model=AssessmentResponse)
def get_assessment(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user assessment"""
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    return assessment

# ==================== RECOMMENDATION ROUTES ====================

@app.post("/api/recommendations/generate", response_model=List[RecommendationResponse])
def generate_recommendations(
    request: RecommendationRequest = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate career recommendations based on assessment"""
    # Get user's assessment
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    if not assessment or not assessment.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete the assessment first"
        )
    
    # Generate recommendations
    recommendations_data = RecommendationService.generate_recommendations(
        assessment.assessment_data
    )
    
    # Save recommendations to database
    saved_recommendations = []
    for rec_data in recommendations_data:
        # Check if recommendation already exists
        existing = db.query(Recommendation).filter(
            Recommendation.user_id == current_user.id,
            Recommendation.career_title == rec_data["title"]
        ).first()
        
        if existing:
            existing.match_percentage = rec_data["match_percentage"]
            existing.recommendation_data = rec_data
            saved_recommendations.append(existing)
        else:
            new_rec = Recommendation(
                user_id=current_user.id,
                career_title=rec_data["title"],
                match_percentage=rec_data["match_percentage"],
                recommendation_data=rec_data
            )
            db.add(new_rec)
            saved_recommendations.append(new_rec)
    
    db.commit()
    for rec in saved_recommendations:
        db.refresh(rec)
    
    return saved_recommendations

@app.get("/api/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's recommendations"""
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.match_percentage.desc()).all()
    
    return recommendations

@app.put("/api/recommendations/{recommendation_id}/save")
def save_recommendation(
    recommendation_id: int,
    saved: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save or unsave a recommendation"""
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    recommendation.saved = saved
    db.commit()
    return {"message": "Recommendation updated", "saved": saved}

# ==================== JOB SEARCH ROUTES ====================

@app.post("/api/jobs/search", response_model=List[JobResponse])
def search_jobs(
    search_request: JobSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Search for jobs"""
    filters = {
        "location": search_request.location,
        "experience": search_request.experience,
        "job_type": search_request.job_type,
        "salary": search_request.salary
    }
    
    jobs = JobService.search_jobs(
        search_term=search_request.search_term,
        filters=filters
    )
    
    return jobs

@app.get("/api/jobs/saved", response_model=List[dict])
def get_saved_jobs(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's saved jobs"""
    saved_jobs = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id
    ).all()
    
    return [job.job_data for job in saved_jobs]

@app.post("/api/jobs/save")
def save_job(
    job_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save a job"""
    saved_job = SavedJob(
        user_id=current_user.id,
        job_title=job_data.get("title", ""),
        company=job_data.get("company", ""),
        location=job_data.get("location", ""),
        salary=job_data.get("salary", ""),
        job_data=job_data
    )
    db.add(saved_job)
    db.commit()
    return {"message": "Job saved successfully"}

# ==================== MARKET TRENDS ROUTES ====================

@app.get("/api/market-trends", response_model=MarketTrendsResponse)
def get_market_trends(current_user: User = Depends(get_current_active_user)):
    """Get market trends data"""
    trends = MarketTrendsService.get_market_trends()
    return trends

# ==================== HEALTH CHECK ====================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "AI Career Path Recommendation System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/database/test")
def test_database_connection():
    """Test database connection"""
    try:
        # Test connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        
        # Get database info
        db_url = settings.DATABASE_URL
        if '@' in db_url:
            db_info = db_url.split('@')[-1].split('/')[-1].split('?')[0]
        else:
            db_info = "sqlite"
        
        return {
            "status": "connected",
            "database": db_info,
            "database_type": "SQL Server" if "mssql" in db_url.lower() else "Other"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "hint": "Check SQL Server is running and connection string is correct"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

