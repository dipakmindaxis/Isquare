using System;
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
            migrationBuilder.DropTable(
                name: "SalarySettingPercentage");

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
                name: "tbl_customer");

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
                name: "tbl_StatutorySetting");

            migrationBuilder.DropTable(
                name: "tbl_TaxSlabs");

            migrationBuilder.DropTable(
                name: "tbl_Advance");

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
                name: "tbl_LeaveType");

            migrationBuilder.DropTable(
                name: "Tbl_LoanMasters");

            migrationBuilder.DropTable(
                name: "tbl_PayrollRun");

            migrationBuilder.DropColumn(
                name: "BeneficiaryName",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.AddColumn<string>(
                name: "PassportNumber",
                table: "tbl_EmployeeStatutoryDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountHolderName",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAddress",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IBANNo",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SortCode",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SwiftCode",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarId",
                table: "tbl_Employee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LevelID",
                table: "tbl_Employee",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "tbl_Employee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Tbl_AccessControls",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SystemName",
                table: "Tbl_AccessControls",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

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
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_EmployeeID",
                table: "tbl_EmployeeAddress",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeExperience_EmployeeID",
                table: "tbl_EmployeeExperience",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeQualification_EmployeeID",
                table: "tbl_EmployeeQualification",
                column: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                table: "tbl_Employee",
                column: "LevelID",
                principalTable: "tbl_LevelMasters",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                table: "tbl_Employee");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeAddress");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeExperience");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeQualification");

            migrationBuilder.DropTable(
                name: "tbl_LevelMasters");

            migrationBuilder.DropIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee");

            migrationBuilder.DropColumn(
                name: "PassportNumber",
                table: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropColumn(
                name: "AccountHolderName",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.DropColumn(
                name: "BankAddress",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.DropColumn(
                name: "IBANNo",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.DropColumn(
                name: "SortCode",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.DropColumn(
                name: "SwiftCode",
                table: "tbl_EmployeeBankDetails");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarId",
                table: "tbl_Employee");

            migrationBuilder.DropColumn(
                name: "LevelID",
                table: "tbl_Employee");

            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "tbl_Employee");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Tbl_AccessControls");

            migrationBuilder.DropColumn(
                name: "SystemName",
                table: "Tbl_AccessControls");

            migrationBuilder.AddColumn<string>(
                name: "BeneficiaryName",
                table: "tbl_EmployeeBankDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SalarySettingPercentage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CalculationBase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FixedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsApplicable = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalarySettingPercentage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Advance",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ProcessedByEmployeeId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StatusDate = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                name: "Tbl_Attendance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
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
                    AppliedRule = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EligibleSalaryForCalculation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenureInDays = table.Column<int>(type: "int", nullable: false)
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
                name: "tbl_CompanyProfile",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CittdsAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryDesignation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TAN = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Year = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ComplianceFilingStatus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_customer",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    alt_alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    alt_area_locality = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    alt_district = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_email_address_2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_flat_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    alt_mobile_no_2 = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    alt_pin_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    alt_premises_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_road_lane = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_state = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    alt_town = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    area_locality = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    branch = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    cin_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    company_pan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    company_tan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    customer_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    customer_group = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    customer_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    customer_short_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    district = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    doc_attachment = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    flat_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    gst_no = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    delete_status = table.Column<bool>(type: "bit", nullable: false),
                    mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    msme_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    per_alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    per_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    per_res_person_designation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_res_person_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    permanent_address_check = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    pin_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    plant_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    premises_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_alt_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    res_person_designation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    res_person_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    road_lane = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    state = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    town = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    vendor_code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_customer", x => x.id);
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
                name: "tbl_Form16Status",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CertificateNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FinalStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    GeneratedFormFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PartAFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartAStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PartBStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
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
                name: "tbl_Holiday",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false)
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LeaveTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LoanTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanMasters", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FromDate = table.Column<DateTime>(type: "date", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ToDate = table.Column<DateTime>(type: "date", nullable: false)
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
                name: "tbl_PayrollRun",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Month = table.Column<int>(type: "int", nullable: false),
                    ProcessedByUserID = table.Column<int>(type: "int", nullable: false),
                    ProcessedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false)
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
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    MaxGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MinGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsTaxable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalaryComponent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_StatutorySetting",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    SettingName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
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
                    CitizenType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FromAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RatePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TaxRegime = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ToAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaxSlabs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AdvanceRepayment",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdvanceID = table.Column<int>(type: "int", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RepaymentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "tbl_ExpenseClaim",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ExpenseTypeID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ClaimDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReceiptFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
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
                name: "tbl_LeaveRequest",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedByEmployeeID = table.Column<int>(type: "int", nullable: true),
                    Days = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HalfDayPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsHalfDay = table.Column<bool>(type: "bit", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ApprovedByUserID = table.Column<int>(type: "int", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LoanTypeID = table.Column<int>(type: "int", nullable: false),
                    ApplicationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoanAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenureInMonths = table.Column<int>(type: "int", nullable: false)
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
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    EmployerPF = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossEarnings = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LOPDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PayableDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReimbursableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalDaysInMonth = table.Column<int>(type: "int", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
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
                name: "tbl_Payslip",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    Downloaded = table.Column<bool>(type: "bit", nullable: false),
                    EmailSent = table.Column<bool>(type: "bit", nullable: false),
                    GeneratedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PdfFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
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
                name: "tbl_LeaveCreditLedger",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceID = table.Column<int>(type: "int", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveRequestID = table.Column<int>(type: "int", nullable: true),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    Credit = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EarnedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
    }
}
