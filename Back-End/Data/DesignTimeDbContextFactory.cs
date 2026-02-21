using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace BackEnd.Data;

/// <summary>
/// Used by EF Core tools (e.g. dotnet ef database update) so migrations
/// use the same connection string and create/update the database with the given name.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("Default")
            ?? config.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=CareerPathDb;Trusted_Connection=True;MultipleActiveResultSets=true";
        var databaseName = config["DatabaseName"];

        if (!string.IsNullOrWhiteSpace(databaseName))
        {
            connectionString = Regex.Replace(connectionString, @"Initial Catalog=[^;]*", "Initial Catalog=" + databaseName, RegexOptions.IgnoreCase);
            connectionString = Regex.Replace(connectionString, @"Database=[^;]*", "Database=" + databaseName, RegexOptions.IgnoreCase);
        }

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
