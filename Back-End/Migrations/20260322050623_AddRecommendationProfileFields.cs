using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CertificateCourseTitles",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstJobTitle",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasAdditionalCertifications",
                table: "UserProfiles",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsWorking",
                table: "UserProfiles",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MastersField",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UgCgpaOrPercentage",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UgCourse",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UgSpecialization",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CertificateCourseTitles",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "FirstJobTitle",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "HasAdditionalCertifications",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "IsWorking",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "MastersField",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "UgCgpaOrPercentage",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "UgCourse",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "UgSpecialization",
                table: "UserProfiles");
        }
    }
}
