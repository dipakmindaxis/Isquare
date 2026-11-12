using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class FinalSetu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bde_user_tbl_Employees_DirectorEmployeeId",
                table: "bde_user");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ActivityLog_tbl_Employees_UserId",
                table: "tbl_ActivityLog");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Call_tbl_Employees_CreatedBy",
                table: "tbl_Call");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Call_tbl_Employees_UserId",
                table: "tbl_Call");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CallAttachment_tbl_Employees_UploadedBy",
                table: "tbl_CallAttachment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyAddresses_tbl_Employees_CreatedBy",
                table: "tbl_CompanyAddresses");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyContacts_tbl_Employees_CreatedBy",
                table: "tbl_CompanyContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyDocument_tbl_Employees_UploadedBy",
                table: "tbl_CompanyDocument");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyEmailsLog_tbl_Employees_UserId",
                table: "tbl_CompanyEmailsLog");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyNote_tbl_Employees_UserId",
                table: "tbl_CompanyNote");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyPhones_tbl_Employees_CreatedBy",
                table: "tbl_CompanyPhones");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyVisit_tbl_Employees_UserId",
                table: "tbl_CompanyVisit");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeAddress_tbl_Employees_EmployeesID",
                table: "tbl_EmployeeAddress");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeExperience_tbl_Employees_EmployeesID",
                table: "tbl_EmployeeExperience");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeQualification_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeQualification");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeTDSDetails_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeTDSDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_FollowUp_tbl_Employees_UserId",
                table: "tbl_FollowUp");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Invoice_tbl_Employees_CreatedBy",
                table: "tbl_Invoice");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Invoice_tbl_Employees_UpdatedBy",
                table: "tbl_Invoice");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_CreatedBy",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_UpdatedBy",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_UserId",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Reminder_tbl_Employees_AssignedTo",
                table: "tbl_Reminder");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Reminder_tbl_Employees_CreatedBy",
                table: "tbl_Reminder");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ReminderHistory_tbl_Employees_UpdatedBy",
                table: "tbl_ReminderHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ReminderNotification_tbl_Employees_SentBy",
                table: "tbl_ReminderNotification");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employees_AssignedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employees_AssignedTo",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employees_CreatedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employees_UpdatedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employees_AssignedBy",
                table: "tbl_TaskAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employees_AssignedTo",
                table: "tbl_TaskAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_AssignedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_AssignedTo",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_CreatedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_UpdatedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAttachment_tbl_Employees_UploadedBy",
                table: "tbl_TaskAttachment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskComment_tbl_Employees_CommentedBy",
                table: "tbl_TaskComment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskHistory_tbl_Employees_PerformedBy",
                table: "tbl_TaskHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employees_CreatedBy",
                table: "tbl_TaskReminderMapping");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employees_UpdatedBy",
                table: "tbl_TaskReminderMapping");

            migrationBuilder.DropTable(
                name: "tbl_Director");

            migrationBuilder.DropTable(
                name: "tbl_Employees");

            migrationBuilder.DropIndex(
                name: "IX_tbl_EmployeeExperience_EmployeesID",
                table: "tbl_EmployeeExperience");

            migrationBuilder.DropIndex(
                name: "IX_tbl_EmployeeAddress_EmployeesID",
                table: "tbl_EmployeeAddress");

            migrationBuilder.DropColumn(
                name: "EmployeesID",
                table: "tbl_EmployeeExperience");

            migrationBuilder.DropColumn(
                name: "EmployeesID",
                table: "tbl_EmployeeAddress");

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

            migrationBuilder.AddColumn<string>(
                name: "DiscussionNotesMOM",
                table: "tbl_ActivityType",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectPurpose",
                table: "tbl_ActivityType",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeExperience_EmployeeID",
                table: "tbl_EmployeeExperience",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_EmployeeID",
                table: "tbl_EmployeeAddress",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee",
                column: "LevelID");

            migrationBuilder.AddForeignKey(
                name: "FK_bde_user_tbl_Employee_DirectorEmployeeId",
                table: "bde_user",
                column: "DirectorEmployeeId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ActivityLog_tbl_Employee_UserId",
                table: "tbl_ActivityLog",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Call_tbl_Employee_CreatedBy",
                table: "tbl_Call",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Call_tbl_Employee_UserId",
                table: "tbl_Call",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CallAttachment_tbl_Employee_UploadedBy",
                table: "tbl_CallAttachment",
                column: "UploadedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyAddresses_tbl_Employee_CreatedBy",
                table: "tbl_CompanyAddresses",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyContacts_tbl_Employee_CreatedBy",
                table: "tbl_CompanyContacts",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyDocument_tbl_Employee_UploadedBy",
                table: "tbl_CompanyDocument",
                column: "UploadedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyEmailsLog_tbl_Employee_UserId",
                table: "tbl_CompanyEmailsLog",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyNote_tbl_Employee_UserId",
                table: "tbl_CompanyNote",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyPhones_tbl_Employee_CreatedBy",
                table: "tbl_CompanyPhones",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyVisit_tbl_Employee_UserId",
                table: "tbl_CompanyVisit",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                table: "tbl_Employee",
                column: "LevelID",
                principalTable: "tbl_LevelMasters",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeAddress_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeAddress",
                column: "EmployeeID",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeExperience_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeExperience",
                column: "EmployeeID",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeQualification_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeQualification",
                column: "EmployeeID",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails",
                column: "EmployeeID",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeTDSDetails_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeTDSDetails",
                column: "EmployeeID",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_FollowUp_tbl_Employee_UserId",
                table: "tbl_FollowUp",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Invoice_tbl_Employee_CreatedBy",
                table: "tbl_Invoice",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Invoice_tbl_Employee_UpdatedBy",
                table: "tbl_Invoice",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_CreatedBy",
                table: "tbl_Meeting",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_UpdatedBy",
                table: "tbl_Meeting",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_UserId",
                table: "tbl_Meeting",
                column: "UserId",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Reminder_tbl_Employee_AssignedTo",
                table: "tbl_Reminder",
                column: "AssignedTo",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Reminder_tbl_Employee_CreatedBy",
                table: "tbl_Reminder",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ReminderHistory_tbl_Employee_UpdatedBy",
                table: "tbl_ReminderHistory",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ReminderNotification_tbl_Employee_SentBy",
                table: "tbl_ReminderNotification",
                column: "SentBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employee_AssignedBy",
                table: "tbl_Task",
                column: "AssignedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employee_AssignedTo",
                table: "tbl_Task",
                column: "AssignedTo",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employee_CreatedBy",
                table: "tbl_Task",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employee_UpdatedBy",
                table: "tbl_Task",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedBy",
                table: "tbl_TaskAssignment",
                column: "AssignedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedTo",
                table: "tbl_TaskAssignment",
                column: "AssignedTo",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedBy",
                table: "tbl_TaskAssignments",
                column: "AssignedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedTo",
                table: "tbl_TaskAssignments",
                column: "AssignedTo",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_CreatedBy",
                table: "tbl_TaskAssignments",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_UpdatedBy",
                table: "tbl_TaskAssignments",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAttachment_tbl_Employee_UploadedBy",
                table: "tbl_TaskAttachment",
                column: "UploadedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskComment_tbl_Employee_CommentedBy",
                table: "tbl_TaskComment",
                column: "CommentedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskHistory_tbl_Employee_PerformedBy",
                table: "tbl_TaskHistory",
                column: "PerformedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employee_CreatedBy",
                table: "tbl_TaskReminderMapping",
                column: "CreatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employee_UpdatedBy",
                table: "tbl_TaskReminderMapping",
                column: "UpdatedBy",
                principalTable: "tbl_Employee",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bde_user_tbl_Employee_DirectorEmployeeId",
                table: "bde_user");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ActivityLog_tbl_Employee_UserId",
                table: "tbl_ActivityLog");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Call_tbl_Employee_CreatedBy",
                table: "tbl_Call");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Call_tbl_Employee_UserId",
                table: "tbl_Call");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CallAttachment_tbl_Employee_UploadedBy",
                table: "tbl_CallAttachment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyAddresses_tbl_Employee_CreatedBy",
                table: "tbl_CompanyAddresses");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyContacts_tbl_Employee_CreatedBy",
                table: "tbl_CompanyContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyDocument_tbl_Employee_UploadedBy",
                table: "tbl_CompanyDocument");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyEmailsLog_tbl_Employee_UserId",
                table: "tbl_CompanyEmailsLog");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyNote_tbl_Employee_UserId",
                table: "tbl_CompanyNote");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyPhones_tbl_Employee_CreatedBy",
                table: "tbl_CompanyPhones");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_CompanyVisit_tbl_Employee_UserId",
                table: "tbl_CompanyVisit");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                table: "tbl_Employee");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeAddress_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeAddress");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeExperience_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeExperience");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeQualification_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeQualification");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_EmployeeTDSDetails_tbl_Employee_EmployeeID",
                table: "tbl_EmployeeTDSDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_FollowUp_tbl_Employee_UserId",
                table: "tbl_FollowUp");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Invoice_tbl_Employee_CreatedBy",
                table: "tbl_Invoice");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Invoice_tbl_Employee_UpdatedBy",
                table: "tbl_Invoice");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_CreatedBy",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_UpdatedBy",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Meeting_tbl_Employee_UserId",
                table: "tbl_Meeting");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Reminder_tbl_Employee_AssignedTo",
                table: "tbl_Reminder");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Reminder_tbl_Employee_CreatedBy",
                table: "tbl_Reminder");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ReminderHistory_tbl_Employee_UpdatedBy",
                table: "tbl_ReminderHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_ReminderNotification_tbl_Employee_SentBy",
                table: "tbl_ReminderNotification");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employee_AssignedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employee_AssignedTo",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employee_CreatedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Task_tbl_Employee_UpdatedBy",
                table: "tbl_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedBy",
                table: "tbl_TaskAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employee_AssignedTo",
                table: "tbl_TaskAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_AssignedTo",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_CreatedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employee_UpdatedBy",
                table: "tbl_TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskAttachment_tbl_Employee_UploadedBy",
                table: "tbl_TaskAttachment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskComment_tbl_Employee_CommentedBy",
                table: "tbl_TaskComment");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskHistory_tbl_Employee_PerformedBy",
                table: "tbl_TaskHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employee_CreatedBy",
                table: "tbl_TaskReminderMapping");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employee_UpdatedBy",
                table: "tbl_TaskReminderMapping");

            migrationBuilder.DropIndex(
                name: "IX_tbl_EmployeeExperience_EmployeeID",
                table: "tbl_EmployeeExperience");

            migrationBuilder.DropIndex(
                name: "IX_tbl_EmployeeAddress_EmployeeID",
                table: "tbl_EmployeeAddress");

            migrationBuilder.DropIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee");

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
                name: "DiscussionNotesMOM",
                table: "tbl_ActivityType");

            migrationBuilder.DropColumn(
                name: "SubjectPurpose",
                table: "tbl_ActivityType");

            migrationBuilder.AddColumn<int>(
                name: "EmployeesID",
                table: "tbl_EmployeeExperience",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeesID",
                table: "tbl_EmployeeAddress",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "tbl_Director",
                columns: table => new
                {
                    DirectorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DirectorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DirectorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Director", x => x.DirectorId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Employees",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    DesignationID = table.Column<int>(type: "int", nullable: true),
                    LevelID = table.Column<int>(type: "int", nullable: true),
                    ReportingTo = table.Column<int>(type: "int", nullable: true),
                    WorkLocationID = table.Column<int>(type: "int", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateOfJoining = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateOfLeaving = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GoogleCalendarId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhotoPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PresentAddress = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Employees", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Employees_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tbl_Employees_tbl_Department_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "tbl_Department",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employees_tbl_Designation_DesignationID",
                        column: x => x.DesignationID,
                        principalTable: "tbl_Designation",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employees_tbl_Employees_ReportingTo",
                        column: x => x.ReportingTo,
                        principalTable: "tbl_Employees",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employees_tbl_LevelMasters_LevelID",
                        column: x => x.LevelID,
                        principalTable: "tbl_LevelMasters",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employees_tbl_WorkLocation_WorkLocationID",
                        column: x => x.WorkLocationID,
                        principalTable: "tbl_WorkLocation",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeExperience_EmployeesID",
                table: "tbl_EmployeeExperience",
                column: "EmployeesID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_EmployeesID",
                table: "tbl_EmployeeAddress",
                column: "EmployeesID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_ApplicationUserId",
                table: "tbl_Employees",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_DepartmentID",
                table: "tbl_Employees",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_DesignationID",
                table: "tbl_Employees",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_LevelID",
                table: "tbl_Employees",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_ReportingTo",
                table: "tbl_Employees",
                column: "ReportingTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employees_WorkLocationID",
                table: "tbl_Employees",
                column: "WorkLocationID");

            migrationBuilder.AddForeignKey(
                name: "FK_bde_user_tbl_Employees_DirectorEmployeeId",
                table: "bde_user",
                column: "DirectorEmployeeId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ActivityLog_tbl_Employees_UserId",
                table: "tbl_ActivityLog",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Call_tbl_Employees_CreatedBy",
                table: "tbl_Call",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Call_tbl_Employees_UserId",
                table: "tbl_Call",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CallAttachment_tbl_Employees_UploadedBy",
                table: "tbl_CallAttachment",
                column: "UploadedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyAddresses_tbl_Employees_CreatedBy",
                table: "tbl_CompanyAddresses",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyContacts_tbl_Employees_CreatedBy",
                table: "tbl_CompanyContacts",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyDocument_tbl_Employees_UploadedBy",
                table: "tbl_CompanyDocument",
                column: "UploadedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyEmailsLog_tbl_Employees_UserId",
                table: "tbl_CompanyEmailsLog",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyNote_tbl_Employees_UserId",
                table: "tbl_CompanyNote",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyPhones_tbl_Employees_CreatedBy",
                table: "tbl_CompanyPhones",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_CompanyVisit_tbl_Employees_UserId",
                table: "tbl_CompanyVisit",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeAddress_tbl_Employees_EmployeesID",
                table: "tbl_EmployeeAddress",
                column: "EmployeesID",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeExperience_tbl_Employees_EmployeesID",
                table: "tbl_EmployeeExperience",
                column: "EmployeesID",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeQualification_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeQualification",
                column: "EmployeeID",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails",
                column: "EmployeeID",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_EmployeeTDSDetails_tbl_Employees_EmployeeID",
                table: "tbl_EmployeeTDSDetails",
                column: "EmployeeID",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_FollowUp_tbl_Employees_UserId",
                table: "tbl_FollowUp",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Invoice_tbl_Employees_CreatedBy",
                table: "tbl_Invoice",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Invoice_tbl_Employees_UpdatedBy",
                table: "tbl_Invoice",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_CreatedBy",
                table: "tbl_Meeting",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_UpdatedBy",
                table: "tbl_Meeting",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Meeting_tbl_Employees_UserId",
                table: "tbl_Meeting",
                column: "UserId",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Reminder_tbl_Employees_AssignedTo",
                table: "tbl_Reminder",
                column: "AssignedTo",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Reminder_tbl_Employees_CreatedBy",
                table: "tbl_Reminder",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ReminderHistory_tbl_Employees_UpdatedBy",
                table: "tbl_ReminderHistory",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_ReminderNotification_tbl_Employees_SentBy",
                table: "tbl_ReminderNotification",
                column: "SentBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employees_AssignedBy",
                table: "tbl_Task",
                column: "AssignedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employees_AssignedTo",
                table: "tbl_Task",
                column: "AssignedTo",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employees_CreatedBy",
                table: "tbl_Task",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Task_tbl_Employees_UpdatedBy",
                table: "tbl_Task",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employees_AssignedBy",
                table: "tbl_TaskAssignment",
                column: "AssignedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignment_tbl_Employees_AssignedTo",
                table: "tbl_TaskAssignment",
                column: "AssignedTo",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_AssignedBy",
                table: "tbl_TaskAssignments",
                column: "AssignedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_AssignedTo",
                table: "tbl_TaskAssignments",
                column: "AssignedTo",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_CreatedBy",
                table: "tbl_TaskAssignments",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAssignments_tbl_Employees_UpdatedBy",
                table: "tbl_TaskAssignments",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskAttachment_tbl_Employees_UploadedBy",
                table: "tbl_TaskAttachment",
                column: "UploadedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskComment_tbl_Employees_CommentedBy",
                table: "tbl_TaskComment",
                column: "CommentedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskHistory_tbl_Employees_PerformedBy",
                table: "tbl_TaskHistory",
                column: "PerformedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employees_CreatedBy",
                table: "tbl_TaskReminderMapping",
                column: "CreatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_TaskReminderMapping_tbl_Employees_UpdatedBy",
                table: "tbl_TaskReminderMapping",
                column: "UpdatedBy",
                principalTable: "tbl_Employees",
                principalColumn: "ID");
        }
    }
}
