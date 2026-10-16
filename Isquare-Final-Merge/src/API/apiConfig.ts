const BASE_URL = "https://localhost:7296/api";
// const BASE_URL = "https://sama9890-001-site1.jtempurl.com/api";
const BASE_URL = "https://localhost:44363/api";
//const BASE_URL = "https://localhost:7296/api";
//const BASE_URL = "https://sama9890-001-site1.jtempurl.com/api";
// const BASE_URL = "https://vishalkakde-001-site1.etempurl.com/api";

export interface ApiEndpoints {
  BaseUrl: string;
  Login: string;
  Register: string;
  ForgotPassword: string;
  ResetPassword: string;
  ChangePassword: string;
  Employees: string;
  EmployeesByRoleAndDepartment: string;
  WorkLocations: string;
  Departments: string;
  Designations: string;
  Roles: string;
  AccessControl: string;
  Dashboard: string;
  EmployeeStatutoryDetails: string;
  EmployeeDocuments: string;
  EmployeeBankDetails: string;
  EmployeePFDetails: string;
  EmployeeTDSDetails: string;
  PaymentTerms: string;
  PaymentTerm: string;
  Industry: string;
  Industries: string;
  CustomerStatus: string;
  CustomerSource: string;
  CustomerArea: string;
  AddressType: string;
  LeaveTypes: string;
  EmployeeSelectionList: string;
  ExpenseType: string;
  Country: string;
  State: string;
  Company: string;
  SetEmployeeReporting: string;
  Notifications: string;
  MarkAllNotificationsRead: string;
  Contact: string;
  Contacts: string;
  [key: string]: string;
}

export const API_ENDPOINTS: ApiEndpoints = {
  // ExchangeRate: `https://v6.exchangerate-api.com/v6/c1d2fd789cda1a02192b1c64/latest/INR`,
  BaseUrl: BASE_URL,
  Login: `${BASE_URL}/auth/login`,
  Register: `${BASE_URL}/auth/register`,
  ForgotPassword: `${BASE_URL}/auth/forgot-password`,
  ResetPassword: `${BASE_URL}/auth/reset-password`,
  ChangePassword: `${BASE_URL}/auth/change-password`,
  Employees: `${BASE_URL}/payroll-employees`,
  EmployeesByRoleAndDepartment: `${BASE_URL}/payroll-employees/by-role-and-department`,
  WorkLocations: `${BASE_URL}/worklocations`,
  Departments: `${BASE_URL}/departments`,
  Designations: `${BASE_URL}/designations`,
  Roles: `${BASE_URL}/roles`,
  AccessControl: `${BASE_URL}/accesscontrol`,
  Dashboard: `${BASE_URL}/loan/dashboard`,
  EmployeeStatutoryDetails: `${BASE_URL}/employee-statutory-details`,
  EmployeeDocuments: `${BASE_URL}/employee-documents`,
  EmployeeBankDetails: `${BASE_URL}/employee-bank-details`,
  EmployeePFDetails: `${BASE_URL}/employee-pf-details`,
  EmployeeTDSDetails: `${BASE_URL}/employee-tds-details`,
  PaymentTerms: `${BASE_URL}/payment-term`,
  PaymentTerm: `${BASE_URL}/payment-term`,
  Industry: `${BASE_URL}/industry`,
  Industries: `${BASE_URL}/industry`,
  CustomerStatus: `${BASE_URL}/customer-status`,
  CustomerSource: `${BASE_URL}/customer-source`,
  CustomerArea: `${BASE_URL}/customer-area`,
  AddressType: `${BASE_URL}/address-type`,
  LeaveTypes: `${BASE_URL}/leavetypes`,
  EmployeeSelectionList: `${BASE_URL}/payroll-employees/selection-list`,
  ExpenseType: `${BASE_URL}/expensetypes`,
  Country: `${BASE_URL}/country`,
  State: `${BASE_URL}/state`,
  Company: `${BASE_URL}/companies`,
  SetEmployeeReporting: `${BASE_URL}/payroll-employees/set-reporting`,
  Notifications: `${BASE_URL}/notifications`,
  MarkAllNotificationsRead: `${BASE_URL}/notifications/mark-all-read`,
  BdeUsers: `${BASE_URL}/bdeuser`,
  BdeUser: `${BASE_URL}/bdeuser`,
  Contact: `${BASE_URL}/Contact`,
  Contacts: `${BASE_URL}/Contact`,
  ContactTypes: `${BASE_URL}/contacttype`,
  ContactType: `${BASE_URL}/contacttype`,
  ClientType: `${BASE_URL}/contacttype`,
  ClientTypes: `${BASE_URL}/contacttype`,
  SalesUserManagers: `${BASE_URL}/salesusermanager`,
  SalesUserManager: `${BASE_URL}/salesusermanager`,
  CustomerCategory: `${BASE_URL}/customer-category`,
  CustomerType: `${BASE_URL}/customer-type`,
  City: `${BASE_URL}/city`,
  Cities: `${BASE_URL}/city`,
  Customer: `${BASE_URL}/customer`,
  Customers: `${BASE_URL}/customer`,
  SalesAttachments: `${BASE_URL}/SalesAttachments`,
  SalesAttachment: `${BASE_URL}/SalesAttachments`,
  DocumentType: `${BASE_URL}/documenttype`,
  DocumentTypes: `${BASE_URL}/documenttype`,
  ActivityType: `${BASE_URL}/ActivityType`,
  ActivityTypes: `${BASE_URL}/ActivityType`,
  MeetingType: `${BASE_URL}/meetingtypes`,
  MeetingTypes: `${BASE_URL}/meetingtypes`,
  CallType: `${BASE_URL}/CallType`,
  CallTypes: `${BASE_URL}/CallType`,
  FollowUp: `${BASE_URL}/FollowUp`,
  FollowUps: `${BASE_URL}/FollowUp`,
  Priority: `${BASE_URL}/priority`,
  Priorities: `${BASE_URL}/priority`,
  Call: `${BASE_URL}/Call`,
  Calls: `${BASE_URL}/Call`,
  Meeting: `${BASE_URL}/Meeting`,
  Meetings: `${BASE_URL}/Meeting`,
  Reminder: `${BASE_URL}/Reminder`,
  Reminders: `${BASE_URL}/Reminder`,
  Quotations: `${BASE_URL}/quotation`,
  Quotation: `${BASE_URL}/quotation`,
  QuotationItems: `${BASE_URL}/quotation-item`,
  QuotationItem: `${BASE_URL}/quotation-item`,
  QuotationApprovals: `${BASE_URL}/quotation-approval`,
  QuotationApproval: `${BASE_URL}/quotation-approval`,
  QuotationCharges: `${BASE_URL}/quotation-charge`,
  QuotationCharge: `${BASE_URL}/quotation-charge`,
  QuotationDefaults: `${BASE_URL}/quotation-default`,
  QuotationDefault: `${BASE_URL}/quotation-default`,
  QuotationRevisions: `${BASE_URL}/quotation-revision`,
  QuotationRevision: `${BASE_URL}/quotation-revision`,
  SalesOrders: `${BASE_URL}/sales-order`,
  SalesOrder: `${BASE_URL}/sales-order`,
  SalesOrderItems: `${BASE_URL}/sales-order-item`,
  SalesOrderItem: `${BASE_URL}/sales-order-item`,
  CompanyProfile: `${BASE_URL}/company-profile`,
  CompanyProfiles: `${BASE_URL}/company-profile`,
  Products: `${BASE_URL}/product`,
  Product: `${BASE_URL}/product`,
};

