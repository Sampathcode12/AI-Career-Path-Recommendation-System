using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    public partial class AddIndustryCommonDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "IndustrySkillGaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TopRegionsJson",
                table: "IndustrySkillGaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypicalCertifications",
                table: "IndustrySkillGaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypicalEducation",
                table: "IndustrySkillGaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypicalSalaryRange",
                table: "IndustrySkillGaps",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Description", table: "IndustrySkillGaps");
            migrationBuilder.DropColumn(name: "TopRegionsJson", table: "IndustrySkillGaps");
            migrationBuilder.DropColumn(name: "TypicalCertifications", table: "IndustrySkillGaps");
            migrationBuilder.DropColumn(name: "TypicalEducation", table: "IndustrySkillGaps");
            migrationBuilder.DropColumn(name: "TypicalSalaryRange", table: "IndustrySkillGaps");
        }
    }
}
