import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { toast } from "sonner";
import { exportToExcel } from "../../../../Utils/exportToExcel";
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
} from "./Services/CustomerService";
import type { Customer } from "./Types/CustomerTypes";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import ViewCustomerModal from "./ViewCustomerModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";

const customTableStyles: any = {
  header: {
    style: {
      minHeight: "56px",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#154068",
      borderTopStyle: "solid" as any,
      borderTopWidth: "1px",
      borderTopColor: "#0f2f4d",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      paddingLeft: "16px",
      paddingRight: "16px",
      letterSpacing: "0.5px",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#374151",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
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

const CustomerMaster: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return (Array.isArray(customers) ? customers : []).filter((cust) => {
      const search = filterText.toLowerCase();
      const code = (cust.customerCode || "").toLowerCase();
      const name = (cust.customerName || "").toLowerCase();
      const company = (cust.companyName || "").toLowerCase();
      const gstin = (cust.gstin || "").toLowerCase();
      const pan = (cust.pan || "").toLowerCase();
      const area = (cust.customerAreaName || "").toLowerCase();
      const industry = (cust.industryName || "").toLowerCase();

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
  }, [customers, filterText, selectedStatus]);

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
      Industry: c.industryName || "-",
      "Customer Status": c.customerStatusName || "-",
      "Customer Source": c.customerSourceName || "-",
      "Customer Area": c.customerAreaName || "-",
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
          <p className="text-gray-500">{row.customerAreaName || "-"}</p>
        </div>
      ),
      grow: 1,
    },
    {
      name: "Industry",
      selector: (row) => row.industryName || "-",
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
    <div className="min-h-screen bg-[#e4e8e1] p-3 sm:p-4 md:p-6 w-full">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
        {!isAddModalOpen && (
          <>
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#FFF5EC] via-[#FFF9F4] to-[#FFF4EB] border border-[#FED7AA]/60 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          {/* Decorative subtle background waves and dots matching screenshot */}
          <svg
            viewBox="0 0 500 100"
            fill="none"
            preserveAspectRatio="none"
            className="absolute right-0 top-0 h-full w-[60%] sm:w-[45%] pointer-events-none opacity-45 z-0"
          >
            {/* Grid of dots */}
            <pattern id="headerDots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#FF8500" fillOpacity="0.4" />
            </pattern>
            <rect width="200" height="80" x="40" y="10" fill="url(#headerDots)" />
            {/* Orange diagonal swooping curve */}
            <path
              d="M30 100 C150 70, 260 15, 500 25"
              stroke="#FF8500"
              strokeWidth="2"
              strokeOpacity="0.7"
              fill="none"
            />
          </svg>

          <div className="w-full md:w-auto relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="bg-[#FFE8D6] text-[#FF8500] p-3 rounded-2xl shadow-xs shrink-0 flex items-center justify-center w-14 h-14">
                <FaUsers size={28} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] tracking-tight">
                  Customer Master
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
                  Manage commercial clients, tax identities, and accounts
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto relative z-10">
            <button
              type="button"
              onClick={handleExportClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-[#082B50] bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[40px]"
            >
              <FaFileExcel className="text-emerald-600 text-base" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF8500] hover:bg-[#E66D00] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-orange-500/25 active:scale-95 min-h-[40px]"
            >
              <FaPlus size={12} />
              <span>Add Customer</span>
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
          </>
        )}

        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchCustomers}
        />

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

      {/* Modals */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        customerId={selectedCustomerId}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomerId(null);
        }}
        onSuccess={fetchCustomers}
      />

      <ViewCustomerModal
        isOpen={isViewModalOpen}
        customerId={selectedCustomerId}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCustomerId(null);
        }}
      />

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
