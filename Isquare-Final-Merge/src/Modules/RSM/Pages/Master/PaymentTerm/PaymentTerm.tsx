import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Receipt,
  Download,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  getAllPaymentTerms,
  deletePaymentTerm,
  updatePaymentTerm,
} from "./Services/PaymentTermService";
import type { PaymentTerm as PaymentTermType } from "./Types/PaymentTermTypes";
import AddPaymentTermModal from "./Components/AddPaymentTermModal";
import EditPaymentTermModal from "./Components/EditPaymentTermModal";
import ViewPaymentTermModal from "./Components/ViewPaymentTermModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface PaymentTermProps {
  isTab?: boolean;
}

const PaymentTerm: React.FC<PaymentTermProps> = ({ isTab = false }) => {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PaymentTermType | null>(null);

  // Search, Status & Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getAllPaymentTerms();
      setPaymentTerms(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch payment terms.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const stats = useMemo(() => {
    const total = paymentTerms.length;
    const active = paymentTerms.filter((item) => item.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [paymentTerms]);

  const filteredItems = useMemo((): PaymentTermType[] => {
    return paymentTerms.filter((item) => {
      const matchesSearch =
        (item.paymentTermCode &&
          item.paymentTermCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.paymentTermName &&
          item.paymentTermName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? item.isActive
          : !item.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [paymentTerms, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): PaymentTermType[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleExportExcel = () => {
    try {
      const exportData = filteredItems.map((item, index) => ({
        "Sr No": index + 1,
        "Payment Term Code": item.paymentTermCode || "",
        "Payment Term Name": item.paymentTermName || "",
        Status: item.isActive ? "Active" : "Inactive",
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PaymentTerms");
      XLSX.writeFile(workbook, `PaymentTerms_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Payment terms exported successfully");
    } catch {
      toast.error("Failed to export payment terms");
    }
  };

  const handleViewClick = (item: PaymentTermType): void => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (item: PaymentTermType): void => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleStatusToggle = async (item: PaymentTermType) => {
    try {
      const updatedStatus = !item.isActive;
      await updatePaymentTerm(item.paymentTermId, {
        paymentTermId: item.paymentTermId,
        paymentTermName: item.paymentTermName,
        paymentTermCode: item.paymentTermCode,
        isActive: updatedStatus,
      });
      toast.success(
        `Payment term "${item.paymentTermName}" marked as ${
          updatedStatus ? "Active" : "Inactive"
        }.`
      );
      fetchItems();
    } catch {
      toast.error("Failed to update payment term.");
    }
  };

  const handleDeleteRequest = (item: PaymentTermType): void => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedItem) return;
    try {
      await deletePaymentTerm(selectedItem.paymentTermId);
      toast.success(`Payment term "${selectedItem.paymentTermName}" deleted.`);
      await fetchItems();
    } catch {
      toast.error("Failed to delete payment term.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className={isTab ? "w-full space-y-6" : "min-h-screen space-y-6 bg-[#e4e8e1] p-4 md:p-6"}>
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#FFF1E6] border border-[#FFE0CC] text-[#FF7900] rounded-2xl flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">Payment Terms</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage credit terms, schedules, and payment conditions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#153E63] hover:bg-slate-50 font-semibold text-sm transition cursor-pointer shadow-xs"
            title="Export to Excel"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#153E63] hover:bg-[#103454] text-white font-semibold px-5 py-2.5 transition shadow-[0_10px_18px_rgba(21,62,99,0.18)] cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>+ Add Payment Term</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Terms</p>
            <p className="text-2xl font-extrabold text-[#172B4D] mt-1">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center shadow-2xs">
            <Receipt size={22} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E8F8F5] text-[#00A995] flex items-center justify-center shadow-2xs">
            <CheckCircle2 size={22} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.inactive}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-2xs">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
        <div className="flex w-full items-center sm:w-auto">
          <label className="mr-2 text-sm font-medium text-slate-600">Search:</label>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#153E63] focus:bg-white shadow-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-[#153E63] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "INACTIVE"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Inactive ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.04)] overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-white text-[13px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left font-bold w-20 border-r border-[#e06800]">
                  Sr. No.
                </th>
                <th className="px-5 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Payment Term Code
                </th>
                <th className="px-5 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Payment Term Name
                </th>
                <th className="px-5 py-3.5 text-center font-bold w-28 border-r border-[#e06800]">
                  Status
                </th>
                <th className="px-5 py-3.5 text-center font-bold w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#153E63]" />
                    Loading payment terms...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No payment terms found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr
                    key={item.paymentTermId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-4 text-slate-700 font-semibold border-r border-slate-100">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#172B4D] border-r border-slate-100">
                      {item.paymentTermCode}
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-semibold border-r border-slate-100">
                      {item.paymentTermName}
                    </td>
                    <td className="px-5 py-4 text-center border-r border-slate-100">
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
                              item.isActive ? "bg-[#153E63]" : "bg-slate-300"
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
                    <td className="px-5 py-4">
                      <div className="flex justify-center items-center gap-3 w-full">
                        <button
                          onClick={() => handleViewClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete"
                        >
                          <FaTrash size={16} />
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
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-[#153E63]"
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedItem && (
        <ViewPaymentTermModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          paymentTerm={selectedItem}
        />
      )}

      <AddPaymentTermModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchItems}
      />

      {selectedItem && (
        <EditPaymentTermModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchItems}
          paymentTerm={selectedItem}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Payment Term"
        message={`Are you sure you want to delete "${selectedItem?.paymentTermName}" (${selectedItem?.paymentTermCode})?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default PaymentTerm;
