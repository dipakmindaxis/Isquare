import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  FaPlus,
  FaFileExcel,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUsers,
  FaBuilding,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import {
  Users,
  UserCheck as LucideUserCheck,
  Share2,
  Factory,
  MapPin,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "../../../../Utils/exportToExcel";
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
} from "./Services/CustomerService";
import {
  getIndustries,
  getCustomerAreas,
} from "./Services/CustomerMasterDataService";
import type {
  Customer,
  IndustryItem,
  CustomerAreaItem,
} from "./Types/CustomerTypes";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import ViewCustomerModal from "./ViewCustomerModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";

import CustomerStatus from "../Master/CustomerStatus/CustomerStatus";
import CustomerSource from "../Master/CustomerSource/CustomerSource";
import Industry from "../Master/Industry/Industry";
import CustomerArea from "../Master/CustomerArea/CustomerArea";
import PaymentTerm from "../Master/PaymentTerm/PaymentTerm";
import SalesAssignmentSection from "./SalesAssignmentSection";

export type CustomerMasterTab =
  | "customers"
  | "assignment"
  | "status"
  | "source"
  | "industry"
  | "area"
  | "payment-terms";

export interface CustomerMasterProps {
  initialTab?: CustomerMasterTab;
}

interface TabConfig {
  id: CustomerMasterTab;
  label: string;
  shortDesc: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "customers",
    label: "Customers",
    shortDesc: "Commercial client records, statutory numbers & assigned reps",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "assignment",
    label: "Sales Assignment",
    shortDesc: "Role-based employee reporting structure & hierarchy",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "status",
    label: "Customer Status",
    shortDesc: "Lifecycle stages, active states & workflow status",
    icon: <LucideUserCheck className="w-4 h-4" />,
  },
  {
    id: "source",
    label: "Customer Source",
    shortDesc: "Lead acquisition channels & referral origins",
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    id: "industry",
    label: "Industry",
    shortDesc: "Business sectors, verticals & domain classifications",
    icon: <Factory className="w-4 h-4" />,
  },
  {
    id: "area",
    label: "Customer Area",
    shortDesc: "Sales territories, regions & delivery zones",
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    id: "payment-terms",
    label: "Payment Terms",
    shortDesc: "Credit periods, billing conditions & payment terms",
    icon: <Receipt className="w-4 h-4" />,
  },
];

const customTableStyles: any = {
  header: {
    style: {
      minHeight: "52px",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#FF7900",
      minHeight: "52px",
      borderRadius: "0px",
      borderTopStyle: "solid" as any,
      borderTopWidth: "1px",
      borderTopColor: "#e06800",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "700",
      textTransform: "uppercase",
      paddingLeft: "14px",
      paddingRight: "14px",
      letterSpacing: "0.5px",
      borderRight: "1px solid #e06800",
      borderRadius: "0px",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#374151",
      paddingLeft: "14px",
      paddingRight: "14px",
      borderRight: "1px solid #e5e7eb",
    },
  },
  rows: {
    style: {
      minHeight: "54px",
      borderBottom: "1px solid #e5e7eb",
      borderRadius: "0px",
      "&:hover": {
        backgroundColor: "#f0f7ff",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
  },
};

const actionButtonStyles = {
  base: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow",
  view: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
  edit: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
  delete: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
};

const CustomerMaster: React.FC<CustomerMasterProps> = ({
  initialTab,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as CustomerMasterTab | null;

  const validTabs = useMemo<CustomerMasterTab[]>(() => [
    "customers",
    "assignment",
    "status",
    "source",
    "industry",
    "area",
    "payment-terms",
  ], []);

  const [activeTab, setActiveTab] = useState<CustomerMasterTab>(() => {
    if (urlTab && validTabs.includes(urlTab)) return urlTab;
    if (initialTab && validTabs.includes(initialTab)) return initialTab;
    return "customers";
  });

  // Sync if initialTab prop changes externally
  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab, validTabs]);

  // Sync if URL search param changes (e.g. browser back/forward)
  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, validTabs, activeTab]);

  const handleSelectTab = (tabId: CustomerMasterTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    if (tabId === "customers") {
      loadMasterData();
      fetchCustomers();
    }
  };
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [areas, setAreas] = useState<CustomerAreaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Selected row
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const canEdit = true;
  const canDelete = true;

  const loadMasterData = useCallback(async () => {
    try {
      const [indList, areaList] = await Promise.all([
        getIndustries().catch(() => []),
        getCustomerAreas().catch(() => []),
      ]);
      setIndustries(Array.isArray(indList) ? indList : []);
      setAreas(Array.isArray(areaList) ? areaList : []);
    } catch {
      // ignore
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Failed to load customer records:", err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
    fetchCustomers();
  }, [loadMasterData, fetchCustomers]);

  const industryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const ind of industries) {
      map.set(Number(ind.industryId), ind.industryName);
    }
    return map;
  }, [industries]);

  const areaMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const ar of areas) {
      map.set(Number(ar.customerAreaId), ar.areaName);
    }
    return map;
  }, [areas]);

  const getIndustryName = useCallback(
    (cust: Customer): string => {
      if (cust.industryName && cust.industryName.trim() && cust.industryName !== "-") {
        return cust.industryName;
      }
      const anyCust = cust as unknown as Record<string, unknown>;
      if (anyCust.industry) {
        if (typeof anyCust.industry === "string") return anyCust.industry;
        if (
          typeof anyCust.industry === "object" &&
          anyCust.industry !== null &&
          "industryName" in anyCust.industry
        ) {
          return String(
            (anyCust.industry as { industryName?: string }).industryName || "-"
          );
        }
      }
      if (cust.industryId && industryMap.has(Number(cust.industryId))) {
        return industryMap.get(Number(cust.industryId))!;
      }
      return "-";
    },
    [industryMap]
  );

  const getAreaName = useCallback(
    (cust: Customer): string => {
      if (
        cust.customerAreaName &&
        cust.customerAreaName.trim() &&
        cust.customerAreaName !== "-"
      ) {
        return cust.customerAreaName;
      }
      const anyCust = cust as unknown as Record<string, unknown>;
      if (anyCust.customerArea) {
        if (typeof anyCust.customerArea === "string") return anyCust.customerArea;
        if (
          typeof anyCust.customerArea === "object" &&
          anyCust.customerArea !== null &&
          "areaName" in anyCust.customerArea
        ) {
          return String(
            (anyCust.customerArea as { areaName?: string }).areaName || "-"
          );
        }
      }
      if (cust.customerAreaId && areaMap.has(Number(cust.customerAreaId))) {
        return areaMap.get(Number(cust.customerAreaId))!;
      }
      return "-";
    },
    [areaMap]
  );

  const filteredCustomers = useMemo(() => {
    return (Array.isArray(customers) ? customers : []).filter((cust) => {
      const search = filterText.toLowerCase();
      const code = (cust.customerCode || "").toLowerCase();
      const name = (cust.customerName || "").toLowerCase();
      const company = (cust.companyName || "").toLowerCase();
      const gstin = (cust.gstin || "").toLowerCase();
      const pan = (cust.pan || "").toLowerCase();
      const area = getAreaName(cust).toLowerCase();
      const industry = getIndustryName(cust).toLowerCase();

      const matchesSearch =
        name.includes(search) ||
        code.includes(search) ||
        company.includes(search) ||
        gstin.includes(search) ||
        pan.includes(search) ||
        area.includes(search) ||
        industry.includes(search);

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && cust.isActive) ||
        (selectedStatus === "Inactive" && !cust.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customers, filterText, selectedStatus, getIndustryName, getAreaName]);

  // Statistics
  const stats = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const total = list.length;
    const active = list.filter((c) => c.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customers]);

  const handleStatusToggle = async (row: Customer) => {
    try {
      const updatedStatus = !row.isActive;
      await updateCustomer(row.customerId, {
        ...row,
        isActive: updatedStatus,
      });
      toast.success(
        `Customer "${row.customerName}" marked as ${
          updatedStatus ? "Active" : "Inactive"
        }.`
      );
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer status.");
    }
  };

  const handleDeleteRequest = (customer: Customer) => {
    setCustomerToDelete({
      id: customer.customerId,
      name: customer.customerName,
    });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete.id);
      toast.success(`Customer "${customerToDelete.name}" deleted successfully.`);
      fetchCustomers();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete customer.");
    } finally {
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleExportClick = () => {
    if (filteredCustomers.length === 0) {
      toast.warning("No customer data available to export.");
      return;
    }

    const dataToExport = filteredCustomers.map((c) => ({
      "Customer Code": c.customerCode || "-",
      "Customer Name": c.customerName,
      "Short Name": c.customerShortName || "-",
      "Company Name": c.companyName || "-",
      "Company Group": c.companyGroup || "-",
      "Plant Code": c.plantCode || "-",
      Industry: getIndustryName(c),
      "Customer Status": c.customerStatusName || "-",
      "Customer Source": c.customerSourceName || "-",
      "Customer Area": getAreaName(c),
      "Payment Terms": c.paymentTermName || "-",
      PAN: c.pan || "-",
      TAN: c.tan || "-",
      GSTIN: c.gstin || "-",
      CIN: c.cin || "-",
      "MSME Number": c.msmeNumber || "-",
      Director: c.directorName || "-",
      "BDE User": c.bdeUserName || "-",
      "Sales Coordinator": c.salesCoordinatorName || "-",
      "Customer Owner": c.customerOwnerName || "-",
      Status: c.isActive ? "Active" : "Inactive",
      "Registration Date": c.registrationDate
        ? c.registrationDate.substring(0, 10)
        : "-",
      "Visited Date": c.visitedDate ? c.visitedDate.substring(0, 10) : "-",
      Remarks: c.remarks || "-",
    }));

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(dataToExport, `Customers_Export_${dateStr}`, "Customers");
  };

  const columns: TableColumn<Customer>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "70px",
    },
    {
      name: "Customer Code",
      selector: (row) => row.customerCode || "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      cell: (row) => (
        <div className="py-2">
          <p className="font-semibold text-gray-900 leading-tight">
            {row.customerName}
          </p>
          {row.customerShortName && (
            <p className="text-xs text-gray-400 mt-0.5">
              ({row.customerShortName})
            </p>
          )}
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "-",
      sortable: true,
      grow: 1,
    },
    {
      name: "GSTIN / Area",
      cell: (row) => (
        <div className="text-xs py-1">
          <p className="font-semibold text-gray-800">{row.gstin || "-"}</p>
          <p className="text-gray-500">{getAreaName(row)}</p>
        </div>
      ),
      grow: 1,
    },
    {
      name: "Industry",
      selector: (row) => getIndustryName(row),
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      cell: (row) => {
        const isOn = row.isActive;
        return (
          <div className="flex justify-center w-full">
            <label
              className="relative inline-flex items-center cursor-pointer"
              onClick={() => handleStatusToggle(row)}
            >
              <input
                type="checkbox"
                checked={isOn}
                readOnly
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isOn ? "bg-[#FF8500]" : "bg-gray-300"
                }`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out"
                  style={{
                    left: isOn
                      ? "calc(100% - 1.25rem - 0.125rem)"
                      : "0.125rem",
                  }}
                />
              </div>
            </label>
          </div>
        );
      },
      width: "90px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              setSelectedCustomerId(row.customerId);
              setIsViewModalOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View Details"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setSelectedCustomerId(row.customerId);
                setIsEditModalOpen(true);
              }}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit Customer"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => handleDeleteRequest(row)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete Customer"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Customer Master
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Unified master management for customer directory, industry classifications, lifecycle statuses, lead acquisition sources, geographic areas, and payment terms.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-[#FF7900] text-[#FF7900] font-semibold bg-orange-50/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <span className={isActive ? "text-[#FF7900]" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      <div className="w-full">
        {activeTab === "customers" && (
          <div>
            {isAddModalOpen ? (
              <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  loadMasterData();
                  fetchCustomers();
                }}
              />
            ) : isEditModalOpen && selectedCustomerId ? (
              <EditCustomerModal
                isOpen={isEditModalOpen}
                customerId={selectedCustomerId}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedCustomerId(null);
                }}
                onSuccess={() => {
                  setIsEditModalOpen(false);
                  setSelectedCustomerId(null);
                  loadMasterData();
                  fetchCustomers();
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Listing Header matching Referral Image */}
                <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
                  Customers
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    loadMasterData();
                    fetchCustomers();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                >
                  <FaFileExcel className="text-emerald-600 text-sm" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
                >
                  <FaPlus size={12} />
                  <span>+ Create New</span>
                </button>
              </div>
            </div>

            {/* Analytics / Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <FaBuilding size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <FaUserCheck size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Active Accounts
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <FaUserTimes size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Inactive Accounts
                  </p>
                  <p className="text-2xl font-bold text-rose-600">{stats.inactive}</p>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
              <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by name, code, company, GSTIN, PAN, area..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500]"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Status:
                </span>
                <div className="flex bg-gray-100 p-1 rounded-lg flex-1 sm:flex-initial">
                  {["All", "Active", "Inactive"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-all text-center ${
                        selectedStatus === st
                          ? "bg-white text-[#FF8500] shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[850px]">
                  <DataTable
                    columns={columns}
                    data={filteredCustomers}
                    progressPending={isLoading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    customStyles={customTableStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noDataComponent={
                      <div className="py-12 text-center text-gray-400">
                        <FaUsers size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No customer records found</p>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Sub-Master Views for Dropdowns */}
      {activeTab === "assignment" && <SalesAssignmentSection standalone={true} />}
      {activeTab === "status" && <CustomerStatus isTab={true} />}
      {activeTab === "source" && <CustomerSource isTab={true} />}
      {activeTab === "industry" && <Industry isTab={true} />}
      {activeTab === "area" && <CustomerArea isTab={true} />}
      {activeTab === "payment-terms" && <PaymentTerm isTab={true} />}
    </div>

      {isViewModalOpen && (
        <ViewCustomerModal
          isOpen={isViewModalOpen}
          customerId={selectedCustomerId}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCustomerId(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete customer "${customerToDelete?.name}"?`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CustomerMaster;
