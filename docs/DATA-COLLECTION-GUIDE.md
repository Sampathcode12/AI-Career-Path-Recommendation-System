# Data Collection Guide — AI Career Path Recommendation System

This guide explains how you can collect data for the system: **inside the app** (already built) or **via external tools** like Google Forms, and how to get that data into your backend if needed.

---

## 1. What data the system uses

| Data type | Fields / content | Where it’s used |
|----------|------------------|------------------|
| **Profile** | Skills, interests, experience level, education, location, bio, LinkedIn URL, portfolio URL | AI recommendations, job matching |
| **Assessment** | Skill levels (e.g. programming, data analysis, communication, leadership), work style, industry, work environment, years of experience | AI recommendations, “skills assessed” stats |
| **Feedback (optional)** | Whether recommendations were helpful, preferred careers, comments | Improve AI or analytics (if you add this later) |

Your app already collects **profile** and **assessment** through the in-app Profile and Assessment pages and saves them to your backend.

---

## 2. Option A: Collect data inside your app (current setup)

- **Profile** → User fills the form on the Profile page → `POST/PUT /api/profile`.
- **Assessment** → User answers questions on the Assessment page → `POST /api/assessment`.

No extra “data collection” step is required for normal use. Data is stored in your database and used when generating recommendations.

Use this when: You want all users to use the same app and you’re fine with them creating an account and using your UI.

---

## 3. Option B: Use Google Forms (or similar) to collect data

Google Forms (or alternatives like **Microsoft Forms**, **Typeform**, **Jotform**) are useful when you want to:

- Run **surveys** or **pilot studies** without forcing people to sign up to your app.
- Gather **training or evaluation data** for the AI (e.g. “ideal career” or “was this recommendation good?”).
- Collect **one-off feedback** (e.g. after showing recommendations).
- Let **external partners** (schools, career centers) send a single form link.

### What to put in the form

You can mirror your app’s inputs so that responses can later be mapped into your system:

**Profile-like questions (short text / dropdowns):**

- Skills (short text or comma‑separated)
- Interests (short text)
- Experience level (dropdown: e.g. Student, Entry, Mid, Senior)
- Education (dropdown or short text)
- Preferred industries (short text or checkboxes)
- Location (short text)
- Bio (paragraph)
- LinkedIn URL, Portfolio URL (short text)

**Assessment-like questions (dropdowns / scales 1–5):**

- Programming / Data analysis / ML / Web dev / Database (1–5)
- Communication / Leadership / Problem solving / Teamwork / Creativity (1–5)
- Work style, Industry, Work environment, Years of experience (dropdowns)

**Optional extra (for AI or analytics):**

- “Which career are you most interested in?” (short text or dropdown)
- “Was this recommendation helpful?” (Yes/No or 1–5)
- Free-text feedback

Responses are stored in **Google Sheets** (one row per response). You can export (CSV/Excel) or use the Sheets API / add-ons to move data elsewhere.

---

## 4. Getting Google Form data into your system

You have a few ways to “collect data” with Google Forms and still use it for your system.

### 4.1 Use forms only for surveys / training (no live sync)

- Create a Google Form that matches the fields above (and any extra questions).
- Share the form link; people fill it without using your app.
- Periodically: **Download responses** (Google Sheets → File → Download → CSV/Excel).
- **Manually or via script**: Map columns to your DB (e.g. create/update `UserProfile` and `Assessment` in your backend), or use the CSV to train/improve your AI model. Your app keeps using the data that’s already in your database.

### 4.2 Automate export with Google Sheets

- Form responses go to a **Google Sheet**.
- Use **Google Apps Script** in the sheet to:
  - Run on form submit (or on a timer).
  - Call your backend API (e.g. `POST /api/profile`, `POST /api/assessment`) with the new row data, if you expose endpoints that accept “anonymous” or “imported” submissions.
- Or: Export the sheet as CSV and run a **scheduled script** (e.g. Python/Node) that reads the CSV and inserts/updates your database.

### 4.3 No-code automation (Zapier / Make)

- **Trigger**: “New response in Google Forms” (or “New row in Google Sheet”).
- **Action**: “Webhook” or “HTTP request” to your backend (e.g. `POST https://your-api.com/api/import/profile` or a custom import endpoint).
- You’ll need to map form question IDs to the JSON body your API expects (profile + assessment fields).

### 4.4 Embed a form in your app (optional)

- You can **embed** a Google Form (or Typeform/Jotform) in your React app via an iframe:
  - e.g. “Prefer to fill a quick survey? [Open form]” or a dedicated “Survey” page.
- Data still lives in Google Sheets (or the form provider). To use it in your app you still need one of the above: export + import, Sheets API/script, or Zapier/Make.

---

## 5. Suggested setup by goal

| Goal | Suggested approach |
|------|---------------------|
| **Normal product use** (users sign up and use the app) | Use **Option A** only: collect everything in-app (Profile + Assessment). |
| **Pilot / survey** (no signup, many one-off responses) | **Google Form** (or similar) with profile + assessment questions → export to CSV/Sheets → import into DB or use for analysis/training. |
| **Training / improving AI** | Collect many responses (in-app and/or via form). Export from DB or from Sheets → use for fine-tuning or evaluation. |
| **Feedback on recommendations** | Add optional “Was this helpful?” in the app, or add a separate **Google Form** “Recommendation feedback” and analyse in Sheets. |

---

## 6. Quick checklist if you use Google Forms

1. Create a form that includes **profile-like** and **assessment-like** questions (see section 3).
2. Link the form to a **Google Sheet** (responses → Sheet).
3. Decide how to get data into your system: **manual CSV import**, **Sheets API / Apps Script**, or **Zapier/Make** to call your API.
4. If you call your API from Sheets or Zapier: add an **import endpoint** (e.g. `POST /api/import/survey`) that accepts JSON, maps to `UserProfile` + `Assessment` (and optionally creates a placeholder `User` or marks source as “form”), and optionally triggers recommendation generation.

---

## 7. Privacy and consent

- In the form, add a **consent / privacy** question or short text (e.g. “I agree that my answers can be used to generate career recommendations and for improving the service”).
- In your app privacy policy, state if you also collect data via external forms and how you use it (recommendations, analytics, AI training).

---

**Summary:** You can collect data **in the app** (current way) or **via Google Forms** (or similar) for surveys and training. To “use” form data in your system, export from Sheets and import into your DB, or automate with Sheets + script or Zapier/Make calling your API.
