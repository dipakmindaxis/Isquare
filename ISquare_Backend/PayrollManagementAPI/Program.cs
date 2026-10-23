using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.PriorityService;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services;
using CompanyPlatform.Core.Services.AccessControl;
using CompanyPlatform.Core.Services.Auth;
using CompanyPlatform.Core.Services.Common;
using CompanyPlatform.Core.Services.Companies;
using CompanyPlatform.Core.Services.Department;
using CompanyPlatform.Core.Services.Designation;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.Core.Services.Employee;
using CompanyPlatform.Core.Services.EmployeePFDetails;
using CompanyPlatform.Core.Services.EmployeeStatutoryDetails;
using CompanyPlatform.Core.Services.EmployeeTDSDetails;
using CompanyPlatform.Core.Services.Meeting;
using CompanyPlatform.Core.Services.MeetingAttachment;
using CompanyPlatform.Core.Services.MeetingType;
using CompanyPlatform.CRM;
using CompanyPlatform.CRM.Service;
using CompanyPlatform.CRM.Services;
using CompanyPlatform.CRM.Services.ActivityLog;
using CompanyPlatform.CRM.Services.ActivityType;
using CompanyPlatform.CRM.Services.AddressType;
using CompanyPlatform.CRM.Services.AuditLog;
using CompanyPlatform.CRM.Services.BDEUser;
using CompanyPlatform.CRM.Services.Call;
using CompanyPlatform.CRM.Services.CallAttachment;
using CompanyPlatform.CRM.Services.CallHistory;
using CompanyPlatform.CRM.Services.CallType;
using CompanyPlatform.CRM.Services.ClientType;
using CompanyPlatform.CRM.Services.Company;
using CompanyPlatform.CRM.Services.CompanyAddress;
using CompanyPlatform.CRM.Services.CompanyContact;
using CompanyPlatform.CRM.Services.CompanyDocument;
using CompanyPlatform.CRM.Services.CompanyEmail;
using CompanyPlatform.CRM.Services.CompanyEmailsLog;
using CompanyPlatform.CRM.Services.CompanyNote;
using CompanyPlatform.CRM.Services.CompanyPhone;
using CompanyPlatform.CRM.Services.CompanyProfile;
using CompanyPlatform.CRM.Services.CompanyTimeline;
using CompanyPlatform.CRM.Services.CompanyVisit;
using CompanyPlatform.CRM.Services.ContactType;
using CompanyPlatform.CRM.Services.Customer;
using CompanyPlatform.CRM.Services.CustomerArea;
using CompanyPlatform.CRM.Services.CustomerCategory;
using CompanyPlatform.CRM.Services.CustomerSource;
using CompanyPlatform.CRM.Services.CustomerStatus;
using CompanyPlatform.CRM.Services.CustomerType;
using CompanyPlatform.CRM.Services.Director;
using CompanyPlatform.CRM.Services.DocumentType;
using CompanyPlatform.CRM.Services.Employee;
using CompanyPlatform.CRM.Services.EmailTemplate;
using CompanyPlatform.CRM.Services.FollowUp;
using CompanyPlatform.CRM.Services.History;
using CompanyPlatform.CRM.Services.Industry;
using CompanyPlatform.CRM.Services.InvoiceItem;
using CompanyPlatform.CRM.Services.InvoicePayment;
using CompanyPlatform.CRM.Services.InvoiceService;
using CompanyPlatform.CRM.Services.InvoiceType;
using CompanyPlatform.CRM.Services.LevelMaster;
using CompanyPlatform.CRM.Services.LocationMasters;
using CompanyPlatform.CRM.Services.NonGSTInvoice;
using CompanyPlatform.CRM.Services.NonGSTProforma;
using CompanyPlatform.CRM.Services.Notification;
using CompanyPlatform.CRM.Services.NotificationLogs;
using CompanyPlatform.CRM.Services.NotificationQueue;
using CompanyPlatform.CRM.Services.PaymentTerm;
using CompanyPlatform.CRM.Services.Product;
using CompanyPlatform.CRM.Services.ProformaInvoice;
using CompanyPlatform.CRM.Services.Quotation;
using CompanyPlatform.CRM.Services.SalesAttachment;
using CompanyPlatform.CRM.Services.SalesCoordinator;
using CompanyPlatform.CRM.Services.SalesOrder;
using CompanyPlatform.CRM.Services.SalesUserManager;
using CompanyPlatform.CRM.Services.TaskAssignment;
using CompanyPlatform.CRM.Services.TaskAssignments;
using CompanyPlatform.CRM.Services.TaskAttachment;
using CompanyPlatform.CRM.Services.TaskChecklists;
using CompanyPlatform.CRM.Services.TaskComments;
using CompanyPlatform.CRM.Services.TaskHistory;
using CompanyPlatform.CRM.Services.TaskReminderMapping;
using CompanyPlatform.CRM.Services.Tasks;
using CompanyPlatform.CRM.Services.TaskStatus;
using CompanyPlatform.CRM.Services.VisitAttachment;
using CompanyPlatform.CRM.Services.VisitType;
using CompanyPlatform.CRM.VisitAttachment;
using CompanyPlatform.CRM.VisitType;
using CompanyPlatform.Services;
using CompanyPlatform.Services.TaskAssignment;
using CompanyPlatform.VMS;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OfficeOpenXml;
using PayrollManagementAPI.Services;
using PayrollManagementAPI.Services.Department;
using PayrollManagementAPI.Services.Designation;
using PayrollManagementAPI.Services.Email;
using PayrollManagementAPI.Services.EmployeeBankDetails;
using PayrollManagementAPI.Services.EmployeeDocument;
using PayrollManagementAPI.Services.EmployeeDocuments;
using PayrollManagementAPI.Services.EmployeeStatutoryDetails;
using PayrollManagementAPI.Services.Role;
using PayrollManagementAPI.Services.Worklocation;
using PayrollManagementAPI.Services.WorkLocation;
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using CompanyEmployee =
    CompanyPlatform.Core.Models.CRM.Company.Employee;
var builder = WebApplication.CreateBuilder(args);
ExcelPackage.License.SetNonCommercialOrganization("Gaxce Sensors");
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 268435456;
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 268435456;
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 268435456;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCRMModule();
builder.Services.AddVMSModule();




builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
    .AddEntityFrameworkStores<ApplicationDBContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/notificationHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        } 
    };
});

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Standard Authorization header using the Bearer scheme (\"bearer {token}\")",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    options.OperationFilter<SecurityRequirementsOperationFilter>();
});




builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

//builder.Services.Configure<WiseSettings>(
//    builder.Configuration.GetSection("Wise")
//);

//builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
//builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();


builder.Services.AddScoped(typeof(IRepositories<>), typeof(Repositories<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IWorkLocationService, WorkLocationService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IDesignationService, DesignationService>();
builder.Services.AddScoped<IEmployeeBankDetailsService, EmployeeBankDetailsService>();
builder.Services.AddScoped<IEmployeePFDetailsService, EmployeePFDetailsService>();
builder.Services.AddScoped<IEmployeeTDSService, EmployeeTDSService>();
builder.Services.AddScoped<IEmployeeStatutoryDetailsService, EmployeeStatutoryDetailsService>();
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddScoped<IAccessControlService, AccessControlService>();
//builder.Services.AddScoped<INotificationQueueService, NotificationQueueService>();
//builder.Services.AddScoped<INotificationLogsService, NotificationLogsService>();
//builder.Services.AddScoped<INotificationQueueService, NotificationQueueService>();
builder.Services.AddScoped<IActivityTypeService, ActivityTypeService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();


builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITaskCommentService, TaskCommentService>();
builder.Services.AddScoped<ITaskAttachmentService, TaskAttachmentService>();
builder.Services.AddScoped<ITaskStatusService, TaskStatusService>();
builder.Services.AddScoped<ITaskChecklistService, TaskChecklistService>();
builder.Services.AddScoped<ITaskHistoryService, TaskHistoryService>();
builder.Services.AddScoped<ITaskReminderMappingService, TaskReminderMappingService>();
builder.Services.AddScoped<ITaskAssignmentsService, TaskAssignmentsService>();
builder.Services.AddScoped<ITaskAssignmentService, TaskAssignmentService>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationQueueService, NotificationQueueService>();
builder.Services.AddScoped<INotificationLogsService, NotificationLogsService>();

//Deepak 
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ICompanyService, CustomerService>();
builder.Services.AddScoped<ICustomerStatusService, CustomerStatusService>();
builder.Services.AddScoped<IIndustryService, IndustryService>();
builder.Services.AddScoped<IClientTypeService, ClientTypeService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IStateService, StateService>();
builder.Services.AddScoped<ICityService, CityService>();
builder.Services.AddScoped<ICustomerCategoryService, CustomerCategoryService>();
builder.Services.AddScoped<ICustomerTypeService, CustomerTypeService>();
builder.Services.AddScoped<ICallTypeService, CallTypeService>();
builder.Services.AddScoped<ICallService, CallService>();
builder.Services.AddScoped<ICallHistoryService, CallHistoryService>();
builder.Services.AddScoped<ICallAttachmentService, CallAttachmentService>();
builder.Services.AddScoped<ICompanyAddressService, CompanyAddressService>();
builder.Services.AddScoped<ICompanyContactService, CompanyContactService>();
builder.Services.AddScoped<ICompanyDocumentService, CompanyDocumentService>();
builder.Services.AddScoped<ICompanyEmailService, CompanyEmailService>();
builder.Services.AddScoped<ICompanyEmailsLogService, CompanyEmailsLogService>();
builder.Services.AddScoped<ICompanyNoteService, CompanyNoteService>();
builder.Services.AddScoped<ICompanyPhoneService, CompanyPhoneService>();
builder.Services.AddScoped<ICompanyTimelineService, CompanyTimelineService>();
builder.Services.AddScoped<ICompanyVisitService, CompanyVisitService>();

//vi
builder.Services.AddScoped<ISalesCoordinatorService,SalesCoordinatorService>();
builder.Services.AddScoped<IDirectorService, DirectorService>();
builder.Services.AddScoped<ICRMEmployeeService, CRMEmployeeService>();
builder.Services.AddScoped<ILevelMasterService, LevelMasterService>();
builder.Services.AddScoped<ISalesAttachmentService, SalesAttachmentService>();
builder.Services.AddScoped<IAddressTypeService, AddressTypeService>();
builder.Services.AddScoped<IPaymentTermService, PaymentTermService>();
builder.Services.AddScoped<ICustomerAreaService, CustomerAreaService>();
builder.Services.AddScoped<ICustomerSourceService, CustomerSourceService>();
builder.Services.AddScoped<IVisitAttachmentService, VisitAttachmentService>();
builder.Services.AddScoped<IReminderStatusService, ReminderStatusService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<IReminderHistoryService, ReminderHistoryService>();
builder.Services.AddScoped<IReminderNotificationService, ReminderNotificationService>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<IMeetingTypeService, MeetingTypeService>();
builder.Services.AddScoped<IMeetingAttendeeService, MeetingAttendeeService>();
builder.Services.AddScoped<IMeetingAttachmentsService, MeetingAttachmentsService>();
builder.Services.AddScoped<IVisitTypeService, VisitTypeService>();
builder.Services.AddScoped<IFollowUpService, FollowUpService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<IDocumentTypeService, DocumentTypeService>();
builder.Services.AddScoped<IPriorityService, PriorityService>();

//pa
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IInvoiceItemService, InvoiceItemService>();
builder.Services.AddScoped<IInvoicePaymentService, InvoicePaymentService>();
builder.Services.AddScoped<IInvoiceTypeService, InvoiceTypeService>();

builder.Services.AddScoped<INonGSTProformaService, NonGSTProformaService>();
builder.Services.AddScoped<INonGSTProformaItemService, NonGSTProformaItemService>();
builder.Services.AddScoped<INonGSTInvoiceService, NonGSTInvoiceService>();
builder.Services.AddScoped<INonGSTInvoiceItemService, NonGSTInvoiceItemService>();


builder.Services.AddScoped<IProformaInvoiceService, ProformaInvoiceService>();
builder.Services.AddScoped<IProformaInvoiceItemService, ProformaInvoiceItemService>();

builder.Services.AddScoped<IIndustryService, IndustryService>();

builder.Services.AddScoped<ICustomerCategoryService, CustomerCategoryService>();

// SM ContactType
builder.Services.AddScoped<IContactTypeService, ContactTypeService>();
builder.Services.AddScoped<ISalesUserManagerService, SalesUserManagerService>();
builder.Services.AddScoped<IBDEUserService, BDEUserService>();
//ns

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IQuotationService, QuotationService>();
builder.Services.AddScoped<IQuotationItemService,QuotationItemService>();
builder.Services.AddScoped<IQuotationDefaultService,QuotationDefaultService>();
builder.Services.AddScoped<ICompanyProfileService,CompanyProfileService>();
builder.Services.AddScoped<IQuotationApprovalService,QuotationApprovalService>();
builder.Services.AddScoped<IQuotationRevisionService,QuotationRevisionService>();
builder.Services.AddScoped<IQuotationChargeService,QuotationChargeService>();

builder.Services.AddScoped<ISalesOrderService,SalesOrderService>();

builder.Services.AddScoped<ISalesOrderItemService, SalesOrderItemService>();


builder.Services.AddScoped<ISalesOrderService,SalesOrderService>();
builder.Services.AddScoped<ICompaniessService, CompaniessService>();

builder.Services.AddScoped<IContactService,CompanyPlatform.Core.Services.Contact.ContactService>();

builder.Services.AddSignalR();

//builder.Services.AddScoped<IcustomerTypeService, CustomerTypeService>();

builder.Services.AddScoped<IFileService, FileService>();

//enquiry masters
builder.Services.AddScoped<IEnquirySourceService, EnquirySourceService>();
builder.Services.AddScoped<IEnquiryTypeService, EnquiryTypeService>();
builder.Services.AddScoped<IEnquiryPriorityService, EnquiryPriorityService>();
builder.Services.AddScoped<IEnquiryStageService, EnquiryStageService>();
builder.Services.AddScoped<ILostReasonService, LostReasonService>();
builder.Services.AddScoped<IEnquiryStatusService, EnquiryStatusService>();
builder.Services.AddScoped<IProductCategoryService, ProductCategoryService>();
builder.Services.AddScoped<IProductServiceItemService, ProductServiceItemService>();




//ERP

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roleNames = { "Admin", "HR", "Employee" };
    foreach (var roleName in roleNames)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }
    var adminEmail = "isquare@gmail.com";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var adminEmployee = new Employee //CompanyEmployee Employees 
        {
            EmployeeCode = "SYS",
            FirstName = "System",
            LastName = "Admin",
            EmailAddress = adminEmail,
            MobileNumber = "0000000000",
            DateOfJoining = DateTime.UtcNow,
            IsActive = true

        };

        var adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            Employee = adminEmployee
        };

        var result = await userManager.CreateAsync(adminUser, "Password@123"); 

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }

}


app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Headers"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Methods"] = "*";
    }
});
app.UseWhen(context =>
    context.Request.Path.StartsWithSegments("/iclock"),
    appBuilder => { }
);
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();