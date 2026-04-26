# AI/ML Module Recommendation — Career Path Recommendation System

---

## Recommended modules only

| # | Module / technology | Use for |
|---|----------------------|--------|
| 1 | **OpenAI API** (GPT-4 / GPT-4o) | Generate career recommendations from profile + assessment via structured prompt. |
| 2 | **Azure OpenAI** | Same as above; use if you prefer Microsoft stack or enterprise compliance. |
| 3 | **Ollama** (local LLM, e.g. Llama, Mistral) | Same as above; run on your server, no API cost. |
| 4 | **Few-shot examples** (in prompt) | Use form data to improve recommendations: add 3–5 (profile → career) examples in the LLM prompt. |
| 5 | **Scikit-learn / XGBoost** (Python) or **ML.NET** (.NET) | Train a **ranker**: (user features, career) → score; re-rank LLM or fixed-list output. Use form data as labels. |
| 6 | **Sentence transformers** (e.g. `all-MiniLM-L6-v2`) | Optional: embed profile + career descriptions; retrieve top-k careers by similarity; optionally fine-tune on form data. |

**Minimal set to start:** **1 or 2 or 3** (one LLM) + **4** (few-shot from form). Add **5** when you have enough form data to train a ranker; **6** if you want embedding-based retrieval.

---

| Goal | Recommended approach |
|------|----------------------|
| **Get personalized recommendations live (no training yet)** | Use an **LLM API** (OpenAI, Azure OpenAI, or Ollama) with a **structured prompt**. Send profile + assessment as context; get back a list of careers. No training; works with zero form data. |
| **Use form data to improve the system** | (1) **Few-shot in prompt** — add 3–5 example (profile summary → career) from form responses into the LLM prompt. (2) **Train a ranker** — use form data (user features + target career) to train a small model that scores (user, career) pairs; use it to re-rank LLM or fixed-list suggestions. |
| **Fully train a model on your data** | **Option A:** Embedding + retrieval (embed user profile and career descriptions; retrieve top-k by similarity; optionally fine-tune on form data). **Option B:** Classical ML (multi-class or multi-label) if you map free-text “target career” from the form to a fixed list of career categories. |

**Practical path:** Start with **LLM API + prompt** in your .NET backend. Once you have form responses, add **few-shot examples** or a **ranker** trained on (profile/assessment → target career) so the AI module is “trained” by your data.

---

## 1. Recommended: LLM API (no training to start)

**What it is:** Your backend calls an LLM (e.g. OpenAI GPT-4, Azure OpenAI, or a local model via Ollama) with a **structured prompt**. Input = user profile + assessment summary; output = JSON list of 5–10 career recommendations (title + short description).

**Why recommend:**
- No training data required to go live.
- Matches your data: profile (skills, interests, education, etc.) + assessment (skills 1–5, work preferences) are natural as text context.
- Easy to plug into existing `RecommendationService.GenerateAsync(userId)`: load profile + assessment, build prompt, call API, parse JSON, save to `CareerRecommendation` table.
- Later you can use form data as **few-shot examples** in the prompt or to **train a ranker** that re-ranks LLM output.

**Stack:**
- **Backend:** .NET 8; use `HttpClient` or a small client (e.g. `OpenAI` .NET SDK, or generic REST to OpenAI/Azure/Ollama).
- **No Python required** for inference; only if you later train a ranker or embeddings (see below).

**Prompt shape (conceptual):**
```
You are a career advisor. Given the following profile and assessment, suggest 5–7 careers that fit.

Profile: Education: {education}, Current role: {role}, Skills: {skills}, Interests: {interests}, Location: {location}.
Assessment: [list skill levels 1–5 and work preferences].

Respond with a JSON array of objects: [{ "title": "...", "description": "...", "category": "..." }, ...].
```

**How form data trains/improves it:**
- **Few-shot:** Add 2–5 examples from your form: "Profile: … Assessment: … → Interested in: Software Engineer" so the LLM mimics your users’ choices.
- **Structured output:** Keep asking for the same JSON shape so your backend can always parse and save to DB.

---

## 2. Using form data to “train” the system (no separate ML training)

**Form data you have:** From the Google Form, each row = (profile + assessment features, **target career** from Q26).

### 2.1 Few-shot learning (recommended first step)

- Export form responses (CSV/Sheets).
- For each row, build a short text: “Profile: … Preferences: … → Recommended career: [target career].”
- Put 3–5 of these in the LLM prompt as examples (few-shot). The model will bias toward similar recommendations for similar inputs.
- **No model training;** only prompt design. Easy to do in .NET when building the prompt.

### 2.2 Train a ranker (next step when you have enough data)

- **Idea:** You have (user features, target career). Train a model that scores “how relevant is career C for user U?” (e.g. binary: positive = user’s stated career, negatives = random other careers).
- **At inference:** Get candidate careers (from LLM or a fixed list), score each with the ranker, return top 5–10.
- **Where to train:** Python (scikit-learn, XGBoost, or a small neural net) or .NET (ML.NET). You’d export user features (from profile + assessment) and career id/category; label = 1 for (user, their stated career), 0 for (user, other careers). Need a few hundred rows minimum.
- **Integration:** Either call a small HTTP API (Python service) from .NET, or export the trained model (e.g. ONNX, or ML.NET format) and run inside .NET.

---

## 3. Embedding + retrieval (optional, for “train on form data”)

**Idea:**  
- Have a fixed set of careers (title + short description).  
- Embed each career (e.g. with a sentence embedding model).  
- Embed the user’s “profile + assessment” text (same model).  
- Retrieve top-k careers by cosine similarity.  
- **Training:** Use form data to fine-tune the embedding model so (user_text, target_career) pairs are closer, or train a small re-ranker on top of embeddings.

**Pros:** No LLM API cost at inference; runs on your server.  
**Cons:** Need to host an embedding model (or call an API); more engineering (Python service or ONNX in .NET).  

**Recommendation:** Consider this after you have LLM-based recommendations working and want to reduce cost or add a “similar profile → same career” behavior trained on your form.

---

## 4. Classical ML (classification) on form data

**Idea:** Map “target career” (free text from form Q26) to a **fixed list of career categories** (e.g. 20–50 labels). Train a classifier: input = (education, skills 1–5, work preferences, interests, etc.); output = career category (or multi-label). At inference, you output the top-k categories and map them to career titles/descriptions.

**Pros:** No LLM; runs fully in .NET (e.g. ML.NET) or Python; interpretable.  
**Cons:** You must define and maintain the category list and map free-text answers to it; less flexible than LLM for new careers.

**When to use:** If you want to avoid any external API and have enough labeled form responses (e.g. 500+ with a clean category mapping).

---

## 5. Suggested implementation order

| Step | Action |
|------|--------|
| 1 | Add **LLM API** to `RecommendationService.GenerateAsync`: build prompt from `UserProfile` + `Assessment`, call OpenAI/Azure/Ollama, parse JSON, save to `CareerRecommendation`. |
| 2 | Add **configuration** (API key, base URL, model name) via appsettings; support at least one provider (e.g. OpenAI or Azure OpenAI). |
| 3 | When you have **form responses**, add **few-shot** examples to the prompt (2–5 (profile → career) examples from CSV). |
| 4 | (Optional) When you have **enough data** (e.g. 300+ rows), train a **ranker** (user, career) → score; call it from the backend to re-rank LLM or fixed-list output. |
| 5 | (Optional) Later: **embedding + retrieval** or **classical ML** if you want to reduce API cost or run everything on-prem.

---

## 6. How this uses your form data to “train” the module

- **Without training a separate model:** Form data is used as **few-shot examples** in the LLM prompt so the system behaves more like “users like you chose these careers.”
- **With a trained component:** Form data is used to train a **ranker** (or classifier) that scores or selects careers for a given user. The “AI/ML module” is then: **LLM (or fixed list) + ranker**, where the ranker is trained on your form’s (inputs → target career).

Together, this gives you a clear recommendation: **use an LLM API for the main recommendations**, and **use the form to improve the prompt (few-shot) and/or train a ranker** so the AI module is effectively “trained” on your system’s data.
