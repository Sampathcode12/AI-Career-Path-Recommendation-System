# AI Provider Setup — AI Career Path Recommendation System

The chat and recommendation features use an **OpenAI-compatible** chat API. You can choose from several providers — including **free** options.

---

## Quick start (Gemini — free)

The fastest way to get AI chat working with **zero cost**:

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API Key** → copy it
3. Open `Back-End/appsettings.json`, set:

```json
"AI": {
  "Provider": "Gemini",
  "Gemini": {
    "ApiKey": "YOUR-GEMINI-KEY-HERE"
  }
}
```

4. Restart the backend → chat and recommendations are now AI-powered.

**Alternative (no JSON edit):** set an environment variable before starting the API (PowerShell):

```powershell
$env:GEMINI_API_KEY = "your-key-here"
```

ASP.NET Core also maps `AI__Gemini__ApiKey` from the environment to `AI:Gemini:ApiKey`.

---

## Supported providers

Set **`AI:Provider`** in `appsettings.json` to one of:

| Provider | Free tier? | Default model | How to get key |
|----------|-----------|---------------|----------------|
| **Gemini** | Yes (15 RPM, 1M tokens/day) | `gemini-2.0-flash` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Groq** | Yes (30 RPM) | `llama-3.3-70b-versatile` | [console.groq.com/keys](https://console.groq.com/keys) |
| **OpenAI** | No (paid) | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com) |
| **Local** | Yes (runs on your machine) | `llama3.2` | Install [Ollama](https://ollama.com/) |

---

## Full configuration reference

`Back-End/appsettings.json`:

```json
{
  "AI": {
    "Provider": "Gemini",

    "Gemini": {
      "ApiKey": "",
      "Model": "gemini-2.0-flash",
      "BaseUrl": "https://generativelanguage.googleapis.com/v1beta/openai/"
    },
    "OpenAI": {
      "ApiKey": "",
      "Model": "gpt-4o-mini",
      "BaseUrl": "https://api.openai.com/v1/"
    },
    "Groq": {
      "ApiKey": "",
      "Model": "llama-3.3-70b-versatile",
      "BaseUrl": "https://api.groq.com/openai/v1/"
    },
    "Local": {
      "BaseUrl": "http://localhost:11434/v1/",
      "Model": "llama3.2",
      "ApiKey": ""
    }
  }
}
```

Only the section matching **`AI:Provider`** is used. The others are ignored.

---

## Provider details

### Gemini (recommended — free)

1. Visit [Google AI Studio](https://aistudio.google.com/apikey) and create a key.
2. Set `AI:Provider` to `"Gemini"` and paste the key into `AI:Gemini:ApiKey`.
3. The default model `gemini-2.0-flash` is fast and free. You can also use `gemini-1.5-pro` for higher quality.

### Groq (free, very fast)

1. Sign up at [console.groq.com](https://console.groq.com) and create an API key.
2. Set `AI:Provider` to `"Groq"` and paste the key into `AI:Groq:ApiKey`.
3. Groq runs open-source models (Llama, Mixtral) on custom hardware — responses are extremely fast.

### OpenAI (paid)

1. Get a key from [platform.openai.com](https://platform.openai.com).
2. Set `AI:Provider` to `"OpenAI"` and paste the key into `AI:OpenAI:ApiKey`.

### Local (Ollama / LM Studio — offline)

1. Install [Ollama](https://ollama.com/) and pull a model: `ollama pull llama3.2`
2. Set `AI:Provider` to `"Local"`.
3. No API key needed for localhost. Adjust `BaseUrl` if your server runs on a different port.

---

## Full pipeline: your ML model + open-source LLM (Ollama)

This matches the flow you described: **career paths from user input using your trained model**, then **chat about those recommendations** using a **local open-source** model (no cloud API key).

| Step | What runs | Purpose |
|------|-----------|---------|
| 1 | **Flask** `ml/career_flask_api` (your `vectorizer.pkl` + `career_model.pkl` + `label_encoder.pkl`) | Predicts interest / career cluster from survey text; .NET calls it when generating recommendations. |
| 2 | **Ollama** (e.g. Llama 3.2, Mistral, Phi) | Powers **Generate / Regenerate** career lists and the **recommendation chat** via the same OpenAI-compatible API the backend already uses. |

### 1. Start your ML API

```powershell
cd ml\career_flask_api
pip install -r requirements.txt
# Place the three .pkl files in .\models\ (or set CAREER_MODEL_DIR)
python app.py
```

Default: `http://127.0.0.1:5052`. In `Back-End/appsettings.json`:

```json
"ML": {
  "PythonPredictBaseUrl": "http://127.0.0.1:5052",
  "PythonPredictStyle": "Flask"
}
```

### 2. Install and run Ollama

```powershell
ollama pull llama3.2
ollama serve
```

Leave Ollama running (default API: `http://localhost:11434/v1/`).

### 3. Point the .NET API at Local

In `Back-End/appsettings.json` (or [User Secrets](#keeping-keys-out-of-git) / env vars):

```json
"AI": {
  "Provider": "Local",
  "Local": {
    "BaseUrl": "http://localhost:11434/v1/",
    "Model": "llama3.2",
    "ApiKey": ""
  }
}
```

Use the **exact** model name you pulled (`ollama list`). For [LM Studio](https://lmstudio.ai/), set `BaseUrl` to the local server URL it shows (often port `1234`).

### 4. Use the app

1. Save **Career survey** (interests, skills, etc.) — that text feeds the **ML** model.
2. **Recommendations → Generate / Regenerate** — backend combines ML signal + **Ollama** to build the list.
3. Open the **chat** on the same page — replies use **Ollama** with your saved recommendations as context.

**Note:** Cloud providers (**Gemini**, **Groq**, **OpenAI**) use the same code paths; switch `AI:Provider` anytime. Only **`Local`** gives you fully self-hosted chat + generation without an API key.

---

## Keeping keys out of git

**Never commit API keys.** Use one of these instead:

### User Secrets (recommended)

```bash
cd Back-End
dotnet user-secrets set "AI:Gemini:ApiKey" "your-key-here"
```

### Environment variable

```powershell
# Windows PowerShell
$env:AI__Gemini__ApiKey = "your-key-here"
```

```bash
# Linux / macOS
export AI__Gemini__ApiKey="your-key-here"
```

---

## Behavior without any provider

If no API key is set and **`AI:Provider` is not `Local`** (or Ollama is not running when using `Local`):

- **Generate recommendations:** Uses template careers (Software Developer, Data Analyst, etc.). Your **Flask ML** signal still reorders templates when the Python service is up.
- **Chat:** Uses the rule-based fallback that answers from your saved recommendation data (skills, salary, learning paths).

If **`AI:Provider` is `Local`** and Ollama is running, both generation and chat use the open-source model — no cloud key required.
