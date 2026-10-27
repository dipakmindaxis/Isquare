// Inside App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Modules/HRMS/Pages/Auth/Login";
import ProtectedRoute from "./Modules/HRMS/Pages/Auth/ProtectedRoute";
import HomeHub from "./Pages/HomeHub";
import EmployeeMaster from "./Modules/HRMS/Pages/Employee/EmployeeMaster";
import Role from "./Modules/HRMS/Pages/Masters/Role/Role";
import AccessControlManagement from "./Modules/HRMS/Pages/Masters/AccessControl/AccessControlManagement";
import Designation from "./Modules/HRMS/Pages/Masters/Designation/Designation";
import Departments from "./Modules/HRMS/Pages/Masters/Department/Departments";
import MultiLocation from "./Modules/HRMS/Pages/Location/MultiLocation";

import BasicMasters from "./Modules/HRMS/Pages/Masters/BasicMasters/BasicMastersPage";
import PaymentTerm from "./Modules/RSM/Pages/Master/PaymentTerm/PaymentTerm";
import Director from "./Modules/RSM/Pages/Master/Director/Director";
import SalesCoordinator from "./Modules/RSM/Pages/Master/SalesCoordinator/SalesCoordinator";
import RoleMaster from "./Modules/RSM/Pages/Master/Role/RoleMaster";
import CustomerClassificationMaster from "./Modules/RSM/Pages/Master/CustomerClassification/CustomerClassificationMaster";
import SalesTeamMaster from "./Modules/RSM/Pages/Master/SalesTeam/SalesTeamMaster";
import FollowUpContactUpdatesMaster from "./Modules/RSM/Pages/Master/FollowUpContactUpdates/FollowUpContactUpdatesMaster";
import DocumentAddressSettingsMaster from "./Modules/RSM/Pages/Master/DocumentAddressSettings/DocumentAddressSettingsMaster";
import Industry from "./Modules/RSM/Pages/Master/Industry/Industry";
import ContactPersonMaster from "./Modules/RSM/Pages/Master/Contact/ContactPersonMaster";
import CustomerStatus from "./Modules/RSM/Pages/Master/CustomerStatus/CustomerStatus";
import CustomerSource from "./Modules/RSM/Pages/Master/CustomerSource/CustomerSource";
import CustomerArea from "./Modules/RSM/Pages/Master/CustomerArea/CustomerArea";
import AddressType from "./Modules/RSM/Pages/Master/AddressType/AddressType";
import CustomerMaster from "./Modules/RSM/Pages/Customer/CustomerMaster";
import SalesActivities from "./Modules/RSM/Pages/SalesActivities/SalesActivities";
import AttachmentsMaster from "./Modules/RSM/Pages/Sales/Attachments/AttachmentsMaster";
import SalesAttachmentsMaster from "./Modules/RSM/Pages/Master/SalesAttachments/SalesAttachmentsMaster";
import FollowUpIntervals from "./Modules/RSM/Pages/Sales/Masters/FollowUpIntervals/FollowUpIntervals";
import DocumentTypes from "./Modules/RSM/Pages/Sales/Masters/DocumentTypes/DocumentTypes";
import CallTypes from "./Modules/RSM/Pages/Sales/Masters/CallTypes/CallTypes";
import MeetingTypes from "./Modules/RSM/Pages/Sales/Masters/MeetingTypes/MeetingTypes";
import ActivityOutcomes from "./Modules/RSM/Pages/Sales/Masters/ActivityOutcomes/ActivityOutcomes";
import LocationMaster from "./Modules/RSM/Pages/LocationMasters/LocationMaster";
import NotFoundPage from "./Modules/HRMS/Pages/Error/NotFoundPage";
import ResetPassword from "./Modules/HRMS/Pages/Auth/ResetPassword";
import ForgotPassword from "./Modules/HRMS/Pages/Auth/ForgotPassword";
import ErrorPage from "./Modules/HRMS/Pages/Error/ErrorPage";

import Dashboard from "./Modules/HRMS/Pages/Dashboard/Dashboard";
import RSMDashboard from "./Modules/RSM/Dashboard/RSMDashboard";
import VMSDashboard from "./Modules/VMS/Pages/Dashboard/VMSDashboard";
import Home from "./Modules/HRMS/Pages/Dashboard/Home";
import quotationRoutes from "./Modules/Quotation/routes/quotationRoutes";
import EnquiryMaster from "./Modules/RSM/Pages/Master/EnquiryMaster/EnquiryMaster";
 
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomeHub />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hrms",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "employees",
        element: <EmployeeMaster />,
      },
      {
        path: "employee",
        element: <EmployeeMaster />,
      },
      {
        path: "master/employee",
        element: <EmployeeMaster />,
      },
      {
        path: "master/employees",
        element: <EmployeeMaster />,
      },
      {
        path: "locations",
        element: <MultiLocation />,
      },
      {
        path: "masters",
        element: <BasicMasters />,
      },
      {
        path: "basimasters",
        element: <BasicMasters />,
      },
      {
        path: "basicmasters",
        element: <BasicMasters />,
      },
      {
        path: "masters/departments",
        element: <Departments />,
      },
      {
        path: "masters/designations",
        element: <Designation />,
      },
      {
        path: "masters/roles",
        element: <Role />,
      },
      {
        path: "masters/access-control",
        element: <AccessControlManagement />,
      },
      {
        path: "access-control",
        element: <AccessControlManagement />,
      },
    ],
  },
  {
    path: "/rsm",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <RSMDashboard />,
      },
      ...quotationRoutes,
      {
        path: "customers",
        element: <CustomerMaster />,
      },
      {
        path: "customer",
        element: <CustomerMaster />,
      },
      {
        path: "sales/customers",
        element: <CustomerMaster />,
      },
      {
        path: "sales/customer",
        element: <CustomerMaster />,
      },
      {
        path: "sales-activities",
        element: <SalesActivities />,
      },
      {
        path: "sales/activities",
        element: <SalesActivities />,
      },
      {
        path: "sales/calls",
        element: <SalesActivities defaultTab="calls" />,
      },
      {
        path: "sales/meetings",
        element: <SalesActivities defaultTab="meetings" />,
      },
      {
        path: "sales/follow-ups",
        element: <SalesActivities defaultTab="followups" />,
      },
      {
        path: "sales/attachments",
        element: <AttachmentsMaster />,
      },
      {
        path: "sales/follow-up-intervals",
        element: <FollowUpIntervals />,
      },
      {
        path: "sales/document-types",
        element: <DocumentTypes />,
      },
      {
        path: "sales/call-types",
        element: <CallTypes />,
      },
      {
        path: "sales/meeting-types",
        element: <MeetingTypes />,
      },
      {
        path: "sales/activity-outcomes",
        element: <ActivityOutcomes />,
      },
      {
        path: "sales/outcomes",
        element: <ActivityOutcomes />,
      },
      {
        path: "master/enquiry-master",
        element: <EnquiryMaster />,
      },
      // Consolidated Master Routes
      {
        path: "master/customer-classification",
        element: <CustomerClassificationMaster />,
      },
      {
        path: "customer-classification",
        element: <CustomerClassificationMaster />,
      },
      {
        path: "master/sales-team",
        element: <SalesTeamMaster />,
      },
      {
        path: "sales-team",
        element: <SalesTeamMaster />,
      },
      {
        path: "master/sales-assignment",
        element: <CustomerMaster initialTab="assignment" />,
      },
      {
        path: "sales-assignment",
        element: <CustomerMaster initialTab="assignment" />,
      },
      {
        path: "hierarchy-management",
        element: <CustomerMaster initialTab="assignment" />,
      },
      {
        path: "master/follow-up-contact-updates",
        element: <FollowUpContactUpdatesMaster />,
      },
      {
        path: "follow-up-contact-updates",
        element: <FollowUpContactUpdatesMaster />,
      },
      {
        path: "master/document-address-settings",
        element: <DocumentAddressSettingsMaster />,
      },
      {
        path: "document-address-settings",
        element: <DocumentAddressSettingsMaster />,
      },

      // Sub-master / tab / category direct routes
      {
        path: "master/follow-up-intervals",
        element: <FollowUpIntervals />,
      },
      {
        path: "master/follow-up",
        element: <FollowUpContactUpdatesMaster initialTab="follow-up" />,
      },
      {
        path: "master/document-types",
        element: <DocumentTypes />,
      },
      {
        path: "master/document-type",
        element: <DocumentAddressSettingsMaster initialTab="document-type" />,
      },
      {
        path: "master/call-types",
        element: <CallTypes />,
      },
      {
        path: "master/call-type",
        element: <FollowUpContactUpdatesMaster initialTab="call-type" />,
      },
      {
        path: "master/meeting-types",
        element: <MeetingTypes />,
      },
      {
        path: "master/meeting-type",
        element: <FollowUpContactUpdatesMaster initialTab="meeting-type" />,
      },
      {
        path: "master/activity-outcomes",
        element: <ActivityOutcomes />,
      },
      {
        path: "master/activity-type",
        element: <FollowUpContactUpdatesMaster initialTab="activity-type" />,
      },
      {
        path: "master/outcomes",
        element: <ActivityOutcomes />,
      },
      {
        path: "master/sales-attachments",
        element: <SalesAttachmentsMaster />,
      },
      {
        path: "master/attachments",
        element: <SalesAttachmentsMaster />,
      },
      {
        path: "payment-term",
        element: <PaymentTerm />,
      },
      {
        path: "recruitment/payment-term",
        element: <PaymentTerm />,
      },
      {
        path: "industry",
        element: <CustomerClassificationMaster initialTab="industry" />,
      },
      {
        path: "recruitment/industry",
        element: <Industry />,
      },
      {
        path: "customer-status",
        element: <CustomerClassificationMaster initialTab="status" />,
      },
      {
        path: "recruitment/customer-status",
        element: <CustomerStatus />,
      },
      {
        path: "customer-source",
        element: <CustomerClassificationMaster initialTab="source" />,
      },
      {
        path: "recruitment/customer-source",
        element: <CustomerSource />,
      },
      {
        path: "customer-area",
        element: <CustomerClassificationMaster initialTab="area" />,
      },
      {
        path: "recruitment/customer-area",
        element: <CustomerArea />,
      },
      {
        path: "address-type",
        element: <DocumentAddressSettingsMaster initialTab="address-type" />,
      },
      {
        path: "recruitment/address-type",
        element: <AddressType />,
      },
      {
        path: "bde-users",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "bde-user",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "de-user",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "deUser",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "recruitment/bde-users",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "recruitment/bde-user",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "contact-person",
        element: <ContactPersonMaster />,
      },
      {
        path: "contacts",
        element: <ContactPersonMaster />,
      },
      {
        path: "master/contact-person",
        element: <ContactPersonMaster />,
      },
      {
        path: "master/contacts",
        element: <ContactPersonMaster />,
      },
      {
        path: "contact-types",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "contact-type",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "recruitment/contact-types",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "recruitment/contact-type",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "sales-user-manager",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "sales-user-managers",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "salesusermanager",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "recruitment/sales-user-manager",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "recruitment/sales-user-managers",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "master/payment-term",
        element: <PaymentTerm />,
      },
      {
        path: "master/industry",
        element: <CustomerClassificationMaster initialTab="industry" />,
      },
      {
        path: "master/customer-status",
        element: <CustomerClassificationMaster initialTab="status" />,
      },
      {
        path: "master/customer-source",
        element: <CustomerClassificationMaster initialTab="source" />,
      },
      {
        path: "master/customer-area",
        element: <CustomerClassificationMaster initialTab="area" />,
      },
      {
        path: "master/address-type",
        element: <DocumentAddressSettingsMaster initialTab="address-type" />,
      },
      {
        path: "master/country",
        element: <LocationMaster kind="country" />,
      },
      {
        path: "master/state",
        element: <LocationMaster kind="state" />,
      },
      {
        path: "master/city",
        element: <LocationMaster kind="city" />,
      },
      {
        path: "master/bde-users",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "master/bde-user",
        element: <SalesTeamMaster initialTab="bde" />,
      },
      {
        path: "master/contact-types",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "master/contact-type",
        element: <FollowUpContactUpdatesMaster initialTab="contact-types" />,
      },
      {
        path: "master/sales-user-manager",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "master/sales-user-managers",
        element: <SalesTeamMaster initialTab="managers" />,
      },
      {
        path: "master/customer",
        element: <CustomerMaster />,
      },
      {
        path: "master/customers",
        element: <CustomerMaster />,
      },
      {
        path: "director",
        element: <Director />,
      },
      {
        path: "directors",
        element: <Director />,
      },
      {
        path: "master/director",
        element: <Director />,
      },
      {
        path: "master/directors",
        element: <Director />,
      },
      {
        path: "sales-coordinator",
        element: <SalesCoordinator />,
      },
      {
        path: "sales-coordinators",
        element: <SalesCoordinator />,
      },
      {
        path: "master/sales-coordinator",
        element: <SalesCoordinator />,
      },
      {
        path: "master/sales-coordinators",
        element: <SalesCoordinator />,
      },
      {
        path: "role",
        element: <RoleMaster />,
      },
      {
        path: "roles",
        element: <RoleMaster />,
      },
      {
        path: "master/role",
        element: <RoleMaster />,
      },
      {
        path: "master/roles",
        element: <RoleMaster />,
      },
    ],
  },

  {
    path: "/vms",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <VMSDashboard />,
      },
    ],
  },

  {
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      // Consolidated Masters (Root paths)
      { path: "/customer-classification", element: <CustomerClassificationMaster /> },
      { path: "/master/customer-classification", element: <CustomerClassificationMaster /> },
      { path: "/sales-team", element: <SalesTeamMaster /> },
      { path: "/master/sales-team", element: <SalesTeamMaster /> },
      { path: "/follow-up-contact-updates", element: <FollowUpContactUpdatesMaster /> },
      { path: "/master/follow-up-contact-updates", element: <FollowUpContactUpdatesMaster /> },
      { path: "/document-address-settings", element: <DocumentAddressSettingsMaster /> },
      { path: "/master/document-address-settings", element: <DocumentAddressSettingsMaster /> },

      // Legacy and Category mappings
      { path: "/bde-users", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/bde-user", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/de-user", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/deUser", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/recruitment/bde-users", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/recruitment/bde-user", element: <SalesTeamMaster initialTab="bde" /> },
      { path: "/contact-types", element: <FollowUpContactUpdatesMaster initialTab="contact-types" /> },
      { path: "/contact-type", element: <FollowUpContactUpdatesMaster initialTab="contact-types" /> },
      { path: "/recruitment/contact-types", element: <FollowUpContactUpdatesMaster initialTab="contact-types" /> },
      { path: "/recruitment/contact-type", element: <FollowUpContactUpdatesMaster initialTab="contact-types" /> },
      { path: "/sales-user-manager", element: <SalesTeamMaster initialTab="managers" /> },
      { path: "/sales-user-managers", element: <SalesTeamMaster initialTab="managers" /> },
      { path: "/salesusermanager", element: <SalesTeamMaster initialTab="managers" /> },
      { path: "/recruitment/sales-user-manager", element: <SalesTeamMaster initialTab="managers" /> },
      { path: "/payment-term", element: <PaymentTerm /> },
      { path: "/industry", element: <CustomerClassificationMaster initialTab="industry" /> },
      { path: "/customer-status", element: <CustomerClassificationMaster initialTab="status" /> },
      { path: "/customer-source", element: <CustomerClassificationMaster initialTab="source" /> },
      { path: "/customer-area", element: <CustomerClassificationMaster initialTab="area" /> },
      { path: "/address-type", element: <DocumentAddressSettingsMaster initialTab="address-type" /> },
      { path: "/director", element: <Director /> },
      { path: "/directors", element: <Director /> },
      { path: "/master/director", element: <Director /> },
      { path: "/master/directors", element: <Director /> },
      { path: "/sales-coordinator", element: <SalesCoordinator /> },
      { path: "/sales-coordinators", element: <SalesCoordinator /> },
      { path: "/master/sales-coordinator", element: <SalesCoordinator /> },
      { path: "/master/sales-coordinators", element: <SalesCoordinator /> },
      { path: "/customers", element: <CustomerMaster /> },
      { path: "/customer", element: <CustomerMaster /> },
      { path: "/rsm/customers", element: <CustomerMaster /> },
      { path: "/rsm/customer", element: <CustomerMaster /> },
      { path: "/rsm/sales/customers", element: <CustomerMaster /> },
      { path: "/sales-assignment", element: <CustomerMaster initialTab="assignment" /> },
      { path: "/master/sales-assignment", element: <CustomerMaster initialTab="assignment" /> },
      { path: "/hierarchy-management", element: <CustomerMaster initialTab="assignment" /> },
      { path: "/employees", element: <EmployeeMaster /> },
      { path: "/employee", element: <EmployeeMaster /> },
      { path: "/master/employee", element: <EmployeeMaster /> },
      { path: "/master/employees", element: <EmployeeMaster /> },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
],
{
  basename: "/frontend",
}
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
