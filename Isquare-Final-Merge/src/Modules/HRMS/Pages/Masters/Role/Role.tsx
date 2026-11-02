import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllRoles,
  createRole,
  deleteRole,
  type Role,
} from "./Services/RoleService";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import EditRoleModal from "./EditRoleModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Role | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch {
      toast.error("Failed to fetch roles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Role name cannot be empty.");
    setIsSaving(true);
    try {
      await createRole({ name: newName });
      toast.success("Role created successfully!");
      setNewName("");
      fetchItems();
    } catch {
      toast.error("Failed to create role. It may already exist.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      roles.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [roles, searchQuery],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleEditClick = (item: Role) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: Role) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteRole(selectedItem.name);
      toast.success(`Role "${selectedItem.name}" deleted.`);
      fetchItems();
    } catch {
      toast.error("Failed to delete role. It may be in use.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Role Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-[#172B4D] mb-4">
          Add New Role
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-end gap-4"
        >
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Role Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-xs outline-none transition focus:border-[#153E63] focus:bg-white"
              placeholder="e.g., Manager, Employee"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#153E63] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(21,62,99,0.18)] transition hover:bg-[#103454] h-[42px] cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              <span>{isSaving ? "Saving..." : "Add"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex w-full items-center md:w-auto">
          <label className="mr-2 text-sm font-medium text-slate-600">Search:</label>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-700 shadow-xs outline-none transition focus:border-[#153E63] focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Role Records Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-white">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#e06800]">
                  Role Name
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="text-center py-12">
                    <Loader2 className="animate-spin inline-block text-[#153E63] mr-2" />{" "}
                    <span className="text-slate-500 font-medium">Loading roles...</span>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-12 text-slate-500">
                    No roles found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#172B4D] border-r border-slate-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-4">
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
        {totalPages > 0 && (
          <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
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
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <EditRoleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchItems}
          role={selectedItem}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message={`Are you sure you want to delete "${selectedItem?.name}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default Roles;
