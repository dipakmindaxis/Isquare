using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class intialsetupf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BDEUserId",
                table: "tbl_SalesCoordinator",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DirectorEmployeeId",
                table: "bde_user",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    CurrencyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrencyCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CurrencyName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CurrencyDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CurrencySortOrder = table.Column<int>(type: "int", nullable: true),
                    CurrencyIsActive = table.Column<bool>(type: "bit", nullable: false),
                    CurrencyIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CurrencyCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrencyUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.CurrencyId);
                });

            migrationBuilder.CreateTable(
                name: "PlaceOfSupplies",
                columns: table => new
                {
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlaceOfSupplyCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PlaceOfSupplyName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PlaceOfSupplyDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PlaceOfSupplySortOrder = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyIsActive = table.Column<bool>(type: "bit", nullable: false),
                    PlaceOfSupplyIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PlaceOfSupplyCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlaceOfSupplyUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaceOfSupplies", x => x.PlaceOfSupplyId);
                });

            migrationBuilder.CreateTable(
                name: "SalesTerritories",
                columns: table => new
                {
                    SalesTerritoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesTerritoryCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SalesTerritoryName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SalesTerritoryDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SalesTerritorySortOrder = table.Column<int>(type: "int", nullable: true),
                    SalesTerritoryIsActive = table.Column<bool>(type: "bit", nullable: false),
                    SalesTerritoryIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    SalesTerritoryCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SalesTerritoryUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesTerritories", x => x.SalesTerritoryId);
                });

            migrationBuilder.CreateTable(
                name: "UnitOfMeasures",
                columns: table => new
                {
                    UnitOfMeasureId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnitOfMeasureCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    UnitOfMeasureName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    UnitOfMeasureDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UnitOfMeasureSortOrder = table.Column<int>(type: "int", nullable: true),
                    UnitOfMeasureIsActive = table.Column<bool>(type: "bit", nullable: false),
                    UnitOfMeasureIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UnitOfMeasureCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UnitOfMeasureUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasures", x => x.UnitOfMeasureId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesCoordinator_BDEUserId",
                table: "tbl_SalesCoordinator",
                column: "BDEUserId");

            migrationBuilder.CreateIndex(
                name: "IX_bde_user_DirectorEmployeeId",
                table: "bde_user",
                column: "DirectorEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_CurrencyCode",
                table: "Currencies",
                column: "CurrencyCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlaceOfSupplies_PlaceOfSupplyCode",
                table: "PlaceOfSupplies",
                column: "PlaceOfSupplyCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_SalesTerritoryCode",
                table: "SalesTerritories",
                column: "SalesTerritoryCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UnitOfMeasures_UnitOfMeasureCode",
                table: "UnitOfMeasures",
                column: "UnitOfMeasureCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_bde_user_tbl_Employees_DirectorEmployeeId",
                table: "bde_user",
                column: "DirectorEmployeeId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_SalesCoordinator_bde_user_BDEUserId",
                table: "tbl_SalesCoordinator",
                column: "BDEUserId",
                principalTable: "bde_user",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bde_user_tbl_Employees_DirectorEmployeeId",
                table: "bde_user");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_SalesCoordinator_bde_user_BDEUserId",
                table: "tbl_SalesCoordinator");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropTable(
                name: "PlaceOfSupplies");

            migrationBuilder.DropTable(
                name: "SalesTerritories");

            migrationBuilder.DropTable(
                name: "UnitOfMeasures");

            migrationBuilder.DropIndex(
                name: "IX_tbl_SalesCoordinator_BDEUserId",
                table: "tbl_SalesCoordinator");

            migrationBuilder.DropIndex(
                name: "IX_bde_user_DirectorEmployeeId",
                table: "bde_user");

            migrationBuilder.DropColumn(
                name: "BDEUserId",
                table: "tbl_SalesCoordinator");

            migrationBuilder.DropColumn(
                name: "DirectorEmployeeId",
                table: "bde_user");
        }
    }
}
