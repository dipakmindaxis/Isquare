import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RefreshCw,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  FileSpreadsheet,
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

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

  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const baseInputStyle = "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-[#F37021] focus:ring-1 focus:ring-orange-200 transition";

  return (
    <>
      <div ref={pageTopRef} className={isTab ? "w-full space-y-6" : "min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"}>
        {!showWizard ? (
          <>
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                  Activity Types
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
                  <span>Add Activity Type</span>
                </button>
              </div>
            </div>

            {/* Analytics / Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Total Types
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Active Types
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
                    Inactive Types
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
                  placeholder="Search by code, name, or sub type..."
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
                  className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 relative ${activeTab === idx
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
                        <span className="text-[11px] font-medium text-slate-400 mt-0.5">
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
                      Activity Code
                    </th>
                    <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                      Activity Type Name
                    </th>
                    <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                      Activity Sub Type
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
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        <Loader2 className="animate-spin inline-block mr-2 text-[#00234a]" />
                        Loading activity types...
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        No activity types found.
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
                          {item.code}
                        </td>
                        <td className="px-4 py-4 text-gray-800 font-semibold border-r border-gray-100">
                          {item.value}
                        </td>
                        <td className="px-4 py-4 text-gray-600 border-r border-gray-100">
                          {item.activitySubType || "-"}
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
                  <p className="text-sm font-semibold text-[#00234a]">{selectedItem.code}</p>
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
