from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models import UserProfile, Assessment, Recommendation

class RecommendationService:
    """Service for generating career recommendations"""
    
    @staticmethod
    def calculate_match_percentage(assessment_data: Dict[str, Any], career_requirements: Dict[str, Any]) -> float:
        """Calculate match percentage based on assessment and career requirements"""
        # Simple matching algorithm - can be enhanced with ML
        total_score = 0
        max_score = 0
        
        # Technical skills matching
        # Handle both dict format and direct key format
        tech_skills = {}
        if 'technical_skills' in assessment_data:
            tech_skills = assessment_data.get('technical_skills', {})
        else:
            # Direct keys like 'programming', 'dataAnalysis', etc.
            tech_skills = {k: v for k, v in assessment_data.items() 
                          if k in ['programming', 'dataAnalysis', 'machineLearning', 
                                  'webDevelopment', 'database']}
        
        required_tech = career_requirements.get('technical_skills', {})
        
        for skill, level in required_tech.items():
            max_score += 5  # Max score per skill
            user_level = tech_skills.get(skill, 0)
            if isinstance(user_level, str):
                user_level = int(user_level)
            total_score += min(user_level, 5)
        
        # Soft skills matching
        soft_skills = {}
        if 'soft_skills' in assessment_data:
            soft_skills = assessment_data.get('soft_skills', {})
        else:
            # Direct keys
            soft_skills = {k: v for k, v in assessment_data.items() 
                          if k in ['communication', 'leadership', 'problemSolving', 
                                  'teamwork', 'creativity']}
        
        required_soft = career_requirements.get('soft_skills', {})
        
        for skill, level in required_soft.items():
            max_score += 5
            user_level = soft_skills.get(skill, 0)
            if isinstance(user_level, str):
                user_level = int(user_level)
            total_score += min(user_level, 5)
        
        if max_score == 0:
            return 0.0
        
        match_percentage = (total_score / max_score) * 100
        return round(match_percentage, 2)
    
    @staticmethod
    def generate_recommendations(assessment_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate career recommendations based on assessment"""
        
        # Career database with requirements
        careers = [
            {
                "title": "Data Scientist",
                "description": "Analyze complex data to help organizations make data-driven decisions.",
                "salary": "$95,000 - $140,000",
                "growth": "+18%",
                "technical_skills": {
                    "programming": 4,
                    "dataAnalysis": 4,
                    "machineLearning": 4,
                    "database": 3
                },
                "soft_skills": {
                    "communication": 3,
                    "problemSolving": 4,
                    "creativity": 3
                },
                "requirements": {
                    "education": "Bachelor's in Computer Science, Data Science, or related",
                    "experience": "2-5 years",
                    "certifications": ["Machine Learning", "Data Analytics", "Python Programming"]
                },
                "skills": ["Python", "Machine Learning", "Statistics", "Data Visualization"],
                "learningPath": [
                    {"step": 1, "title": "Learn Python Fundamentals", "duration": "2-3 months"},
                    {"step": 2, "title": "Master Data Analysis Tools", "duration": "1-2 months"},
                    {"step": 3, "title": "Study Machine Learning", "duration": "3-4 months"},
                    {"step": 4, "title": "Build Portfolio Projects", "duration": "2-3 months"},
                ]
            },
            {
                "title": "Software Engineer",
                "description": "Design, develop, and maintain software applications and systems.",
                "salary": "$85,000 - $130,000",
                "growth": "+15%",
                "technical_skills": {
                    "programming": 5,
                    "webDevelopment": 4,
                    "database": 3
                },
                "soft_skills": {
                    "communication": 3,
                    "teamwork": 4,
                    "problemSolving": 4
                },
                "requirements": {
                    "education": "Bachelor's in Computer Science or Software Engineering",
                    "experience": "1-4 years",
                    "certifications": ["Full Stack Development", "Cloud Computing"]
                },
                "skills": ["JavaScript", "React", "Node.js", "System Design"],
                "learningPath": [
                    {"step": 1, "title": "Learn Programming Fundamentals", "duration": "3-4 months"},
                    {"step": 2, "title": "Master Web Technologies", "duration": "2-3 months"},
                    {"step": 3, "title": "Learn Software Architecture", "duration": "2-3 months"},
                    {"step": 4, "title": "Build Real Projects", "duration": "3-4 months"},
                ]
            },
            {
                "title": "Business Analyst",
                "description": "Bridge the gap between business needs and technical solutions.",
                "salary": "$70,000 - $110,000",
                "growth": "+12%",
                "technical_skills": {
                    "dataAnalysis": 3,
                    "database": 2
                },
                "soft_skills": {
                    "communication": 5,
                    "leadership": 3,
                    "problemSolving": 4,
                    "teamwork": 4
                },
                "requirements": {
                    "education": "Bachelor's in Business, IT, or related field",
                    "experience": "1-3 years",
                    "certifications": ["Business Analysis", "Agile/Scrum", "SQL"]
                },
                "skills": ["SQL", "Business Analysis", "Project Management", "Communication"],
                "learningPath": [
                    {"step": 1, "title": "Learn Business Fundamentals", "duration": "2-3 months"},
                    {"step": 2, "title": "Master Data Analysis", "duration": "1-2 months"},
                    {"step": 3, "title": "Study Project Management", "duration": "2-3 months"},
                    {"step": 4, "title": "Gain Industry Experience", "duration": "3-6 months"},
                ]
            }
        ]
        
        recommendations = []
        for career in careers:
            match = RecommendationService.calculate_match_percentage(assessment_data, career)
            recommendations.append({
                **career,
                "match_percentage": match
            })
        
        # Sort by match percentage
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations

class ProfileService:
    """Service for profile management"""
    
    @staticmethod
    def calculate_profile_completion(profile_data: Dict[str, Any]) -> float:
        """Calculate profile completion percentage"""
        required_fields = ['full_name', 'email', 'education_level', 'skills', 'interests']
        optional_fields = ['current_role', 'location', 'bio', 'linkedin', 'portfolio']
        
        total_fields = len(required_fields) + len(optional_fields)
        completed_fields = 0
        
        for field in required_fields:
            if profile_data.get(field) and str(profile_data[field]).strip():
                completed_fields += 2  # Required fields count double
        
        for field in optional_fields:
            if profile_data.get(field) and str(profile_data[field]).strip():
                completed_fields += 1
        
        completion = (completed_fields / (len(required_fields) * 2 + len(optional_fields))) * 100
        return round(min(completion, 100.0), 2)

class JobService:
    """Service for job search"""
    
    @staticmethod
    def search_jobs(search_term: str = None, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search jobs based on criteria"""
        # Mock job data - in production, this would query a job database/API
        jobs = [
            {
                "id": 1,
                "title": "Senior Data Scientist",
                "company": "Tech Corp",
                "location": "San Francisco, CA",
                "salary": "$120,000 - $160,000",
                "type": "Full-time",
                "experience": "3-5 years",
                "posted": "2 days ago",
                "match": 92,
                "description": "We are looking for an experienced Data Scientist to join our team...",
                "requirements": ["Python", "Machine Learning", "SQL", "Statistics"],
            },
            {
                "id": 2,
                "title": "Data Scientist",
                "company": "Data Analytics Inc",
                "location": "Remote",
                "salary": "$95,000 - $130,000",
                "type": "Full-time",
                "experience": "2-4 years",
                "posted": "5 days ago",
                "match": 87,
                "description": "Join our growing data science team to build innovative ML solutions...",
                "requirements": ["Python", "R", "TensorFlow", "Data Visualization"],
            },
            {
                "id": 3,
                "title": "Junior Data Scientist",
                "company": "StartupXYZ",
                "location": "New York, NY",
                "salary": "$75,000 - $95,000",
                "type": "Full-time",
                "experience": "0-2 years",
                "posted": "1 week ago",
                "match": 82,
                "description": "Great opportunity for entry-level data scientists to grow their career...",
                "requirements": ["Python", "SQL", "Statistics", "Machine Learning Basics"],
            },
        ]
        
        # Apply filters
        if search_term:
            jobs = [j for j in jobs if search_term.lower() in j["title"].lower() or 
                   search_term.lower() in j["company"].lower()]
        
        if filters:
            if filters.get("location"):
                jobs = [j for j in jobs if filters["location"].lower() in j["location"].lower()]
            if filters.get("experience"):
                jobs = [j for j in jobs if j["experience"] == filters["experience"]]
            if filters.get("job_type"):
                jobs = [j for j in jobs if j["type"] == filters["job_type"]]
        
        return jobs

class MarketTrendsService:
    """Service for market trends data"""
    
    @staticmethod
    def get_market_trends() -> Dict[str, Any]:
        """Get market trends data"""
        return {
            "trending_skills": [
                {"name": "Machine Learning", "growth": "+25%", "demand": "Very High"},
                {"name": "Cloud Computing", "growth": "+22%", "demand": "Very High"},
                {"name": "Cybersecurity", "growth": "+20%", "demand": "High"},
                {"name": "Data Engineering", "growth": "+18%", "demand": "High"},
                {"name": "DevOps", "growth": "+15%", "demand": "High"},
            ],
            "salary_ranges": [
                {"role": "Entry Level", "range": "$60k - $85k", "growth": "+12%"},
                {"role": "Mid Level", "range": "$85k - $120k", "growth": "+15%"},
                {"role": "Senior Level", "range": "$120k - $180k", "growth": "+18%"},
                {"role": "Lead/Principal", "range": "$180k - $250k+", "growth": "+20%"},
            ],
            "demand_growth": {
                "data_science": [100, 115, 130, 145, 165, 185],
                "software_engineering": [100, 108, 118, 128, 140, 152],
                "years": ["2020", "2021", "2022", "2023", "2024", "2025"]
            },
            "skill_distribution": {
                "technical": 40,
                "soft_skills": 25,
                "domain_knowledge": 20,
                "tools": 15
            }
        }

