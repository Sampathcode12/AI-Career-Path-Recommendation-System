# Figma UI Design Prompt — AI Career Path Recommendation System (max 5,000 chars)

Use with Figma, Figma AI, or AI design tools. Copy the prompt below.

---

## Prompt (copy from here)

Design a modern web UI for the "AI Career Path Recommendation System" — a career app where users sign up, complete profile + career survey, then get AI career recommendations, job search, market trends, and skill gap analysis.

**Requirements:** Desktop 1440px; clean, professional; primary teal #0D7377; WCAG AA; consistent design system (buttons, inputs, cards, charts). App shell: header + horizontal nav when logged in; auth screens = full-screen centered cards.

**Screens:**

1. **Login** — Centered card. Title "Welcome Back", subtitle. Email, Password, Sign in, link to Sign up. Error area.
2. **Sign up** — Same layout. Name, Email, Password, Sign up. Link to Login.
3. **Header** — "AI Career Path Recommendation System"; optional tagline (Real-Time Job Market • Multi-Career Path • AI Recommendation • Skill Gap • Scalable Platform).
4. **Nav** — Home, Career Survey, Recommendation, Market Trends,  Top 10 Jobs, Skill Gap. Right: user name, Logout. Active state.
5. **Home** — Welcome; profile completion (progress ring/bar, e.g. 45%); "Take Career Survey" CTA; 4 stat cards (recommended careers, skills assessed, learning paths, job matches); skill growth line chart; quick actions (Profile, Career Survey, Recommendations, Job Search).
6. **Profile** — Form: name, email, education, role, location, skills, interests, bio, LinkedIn, portfolio. Progress %, Save. Loading/error states.
7. **Career Survey** — Single scrollable page (no steps). White card container, max-width 780px, centered. Teal header bar with title "Career Survey" and subtitle "Help us understand your skills and preferences so we can recommend the best career paths for you." Sections separated by a teal left-border label. Fields:
   - **Section 1 – Basic Information:** Age Range (radio: Under 18 / 18–24 / 25–34 / 35–44 / 45+); Education Level (dropdown: High School / Diploma / Bachelor's / Master's / PhD / Other); Field of Study (short text, placeholder "e.g. Business, Engineering, Arts"); Current Role (short text, placeholder "e.g. Student, Software Developer"); Years of Experience (radio: 0–1 / 2–3 / 4–6 / 7–10 / 10+).
   - **Section 2 – Core Skills:** 9 linear-scale rows (1 = Beginner → 5 = Expert, 5 filled circles per row): Problem Solving, Communication, Leadership, Teamwork, Time Management, Creativity, Analytical Thinking, Decision Making, Adaptability. Each row: label left, 5 clickable circles right, numbers 1–5 below circles.
   - **Section 3 – Work Preferences:** Preferred Work Style (radio: Teamwork / Independent / Both); Preferred Work Environment (radio: Office / Remote / Hybrid); Preferred Work Type (radio: Structured tasks / Creative tasks / Analytical tasks / Practical hands-on); Work Motivation (radio: High salary / Work-life balance / Career growth / Helping people / Innovation & creativity).
   - **Section 4 – Areas of Interest:** Checkbox grid (3 columns): Technology, Business, Finance, Healthcare, Education, Engineering, Design & Creative Arts, Media & Journalism, Government, Hospitality & Tourism, Science & Research, Entrepreneurship.
   - **Section 5 – Personality & Work Behavior:** 5 linear-scale rows (1 = Strongly Disagree → 5 = Strongly Agree): "I enjoy solving complex problems", "I like working with people", "I enjoy creative activities", "I prefer structured tasks", "I enjoy learning new skills".
   - **Section 6 – Career Target:** "Which career are you most interested in?" (short text, required); "List 2–3 other careers you would consider." (textarea, optional); "Any careers you would NOT consider?" (short text, optional).
   - **Footer actions:** Primary teal button "Submit Survey" (full width or right-aligned); secondary ghost button "Save & Continue Later". Success state: green checkmark card "Survey submitted! Generating your recommendations…" with link to Recommendation page.
8. **Recommendation** — Title "AI-Based Career Recommendation". CTA "Generate recommendations". Career cards: title, match %, salary, growth %, description, skill tags; expandable: requirements (education, experience, certs), learning path (steps + duration). Save/Unsave per card.
9. **Dashboard (Market Trends)** — Title. Line chart (demand over years); doughnut (skill distribution); trending skills table (name, growth %, demand); salary by level (Entry/Mid/Senior + range + growth %).
10. **Job Search** — Filters (sector, category, salary, region), search input, Search button. Results: cards/list with title, company, location, snippet, Save.
11. **Top 10 Jobs** — List of 10 roles: title, salary, growth, description, career path steps, Save.
12. **Skill Gap** — By industry (e.g. Tech, Healthcare, Finance): in-demand skills, gap indicators, suggested skills. Cards or table per industry.

**Components:** Primary/secondary/text buttons (default, hover, disabled, loading). Inputs: text, password, textarea, select, radio; label + error. Cards for recommendations, jobs, stats. Line, doughnut, bar chart placeholders. Nav item + icon; header/footer. Alerts: error (red), success (green), info (blue).

**Tokens:** Primary #0D7377, secondary #06B6D4, chart #8B5CF6 #10B981, bg #F5F5F5/#FFF, error #DC2626. 16px body, 1.5 line height.

Deliver: design system page + one frame per screen (1440px); optional 768px for Login, Home, Recommendation. Optional prototype: Login → Home → Profile → Career Survey → Recommendation.
