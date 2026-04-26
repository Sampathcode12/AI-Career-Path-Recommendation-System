# Prompt: Create Google Form for AI Career Path Recommendation System

Use these prompts to generate a **Google Form** that collects data for your app and for **training the AI model**. Copy a prompt below and paste it into ChatGPT, Claude, or another AI. Use the output as a **step-by-step checklist** to build your form in [Google Forms](https://forms.google.com).

**Purpose of this form:** This form is used to **collect data to train the AI model** for the AI Career Path Recommendation System. Responses provide **input features** (profile, skills, preferences) and a **target/label** (career of interest) so the system can learn to recommend careers. You can use the same form for in-app-style surveys and for external data collection (e.g. pilot studies, training datasets). Export responses from Google Sheets (CSV) to train, fine-tune, or evaluate the recommendation model.

---

## Form comparison & recommendation

You may have three form designs in mind. Here’s a short comparison and what we recommend.

| Aspect | **Form A: App-aligned (29 Q’s)** | **Form B/C: Common data (28 Q’s)** |
|--------|----------------------------------|-------------------------------------|
| **Profile** | Full name, Email, Education, Role, Location, Skills (text), Interests, Bio, LinkedIn, Portfolio | Age range, Education, Field of study, Role, Years of experience (no name/email) |
| **Skills** | Technical (Programming, Data Analysis, ML, Web Dev, Database) + Soft (Communication, Leadership, etc.) 1–5 | Universal only (Problem solving, Communication, Leadership, Teamwork, Time management, Creativity, Analytical, Decision making, Adaptability) 1–5 |
| **Extra** | Work preferences (style, industry, environment, years) | Same + **Interests (checkbox)** + **Personality/behavior** 1–5 (e.g. “I enjoy complex problems”) + **Work type** & **Work motivation** |
| **Career target** | Q26–29 (career interested in, alternatives, not considered, comments) | Q26–28 (career interested in, alternatives, not considered) |
| **Best for** | Matching in-app data; tech-heavy users; importing into existing Profile/Assessment API | One survey for **all industries**; training one model on one dataset; anonymous or minimal PII |
| **App alignment** | Same fields as Profile + Assessment pages → easy import | Different field names → need mapping; some app fields (e.g. technical skills) missing |

### Recommendation

- **Use the “Common Data” form (Form B/C — the “Updated Google Form (Common Data for All Industries)” below)** as your **main form for training the AI model** if:
  - You want **one form for all sectors** (tech, healthcare, education, etc.).
  - You prefer **less PII** (no full name/email required) for training data.
  - You want **personality/behavior** and **interests (checkboxes)** as extra features for the model.

- **Use the “App-aligned” form (Form A — 29 questions with Full name, Email, technical skills)** if:
  - You need **maximum alignment** with your app’s Profile and Assessment pages (same fields, easy import).
  - Most respondents are **tech-oriented** and technical skill levels (Programming, ML, etc.) are important for recommendations.

- **Small improvement for the Common Data form:** For **Section 6 (Personality & work behavior)**, use scale labels **“1 = Strongly disagree”** and **“5 = Strongly agree”** (as in the third form you shared) instead of “Beginner / Expert,” so it’s clear these are attitude/behavior items, not skill levels.

**Summary:** For **training the AI model** with broad, industry-agnostic data, we **recommend the Common Data form (Form B/C)**. For **matching the live app** and tech-focused users, use **Form A**. You can also run both and merge datasets if you map Form B/C fields to your app schema.

---

## Updated Google Form (Common Data for All Industries)

This is the **recommended form structure** for collecting data to **train the AI model** for this system. It uses common, industry-agnostic questions so one dataset can support the recommendation model across sectors.

---

### Section 1: Consent

**Question 1**  
Do you agree that your responses may be used to generate career recommendations and improve the AI system?

- **Type:** Multiple choice  
- **Options:** I agree | I do not agree  
- **Required:** Yes  
- **Logic:** If "I do not agree" → End form  

---

### Section 2: Basic Information

| # | Question | Type | Options / Notes |
|---|----------|------|-----------------|
| 2 | Age Range | Multiple choice | Under 18, 18–24, 25–34, 35–44, 45+ |
| 3 | Education Level | Dropdown | High School, Diploma / Certificate, Bachelor's Degree, Master's Degree, PhD, Other |
| 4 | Field of Study | Short answer | e.g. Business, Engineering, Arts |
| 5 | Current Role | Short answer | e.g. Student, Employee, Freelancer |
| 6 | Years of Experience | Multiple choice | 0–1, 2–3, 4–6, 7–10, 10+ |

---

### Section 3: Core Skills (Universal Skills)

Rate from **1–5** (1 = Beginner, 5 = Expert). Use **Linear scale** for each.

| # | Question |
|---|----------|
| 7 | Problem Solving |
| 8 | Communication Skills |
| 9 | Leadership |
| 10 | Teamwork |
| 11 | Time Management |
| 12 | Creativity |
| 13 | Analytical Thinking |
| 14 | Decision Making |
| 15 | Adaptability |

---

### Section 4: Work Preferences

| # | Question | Type | Options |
|---|----------|------|---------|
| 16 | Preferred Work Style | Multiple choice | Teamwork, Independent Work, Both |
| 17 | Preferred Work Environment | Multiple choice | Office, Remote, Hybrid |
| 18 | Preferred Work Type | Multiple choice | Structured tasks, Creative tasks, Analytical tasks, Practical / hands-on work |
| 19 | Work Motivation | Multiple choice | High salary, Work-life balance, Career growth, Helping people, Innovation / creativity |

---

### Section 5: Interests

**Question 20** — Which areas interest you the most?

- **Type:** Checkbox  
- **Options:** Technology, Business, Finance, Healthcare, Education, Engineering, Design / Creative Arts, Media / Journalism, Government / Public Service, Hospitality / Tourism, Science / Research, Entrepreneurship  

---

### Section 6: Personality & Work Behavior

Rate **1–5** (Linear scale) for each. Use **1 = Strongly disagree**, **5 = Strongly agree** (not Beginner/Expert — these are attitude/behavior items).

| # | Question |
|---|----------|
| 21 | I enjoy solving complex problems |
| 22 | I like working with people |
| 23 | I enjoy creative activities |
| 24 | I prefer structured tasks |
| 25 | I enjoy learning new skills |

---

### Section 7: Career Target (AI Training Label)

These questions are the **target/label** the AI model learns to predict from the other answers.

| # | Question | Type | Required |
|---|----------|------|----------|
| 26 | Which career are you currently interested in? (e.g. Teacher, Accountant, Software Engineer, Doctor, Designer) | Short answer | Yes |
| 27 | List 2–3 other careers you would consider. | Paragraph | No |
| 28 | Any careers you would NOT consider? | Short answer | No |

**Training use:** Map Question 26 to the **label/target**; map Sections 1–6 (and Q21–25) to **input features** when building or fine-tuning the recommendation model.

### Mapping: Updated Form → App / Training

| Form question / section | App / API field (if importing) | Training role |
|------------------------|-------------------------------|---------------|
| Q2 Age Range | Profile / custom | Feature |
| Q3 Education Level | Profile: education | Feature |
| Q4 Field of Study | Profile: interests or custom | Feature |
| Q5 Current Role | Profile: experience_level | Feature |
| Q6 Years of Experience | Assessment: yearsExperience | Feature |
| Q7–Q15 Core skills 1–5 | Assessment (e.g. problemSolving, communication, leadership, teamwork, timeManagement, creativity, analyticalThinking, decisionMaking, adaptability) | Features |
| Q16 Preferred Work Style | Assessment: workStyle | Feature |
| Q17 Work Environment | Assessment: workEnvironment | Feature |
| Q18 Preferred Work Type | Assessment: workType | Feature |
| Q19 Work Motivation | Assessment: workMotivation | Feature |
| Q20 Interests (areas) | Profile: interests / preferred_industries | Feature |
| Q21–Q25 Personality 1–5 | Assessment (e.g. complexProblems, workingWithPeople, creative, structured, learningNewSkills) | Features |
| **Q26 Career interested in** | — | **Label / target** (what the model predicts) |
| Q27 Other careers to consider | Optional secondary label / evaluation | Optional label |
| Q28 Careers NOT considered | Optional negative signal for model | Optional feature |

Use this mapping when exporting from Google Sheets (CSV) for model training or when importing responses into your backend.

---

## Alternative: App-aligned form (Form A — 29 questions)

Use this form when you want **maximum alignment with your app** (Profile + Assessment pages) and **tech-focused** training data. It includes Full name, Email, Location, free-text Skills/Interests/Bio, LinkedIn/Portfolio, **technical skills** (Programming, Data Analysis, ML/AI, Web Dev, Database) and soft skills (Communication, Leadership, Problem solving, Teamwork, Creativity), work preferences, and Career target (Q26–29).

| Section | Questions |
|--------|------------|
| 1. Consent | Q1: Agree to use responses for recommendations and AI improvement (I agree / I do not agree → end form). |
| 2. Basic profile | Q2 Full name, Q3 Email (validated), Q4 Education (dropdown), Q5 Current role, Q6 Location, Q7 Skills (comma-separated), Q8 Interests, Q9 Bio, Q10 LinkedIn URL, Q11 Portfolio URL. |
| 3. Technical skills 1–5 | Q12 Programming, Q13 Data Analysis, Q14 Machine Learning/AI, Q15 Web Development, Q16 Database. |
| 4. Soft skills 1–5 | Q17 Communication, Q18 Leadership, Q19 Problem solving, Q20 Teamwork, Q21 Creativity. |
| 5. Work preferences | Q22 Work style (Collaborative / Independent / Mixed), Q23 Industry (Technology, Finance, Healthcare, etc.), Q24 Environment (Remote / Office / Hybrid), Q25 Years of experience. |
| 6. Career target | Q26 Career(s) interested in (required), Q27 Alternative careers, Q28 Careers NOT considered, Q29 Additional comments. |

**When to use:** When you need to import form responses directly into your backend (same schema as Profile + Assessment) or when most users are in or targeting tech roles.

---

## Short prompt (generate the form)

Copy this if you only want one quick prompt to generate the full form:

```
Generate a complete Google Form for the "AI Career Path Recommendation System". The form will collect data to train our recommendation AI and to match users with careers. Include:

1. Intro: brief description + consent ("I agree my responses may be used for career recommendations and to improve the service").
2. Profile: Full name, Email (validated), Education (dropdown: High school, Bachelor's, Master's, PhD, Vocational, Other), Current role, Location, Skills (comma-separated), Interests, Bio (optional), LinkedIn URL, Portfolio URL (optional).
3. Technical skills (Linear scale 1–5, 1=Beginner, 5=Expert): Programming, Data Analysis, Machine Learning/AI, Web Development, Database.
4. Soft skills (Linear scale 1–5): Communication, Leadership, Problem Solving, Teamwork, Creativity.
5. Work preferences: Preferred work style (Collaborative / Independent / Mixed), Industry interest (Technology, Finance, Healthcare, Education, Consulting, Startup), Work environment (Remote / Office / Hybrid), Years of experience (0–2, 3–5, 6–10, 10+).
6. For model training (optional): "Which career(s) are you most interested in or targeting?" (short answer), "Any careers you would NOT consider?" (short answer), and optional free-text feedback.

For each question give: section name, exact question text, field type (Short answer, Paragraph, Multiple choice, Dropdown, Linear scale), all options or scale labels, and Required yes/no. Output a numbered checklist so I can build the form in Google Forms step by step.
```

---

## Full copy-paste prompt (detailed specification)

```
Create a Google Form structure for an "AI Career Path Recommendation System" survey. The form collects the same data as our app: profile information and a skill/preference assessment. This data will be used to train the recommendation model and to provide personalized career suggestions. List each question with the exact question text, field type (Short answer, Paragraph, Multiple choice, Dropdown, Linear scale, etc.), and all options where applicable. Use this specification:

---

SECTION 1: INTRODUCTION
- Add a short description at the top: "This survey helps us understand your skills and preferences so we can recommend suitable career paths. Your responses will be used to generate personalized career recommendations."
- Consent (Required): Multiple choice — "I agree that my responses may be used to generate career recommendations and to improve the service." Options: "I agree" / "I do not agree". If "I do not agree", end the form or skip to end.

---

SECTION 2: BASIC INFO (Profile – optional or required as you prefer)
- Full name: Short answer
- Email: Short answer (with response validation: Email)
- Education level: Dropdown — "High school", "Bachelor's degree", "Master's degree", "PhD", "Vocational / Certificate", "Other"
- Current or most recent role: Short answer (e.g. "Student", "Software Developer", "Unemployed")
- Location (city or region): Short answer
- Skills (comma-separated, e.g. Python, communication, project management): Paragraph
- Interests (topics or areas you enjoy): Paragraph
- Short bio (optional): Paragraph
- LinkedIn profile URL (optional): Short answer
- Portfolio or personal website URL (optional): Short answer

---

SECTION 3: TECHNICAL SKILLS (Assessment – scale 1–5)
For each question use: Linear scale 1–5, with labels: 1 = Beginner, 5 = Expert. Required.
- Programming & Coding (1–5)
- Data Analysis (1–5)
- Machine Learning / AI (1–5)
- Web Development (1–5)
- Database (1–5)

---

SECTION 4: SOFT SKILLS (Assessment – scale 1–5)
Same: Linear scale 1–5, 1 = Beginner, 5 = Expert. Required.
- Communication (1–5)
- Leadership (1–5)
- Problem Solving (1–5)
- Teamwork (1–5)
- Creativity (1–5)

---

SECTION 5: WORK PREFERENCES
- Preferred work style: Multiple choice — "Collaborative team work", "Independent work", "Mixed (both)"
- Industry interest: Multiple choice — "Technology", "Finance", "Healthcare", "Education", "Consulting", "Startup"
- Work environment: Multiple choice — "Remote", "Office", "Hybrid"
- Years of experience: Multiple choice — "0–2 years", "3–5 years", "6–10 years", "10+ years"

---

SECTION 6: OPTIONAL FEEDBACK (for improving the AI)
- Which career(s) are you most interested in? (Short answer, optional)
- Any additional comments? (Paragraph, optional)

---

Output format:
For each question give: (1) Section heading, (2) Question text exactly as it should appear in the form, (3) Field type, (4) Options or scale labels if applicable, (5) Required yes/no. Then provide a short note on how to map form responses to our app fields (e.g. "Programming 1–5" → assessment field "programming", "Preferred work style" → "workStyle") so we can import responses into our system later.
```

---

## Prompt: Form for model training data only

Use this when you want a form **only for collecting training data** (inputs + target career so you can train or evaluate the model). Same structure as above, but emphasize the "label" fields that the model should learn to predict:

```
Create a Google Form to collect training data for an AI Career Path Recommendation System. Each response will be one training example: INPUTS = profile + assessment, LABEL = career(s) the person is interested in or currently targeting. The form must include:

INPUT FEATURES (same as the main app so we can map to the model):
- Profile: Education (dropdown), Current role, Location, Skills (comma-separated), Interests (paragraph).
- Technical skills 1–5: Programming, Data Analysis, Machine Learning, Web Development, Database.
- Soft skills 1–5: Communication, Leadership, Problem Solving, Teamwork, Creativity.
- Work preferences: Work style (Collaborative/Independent/Mixed), Industry (Technology, Finance, Healthcare, etc.), Environment (Remote/Office/Hybrid), Years of experience.

LABEL / TARGET (for supervised learning or evaluation):
- "Which career(s) are you most interested in or currently targeting?" — Short answer or Paragraph (required). This is the outcome we want the model to predict.
- Optional: "List 2–3 alternative careers you would consider." — Paragraph.
- Optional: "Careers you would NOT consider." — Short answer.

Also include: Consent ("I agree my responses may be used to train and improve the career recommendation AI"), and optionally Email (for follow-up). Do not require full name if you want anonymous training data.

Output: For each question give section, question text, field type, options/scale, required yes/no. Add a short note on how to export responses (e.g. CSV from Google Sheets) and map columns to feature names and the target/label column for training.
```

---

## After you get the list

1. Go to [Google Forms](https://forms.google.com) and create a new blank form.
2. Add a **title**: e.g. "AI Career Path — Profile & Assessment Survey".
3. Add **sections** (use the "Add section" button) for each block above (Intro, Basic info, Technical skills, Soft skills, Work preferences, Optional feedback).
4. For each question in the AI output:
   - Choose the right **question type** (Short answer, Paragraph, Multiple choice, Dropdown, Linear scale).
   - Set **Required** on/off as specified.
   - For **Linear scale**, set Min = 1, Max = 5, and label 1 = "Beginner", 5 = "Expert".
5. In **Settings** (gear icon): collect email addresses if you want, and show a progress bar so respondents see how long the form is.
6. Link the form to a **Google Sheet** (Responses → Link to Sheets) so you can export or automate later (see `DATA-COLLECTION-GUIDE.md`).

---

## Quick mapping: Form → App/backend

| Form question / section   | App / API field(s)                    |
|--------------------------|----------------------------------------|
| Full name                | Profile: name (or user name)           |
| Email                    | Profile / User: email                  |
| Education level          | Profile: education                     |
| Current role             | Profile: experience_level              |
| Location                 | Profile: location                     |
| Skills                   | Profile: skills                       |
| Interests                | Profile: interests                    |
| Bio                      | Profile: bio                          |
| LinkedIn URL             | Profile: linked_in_url                |
| Portfolio URL            | Profile: portfolio_url                |
| Programming 1–5          | Assessment: programming                |
| Data Analysis 1–5        | Assessment: dataAnalysis              |
| Machine Learning 1–5     | Assessment: machineLearning           |
| Web Development 1–5      | Assessment: webDevelopment             |
| Database 1–5             | Assessment: database                   |
| Communication 1–5         | Assessment: communication              |
| Leadership 1–5           | Assessment: leadership                 |
| Problem Solving 1–5      | Assessment: problemSolving            |
| Teamwork 1–5             | Assessment: teamwork                  |
| Creativity 1–5            | Assessment: creativity                |
| Preferred work style     | Assessment: workStyle                  |
| Industry interest        | Assessment: industry                   |
| Work environment         | Assessment: workEnvironment            |
| Years of experience      | Assessment: yearsExperience            |

Use this mapping when you import form responses (e.g. from Google Sheets) into your backend or when building an import script/API.
