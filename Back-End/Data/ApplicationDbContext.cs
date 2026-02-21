using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSignInDetail> UserSignInDetails => Set<UserSignInDetail>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<CareerRecommendation> CareerRecommendations => Set<CareerRecommendation>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();
    public DbSet<MarketTrend> MarketTrends => Set<MarketTrend>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });
        modelBuilder.Entity<UserSignInDetail>(e =>
        {
            e.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(s => s.UserId);
            e.HasIndex(s => s.SignedInAt);
        });
        modelBuilder.Entity<UserProfile>(e =>
        {
            e.HasIndex(p => p.UserId).IsUnique();
            e.HasOne(p => p.User).WithOne(u => u.Profile).HasForeignKey<UserProfile>(p => p.UserId);
        });
    }
}
