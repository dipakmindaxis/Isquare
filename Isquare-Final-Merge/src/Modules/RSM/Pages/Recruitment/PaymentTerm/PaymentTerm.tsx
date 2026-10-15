import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
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

const PaymentTerm: React.FC = () => {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PaymentTermType | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const filteredItems = useMemo((): PaymentTermType[] => {
    return paymentTerms.filter(
      (item) =>
        (item.paymentTermCode &&
          item.paymentTermCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (item.paymentTermName &&
          item.paymentTermName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
  }, [paymentTerms, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): PaymentTermType[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

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
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      {/* Top Header Card with Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-slate-100 text-[#00234a] rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payment Terms</h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Manage payment terms, credit limits, and billing conditions.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#00234a] hover:bg-[#001833] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Add Payment Term</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#00234a] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Payment Term Code</th>
                <th className="px-6 py-3.5 text-left">Payment Term Name</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#00234a]" />
                    Loading payment terms...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No payment terms found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.paymentTermId}
                    className="hover:bg-gray-50/80 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.paymentTermCode}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {item.paymentTermName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
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
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 px-2">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none"
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
                className="p-2 border border-gray-200 rounded-lg disabled:text-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:text-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
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

      {/* Add Modal */}
      <AddPaymentTermModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchItems}
      />

      {/* Edit Modal */}
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

      {/* Delete Confirmation Modal */}
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
