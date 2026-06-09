# AI Career Path Recommendation System  
## User Manual

**Version:** 1.0  
**Date:** May 2026  
**Audience:** End users (students, job seekers, career advisors)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Getting Started — Registration & Login](#3-getting-started--registration--login)
4. [Home Dashboard](#4-home-dashboard)
5. [Career Survey](#5-career-survey)
6. [Skill Assessment (Optional)](#6-skill-assessment-optional)
7. [AI-Based Recommendations](#7-ai-based-recommendations)
8. [Profile](#8-profile)
9. [Real-Time Job Market Analysis (Market Trends)](#9-real-time-job-market-analysis-market-trends)
10. [Top 10 Jobs](#10-top-10-jobs)
11. [Skill Gap Analysis](#11-skill-gap-analysis)
12. [Job Search](#12-job-search)
13. [Logging Out](#13-logging-out)
14. [Troubleshooting](#14-troubleshooting)
15. [Appendix A — Screenshot Checklist](#appendix-a--screenshot-checklist)
16. [Appendix B — Quick Reference — Navigation Menu](#appendix-b--quick-reference--navigation-menu)
17. [Appendix C — Quick Steps Summary (All Features)](#appendix-c--quick-steps-summary-all-features)

---

## 1. Introduction

### 1.1 About the Application

The **AI Career Path Recommendation System** is a web-based platform that helps users discover suitable career paths based on their education, skills, interests, and work preferences. The system combines:

- **AI-based career recommendations** tailored to your profile  
- **Real-time job market analysis** and trending skills  
- **Multi-career path exploration** with salary and growth insights  
- **Industry skill gap analysis** to identify skills you may need to develop  
- **An interactive Career Advisor** chat for follow-up questions about roles and learning paths  

Whether you are a recent graduate, a professional considering a career change, or someone exploring options after undergraduate study, this application guides you from profile setup to actionable career insights.

> **Attach screenshot:** Full application header after login — title *“AI Career Path Recommendation System”* and the navigation bar (Home, Career survey, Recommendation, Market Trends, Top 10 Jobs, Skill Gap).

![Figure 1 — Application home screen with navigation](screenshots/01-home-navigation.png)

*Figure 1 — Main application layout after sign-in*

---

### 1.2 Key Features at a Glance

| Feature | Description |
|--------|-------------|
| **Career Survey** | Capture your education, skills, and career interests (required for personalized recommendations) |
| **Skill Assessment** | Optional 5-step questionnaire to rate universal and industry-specific skills |
| **AI Recommendations** | Generate career matches with match percentage, salary, growth, and learning paths |
| **Career Advisor Chat** | Ask follow-up questions about recommended careers |
| **Real-Time Job Market Analysis** | Market Trends page — demand charts, salary stats, trending skills, skills distribution |
| **Top 10 Jobs** | Browse high-demand roles with skills, qualifications, and career paths |
| **Skill Gap** | Compare skills required for a job role against industry demand |
| **Profile** | Store and update your full professional profile |

---

### 1.3 Recommended User Journey

```
Sign up → Sign in → Complete Career Survey → (Optional) Skill Assessment
    → Generate Recommendations → Explore Market Trends / Top Jobs / Skill Gap
```

1. **Create an account** and sign in.  
2. **Complete the Career Survey** — this is required before the system can generate personalized recommendations.  
3. Optionally complete the **Skill Assessment** for richer skill ratings.  
4. Open **Recommendation** and click **Generate Recommendations**.  
5. Use **Market Trends**, **Top 10 Jobs**, and **Skill Gap** to research roles and skills further.  
6. Update your **Profile** anytime from the Home page.

---

## 2. System Requirements

| Requirement | Details |
|-------------|---------|
| **Browser** | Modern browser (Chrome, Edge, Firefox, or Safari — latest version recommended) |
| **Internet** | Stable internet connection |
| **Screen** | Desktop or laptop recommended; tablet supported |
| **Account** | Valid email address for registration |

The application must be hosted and running (frontend and backend services). Contact your administrator if pages fail to load or show connection errors.

---

## 3. Getting Started — Registration & Login

### 3.1 Creating an Account (Sign Up)

If you do not yet have an account:

1. Open the application URL in your browser.  
2. You will be directed to the **Login** page. Click **Sign up here** at the bottom, or go directly to `/signup`.  
3. On the **Create Account** page, fill in:

   | Field | Requirement |
   |-------|-------------|
   | **Full Name** | Required |
   | **Email Address** | Required — must be a valid email format |
   | **Password** | Required — minimum 6 characters |
   | **Confirm Password** | Must match your password |
   | **Terms & Conditions** | Check the box to agree (required) |

4. Click **Sign Up**.  
5. On success, you are redirected to the **Login** page. Sign in with your new credentials.

> **Attach screenshot:** Sign-up page showing all fields and the *“Sign Up”* button.

![Figure 2 — Create Account page](screenshots/02-signup.png)

*Figure 2 — Registration form*

**Note:** You are not automatically signed in after registration. You must sign in on the next screen.

---

### 3.2 Signing In (Login)

1. Go to the **Login** page (`/login`).  
2. Enter your **Email Address** and **Password**.  
3. (Optional) Check **Remember me** — for convenience on your device.  
4. Click **Sign In**.  
5. After a successful login, you are taken to the **Home** dashboard. The header, navigation bar, and footer appear.

> **Attach screenshot:** Login page with email, password, *“Remember me”*, and *“Sign In”* button.

![Figure 3 — Login page](screenshots/03-login.png)

*Figure 3 — Sign-in screen*

| Element | Action |
|---------|--------|
| **Forgot password?** | Link is shown in the UI; password recovery may require administrator support if not configured |
| **Don't have an account? Sign up here** | Opens the registration page |

**Error messages you may see:**

- *“Please fill in all fields”* — enter both email and password.  
- Invalid credentials — check email and password, or register a new account.

---

### 3.3 After Login — What You See

Once signed in, the layout includes:

- **Header** — Application title and feature summary  
- **Navigation bar** — Home, Career survey, Recommendation, Market Trends, Top 10 Jobs, Skill Gap  
- **User area** (right side) — Your name or email, and **Logout**  
- **Main content** — The page you opened (default: Home)

> **Attach screenshot:** Full authenticated layout — header, nav, user name, and Home welcome message.

![Figure 4 — Authenticated layout](screenshots/04-after-login.png)

*Figure 4 — Layout after successful login*

---

## 4. Home Dashboard

The **Home** page is your starting point after login.

### 4.1 Welcome Section

- Greeting: **“Welcome, {your name}”**  
- **Complete Your Profile** — opens the full Profile page  
- **Take career survey** / **Retake career survey** — opens the Career Survey (label changes after you save the survey once)

### 4.2 Profile Completion

- A **doughnut chart** and **progress bar** show profile completion percentage.  
- Complete the Career Survey and Profile to increase this score.

### 4.3 Your Career Insights

Summary cards (illustrative counts) may show:

- Recommended Careers  
- Skills Assessed  
- Learning Paths  
- Job Matches  

### 4.4 Skill Growth Trend

A line chart displays sample skill growth over time (for visualization).

### 4.5 Quick Actions

Shortcut buttons:

| Button | Goes to |
|--------|---------|
| **View Recommendations** | Recommendation page |
| **Market Trends** | Market Trends dashboard |
| **Skill Gap Analysis** | Skill Gap page |

> **Attach screenshot:** Home dashboard with welcome message, profile completion chart, and Quick Actions.

![Figure 5 — Home dashboard](screenshots/05-home.png)

*Figure 5 — Home page overview*

---

## 5. Career Survey

**Navigation:** Click **Career survey** in the menu, or use **Take career survey** from Home.

**Page title:** *Career background (survey)*

This is the **most important step** for personalized AI recommendations. Data you enter here is saved to your profile.

### 5.1 Survey Fields

The survey is a single scrollable form (not split into multiple pages):

| # | Question | Type | Required to save |
|---|----------|------|------------------|
| 1 | What is your name? | Text | No |
| 2 | What is your gender? | Dropdown (Female, Male, Non-binary, Prefer not to say, Other) | No |
| 3 | What was your course in UG? | Searchable dropdown + Other | No |
| 4 | What is your UG specialization? (Major subject) | Dropdown + Other | No |
| 5 | What are your career interest paths? | Multi-select chips + search + custom paths | **Yes — at least one** |
| 6 | What are your skills? | Skill chips + free-text area | **Yes** |
| 7 | Average CGPA or percentage in UG? | Text | No |
| 8 | Did you do any certification courses? | Yes / No | No |
| 9 | Certificate course title (if Yes) | Text | No |
| 10 | Are you working? | Yes / No | No |
| 11 | First job title (or NA) | Text | No |
| 12 | Masters after undergraduation? | Text | No |

### 5.2 Using Career Interest Paths

1. Optionally select **UG specialization** first — interest paths may filter to match your major.  
2. Use the search box: *“Search paths for {major}…”* or *“Search all career interest paths…”*  
3. Click paths to add them as chips.  
4. To add a custom path: type in **Add a custom interest path** and click **Add**.  
5. Selected paths appear in the summary: *“Selected: …”*

### 5.3 Adding Skills

1. Suggested skill chips appear based on your interest paths and specialization.  
2. Click a chip to add (+) or remove (✓) it.  
3. Edit skills freely in **Selected skills** — separate with commas or semicolons.

### 5.4 Saving Your Survey

| Button | What it does |
|--------|----------------|
| **Save** | Saves to your profile. Message: *“Saved to your profile.”* |
| **Save & view recommendations** | Saves, then opens Recommendations and triggers generation |

**Validation messages:**

- *“Please select at least one career interest path.”*  
- *“Please enter your skills (free text, comma or semicolon separated).”*

**Draft auto-save:** Your answers are auto-saved locally in the browser while you type, so you are less likely to lose progress.

> **Attach screenshot:** Career survey form with interest paths and skills sections filled in.

![Figure 6 — Career survey](screenshots/06-career-survey.png)

*Figure 6 — Career background survey*

**Tip:** From the survey page you can also open the optional **skill assessment** or jump to **Home** / **Recommendations**.

---

## 6. Skill Assessment (Optional)

**How to open:** Link from the Career Survey page, or go to `/assessment` (not shown in the main menu).

**Title:** *Comprehensive Skill Assessment*

A **5-step wizard** that rates your skills and work preferences.

| Step | Title | What you do |
|------|-------|-------------|
| **1** | Select your industry | Choose from the **Industry** dropdown |
| **2** | Universal skills | Rate 1–5: Communication, Problem Solving, Teamwork, Leadership, Creativity, Adaptability |
| **3** | Domain skills | Rate industry-specific skills (1 = Beginner, 5 = Expert) |
| **4** | Work preferences | Work style, environment (Remote/Office/Hybrid), years of experience |
| **5** | Review & submit | Review all answers |

**Navigation:**

- **Previous** — go back one step  
- **Next step** — advance  
- **Clear form** — reset answers  
- **Generate recommendations** (final step) — saves assessment and opens Recommendations with auto-generate

> **Attach screenshot:** Skill assessment Step 1 (industry) and Step 5 (review).

![Figure 7 — Skill assessment](screenshots/07-assessment.png)

*Figure 7 — Skill assessment wizard*

---

## 7. AI-Based Recommendations

**Menu:** Recommendation  
**Route:** `/recommendation`  
**Page title:** *AI-Based Career Recommendation*

### Quick Steps

1. Complete the **Career Survey** first (interests and skills are required).
2. Click **Generate Recommendations** (or **Regenerate** to refresh after profile changes).
3. Review career cards — each shows **match %**, **salary**, and **growth**.
4. **Click a card** to expand details: full description, required skills, requirements, learning path, and skill gap chart.
5. Use **Ask** on a card or the **Career Advisor** chat (floating button) for follow-up questions.
6. Click **Save** on roles you want to bookmark.

> **Attach screenshot:** Recommendation page with career cards and match percentages.

![Figure 8 — AI recommendations](screenshots/08-recommendations.png)

*Figure 8 — Generated career recommendations*

### 7.1 Before You Generate

If the Career Survey is incomplete (missing interests or skills), you will see:

- Banner: **“Career survey required.”**  
- Button: **Open career survey**

Complete the survey first — the system does not show generic template recommendations until your profile has interests and skills.

### 7.2 Generating Recommendations

| Button | When to use |
|--------|-------------|
| **Generate Recommendations** | First time or when the list is empty |
| **Regenerate** | Refresh recommendations with updated profile data |
| **Show Sample Recommendations** | Preview sample data (if API optional mode is enabled) |

Wait for the loading state (*“Generating…”* / *“Regenerating…”*) to finish.

### 7.3 Recommendation Cards

Each card shows:

- **Career title**  
- **Match %** badge  
- Short **description**  
- **Salary** and **Growth** indicators  
- **Ask** — open Career Advisor chat about this role  
- **Save** / **Saved** — bookmark a recommendation

### 7.4 Detailed Analysis (expand a card)

Click any career card to expand **more details inside that card**:

- Full **description**
- **Required Skills** (tags)
- **Requirements** — education, experience, salary, growth
- **Recommended Learning Path** — numbered steps with duration
- **Skill Gap Analysis** — radar chart (Your Skills vs Required Skills)
- **Ask about this career** and **Close** buttons

Click the same card again or **Close** to collapse. Unselected cards show: *“Click to view skills, requirements & learning path.”*

A **bar chart** below the list compares **Career Match Percentage** across all recommendations.

> **Attach screenshot:** Expanded detail panel with learning path and radar chart.

![Figure 9 — Recommendation detail](screenshots/09-recommendation-detail.png)

*Figure 9 — Detailed career analysis*

### 7.5 Career Advisor Chat

When recommendations exist, a floating chat button opens the **Career Advisor**:

1. Click the chat icon.  
2. Read the welcome message and suggested prompts (salary, skills, comparisons).  
3. Type your question in **“Ask a follow-up…”**  
4. Click **Send**.  
5. Use **New chat** to clear the conversation and start over.

> **Attach screenshot:** Career Advisor chat panel with a sample question and reply.

![Figure 10 — Career Advisor chat](screenshots/10-career-advisor.png)

*Figure 10 — Interactive Career Advisor*

---

## 8. Profile

**How to open:** **Complete Your Profile** on the Home page (`/profile`).  
Profile is not in the main navigation menu by default.

### 8.1 Profile Summary (Top Section)

When data exists, you see:

- Avatar initials, name, email  
- Role and location badges  
- LinkedIn link (if provided)  
- **Profile complete** ring (percentage from 8 key fields)  
- Skill tag preview  

### 8.2 Editable Sections — User Profile

**Basic info (required):**

- Full Name *  
- Email Address *  

**Education & Qualifications** (repeatable):

- Education Level (High School, Associate, Bachelor's, Master's, PhD, Other)  
- Field of Study  
- Certifications & Qualifications  
- **+ Add Education** / **Remove**  

**UG & career background** (same fields as Career Survey):

- Gender, UG course, specialization, CGPA, certifications, work history, masters  

**User Interests (required for save):**

- **Industries of Interest *** — select from industry chips  
- **Career Interests & Goals *** — textarea  

**Other fields:**

- Current Role, Location, LinkedIn Profile  
- **Skills *** (comma-separated)  
- Professional Bio  
- Portfolio/Website  

Click **Save Profile** (*Saving…* while processing).

**Validation:** *“Please select at least one interesting industry.”*

> **Attach screenshot:** Profile page with form sections and Save Profile button.

![Figure 11 — User profile](screenshots/11-profile.png)

*Figure 11 — Profile editor*

**Note:** Career Survey and Profile share the same backend data. Updating either updates your stored profile.

---

## 9. Real-Time Job Market Analysis (Market Trends)

**Feature name:** Real-Time Job Market Analysis  
**Menu label:** Market Trends  
**Route:** `/dashboard`  
**Page title (on screen):** *Real-Time Job Market Analysis*

This feature is labeled **Market Trends** in the navigation menu, but the page itself is titled **Real-Time Job Market Analysis**. Both names refer to the same screen.

### Quick Steps

1. Open **Market Trends** from the menu or Home quick actions.
2. Review **Job Market Demand Growth (2020–2025)** — compare Data Science vs Software Engineering trends.
3. Check **Trending Skills in 2024** cards (Machine Learning, Cloud, Cybersecurity, etc.).
4. Read the three summary stats: **Average Salary**, **Yearly Growth**, and **Top Hiring Regions**.
5. Compare **Salary Ranges by Experience Level** (Entry → Lead/Principal).
6. Study **Required Skills Distribution** — Technical (40%), Soft Skills (25%), Domain Knowledge (20%), Tools (15%).
7. Use this page for market context alongside your personal **Recommendations**.

> **Attach screenshot:** Full Market Trends page showing the demand growth chart at the top.

![Figure 12 — Market Trends overview](screenshots/12-market-trends.png)

*Figure 12 — Real-Time Job Market Analysis dashboard*

### 9.1 How to Open the Page from the UI

You can reach **Real-Time Job Market Analysis** from three places after you sign in:

| Where in the UI | What to click | What you see |
|-----------------|---------------|--------------|
| **Top header tagline** | (Read only) | The phrase *“Real-Time Job Market Analysis”* appears in the subtitle under the main application title — this describes the feature; it is not a clickable link. |
| **Navigation bar** | **Market Trends** | Opens the full analysis page (`/dashboard`). |
| **Home → Quick Actions** | **Market Trends** button (trending-up icon) | Same page as the nav menu item. |
| **Home → System Features** card *(if visible)* | *Real-Time Job Market Analysis — Market Trends page* | Informational bullet; use **Market Trends** in Quick Actions or the nav bar to open the page. |

There are no filters, search boxes, or refresh buttons on this page — all charts and cards load immediately when you open it.

### 9.2 Page Layout — What You See on Screen

The entire feature lives inside **one white card** in the main content area. Content flows **top to bottom** in six zones:

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE TITLE: Real-Time Job Market Analysis                  │
│  Subtitle (grey text): Live job market data and trends…     │
├─────────────────────────────────────────────────────────────┤
│  ZONE 1 — Job Market Demand Growth (2020–2025)  [line chart]│
├─────────────────────────────────────────────────────────────┤
│  ZONE 2 — Trending Skills in 2024              [5 cards]    │
├─────────────────────────────────────────────────────────────┤
│  ZONE 3 — Key statistics                       [3 cards]    │
├─────────────────────────────────────────────────────────────┤
│  ZONE 4 — Salary Ranges by Experience Level    [4 cards]    │
├─────────────────────────────────────────────────────────────┤
│  ZONE 5 — Required Skills Distribution         [chart+ bars]│
└─────────────────────────────────────────────────────────────┘
```

Scroll down the page to move from demand trends at the top to skills distribution at the bottom. On smaller screens, card grids stack vertically instead of sitting side by side.

### 9.3 Purpose of This Page

The Market Trends page gives you a **big-picture view of the job market** — how demand is growing, which skills are trending, typical salary ranges, and how employers weight different skill types. Use it alongside your personal **Recommendations** to understand wider industry context before choosing a career direction.

Directly under the page title, grey subtitle text reads:

> *“Live job market data and trends — demand growth, salary ranges, trending skills — to help you make informed career decisions.”*

### 9.4 Job Market Demand Growth (2020–2025) — Zone 1

**UI location:** Top of the page, first chart below the subtitle.  
**Section heading:** *Job Market Demand Growth (2020–2025)*  
**Chart type:** Interactive line chart (height ~350px).

| UI element | Appearance | Interaction |
|------------|------------|-------------|
| **Legend** | Top of chart — teal line = Data Science Jobs; cyan line = Software Engineering | Click a legend label to show or hide that line |
| **X-axis** | Years 2020 → 2025 | — |
| **Y-axis** | Demand index starting at 0 | — |
| **Tooltip** | Dark overlay box on hover | Move the mouse over any data point to see the exact index value |

| Line | Color | What it shows |
|------|-------|----------------|
| **Data Science Jobs** | Teal | Demand index rising from 100 (2020) to 185 (2025) |
| **Software Engineering** | Cyan | Demand index rising from 100 (2020) to 152 (2025) |

**How to read it:**

1. Hover over any point on the chart to see exact values in the tooltip.  
2. Compare the two career tracks — steeper lines indicate faster growth.  
3. Use this to see which broad field has grown faster over the past five years.

> **Attach screenshot:** Close-up of the demand growth line chart with tooltip visible.

![Figure 12a — Demand growth chart](screenshots/12a-market-demand-chart.png)

*Figure 12a — Job market demand growth chart*

---

### 9.5 Trending Skills in 2024 — Zone 2

**UI location:** Below the demand chart.  
**Section heading:** *Trending Skills in 2024*  
**Layout:** Responsive grid of five **skill cards** (each card is a nested white panel).

| UI element on each card | Appearance |
|-------------------------|------------|
| **Skill name** | Bold heading on the left (e.g. *Machine Learning*) |
| **Growth badge** | Green pill on the right (e.g. *+25%*) |
| **Demand line** | Grey text: *Demand: **Very High*** or *Demand: **High*** |

| Skill | Growth badge | Demand level |
|-------|--------------|--------------|
| Machine Learning | +25% | Very High |
| Cloud Computing | +22% | Very High |
| Cybersecurity | +20% | High |
| Data Engineering | +18% | High |
| DevOps | +15% | High |

These cards are **read-only** — there are no click actions. Review them to identify skills worth adding to your learning plan, then cross-check with your **Recommendations** or **Skill Gap** results.

> **Attach screenshot:** Trending Skills in 2024 card grid.

![Figure 12b — Trending skills](screenshots/12b-trending-skills.png)

*Figure 12b — Trending skills cards*

---

### 9.6 Key Market Statistics — Zone 3

**UI location:** Below trending skills.  
**Layout:** Three **stat cards** in a horizontal row (stacked on mobile).

| Card | Icon | Large number | Label | Subtext |
|------|------|--------------|-------|---------|
| **Average Salary** | Chart icon (teal) | **$95,000** | Average Salary | *+15% from last year* (green) |
| **Yearly Growth** | Trending-up icon | **+18%** | Yearly Growth | *Job market expansion* |
| **Top Hiring Regions** | Globe icon | **5** | Top Hiring Regions | *USA, UK, Canada, Germany, Singapore* |

The large figures use the accent teal color; supporting text is grey. These cards summarize global market health at a glance — no buttons or links on this row.

> **Attach screenshot:** The three stat cards (Average Salary, Yearly Growth, Top Hiring Regions).

![Figure 12c — Market statistics](screenshots/12c-market-stats.png)

*Figure 12c — Key market statistics*

---

### 9.7 Salary Ranges by Experience Level — Zone 4

**UI location:** Below the stat cards.  
**Section heading:** *Salary Ranges by Experience Level*  
**Layout:** Four cards in a responsive grid.

| Card heading | Salary (large, teal) | Growth line (green) |
|--------------|----------------------|---------------------|
| **Entry Level** | $60k – $85k | Growth: +12% |
| **Mid Level** | $85k – $120k | Growth: +15% |
| **Senior Level** | $120k – $180k | Growth: +18% |
| **Lead/Principal** | $180k – $250k+ | Growth: +20% |

Use this section to estimate earning potential at different career stages and to set realistic salary expectations when comparing roles on **Top 10 Jobs** or **Recommendation**.

> **Attach screenshot:** Salary ranges by experience level cards.

![Figure 12d — Salary ranges](screenshots/12d-salary-ranges.png)

*Figure 12d — Salary by experience level*

---

### 9.8 Required Skills Distribution — Zone 5

**UI location:** Bottom of the page, inside its own nested card.  
**Section heading:** *Required Skills Distribution*  
**Layout:** Doughnut chart on the left; four horizontal **progress bars** on the right.

| UI element | What it shows |
|------------|---------------|
| **Doughnut chart** | Four colored segments with legend: Technical, Soft Skills, Domain Knowledge, Tools |
| **Progress bars** | Same four categories with percentage labels and colored fill bars |

| Skill category | Share | Bar color |
|----------------|-------|-----------|
| Technical Skills | 40% | Teal |
| Soft Skills | 25% | Cyan |
| Domain Knowledge | 20% | Purple |
| Tools & Technologies | 15% | Green |

**How to use this section:**

1. Read the doughnut chart legend on the right side of the chart.  
2. Compare bar lengths to see which skill type employers value most.  
3. Balance your learning — technical skills dominate, but soft skills and domain knowledge together make up 45% of what employers look for.

> **Attach screenshot:** Skills distribution doughnut chart and progress bars.

![Figure 12e — Skills distribution](screenshots/12e-skills-distribution.png)

*Figure 12e — Required skills distribution*

---

### 9.9 Tips for Using Real-Time Job Market Analysis

1. Visit after completing your **Career Survey** so you can connect market data with your interests.  
2. Cross-reference trending skills (Section 9.5) with skills listed on your **Recommendations**.  
3. Use salary ranges (Section 9.7) when evaluating roles on **Top 10 Jobs**.  
4. Return periodically — the page is a read-only reference dashboard; scroll top to bottom for the full market picture.

---

## 10. Top 10 Jobs

**Menu:** Top 10 Jobs  
**Route:** `/top-jobs`  
**Page title:** *World's Top 10 Jobs*

### Quick Steps

1. Open **Top 10 Jobs** from the navigation menu.
2. Note the **live date & time** and **Last updated** timestamp (list auto-refreshes about every minute).
3. Click **Refresh now** to reload jobs manually, or **Get My Recommendations** to open your AI matches.
4. Review the **Job growth by role** bar chart for growth percentages.
5. Browse the **Filtered results** list — each card shows title, sector, salary, and growth.
6. Tick **Select** on one or more jobs.
7. Click **View skills & career path** for skills, qualifications, and step-by-step career path.
8. Select 2+ jobs and click **Compare benefits** for a side-by-side salary, growth, and skills table.
9. Click **Clear selection** when finished.

> **Attach screenshot:** Top 10 Jobs page header with live date/time and action buttons.

![Figure 13 — Top 10 Jobs overview](screenshots/13-top-jobs.png)

*Figure 13 — Top 10 Jobs page*

### 10.1 Purpose of This Page

This page lists the **world's top-ranked jobs** loaded from the application database. Jobs are ranked by salary potential, global demand, growth rate, and work-life balance.

### 10.2 Page Header — Live Data & Actions

At the top of the page you will see:

| Element | Description |
|---------|-------------|
| **Current date & time** | Updates every second (e.g. *Friday, May 29, 2026 · 02:30:45 PM*) |
| **Description** | Explains that listings load from the database and refresh automatically |
| **Last updated** | Timestamp of the most recent data fetch (e.g. *Last updated: May 29, 2026, 2:30 PM*) |
| **Updating…** | Shown briefly while data is being refreshed |

**Action buttons:**

| Button | What it does |
|--------|----------------|
| **Refresh now** | Manually reloads the job list from the database |
| **Get My Recommendations** | Opens the **Recommendation** page for your personalized AI matches |

**Auto-refresh:** The list refreshes automatically about **every 60 seconds** and when you switch back to this browser tab.

> **Attach screenshot:** Header area with date/time, Last updated, Refresh now, and Get My Recommendations buttons.

![Figure 13a — Top 10 Jobs header](screenshots/13a-top-jobs-header.png)

*Figure 13a — Live data header and actions*

---

### 10.3 Job Growth by Role Chart

Below the header, a horizontal **bar chart** titled **Job growth by role** shows estimated employment growth (%) for each job in the list.

**How to read it:**

1. Each bar represents one job title from the current Top 10 list.  
2. The X-axis shows growth percentage (0%–50%).  
3. Hover over a bar to see the exact growth value (e.g. *Growth: +36%*).  
4. Longer bars indicate faster-growing roles.

While data is loading, you will see *“Loading job data…”*.

> **Attach screenshot:** Job growth by role horizontal bar chart.

![Figure 13b — Growth chart](screenshots/13b-job-growth-chart.png)

*Figure 13b — Job growth by role chart*

---

### 10.4 Browsing the Job List

The **Filtered results** section lists all jobs from the Top 10 database.

Each job card shows:

| Field | Example |
|-------|---------|
| **Checkbox (Select)** | Tick to select the job for comparison or detail view |
| **Job title** | e.g. *Software Developer / Engineer* |
| **Sector pill** | e.g. *Technology* |
| **Category pill** | e.g. *Technology* |
| **Description** | Short summary of the role |
| **Salary** | e.g. *$70,000 – $180,000* |
| **Growth** | e.g. *+22%* |
| **Regions** | Top hiring regions (when available) |

**Example roles you may see:** Software Developer, Data Scientist, Nurse Practitioner, AI/ML Engineer, DevOps Engineer, and others depending on database content.

**If no jobs appear:**

- Click **Refresh now**.  
- Ensure the backend API is running.  
- You will see *“No roles to display right now”* with guidance to refresh or check the API.

> **Attach screenshot:** Job list with 2–3 job cards visible, one selected (highlighted).

![Figure 13c — Job list](screenshots/13c-job-list.png)

*Figure 13c — Job listings with select checkboxes*

---

### 10.5 Selecting & Comparing Jobs

**Step 1 — Select jobs**

1. Tick the **Select** checkbox on one or more job cards.  
2. Selected cards are highlighted.  
3. A banner appears: *“{N} job(s) selected — view details or compare main benefits”*

**Step 2 — View skills & career path**

1. Click **View skills & career path**.  
2. A panel opens for each selected job showing:
   - **Skills** — bulleted list of required skills  
   - **Qualifications** — Education, Experience, Certifications  
   - **Career path (step by step from basic)** — numbered steps from foundation to target role  

   Example career path steps for Software Developer:
   - Step 1: Foundation — High school, math, basic programming  
   - Step 2: Education — Bachelor's in CS (4 years)  
   - Step 3: Entry level — Internship or Junior Developer (0–2 years)  
   - Step 4: Mid level — Software Developer (2–5 years)  
   - Step 5: Target role — Senior Software Engineer / Tech Lead  

3. Click **Close** to hide the panel.

**Step 3 — Compare benefits**

1. With 2 or more jobs selected, click **Compare benefits**.  
2. A comparison table appears with columns for each selected job:

| Row | What is compared |
|-----|------------------|
| Salary (global) | Salary range per role |
| Growth | Growth percentage |
| Sector / Category | Industry sector |
| Key skills | Top 4 skills per role |
| Education | Required education |
| Experience | Experience requirements |
| Certifications | Recommended certifications |
| Top regions | Hiring regions |

3. Use this table to decide which role fits your goals best.  
4. Click **Close** to hide the comparison.

**Step 4 — Clear selection**

Click **Clear selection** on the banner to deselect all jobs.

> **Attach screenshot:** Selection banner with View skills & career path and Compare benefits buttons.

![Figure 13d — Job selection banner](screenshots/13d-job-selection.png)

*Figure 13d — Selected jobs action banner*

> **Attach screenshot:** Compare benefits table with 2–3 jobs side by side.

![Figure 13e — Compare benefits](screenshots/13e-compare-benefits.png)

*Figure 13e — Side-by-side job comparison*

> **Attach screenshot:** Skills, qualifications & career path panel for one job.

![Figure 13f — Career path detail](screenshots/13f-career-path.png)

*Figure 13f — Skills, qualifications, and career path*

---

### 10.6 About This List

At the bottom, an **About this list** note explains that rankings are based on commonly cited global indices (salary, demand, growth, work-life balance) and may vary by source and year. Use this as a **starting point**, then explore roles that match your skills via **Career Survey**, **Assessment**, and **Recommendations**.

### 10.7 Tips for Using Top 10 Jobs

1. Click **Get My Recommendations** after browsing to see how top roles align with *your* profile.  
2. Select 2–3 jobs in sectors you are considering and use **Compare benefits**.  
3. Open **View skills & career path** to see the education and experience steps for a role you are interested in.  
4. Cross-check growth rates with the **Market Trends** page for broader context.

---

## 11. Skill Gap Analysis

**Menu:** Skill Gap  
**Route:** `/skill-gap`  
**Page title:** *Industry Skill Gap Analysis*

### Quick Steps

1. Open **Skill Gap** from the menu or Home quick actions.
2. Wait for the industry skill catalog to load.
3. Type a job title or keyword in **Search job roles** (e.g. *developer*, *nurse*, *analyst*).
4. Select a role from the dropdown (shows title, company, and category).
5. Review **Skills needed for this role** — from the job posting or industry catalog.
6. Compare with **Industry — high demand skills** and **Industry — skill gaps (short supply)**.
7. Focus on **Gap focus for this role** — in-demand skills *not* listed on the posting (best targets to learn).
8. Click **Clear** to search another role.

> **Attach screenshot:** Skill Gap page with search box (empty state).

![Figure 14 — Skill Gap overview](screenshots/14-skill-gap.png)

*Figure 14 — Skill Gap analysis page*

### 11.1 Purpose of This Page

The Skill Gap page helps you **compare skills required for a specific job role** against **industry-wide demand and shortage skills**. This shows:

- What skills a job posting asks for  
- Which skills are in high demand across the industry  
- Which skills are in short supply (gaps)  
- Which high-demand skills are **missing from the posting** — useful targets for your personal development  

The page intro states: *“Search for a job role from your database, then compare skills on that posting with industry demand and gap skills from the catalog when the role category matches.”*

### 11.2 Step-by-Step: Running a Skill Gap Analysis

**Step 1 — Open the page**

1. Sign in and click **Skill Gap** in the navigation bar.  
2. Wait for *“Loading industry skill catalog…”* to finish (this loads industry demand data in the background).

**Step 2 — Search for a job role**

1. Click in the **Search job roles** field.  
2. Type a job title or keyword (e.g. *developer*, *nurse*, *analyst*, *engineer*).  
3. After a short pause, matching roles appear in a dropdown list.  
4. Each suggestion shows:
   - **Job title** (bold)  
   - **Company • Category** (e.g. *Acme Corp • Technology*)

**Step 3 — Select a role**

1. Click a role from the suggestions.  
2. The search field fills with the job title.  
3. The dropdown closes and the **analysis panel** appears below.

**Step 4 — Review the analysis**

Read each section in order (see Section 11.3 below).

**Step 5 — Search again (optional)**

1. Click **Clear** next to the search field to reset.  
2. Type a new job title and repeat.

**Empty state (before selecting a role):**  
*“Select a job role from the search results to see skill gap analysis for that role.”*

**No results while searching:**  
*“No roles found.”* — try different keywords or check that job listings exist in the database.

> **Attach screenshot:** Search dropdown with role suggestions visible.

![Figure 14a — Role search](screenshots/14a-skill-gap-search.png)

*Figure 14a — Searching for a job role*

---

### 11.3 Analysis Panels Explained

After you select a role, the page shows a detail panel with the job title and metadata.

#### 11.3.1 Role Header

| Element | Example |
|---------|---------|
| **Job title** | Data Scientist |
| **Company • Category** | TechCorp • Technology |
| **Industry demand growth** | e.g. *+18%* (when industry matches) |
| **Supply** | e.g. *Medium* — how available talent is in that industry |

---

#### 11.3.2 Skills Needed for This Role

**Section title:** *Skills needed for this role*

This lists skills required for the selected job. The source depends on the data available:

| Source | What you see | Note below the list |
|--------|--------------|---------------------|
| **From job posting** | Skills tagged on the listing | *“From skills tagged on this job listing.”* |
| **From industry catalog** | Common industry skills (when posting has no skill tags) | *“This listing has no skill tags. These are common skills employers look for in this industry (from the catalog).”* |
| **No data** | Message that no skills are available | Suggests adding skills to listings or picking a role whose category matches the catalog |

**Action:** Compare this list with skills in your **Career Survey** or **Profile** to see what you already have.

---

#### 11.3.3 Industry — High Demand Skills

**Section title:** *Industry — high demand skills*

Shows skills that are **most sought after** in the industry linked to the job's category (e.g. Technology, Healthcare, Finance).

**When shown:** Only when the job's category maps to an industry in the skill-gap catalog.

**Use this to:** Identify skills worth learning that are valued across many employers in that sector.

---

#### 11.3.4 Industry — Skill Gaps (Short Supply)

**Section title:** *Industry — skill gaps (short supply)*

Shows skills where **talent supply is low** relative to demand — these are shortage areas in the industry.

**Use this to:** Find skills that may give you a competitive advantage because fewer candidates have them.

---

#### 11.3.5 Gap Focus for This Role

**Section title:** *Gap focus for this role*

This is the most actionable section. It lists **in-demand or shortage skills from the industry catalog that are NOT listed on the job posting**.

The description reads: *“In-demand or shortage skills from the industry catalog that are not listed on this posting — useful targets to close your personal gap.”*

**Example scenario:**

- Job posting lists: Python, SQL, Machine Learning  
- Industry high-demand skills include: Cloud Computing, MLOps, Data Engineering  
- **Gap focus** might show: Cloud Computing, MLOps — skills the employer may value but did not explicitly list  

**Use this to:** Build a targeted learning plan for the role you are pursuing.

> **Attach screenshot:** Full analysis panel with all four sections visible for a selected role.

![Figure 14b — Skill gap analysis results](screenshots/14b-skill-gap-results.png)

*Figure 14b — Complete skill gap analysis for a selected role*

---

### 11.4 When Industry Data Does Not Match

If the job's category does not match any industry in the catalog, you will see:

- Skills from the **job posting only** (if tagged)  
- Message: *“No industry skill-gap profile matches this role's category. The skills above are only what appears on the posting (if any).”*

**What to do:** Try selecting a role in a supported category (Technology, Finance, Healthcare, Education, Manufacturing, etc.) or ensure job listings in the database have a valid **Category** field.

---

### 11.5 Supported Industry Categories

The skill-gap catalog maps job categories to industry profiles. Supported categories include:

Technology, Finance, Healthcare, Education, Manufacturing, Energy & Utilities, Retail, Construction, Hospitality, Transportation, Real Estate, Media & Entertainment, Legal, Government, Agriculture, Mining, Professional Services, Creative & Design, Nonprofit, Telecom, and Aerospace.

---

### 11.6 Tips for Using Skill Gap Analysis

1. **Start with roles you are interested in** — search by title from your **Recommendations** or **Top 10 Jobs**.  
2. **Focus on “Gap focus for this role”** — these are the best skills to add to your learning plan.  
3. **Compare with your profile** — open **Profile** or **Career Survey** side by side and note skills you are missing.  
4. **Cross-reference Market Trends** — trending skills on Market Trends often appear in industry high-demand lists here.  
5. **Use Clear** to quickly switch between different roles without reloading the page.

### 11.7 Connecting Skill Gap to Your Career Plan

| Skill Gap section | Action you can take |
|-------------------|---------------------|
| Skills needed for this role | Verify you meet baseline requirements |
| Industry — high demand skills | Add to your skill development list |
| Industry — skill gaps | Prioritize scarce skills for competitive advantage |
| Gap focus for this role | Create a short-term learning plan for this specific job |

---

## 12. Job Search

**URL:** `/jobsearch` (not in the main menu — open directly in the browser or bookmark the link)  
**Page title:** *Job Search & Career Details*

### Quick Steps

1. Go to `/jobsearch` while signed in.
2. Optionally set **Job category** and **Country** filters to narrow results.
3. Type in **Search jobs** — title suggestions appear as you type; pick a suggestion or press search.
4. Review up to **10 matching jobs** in the results list.
5. **Click a job** to open the detail modal (description, career path, salary, growth, skills).
6. Click **Save Job** to bookmark a role, or **Close** / press **Esc** to dismiss the modal.
7. Change filters or search terms to explore other roles.

> **Attach screenshot:** Job Search with filters and result list.

![Figure 15 — Job Search](screenshots/15-job-search.png)

*Figure 15 — Job search and details*

### 12.1 Filters

| Filter | Purpose |
|--------|---------|
| **Job category** | Narrow by category from the database |
| **Country** | Filter by country |
| **Search jobs** | Search listings; title suggestions appear as you type |

### 12.2 Results

- Up to 10 matching jobs displayed  
- Click a job for a **detail modal**: description, career path, salary, growth, skills  

### 12.3 Actions

| Button | Action |
|--------|--------|
| **Save Job** / **Saved** | Bookmark a job |
| **Close** | Close the detail modal |

---

## Appendix C — Quick Steps Summary (All Features)

Use this page as a one-page reference for the main workflows.

### AI Recommendations
**Menu:** Recommendation

1. Complete the Career Survey first.
2. Click **Generate Recommendations**.
3. Review cards (match %, salary, growth).
4. Click a card for details, learning path, and skill gap chart.
5. Use **Ask** or the **Career Advisor** chat for follow-up questions.
6. **Save** roles you like.

### Real-Time Job Market Analysis (Market Trends)
**Menu:** Market Trends

1. Open **Market Trends** from the nav bar or Home → Quick Actions.
2. Read the page title *Real-Time Job Market Analysis* and scroll top to bottom through five zones.
3. Hover the **demand growth** line chart (2020–2025) for tooltips.
4. Review **Trending Skills in 2024** cards (green growth badges).
5. Read the three **stat cards** — average salary, yearly growth, top hiring regions.
6. Compare **salary ranges** by experience level (Entry → Lead/Principal).
7. Study the **Required Skills Distribution** doughnut chart and progress bars.

### Top 10 Jobs
**Menu:** Top 10 Jobs

1. Open Top 10 Jobs from the menu.
2. Use **Refresh now** or wait for auto-refresh.
3. Review the job growth chart.
4. Browse job cards (title, sector, salary, growth).
5. Select jobs with the checkbox.
6. **View skills & career path** for detailed role info.
7. **Compare benefits** for side-by-side comparison.

### Skill Gap
**Menu:** Skill Gap

1. Open Skill Gap from the menu.
2. Search for a job role by title or keyword.
3. Select a role from suggestions.
4. Review skills needed for the role.
5. Compare industry high-demand skills and skill gaps.
6. Focus on **Gap focus for this role** for learning targets.
7. Click **Clear** to search again.

### Job Search
**URL:** `/jobsearch`

1. Open `/jobsearch` while signed in.
2. Set **Job category** and **Country** filters (optional).
3. Search by job title with suggestions.
4. Click a job for full details in the modal.
5. **Save Job** to bookmark favorites.

---

## 13. Logging Out

1. Click **Logout** in the top-right of the navigation bar.  
2. Your session ends and you return to the **Login** page.  
3. To use the application again, sign in with your email and password.

> **Attach screenshot:** Navigation bar with user name and Logout button highlighted.

![Figure 16 — Logout](screenshots/16-logout.png)

*Figure 16 — Logout control*

---

## 14. Troubleshooting

| Problem | What to try |
|---------|-------------|
| **Cannot sign in** | Verify email and password; ensure you registered first. Check caps lock. |
| **Page shows connection or API error** | Confirm the backend server is running. Contact your administrator. |
| **No recommendations generated** | Complete the Career Survey with at least one interest path and skills, then click **Save** or **Save & view recommendations**. |
| **“Career survey required” banner** | Open **Career survey**, fill required fields, and save. |
| **Recommendations seem generic** | Update profile/skills and click **Regenerate**. Complete the Skill Assessment for richer data. |
| **Career Advisor does not respond** | AI chat may require API configuration (OpenAI/Gemini). Contact administrator if chat fails consistently. |
| **Top Jobs or Skill Gap empty** | Check network connection and backend. Top Jobs: click **Refresh now**. Skill Gap: try different search keywords or ensure job listings exist in the database. |
| **Skill Gap shows no industry data** | The job category may not match the industry catalog — try a role in Technology, Healthcare, Finance, etc. |
| **Top 10 Jobs list empty** | Click **Refresh now**; ensure backend API is running and returning job listings. |
| **Forgot password link does nothing** | Password reset may not be configured — contact administrator. |
| **Lost survey progress** | Drafts are saved in the browser; use the same browser/device. Clearing site data may remove drafts. |

---

## Appendix A — Screenshot Checklist

Create a folder `docs/screenshots/` and capture these images for the manual:

| File name | What to capture |
|-----------|-----------------|
| `01-home-navigation.png` | Home page with full header and nav |
| `02-signup.png` | Create Account form |
| `03-login.png` | Login form |
| `04-after-login.png` | First screen after login |
| `05-home.png` | Home dashboard widgets |
| `06-career-survey.png` | Career survey with sample data |
| `07-assessment.png` | Skill assessment step |
| `08-recommendations.png` | Recommendation cards |
| `09-recommendation-detail.png` | Detail panel + radar chart |
| `10-career-advisor.png` | Chat panel open |
| `11-profile.png` | Profile form |
| `12-market-trends.png` | Full Market Trends page |
| `12a-market-demand-chart.png` | Demand growth line chart (with tooltip) |
| `12b-trending-skills.png` | Trending Skills in 2024 cards |
| `12c-market-stats.png` | Average Salary, Yearly Growth, Top Hiring Regions |
| `12d-salary-ranges.png` | Salary ranges by experience level |
| `12e-skills-distribution.png` | Skills distribution doughnut chart |
| `13-top-jobs.png` | Full Top 10 Jobs page |
| `13a-top-jobs-header.png` | Live date/time, Refresh now, Get My Recommendations |
| `13b-job-growth-chart.png` | Job growth by role bar chart |
| `13c-job-list.png` | Job cards with Select checkboxes |
| `13d-job-selection.png` | Selection banner with action buttons |
| `13e-compare-benefits.png` | Compare benefits table |
| `13f-career-path.png` | Skills, qualifications & career path panel |
| `14-skill-gap.png` | Skill Gap page (empty/search state) |
| `14a-skill-gap-search.png` | Role search dropdown with suggestions |
| `14b-skill-gap-results.png` | Full analysis panel for selected role |
| `15-job-search.png` | Job Search results |
| `16-logout.png` | Logout in navigation |

---

## Appendix B — Quick Reference — Navigation Menu

| Menu item | Route | Purpose |
|-----------|-------|---------|
| Home | `/home` | Dashboard and quick actions |
| Career survey | `/career-survey` | Required career background intake |
| Recommendation | `/recommendation` | AI career matches and advisor |
| Market Trends | `/dashboard` | Real-Time Job Market Analysis — charts and stats |
| Top 10 Jobs | `/top-jobs` | Popular roles explorer |
| Skill Gap | `/skill-gap` | Role vs industry skill analysis |
| Logout | — | End session |

---

*© 2026 AI Career Recommendation System — Developed for Academic Project*
