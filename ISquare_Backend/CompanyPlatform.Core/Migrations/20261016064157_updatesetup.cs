using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class updatesetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Baseline migration:
            // All existing tables, including AspNetRoles and other entities, are already present
            // in the database. Leaving Up() empty allows EF Core to register this migration in
            // __EFMigrationsHistory upon Update-Database without attempting to recreate existing objects.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
