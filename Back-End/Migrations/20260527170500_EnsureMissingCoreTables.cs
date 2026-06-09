using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <summary>
    /// Repairs databases where <c>InitialCreate</c> was never applied (missing Assessments, CareerRecommendations, SavedJobs).
    /// Safe to run when tables already exist — each block is guarded with IF NOT EXISTS.
    /// </summary>
    public partial class EnsureMissingCoreTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[Assessments]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Assessments] (
                        [Id] int NOT NULL IDENTITY,
                        [UserId] int NOT NULL,
                        [AnswersJson] nvarchar(max) NULL,
                        [ResultSummary] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_Assessments] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Assessments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_Assessments_UserId] ON [Assessments] ([UserId]);
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[CareerRecommendations]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [CareerRecommendations] (
                        [Id] int NOT NULL IDENTITY,
                        [UserId] int NOT NULL,
                        [Title] nvarchar(max) NOT NULL,
                        [Description] nvarchar(max) NULL,
                        [Category] nvarchar(max) NULL,
                        [Saved] bit NOT NULL,
                        [SortOrder] int NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [MetadataJson] nvarchar(max) NULL,
                        CONSTRAINT [PK_CareerRecommendations] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_CareerRecommendations_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_CareerRecommendations_UserId] ON [CareerRecommendations] ([UserId]);
                END
                ELSE IF COL_LENGTH(N'CareerRecommendations', N'MetadataJson') IS NULL
                BEGIN
                    ALTER TABLE [CareerRecommendations] ADD [MetadataJson] nvarchar(max) NULL;
                END
                """);

            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[SavedJobs]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [SavedJobs] (
                        [Id] int NOT NULL IDENTITY,
                        [UserId] int NOT NULL,
                        [Title] nvarchar(max) NOT NULL,
                        [Company] nvarchar(max) NULL,
                        [Location] nvarchar(max) NULL,
                        [Url] nvarchar(max) NULL,
                        [Description] nvarchar(max) NULL,
                        [SavedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_SavedJobs] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_SavedJobs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_SavedJobs_UserId] ON [SavedJobs] ([UserId]);
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally no-op: these tables may pre-exist on other environments.
        }
    }
}
