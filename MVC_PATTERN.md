# MVC Pattern in This Project

Yes — the project follows an **MVC-like** structure. Here is how it maps.

---

## Backend (API as MVC)

| MVC part | In this project | Role |
|----------|-----------------|------|
| **Model** | `Back-End/models.py` + `Back-End/services.py` | **models.py**: data (User, UserProfile, Assessment, etc.). **services.py**: business logic (recommendations, profile completion, jobs). |
| **View** | `Back-End/schemas.py` + API response (JSON) | **schemas.py**: shape of API input/output (UserResponse, ProfileResponse, etc.). The “view” of data sent to the client. |
| **Controller** | `Back-End/main.py` (route handlers) | Receives request → calls Model/Services and DB → returns response (using schemas). |

**Flow:** Request → **Controller** (route) → **Model** (services + DB/models) → **View** (schemas/JSON) → Response.

---

## Full stack (Backend + Frontend)

| MVC part | In this project | Role |
|----------|-----------------|------|
| **Model** | Backend: `models.py`, `services.py`; Frontend: state + API client | Data and business rules (backend); frontend state and server data. |
| **View** | `Front End/src/pages/*.jsx`, `Front End/src/components/*.jsx` | UI: Login, SignUp, Home, Dashboard, Recommendation, etc. |
| **Controller** | Backend: `main.py` routes; Frontend: event handlers, `AuthContext`, `api.js` | Backend: handle HTTP, call model, return view. Frontend: handle user actions, call API, update state/view. |

---

## Where to see it in code

- **Controller (backend):** `Back-End/main.py` — e.g. `signup()`, `login()`, `create_profile()`, `generate_recommendations()`.
- **Model (backend):** `Back-End/models.py` (tables), `Back-End/services.py` (logic).
- **View (backend):** `Back-End/schemas.py` (response models), and the JSON returned by each route.
- **View (frontend):** `Front End/src/pages/` and `Front End/src/components/`.
- **Controller (frontend):** `Front End/src/context/AuthContext.jsx`, `Front End/src/services/api.js`, and button/form handlers in pages.

So yes — **we can see the MVC pattern** in both the backend (API as MVC) and the full stack (backend + React frontend).
