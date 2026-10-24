using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddProductHsnPurchaseRateProfitStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HsnCode",
                table: "tbl_Product",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ProfitPercentage",
                table: "tbl_Product",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchaseRate",
                table: "tbl_Product",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Stock",
                table: "tbl_Product",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HsnCode",
                table: "tbl_Product");

            migrationBuilder.DropColumn(
                name: "ProfitPercentage",
                table: "tbl_Product");

            migrationBuilder.DropColumn(
                name: "PurchaseRate",
                table: "tbl_Product");

            migrationBuilder.DropColumn(
                name: "Stock",
                table: "tbl_Product");
        }
    }
}
