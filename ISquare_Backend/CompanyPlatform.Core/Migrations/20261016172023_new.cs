using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class @new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE [tbl_Company] ALTER COLUMN [CompanyCode] nvarchar(50) NOT NULL;");

            migrationBuilder.AddColumn<string>(
                name: "SalesCoordinatorName",
                table: "tbl_Company",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalesCoordinatorName",
                table: "tbl_Company");

            migrationBuilder.Sql("ALTER TABLE [tbl_Company] ALTER COLUMN [CompanyCode] nvarchar(max) NOT NULL;");
        }
    }
}
