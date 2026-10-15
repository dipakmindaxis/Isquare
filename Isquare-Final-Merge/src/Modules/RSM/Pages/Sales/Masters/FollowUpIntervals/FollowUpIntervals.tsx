import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Upload,
  Download,
  X,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import {
  getFollowUpIntervals,
  saveFollowUpInterval,
  deleteFollowUpInterval,
} from "../../../SalesActivities/Services/SalesActivityService";
import type { FollowUpIntervalItem } from "../../../SalesActivities/Services/SalesActivityService";
import ConfirmationModal from "../../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../../Components/Common/buttonStyles";

export const FollowUpIntervals: React.FC = () => {
  const [items, setItems] = useState<FollowUpIntervalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FollowUpIntervalItem | null>(null);

  // Form State
  const [formValue, setFormValue] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFollowUpIntervals();
      setItems(data);
    } catch {
      toast.error("Failed to load follow-up intervals.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.isActive) ||
        (statusFilter === "Inactive" && !item.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormValue("");
    const nextCodeNum = items.length + 1;
    setFormCode(`INT_${String(nextCodeNum).padStart(3, "0")}`);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FollowUpIntervalItem) => {
    setSelectedItem(item);
    setFormValue(item.value);
    setFormCode(item.code);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleOpenView = (item: FollowUpIntervalItem) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim()) {
      toast.error("Value / Name is required.");
      return;
    }
    if (!formCode.trim()) {
      toast.error("Code / Key is required.");
      return;
    }

    setIsSaving(true);
    try {
      await saveFollowUpInterval({
        id: selectedItem?.id,
        value: formValue.trim(),
        code: formCode.trim().toUpperCase(),
        isActive: formIsActive,
      });
      await loadData();
      setIsModalOpen(false);
      toast.success(
        selectedItem
          ? "Follow-up interval updated successfully!"
          : "Follow-up interval added successfully!"
      );
    } catch {
      toast.error("Failed to save follow-up interval.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteFollowUpInterval(selectedItem.id);
      await loadData();
      setIsDeleteOpen(false);
      setSelectedItem(null);
      toast.success("Follow-up interval deleted.");
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 font-medium">
        CRM / Sales Masters /{" "}
        <span className="text-[#154068] font-bold">Follow-up Intervals</span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Follow-up Intervals
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Standard reminder frequencies for sales team.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toast.info("Import feature ready")}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              <Upload size={14} className="text-gray-500" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={() => toast.success("Exported intervals to CSV")}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Download size={14} className="text-emerald-600" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Add New</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, company, code, name..."
              className="w-full pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Records</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">SR NO</th>
                <th className="py-3.5 px-4">VALUE / NAME</th>
                <th className="py-3.5 px-4">CODE / KEY</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading intervals...</span>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Clock size={28} className="mx-auto mb-2 opacity-40" />
                    <span>No intervals found. Click "+ Add New" to add one.</span>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-600">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {item.value}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenView(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View"
                        >
                          <FaEye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteOpen(true);
                          }}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete"
                        >
                          <FaTrash size={13} />
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
          <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
            <span>
              Showing {paginatedItems.length} of {filteredItems.length} records
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal (Matching Screenshot 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-blue-600 mb-0.5">
                    Master Maintenance
                  </p>
                  <h3 className="font-bold text-base text-gray-900">
                    {selectedItem
                      ? "Edit Follow-up Intervals Value"
                      : "Add Follow-up Intervals Value"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Value / Name *
                  </label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. Plant Visit"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Code / Key *
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="INT_007"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </label>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Status
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Master Value</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Interval Details</h3>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Value / Name</p>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedItem.value}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Code / Key</p>
                <p className="font-mono text-gray-700 mt-0.5">{selectedItem.code}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Status</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                  {selectedItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Follow-up Interval"
        message={`Are you sure you want to delete interval "${selectedItem?.value}"?`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default FollowUpIntervals;
