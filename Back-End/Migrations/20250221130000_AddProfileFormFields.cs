using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileFormFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // If UserProfiles table doesn't exist (e.g. InitialCreate was skipped), create it with all columns.
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserProfiles')
                BEGIN
                    CREATE TABLE [UserProfiles] (
                        [Id] int NOT NULL IDENTITY(1,1),
                        [UserId] int NOT NULL,
                        [Skills] nvarchar(max) NULL,
                        [Interests] nvarchar(max) NULL,
                        [ExperienceLevel] nvarchar(max) NULL,
                        [Education] nvarchar(max) NULL,
                        [PreferredIndustries] nvarchar(max) NULL,
                        [Location] nvarchar(max) NULL,
                        [Bio] nvarchar(max) NULL,
                        [LinkedInUrl] nvarchar(max) NULL,
                        [PortfolioUrl] nvarchar(max) NULL,
                        [UpdatedAt] datetime2 NULL,
                        CONSTRAINT [PK_UserProfiles] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_UserProfiles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE UNIQUE INDEX [IX_UserProfiles_UserId] ON [UserProfiles] ([UserId]);
                END
                ELSE
                BEGIN
                    IF COL_LENGTH('UserProfiles', 'Location') IS NULL
                        ALTER TABLE [UserProfiles] ADD [Location] nvarchar(max) NULL;
                    IF COL_LENGTH('UserProfiles', 'Bio') IS NULL
                        ALTER TABLE [UserProfiles] ADD [Bio] nvarchar(max) NULL;
                    IF COL_LENGTH('UserProfiles', 'LinkedInUrl') IS NULL
                        ALTER TABLE [UserProfiles] ADD [LinkedInUrl] nvarchar(max) NULL;
                    IF COL_LENGTH('UserProfiles', 'PortfolioUrl') IS NULL
                        ALTER TABLE [UserProfiles] ADD [PortfolioUrl] nvarchar(max) NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.tables WHERE name = 'UserProfiles')
                BEGIN
                    IF COL_LENGTH('UserProfiles', 'Location') IS NOT NULL
                        ALTER TABLE [UserProfiles] DROP COLUMN [Location];
                    IF COL_LENGTH('UserProfiles', 'Bio') IS NOT NULL
                        ALTER TABLE [UserProfiles] DROP COLUMN [Bio];
                    IF COL_LENGTH('UserProfiles', 'LinkedInUrl') IS NOT NULL
                        ALTER TABLE [UserProfiles] DROP COLUMN [LinkedInUrl];
                    IF COL_LENGTH('UserProfiles', 'PortfolioUrl') IS NOT NULL
                        ALTER TABLE [UserProfiles] DROP COLUMN [PortfolioUrl];
                END
            ");
        }
    }
}
