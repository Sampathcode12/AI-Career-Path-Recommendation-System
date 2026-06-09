using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <summary>
    /// Repairs databases where <see cref="AddSubjectCareerPaths"/> was applied with an empty Up() (table never created).
    /// </summary>
    public partial class EnsureSubjectCareerPathsTableCreated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[SubjectCareerPaths]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [SubjectCareerPaths] (
                        [Id] int NOT NULL IDENTITY,
                        [Specialization] nvarchar(450) NOT NULL,
                        [PathLabel] nvarchar(450) NOT NULL,
                        [SortOrder] int NOT NULL,
                        CONSTRAINT [PK_SubjectCareerPaths] PRIMARY KEY ([Id])
                    );
                    CREATE INDEX [IX_SubjectCareerPaths_Specialization] ON [SubjectCareerPaths] ([Specialization]);
                    CREATE UNIQUE INDEX [IX_SubjectCareerPaths_Specialization_PathLabel]
                        ON [SubjectCareerPaths] ([Specialization], [PathLabel]);
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[SubjectCareerPaths]', N'U') IS NOT NULL
                    DROP TABLE [SubjectCareerPaths];
                """);
        }
    }
}
