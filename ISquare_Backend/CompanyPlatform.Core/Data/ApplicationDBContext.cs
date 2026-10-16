using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.AddressType;
using CompanyPlatform.Core.Models.CRM.Call;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.CustomerArea;
using CompanyPlatform.Core.Models.CRM.CustomerSource;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Models.CRM.Notification;
using CompanyPlatform.Core.Models.CRM.PaymentTerm;
using CompanyPlatform.Core.Models.HRMS;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace CompanyPlatform.Core.Data
{
    public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDBContext(
            DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {
        }


        //pa
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceType> InvoiceTypes { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<InvoicePayment> InvoicePayments { get; set; }

        public DbSet<NonGSTProforma> NonGSTProformas { get; set; }
        public DbSet<NonGSTProformaItem> NonGSTProformaItems { get; set; }
        public DbSet<NonGSTInvoice> NonGSTInvoices { get; set; }
        public DbSet<NonGSTInvoiceItem> NonGSTInvoiceItems { get; set; }


        public DbSet<ProformaInvoice> ProformaInvoices { get; set; }
        public DbSet<ProformaInvoiceItem> ProformaInvoiceItems { get; set; }

        //vi
        public DbSet<SalesAttachment> SalesAttachments { get; set; }
        public DbSet<AddressType> AddressTypes { get; set; }
        public DbSet<PaymentTerm> PaymentTerms { get; set; }
        public DbSet<CustomerArea> CustomerAreas { get; set; }
        public DbSet<CustomerSource> CustomerSources { get; set; }
        public DbSet<Priority> Tbl_Priorities { get; set; }
        public DbSet<ReminderStatus> ReminderStatuses { get; set; }
        public DbSet<Reminder> Reminders { get; set; }
        public DbSet<ReminderNotification> ReminderNotifications { get; set; }
        public DbSet<MeetingAttachments> MeetingAttachments { get; set; }
        public DbSet<MeetingAttendee> MeetingAttendees { get; set; }
        public DbSet<MeetingType> MeetingTypes { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<VisitType> VisitTypes { get; set; }
        public DbSet<VisitAttachment> VisitAttachments { get; set; }
        public DbSet<ReminderHistory> ReminderHistories { get; set; }
        public DbSet<History> Histories { get; set; }
        public DbSet<FollowUp> FollowUps { get; set; }
        public DbSet<DocumentType> DocumentTypes { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }

        //Deepak

        public DbSet<CompanyPlatform.Core.Models.CRM.Company.Company> Companies { get; set; }
        public DbSet<CompanyPlatform.Core.Models.CRM.Company.Company> Customers => Companies;
        public DbSet<CustomerCategory> CustomerCategories { get; set; }
        public DbSet<CustomerTypes> Tbl_customerTypes { get; set; }
        public DbSet<ClientType> ClientTypes { get; set; }
        public DbSet<CustomerStatus> CompanyStatuses { get; set; }
        public DbSet<CompanyNote> CompanyNotes { get; set; }
        public DbSet<CompanyEmail> CompanyEmails { get; set; }
        public DbSet<CompanyAddress> CompanyAddresses { get; set; }
        public DbSet<CompanyContact> CompanyContacts { get; set; }
        public DbSet<CompanyPhone> CompanyPhones { get; set; }
        public DbSet<CompanyVisit> Tbl_CompanyVisit { get; set; }
        public DbSet<CompanyVisit> CompanyVisits { get; set; }
        public DbSet<CompanyEmailsLog> CompanyEmailsLogs { get; set; }
        public DbSet<CompanyTimeline> CompanyTimelines { get; set; }
        public DbSet<CompanyDocument> CompanyDocuments { get; set; }
        public DbSet<Industry> Industries { get; set; }

        public DbSet<Country> Tbl_Countries { get; set; }
        public DbSet<State> Tbl_States { get; set; }
        public DbSet<City> Tbl_Cities { get; set; }


        public DbSet<CallType> CallTypes { get; set; }
        public DbSet<Call> Calls { get; set; }

        // SM
        //Add ContactType to ApplicationDBContext
        public DbSet<ContactType> ContactTypes { get; set; }
        public DbSet<SalesUserManager> SalesUserManagers { get; set; }
        public DbSet<BDEUser> BDEUsers { get; set; }



        public DbSet<CallHistory> CallHistories { get; set; }
        public DbSet<CallAttachment> CallAttachments { get; set; }
        // Employee

        public DbSet<Employees> Employees { get; set; }

        public DbSet<WorkLocation> WorkLocations { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<Designation> Designations { get; set; }

        public DbSet<EmployeeBankDetails> EmployeeBankDetails { get; set; }

        public DbSet<EmployeePFDetails> EmployeePFDetails { get; set; }

        public DbSet<EmployeeTDSDetails> EmployeeTDSDetails { get; set; }

        public DbSet<EmployeeStatutoryDetails>
            Tb_EmployeeStatutoryDetails
        { get; set; }

        public DbSet<EmployeeDocument>
            Tb_EmployeeDocuments
        { get; set; }

        public DbSet<Shift>
            Tb_Shifts
        { get; set; }


        // Access Control
        public DbSet<AccessControl>
            Tbl_AccessControls
        { get; set; }


        // Salary
        public DbSet<EmployeeSalarySummary>
            Tb_EmployeeSalarySummaries
        { get; set; }

        public DbSet<EmployeeTaxDeclaration>
            Tbl_EmployeeTaxDeclarations
        { get; set; }

        public DbSet<EmployeeDeclarationDetail>
            EmployeeDeclarationDetails
        { get; set; }

        public DbSet<EmployeeDeclarationDocument>
            Tbl_EmployeeDeclarationDocuments
        { get; set; }

        public DbSet<EmployeeQualification>
            Tbl_EmployeeQualifications
        { get; set; }

        public DbSet<EmployeeExperience>
            Tbl_EmployeeExperiences
        { get; set; }

        public DbSet<EmployeeAddress>
            Tbl_EmployeeAddresses
        { get; set; }


        // HRMS
        public DbSet<LevelMaster>
            Tbl_LevelMasters
        { get; set; }


        // Notifications
        public DbSet<Notifications>
            Tbl_Notifications
        { get; set; }

        public DbSet<NotificationQueue>
            NotificationQueues
        { get; set; }

        public DbSet<NotificationLogs>
            NotificationLogs
        { get; set; }


        // Asset
        public DbSet<AssetMaster>
            Tbl_AssetMasters
        { get; set; }


        // Activity
        public DbSet<ActivityType>
            ActivityTypes
        { get; set; }

        public DbSet<ActivityLog>
            ActivityLogs
        { get; set; }

        // Task Module and Related Entities
        //public DbSet<CompanyPlatform.Core.Models.CRM.Company.Company> Companies { get; set; }
        public DbSet<Priority> Priorities { get; set; }
        //public DbSet<Reminder> Reminders { get; set; }
        public DbSet<CompanyPlatform.Core.Models.CRM.Company.TaskStatus> TaskStatuses { get; set; }
        public DbSet<Tasks> Tasks { get; set; }
        public DbSet<TaskAssignment> TaskAssignment { get; set; }
        public DbSet<TaskAssignments> TaskAssignments { get; set; }
        public DbSet<TaskAttachment> TaskAttachments { get; set; }
        public DbSet<TaskChecklist> TaskChecklists { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; }
        public DbSet<TaskReminderMapping> TaskReminderMappings { get; set; }
        public DbSet<Product> Products { get; set; }

        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<QuotationItem> QuotationItems { get; set; }
        public DbSet<QuotationDefault> QuotationDefaults { get; set; }
        public DbSet<CompanyProfile> CompanyProfiles { get; set; }
        public DbSet<QuotationApproval> QuotationApprovals { get; set; }
        public DbSet<QuotationRevision> QuotationRevisions { get; set; }

        public DbSet<QuotationCharge> QuotationCharges { get; set; }

        public DbSet<SalesOrder> SalesOrders { get; set; }
        public DbSet<SalesOrderItem> SalesOrderItems { get; set; }

        public DbSet<Companiess> Companiess { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        // Audit
        public DbSet<AuditLog>
            AuditLogs
        { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);


            builder.Entity<Reminder>()
            .HasOne(r => r.AssignedEmployee)
            .WithMany()
            .HasForeignKey(r => r.AssignedTo)
            .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Reminder>()
                .HasOne(r => r.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(r => r.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<ReminderHistory>()
    .HasOne(rh => rh.Reminder)
    .WithMany()
    .HasForeignKey(rh => rh.ReminderId)
    .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<ReminderHistory>()
                .HasOne(rh => rh.ReminderStatus)
                .WithMany()
                .HasForeignKey(rh => rh.ReminderStatusId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<ReminderHistory>()
                .HasOne(rh => rh.UpdatedByEmployee)
                .WithMany()
                .HasForeignKey(rh => rh.UpdatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            //add
            builder.Entity<Meeting>()
    .HasOne(m => m.User)
    .WithMany()
    .HasForeignKey(m => m.UserId)
    .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Meeting>()
                .HasOne(m => m.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(m => m.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Meeting>()
                .HasOne(m => m.UpdatedByEmployee)
                .WithMany()
                .HasForeignKey(m => m.UpdatedBy)
                .OnDelete(DeleteBehavior.NoAction);



            // ApplicationUser - Employee
            builder.Entity<ApplicationUser>()
                .HasOne(a => a.Employee)
                .WithOne(e => e.ApplicationUser)
                .HasForeignKey<ApplicationUser>(a => a.EmployeeId)
                .IsRequired();


            // Employee Statutory Details - Employee
            builder.Entity<EmployeeStatutoryDetails>()
                .HasOne(s => s.Employee)
                .WithMany()
                .HasForeignKey(s => s.EmployeeID)
                .OnDelete(DeleteBehavior.Cascade);

            // Reminder - CreatedBy Employee (NoAction to prevent multiple cascade paths in SQL Server)
            builder.Entity<Reminder>()
                .HasOne(r => r.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(r => r.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // Tasks - Employee foreign keys (NoAction to prevent multiple cascade paths in SQL Server)
            builder.Entity<Tasks>()
                .HasOne(t => t.AssignedByEmployee)
                .WithMany()
                .HasForeignKey(t => t.AssignedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Tasks>()
                .HasOne(t => t.AssignedToEmployee)
                .WithMany()
                .HasForeignKey(t => t.AssignedTo)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Tasks>()
                .HasOne(t => t.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(t => t.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Tasks>()
                .HasOne(t => t.UpdatedByEmployee)
                .WithMany()
                .HasForeignKey(t => t.UpdatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskAssignment - Employee foreign keys
            builder.Entity<TaskAssignment>()
                .HasOne(ta => ta.AssignedToEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.AssignedTo)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskAssignment>()
                .HasOne(ta => ta.AssignedByEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.AssignedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskAssignments - Employee foreign keys
            builder.Entity<TaskAssignments>()
                .HasOne(ta => ta.AssignedToEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.AssignedTo)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskAssignments>()
                .HasOne(ta => ta.AssignedByEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.AssignedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskAssignments>()
                .HasOne(ta => ta.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskAssignments>()
                .HasOne(ta => ta.UpdatedByEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.UpdatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskAttachment - Employee foreign key
            builder.Entity<TaskAttachment>()
                .HasOne(ta => ta.UploadedByEmployee)
                .WithMany()
                .HasForeignKey(ta => ta.UploadedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskComment - Employee foreign key
            builder.Entity<TaskComment>()
                .HasOne(tc => tc.CommentedByEmployee)
                .WithMany()
                .HasForeignKey(tc => tc.CommentedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskHistory - Employee foreign key
            builder.Entity<TaskHistory>()
                .HasOne(th => th.PerformedByEmployee)
                .WithMany()
                .HasForeignKey(th => th.PerformedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // TaskReminderMapping - Reminder and Employee foreign keys
            builder.Entity<TaskReminderMapping>()
                .HasOne(trm => trm.Reminder)
                .WithMany()
                .HasForeignKey(trm => trm.ReminderId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskReminderMapping>()
                .HasOne(trm => trm.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(trm => trm.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<TaskReminderMapping>()
                .HasOne(trm => trm.UpdatedByEmployee)
                .WithMany()
                .HasForeignKey(trm => trm.UpdatedBy)
                .OnDelete(DeleteBehavior.NoAction);


            //d

            builder.Entity<CompanyAddress>()
     .HasOne(a => a.Country)
     .WithMany()
     .HasForeignKey(a => a.CountryId)
     .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CompanyAddress>()
                .HasOne(a => a.State)
                .WithMany()
                .HasForeignKey(a => a.StateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CompanyAddress>()
                .HasOne(a => a.City)
                .WithMany()
                .HasForeignKey(a => a.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CompanyAddress>()
                .HasOne(a => a.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(a => a.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CompanyPlatform.Core.Models.CRM.Company.Company>()
                .HasOne(c => c.Director)
                .WithMany()
                .HasForeignKey(c => c.DirectorId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyPlatform.Core.Models.CRM.Company.Company>()
                .HasOne(c => c.SalesCoordinator)
                .WithMany()
                .HasForeignKey(c => c.SalesCoordinatorId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyPlatform.Core.Models.CRM.Company.Company>()
                .HasOne(c => c.CustomerOwner)
                .WithMany()
                .HasForeignKey(c => c.CustomerOwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyPlatform.Core.Models.CRM.Company.Company>()
                .Property(c => c.CompanyCode)
                .HasMaxLength(50)
                .IsRequired();

            builder.Entity<CompanyPlatform.Core.Models.CRM.Company.Company>()
                .HasIndex(c => c.CompanyCode)
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

            // ??? Call Module ?????????????????????????????????????????
            builder.Entity<Call>()
                .HasOne(c => c.Company).WithMany()
                .HasForeignKey(c => c.CompanyId).OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Call>()
                .HasOne(c => c.CallType).WithMany()
                .HasForeignKey(c => c.CallTypeId).OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Call>()
                .HasOne(c => c.User).WithMany()
                .HasForeignKey(c => c.UserId)
                .HasPrincipalKey(e => e.ID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Call>()
                .HasOne(c => c.CreatedByEmployee).WithMany()
                .HasForeignKey(c => c.CreatedBy).OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CallHistory>()
                .HasOne(ch => ch.Call).WithMany()
                .HasForeignKey(ch => ch.CallId).OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CallAttachment>()
                .HasOne(ca => ca.Call).WithMany()
                .HasForeignKey(ca => ca.CallId).OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CallAttachment>()
                .HasOne(ca => ca.UploadedByEmployee).WithMany()
                .HasForeignKey(ca => ca.UploadedBy).OnDelete(DeleteBehavior.NoAction);

            // ??? CRM Custom Foreign Keys Mappings (Conflict-Free Group) ???
            builder.Entity<CompanyNote>()
                .HasOne(cn => cn.Company)
                .WithMany()
                .HasForeignKey(cn => cn.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyNote>()
                .HasOne(cn => cn.User)
                .WithMany()
                .HasForeignKey(cn => cn.UserId)
                .HasPrincipalKey(e => e.ID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyEmail>()
                .HasOne(ce => ce.Company)
                .WithMany()
                .HasForeignKey(ce => ce.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyEmailsLog>()
                .HasOne(cel => cel.Company)
                .WithMany()
                .HasForeignKey(cel => cel.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyEmailsLog>()
                .HasOne(cel => cel.User)
                .WithMany()
                .HasForeignKey(cel => cel.UserId)
                .HasPrincipalKey(e => e.ID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyVisit>()
                .HasOne(cv => cv.Company)
                .WithMany()
                .HasForeignKey(cv => cv.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyVisit>()
                .HasOne(cv => cv.User)
                .WithMany()
                .HasForeignKey(cv => cv.UserId)
                .HasPrincipalKey(e => e.ID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyDocument>()
                .HasOne(cd => cd.Company)
                .WithMany()
                .HasForeignKey(cd => cd.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyDocument>()
                .HasOne(cd => cd.UploadedByEmployee)
                .WithMany()
                .HasForeignKey(cd => cd.UploadedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyContact>()
                .HasOne(cc => cc.Designation)
                .WithMany()
                .HasForeignKey(cc => cc.DesignationId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyContact>()
                .HasOne(cc => cc.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(cc => cc.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<CompanyPhone>()
                .HasOne(cp => cp.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(cp => cp.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}



//ss
//// Add this line at the top of ApplicationDBContext.cs

//using CompanyPlatform.Core.Models;
//using CompanyPlatform.Core.Models.CRM;
//using CompanyPlatform.Core.Models.CRM.Employee;
//using CompanyPlatform.Core.Models.HRMS;
//using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore;
//using System.Reflection.Emit;
//using CompanyPlatform.Core.Models.CRM.Notification;
//using CompanyPlatform.Core.Models.CRM.Company;


//namespace CompanyPlatform.Core.Data
//{
//    // CHANGE THIS LINE
//    public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
//    {
//        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
//        { }

//        //public DbSet<Employee> Employees { get; set; }

//         public DbSet<Employees> Employees { get; set; }
//        public DbSet<WorkLocation> WorkLocations { get; set; }
//        public DbSet<Department> Departments { get; set; }
//        public DbSet<Designation> Designations { get; set; }
//        public DbSet<EmployeeBankDetails> EmployeeBankDetails { get; set; }
//        public DbSet<EmployeePFDetails> EmployeePFDetails { get; set; }
//        public DbSet<EmployeeTDSDetails> EmployeeTDSDetails { get; set; }
//        public DbSet<EmployeeStatutoryDetails> Tb_EmployeeStatutoryDetails { get; set; }
//        public DbSet<EmployeeDocument> Tb_EmployeeDocuments { get; set; }
//        public DbSet<Shift> Tb_Shifts { get; set; }
//        public DbSet<AccessControl> Tbl_AccessControls { get; set; }
//        //public DbSet<AccessControl> Tbl_AccessControls { get; set; }
//        public DbSet<EmployeeSalarySummary> Tb_EmployeeSalarySummaries { get; set; }
//        public DbSet<EmployeeTaxDeclaration> Tbl_EmployeeTaxDeclarations { get; set; }
//        public DbSet<EmployeeDeclarationDetail> EmployeeDeclarationDetails { get; set; }
//        public DbSet<EmployeeDeclarationDocument> Tbl_EmployeeDeclarationDocuments { get; set; }

//        public DbSet<EmployeeQualification> Tbl_EmployeeQualifications { get; set; }
//        public DbSet<EmployeeExperience> Tbl_EmployeeExperiences { get; set; }
//        public DbSet<EmployeeAddress> Tbl_EmployeeAddresses { get; set; }

//        public DbSet<LevelMaster> Tbl_LevelMasters { get; set; }
//        public DbSet<Notifications> Tbl_Notifications { get; set; }
//        public DbSet<NotificationQueue> NotificationQueues { get; set; }

//        //new 
//        public DbSet<AssetMaster> Tbl_AssetMasters { get; set; }

//        public DbSet<ActivityType> ActivityTypes { get; set; }

//        public DbSet<ActivityLog> ActivityLogs { get; set; }
//        public DbSet<AuditLog> AuditLogs { get; set; }


//        protected override void OnModelCreating(ModelBuilder builder)
//        {
//            base.OnModelCreating(builder);

//            builder.Entity<ApplicationUser>()
//                .HasOne(a => a.Employee)
//                .WithOne(e => e.ApplicationUser)
//                .HasForeignKey<ApplicationUser>(a => a.EmployeeId)
//                .IsRequired();


//            builder.Entity<EmployeeStatutoryDetails>()
//               .HasOne(s => s.Employee)
//               .WithMany()
//               .HasForeignKey(s => s.EmployeeID)
//               .OnDelete(DeleteBehavior.Cascade);

//        }
//    }

//}



//using CompanyPlatform.Core.Models;
//using CompanyPlatform.Core.Models.CRM.Company;
//using CompanyPlatform.Core.Models.CRM.Employee;
//using CompanyPlatform.Core.Models.CRM.Notification;
//using CompanyPlatform.Core.Models.HRMS;
//using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore;
//using NotificationLogsModel = CompanyPlatform.Core.Models.CRM.Notification.NotificationLogs;
//// Aliases for Notification Models
//using NotificationModel = CompanyPlatform.Core.Models.CRM.Notification.Notifications;
//using NotificationQueueModel = CompanyPlatform.Core.Models.CRM.Notification.NotificationQueue;

//namespace CompanyPlatform.Core.Data
//{
//    public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
//    {
//        public ApplicationDBContext(
//            DbContextOptions<ApplicationDBContext> options)
//            : base(options)
//        {
//        }

//        // =====================================================
//        // EMPLOYEE
//        // =====================================================

//        public DbSet<Employee> Employees { get; set; }

//        public DbSet<WorkLocation> WorkLocations { get; set; }

//        public DbSet<Department> Departments { get; set; }

//        public DbSet<Designation> Designations { get; set; }

//        public DbSet<EmployeeBankDetails> EmployeeBankDetails { get; set; }

//        public DbSet<EmployeePFDetails> EmployeePFDetails { get; set; }

//        public DbSet<EmployeeTDSDetails> EmployeeTDSDetails { get; set; }

//        public DbSet<EmployeeStatutoryDetails>
//            Tb_EmployeeStatutoryDetails
//        { get; set; }

//        public DbSet<EmployeeDocument>
//            Tb_EmployeeDocuments
//        { get; set; }

//        public DbSet<Shift>
//            Tb_Shifts
//        { get; set; }

//        public DbSet<AccessControl>
//            Tbl_AccessControls
//        { get; set; }

//        public DbSet<EmployeeSalarySummary>
//            Tb_EmployeeSalarySummaries
//        { get; set; }

//        public DbSet<EmployeeTaxDeclaration>
//            Tbl_EmployeeTaxDeclarations
//        { get; set; }

//        public DbSet<EmployeeDeclarationDetail>
//            EmployeeDeclarationDetails
//        { get; set; }

//        public DbSet<EmployeeDeclarationDocument>
//            Tbl_EmployeeDeclarationDocuments
//        { get; set; }

//        public DbSet<EmployeeQualification>
//            Tbl_EmployeeQualifications
//        { get; set; }

//        public DbSet<EmployeeExperience>
//            Tbl_EmployeeExperiences
//        { get; set; }

//        public DbSet<EmployeeAddress>
//            Tbl_EmployeeAddresses
//        { get; set; }

//        public DbSet<LevelMaster>
//            Tbl_LevelMasters
//        { get; set; }


//        public DbSet<CompanyPlatform.Core.Models.CRM.Company.TaskStatus> TaskStatuses { get; set; }

//        public DbSet<Tasks> Tasks { get; set; }
//        public DbSet<TaskChecklist> TaskChecklists { get; set; }
//        public DbSet<TaskComment> TaskComments { get; set; }
//        public DbSet<TaskAttachment> TaskAttachments { get; set; }
//        public DbSet<TaskHistory> TaskHistories { get; set; }
//        public DbSet<TaskReminderMapping> TaskReminderMappings { get; set; }


//        // =====================================================
//        // NOTIFICATION
//        // =====================================================

//        public DbSet<Notifications> Tbl_Notifications { get; set; }

//        public DbSet<NotificationQueue> NotificationQueues { get; set; }

//        public DbSet<NotificationLogs> NotificationLogs { get; set; }


//        // =====================================================
//        // ON MODEL CREATING
//        // =====================================================

//        protected override void OnModelCreating(ModelBuilder builder)
//        {
//            base.OnModelCreating(builder);


//            // =================================================
//            // APPLICATION USER -> EMPLOYEE
//            // =================================================

//            builder.Entity<ApplicationUser>()
//                .HasOne(a => a.Employee)
//                .WithOne(e => e.ApplicationUser)
//                .HasForeignKey<ApplicationUser>(
//                    a => a.EmployeeId)
//                .IsRequired();


//            // =================================================
//            // EMPLOYEE STATUTORY DETAILS
//            // =================================================

//            builder.Entity<EmployeeStatutoryDetails>()
//                .HasOne(s => s.Employee)
//                .WithMany()
//                .HasForeignKey(s => s.EmployeeID)
//                .OnDelete(DeleteBehavior.Cascade);


//            // =================================================
//            // NOTIFICATION -> EMPLOYEE
//            // =================================================

//            builder.Entity<NotificationModel>()
//                .HasOne(n => n.Employee)
//                .WithMany()
//                .HasForeignKey(n => n.EmployeeId)
//                .OnDelete(DeleteBehavior.Restrict);


//            // =================================================
//            // NOTIFICATION LOG -> USER
//            // =================================================

//            builder.Entity<NotificationLogsModel>()
//                .HasOne(n => n.User)
//                .WithMany()
//                .HasForeignKey(n => n.UserId)
//                .OnDelete(DeleteBehavior.Restrict);


//            // =================================================
//            // NOTIFICATION LOG -> CREATED BY
//            // =================================================

//            builder.Entity<NotificationLogsModel>()
//                .HasOne(n => n.CreatedByEmployee)
//                .WithMany()
//                .HasForeignKey(n => n.CreatedBy)
//                .OnDelete(DeleteBehavior.Restrict);


//            // =================================================
//            // NOTIFICATION LOG -> UPDATED BY
//            // =================================================

//            builder.Entity<NotificationLogsModel>()
//                .HasOne(n => n.UpdatedByEmployee)
//                .WithMany()
//                .HasForeignKey(n => n.UpdatedBy)
//                .OnDelete(DeleteBehavior.Restrict);
//        }
//    }
//}