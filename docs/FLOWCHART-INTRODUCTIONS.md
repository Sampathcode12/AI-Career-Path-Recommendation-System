# Flowchart Introductions — AI Career Path Recommendation System

The following flowcharts are **designed function-wise**: each one breaks down a single feature into clear, sequential functions or activities. This document provides a short introduction for each flowchart.

---

## 1. User Login and Registration (Function-Wise)

This flowchart describes the **authentication flow** of the system in a function-wise manner. It shows how the application handles both existing users (login) and new users (registration) from the moment they open the Login/Sign Up page until they either access the dashboard or are returned to the login page after an error. The design separates the two paths—entering login credentials versus entering registration details and creating an account—then merges them at a common **Authenticate Credentials** step. A decision node then branches on **Login Successful?** to either **Access Dashboard** or **Display Error Message** and **Return to Login Page**. The flowchart is suitable for understanding authentication behaviour function-wise and for implementation or documentation.

---

## 2. Profile Management (Function-Wise)

This flowchart outlines the **profile view and update** process as a linear sequence of functions. It starts when the user selects **View Profile** and the system **Displays the profile form**. The user then enters or updates information in order: **Personal details**, **Education**, **Skills**, and **Career interests**. After input, the system **Validates profile data**; on success it **Saves the profile to the user database** and **Displays a confirmation message**. The diagram is function-wise in that each rounded rectangle represents one distinct activity (user action or system operation), making it clear in what order profile data is collected, validated, and persisted.

---

## 3. Skill Assessment (Function-Wise)

This flowchart describes the **Take Skill Assessment** feature as a series of functional steps. The user **Selects "Take Skill Assessment"**, after which the system **Loads assessment questions**. The user then **Answers technical skill questions** and **Answers soft skill questions**, then **Submits the assessment**. The system **Evaluates the answers**, **Stores the results in the assessment database**, and **Displays the assessment score**. The function-wise design separates user actions (select, answer, submit) from system actions (load, evaluate, store, display), which helps in defining APIs and responsibilities for the assessment module.

---

## 4. AI Career Recommendation (Function-Wise)

This flowchart explains the **Generate Career Recommendations** flow in a function-wise way. It begins when the **User selects "Generate Career Recommendations"**. The system then **Retrieves user profile data** and **Retrieves assessment results**, and **Sends this data to the AI Recommendation Engine**. The AI **Analyzes skills, interests, and experience**, **Matches the profile with the career database**, and **Generates career path suggestions**. Finally, the system **Displays the recommended careers** to the user. The diagram makes the hand-off to the AI engine and the sequence of data retrieval → analysis → matching → generation → display explicit, which is useful for design and documentation of the recommendation subsystem.

---

## 5. View Market Trends (Function-Wise)

This flowchart describes the **View Market Trends** feature as a sequence of system and output functions. The user **Selects "View Market Trends"**; the system **Retrieves job market data**, **Analyzes industry demand**, **Identifies trending jobs**, and **Identifies required skills**. It then **Generates a market trend report** and **Displays market trends and top careers**. The function-wise breakdown clarifies how raw job market data is transformed step by step into a report and then into the UI, and is useful for specifying the Market Trends module and its data pipeline.

---

## 6. Skill Gap Analysis (Function-Wise)

This flowchart outlines the **Skill Gap Analysis** process in distinct functional steps. The user **Selects "Skill Gap Analysis"**; the system **Retrieves user skills** and **Retrieves industry skill requirements**, then **Compares user skills with industry skills** and **Identifies missing skills**. It **Generates a skill gap report** and **Displays the skill gap analysis** to the user. The function-wise design separates data retrieval (user vs industry), comparison logic, report generation, and presentation, which supports implementation and testing of the skill gap feature.

---

## 7. Job Search (Function-Wise)

This flowchart describes the **Job Search** feature as a function-wise user and system flow. The user **Selects "Job Search"**, then **Enters job filters**, **Selects industry**, **Selects location**, and **Enters salary range**, and **Submits the search query**. The system **Retrieves job listings from the job database**, **Filters matching jobs** according to the criteria, and **Displays job results**. The diagram clearly separates user input steps from system retrieval, filtering, and display, making it suitable for defining the job search API and UI behaviour.

---

## Summary

| # | Flowchart              | Main purpose (function-wise) |
|---|------------------------|------------------------------|
| 1 | Login & Registration   | Auth flow: login vs sign-up, authenticate, dashboard or error. |
| 2 | Profile Management     | View profile form → enter details → validate → save → confirm. |
| 3 | Skill Assessment       | Load questions → answer technical/soft → submit → evaluate → store → show score. |
| 4 | AI Career Recommendation | Get profile + assessment → send to AI → analyze → match → generate → display. |
| 5 | View Market Trends     | Get market data → analyze demand → trending jobs/skills → report → display. |
| 6 | Skill Gap Analysis     | Get user + industry skills → compare → identify gaps → report → display. |
| 7 | Job Search             | Enter filters (industry, location, salary) → submit → retrieve → filter → display. |

All flowcharts are designed **function-wise** so that each step is a single, identifiable function or activity, which supports implementation, testing, and documentation of the AI Career Path Recommendation System.
 