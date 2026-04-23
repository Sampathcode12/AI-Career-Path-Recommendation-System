using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using BackEnd.Data;
using BackEnd.Services;
using BackEnd.Services.JobListingApiSeed;

var builder = WebApplication.CreateBuilder(args);

// Optional overrides (gitignored): put AI:Gemini:ApiKey etc. in appsettings.Development.local.json
if (builder.Environment.IsDevelopment())
    builder.Configuration.AddJsonFile("appsettings.Development.local.json", optional: true, reloadOnChange: true);

// JSON: snake_case for frontend compatibility (e.g. access_token)
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
});

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
});

// DbContext: connection string "Default" (or "DefaultConnection").
// Railway/Heroku: DATABASE_URL env var (postgres://user:pass@host:port/db) takes priority.
// Local dev: SQL Server Express via appsettings.json ConnectionStrings:Default.
static bool IsPostgresCs(string cs) =>
    cs.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
    cs.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
    cs.Contains("Host=", StringComparison.OrdinalIgnoreCase);

var connectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=CareerPathDb;Trusted_Connection=True;MultipleActiveResultSets=true";

var databaseName = builder.Configuration["DatabaseName"];
if (!string.IsNullOrWhiteSpace(databaseName))
{
    connectionString = System.Text.RegularExpressions.Regex.Replace(connectionString, @"Initial Catalog=[^;]*", "Initial Catalog=" + databaseName, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    connectionString = System.Text.RegularExpressions.Regex.Replace(connectionString, @"Database=[^;]*", "Database=" + databaseName, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
}

var usePostgres = IsPostgresCs(connectionString);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(connectionString, npgsql =>
            npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(3), null));
    else
        options.UseSqlServer(connectionString, sql =>
            sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(3), null));
});

// JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-256-bit-secret-key-for-signing-tokens!!";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

// Services (MVC: business logic in services)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IMarketTrendsService, MarketTrendsService>();
builder.Services.AddScoped<ISkillGapService, SkillGapService>();

builder.Services.Configure<MlSettings>(builder.Configuration.GetSection("ML"));
builder.Services.AddHttpClient();
builder.Services.AddHttpClient(nameof(ExternalJobListingSeedService), client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("CareerPathRecommendation/1.0 (https://github.com/)");
});
builder.Services.AddScoped<IExternalJobListingSeedService, ExternalJobListingSeedService>();
builder.Services.AddScoped<IMlInterestPredictService, MlInterestPredictService>();
builder.Services.AddHostedService<FlaskMlAutoStartHostedService>();

// CORS — localhost for dev; in Railway set CORS_ORIGIN=https://your-app.vercel.app
// or Cors__AllowedOrigins__0=https://your-app.vercel.app
var localDevOrigins = new[]
{
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", "http://localhost:8000"
};
var extraCorsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?.Where(static s => !string.IsNullOrWhiteSpace(s))
    .Select(static s => s.Trim())
    .ToArray() ?? Array.Empty<string>();
// CORS_ORIGIN env var: simple single-origin override (e.g. set in Railway dashboard)
var corsOriginEnv = Environment.GetEnvironmentVariable("CORS_ORIGIN");
var singleEnvOrigins = string.IsNullOrWhiteSpace(corsOriginEnv)
    ? Array.Empty<string>()
    : corsOriginEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var corsOrigins = localDevOrigins
    .Concat(extraCorsOrigins)
    .Concat(singleEnvOrigins)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// No auth — use to verify SQL / LocalDB from the browser: GET /api/health/db
app.MapGet("/api/health/db", async (ApplicationDbContext db, CancellationToken ct) =>
{
    try
    {
        var can = await db.Database.CanConnectAsync(ct);
        var name = db.Database.GetDbConnection().Database;
        return Results.Ok(new { ok = can, database = name, provider = db.Database.ProviderName });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new { ok = false, error = ex.Message, error_type = ex.GetType().Name },
            statusCode: 503);
    }
}).AllowAnonymous();

// Connection + migration state (pending vs applied). No auth.
app.MapGet("/api/health/db/diagnostics", async (ApplicationDbContext db, CancellationToken ct) =>
{
    try
    {
        var can = await db.Database.CanConnectAsync(ct);
        if (!can)
        {
            return Results.Json(
                new
                {
                    ok = false,
                    stage = "connect",
                    hint =
                        "Cannot open SQL connection — wrong Server= in ConnectionStrings:Default, firewall, or LocalDB stopped. Start the API in Development (auto-starts LocalDB) or run: sqllocaldb start mssqllocaldb",
                },
                statusCode: 503);
        }

        IEnumerable<string> pending;
        IEnumerable<string> applied;
        try
        {
            pending = await db.Database.GetPendingMigrationsAsync(ct);
            applied = await db.Database.GetAppliedMigrationsAsync(ct);
        }
        catch (Exception ex)
        {
            return Results.Json(
                new
                {
                    ok = false,
                    stage = "migrations_metadata",
                    error = ex.Message,
                    error_type = ex.GetType().Name,
                    hint =
                        "Server accepted a connection but EF could not read __EFMigrationsHistory — wrong database, manual schema changes, or corrupted DB.",
                },
                statusCode: 503);
        }

        var pendingArr = pending.ToArray();
        var appliedList = applied.ToList();
        return Results.Ok(new
        {
            ok = true,
            can_connect = true,
            database = db.Database.GetDbConnection().Database,
            pending_migrations = pendingArr,
            pending_count = pendingArr.Length,
            applied_migrations_count = appliedList.Count,
            last_applied_migration = appliedList.Count > 0 ? appliedList[^1] : null,
            migrations_up_to_date = pendingArr.Length == 0,
            hint = pendingArr.Length > 0
                ? "Pending migrations exist — the API normally applies them at startup (MigrateAsync). If this stays pending, check startup logs for exceptions or run: dotnet ef database update --project Back-End"
                : "No pending migrations; schema matches the current EF model.",
        });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new
            {
                ok = false,
                stage = "connect",
                error = ex.Message,
                error_type = ex.GetType().Name,
            },
            statusCode: 503);
    }
}).AllowAnonymous();

// Apply migrations / ensure schema exists
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var db = sp.GetRequiredService<ApplicationDbContext>();
    var env = sp.GetRequiredService<IHostEnvironment>();
    var config = sp.GetRequiredService<IConfiguration>();
    var http = sp.GetRequiredService<IHttpClientFactory>();
    var jobApi = sp.GetRequiredService<IExternalJobListingSeedService>();
    var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Database");
    var seedLog = sp.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");
    if (usePostgres)
    {
        // PostgreSQL (Railway): EnsureCreated creates schema from model without SQL Server migrations
        await db.Database.EnsureCreatedAsync();
    }
    else
    {
        // SQL Server (local dev): apply EF migrations
        BackEnd.LocalDbWindowsBootstrap.TryStartIfLocalDb(config, env, log);
        await Task.Delay(750);
        await db.Database.MigrateAsync();
    }
    await DataSeeder.SeedAsync(db, env, config, http, jobApi, seedLog);
}

// Listen on Railway's PORT env var (defaults to 8080 in containers, 8000 locally)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    app.Run($"http://+:{port}");
else
    app.Run();
