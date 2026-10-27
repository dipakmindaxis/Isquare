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
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
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
  getAllActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType,
  type ActivityOutcomeItem,
  type ActivityType,
} from "./Services/ActivityTypeService";

interface ActivityTypeMasterProps {
  isTab?: boolean;
}

interface FormState {
  code: string;
  value: string;
  activitySubType: string;
  isActive: boolean;
}

export const ActivityTypeMaster: React.FC<ActivityTypeMasterProps> = ({ isTab = false }) => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ActivityOutcomeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ActivityOutcomeItem | null>(null);

  // Filters
  const [filterText, setFilterText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ActivityOutcomeItem | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ActivityOutcomeItem | null>(null);

  // Wizard state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormState>({
    code: "",
    value: "",
    activitySubType: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data: ActivityType[] = await getAllActivityTypes();
      setItems(data);
    } catch {
      toast.error("Failed to load activity types.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = (): void => {
    setEditingItem(null);
    const nextCode = `OUT_${String(items.length + 1).padStart(3, "0")}`;
    setFormData({
      code: nextCode,
      value: "",
      activitySubType: "",
      isActive: true,
    });
    setErrors({});
    setActiveTab(0);
    setShowWizard(true);
  };

  const handleOpenEdit = (item: ActivityOutcomeItem): void => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      value: item.value,
      activitySubType: item.activitySubType || "",
      isActive: item.isActive,
    });
    setErrors({});
    setActiveTab(0);
    setShowWizard(true);
  };

  const handleSave = async (): Promise<void> => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.code.trim()) newErrors.code = "Activity Code is required";
    if (!formData.value.trim()) newErrors.value = "Activity Type Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem && editingItem.id > 0) {
        await updateActivityType(editingItem.id, {
          id: editingItem.id,
          activityName: formData.value.trim(),
          activitySubType: formData.activitySubType.trim(),
          isActive: formData.isActive,
          isDeleted: false,
        });
        toast.success("Activity type updated successfully.");
      } else {
        await createActivityType({
          activityName: formData.value.trim(),
          activitySubType: formData.activitySubType.trim(),
          isActive: formData.isActive,
          isDeleted: false,
        });
        toast.success("Activity type created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      await loadData();
    } catch {
      toast.error("Failed to save activity type.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: ActivityOutcomeItem): void => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete) return;
    try {
      await deleteActivityType(itemToDelete.id);
      toast.success("Activity type deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete activity type.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item: ActivityOutcomeItem): Promise<void> => {
    try {
      await updateActivityType(item.id, {
        id: item.id,
        activityName: item.value || item.activityName,
        activitySubType: item.activitySubType || "",
        isActive: !item.isActive,
        isDeleted: false,
      });
      toast.success(`Activity type marked as ${!item.isActive ? "Active" : "Inactive"}`);
      loadData();
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = useMemo((): ActivityOutcomeItem[] => {
    const searchLower = filterText.toLowerCase();
    return items.filter((item: ActivityOutcomeItem) => {
      const matchSearch =
        item.value.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) ||
        (item.activitySubType || "").toLowerCase().includes(searchLower);
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && item.isActive) ||
        (selectedStatus === "Inactive" && !item.isActive);
      return matchSearch && matchStatus;
    });
  }, [items, filterText, selectedStatus]);

  const handleExport = (): void => {
    if (items.length === 0) {
      toast.info("No data available to export.");
      return;
    }
    const exportData = filteredItems.map((item: ActivityOutcomeItem) => ({
      ID: item.id,
      Code: item.code,
      "Activity Type Name": item.value,
      "Activity Sub Type": item.activitySubType || "",
      Status: item.isActive ? "Active" : "Inactive",
    }));
    exportToExcel(exportData, "Activity_Types_Master", "ActivityTypes");
  };

  const columns: TableColumn<ActivityOutcomeItem>[] = [
    {
      name: "Activity Code",
      cell: (row: ActivityOutcomeItem) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00234a]/10 text-[#00234a]">
            <CheckCircle2 size={16} />
          </div>
          <span className="font-mono text-xs font-bold text-[#00234a]">
            {row.code}
          </span>
        </div>
      ),
      sortable: true,
      width: "160px",
    },
    {
      name: "Activity Type Name",
      cell: (row: ActivityOutcomeItem) => (
        <span
          className="font-semibold text-slate-800 hover:text-[#F37021] cursor-pointer"
          onClick={() => {
            setSelectedItem(row);
            setIsViewModalOpen(true);
          }}
        >
          {row.value}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Activity Sub Type",
      cell: (row: ActivityOutcomeItem) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {row.activitySubType || "-"}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Status",
      cell: (row: ActivityOutcomeItem) => (
        <div className="flex justify-center w-full">
          <label className="relative inline-flex items-center cursor-pointer" onClick={() => handleStatusToggle(row)}>
            <input type="checkbox" checked={row.isActive} readOnly className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors relative ${row.isActive ? "bg-[#00234a]" : "bg-gray-300"}`}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200" style={{ left: row.isActive ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem" }} />
            </div>
          </label>
        </div>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: ActivityOutcomeItem) => (
        <div className="flex items-center gap-3.5">
          <button onClick={() => { setSelectedItem(row); setIsViewModalOpen(true); }} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`} title="View">
            <FaEye size={15} />
          </button>
          <button onClick={() => handleOpenEdit(row)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`} title="Edit">
            <FaEdit size={15} />
          </button>
          <button onClick={() => handleDeleteRequest(row)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`} title="Delete">
            <FaTrash size={14} />
          </button>
        </div>
      ),
      width: "130px",
    },
  ];

  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const baseInputStyle = "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-[#F37021] focus:ring-1 focus:ring-orange-200 transition";

  return (
    <>
      <div ref={pageTopRef} className={isTab ? "w-full space-y-6" : "min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"}>
        {!showWizard ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="border-b-2 border-[#F37021] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                Listing of Activity Types
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer">
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button onClick={handleOpenAdd} className="rounded-xl bg-[#00234a] hover:bg-[#F37021] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2">
                + Create New
              </button>
            </div>
          </div>
        ) : null}

        {/* Inline Wizard UI */}
        {showWizard && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex bg-[#00234a] p-1.5 gap-1">
              {[
                { label: "Activity Details", icon: <CheckCircle2 size={16} /> },
                { label: "Settings & Status", icon: <Calendar size={16} /> },
              ].map((tab, idx) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 relative ${
                    activeTab === idx
                      ? "bg-white text-[#00234a] shadow-lg scale-[1.02] border-b-2 border-[#F37021]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 bg-white min-h-[300px]">
              {activeTab === 0 && (
                <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    <div>
                      <label className={labelStyle}>
                        ACTIVITY CODE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ACT_001"
                        className={`${baseInputStyle} ${errors.code ? "border-red-500" : ""}`}
                        value={formData.code}
                        onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                      />
                      {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>

                    <div>
                      <label className={labelStyle}>
                        ACTIVITY TYPE NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Customer Visit, Follow-up"
                        className={`${baseInputStyle} ${errors.value ? "border-red-500" : ""}`}
                        value={formData.value}
                        onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                      />
                      {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelStyle}>ACTIVITY SUB TYPE</label>
                      <input
                        type="text"
                        placeholder="e.g. Discovery, Cold Call, Site Audit, Demo"
                        className={baseInputStyle}
                        value={formData.activitySubType}
                        onChange={(e) => setFormData((p) => ({ ...p, activitySubType: e.target.value }))}
                      />
                    </div>
                  </div>

                  <aside className="xl:pt-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-center">
                      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 mb-4">
                        ACTIVITY PREVIEW
                      </h3>
                      <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-3 shadow-inner">
                        <CheckCircle2 size={36} className="text-[#F37021] mb-2" />
                        <span className="text-xs font-bold text-[#00234a] truncate max-w-[120px]">
                          {formData.value || "Activity Type Title"}
                        </span>
                        {formData.activitySubType && (
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                            {formData.activitySubType}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formData.code || "CODE"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${formData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {formData.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {formData.isActive ? "Active Type" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {activeTab === 1 && (
                <div className="max-w-xl space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h4 className="text-sm font-bold text-[#00234a] mb-2">Availability Status</h4>
                    <p className="text-xs text-slate-500 mb-4">Set whether this activity outcome is available for logging.</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-5 w-5 rounded border-gray-300 text-[#00234a] focus:ring-[#F37021]"
                      />
                      <span className="text-sm font-semibold text-slate-700">Active and available in CRM dropdowns</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
              <button type="button" onClick={() => setShowWizard(false)} className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition">
                Cancel
              </button>
              {activeTab === 0 ? (
                <button type="button" onClick={() => setActiveTab(1)} className="px-8 py-2.5 bg-[#00234a] text-white rounded-lg font-normal text-sm hover:bg-[#F37021] transition">
                  Next
                </button>
              ) : (
                <button type="button" onClick={() => setActiveTab(0)} className="px-8 py-2.5 bg-[#00234a] text-white rounded-lg font-normal text-sm hover:bg-[#F37021] transition">
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-10 py-2.5 bg-[#00234a] hover:bg-[#F37021] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : editingItem ? "Update Activity Type" : "Save Activity Type"}
              </button>
            </div>
          </div>
        )}

        {/* Listing Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="p-5 md:p-6">
            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex w-full items-center md:w-auto">
                <label className="mr-2 text-sm font-medium text-slate-600">Search:</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#F37021] focus:bg-white md:w-72"
                  placeholder="Search code, name, or sub type..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
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
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>

                <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-[#00234a] bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] transition hover:bg-slate-50 cursor-pointer">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F37021]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Activity Type Details</h3>
                  <p className="text-xs text-blue-200">ID #{selectedItem.id}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Activity Code</span>
                  <p className="text-sm font-mono font-bold text-[#00234a]">{selectedItem.code}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Activity Type Name</span>
                  <p className="text-base font-semibold text-slate-800">{selectedItem.value}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Activity Sub Type</span>
                  <p className="text-sm font-semibold text-[#00234a]">{selectedItem.activitySubType || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedItem.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {selectedItem.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
              <button onClick={() => setIsViewModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Activity Type"
        message={`Are you sure you want to permanently delete "${itemToDelete?.value}" (${itemToDelete?.code})?`}
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

export default ActivityTypeMaster;
