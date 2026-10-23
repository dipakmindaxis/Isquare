using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class intialsetupvishal1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EnquiryPriorities",
                columns: table => new
                {
                    EnquiryPriorityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryPriorityCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EnquiryPriorityName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EnquiryPriorityDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnquiryPrioritySortOrder = table.Column<int>(type: "int", nullable: true),
                    EnquiryPriorityIsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryPriorityIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryPriorityCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnquiryPriorityUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnquiryPriorities", x => x.EnquiryPriorityId);
                });

            migrationBuilder.CreateTable(
                name: "EnquirySources",
                columns: table => new
                {
                    EnquirySourceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquirySourceCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EnquirySourceName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EnquirySourceDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnquirySourceSortOrder = table.Column<int>(type: "int", nullable: true),
                    EnquirySourceIsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnquirySourceCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnquirySourceUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnquirySources", x => x.EnquirySourceId);
                });

            migrationBuilder.CreateTable(
                name: "EnquiryStages",
                columns: table => new
                {
                    EnquiryStageId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryStageCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EnquiryStageName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EnquiryStageDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnquiryStageSortOrder = table.Column<int>(type: "int", nullable: true),
                    EnquiryStageIsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryStageIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryStageCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnquiryStageUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnquiryStages", x => x.EnquiryStageId);
                });

            migrationBuilder.CreateTable(
                name: "EnquiryStatuses",
                columns: table => new
                {
                    EnquiryStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryStatusCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EnquiryStatusName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EnquiryStatusDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnquiryStatusSortOrder = table.Column<int>(type: "int", nullable: true),
                    EnquiryStatusIsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryStatusIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryStatusCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnquiryStatusUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnquiryStatuses", x => x.EnquiryStatusId);
                });

            migrationBuilder.CreateTable(
                name: "EnquiryTypes",
                columns: table => new
                {
                    EnquiryTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryTypeCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EnquiryTypeName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EnquiryTypeDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnquiryTypeSortOrder = table.Column<int>(type: "int", nullable: true),
                    EnquiryTypeIsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnquiryTypeCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnquiryTypeUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnquiryTypes", x => x.EnquiryTypeId);
                });

            migrationBuilder.CreateTable(
                name: "LostReasons",
                columns: table => new
                {
                    LostReasonId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LostReasonCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    LostReasonName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    LostReasonDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LostReasonSortOrder = table.Column<int>(type: "int", nullable: true),
                    LostReasonIsActive = table.Column<bool>(type: "bit", nullable: false),
                    LostReasonIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LostReasonCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LostReasonUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LostReasons", x => x.LostReasonId);
                });

            migrationBuilder.CreateTable(
                name: "ProductCategories",
                columns: table => new
                {
                    ProductCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductCategoryCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ProductCategoryName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ProductCategoryDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProductCategorySortOrder = table.Column<int>(type: "int", nullable: true),
                    ProductCategoryIsActive = table.Column<bool>(type: "bit", nullable: false),
                    ProductCategoryIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ProductCategoryCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductCategoryCreatedBy = table.Column<int>(type: "int", nullable: false),
                    ProductCategoryUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductCategoryUpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCategories", x => x.ProductCategoryId);
                });

            migrationBuilder.CreateTable(
                name: "ProductServices",
                columns: table => new
                {
                    ProductServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductServiceCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ProductServiceName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ProductServiceDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProductServiceSortOrder = table.Column<int>(type: "int", nullable: true),
                    ProductServiceIsActive = table.Column<bool>(type: "bit", nullable: false),
                    ProductServiceIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ProductServiceCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductServiceCreatedBy = table.Column<int>(type: "int", nullable: false),
                    ProductServiceUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductServiceUpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductServices", x => x.ProductServiceId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Director",
                columns: table => new
                {
                    DirectorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DirectorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DirectorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Director", x => x.DirectorId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesCoordinator",
                columns: table => new
                {
                    SalesCoordinatorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesCoordinatorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SalesCoordinatorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesCoordinator", x => x.SalesCoordinatorId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnquiryPriorities_EnquiryPriorityCode",
                table: "EnquiryPriorities",
                column: "EnquiryPriorityCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnquirySources_EnquirySourceCode",
                table: "EnquirySources",
                column: "EnquirySourceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnquiryStages_EnquiryStageCode",
                table: "EnquiryStages",
                column: "EnquiryStageCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnquiryStatuses_EnquiryStatusCode",
                table: "EnquiryStatuses",
                column: "EnquiryStatusCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnquiryTypes_EnquiryTypeCode",
                table: "EnquiryTypes",
                column: "EnquiryTypeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LostReasons_LostReasonCode",
                table: "LostReasons",
                column: "LostReasonCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategories_ProductCategoryCode",
                table: "ProductCategories",
                column: "ProductCategoryCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductServices_ProductServiceCode",
                table: "ProductServices",
                column: "ProductServiceCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnquiryPriorities");

            migrationBuilder.DropTable(
                name: "EnquirySources");

            migrationBuilder.DropTable(
                name: "EnquiryStages");

            migrationBuilder.DropTable(
                name: "EnquiryStatuses");

            migrationBuilder.DropTable(
                name: "EnquiryTypes");

            migrationBuilder.DropTable(
                name: "LostReasons");

            migrationBuilder.DropTable(
                name: "ProductCategories");

            migrationBuilder.DropTable(
                name: "ProductServices");

            migrationBuilder.DropTable(
                name: "tbl_Director");

            migrationBuilder.DropTable(
                name: "tbl_SalesCoordinator");
        }
    }
}
