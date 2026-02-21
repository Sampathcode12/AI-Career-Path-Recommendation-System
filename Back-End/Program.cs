using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BackEnd.Data;
using BackEnd.Services;

var builder = WebApplication.CreateBuilder(args);

// JSON: snake_case for frontend compatibility (e.g. access_token)
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
});

builder.Services.AddControllers();

// DbContext: connection string "Default" (or "DefaultConnection"). On run, DB is created/updated via migrations.
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=CareerPathDb;Trusted_Connection=True;MultipleActiveResultSets=true";
var databaseName = builder.Configuration["DatabaseName"];
if (!string.IsNullOrWhiteSpace(databaseName))
{
    connectionString = System.Text.RegularExpressions.Regex.Replace(connectionString, @"Initial Catalog=[^;]*", "Initial Catalog=" + databaseName, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    connectionString = System.Text.RegularExpressions.Regex.Replace(connectionString, @"Database=[^;]*", "Database=" + databaseName, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
}
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

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
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IMarketTrendsService, MarketTrendsService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply pending migrations on startup (updates DB to match code)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();
