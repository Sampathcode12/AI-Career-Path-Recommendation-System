# Back-End — .NET 8 C# (MVC Pattern)

REST API for the AI Career Path Recommendation System, built with **ASP.NET Core 8** and **MVC-style** structure.

## MVC Structure

| Layer | Location | Role |
|-------|----------|------|
| **Model** | `Models/`, `Data/ApplicationDbContext.cs` | Entities and EF Core DbContext |
| **View** | `DTOs/` | Request/response shapes (API “view” of data) |
| **Controller** | `Controllers/` | HTTP endpoints; delegate to services |
| **Services** | `Services/` | Business logic (auth, profile, recommendations, jobs, market trends) |

Flow: **Request → Controller → Service → Model/Db → DTO (View) → Response**.

## Requirements

- .NET 8 SDK
- SQL Server or LocalDB (default connection uses LocalDB)

## Connection string setup location

ASP.NET Core uses **appsettings.json** (not web.config). The connection string is read from **Back-End/appsettings.json** or **Back-End/appsettings.Development.json**:

| What | Location | Key |
|------|----------|-----|
| **Connection string** | `Back-End/appsettings.json` | `ConnectionStrings:Default` or `ConnectionStrings:DefaultConnection` |
| **Dev override** | `Back-End/appsettings.Development.json` | same keys |
| **Database name override** (optional) | same files | `DatabaseName` |

**Example** — same idea as XML `<connectionStrings><add name="Default" .../>`:

```json
"ConnectionStrings": {
  "Default": "Data Source=.;Initial Catalog=Biscare;User ID=sa;Password=YourPassword"
}
```

Or with Windows auth:

```json
"ConnectionStrings": {
  "Default": "Data Source=.;Initial Catalog=Biscare;Integrated Security=True"
}
```

- The app looks for **`Default`** first, then **`DefaultConnection`**.
- When you **run the backend**, it applies pending migrations: the database (e.g. **Biscare**) is **created** if it does not exist, and **tables are created or updated** to match your code.
- **Migrations** (`dotnet ef database update`) use the same connection from these files (via `Data/DesignTimeDbContextFactory.cs`).

## Setup

1. **Database name**: Set in `Back-End/appsettings.json` (or `appsettings.Development.json`):
   - **`DatabaseName`**: e.g. `"CareerPathDb"`. When you run migrations, this database is **created** if it does not exist, and all **tables are created or updated** to match your code.

2. **Connection string**: Edit **`ConnectionStrings:DefaultConnection`** in the same files (see **Connection string setup location** above). The `Database=...` value is overridden by `DatabaseName` when `DatabaseName` is set.

3. **JWT secret**: Set `Jwt:Key` in appsettings (or use the default dev key). Use a strong secret in production.

4. **Run the API**:
   ```bash
   cd Back-End
   dotnet run
   ```
   API runs at **http://localhost:8000** (to match the frontend default `VITE_API_BASE_URL`).

5. **Database (migrations)** — create database and update tables:
   - Set **`DatabaseName`** in appsettings (see step 1). Then run:
     ```bash
     cd Back-End
     dotnet ef database update
     ```
     This **creates the database** with the given name if it does not exist, and **creates or updates all tables** to match your models.
   - When you run the API (`dotnet run`), any **pending migrations are applied automatically** on startup.
   - **Sign-in / sign-up**: The **`Users`** table (from the initial migration) stores user details for authentication: `Id`, `Name`, `Email`, `PasswordHash`, `CreatedAt`. Sign up and sign in use this table; JWT is issued after successful login or registration.
   - After changing models (add/remove entities or properties), add a migration and update:
     ```bash
     dotnet ef migrations add YourMigrationName
     dotnet ef database update
     ```
   - Requires [EF Core tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet): `dotnet tool install --global dotnet-ef` (one-time).

## API Endpoints (aligned with frontend `api.js`)

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login-json`, `GET /api/auth/me`
- **Profile**: `GET/POST/PUT /api/profile`
- **Assessment**: `GET/POST /api/assessment`
- **Recommendations**: `POST /api/recommendations/generate`, `GET /api/recommendations`, `PUT /api/recommendations/{id}/save`
- **Jobs**: `POST /api/jobs/search`, `GET /api/jobs/saved`, `POST /api/jobs/save`
- **Market trends**: `GET /api/market-trends`

Responses use **snake_case** JSON (e.g. `access_token`, `user`) for frontend compatibility.

## Frontend

Point the React app at this API (default: `http://localhost:8000/api`). CORS is configured for `localhost:5173`, `3000`, and `8000`.
