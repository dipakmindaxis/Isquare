using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddProductImageToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductImage",
                table: "tbl_Product",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductImage",
                table: "tbl_Product");
        }
    }
}
