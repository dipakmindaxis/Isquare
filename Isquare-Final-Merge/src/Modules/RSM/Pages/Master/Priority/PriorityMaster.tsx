import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  Upload,
  RefreshCw,
  Flag,
  X,
  Loader2,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
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

  const columns: TableColumn<Priority>[] = [
    {
      name: "Priority",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
            style={{
              backgroundColor: `${row.colorCode}20`,
              color: row.colorCode,
              borderColor: `${row.colorCode}40`,
              borderWidth: 1,
            }}
          >
            <Flag size={16} />
          </div>
          <span
            className="font-bold text-slate-800 hover:text-[#F37021] cursor-pointer"
            onClick={() => {
              setSelectedItem(row);
              setIsViewModalOpen(true);
            }}
          >
            {row.priorityName}
          </span>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Color Code",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-slate-300 shadow-sm"
            style={{ backgroundColor: row.colorCode }}
          />
          <span className="font-mono text-xs font-semibold uppercase text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
            {row.colorCode}
          </span>
        </div>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center w-full">
          <label
            className="relative inline-flex items-center cursor-pointer"
            onClick={() => handleStatusToggle(row)}
          >
            <input
              type="checkbox"
              checked={row.isActive}
              readOnly
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors relative ${
                row.isActive ? "bg-[#00234a]" : "bg-gray-300"
              }`}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200"
                style={{
                  left: row.isActive ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem",
                }}
              />
            </div>
          </label>
        </div>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              setSelectedItem(row);
              setIsViewModalOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={15} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit"
          >
            <FaEdit size={15} />
          </button>
          <button
            onClick={() => handleDeleteRequest(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
      width: "130px",
    },
  ];

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const baseInputStyle =
    "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-[#F37021] focus:ring-1 focus:ring-orange-200 transition";

  return (
    <>
      <div ref={pageTopRef} className={isTab ? "w-full space-y-6" : "min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"}>
        {!showWizard ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="border-b-2 border-[#F37021] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                Listing of Priorities
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleOpenAdd}
                className="rounded-xl bg-[#00234a] hover:bg-[#F37021] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
              >
                + Create New
              </button>
            </div>
          </div>
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
                    className={`${baseInputStyle} ${
                      errors.priorityName ? "border-red-500" : ""
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
                        className="font-mono text-sm uppercase outline-none grow"
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
                        className={`h-5 w-5 rounded-full border transition transform hover:scale-110 ${
                          formData.colorCode.toLowerCase() === p.hex.toLowerCase()
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

        {/* Listing Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by priority name or color code..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-[#F37021] focus:bg-white"
                />
              </div>

              <div className="flex w-full items-center justify-end gap-3 md:w-auto">
                <div className="relative">
                  <select
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#F37021]"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00234a] bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] transition hover:bg-slate-50 cursor-pointer"
                >
                  <Upload size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredItems}
                progressComponent={<LogoLoader />}
                pagination
                striped
                highlightOnHover
                progressPending={isLoading}
                customStyles={listingTableStyles}
                persistTableHead
              />
            </div>
          </div>
        </div>
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
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {selectedItem.colorCode}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedItem.isActive
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
