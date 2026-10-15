using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class Customermodels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tbl_customer",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    customer_group = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    customer_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    customer_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    customer_short_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    branch = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    vendor_code = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    plant_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    flat_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    premises_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    road_lane = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    area_locality = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    town = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    district = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    pin_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    state = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_designation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    res_person_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    res_person_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    res_person_alt_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_flat_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    alt_premises_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_road_lane = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_area_locality = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_town = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_district = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    alt_pin_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    alt_state = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    alt_country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    alt_mobile_no_2 = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    alt_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    alt_email_address_2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    alt_alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_res_person_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    per_res_person_designation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    per_alt_mobile_no = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    per_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    per_alt_email_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    company_pan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    company_tan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    gst_no = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    cin_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    msme_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    doc_attachment = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    permanent_address_check = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    delete_status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_customer", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tbl_customer");
        }
    }
}
