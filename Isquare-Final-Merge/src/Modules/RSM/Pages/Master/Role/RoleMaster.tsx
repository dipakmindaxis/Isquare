import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getAllRoles, deleteRole } from "./Services/RoleService";
import type { Role as RoleType } from "./Types/RoleTypes";
import AddRoleModal from "./Components/AddRoleModal";
import EditRoleModal from "./Components/EditRoleModal";
import ViewRoleModal from "./Components/ViewRoleModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import { ISquareIcon } from "../../../../../Components/Common/ISquareLogo";

interface RoleMasterProps {
  isTab?: boolean;
}

const RoleMaster: React.FC<RoleMasterProps> = ({ isTab = false }) => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<RoleType | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch roles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo((): RoleType[] => {
    return roles.filter((item) => {
      const matchesSearch =
        item.name &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesSearch;
    });
  }, [roles, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): RoleType[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = roles.length;
    const filtered = filteredItems.length;
    return { total, filtered };
  }, [roles, filteredItems]);

  const handleViewClick = (item: RoleType): void => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (item: RoleType): void => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: RoleType): void => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedItem) return;
    try {
      await deleteRole(selectedItem.name);
      toast.success(`Role "${selectedItem.name}" deleted successfully.`);
      await fetchItems();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete role. It may be in use by assigned employees.";
      toast.error(errMsg);
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const exportData = filteredItems.map((item, index) => ({
      "Sr. No.": index + 1,
      "Role Name": item.name || "-",
      "Role ID": item.id || "-",
    }));

    exportToExcel(
      exportData,
      `Roles_${new Date().toISOString().slice(0, 10)}`,
      "Roles"
    );
  };

  return (
    <div
      className={
        isTab
          ? "w-full space-y-4"
          : "p-4 md:p-6 bg-gray-50 min-h-full space-y-5"
      }
    >
      {/* Top Header Card matching project logo aesthetics */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 rounded-xl flex items-center justify-center shrink-0">
              <ISquareIcon size={34} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Role Master
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                  Management
                </span>
              </div>
              <p className="text-gray-500 mt-0.5 text-xs md:text-sm">
                Manage system access roles, employee hierarchy positions, and organizational permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchItems}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh records"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-300 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#FF7900] hover:bg-[#e06800] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-5 mt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#00234a] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Roles</p>
              <p className="text-base font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#FF7900] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Filtered Roles</p>
              <p className="text-base font-bold text-[#FF7900]">{stats.filtered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by role name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Project Logo Orange Header Line */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-white text-xs uppercase tracking-wider border-b border-[#e06800]">
              <tr>
                <th className="px-6 py-4 text-left font-bold w-24">Sr. No.</th>
                <th className="px-6 py-4 text-left font-bold">Role Name</th>
                <th className="px-6 py-4 text-right font-bold w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-500">
                    <LogoLoader />
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-gray-300" />
                      <p className="text-sm font-medium">No roles found.</p>
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
                    key={item.id || item.name}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7900] flex items-center justify-center font-bold text-xs shrink-0">
                        {item.name ? item.name.charAt(0).toUpperCase() : "R"}
                      </div>
                      <span>{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <FaEye size={15} />
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit Role"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete Role"
                        >
                          <FaTrash size={15} />
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
        <div className="flex items-center justify-between text-sm text-gray-600 px-2 py-1">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#FF7900]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:text-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
        <ViewRoleModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          role={selectedItem}
        />
      )}

      {/* Add Modal */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchItems}
      />

      {/* Edit Modal */}
      {selectedItem && (
        <EditRoleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchItems}
          role={selectedItem}
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
        title="Delete Role"
        message={`Are you sure you want to delete role "${selectedItem?.name}"? This action cannot be undone.`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default RoleMaster;
