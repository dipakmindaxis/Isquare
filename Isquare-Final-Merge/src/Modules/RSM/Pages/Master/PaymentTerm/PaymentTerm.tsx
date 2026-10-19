import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
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
    <div className={isTab ? "w-full space-y-4" : "p-4 md:p-6 bg-gray-50 min-h-full space-y-6"}>
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Payment Terms</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium text-xs transition cursor-pointer shadow-xs"
            title="Export to Excel"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#FF7900] hover:bg-[#E66D00] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-md shadow-orange-500/25 cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>Add Payment Term</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Terms</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt size={20} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-[#FF7900] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-white text-[#FF7900] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              statusFilter === "INACTIVE"
                ? "bg-white text-[#FF7900] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Inactive ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#FF7900] text-white text-xs uppercase tracking-wider border-b border-[#e06800]">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Payment Term Code</th>
                <th className="px-6 py-3.5 text-left font-semibold">Payment Term Name</th>
                <th className="px-6 py-3.5 text-center font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#FF7900]" />
                    Loading payment terms...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    No payment terms found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.paymentTermId}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-bold text-gray-900">
                      {item.paymentTermCode}
                    </td>
                    <td className="px-6 py-3.5 text-gray-800 font-medium">
                      {item.paymentTermName}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-3.5">
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
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 px-2">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-xs focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:text-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:text-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
