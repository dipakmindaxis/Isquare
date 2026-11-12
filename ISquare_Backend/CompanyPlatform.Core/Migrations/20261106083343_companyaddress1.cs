using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class companyaddress1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

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
                name: "MeetingAttachments",
                columns: table => new
                {
                    AttachmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MeetingId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingAttachments", x => x.AttachmentId);
                });

            migrationBuilder.CreateTable(
                name: "NotificationLogs",
                columns: table => new
                {
                    NotificationLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReminderId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NotificationMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NotificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLogs", x => x.NotificationLogId);
                });

            migrationBuilder.CreateTable(
                name: "NotificationQueues",
                columns: table => new
                {
                    QueueId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotificationId = table.Column<int>(type: "int", nullable: false),
                    QueueStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationQueues", x => x.QueueId);
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
                name: "sales_user_manager",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_user_manager", x => x.ID);
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
                name: "tbl_ActivityType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActivityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivitySubType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubjectPurpose = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiscussionNotesMOM = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ActivityType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AddressType",
                columns: table => new
                {
                    AddressTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddressTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AddressType", x => x.AddressTypeId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AssetMaster",
                columns: table => new
                {
                    AssetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssetName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WarrantyExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssetStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AssetMaster", x => x.AssetID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AuditLog",
                columns: table => new
                {
                    AuditLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    RecordId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AuditDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AuditLog", x => x.AuditLogId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CallType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CallTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CallType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ClientType",
                columns: table => new
                {
                    ClientTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ClientType", x => x.ClientTypeId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Companiess",
                columns: table => new
                {
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Companiess", x => x.CompanyId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyProfile",
                columns: table => new
                {
                    CompanyProfileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PINCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IFSCCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BranchName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AccountType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyProfile", x => x.CompanyProfileId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyTimeline",
                columns: table => new
                {
                    TimelineId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ActivityTypeId = table.Column<int>(type: "int", nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyTimeline", x => x.TimelineId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ContactType",
                columns: table => new
                {
                    ContactTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ContactType", x => x.ContactTypeId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Country",
                columns: table => new
                {
                    CountryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ISOCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Country", x => x.CountryId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerArea",
                columns: table => new
                {
                    CustomerAreaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AreaName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerArea", x => x.CustomerAreaId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerCategory",
                columns: table => new
                {
                    CustomerCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerCategory", x => x.CustomerCategoryId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerSource",
                columns: table => new
                {
                    CustomerSourceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SourceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourceCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerSource", x => x.CustomerSourceId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerStatus",
                columns: table => new
                {
                    CustomerStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerStatus", x => x.CustomerStatusId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Department",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Department", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Designation",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DesignationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Designation", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_DocumentType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_DocumentType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmailTemplate",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmailTemplate", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeBankDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    BankAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SwiftCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeBankDetails", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDocument",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDocument", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeePFDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PFDeductionPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsCappedAt15k = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeePFDetails", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeSalarySummary",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    AnnualCTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyTotalDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyNetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmployerPF = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeSalarySummary", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeTaxDeclaration",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaxRegime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeclarationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeTaxDeclaration", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Enquiries",
                columns: table => new
                {
                    EnquiryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EnquiryDate = table.Column<DateTime>(type: "date", nullable: false),
                    EnquiryTypeId = table.Column<int>(type: "int", nullable: false),
                    EnquirySourceId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactMobile = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    ProductCategoryId = table.Column<int>(type: "int", nullable: false),
                    RequirementSubject = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CustomerRequirement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequiredQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UnitOfMeasureId = table.Column<int>(type: "int", nullable: true),
                    DeliveryTimeline = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    TechnicalSpecificationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpectedOrderValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    CustomerBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExpectedClosingDate = table.Column<DateTime>(type: "date", nullable: true),
                    ProbabilityPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    PaymentTermId = table.Column<int>(type: "int", nullable: true),
                    CustomerCreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstimatedTaxPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    EnquiryStatusId = table.Column<int>(type: "int", nullable: false),
                    EnquiryStageId = table.Column<int>(type: "int", nullable: false),
                    EnquiryPriorityId = table.Column<int>(type: "int", nullable: false),
                    SalesManagerId = table.Column<int>(type: "int", nullable: true),
                    SalesManagerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    BDEUserId = table.Column<int>(type: "int", nullable: true),
                    BDEUserName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    SalesTerritoryId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePerson = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "date", nullable: true),
                    ActivityTypeId = table.Column<int>(type: "int", nullable: true),
                    NextAction = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Reminder = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ActivityDiscussionNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LostReasonId = table.Column<int>(type: "int", nullable: true),
                    OutcomeInternalRemarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DocumentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DocumentFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Enquiries", x => x.EnquiryId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_History",
                columns: table => new
                {
                    HistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RefType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivityDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_History", x => x.HistoryId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Industry",
                columns: table => new
                {
                    IndustryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IndustryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IndustryCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Industry", x => x.IndustryId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_InvoiceType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_InvoiceType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LevelMasters",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LevelName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LevelOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LevelMasters", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_MeetingType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MeetingTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_MeetingType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PaymentTerm",
                columns: table => new
                {
                    PaymentTermId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentTermName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentTermCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PaymentTerm", x => x.PaymentTermId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Priority",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriorityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Priority", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Product",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UnitOfMeasurementId = table.Column<int>(type: "int", nullable: true),
                    StandardRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    HsnCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PurchaseRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: true),
                    ProductImage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Product", x => x.ProductId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Quotation",
                columns: table => new
                {
                    QuotationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuotationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    EnquiryId = table.Column<int>(type: "int", nullable: true),
                    QuotationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InstallationCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeliveryPeriod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentTermId = table.Column<int>(type: "int", nullable: true),
                    Warranty = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Quotation", x => x.QuotationId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_QuotationApproval",
                columns: table => new
                {
                    QuotationApprovalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuotationId = table.Column<int>(type: "int", nullable: false),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApprovalReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RequestedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApproverComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_QuotationApproval", x => x.QuotationApprovalId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_QuotationCharge",
                columns: table => new
                {
                    QuotationChargeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuotationId = table.Column<int>(type: "int", nullable: false),
                    ChargeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ChargeType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ChargeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsTaxable = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_QuotationCharge", x => x.QuotationChargeId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_QuotationDefault",
                columns: table => new
                {
                    QuotationDefaultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DefaultDeliveryPeriod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PaymentTermId = table.Column<int>(type: "int", nullable: true),
                    StandardWarranty = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QuotationValidity = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StandardTermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GSTNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CompanyAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CompanyLogoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IFSCCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_QuotationDefault", x => x.QuotationDefaultId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_QuotationItem",
                columns: table => new
                {
                    QuotationItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuotationId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    ParentQuotationItemId = table.Column<int>(type: "int", nullable: true),
                    IsAccessory = table.Column<bool>(type: "bit", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    UnitOfMeasurementId = table.Column<int>(type: "int", nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_QuotationItem", x => x.QuotationItemId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_QuotationRevision",
                columns: table => new
                {
                    QuotationRevisionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuotationId = table.Column<int>(type: "int", nullable: false),
                    RevisionNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RevisionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RevisedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RevisionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QuotationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    EnquiryId = table.Column<int>(type: "int", nullable: true),
                    QuotationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    QuotationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InstallationCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeliveryPeriod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentTermId = table.Column<int>(type: "int", nullable: true),
                    Warranty = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_QuotationRevision", x => x.QuotationRevisionId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReminderStatus",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReminderStatus", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalaryComponent",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComponentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsTaxable = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalaryComponent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesAttachment",
                columns: table => new
                {
                    SalesAttachmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    EnquiryId = table.Column<int>(type: "int", nullable: true),
                    SalesActivityId = table.Column<int>(type: "int", nullable: true),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UploadedBy = table.Column<int>(type: "int", nullable: true),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesAttachment", x => x.SalesAttachmentId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesOrder",
                columns: table => new
                {
                    SalesOrderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesOrderNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QuotationId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedDeliveryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OrderStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesOrder", x => x.SalesOrderId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesOrderItem",
                columns: table => new
                {
                    SalesOrderItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesOrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    ParentSalesOrderItemId = table.Column<int>(type: "int", nullable: true),
                    IsAccessory = table.Column<bool>(type: "bit", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    UnitOfMeasurement = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TaxableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesOrderItem", x => x.SalesOrderItemId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Shift",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShiftName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Shift", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskStatus",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskStatus", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_VisitType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_VisitType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_WorkLocation",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LocationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LocationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_WorkLocation", x => x.ID);
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

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AccessControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FormName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanAdd = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AccessControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_AccessControls_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_State",
                columns: table => new
                {
                    StateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StateCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_State", x => x.StateId);
                    table.ForeignKey(
                        name: "FK_tbl_State_tbl_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "tbl_Country",
                        principalColumn: "CountryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDeclarationDetail",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeTaxDeclarationID = table.Column<int>(type: "int", nullable: false),
                    Section = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeclaredAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDeclarationDetail", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDeclarationDetail_tbl_EmployeeTaxDeclaration_EmployeeTaxDeclarationID",
                        column: x => x.EmployeeTaxDeclarationID,
                        principalTable: "tbl_EmployeeTaxDeclaration",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Employee",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PresentAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfJoining = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WorkLocationID = table.Column<int>(type: "int", nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    DesignationID = table.Column<int>(type: "int", nullable: true),
                    ReportingTo = table.Column<int>(type: "int", nullable: true),
                    LevelID = table.Column<int>(type: "int", nullable: true),
                    PhotoPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GoogleCalendarId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfLeaving = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Employee", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Department_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "tbl_Department",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Designation_DesignationID",
                        column: x => x.DesignationID,
                        principalTable: "tbl_Designation",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Employee_ReportingTo",
                        column: x => x.ReportingTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                        column: x => x.LevelID,
                        principalTable: "tbl_LevelMasters",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_WorkLocation_WorkLocationID",
                        column: x => x.WorkLocationID,
                        principalTable: "tbl_WorkLocation",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_City",
                columns: table => new
                {
                    CityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    CityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_City", x => x.CityId);
                    table.ForeignKey(
                        name: "FK_tbl_City_tbl_State_StateId",
                        column: x => x.StateId,
                        principalTable: "tbl_State",
                        principalColumn: "StateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDeclarationDocument",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeDeclarationDetailID = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDeclarationDocument", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDeclarationDocument_tbl_EmployeeDeclarationDetail_EmployeeDeclarationDetailID",
                        column: x => x.EmployeeDeclarationDetailID,
                        principalTable: "tbl_EmployeeDeclarationDetail",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_tbl_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bde_user",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DirectorEmployeeId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bde_user", x => x.ID);
                    table.ForeignKey(
                        name: "FK_bde_user_tbl_Employee_DirectorEmployeeId",
                        column: x => x.DirectorEmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyContacts",
                columns: table => new
                {
                    ContactId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DesignationId = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AlternateMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyContacts", x => x.ContactId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyContacts_tbl_Designation_DesignationId",
                        column: x => x.DesignationId,
                        principalTable: "tbl_Designation",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyContacts_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyPhones",
                columns: table => new
                {
                    PhoneId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    PhoneType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyPhones", x => x.PhoneId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyPhones_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeAddress",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlatNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PremisesName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoadName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Locality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TownDistrict = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PinNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltEmail = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeAddress", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeAddress_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeExperience",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeExperience", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeExperience_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeQualification",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    University = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassingYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeQualification", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeQualification_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeStatutoryDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AadhaarNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PANNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassportNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PFNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ESINo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeStatutoryDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeTDSDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    TDSAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeTDSDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeTDSDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalaryStructure",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    SalaryComponentID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalaryStructure", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_SalaryStructure_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_SalaryStructure_tbl_SalaryComponent_SalaryComponentID",
                        column: x => x.SalaryComponentID,
                        principalTable: "tbl_SalaryComponent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Company",
                columns: table => new
                {
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyTypeId = table.Column<int>(type: "int", nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyGroup = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlantCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorSupplierCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OwnerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternateEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternateMobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MSMENumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IndustryId = table.Column<int>(type: "int", nullable: true),
                    CompanyCategoryId = table.Column<int>(type: "int", nullable: true),
                    ClientTypeId = table.Column<int>(type: "int", nullable: true),
                    CompanyStatusId = table.Column<int>(type: "int", nullable: true),
                    CustomerSourceId = table.Column<int>(type: "int", nullable: true),
                    CustomerAreaId = table.Column<int>(type: "int", nullable: true),
                    PaymentTermsId = table.Column<int>(type: "int", nullable: true),
                    DirectorId = table.Column<int>(type: "int", nullable: true),
                    SalesCoordinatorId = table.Column<int>(type: "int", nullable: true),
                    SalesCoordinatorName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerOwnerId = table.Column<int>(type: "int", nullable: true),
                    SalesManagerId = table.Column<int>(type: "int", nullable: true),
                    BDEUserId = table.Column<int>(type: "int", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: true),
                    StateId = table.Column<int>(type: "int", nullable: true),
                    CityId = table.Column<int>(type: "int", nullable: true),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VisitedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Company", x => x.CompanyId);
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_City_CityId",
                        column: x => x.CityId,
                        principalTable: "tbl_City",
                        principalColumn: "CityId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_ClientType_ClientTypeId",
                        column: x => x.ClientTypeId,
                        principalTable: "tbl_ClientType",
                        principalColumn: "ClientTypeId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "tbl_Country",
                        principalColumn: "CountryId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_CustomerArea_CustomerAreaId",
                        column: x => x.CustomerAreaId,
                        principalTable: "tbl_CustomerArea",
                        principalColumn: "CustomerAreaId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_CustomerCategory_CompanyCategoryId",
                        column: x => x.CompanyCategoryId,
                        principalTable: "tbl_CustomerCategory",
                        principalColumn: "CustomerCategoryId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_CustomerSource_CustomerSourceId",
                        column: x => x.CustomerSourceId,
                        principalTable: "tbl_CustomerSource",
                        principalColumn: "CustomerSourceId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_CustomerStatus_CompanyStatusId",
                        column: x => x.CompanyStatusId,
                        principalTable: "tbl_CustomerStatus",
                        principalColumn: "CustomerStatusId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_BDEUserId",
                        column: x => x.BDEUserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_CustomerOwnerId",
                        column: x => x.CustomerOwnerId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_DirectorId",
                        column: x => x.DirectorId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_SalesCoordinatorId",
                        column: x => x.SalesCoordinatorId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_SalesManagerId",
                        column: x => x.SalesManagerId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_Industry_IndustryId",
                        column: x => x.IndustryId,
                        principalTable: "tbl_Industry",
                        principalColumn: "IndustryId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_PaymentTerm_PaymentTermsId",
                        column: x => x.PaymentTermsId,
                        principalTable: "tbl_PaymentTerm",
                        principalColumn: "PaymentTermId");
                    table.ForeignKey(
                        name: "FK_tbl_Company_tbl_State_StateId",
                        column: x => x.StateId,
                        principalTable: "tbl_State",
                        principalColumn: "StateId");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyAddresses",
                columns: table => new
                {
                    AddressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LocationName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    PlantCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsBilling = table.Column<bool>(type: "bit", nullable: false),
                    IsDelivery = table.Column<bool>(type: "bit", nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    CityId = table.Column<int>(type: "int", nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyAddresses", x => x.AddressId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyAddresses_tbl_City_CityId",
                        column: x => x.CityId,
                        principalTable: "tbl_City",
                        principalColumn: "CityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyAddresses_tbl_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "tbl_Country",
                        principalColumn: "CountryId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyAddresses_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyAddresses_tbl_State_StateId",
                        column: x => x.StateId,
                        principalTable: "tbl_State",
                        principalColumn: "StateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesCoordinator",
                columns: table => new
                {
                    SalesCoordinatorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesCoordinatorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SalesCoordinatorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BDEUserId = table.Column<int>(type: "int", nullable: true),
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
                    table.ForeignKey(
                        name: "FK_tbl_SalesCoordinator_bde_user_BDEUserId",
                        column: x => x.BDEUserId,
                        principalTable: "bde_user",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_ActivityLog",
                columns: table => new
                {
                    ActivityLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivityDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ActivityLog", x => x.ActivityLogId);
                    table.ForeignKey(
                        name: "FK_tbl_ActivityLog_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_ActivityLog_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Call",
                columns: table => new
                {
                    CallId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    CallTypeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CallDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Call", x => x.CallId);
                    table.ForeignKey(
                        name: "FK_tbl_Call_tbl_CallType_CallTypeId",
                        column: x => x.CallTypeId,
                        principalTable: "tbl_CallType",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Call_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_Call_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Call_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyDocument",
                columns: table => new
                {
                    DocumentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: false),
                    UploadedBy = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyDocument", x => x.DocumentId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyDocument_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyDocument_tbl_DocumentType_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "tbl_DocumentType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyDocument_tbl_Employee_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyEmail",
                columns: table => new
                {
                    EmailId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyEmail", x => x.EmailId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyEmail_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyEmailsLog",
                columns: table => new
                {
                    EmailLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyEmailsLog", x => x.EmailLogId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyEmailsLog_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyEmailsLog_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyNote",
                columns: table => new
                {
                    NoteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyNote", x => x.NoteId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyNote_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyNote_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyVisit",
                columns: table => new
                {
                    VisitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VisitTypeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    VisitDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckInTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    CheckOutTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyVisit", x => x.VisitId);
                    table.ForeignKey(
                        name: "FK_tbl_CompanyVisit_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyVisit_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_CompanyVisit_tbl_VisitType_VisitTypeId",
                        column: x => x.VisitTypeId,
                        principalTable: "tbl_VisitType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Contact",
                columns: table => new
                {
                    ContactId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AltMobileNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    AltEmailAddress = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Contact", x => x.ContactId);
                    table.ForeignKey(
                        name: "FK_tbl_Contact_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_FollowUp",
                columns: table => new
                {
                    FollowUpId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    PriorityId = table.Column<int>(type: "int", nullable: false),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_FollowUp", x => x.FollowUpId);
                    table.ForeignKey(
                        name: "FK_tbl_FollowUp_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_FollowUp_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_FollowUp_tbl_Priority_PriorityId",
                        column: x => x.PriorityId,
                        principalTable: "tbl_Priority",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_FollowUp_tbl_TaskStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "tbl_TaskStatus",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Invoice",
                columns: table => new
                {
                    InvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClientTypeId = table.Column<int>(type: "int", nullable: false),
                    GSTNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InvoiceStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Invoice", x => x.InvoiceId);
                    table.ForeignKey(
                        name: "FK_tbl_Invoice_tbl_ClientType_ClientTypeId",
                        column: x => x.ClientTypeId,
                        principalTable: "tbl_ClientType",
                        principalColumn: "ClientTypeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Invoice_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Invoice_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Invoice_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_Meeting",
                columns: table => new
                {
                    MeetingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    MeetingTypeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    MeetingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeetingTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Agenda = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Outcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextMeetingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Meeting", x => x.MeetingId);
                    table.ForeignKey(
                        name: "FK_tbl_Meeting_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Meeting_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Meeting_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Meeting_tbl_Employee_UserId",
                        column: x => x.UserId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Meeting_tbl_MeetingType_MeetingTypeId",
                        column: x => x.MeetingTypeId,
                        principalTable: "tbl_MeetingType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_NonGSTInvoice",
                columns: table => new
                {
                    NonGSTInvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountInWords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_NonGSTInvoice", x => x.NonGSTInvoiceId);
                    table.ForeignKey(
                        name: "FK_tbl_NonGSTInvoice_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_NonGSTProforma",
                columns: table => new
                {
                    NonGSTProformaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProformaDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountInWords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_NonGSTProforma", x => x.NonGSTProformaId);
                    table.ForeignKey(
                        name: "FK_tbl_NonGSTProforma_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ProformaInvoice",
                columns: table => new
                {
                    ProformaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProformaDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ReverseCharge = table.Column<bool>(type: "bit", nullable: false),
                    TotalAmountBeforeTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCGSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalSGSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalTaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmountAfterTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTOnReverseCharge = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountInWords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ProformaInvoice", x => x.ProformaId);
                    table.ForeignKey(
                        name: "FK_tbl_ProformaInvoice_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Reminder",
                columns: table => new
                {
                    ReminderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    AssignedTo = table.Column<int>(type: "int", nullable: false),
                    ReminderStatusId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ReminderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReminderTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PriorityId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Reminder", x => x.ReminderId);
                    table.ForeignKey(
                        name: "FK_tbl_Reminder_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Reminder_tbl_Employee_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Reminder_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Reminder_tbl_Priority_PriorityId",
                        column: x => x.PriorityId,
                        principalTable: "tbl_Priority",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Reminder_tbl_ReminderStatus_ReminderStatusId",
                        column: x => x.ReminderStatusId,
                        principalTable: "tbl_ReminderStatus",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CallAttachment",
                columns: table => new
                {
                    AttachmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CallId = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    UploadedBy = table.Column<int>(type: "int", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CallAttachment", x => x.AttachmentId);
                    table.ForeignKey(
                        name: "FK_tbl_CallAttachment_tbl_Call_CallId",
                        column: x => x.CallId,
                        principalTable: "tbl_Call",
                        principalColumn: "CallId");
                    table.ForeignKey(
                        name: "FK_tbl_CallAttachment_tbl_Employee_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "tbl_CallHistory",
                columns: table => new
                {
                    HistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CallId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CallHistory", x => x.HistoryId);
                    table.ForeignKey(
                        name: "FK_tbl_CallHistory_tbl_Call_CallId",
                        column: x => x.CallId,
                        principalTable: "tbl_Call",
                        principalColumn: "CallId");
                });

            migrationBuilder.CreateTable(
                name: "tbl_VisitAttachment",
                columns: table => new
                {
                    AttachmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitId = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    UploadedBy = table.Column<int>(type: "int", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_VisitAttachment", x => x.AttachmentId);
                    table.ForeignKey(
                        name: "FK_tbl_VisitAttachment_tbl_CompanyVisit_VisitId",
                        column: x => x.VisitId,
                        principalTable: "tbl_CompanyVisit",
                        principalColumn: "VisitId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_InvoiceItems",
                columns: table => new
                {
                    InvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_InvoiceItems", x => x.InvoiceItemId);
                    table.ForeignKey(
                        name: "FK_tbl_InvoiceItems_tbl_Invoice_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "tbl_Invoice",
                        principalColumn: "InvoiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_InvoicePayments",
                columns: table => new
                {
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_InvoicePayments", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_tbl_InvoicePayments_tbl_Invoice_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "tbl_Invoice",
                        principalColumn: "InvoiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MeetingAttendees",
                columns: table => new
                {
                    AttendeeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MeetingId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsPresent = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingAttendees", x => x.AttendeeId);
                    table.ForeignKey(
                        name: "FK_MeetingAttendees_tbl_Meeting_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "tbl_Meeting",
                        principalColumn: "MeetingId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_NonGSTInvoiceItem",
                columns: table => new
                {
                    NonGSTInvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NonGSTInvoiceId = table.Column<int>(type: "int", nullable: false),
                    Services = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_NonGSTInvoiceItem", x => x.NonGSTInvoiceItemId);
                    table.ForeignKey(
                        name: "FK_tbl_NonGSTInvoiceItem_tbl_NonGSTInvoice_NonGSTInvoiceId",
                        column: x => x.NonGSTInvoiceId,
                        principalTable: "tbl_NonGSTInvoice",
                        principalColumn: "NonGSTInvoiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_NonGSTProformaItem",
                columns: table => new
                {
                    NonGSTProformaItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NonGSTProformaId = table.Column<int>(type: "int", nullable: false),
                    SrNo = table.Column<int>(type: "int", nullable: false),
                    Services = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_NonGSTProformaItem", x => x.NonGSTProformaItemId);
                    table.ForeignKey(
                        name: "FK_tbl_NonGSTProformaItem_tbl_NonGSTProforma_NonGSTProformaId",
                        column: x => x.NonGSTProformaId,
                        principalTable: "tbl_NonGSTProforma",
                        principalColumn: "NonGSTProformaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ProformaInvoiceItem",
                columns: table => new
                {
                    ProformaItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaId = table.Column<int>(type: "int", nullable: false),
                    SrNo = table.Column<int>(type: "int", nullable: false),
                    Services = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxableValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CGSTRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CGSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SGSTRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    SGSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ProformaInvoiceItem", x => x.ProformaItemId);
                    table.ForeignKey(
                        name: "FK_tbl_ProformaInvoiceItem_tbl_ProformaInvoice_ProformaId",
                        column: x => x.ProformaId,
                        principalTable: "tbl_ProformaInvoice",
                        principalColumn: "ProformaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReminderHistory",
                columns: table => new
                {
                    ReminderHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReminderId = table.Column<int>(type: "int", nullable: false),
                    ReminderStatusId = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReminderHistory", x => x.ReminderHistoryId);
                    table.ForeignKey(
                        name: "FK_tbl_ReminderHistory_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_ReminderHistory_tbl_ReminderStatus_ReminderStatusId",
                        column: x => x.ReminderStatusId,
                        principalTable: "tbl_ReminderStatus",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_ReminderHistory_tbl_Reminder_ReminderId",
                        column: x => x.ReminderId,
                        principalTable: "tbl_Reminder",
                        principalColumn: "ReminderId");
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReminderNotification",
                columns: table => new
                {
                    ReminderNotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReminderId = table.Column<int>(type: "int", nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NotificationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NotificationStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentBy = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReminderNotification", x => x.ReminderNotificationId);
                    table.ForeignKey(
                        name: "FK_tbl_ReminderNotification_tbl_Employee_SentBy",
                        column: x => x.SentBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_ReminderNotification_tbl_Reminder_ReminderId",
                        column: x => x.ReminderId,
                        principalTable: "tbl_Reminder",
                        principalColumn: "ReminderId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Task",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    TaskTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedTo = table.Column<int>(type: "int", nullable: false),
                    AssignedBy = table.Column<int>(type: "int", nullable: false),
                    PriorityId = table.Column<int>(type: "int", nullable: false),
                    TaskStatusId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReminderId = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Task", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tbl_Company",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Employee_AssignedBy",
                        column: x => x.AssignedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Employee_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Priority_PriorityId",
                        column: x => x.PriorityId,
                        principalTable: "tbl_Priority",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_Reminder_ReminderId",
                        column: x => x.ReminderId,
                        principalTable: "tbl_Reminder",
                        principalColumn: "ReminderId");
                    table.ForeignKey(
                        name: "FK_tbl_Task_tbl_TaskStatus_TaskStatusId",
                        column: x => x.TaskStatusId,
                        principalTable: "tbl_TaskStatus",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskAssignment",
                columns: table => new
                {
                    AssignmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    AssignedTo = table.Column<int>(type: "int", nullable: false),
                    AssignedBy = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskAssignment", x => x.AssignmentId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedBy",
                        column: x => x.AssignedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignment_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskAssignments",
                columns: table => new
                {
                    AssignmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    AssignedTo = table.Column<int>(type: "int", nullable: false),
                    AssignedBy = table.Column<int>(type: "int", nullable: false),
                    AssignmentStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskAssignments", x => x.AssignmentId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedBy",
                        column: x => x.AssignedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignments_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignments_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAssignments_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskAttachment",
                columns: table => new
                {
                    AttachmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    UploadedBy = table.Column<int>(type: "int", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskAttachment", x => x.AttachmentId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskAttachment_tbl_Employee_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskAttachment_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskChecklist",
                columns: table => new
                {
                    ChecklistId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    ChecklistItem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskChecklist", x => x.ChecklistId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskChecklist_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskComment",
                columns: table => new
                {
                    CommentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CommentedBy = table.Column<int>(type: "int", nullable: false),
                    CommentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskComment", x => x.CommentId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskComment_tbl_Employee_CommentedBy",
                        column: x => x.CommentedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskComment_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskHistory",
                columns: table => new
                {
                    HistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    Activity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PerformedBy = table.Column<int>(type: "int", nullable: false),
                    PerformedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskHistory", x => x.HistoryId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskHistory_tbl_Employee_PerformedBy",
                        column: x => x.PerformedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskHistory_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaskReminderMapping",
                columns: table => new
                {
                    MappingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    ReminderId = table.Column<int>(type: "int", nullable: false),
                    ReminderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaskReminderMapping", x => x.MappingId);
                    table.ForeignKey(
                        name: "FK_tbl_TaskReminderMapping_tbl_Employee_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskReminderMapping_tbl_Employee_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_TaskReminderMapping_tbl_Reminder_ReminderId",
                        column: x => x.ReminderId,
                        principalTable: "tbl_Reminder",
                        principalColumn: "ReminderId");
                    table.ForeignKey(
                        name: "FK_tbl_TaskReminderMapping_tbl_Task_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tbl_Task",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmployeeId",
                table: "AspNetUsers",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

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
                name: "IX_MeetingAttendees_MeetingId",
                table: "MeetingAttendees",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaceOfSupplies_PlaceOfSupplyCode",
                table: "PlaceOfSupplies",
                column: "PlaceOfSupplyCode",
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

            migrationBuilder.CreateIndex(
                name: "IX_SalesTerritories_SalesTerritoryCode",
                table: "SalesTerritories",
                column: "SalesTerritoryCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AccessControls_RoleId",
                table: "tbl_AccessControls",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ActivityLog_CompanyId",
                table: "tbl_ActivityLog",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ActivityLog_UserId",
                table: "tbl_ActivityLog",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Call_CallTypeId",
                table: "tbl_Call",
                column: "CallTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Call_CompanyId",
                table: "tbl_Call",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Call_CreatedBy",
                table: "tbl_Call",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Call_UserId",
                table: "tbl_Call",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CallAttachment_CallId",
                table: "tbl_CallAttachment",
                column: "CallId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CallAttachment_UploadedBy",
                table: "tbl_CallAttachment",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CallHistory_CallId",
                table: "tbl_CallHistory",
                column: "CallId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_City_StateId",
                table: "tbl_City",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_BDEUserId",
                table: "tbl_Company",
                column: "BDEUserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CityId",
                table: "tbl_Company",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_ClientTypeId",
                table: "tbl_Company",
                column: "ClientTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CompanyCategoryId",
                table: "tbl_Company",
                column: "CompanyCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CompanyCode",
                table: "tbl_Company",
                column: "CompanyCode",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CompanyStatusId",
                table: "tbl_Company",
                column: "CompanyStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CountryId",
                table: "tbl_Company",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CreatedBy",
                table: "tbl_Company",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CustomerAreaId",
                table: "tbl_Company",
                column: "CustomerAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CustomerOwnerId",
                table: "tbl_Company",
                column: "CustomerOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_CustomerSourceId",
                table: "tbl_Company",
                column: "CustomerSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_DirectorId",
                table: "tbl_Company",
                column: "DirectorId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_IndustryId",
                table: "tbl_Company",
                column: "IndustryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_PaymentTermsId",
                table: "tbl_Company",
                column: "PaymentTermsId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_SalesCoordinatorId",
                table: "tbl_Company",
                column: "SalesCoordinatorId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_SalesManagerId",
                table: "tbl_Company",
                column: "SalesManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_StateId",
                table: "tbl_Company",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Company_UpdatedBy",
                table: "tbl_Company",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyAddresses_CityId",
                table: "tbl_CompanyAddresses",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyAddresses_CountryId",
                table: "tbl_CompanyAddresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyAddresses_CreatedBy",
                table: "tbl_CompanyAddresses",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyAddresses_StateId",
                table: "tbl_CompanyAddresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyContacts_CreatedBy",
                table: "tbl_CompanyContacts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyContacts_DesignationId",
                table: "tbl_CompanyContacts",
                column: "DesignationId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyDocument_CompanyId",
                table: "tbl_CompanyDocument",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyDocument_DocumentTypeId",
                table: "tbl_CompanyDocument",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyDocument_UploadedBy",
                table: "tbl_CompanyDocument",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyEmail_CompanyId",
                table: "tbl_CompanyEmail",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyEmailsLog_CompanyId",
                table: "tbl_CompanyEmailsLog",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyEmailsLog_UserId",
                table: "tbl_CompanyEmailsLog",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyNote_CompanyId",
                table: "tbl_CompanyNote",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyNote_UserId",
                table: "tbl_CompanyNote",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyPhones_CreatedBy",
                table: "tbl_CompanyPhones",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyVisit_CompanyId",
                table: "tbl_CompanyVisit",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyVisit_UserId",
                table: "tbl_CompanyVisit",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CompanyVisit_VisitTypeId",
                table: "tbl_CompanyVisit",
                column: "VisitTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Contact_CompanyId",
                table: "tbl_Contact",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DepartmentID",
                table: "tbl_Employee",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DesignationID",
                table: "tbl_Employee",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_ReportingTo",
                table: "tbl_Employee",
                column: "ReportingTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_WorkLocationID",
                table: "tbl_Employee",
                column: "WorkLocationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_EmployeeID",
                table: "tbl_EmployeeAddress",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeDeclarationDetail_EmployeeTaxDeclarationID",
                table: "tbl_EmployeeDeclarationDetail",
                column: "EmployeeTaxDeclarationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeDeclarationDocument_EmployeeDeclarationDetailID",
                table: "tbl_EmployeeDeclarationDocument",
                column: "EmployeeDeclarationDetailID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeExperience_EmployeeID",
                table: "tbl_EmployeeExperience",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeQualification_EmployeeID",
                table: "tbl_EmployeeQualification",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeStatutoryDetails_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeTDSDetails_EmployeeID",
                table: "tbl_EmployeeTDSDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FollowUp_CompanyId",
                table: "tbl_FollowUp",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FollowUp_PriorityId",
                table: "tbl_FollowUp",
                column: "PriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FollowUp_StatusId",
                table: "tbl_FollowUp",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FollowUp_UserId",
                table: "tbl_FollowUp",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Invoice_ClientTypeId",
                table: "tbl_Invoice",
                column: "ClientTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Invoice_CompanyId",
                table: "tbl_Invoice",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Invoice_CreatedBy",
                table: "tbl_Invoice",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Invoice_UpdatedBy",
                table: "tbl_Invoice",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_InvoiceItems_InvoiceId",
                table: "tbl_InvoiceItems",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_InvoicePayments_InvoiceId",
                table: "tbl_InvoicePayments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Meeting_CompanyId",
                table: "tbl_Meeting",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Meeting_CreatedBy",
                table: "tbl_Meeting",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Meeting_MeetingTypeId",
                table: "tbl_Meeting",
                column: "MeetingTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Meeting_UpdatedBy",
                table: "tbl_Meeting",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Meeting_UserId",
                table: "tbl_Meeting",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_NonGSTInvoice_CompanyId",
                table: "tbl_NonGSTInvoice",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_NonGSTInvoiceItem_NonGSTInvoiceId",
                table: "tbl_NonGSTInvoiceItem",
                column: "NonGSTInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_NonGSTProforma_CompanyId",
                table: "tbl_NonGSTProforma",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_NonGSTProformaItem_NonGSTProformaId",
                table: "tbl_NonGSTProformaItem",
                column: "NonGSTProformaId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ProformaInvoice_CompanyId",
                table: "tbl_ProformaInvoice",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ProformaInvoiceItem_ProformaId",
                table: "tbl_ProformaInvoiceItem",
                column: "ProformaId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Reminder_AssignedTo",
                table: "tbl_Reminder",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Reminder_CompanyId",
                table: "tbl_Reminder",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Reminder_CreatedBy",
                table: "tbl_Reminder",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Reminder_PriorityId",
                table: "tbl_Reminder",
                column: "PriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Reminder_ReminderStatusId",
                table: "tbl_Reminder",
                column: "ReminderStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReminderHistory_ReminderId",
                table: "tbl_ReminderHistory",
                column: "ReminderId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReminderHistory_ReminderStatusId",
                table: "tbl_ReminderHistory",
                column: "ReminderStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReminderHistory_UpdatedBy",
                table: "tbl_ReminderHistory",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReminderNotification_ReminderId",
                table: "tbl_ReminderNotification",
                column: "ReminderId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReminderNotification_SentBy",
                table: "tbl_ReminderNotification",
                column: "SentBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_EmployeeID",
                table: "tbl_SalaryStructure",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_SalaryComponentID",
                table: "tbl_SalaryStructure",
                column: "SalaryComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesCoordinator_BDEUserId",
                table: "tbl_SalesCoordinator",
                column: "BDEUserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_State_CountryId",
                table: "tbl_State",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_AssignedBy",
                table: "tbl_Task",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_AssignedTo",
                table: "tbl_Task",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_CompanyId",
                table: "tbl_Task",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_CreatedBy",
                table: "tbl_Task",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_PriorityId",
                table: "tbl_Task",
                column: "PriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_ReminderId",
                table: "tbl_Task",
                column: "ReminderId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_TaskStatusId",
                table: "tbl_Task",
                column: "TaskStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Task_UpdatedBy",
                table: "tbl_Task",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignment_AssignedBy",
                table: "tbl_TaskAssignment",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignment_AssignedTo",
                table: "tbl_TaskAssignment",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignment_TaskId",
                table: "tbl_TaskAssignment",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignments_AssignedBy",
                table: "tbl_TaskAssignments",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignments_AssignedTo",
                table: "tbl_TaskAssignments",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignments_CreatedBy",
                table: "tbl_TaskAssignments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignments_TaskId",
                table: "tbl_TaskAssignments",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAssignments_UpdatedBy",
                table: "tbl_TaskAssignments",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAttachment_TaskId",
                table: "tbl_TaskAttachment",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskAttachment_UploadedBy",
                table: "tbl_TaskAttachment",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskChecklist_TaskId",
                table: "tbl_TaskChecklist",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskComment_CommentedBy",
                table: "tbl_TaskComment",
                column: "CommentedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskComment_TaskId",
                table: "tbl_TaskComment",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskHistory_PerformedBy",
                table: "tbl_TaskHistory",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskHistory_TaskId",
                table: "tbl_TaskHistory",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskReminderMapping_CreatedBy",
                table: "tbl_TaskReminderMapping",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskReminderMapping_ReminderId",
                table: "tbl_TaskReminderMapping",
                column: "ReminderId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskReminderMapping_TaskId",
                table: "tbl_TaskReminderMapping",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_TaskReminderMapping_UpdatedBy",
                table: "tbl_TaskReminderMapping",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_VisitAttachment_VisitId",
                table: "tbl_VisitAttachment",
                column: "VisitId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitOfMeasures_UnitOfMeasureCode",
                table: "UnitOfMeasures",
                column: "UnitOfMeasureCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Currencies");

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
                name: "MeetingAttachments");

            migrationBuilder.DropTable(
                name: "MeetingAttendees");

            migrationBuilder.DropTable(
                name: "NotificationLogs");

            migrationBuilder.DropTable(
                name: "NotificationQueues");

            migrationBuilder.DropTable(
                name: "PlaceOfSupplies");

            migrationBuilder.DropTable(
                name: "ProductCategories");

            migrationBuilder.DropTable(
                name: "ProductServices");

            migrationBuilder.DropTable(
                name: "sales_user_manager");

            migrationBuilder.DropTable(
                name: "SalesTerritories");

            migrationBuilder.DropTable(
                name: "tbl_AccessControls");

            migrationBuilder.DropTable(
                name: "tbl_ActivityLog");

            migrationBuilder.DropTable(
                name: "tbl_ActivityType");

            migrationBuilder.DropTable(
                name: "tbl_AddressType");

            migrationBuilder.DropTable(
                name: "tbl_AssetMaster");

            migrationBuilder.DropTable(
                name: "tbl_AuditLog");

            migrationBuilder.DropTable(
                name: "tbl_CallAttachment");

            migrationBuilder.DropTable(
                name: "tbl_CallHistory");

            migrationBuilder.DropTable(
                name: "tbl_Companiess");

            migrationBuilder.DropTable(
                name: "tbl_CompanyAddresses");

            migrationBuilder.DropTable(
                name: "tbl_CompanyContacts");

            migrationBuilder.DropTable(
                name: "tbl_CompanyDocument");

            migrationBuilder.DropTable(
                name: "tbl_CompanyEmail");

            migrationBuilder.DropTable(
                name: "tbl_CompanyEmailsLog");

            migrationBuilder.DropTable(
                name: "tbl_CompanyNote");

            migrationBuilder.DropTable(
                name: "tbl_CompanyPhones");

            migrationBuilder.DropTable(
                name: "tbl_CompanyProfile");

            migrationBuilder.DropTable(
                name: "tbl_CompanyTimeline");

            migrationBuilder.DropTable(
                name: "tbl_Contact");

            migrationBuilder.DropTable(
                name: "tbl_ContactType");

            migrationBuilder.DropTable(
                name: "tbl_CustomerTypes");

            migrationBuilder.DropTable(
                name: "tbl_EmailTemplate");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeAddress");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeBankDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeExperience");

            migrationBuilder.DropTable(
                name: "tbl_EmployeePFDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeQualification");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeSalarySummary");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTDSDetails");

            migrationBuilder.DropTable(
                name: "tbl_Enquiries");

            migrationBuilder.DropTable(
                name: "tbl_FollowUp");

            migrationBuilder.DropTable(
                name: "tbl_History");

            migrationBuilder.DropTable(
                name: "tbl_InvoiceItems");

            migrationBuilder.DropTable(
                name: "tbl_InvoicePayments");

            migrationBuilder.DropTable(
                name: "tbl_InvoiceType");

            migrationBuilder.DropTable(
                name: "tbl_NonGSTInvoiceItem");

            migrationBuilder.DropTable(
                name: "tbl_NonGSTProformaItem");

            migrationBuilder.DropTable(
                name: "Tbl_Notifications");

            migrationBuilder.DropTable(
                name: "tbl_Product");

            migrationBuilder.DropTable(
                name: "tbl_ProformaInvoiceItem");

            migrationBuilder.DropTable(
                name: "tbl_Quotation");

            migrationBuilder.DropTable(
                name: "tbl_QuotationApproval");

            migrationBuilder.DropTable(
                name: "tbl_QuotationCharge");

            migrationBuilder.DropTable(
                name: "tbl_QuotationDefault");

            migrationBuilder.DropTable(
                name: "tbl_QuotationItem");

            migrationBuilder.DropTable(
                name: "tbl_QuotationRevision");

            migrationBuilder.DropTable(
                name: "tbl_ReminderHistory");

            migrationBuilder.DropTable(
                name: "tbl_ReminderNotification");

            migrationBuilder.DropTable(
                name: "tbl_SalaryStructure");

            migrationBuilder.DropTable(
                name: "tbl_SalesAttachment");

            migrationBuilder.DropTable(
                name: "tbl_SalesCoordinator");

            migrationBuilder.DropTable(
                name: "tbl_SalesOrder");

            migrationBuilder.DropTable(
                name: "tbl_SalesOrderItem");

            migrationBuilder.DropTable(
                name: "tbl_Shift");

            migrationBuilder.DropTable(
                name: "tbl_TaskAssignment");

            migrationBuilder.DropTable(
                name: "tbl_TaskAssignments");

            migrationBuilder.DropTable(
                name: "tbl_TaskAttachment");

            migrationBuilder.DropTable(
                name: "tbl_TaskChecklist");

            migrationBuilder.DropTable(
                name: "tbl_TaskComment");

            migrationBuilder.DropTable(
                name: "tbl_TaskHistory");

            migrationBuilder.DropTable(
                name: "tbl_TaskReminderMapping");

            migrationBuilder.DropTable(
                name: "tbl_VisitAttachment");

            migrationBuilder.DropTable(
                name: "UnitOfMeasures");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "tbl_Meeting");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "tbl_Call");

            migrationBuilder.DropTable(
                name: "tbl_DocumentType");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDetail");

            migrationBuilder.DropTable(
                name: "tbl_Invoice");

            migrationBuilder.DropTable(
                name: "tbl_NonGSTInvoice");

            migrationBuilder.DropTable(
                name: "tbl_NonGSTProforma");

            migrationBuilder.DropTable(
                name: "tbl_ProformaInvoice");

            migrationBuilder.DropTable(
                name: "tbl_SalaryComponent");

            migrationBuilder.DropTable(
                name: "bde_user");

            migrationBuilder.DropTable(
                name: "tbl_Task");

            migrationBuilder.DropTable(
                name: "tbl_CompanyVisit");

            migrationBuilder.DropTable(
                name: "tbl_MeetingType");

            migrationBuilder.DropTable(
                name: "tbl_CallType");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTaxDeclaration");

            migrationBuilder.DropTable(
                name: "tbl_Reminder");

            migrationBuilder.DropTable(
                name: "tbl_TaskStatus");

            migrationBuilder.DropTable(
                name: "tbl_VisitType");

            migrationBuilder.DropTable(
                name: "tbl_Company");

            migrationBuilder.DropTable(
                name: "tbl_Priority");

            migrationBuilder.DropTable(
                name: "tbl_ReminderStatus");

            migrationBuilder.DropTable(
                name: "tbl_City");

            migrationBuilder.DropTable(
                name: "tbl_ClientType");

            migrationBuilder.DropTable(
                name: "tbl_CustomerArea");

            migrationBuilder.DropTable(
                name: "tbl_CustomerCategory");

            migrationBuilder.DropTable(
                name: "tbl_CustomerSource");

            migrationBuilder.DropTable(
                name: "tbl_CustomerStatus");

            migrationBuilder.DropTable(
                name: "tbl_Employee");

            migrationBuilder.DropTable(
                name: "tbl_Industry");

            migrationBuilder.DropTable(
                name: "tbl_PaymentTerm");

            migrationBuilder.DropTable(
                name: "tbl_State");

            migrationBuilder.DropTable(
                name: "tbl_Department");

            migrationBuilder.DropTable(
                name: "tbl_Designation");

            migrationBuilder.DropTable(
                name: "tbl_LevelMasters");

            migrationBuilder.DropTable(
                name: "tbl_WorkLocation");

            migrationBuilder.DropTable(
                name: "tbl_Country");
        }
    }
}
