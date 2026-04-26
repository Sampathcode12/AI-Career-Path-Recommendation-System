# System Features — AI Career Path Recommendation System

This document lists the five core features of the system and where they are implemented.

---

## 1. Real-Time Job Market Analysis

**Description:** Live job market data, demand trends, salary ranges, and hiring insights to support career decisions.

**Where in the system:**
- **Frontend:** [Market Trends](/dashboard) page (Dashboard) — job demand growth charts, trending skills, salary ranges by level, skill distribution, top hiring regions.
- **Backend:** `GET /api/market-trends` — returns market trend categories and data (extend with real data feeds for full real-time analysis).

---

## 2. Multi-Career Path Exploration

**Description:** Explore and compare multiple career paths, with learning steps, requirements, and fit based on profile and assessment.

**Where in the system:**
- **Frontend:** [Recommendation](/recommendation) page — AI-generated career recommendations with match %, salary, growth, skills, requirements, and learning paths; [Top 10 Jobs](/top-jobs) — browse and compare top roles with career path steps.
- **Backend:** `POST /api/recommendations/generate`, `GET /api/recommendations` — generate and retrieve career recommendations.

---

## 3. Scalable Web-Based System

**Description:** A web-based platform that scales to many users, with a React frontend and REST API backend.

**Where in the system:**
- **Frontend:** React SPA (Vite) — responsive UI; authentication; Profile, Assessment, Recommendation, Job Search, Market Trends, Skill Gap pages.
- **Backend:** .NET 8 Web API — JWT auth, SQL Server, async services; ready for horizontal scaling (stateless API, database-backed).
- **Architecture:** See `docs/UML-DIAGRAM-PROMPTS.md` for system architecture diagram (Front End ↔ Back End ↔ AI Model ↔ Database).

---

## 4. AI-Based Career Recommendation

**Description:** Personalized career recommendations powered by AI (LLM or ML) using profile and assessment data.

**Where in the system:**
- **Frontend:** [Recommendation](/recommendation) page — “AI-Based Career Recommendation”; user generates and views AI-driven career suggestions.
- **Backend:** `RecommendationService.GenerateAsync` — intended to call AI/LLM with profile + assessment; currently placeholder (see `docs/AI-ML-MODULE-RECOMMENDATION.md` for integration).
- **Data:** Profile (skills, interests, education, etc.) + Assessment (skill levels, work preferences) → AI → list of careers (title, description, category).

---

## 5. Industry Skill Gap Analysis

**Description:** View skill gaps by industry: which skills are in demand vs. supply, and how they vary by sector.

**Where in the system:**
- **Frontend:** [Industry Skill Gap](/skill-gap) page — industry-wise skill demand, gap indicators, and suggested skills to build.
- **Backend:** Can be extended with `GET /api/skill-gap` or derived from market trends; current page uses structured mock data by industry.

---

## Quick reference

| Feature | Primary page / API |
|--------|---------------------|
| Real-Time Job Market Analysis | Dashboard (Market Trends), `GET /api/market-trends` |
| Multi-Career Path Exploration | Recommendation, Top 10 Jobs, `GET/POST /api/recommendations` |
| Scalable Web-Based System | Full app (React + .NET API) |
| AI-Based Career Recommendation | Recommendation, `POST /api/recommendations/generate` |
| Industry Skill Gap Analysis | Skill Gap, (optional `GET /api/skill-gap`) |
