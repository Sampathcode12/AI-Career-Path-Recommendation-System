# How to Start and Train the AI — Step-by-Step Guide

This guide answers: **How do I start?** **Where do I get data?** **How do I train the AI?** for the AI Career Path Recommendation System.

---

## Quick overview

| Question | Short answer |
|----------|--------------|
| **How to start?** | Start with an **LLM API** (no training). Add few-shot examples when you have data. Train a ranker when you have 300+ rows. |
| **Where to get data?** | (1) In-app (Profile + Assessment), (2) Google Form, (3) Public datasets (optional). |
| **How to train?** | Phase 1: No training (LLM + prompt). Phase 2: Few-shot in prompt. Phase 3: Train a ranker on (user, career) pairs. |

---

## Phase 1: Start without training (Week 1–2)

**Goal:** Get recommendations working with zero training data.

### Step 1.1: Connect an LLM API

1. Choose one provider:
   - **OpenAI** (GPT-4) — easiest, paid API
   - **Azure OpenAI** — same models, enterprise
   - **Ollama** (local) — free, run on your machine

2. In your backend `RecommendationService.GenerateAsync`:
   - Load `UserProfile` + `Assessment` for the user
   - Build a prompt (see `docs/AI-ML-MODULE-RECOMMENDATION.md`)
   - Call the LLM API
   - Parse JSON response → save to `CareerRecommendation` table

3. Add API key to `appsettings.json` (never commit keys to git).

**Result:** Users get AI recommendations immediately. No dataset needed.

---

## Phase 2: Find and collect data for training

**Goal:** Build a dataset so you can improve the AI.

### Option A: Use your app (already built)

- **Profile** and **Assessment** are saved when users use the app.
- Export from your database: `UserProfile`, `Assessment`, and optionally which careers users saved or clicked.
- **Target/label:** Add a field like “career of interest” or use “saved recommendations” as positive signals.

### Option B: Google Form (recommended for bulk data)

1. Create a form using `docs/GOOGLE-FORM-PROMPT.md` (Common Data form).
2. Include:
   - Profile: education, role, skills (1–5), interests, work preferences
   - Assessment: skill levels, work style, industry, environment
   - **Target:** “Which career are you most interested in?” (Q26)
3. Share the form (students, career centers, LinkedIn, etc.).
4. Export responses: Google Sheets → File → Download → CSV.

**Data shape per row:**
```
education, role, skills_1..skills_9, work_style, industry, interests, ..., target_career
```

### Option C: Public datasets (optional)

| Source | What it has | Use for |
|--------|-------------|---------|
| **Kaggle** | Search “career recommendation”, “job skills”, “occupation dataset” | Extra training data or career taxonomy |
| **O*NET** (onetonline.org) | Skills, tasks, education per occupation | Career descriptions, skill–career mapping |
| **Bureau of Labor Statistics** | Job titles, growth, salary | Enrich career metadata |

**Note:** Public data often has different fields. You may need to map columns to your schema (education, skills, target career).

### How much data do I need?

| Approach | Minimum data |
|----------|--------------|
| **Few-shot** (examples in prompt) | 5–20 good examples |
| **Train a ranker** | 300+ rows (better: 500+) |
| **Classical ML classifier** | 500+ rows with clean career labels |

---

## Phase 3: Use data to improve the AI (no separate “training” yet)

**Goal:** Make the LLM behave more like your users without training a model.

### Step 3.1: Few-shot learning

1. Export 5–20 form responses (or from your DB).
2. For each row, build a short text:
   ```
   Profile: Education: Bachelor's, Role: Student, Skills: Programming=4, Data=3, ...
   Assessment: Work style: Teamwork, Industry: Technology, ...
   → Recommended career: Software Engineer
   ```
3. Add 3–5 of these to your LLM prompt as examples.
4. The model will bias toward similar recommendations for similar inputs.

**Where to add:** In `RecommendationService` when building the prompt. Load examples from a config file or database.

**Result:** Better recommendations with no model training. See `docs/AI-ML-MODULE-RECOMMENDATION.md` §2.1.

---

## Phase 4: Train a model (when you have enough data)

**Goal:** Train a ranker that scores (user, career) pairs using your data.

### Step 4.1: Prepare the dataset

1. **Export** from Google Sheets (CSV) or your database.
2. **Map columns** to features:
   - **Input (X):** education, role, skill levels 1–9, work style, industry, interests, etc.
   - **Label (y):** target career (from “career interested in” question).
3. **Create training pairs:**
   - Positive: (user_features, their_stated_career) → label 1
   - Negative: (user_features, random_other_career) → label 0
4. Save as CSV or Parquet for training.

### Step 4.2: Train the ranker

**Option 1: Python (scikit-learn / XGBoost)**

```python
# Pseudocode
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier  # or XGBoost

df = pd.read_csv("training_data.csv")
X = df[["education_encoded", "skill_1", "skill_2", ..., "work_style_encoded"]]
y = df["label"]  # 1 = user's career, 0 = other career

model = GradientBoostingClassifier()
model.fit(X, y)
# Export to ONNX or pickle for use in .NET
```

**Option 2: .NET (ML.NET)**

- Use ML.NET to train a binary classifier.
- Input: same features. Label: 1 if (user, career) matches form response, 0 otherwise.
- Save model; load in `RecommendationService` to score candidates.

### Step 4.3: Use the ranker in your app

1. Get candidate careers (from LLM or a fixed list).
2. For each candidate, build (user_features, career_id) and score with the ranker.
3. Sort by score; return top 5–10 to the user.

**Integration:** Call a small Python API from .NET, or use ONNX/ML.NET to run the model inside .NET.

---

## End-to-end flow (summary)

```
START
  │
  ├─► Phase 1: Add LLM API to backend
  │   └─► Recommendations work with zero data
  │
  ├─► Phase 2: Collect data
  │   ├─► In-app: use Profile + Assessment from DB
  │   ├─► Google Form: create form, share, export CSV
  │   └─► Optional: add public datasets (Kaggle, O*NET)
  │
  ├─► Phase 3: Few-shot (5–20 examples)
  │   └─► Add examples to LLM prompt → better recommendations
  │
  └─► Phase 4: Train ranker (300+ rows)
      ├─► Prepare (user, career) pairs with labels
      ├─► Train in Python or ML.NET
      └─► Use ranker to re-rank LLM output
```

---

## Checklist: Your first 4 weeks

| Week | Action |
|------|--------|
| **1** | Add OpenAI/Azure/Ollama to `RecommendationService`. Test with a few users. |
| **2** | Create Google Form (use `docs/GOOGLE-FORM-PROMPT.md`). Share with 20+ people. |
| **3** | Export first 10–20 responses. Add 3–5 as few-shot examples in the prompt. |
| **4** | Keep collecting. When you reach 300+ rows, prepare data and train a ranker. |

---

## Where to find more detail

- **AI/ML approach:** `docs/AI-ML-MODULE-RECOMMENDATION.md`
- **Data collection:** `docs/DATA-COLLECTION-GUIDE.md`
- **Google Form structure:** `docs/GOOGLE-FORM-PROMPT.md`
