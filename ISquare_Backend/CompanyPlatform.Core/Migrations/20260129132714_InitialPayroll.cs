using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class InitialPayroll : Migration
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
                name: "SalarySettingPercentage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FixedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CalculationBase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsApplicable = table.Column<bool>(type: "bit", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalarySettingPercentage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyProfile",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CittdsAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryDesignation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyProfile", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ComplianceFilingStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComplianceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ComplianceFilingStatus", x => x.Id);
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
                name: "tbl_ExpenseType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ExpenseType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Holiday",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Holiday", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LeaveTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanMasters",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanMasters", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PayrollRun",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    ProcessedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProcessedByUserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PayrollRun", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ProfessionalTaxSlab",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MinGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ProfessionalTaxSlab", x => x.Id);
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
                name: "tbl_StatutorySetting",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SettingName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_StatutorySetting", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaxSlabs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TaxRegime = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CitizenType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FromAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ToAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RatePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaxSlabs", x => x.Id);
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
                name: "Tbl_AccessControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FormName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanAdd = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_AccessControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_AccessControls_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
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
                        name: "FK_tbl_Employee_tbl_WorkLocation_WorkLocationID",
                        column: x => x.WorkLocationID,
                        principalTable: "tbl_WorkLocation",
                        principalColumn: "ID");
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
                name: "tbl_Advance",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProcessedByEmployeeId = table.Column<int>(type: "int", nullable: true),
                    StatusDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Advance", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Advance_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_Advance_tbl_Employee_ProcessedByEmployeeId",
                        column: x => x.ProcessedByEmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AssignLeaveType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    AllocatedDays = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    FinancialYear = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AssignLeaveType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_AssignLeaveType_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_AssignLeaveType_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Attendance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Attendance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_Attendance_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_BonusRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EligibleSalaryForCalculation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TenureInDays = table.Column<int>(type: "int", nullable: false),
                    AppliedRule = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_BonusRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_BonusRecords_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeBankDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BeneficiaryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeBankDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeBankDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
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
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDocument_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
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
                    table.ForeignKey(
                        name: "FK_tbl_EmployeePFDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
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
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeSalarySummary_tbl_Employee_EmployeeID",
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
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeTaxDeclaration_tbl_Employee_EmployeeID",
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
                name: "tbl_ExpenseClaim",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ExpenseTypeID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ClaimDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReceiptFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ExpenseClaim", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_Employee_ApproverID",
                        column: x => x.ApproverID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_ExpenseType_ExpenseTypeID",
                        column: x => x.ExpenseTypeID,
                        principalTable: "tbl_ExpenseType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Form16Status",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PartAStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PartBStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinalStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CertificateNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PartAFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GeneratedFormFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Form16Status", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Form16Status_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveRequest",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Days = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApprovedByEmployeeID = table.Column<int>(type: "int", nullable: true),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsHalfDay = table.Column<bool>(type: "bit", nullable: false),
                    HalfDayPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveRequest", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveRequest_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveRequest_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanApplications",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LoanTypeID = table.Column<int>(type: "int", nullable: false),
                    LoanAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TenureInMonths = table.Column<int>(type: "int", nullable: false),
                    MonthlyDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApplicationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApprovedByUserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanApplications", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_Tbl_LoanMasters_LoanTypeID",
                        column: x => x.LoanTypeID,
                        principalTable: "Tbl_LoanMasters",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_tbl_Employee_ApprovedByUserID",
                        column: x => x.ApprovedByUserID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_MonthlySalaryRecord",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    TotalDaysInMonth = table.Column<int>(type: "int", nullable: false),
                    PayableDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LOPDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossEarnings = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReimbursableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployerPF = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_MonthlySalaryRecord", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryRecord_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryRecord_tbl_PayrollRun_PayrollRunID",
                        column: x => x.PayrollRunID,
                        principalTable: "tbl_PayrollRun",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_Notifications_tbl_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_OutdoorDuty",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FromDate = table.Column<DateTime>(type: "date", nullable: false),
                    ToDate = table.Column<DateTime>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_OutdoorDuty", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_OutdoorDuty_tbl_Employee_ApproverID",
                        column: x => x.ApproverID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_OutdoorDuty_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Payslip",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PdfFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EmailSent = table.Column<bool>(type: "bit", nullable: false),
                    Downloaded = table.Column<bool>(type: "bit", nullable: false),
                    GeneratedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Payslip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Payslip_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Payslip_tbl_PayrollRun_PayrollRunID",
                        column: x => x.PayrollRunID,
                        principalTable: "tbl_PayrollRun",
                        principalColumn: "Id",
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
                name: "tbl_AdvanceRepayment",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdvanceID = table.Column<int>(type: "int", nullable: false),
                    RepaymentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AdvanceRepayment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_AdvanceRepayment_tbl_Advance_AdvanceID",
                        column: x => x.AdvanceID,
                        principalTable: "tbl_Advance",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_AdvanceRepayment_tbl_Employee_CreatedByEmployeeId",
                        column: x => x.CreatedByEmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
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
                name: "tbl_LeaveCreditLedger",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    Credit = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EarnedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeaveRequestID = table.Column<int>(type: "int", nullable: true),
                    AttendanceID = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveCreditLedger", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_Tbl_Attendance_AttendanceID",
                        column: x => x.AttendanceID,
                        principalTable: "Tbl_Attendance",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_LeaveRequest_LeaveRequestID",
                        column: x => x.LeaveRequestID,
                        principalTable: "tbl_LeaveRequest",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanRepayments",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanApplicationID = table.Column<int>(type: "int", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PayrollPeriod = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanRepayments", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanRepayments_Tbl_LoanApplications_LoanApplicationID",
                        column: x => x.LoanApplicationID,
                        principalTable: "Tbl_LoanApplications",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_MonthlySalaryComponentDetail",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MonthlySalaryRecordID = table.Column<int>(type: "int", nullable: false),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_MonthlySalaryComponentDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryComponentDetail_tbl_MonthlySalaryRecord_MonthlySalaryRecordID",
                        column: x => x.MonthlySalaryRecordID,
                        principalTable: "tbl_MonthlySalaryRecord",
                        principalColumn: "Id",
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
                name: "IX_Tbl_AccessControls_RoleId",
                table: "Tbl_AccessControls",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Advance_EmployeeID",
                table: "tbl_Advance",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Advance_ProcessedByEmployeeId",
                table: "tbl_Advance",
                column: "ProcessedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AdvanceRepayment_AdvanceID",
                table: "tbl_AdvanceRepayment",
                column: "AdvanceID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AdvanceRepayment_CreatedByEmployeeId",
                table: "tbl_AdvanceRepayment",
                column: "CreatedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AssignLeaveType_EmployeeID",
                table: "tbl_AssignLeaveType",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AssignLeaveType_LeaveTypeID",
                table: "tbl_AssignLeaveType",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Attendance_EmployeeID_Date",
                table: "Tbl_Attendance",
                columns: new[] { "EmployeeID", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_BonusRecords_EmployeeID",
                table: "tbl_BonusRecords",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DepartmentID",
                table: "tbl_Employee",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DesignationID",
                table: "tbl_Employee",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_ReportingTo",
                table: "tbl_Employee",
                column: "ReportingTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_WorkLocationID",
                table: "tbl_Employee",
                column: "WorkLocationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeBankDetails_EmployeeID",
                table: "tbl_EmployeeBankDetails",
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
                name: "IX_tbl_EmployeeDocument_EmployeeID",
                table: "tbl_EmployeeDocument",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeePFDetails_EmployeeID",
                table: "tbl_EmployeePFDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeSalarySummary_EmployeeID",
                table: "tbl_EmployeeSalarySummary",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeStatutoryDetails_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeTaxDeclaration_EmployeeID",
                table: "tbl_EmployeeTaxDeclaration",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeTDSDetails_EmployeeID",
                table: "tbl_EmployeeTDSDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_ApproverID",
                table: "tbl_ExpenseClaim",
                column: "ApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_EmployeeID",
                table: "tbl_ExpenseClaim",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_ExpenseTypeID",
                table: "tbl_ExpenseClaim",
                column: "ExpenseTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Form16Status_EmployeeID",
                table: "tbl_Form16Status",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_AttendanceID",
                table: "tbl_LeaveCreditLedger",
                column: "AttendanceID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_EmployeeID",
                table: "tbl_LeaveCreditLedger",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_LeaveRequestID",
                table: "tbl_LeaveCreditLedger",
                column: "LeaveRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_LeaveTypeID",
                table: "tbl_LeaveCreditLedger",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveRequest_EmployeeID",
                table: "tbl_LeaveRequest",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveRequest_LeaveTypeID",
                table: "tbl_LeaveRequest",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_ApprovedByUserID",
                table: "Tbl_LoanApplications",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_EmployeeID",
                table: "Tbl_LoanApplications",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_LoanTypeID",
                table: "Tbl_LoanApplications",
                column: "LoanTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanRepayments_LoanApplicationID",
                table: "Tbl_LoanRepayments",
                column: "LoanApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryComponentDetail_MonthlySalaryRecordID",
                table: "tbl_MonthlySalaryComponentDetail",
                column: "MonthlySalaryRecordID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryRecord_EmployeeID",
                table: "tbl_MonthlySalaryRecord",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryRecord_PayrollRunID",
                table: "tbl_MonthlySalaryRecord",
                column: "PayrollRunID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Notifications_EmployeeId",
                table: "Tbl_Notifications",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_OutdoorDuty_ApproverID",
                table: "tbl_OutdoorDuty",
                column: "ApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_OutdoorDuty_EmployeeID",
                table: "tbl_OutdoorDuty",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Payslip_EmployeeID",
                table: "tbl_Payslip",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Payslip_PayrollRunID",
                table: "tbl_Payslip",
                column: "PayrollRunID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_EmployeeID",
                table: "tbl_SalaryStructure",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_SalaryComponentID",
                table: "tbl_SalaryStructure",
                column: "SalaryComponentID");
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
                name: "SalarySettingPercentage");

            migrationBuilder.DropTable(
                name: "Tbl_AccessControls");

            migrationBuilder.DropTable(
                name: "tbl_AdvanceRepayment");

            migrationBuilder.DropTable(
                name: "tbl_AssignLeaveType");

            migrationBuilder.DropTable(
                name: "tbl_BonusRecords");

            migrationBuilder.DropTable(
                name: "tbl_CompanyProfile");

            migrationBuilder.DropTable(
                name: "tbl_ComplianceFilingStatus");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeBankDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeePFDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeSalarySummary");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTDSDetails");

            migrationBuilder.DropTable(
                name: "tbl_ExpenseClaim");

            migrationBuilder.DropTable(
                name: "tbl_Form16Status");

            migrationBuilder.DropTable(
                name: "tbl_Holiday");

            migrationBuilder.DropTable(
                name: "tbl_LeaveCreditLedger");

            migrationBuilder.DropTable(
                name: "Tbl_LoanRepayments");

            migrationBuilder.DropTable(
                name: "tbl_MonthlySalaryComponentDetail");

            migrationBuilder.DropTable(
                name: "Tbl_Notifications");

            migrationBuilder.DropTable(
                name: "tbl_OutdoorDuty");

            migrationBuilder.DropTable(
                name: "tbl_Payslip");

            migrationBuilder.DropTable(
                name: "tbl_ProfessionalTaxSlab");

            migrationBuilder.DropTable(
                name: "tbl_SalaryStructure");

            migrationBuilder.DropTable(
                name: "tbl_Shift");

            migrationBuilder.DropTable(
                name: "tbl_StatutorySetting");

            migrationBuilder.DropTable(
                name: "tbl_TaxSlabs");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "tbl_Advance");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDetail");

            migrationBuilder.DropTable(
                name: "tbl_ExpenseType");

            migrationBuilder.DropTable(
                name: "Tbl_Attendance");

            migrationBuilder.DropTable(
                name: "tbl_LeaveRequest");

            migrationBuilder.DropTable(
                name: "Tbl_LoanApplications");

            migrationBuilder.DropTable(
                name: "tbl_MonthlySalaryRecord");

            migrationBuilder.DropTable(
                name: "tbl_SalaryComponent");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTaxDeclaration");

            migrationBuilder.DropTable(
                name: "tbl_LeaveType");

            migrationBuilder.DropTable(
                name: "Tbl_LoanMasters");

            migrationBuilder.DropTable(
                name: "tbl_PayrollRun");

            migrationBuilder.DropTable(
                name: "tbl_Employee");

            migrationBuilder.DropTable(
                name: "tbl_Department");

            migrationBuilder.DropTable(
                name: "tbl_Designation");

            migrationBuilder.DropTable(
                name: "tbl_WorkLocation");
        }
    }
}
