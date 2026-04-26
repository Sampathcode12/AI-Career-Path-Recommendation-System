# Comprehensive Skill Assessment — Common Input Format

The assessment uses a **single, universal format** for all users, industries, and roles. System outputs (recommendations, job matches, skill gaps) are driven by this user input.

## Format Version: 1.0

All assessment data is stored in this structure:

```json
{
  "version": "1.0",
  "industry": "technology",
  "preferences": {
    "workStyle": "collaborative",
    "workEnvironment": "hybrid",
    "yearsExperience": "0-2"
  },
  "universalSkills": [
    { "id": "communication", "level": 3 },
    { "id": "problemSolving", "level": 3 },
    { "id": "teamwork", "level": 3 },
    { "id": "leadership", "level": 2 },
    { "id": "creativity", "level": 2 },
    { "id": "adaptability", "level": 3 }
  ],
  "domainSkills": [
    { "id": "cloud", "name": "Cloud (AWS/Azure)", "level": 2 },
    { "id": "machineLearning", "name": "Machine Learning", "level": 2 }
  ]
}
```

## Universal Skills (same for everyone, every industry)

| Field | Description | Level 1–5 |
|-------|-------------|-----------|
| `communication` | Communication Skills | Beginner → Expert |
| `problemSolving` | Problem Solving | Beginner → Expert |
| `teamwork` | Teamwork | Beginner → Expert |
| `leadership` | Leadership | Beginner → Expert |
| `creativity` | Creativity | Beginner → Expert |
| `adaptability` | Adaptability | Beginner → Expert |

## Domain Skills (industry-specific)

Domain skills come from the **Skill Gap API** for the selected industry:
- `topDemandSkills` — skills in high demand
- `gapSkills` — skills with largest supply gap (prioritize learning)

Each skill is rated 1–5 (Beginner → Expert).

## Preferences (common for all)

| Field | Values |
|-------|--------|
| `workStyle` | `collaborative`, `independent`, `mixed` |
| `workEnvironment` | `remote`, `office`, `hybrid` |
| `yearsExperience` | `0-2`, `3-5`, `6-10`, `10+` |

## Industries

| `industry` | Description |
|-----------|-------------|
| `technology` | Technology |
| `healthcare` | Healthcare |
| `finance` | Finance |
| `education` | Education |
| `manufacturing` | Manufacturing |

## Flow

1. **Step 1:** User selects industry → domain skills loaded from API
2. **Step 2:** User rates universal skills (1–5)
3. **Step 3:** User rates domain skills (1–5)
4. **Step 4:** User selects preferences (work style, environment, experience)
5. **Step 5:** Review & Submit → data saved to backend in common format

## Backend Storage

- **AnswersJson:** JSON string of the above structure
- **ResultSummary:** Human-readable text built from the structure for AI/recommendation use

## Usage

- **Recommendations:** Uses `ResultSummary` + profile to generate career suggestions
- **Job Search:** Can filter by industry from `industry`
- **Skill Gap:** Can show domain skills vs. user's self-rated levels
