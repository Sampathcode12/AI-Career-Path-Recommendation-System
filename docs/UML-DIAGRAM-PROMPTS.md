# UML Diagram Prompts — AI Career Path Recommendation System

Use these prompts with an AI (e.g. ChatGPT, Claude) or a diagram tool (e.g. Mermaid, PlantUML, draw.io) to generate **Use Case**, **Activity**, **Class**, **Sequence**, and **System Architecture** diagrams. All diagrams must include **Front End**, **Back End**, and **AI Model** and how they connect.

---

## Combined prompt (all four diagram types)

Copy the prompt below to generate **Use Case**, **ActiAvity**, **Class**, and **System Architecture** diagrams in one request. Specify your preferred format (e.g. Mermaid, PlantUML, draw.io, or textual description).

```
Generate diagrams for the "AI Career Path Recommendation System". Include in every diagram: (1) Front End — React SPA with auth, profile, assessment, recommendations, jobs, market trends; (2) Back End — REST API (e.g. .NET) with JWT auth, profile/assessment/recommendations/jobs/market-trends APIs; (3) AI Model — external or in-process LLM/ML service that the Back End calls with user profile + assessment to generate career recommendations; (4) how these three layers connect (HTTP/REST from Front End to Back End; Back End calls AI Model; Back End uses a database).

Produce these four diagrams:

1. **Use Case Diagram** — Actor: User. Use cases: Sign Up, Login, Logout, Complete/Update Profile, Take Assessment, View Recommendations (includes "Generate recommendations using AI"), Save/Unsave Recommendation, Search Jobs, View Top 10 Jobs, Save Job, View Market Trends, View Dashboard/Home. Show "AI Model" as external actor or internal use case used by View Recommendations.

2. **Activity Diagram** — Swimlanes: User, Frontend, Backend, AI Model, Database. Flows: Authentication; Profile/Assessment onboarding; Get recommendations (Frontend → Backend → AI Model → Backend → Database → Frontend); Job search; Logout.

3. **Class Diagram** — Domain entities: User, UserProfile, Assessment, CareerRecommendation, SavedJob, MarketTrend (and optionally UserSignInDetail). Add an AI component: interface or service (e.g. ICareerRecommendationAI / AI/LLM Service) that RecommendationService depends on; input = profile + assessment, output = career suggestions.

4. **System Architecture Diagram** — High-level deployment/component view. Three main boxes: (A) **Front End** — React SPA, browser; (B) **Back End** — REST API server (controllers, services, JWT auth); (C) **AI Model** — LLM/ML service (e.g. OpenAI API, Azure OpenAI, or local model). Show: Front End ↔ Back End (HTTPS/REST, JSON); Back End ↔ AI Model (API call with user context, returns suggestions); Back End ↔ Database (persistence). Optionally show Database as a fourth component. Label the connections (e.g. "REST/JSON", "Recommendation request", "SQL/ORM").
```

---

## AI model in the diagrams

| Diagram | How the AI model is shown |
|--------|----------------------------|
| **Use case** | Internal use case "Generate recommendations using AI" (included by "View Recommendations"); optionally an external actor "AI Model" that the system calls. |
| **Class** | Interface or service (e.g. `ICareerRecommendationAI` / "AI/LLM Service") that `RecommendationService` depends on; input = profile + assessment, output = career suggestions. |
| **Sequence** | Separate lifeline "AI Model / LLM Service"; RecommendationService sends profile + assessment context and receives suggested careers before saving to DB. |
| **Activity** | Separate swimlane "AI Model"; actions: receive context → run inference → return suggestions; Backend sends context and maps AI response to entities. |
| **System architecture** | Separate component "AI Model" (LLM/ML service); Back End connects to it via API; data flow: Back End → AI Model (context), AI Model → Back End (suggestions). |

---

## 1. Use Case Diagram

**Prompt:**

```
Create a UML use case diagram for an "AI Career Path Recommendation System" with the following:

ACTORS:
- User (primary): A job seeker or career explorer who uses the system. They must be registered and logged in for all use cases except Sign Up and Login.

USE CASES (include in the system boundary "AI Career Path Recommendation System"):
- Sign Up — Create account (name, email, password)
- Login — Authenticate with email and password
- Logout — End session
- Complete/Update Profile — Enter or edit skills, interests, experience level, education, preferred industries, location, bio, LinkedIn URL, portfolio URL
- Take Assessment — Answer career assessment questions; system stores answers and may produce a result summary
- View Recommendations — See AI-generated career recommendations (system uses an AI/ML model to generate these)
- Save/Unsave Recommendation — Mark a recommendation as saved or remove from saved
- Search Jobs — Search or filter jobs by criteria (e.g. sector, category, salary, growth, region)
- View Top 10 Jobs — Browse a list of top/recommended jobs with details and optional skill/career path info
- Save Job — Save a job to "My Saved Jobs"
- View Market Trends — View dashboard with market trends (e.g. salary, growth %, remote opportunities)
- View Dashboard/Home — See home dashboard with profile completion, quick stats (recommended careers count, skills assessed, learning paths, job matches), skill growth trend, and quick actions

AI MODEL PART:
- Include an internal/system use case "Generate recommendations using AI" that is included by "View Recommendations". The system (not the user) invokes the AI model with profile + assessment data; the AI model returns suggested careers that the system then stores and displays.
- Optionally show a secondary actor "AI Model" or "AI/ML Service" (external system) that the main system uses when performing "View Recommendations" — e.g. «include» from "View Recommendations" to "Generate recommendations using AI", and the AI model as an external actor that the system calls.

RELATIONSHIPS:
- User is linked to all use cases (association).
- "Take Assessment" may extend or be used by "View Recommendations" (recommendations can depend on assessment).
- "Complete/Update Profile" and "Take Assessment" are typically performed before "View Recommendations" (you can show include/extend if your tool supports it).
- "View Recommendations" «include» "Generate recommendations using AI" (system calls AI model with user context).

Draw the system as one rectangle; place the User actor outside on the left; place all use cases inside the system boundary. Show the AI model as either an internal use case or an external actor (system boundary). Use standard UML use case notation (ellipses for use cases, stick figure for actor).
```

---

## 2. Class Diagram

**Prompt:**

```
Create a UML class diagram for the "AI Career Path Recommendation System" backend (C# / Entity Framework). Show only the domain entities and their relationships; no controllers or DTOs.

CLASSES AND ATTRIBUTES:

1. User
   - Id: int (PK)
   - Name: string
   - Email: string
   - PasswordHash: string
   - CreatedAt: DateTime
   - Relationships: one UserProfile (optional), many Assessment, many CareerRecommendation, many SavedJob

2. UserProfile
   - Id: int (PK)
   - UserId: int (FK, unique)
   - Skills: string (nullable)
   - Interests: string (nullable)
   - ExperienceLevel: string (nullable)
   - Education: string (nullable)
   - PreferredIndustries: string (nullable)
   - Location: string (nullable)
   - Bio: string (nullable)
   - LinkedInUrl: string (nullable)
   - PortfolioUrl: string (nullable)
   - UpdatedAt: DateTime (nullable)
   - Relationship: one User (required)

3. UserSignInDetail
   - Id: int (PK)
   - UserId: int (FK)
   - Email: string
   - SignedInAt: DateTime
   - Relationship: one User

4. Assessment
   - Id: int (PK)
   - UserId: int (FK)
   - AnswersJson: string (nullable)
   - ResultSummary: string (nullable)
   - CreatedAt: DateTime
   - Relationship: one User

5. CareerRecommendation
   - Id: int (PK)
   - UserId: int (FK)
   - Title: string
   - Description: string (nullable)
   - Category: string (nullable)
   - Saved: bool
   - SortOrder: int
   - CreatedAt: DateTime
   - Relationship: one User

6. SavedJob
   - Id: int (PK)
   - UserId: int (FK)
   - Title: string
   - Company: string (nullable)
   - Location: string (nullable)
   - Url: string (nullable)
   - Description: string (nullable)
   - SavedAt: DateTime
   - Relationship: one User

7. MarketTrend
   - Id: int (PK)
   - Category: string
   - Title: string
   - Description: string (nullable)
   - TrendDataJson: string (nullable)
   - UpdatedAt: DateTime
   - No association to User (reference data)

RELATIONSHIPS TO SHOW:
- User 1 ———— 0..1 UserProfile (one-to-one)
- User 1 ———— * Assessment (one-to-many)
- User 1 ———— * CareerRecommendation (one-to-many)
- User 1 ———— * SavedJob (one-to-many)
- User 1 ———— * UserSignInDetail (one-to-many)
- MarketTrend is standalone (no link to User)

AI MODEL PART:
- Add a component/interface for the AI layer. Option A: show an interface «interface» ICareerRecommendationAI (or similar) with a method such as GenerateRecommendations(profile, assessment) → List<CareerSuggestion>. Option B: show a class/service "CareerRecommendationAI" or "AI/LLM Service" that RecommendationService depends on — it takes UserProfile + Assessment (or summary) as input and returns suggested career titles/descriptions. Option C: show an external system "AI Model (LLM/ML)" as a separate box with a dependency from RecommendationService to it (e.g. «uses» or dashed arrow). The AI model has no persistent attributes in the app DB; it is invoked at recommendation-generation time with profile + assessment data and returns structured career suggestions that are then mapped to CareerRecommendation entities and saved.

Use standard UML: class boxes with three sections (name, attributes, methods optional); multiplicity on association ends (1, *, 0..1). Show the AI component/interface and its relationship to the recommendation flow.
```

---

## 3. Sequence Diagram

**Prompt:**

```
Create a UML sequence diagram for the scenario "User gets career recommendations" in the "AI Career Path Recommendation System". Include these participants (lifelines):

- User (actor)
- Frontend (React SPA)
- AuthController / Auth API
- RecommendationsController / Recommendations API
- RecommendationService (backend service)
- AI Model / LLM Service (e.g. OpenAI API, local ML model, or generic "AI Recommendation Engine")
- ApplicationDbContext / Database

FLOW:
1. User opens the app; Frontend checks for existing token. If none, User is redirected to Login.
2. User enters email and password; Frontend sends POST /api/auth/login-json to AuthController.
3. AuthController validates credentials, creates/returns JWT and user info; Frontend stores token.
4. User navigates to "Recommendations" (or "Generate recommendations").
5. Frontend may first GET /api/profile and GET /api/assessment to ensure profile/assessment exist (optional; you can simplify to just "request recommendations").
6. Frontend sends POST /api/recommendations/generate (with Authorization: Bearer token).
7. RecommendationsController receives request, calls RecommendationService.GenerateAsync(userId).
8. RecommendationService loads User, UserProfile, and latest Assessment from Database (ApplicationDbContext).
9. RecommendationService calls the AI Model / LLM Service with the user context (profile summary, assessment answers/summary) — e.g. "generate career recommendations for this user".
10. AI Model processes the input and returns a list of suggested careers (titles, descriptions, categories).
11. RecommendationService maps the AI output to CareerRecommendation entities, (optionally replaces existing recommendations), saves to Database, and returns DTOs to the Controller.
12. Controller returns list of recommendations to Frontend.
13. Frontend displays the list; User can save/unsave a recommendation (PUT /api/recommendations/{id}/save?saved=true|false).

AI MODEL PART: The AI Model is a distinct lifeline. Show the request from RecommendationService to AI Model (input: profile + assessment context) and the response (suggested careers). The AI can be an external API (e.g. REST call to LLM) or an in-process ML model; show it as one participant for clarity.

Draw lifelines vertically; show synchronous request/response messages between Frontend, Controllers, Service, AI Model, and Database. Use activation bars where a participant is processing. You can do one diagram for "Login then generate recommendations" or split into "Login" and "Generate recommendations" if you prefer.
```

---

## 4. Activity Diagram / Activity Flow Chart

**Prompt:**

```
Create a UML activity diagram (or a clear activity flow chart) for the "AI Career Path Recommendation System" showing the main user flows. Use swimlanes if possible: "User", "Frontend", "Backend", "AI Model", "Database".

MAIN FLOWS TO INCLUDE:

1. Authentication flow
   - Start → User opens app → [Has valid token?] → No → Show Login → User enters email/password → Frontend POST login → Backend validates → [Valid?] → No → Show error; Yes → Store token, redirect to Home.
   - [Has valid token?] → Yes → Load Home/Dashboard.

2. Onboarding / first-time flow (after login)
   - Home → [Profile complete?] → No → Prompt "Complete profile" → User goes to Profile → Fills form → Frontend POST/PUT profile → Backend saves → Profile complete.
   - [Profile complete?] → Yes → [Assessment done?] → No → Prompt "Take assessment" → User goes to Assessment → Submits answers → Frontend POST assessment → Backend saves → Assessment done.
   - [Assessment done?] → Yes → User can "View recommendations".

3. Get recommendations flow (include AI model)
   - User clicks "View recommendations" or "Generate recommendations" → Frontend POST /recommendations/generate → Backend loads profile + assessment from Database.
   - Backend sends user context (profile summary, assessment answers/summary) to the AI Model swimlane.
   - AI Model: receives input → runs inference (LLM/ML) → returns suggested careers (titles, descriptions, categories).
   - Backend receives AI output → maps to CareerRecommendation entities → saves to Database → returns list to Frontend → Frontend displays list.
   - User can "Save" or "Unsave" a recommendation (PUT save) → Backend updates CareerRecommendation.Saved.

4. Job search flow
   - User goes to Job Search → Applies filters (sector, category, etc.) → Frontend POST /jobs/search → Backend queries (or returns mock/filtered jobs) → Frontend displays results.
   - User can save a job → Frontend POST /jobs/save → Backend saves SavedJob.

5. Other actions (can be short)
   - View Top 10 Jobs: navigate → load list → display.
   - View Market Trends: navigate → GET /market-trends → display dashboard.
   - Logout: User clicks Logout → Frontend clears token → Redirect to Login.

AI MODEL PART: In the "Get recommendations" flow, show the AI Model as its own swimlane. Actions in that lane: "Receive profile + assessment context", "Run AI/LLM inference", "Return suggested careers". The Backend lane has actions "Send context to AI", "Receive AI response", "Map to entities & save". This makes it clear where the AI sits in the flow.

Use decision nodes (diamonds) for [Has token?], [Valid?], [Profile complete?], [Assessment done?]. Use rounded rectangles for actions, arrows for flow. Label key actions (e.g. "POST /auth/login", "Save profile", "Call AI model", "Generate recommendations"). You can draw one large diagram or separate diagrams per flow (e.g. "Authentication", "Recommendation flow (with AI)", "Job search").
```

---

## 5. System Architecture Diagram

**Prompt:**

```
Create a system architecture diagram (high-level component/deployment diagram) for the "AI Career Path Recommendation System". Show how the Front End, Back End, and AI Model connect. Use boxes for major components and arrows for data/control flow. Prefer a layered or left-to-right layout.

COMPONENTS TO INCLUDE:

1. FRONT END (client tier)
   - Label: "Front End" or "Client"
   - Sub-components or list: React SPA (single-page application), runs in the browser
   - Features: Login/Sign Up, Profile, Assessment, Recommendations, Job Search, Top 10 Jobs, Market Trends Dashboard, Home
   - Communicates with Back End via HTTPS/REST (JSON). Uses JWT in Authorization header for authenticated requests.

2. BACK END (server tier)
   - Label: "Back End" or "API Server"
   - Sub-components or list: REST API (e.g. .NET / ASP.NET Core), JWT authentication, Controllers (Auth, Profile, Assessment, Recommendations, Jobs, MarketTrends), Services (e.g. RecommendationService), ApplicationDbContext / ORM
   - Receives requests from Front End; validates JWT; serves profile, assessment, recommendations, jobs, market trends
   - Calls the AI Model when generating recommendations (POST /recommendations/generate)
   - Reads from and writes to the Database (User, UserProfile, Assessment, CareerRecommendation, SavedJob, MarketTrend)

3. AI MODEL (external or internal service)
   - Label: "AI Model" or "AI/LLM Service"
   - Description: LLM or ML service (e.g. OpenAI API, Azure OpenAI, or local model) that generates career recommendations
   - Input: user context (profile summary, assessment answers/summary) sent by the Back End
   - Output: list of suggested careers (titles, descriptions, categories) returned to the Back End
   - Connected only to the Back End (not to the Front End or Database). Back End maps AI output to CareerRecommendation entities and saves to Database.

4. DATABASE (optional but recommended)
   - Label: "Database"
   - Stores: User, UserProfile, Assessment, CareerRecommendation, SavedJob, MarketTrend (and optionally UserSignInDetail)
   - Connected to Back End only (ORM / SQL). Front End and AI Model do not access the database.

CONNECTIONS TO SHOW:
- Front End ←→ Back End: "HTTPS / REST API", "JSON", "JWT". Direction: Front End sends requests (login, profile, assessment, recommendations/generate, jobs/search, market-trends); Back End returns responses.
- Back End ←→ AI Model: "API call (recommendation request)", "Profile + Assessment context" (request), "Suggested careers" (response). Direction: Back End calls AI Model when generating recommendations; AI Model returns suggestions.
- Back End ←→ Database: "ORM / SQL", "Read/Write". Direction: Back End persists and loads users, profiles, assessments, recommendations, jobs, market trends.

Do not connect Front End directly to AI Model or Database. All user-facing logic goes through the Back End; the AI Model is used only by the Back End for recommendation generation.

Output as a diagram (e.g. Mermaid, PlantUML, or ASCII/box diagram) or as a clear textual description that can be drawn in draw.io or Lucidchart.
```

---

## Quick reference: system overview

| Layer        | Components |
|-------------|------------|
| **Frontend** | React SPA: Login, SignUp, Home, Profile, Assessment, Recommendation, Dashboard, JobSearch, Top10Jobs; AuthContext; API service (auth, profile, assessment, recommendations, jobs, market-trends). |
| **Backend**  | REST API (e.g. .NET): AuthController, ProfileController, AssessmentController, RecommendationsController, JobsController, MarketTrendsController; services for each; ApplicationDbContext; JWT auth. |
| **AI Model** | External or in-process AI/ML component used for recommendations: receives user context (UserProfile + Assessment summary), returns suggested careers (titles, descriptions, categories). Can be an LLM API (e.g. OpenAI, Azure OpenAI), a fine-tuned model, or a rules-based engine; RecommendationService calls it during POST /recommendations/generate and maps results to CareerRecommendation entities. |
| **Data**     | User, UserProfile, UserSignInDetail, Assessment, CareerRecommendation, SavedJob, MarketTrend. |

**Diagram index:** 1. Use Case | 2. Class | 3. Sequence | 4. Activity | 5. System Architecture

Use these prompts as-is or adapt them to your preferred diagram style (e.g. Mermaid, PlantUML, draw.io).
