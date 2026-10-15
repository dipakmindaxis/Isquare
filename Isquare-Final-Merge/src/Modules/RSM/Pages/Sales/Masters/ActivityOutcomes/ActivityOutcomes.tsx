import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import {
  getActivityOutcomes,
  saveActivityOutcome,
  deleteActivityOutcome,
} from "../../../SalesActivities/Services/SalesActivityService";
import type { ActivityOutcomeItem } from "../../../SalesActivities/Services/SalesActivityService";
import ConfirmationModal from "../../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../../Components/Common/buttonStyles";

export const ActivityOutcomes: React.FC = () => {
  const [items, setItems] = useState<ActivityOutcomeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActivityOutcomeItem | null>(null);

  // Form State
  const [formValue, setFormValue] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategory, setFormCategory] = useState<"Call" | "Meeting" | "General">("Call");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getActivityOutcomes();
      setItems(data);
    } catch {
      toast.error("Failed to load activity outcomes.");
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
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormValue("");
    const nextCodeNum = items.length + 1;
    setFormCode(`OUT_${String(nextCodeNum).padStart(3, "0")}`);
    setFormCategory("Call");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ActivityOutcomeItem) => {
    setSelectedItem(item);
    setFormValue(item.value);
    setFormCode(item.code);
    setFormCategory(item.category);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleOpenView = (item: ActivityOutcomeItem) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleToggleStatus = async (item: ActivityOutcomeItem) => {
    try {
      const updated = await saveActivityOutcome({
        id: item.id,
        value: item.value,
        code: item.code,
        category: item.category,
        isActive: !item.isActive,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast.success(
        `Outcome "${item.value}" marked as ${!item.isActive ? "Active" : "Inactive"}`
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim()) {
      toast.error("Please enter an outcome value.");
      return;
    }
    setIsSaving(true);
    try {
      await saveActivityOutcome({
        id: selectedItem ? selectedItem.id : undefined,
        value: formValue.trim(),
        code: formCode.trim() || `OUT_${Date.now().toString().slice(-3)}`,
        category: formCategory,
        isActive: formIsActive,
      });
      await loadData();
      setIsModalOpen(false);
      toast.success(
        selectedItem ? "Outcome updated." : "New outcome added successfully."
      );
    } catch {
      toast.error("Failed to save outcome.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteActivityOutcome(selectedItem.id);
      await loadData();
      setIsDeleteOpen(false);
      toast.success(`Outcome "${selectedItem.value}" deleted.`);
    } catch {
      toast.error("Failed to delete outcome.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Activity Outcomes Master</h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Sales Activity Lookup
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-xs">
              Configure Call & Meeting outcome tags (Connected, Quotation Requested, Demo Success, Closed Won).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#00234a] hover:bg-[#001833] text-white font-medium px-4 py-2 rounded-lg transition shadow-xs cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>Add Outcome</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by outcome name or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00234a]/20 focus:border-[#00234a]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00234a]/20"
              >
                <option value="All">All Categories</option>
                <option value="Call">Calls</option>
                <option value="Meeting">Meetings</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00234a]/20"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#00234a]" />
            <span className="text-xs">Loading outcomes...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No outcomes found</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Add Outcome&quot; to configure a new outcome tag.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#154068] text-white border-b border-[#0f2f4d]">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-16 text-center">
                    #
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Outcome Name / Label
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-28 text-center">
                    Category
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-36">
                    Code / Key
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-28 text-center">
                    Status
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-28 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((item, idx) => {
                  const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-gray-500 font-medium">
                        {serialNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          {item.value}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.category === "Call"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.category === "Meeting"
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                            item.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(item)}
                            title="View"
                            className={actionButtonStyles.view}
                          >
                            <FaEye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className={actionButtonStyles.edit}
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDeleteOpen(true);
                            }}
                            title="Delete"
                            className={actionButtonStyles.delete}
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 text-xs text-gray-600 bg-gray-50/50">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
              {filteredItems.length} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-xs font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                    <CheckCircle2 size={16} />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {selectedItem ? "Edit Outcome" : "Add New Outcome"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Outcome Name / Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. Connected - Positive Interest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00234a]/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Applicable Module
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00234a]/20"
                    >
                      <option value="Call">Phone Calls</option>
                      <option value="Meeting">Meetings / Visits</option>
                      <option value="General">General / All</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Code / Key
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. OUT_011"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#00234a]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveOutcomeCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#00234a] rounded border-gray-300"
                  />
                  <label
                    htmlFor="isActiveOutcomeCheck"
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    Active Status (Available in CRM Activity forms)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs bg-[#00234a] hover:bg-[#001833] text-white rounded-lg font-medium transition shadow-xs flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 size={13} className="animate-spin" />}
                  <span>{selectedItem ? "Save Changes" : "Create Outcome"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">Outcome Details</h3>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Outcome Name:</span>
                <span className="font-semibold text-gray-900 text-sm">{selectedItem.value}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Category:</span>
                <span className="font-medium text-gray-800">{selectedItem.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Code / Identifier:</span>
                <span className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                  {selectedItem.code}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Active Status:</span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    selectedItem.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Outcome"
        message={`Are you sure you want to delete "${selectedItem?.value}"? This will remove it from future activity options.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ActivityOutcomes;
