# Common Industry Details — Data Collection Guide

Each industry in the system has a standard set of **common details** that are collected and displayed consistently across all industries. Use this guide when adding or updating industry data.

## Common Fields (per industry)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **Description** | Text | Short overview of the industry (2–3 sentences) | "Software, IT, cloud, AI/ML, and digital products. High demand worldwide with strong remote work options." |
| **Demand Growth** | String | Employment growth rate | "+22%" |
| **Top Demand Skills** | List | 5–7 skills most in demand | Cloud (AWS/Azure), Machine Learning, Python |
| **Gap Skills** | List | 3–5 skills with largest supply gap (prioritize for learning) | Cybersecurity, AI/ML Engineering |
| **Supply Level** | String | Overall talent supply: Low, Medium, High | "Medium" |
| **Top Regions** | List | Top hiring regions/countries | USA, UK, EU, India, Germany |
| **Typical Salary Range** | String | Typical salary range for the industry | "$70k – $180k" |
| **Typical Education** | String | Common education requirements | "Bachelor's in Computer Science, IT, or related" |
| **Typical Certifications** | String | Common certifications (comma-separated) | "AWS, Azure, Google Cloud" |

## Where data is stored

- **Backend model:** `IndustrySkillGap` (`Back-End/Models/IndustrySkillGap.cs`)
- **Seeder:** `DataSeeder.cs` — add or update entries in the `skillGaps` array
- **API:** `GET /api/skill-gap` — returns all industries with common details
- **Frontend:** Skill Gap page (`Front End/src/pages/SkillGap.jsx`) — displays all common details

## Industries included (22 major sectors worldwide)

Technology, Healthcare, Finance, Education, Manufacturing, Energy & Utilities, Retail, Construction, Hospitality & Tourism, Transportation & Logistics, Real Estate, Media & Entertainment, Legal, Government & Public Sector, Agriculture & Food, Mining & Natural Resources, Professional Services, Creative & Design, Non-profit & NGO, Telecommunications, Aerospace & Defense.

Based on GICS (Global Industry Classification Standard) and common career classifications.

## Adding a new industry

1. Add a new `IndustrySkillGap` entry to `GetAllIndustries()` in `DataSeeder.cs` with all common fields.
2. Ensure `IndustryId` is lowercase (e.g. `"technology"`, `"healthcare"`).
3. Restart the backend — the seeder adds any industry that does not yet exist in the database.

## Updating existing industries

For databases that already have `IndustrySkillGaps` rows, the migration `20260319100000_AddIndustryCommonDetails` adds the new columns. Existing rows will have `null` for the new fields until you:

- **Option A:** Clear the `IndustrySkillGaps` table and restart the app (seeder will repopulate with full data).
- **Option B:** Manually update rows via SQL or an admin tool with the common details.
