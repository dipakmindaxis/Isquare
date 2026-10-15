import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllAddressTypes,
  deleteAddressType,
} from "./Services/AddressTypeService";
import type { AddressType as AddressTypeModel } from "./Types/AddressTypeTypes";
import AddAddressTypeModal from "./Components/AddAddressTypeModal";
import EditAddressTypeModal from "./Components/EditAddressTypeModal";
import ViewAddressTypeModal from "./Components/ViewAddressTypeModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const AddressType: React.FC = () => {
  const [addressTypes, setAddressTypes] = useState<AddressTypeModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<AddressTypeModel | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getAllAddressTypes();
      setAddressTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch address types.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo((): AddressTypeModel[] => {
    return addressTypes.filter(
      (item) =>
        (item.addressTypeCode &&
          item.addressTypeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.addressTypeName &&
          item.addressTypeName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [addressTypes, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): AddressTypeModel[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleViewClick = (item: AddressTypeModel): void => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (item: AddressTypeModel): void => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: AddressTypeModel): void => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedItem) return;
    try {
      await deleteAddressType(selectedItem.addressTypeId);
      toast.success(`Address type "${selectedItem.addressTypeName}" deleted.`);
      await fetchItems();
    } catch {
      toast.error("Failed to delete address type.");
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
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Address Type</h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Manage address classification types (Billing, Shipping, Work, Permanent).
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#00234a] hover:bg-[#001833] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Add Address Type</span>
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
                <th className="px-6 py-3.5 text-left">Type Code</th>
                <th className="px-6 py-3.5 text-left">Type Name</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#00234a]" />
                    Loading address types...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No address types found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.addressTypeId}
                    className="hover:bg-gray-50/80 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.addressTypeCode}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {item.addressTypeName}
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
        <ViewAddressTypeModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          addressType={selectedItem}
        />
      )}

      {/* Add Modal */}
      <AddAddressTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchItems}
      />

      {/* Edit Modal */}
      {selectedItem && (
        <EditAddressTypeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchItems}
          addressType={selectedItem}
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
        title="Delete Address Type"
        message={`Are you sure you want to delete "${selectedItem?.addressTypeName}" (${selectedItem?.addressTypeCode})?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AddressType;
