# Manual Test Cases — AI Career Path Recommendation System

This document matches the **current** React + .NET application (routes under `Front End/src/App.jsx`). Update **Test Executed Date**, **Status**, **Actual Result**, and **Screenshot** when you run each test.

**Routes (authenticated):** `/home`, `/profile`, `/career-survey`, `/assessment`, `/recommendation`, `/dashboard`, `/jobsearch`, `/top-jobs`, `/skill-gap`  
**Public:** `/login`, `/signup`

---

## How to use the Status column

| Status | Meaning |
|--------|--------|
| **Not executed** | Step not run yet (default before testing). |
| **Pass** | Actual result matches expected result. |
| **Fail** | Expected result not met. |
| **Blocked** | Cannot run (environment, data, or dependency failure). |
| **N/A** | Step not applicable for this build or environment. |

Do **not** mark **Pass** until the step has been executed on the recorded **Test Executed Date**.

---

## Shared metadata (copy into each test pack if required)

| Field | Value |
|--------|--------|
| Test Designed by | Lahiru Sampath |
| Test Designed Date | 23.01.2026 |
| Test Executed by | *(fill when executing)* |
| Test Executed Date | *(fill when executing)* |

---

## Test Case 01 — User login

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 01 |
| **Test Case** | User login |
| **Description** | A registered user signs in with valid credentials and reaches protected content; invalid credentials are rejected; unauthenticated access to protected routes redirects to login. |
| **Pre-Condition** | A valid user account exists. |
| **Dependencies** | Back-end API running; JWT auth configured. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 01 | 1.1 | Open login page | Navigate to `/login` | Login form displayed | Not executed |
| 01 | 1.2 | Valid login | Valid email/username + password | Redirect to `/home` (or equivalent); session active | Not executed |
| 01 | 1.3 | Invalid login | Wrong password | Error shown; user remains unauthenticated | Not executed |
| 01 | 1.4 | Protected route without session | Open `/recommendation` when logged out | Redirect to `/login` | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 02 — User registration (sign up)

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 02 |
| **Test Case** | User registration |
| **Description** | A new user can register via the sign-up page and then sign in. Duplicate or invalid data is handled per API validation. |
| **Pre-Condition** | Sign-up enabled; no conflicting account for chosen email (or use unique email). |
| **Dependencies** | Back-end registration endpoint active. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 02 | 2.1 | Open sign-up page | Navigate to `/signup` | Registration form displayed | Not executed |
| 02 | 2.2 | Register with valid data | Unique email, password meeting rules, required fields | Account created or success message; can proceed to login | Not executed |
| 02 | 2.3 | Login after registration | Same credentials on `/login` | Successful login | Not executed |
| 02 | 2.4 | Authenticated user visits sign-up | While logged in, open `/signup` | Redirect away from sign-up (e.g. to `/home`) | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 03 — Career survey (profile intake)

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 03 |
| **Test Case** | Career survey — save profile |
| **Description** | User completes the career survey and saves **interests** and **skills** (minimum required for recommendations). Data persists after reload. |
| **Pre-Condition** | User logged in. |
| **Dependencies** | Profile API active (`/api/profile` or equivalent). |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 03 | 3.1 | Open career survey | Navigate to `/career-survey` | Form loads | Not executed |
| 03 | 3.2 | Enter minimum fields | Non-empty **Interests**; non-empty **Skills** | Fields accept input | Not executed |
| 03 | 3.3 | Save profile | Submit / Save | Success; no blocking validation error | Not executed |
| 03 | 3.4 | Verify persistence | Refresh page or navigate away and return | Interests and skills still loaded | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 04 — AI-based career recommendation

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 04 |
| **Test Case** | Career recommendation |
| **Description** | With a complete career survey (interests + skills saved), user opens recommendations, generates or loads careers, views details, and uses regenerate without the “Career survey required” empty state. |
| **Pre-Condition** | User logged in; career survey saved with non-empty interests and skills. |
| **Dependencies** | Recommendations API (`GET` / `POST` generate); optional LLM/ML per deployment. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 04 | 4.1 | Open recommendations | Navigate to `/recommendation` | Page loads; no survey-required banner when intake complete | Not executed |
| 04 | 4.2 | Generate or load list | **Regenerate** or initial load | Career rows appear (AI or template fallback per server config) | Not executed |
| 04 | 4.3 | View career details | Select a career | Description, skills, learning path (if returned) visible | Not executed |
| 04 | 4.4 | Save toggle (if API returns persisted ids) | Save / unsave on row with positive `id` | UI updates; persists where API supports | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 05 — Job search

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 05 |
| **Test Case** | Job search |
| **Description** | User searches or browses listings, applies **category** and **country** filters where provided, opens job detail, and opens external application/source URL when available. |
| **Pre-Condition** | User logged in; job listings available from API/seed. |
| **Dependencies** | Jobs module and API active. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 05 | 5.1 | Open job search | Navigate to `/jobsearch` | Search UI and results area visible | Not executed |
| 05 | 5.2 | Filter by industry/category | e.g. **Technology** (or available option) | List reflects selected category | Not executed |
| 05 | 5.3 | Filter by country | A defined country filter value | Results or labels match filter | Not executed |
| 05 | 5.4 | Open listing detail and external link | Select job; use apply/source link if shown | Detail visible; external page opens in new tab/window when link exists | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 06 — Industry skill gap analysis

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 06 |
| **Test Case** | Industry skill gap analysis |
| **Description** | User searches **job roles** from the database, selects **one** listing, and views posting skills vs **industry** high-demand and gap skills (when the job category maps to the catalog). **Gap focus** lists industry skills not on the posting. There is **no** multi-career side-by-side comparison UI and **no** built-in PDF/download report on this page. |
| **Pre-Condition** | User logged in. |
| **Dependencies** | Skill-gap catalog API; jobs role search API. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 06 | 6.1 | Open skill gap page | Navigate to `/skill-gap` | Page loads; industry catalog loads | Not executed |
| 06 | 6.2 | Search and select a role | Query e.g. part of a known job title → pick one hit | Selected role panel: title, company, category | Not executed |
| 06 | 6.3 | View gap-related content | Role with category mapped to catalog | “Skills needed”, industry demand/gap lists, optional “Gap focus for this role” | Not executed |
| 06 | 6.4 | Switch to another role | Pick a different search result | Panel updates to new role (single-role view, not dual compare) | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 07 — Top 10 jobs and career paths

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 07 |
| **Test Case** | Top jobs — browse and compare roles |
| **Description** | User opens Top 10 Jobs, browses ranked roles, opens details for more than one role (sequential “comparison” by switching selection), and views skills, qualifications, and career path steps where the UI exposes them. |
| **Pre-Condition** | User logged in. |
| **Dependencies** | Top 10 Jobs page available at `/top-jobs`. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 07 | 7.1 | Open Top 10 Jobs | Navigate to `/top-jobs` | List or ranked roles visible | Not executed |
| 07 | 7.2 | Open first job detail | Select first role | Skills, salary/growth, career steps (as implemented) shown | Not executed |
| 07 | 7.3 | Open second job detail | Select another role | Detail updates to second role | Not executed |
| 07 | 7.4 | Search or filter (if present) | Use in-page search/filter controls | Results narrow per UI behavior | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 08 — Dashboard (job market view)

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 08 |
| **Test Case** | Dashboard — market analysis UI |
| **Description** | User opens the dashboard and views static market-style visuals (charts, trending skills cards, salary bands, skill distribution). Current implementation uses **in-page demo data**, not a live `GET /api/market-trends` call from this component. |
| **Pre-Condition** | User logged in. |
| **Dependencies** | Front-end builds successfully; Chart.js assets load. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 08 | 8.1 | Open dashboard | Navigate to `/dashboard` | “Real-Time Job Market Analysis” (or title shown) loads | Not executed |
| 08 | 8.2 | View demand chart | — | Line chart renders without error | Not executed |
| 08 | 8.3 | View trending skills | — | Skill cards list with demand labels | Not executed |
| 08 | 8.4 | View salary and distribution sections | — | Salary range cards and doughnut/progress UI render | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Test Case 09 — Skills assessment

| Field | Value |
|--------|--------|
| **Test Case Identifier** | 09 |
| **Test Case** | Skills assessment |
| **Description** | User completes the multi-step assessment (industry, domain skills, universal skills, preferences), submits, and receives a stored summary; optional navigation to recommendations with assessment context per app behavior. |
| **Pre-Condition** | User logged in. |
| **Dependencies** | Assessment API; skill-gap/industry list for domain skills. |

| Test Case | Sequence | Test Case Description | Test Data / Input Value(s) | Expected result | Status |
|-----------|----------|------------------------|-----------------------------|-----------------|--------|
| 09 | 9.1 | Open assessment | Navigate to `/assessment` | Step 1 (industry) or first step loads | Not executed |
| 09 | 9.2 | Complete steps with valid levels | Industry + skill levels + preferences | Can advance through steps | Not executed |
| 09 | 9.3 | Submit assessment | Submit on final step | Success or confirmation; result summary available | Not executed |
| 09 | 9.4 | Optional — open recommendations after assessment | Use UI link to `/recommendation` if offered | Recommendations page loads; regenerate may run per navigation state | Not executed |

**Actual Result:**  
**Screenshot:**

---

## Revision history

| Date | Change |
|------|--------|
| 2026-04-19 | Initial full suite aligned with current UI and `SkillGap.jsx` behavior (no download; single-role analysis). |
