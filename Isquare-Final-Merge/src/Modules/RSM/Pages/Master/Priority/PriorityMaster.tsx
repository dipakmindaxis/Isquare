import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RefreshCw,
  Flag,
  X,
  Loader2,
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import {
  getAllPriorities,
  createPriority,
  updatePriority,
  deletePriority,
  type Priority,
} from "./Services/PriorityService";

const COLOR_PRESETS = [
  { name: "Urgent Red", hex: "#dc2626" },
  { name: "High Orange-Red", hex: "#ef4444" },
  { name: "Amber Alert", hex: "#f59e0b" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Cyan Teal", hex: "#06b6d4" },
  { name: "Primary Blue", hex: "#2563eb" },
  { name: "Purple Royal", hex: "#7c3aed" },
  { name: "Navy Theme", hex: "#00234a" },
];

interface PriorityMasterProps {
  isTab?: boolean;
}

export const PriorityMaster: React.FC<PriorityMasterProps> = ({ isTab = false }) => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Priority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<Priority | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Priority | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Priority | null>(null);

  // Wizard state
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    priorityName: "",
    colorCode: "#ef4444",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPriorities();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setItems(list);
    } catch {
      toast.error("Failed to load priority master records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      priorityName: "",
      colorCode: "#ef4444",
      isActive: true,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleOpenEdit = (item: Priority) => {
    setEditingItem(item);
    setFormData({
      priorityName: item.priorityName,
      colorCode: item.colorCode || "#00234a",
      isActive: item.isActive,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.priorityName.trim()) {
      newErrors.priorityName = "Priority Name is required";
    }
    if (!formData.colorCode.trim()) {
      newErrors.colorCode = "Color Code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await updatePriority(editingItem.id, {
          id: editingItem.id,
          priorityName: formData.priorityName.trim(),
          colorCode: formData.colorCode.trim(),
          isActive: formData.isActive,
        });
        toast.success("Priority updated successfully.");
      } else {
        await createPriority({
          priorityName: formData.priorityName.trim(),
          colorCode: formData.colorCode.trim(),
          isActive: formData.isActive,
        });
        toast.success("Priority created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      loadData();
    } catch {
      toast.error("Failed to save priority.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: Priority) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deletePriority(itemToDelete.id);
      toast.success("Priority deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete priority.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item: Priority) => {
    try {
      await updatePriority(item.id, {
        id: item.id,
        priorityName: item.priorityName,
        colorCode: item.colorCode,
        isActive: !item.isActive,
      });
      toast.success(`Priority marked as ${!item.isActive ? "Active" : "Inactive"}`);
      loadData();
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name = (item.priorityName || "").toLowerCase();
      const color = (item.colorCode || "").toLowerCase();
      const search = filterText.toLowerCase();
      const matchSearch = name.includes(search) || color.includes(search);
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && item.isActive) ||
        (selectedStatus === "Inactive" && !item.isActive);
      return matchSearch && matchStatus;
    });
  }, [items, filterText, selectedStatus]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [items]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, selectedStatus]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleExport = () => {
    if (items.length === 0) {
      toast.info("No data available to export.");
      return;
    }
    const exportData = filteredItems.map((item) => ({
      ID: item.id,
      "Priority Name": item.priorityName,
      "Color Code": item.colorCode,
      Status: item.isActive ? "Active" : "Inactive",
    }));
    exportToExcel(exportData, "Priority_Master", "Priorities");
  };

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const baseInputStyle =
    "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-[#F37021] focus:ring-1 focus:ring-orange-200 transition";

  return (
    <>
      <div ref={pageTopRef} className={isTab ? "w-full space-y-6" : "min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"}>
        {!showWizard ? (
          <>
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                  Priority Master
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                  title="Refresh records"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Add Priority</span>
                </button>
              </div>
            </div>

            {/* Analytics / Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Flag size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Total Priorities
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
                    Active Priorities
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Inactive Priorities
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
                  placeholder="Search by priority name or color code..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
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
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex-1 sm:flex-initial ${selectedStatus === status
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                      {status} ({status === "All" ? stats.total : status === "Active" ? stats.active : stats.inactive})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Wizard Form */}
        {showWizard && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#00234a] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
                  style={{ backgroundColor: formData.colorCode || "#F37021" }}
                >
                  <Flag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingItem ? "Edit Priority" : "Create New Priority"}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Configure priority level, status, and UI theme color badge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority Name */}
                <div>
                  <label className={labelStyle}>
                    PRIORITY NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Urgent, High, Medium, Low"
                    value={formData.priorityName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priorityName: e.target.value,
                      }))
                    }
                    className={`${baseInputStyle} ${errors.priorityName ? "border-red-500" : ""
                      }`}
                  />
                  {errors.priorityName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.priorityName}
                    </p>
                  )}
                </div>

                {/* Color Code Picker */}
                <div>
                  <label className={labelStyle}>
                    COLOR CODE <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white grow focus-within:border-[#F37021]">
                      <input
                        type="color"
                        value={formData.colorCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            colorCode: e.target.value,
                          }))
                        }
                        className="h-7 w-7 rounded cursor-pointer border-0 p-0 mr-3"
                      />
                      <input
                        type="text"
                        value={formData.colorCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            colorCode: e.target.value,
                          }))
                        }
                        placeholder="#ef4444"
                        className="text-sm uppercase outline-none grow"
                      />
                    </div>
                    <div
                      className="h-10 px-4 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                      style={{ backgroundColor: formData.colorCode }}
                    >
                      Preview
                    </div>
                  </div>
                  {errors.colorCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.colorCode}
                    </p>
                  )}

                  {/* Preset Swatches */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">
                      Presets:
                    </span>
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, colorCode: p.hex }))
                        }
                        title={p.name}
                        className={`h-5 w-5 rounded-full border transition transform hover:scale-110 ${formData.colorCode.toLowerCase() === p.hex.toLowerCase()
                          ? "ring-2 ring-offset-1 ring-[#00234a] scale-110"
                          : "border-gray-200"
                          }`}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#00234a] focus:ring-[#F37021]"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Active Priority Level (available in task & ticket dropdowns)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl bg-[#00234a] hover:bg-[#F37021] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Priority"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Card matching Reference Standard */}
        {!showWizard && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-[#FF7900] text-white text-[13px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-bold w-16 border-r border-[#e06800]">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                      Priority Name
                    </th>
                    <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                      Color Code
                    </th>
                    <th className="px-4 py-3.5 text-center font-bold w-28 border-r border-[#e06800]">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-center font-bold w-36">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        <Loader2 className="animate-spin inline-block mr-2 text-[#00234a]" />
                        Loading priorities...
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        No priorities found.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-4 text-gray-700 font-semibold border-r border-gray-100">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-4 font-bold text-[#00234a] border-r border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: item.colorCode }}
                            />
                            <span>{item.priorityName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-100">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${item.colorCode}15`,
                              color: item.colorCode,
                              border: `1px solid ${item.colorCode}40`,
                            }}
                          >
                            {item.colorCode}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-gray-100">
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
                                className={`w-11 h-6 rounded-full transition-colors relative ${item.isActive ? "bg-[#00234a]" : "bg-gray-300"
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
                        <td className="px-4 py-4">
                          <div className="flex justify-center items-center gap-3 w-full">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setIsViewModalOpen(true);
                              }}
                              className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                              title="View"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
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
            <div className="bg-white border-t border-gray-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-600 select-none">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 outline-none focus:border-[#FF7900]"
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
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  title="First Page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  title="Last Page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-[#00234a] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: selectedItem.colorCode }}
                >
                  <Flag size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Priority Details</h3>
                  <p className="text-xs text-blue-200">ID #{selectedItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Priority Name
                  </span>
                  <p className="text-lg font-bold text-slate-800">
                    {selectedItem.priorityName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Color Code
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="h-4 w-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: selectedItem.colorCode }}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedItem.colorCode}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedItem.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                      }`}
                  >
                    {selectedItem.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Priority"
        message={`Are you sure you want to permanently delete priority "${itemToDelete?.priorityName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setItemToDelete(null);
        }}
      />
    </>
  );
};

export default PriorityMaster;
