# Methodology for Project Objectives — AI Career Path Recommendation System

This document maps **methodology** (approach, phases, and methods) to each of the five project **objectives**. Use it in your report and in the "Methodology" and "Aims and Objectives" slides of your presentation.

---

## Objectives (as stated)

1. To plan and create an AI-powered career path recommendation system that provides personalized guidance for users.
2. To use machine learning algorithms that analyze user skills, interests, and experiences to suggest optimal career paths.
3. To integrate an AI-based live-update dashboard displaying recommended careers, skill gaps, trending jobs, and predicted future opportunities.
4. To improve decision-making accuracy through continuous learning from user interactions and career data trends.
5. To measure the performance of the system based on recommendation accuracy, user engagement, and adaptability to evolving career data.

---

## Methodology aligned with each objective

### Objective 1: Plan and create an AI-powered career path recommendation system that provides personalized guidance for users

**Methodology:**

- **Requirements gathering** — Identify stakeholder needs (users, career counselors), define user stories (e.g. “As a user I want to get personalized career recommendations based on my profile”), and document functional and non-functional requirements.
- **System planning and design** — Produce project plan (WBS, schedule), system architecture (frontend, backend, database, AI service), and data flow (profile + assessment → AI → recommendations).
- **Iterative development** — Develop in phases: (1) core platform (auth, profile, assessment), (2) recommendation engine and AI integration, (3) dashboard and job features, (4) testing and refinement. Use an Agile-style cycle (plan → implement → test → review) so that “personalized guidance” is refined based on feedback.
- **Delivery** — Deploy the web application and provide user-facing documentation or onboarding so users can receive and act on personalized guidance.

---

### Objective 2: Use machine learning algorithms that analyze user skills, interests, and experiences to suggest optimal career paths

**Methodology:**

- **Data collection** — Collect inputs that describe the user: profile (skills, interests, education, experience level, location, preferences) and assessment (skill levels 1–5, work style, industry, environment, years of experience). Use in-app forms and/or external surveys (e.g. Google Forms) with a clear mapping to model features.
- **Feature engineering** — Define features from raw data: skill vectors, interest tags, experience level encoding, preference flags. Normalize and structure data for ML (e.g. numeric scales, categorical encoding).
- **Model selection and design** — Choose or design ML approaches suitable for career recommendation (e.g. content-based filtering from profile/assessment, collaborative filtering if enough user–career interaction data, hybrid, or LLM-based generation). Justify choice (data availability, interpretability, latency).
- **Training pipeline** — Implement data preprocessing, train/validation split, model training, and hyperparameter tuning. Use labeled or semi-labeled data (e.g. “saved” recommendations, user feedback) where available.
- **Integration** — Expose the model via an API (e.g. backend service) that takes user id or profile/assessment payload and returns ranked career suggestions; integrate with the existing recommendation flow in the application.

---

### Objective 3: Integrate an AI-based live-update dashboard displaying recommended careers, skill gaps, trending jobs, and predicted future opportunities

**Methodology:**

- **Dashboard design** — Define dashboard sections: (1) recommended careers, (2) skill gaps (current skills vs. required for target roles), (3) trending jobs (e.g. by sector, region, or time), (4) predicted future opportunities (e.g. emerging roles, growth areas). Use wireframes or mockups.
- **Data and API design** — Design APIs for: fetching recommendations (existing), skill-gap analysis (compare user skills to job/skill taxonomy), trending jobs (aggregated from job data or market-trends source), and predictions (model or rule-based). Support periodic or on-demand refresh.
- **Live-update strategy** — Implement “live” updates via: (1) refresh on page load or navigation, (2) periodic polling (e.g. every N minutes), or (3) user-triggered refresh. Ensure backend and AI components can serve updated data without full retrain for each request.
- **Frontend integration** — Build or extend the existing dashboard UI (e.g. React) to consume these APIs and display recommended careers, skill gaps, trending jobs, and predicted opportunities with clear labels and, where useful, filters or time ranges.

---

### Objective 4: Improve decision-making accuracy through continuous learning from user interactions and career data trends

**Methodology:**

- **Interaction logging** — Log user interactions: saved/unsaved recommendations, job saves, profile/assessment updates, and (if available) clicks or time-on-card. Store in a structured form (user id, item id, action, timestamp) for model and analytics use.
- **Feedback loop design** — Use interaction data as implicit feedback (e.g. “saved” = positive signal) to evaluate and, where appropriate, retrain or re-rank recommendations. Define update frequency (e.g. periodic batch retraining or online learning) and guardrails (e.g. stability, fairness).
- **Career data trends** — Ingest or compute trends (e.g. demand by role, sector, skill) from job postings or market-trends data. Use these to adjust recommendations or predictions so the system stays aligned with the labor market.
- **Evaluation of improvement** — Compare decision-making accuracy (e.g. relevance of recommendations, user engagement) before and after incorporating interactions and trends, using the metrics defined under Objective 5.

---

### Objective 5: Measure the performance of the system based on recommendation accuracy, user engagement, and adaptability to evolving career data

**Methodology:**

- **Recommendation accuracy** — Define metrics (e.g. precision@k, recall@k, NDCG, or hit rate) and collect ground truth where possible (e.g. saved recommendations, explicit ratings). Run offline evaluation on held-out data and report baseline vs. model improvements.
- **User engagement** — Define engagement KPIs (e.g. rate of profile completion, assessment completion, recommendations viewed/saved, jobs saved, return visits). Instrument the application to log these and aggregate in a simple analytics view or dashboard.
- **Adaptability to evolving career data** — Define “adaptability” (e.g. alignment with latest job trends, performance on recent data, or model update frequency). Measure by: (1) correlation of recommendations with trending roles/skills, (2) evaluation on a time-split test set, or (3) A/B comparison after model updates.
- **Evaluation framework** — Combine the above into an evaluation plan: what to measure, how often, and how to report (e.g. tables or charts in final report and presentation). Optionally include qualitative feedback (e.g. short user survey) to complement quantitative metrics.

---

## Summary table: Objective → Methodology

| Objective | Key methodology elements |
|-----------|---------------------------|
| **1. Plan and create system with personalized guidance** | Requirements gathering; system planning and design; iterative development (plan → implement → test → review); delivery and documentation. |
| **2. Use ML to analyze skills, interests, experiences** | Data collection (profile + assessment); feature engineering; model selection and design; training pipeline; API integration. |
| **3. Live-update dashboard (careers, skill gaps, trends, predictions)** | Dashboard design (sections and wireframes); data and API design; live-update strategy (refresh/polling); frontend integration. |
| **4. Improve accuracy through continuous learning** | Interaction logging; feedback loop (implicit feedback, retrain/re-rank); career data trends ingestion; evaluation of improvement. |
| **5. Measure performance (accuracy, engagement, adaptability)** | Recommendation accuracy metrics; user engagement KPIs; adaptability metrics; evaluation framework and reporting. |

---

## Suggested methodology flowchart (for PPT)

You can represent the overall methodology as a high-level flow, for example:

1. **Planning & requirements** → (supports Objective 1)  
2. **Design (architecture, data model, dashboard)** → (Objectives 1, 3)  
3. **Data collection & preprocessing** → (Objectives 2, 4, 5)  
4. **ML model design & training** → (Objective 2)  
5. **Integration (API, dashboard, live updates)** → (Objectives 2, 3)  
6. **Logging & feedback loop** → (Objective 4)  
7. **Evaluation (accuracy, engagement, adaptability)** → (Objective 5)  
8. **Iterate (refine model and features using feedback and trends)** → (Objectives 4, 5)

Use this document as the narrative for your “Methodology” section and the basis for one or two methodology slides (overview + objective–methodology mapping or flowchart).
