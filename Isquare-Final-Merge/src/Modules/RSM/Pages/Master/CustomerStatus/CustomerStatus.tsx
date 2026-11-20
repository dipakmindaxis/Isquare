import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllCustomerStatuses,
  deleteCustomerStatus,
  updateCustomerStatus,
} from "./Services/CustomerStatusService";
import type { CustomerStatus as CustomerStatusType } from "./Types/CustomerStatusTypes";
import AddCustomerStatusModal from "./Components/AddCustomerStatusModal";
import EditCustomerStatusModal from "./Components/EditCustomerStatusModal";
import ViewCustomerStatusModal from "./Components/ViewCustomerStatusModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";

interface CustomerStatusProps {
  isTab?: boolean;
}

const CustomerStatus: React.FC<CustomerStatusProps> = ({ isTab = false }) => {
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatusType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CustomerStatusType | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getAllCustomerStatuses();
      setCustomerStatuses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch customer statuses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo((): CustomerStatusType[] => {
    return customerStatuses.filter((item) => {
      const matchesSearch =
        (item.statusCode &&
          item.statusCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.statusName &&
          item.statusName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.isActive) ||
        (statusFilter === "Inactive" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customerStatuses, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): CustomerStatusType[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = customerStatuses.length;
    const active = customerStatuses.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customerStatuses]);

  const handleViewClick = (item: CustomerStatusType): void => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (item: CustomerStatusType): void => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: CustomerStatusType): void => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedItem) return;
    try {
      await deleteCustomerStatus(selectedItem.customerStatusId);
      toast.success(`Customer status "${selectedItem.statusName}" deleted.`);
      await fetchItems();
    } catch {
      toast.error("Failed to delete customer status.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleStatusToggle = async (item: CustomerStatusType) => {
    try {
      const updatedStatus = !item.isActive;
      await updateCustomerStatus(item.customerStatusId, {
        customerStatusId: item.customerStatusId,
        statusName: item.statusName,
        statusCode: item.statusCode,
        description: item.description,
        isActive: updatedStatus,
      });
      toast.success(
        `Customer status "${item.statusName}" marked as ${
          updatedStatus ? "Active" : "Inactive"
        }.`
      );
      fetchItems();
    } catch {
      toast.error("Failed to update customer status.");
    }
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const exportData = filteredItems.map((item, index) => ({
      "Sr. No.": index + 1,
      "Status Code": item.statusCode || "-",
      "Status Name": item.statusName || "-",
      Description: item.description || "-",
      Status: item.isActive ? "Active" : "Inactive",
    }));

    exportToExcel(
      exportData,
      `CustomerStatuses_${new Date().toISOString().slice(0, 10)}`,
      "CustomerStatuses"
    );
  };

  return (
    <div className={isTab ? "w-full space-y-6" : "p-4 md:p-6 bg-gray-50 min-h-full space-y-6"}>
      {/* Top Header Card when Standalone */}
      {!isTab && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 rounded-xl flex items-center justify-center shrink-0 text-[#FF7900]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#00234a]">Customer Status</h1>
            </div>
          </div>
        </div>
      )}

      {/* Section Header matching Reference Customers Tab */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
            Customer Status
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchItems}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Customer Status</span>
          </button>
        </div>
      </div>

      {/* Analytics / Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <UserCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Total Statuses
            </p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Active Statuses
            </p>
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <XCircle size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Inactive Statuses
            </p>
            <p className="text-2xl font-bold text-rose-600">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by code, name, or description..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Status:
          </span>
          <div className="flex bg-gray-100 p-1 rounded-lg flex-1 sm:flex-initial">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex-1 sm:flex-initial ${
                  statusFilter === status
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table matching Reference Design */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#FF7900] text-white text-[13px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 text-left font-bold w-16 border-r border-[#e06800]">
                  Sr. No.
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Status Code
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Status Name
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Description
                </th>
                <th className="px-4 py-3.5 text-center font-bold w-28 border-r border-[#e06800]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-center font-bold w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <LogoLoader />
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="w-8 h-8 text-gray-300" />
                      <p className="text-sm font-medium">No customer statuses found.</p>
                      {searchQuery && (
                        <p className="text-xs text-gray-400">
                          Try adjusting your search criteria
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr
                    key={item.customerStatusId}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700 font-medium border-r border-gray-200">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200">
                      {item.statusCode || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-semibold border-r border-gray-200">
                      {item.statusName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 border-r border-gray-200">
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      <div className="flex justify-center w-full">
                        <label
                          className="relative inline-flex items-center cursor-pointer"
                          onClick={() => handleStatusToggle(item)}
                        >
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            readOnly
                            className="sr-only"
                          />
                          <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${
                              item.isActive ? "bg-[#FF8500]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm"
                              style={{
                                left: item.isActive
                                  ? "calc(100% - 1.25rem - 0.125rem)"
                                  : "0.125rem",
                              }}
                            />
                          </div>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-2 w-full">
                        <button
                          onClick={() => handleViewClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit Status"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete Status"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-6 text-xs text-gray-600 select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF7900]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div>
            {filteredItems.length === 0
              ? "0-0 of 0"
              : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  filteredItems.length
                )} of ${filteredItems.length}`}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedItem && (
        <ViewCustomerStatusModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          customerStatus={selectedItem}
        />
      )}

      {/* Add Modal */}
      <AddCustomerStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchItems}
      />

      {/* Edit Modal */}
      {selectedItem && (
        <EditCustomerStatusModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchItems}
          customerStatus={selectedItem}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Status"
        message={`Are you sure you want to delete "${selectedItem?.statusName}" (${selectedItem?.statusCode})?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CustomerStatus;
