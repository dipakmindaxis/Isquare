import type { RouteObject } from "react-router-dom";
import QuotationDashboard from "../pages/QuotationDashboard";
import QuotationList from "../pages/QuotationList";
import CreateQuotation from "../pages/CreateQuotation";
import QuotationDetails from "../pages/QuotationDetails";
import QuotationRevisionList from "../pages/QuotationRevisionList";
import QuotationApprovalList from "../pages/QuotationApprovalList";
import QuotationCharges from "../pages/QuotationCharges";
import QuotationDefaults from "../pages/QuotationDefaults";
import CompanyProfile from "../pages/CompanyProfile";
import SalesOrderList from "../pages/SalesOrderList";
import SalesOrderDetails from "../pages/SalesOrderDetails";
import SalesOrderItems from "../pages/SalesOrderItems";
import ProductMaster from "../pages/ProductMaster";

export const quotationRoutes: RouteObject[] = [
  // Quotation Management
  {
    path: "quotations/dashboard",
    element: <QuotationDashboard />,
  },
  {
    path: "quotations",
    element: <QuotationList />,
  },
  {
    path: "quotations/list",
    element: <QuotationList />,
  },
  {
    path: "quotations/create",
    element: <CreateQuotation />,
  },
  {
    path: "quotations/:id",
    element: <QuotationDetails />,
  },
  {
    path: "quotations/:id/edit",
    element: <CreateQuotation />,
  },
  {
    path: "quotations/revisions",
    element: <QuotationRevisionList />,
  },
  {
    path: "quotations/approvals",
    element: <QuotationApprovalList />,
  },
  {
    path: "quotations/charges",
    element: <QuotationCharges />,
  },

  // Sales Order Management
  {
    path: "sales-orders",
    element: <SalesOrderList />,
  },
  {
    path: "sales-orders/:id",
    element: <SalesOrderDetails />,
  },
  {
    path: "sales-orders/items",
    element: <SalesOrderItems />,
  },

  // Masters
  {
    path: "quotation-defaults",
    element: <QuotationDefaults />,
  },
  {
    path: "quotations/defaults",
    element: <QuotationDefaults />,
  },
  {
    path: "company-profile",
    element: <CompanyProfile />,
  },
  {
    path: "products",
    element: <ProductMaster />,
  },
];

export default quotationRoutes;
