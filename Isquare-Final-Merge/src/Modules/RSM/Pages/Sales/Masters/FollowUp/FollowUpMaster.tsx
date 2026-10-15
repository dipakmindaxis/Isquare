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
  Clock,
  X,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import Select from "react-select";
import { toast } from "sonner";
import { listingTableStyles } from "../../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../../../Components/Common/LogoLoader";
import ConfirmationModal from "../../../../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../../../../Utils/exportToExcel";
import {
  getAllFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  type FollowUp,
} from "./Services/FollowUpService";
import { getAllCustomers, type Customer } from "../../../Customer/Services/CustomerService";

interface CustomerOption {
  value: number;
  label: string;
}

export const FollowUpMaster: React.FC = () => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FollowUp | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FollowUp | null>(null);

  // Wizard state
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerId: 0,
    followUpDate: new Date().toISOString().split("T")[0],
    nextFollowUpDate: "",
    remarks: "",
    statusId: 1,
    priorityId: 1,
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [followUpsData, customersData] = await Promise.all([
        getAllFollowUps(),
        getAllCustomers(),
      ]);
      const list = Array.isArray(followUpsData)
        ? followUpsData
        : (followUpsData as any)?.data || [];
      const normalizedList: FollowUp[] = list.map((item: any) => ({
        ...item,
        followUpId: item.followUpId ?? item.id ?? 0,
        customerId: item.customerId ?? item.companyId ?? 0,
        companyId: item.companyId ?? item.customerId ?? 0,
      }));
      setItems(normalizedList);
      setCustomers(Array.isArray(customersData) ? customersData : (customersData as any)?.data || []);
    } catch {
      toast.error("Failed to load follow-up records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const customerOptions: CustomerOption[] = useMemo(() => {
    return customers.map((c) => ({
      value: c.customerId,
      label: `${c.customerName}${c.customerCode ? ` (${c.customerCode})` : ""}`,
    }));
  }, [customers]);

  const getCustomerName = useCallback(
    (customerId: number): string => {
      const found = customers.find((c) => c.customerId === customerId);
      return found ? found.customerName : customerId ? `Customer #${customerId}` : "-";
    },
    [customers]
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      customerId: customerOptions[0]?.value || 0,
      followUpDate: new Date().toISOString().split("T")[0],
      nextFollowUpDate: "",
      remarks: "",
      statusId: 1,
      priorityId: 1,
      isActive: true,
    });
    setErrors({});
    setActiveTab(0);
    setShowWizard(true);
  };

  const handleOpenEdit = (item: FollowUp) => {
    setEditingItem(item);
    setFormData({
      customerId: item.customerId,
      followUpDate: item.followUpDate ? item.followUpDate.split("T")[0] : new Date().toISOString().split("T")[0],
      nextFollowUpDate: item.nextFollowUpDate ? item.nextFollowUpDate.split("T")[0] : "",
      remarks: item.remarks || "",
      statusId: item.statusId || 1,
      priorityId: item.priorityId || 1,
      isActive: item.isActive,
    });
    setErrors({});
    setActiveTab(0);
    setShowWizard(true);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.followUpDate) newErrors.followUpDate = "Follow-Up Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem?.followUpId) {
        await updateFollowUp(editingItem.followUpId, {
          followUpId: editingItem.followUpId,
          customerId: formData.customerId,
          companyId: formData.customerId,
          followUpDate: new Date(formData.followUpDate).toISOString(),
          nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : undefined,
          remarks: formData.remarks.trim(),
          statusId: formData.statusId,
          priorityId: formData.priorityId,
          isActive: formData.isActive,
        });
        toast.success("Follow-up updated successfully.");
      } else {
        await createFollowUp({
          customerId: formData.customerId,
          companyId: formData.customerId,
          followUpDate: new Date(formData.followUpDate).toISOString(),
          nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : undefined,
          remarks: formData.remarks.trim(),
          statusId: formData.statusId,
          priorityId: formData.priorityId,
          isActive: formData.isActive,
        });
        toast.success("Follow-up created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      loadData();
    } catch {
      toast.error("Failed to save follow-up.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: FollowUp) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteFollowUp(itemToDelete.followUpId);
      toast.success("Follow-up deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete follow-up.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item: FollowUp) => {
    try {
      await updateFollowUp(item.followUpId, {
        followUpId: item.followUpId,
        customerId: item.customerId,
        companyId: item.customerId,
        followUpDate: item.followUpDate,
        nextFollowUpDate: item.nextFollowUpDate,
        remarks: item.remarks,
        statusId: item.statusId,
        priorityId: item.priorityId,
        isActive: !item.isActive,
      });
      toast.success(`Follow-up marked as ${!item.isActive ? "Active" : "Inactive"}`);
      loadData();
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const custName = getCustomerName(item.customerId).toLowerCase();
      const remarks = (item.remarks || "").toLowerCase();
      const search = filterText.toLowerCase();
      const matchSearch = custName.includes(search) || remarks.includes(search) || String(item.followUpId).includes(search);
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && item.isActive) ||
        (selectedStatus === "Inactive" && !item.isActive);
      return matchSearch && matchStatus;
    });
  }, [items, filterText, selectedStatus, getCustomerName]);

  const handleExport = () => {
    if (items.length === 0) {
      toast.info("No data available to export.");
      return;
    }
    const exportData = filteredItems.map((item) => ({
      ID: item.followUpId,
      "Customer Name": getCustomerName(item.customerId),
      "Customer ID": item.customerId,
      "Follow-Up Date": item.followUpDate ? item.followUpDate.split("T")[0] : "-",
      "Next Follow-Up Date": item.nextFollowUpDate ? item.nextFollowUpDate.split("T")[0] : "-",
      Remarks: item.remarks || "-",
      Status: item.isActive ? "Active" : "Inactive",
    }));
    exportToExcel(exportData, "FollowUp_Master_List", "FollowUps");
  };

  const columns: TableColumn<FollowUp>[] = [
    {
      name: "Follow-Up ID",
      cell: (row) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00234a]/10 text-[#00234a]">
            <Clock size={16} />
          </div>
          <span className="font-mono text-xs font-bold text-[#00234a]">
            #{row.followUpId}
          </span>
        </div>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Customer",
      cell: (row) => (
        <div className="overflow-hidden">
          <span
            className="font-semibold text-slate-800 hover:text-[#F37021] cursor-pointer block truncate max-w-[200px]"
            onClick={() => {
              setSelectedItem(row);
              setIsViewModalOpen(true);
            }}
          >
            {getCustomerName(row.customerId)}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            ID: {row.customerId}
          </span>
        </div>
      ),
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Follow-Up Date",
      cell: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.followUpDate ? row.followUpDate.split("T")[0] : "-"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Next Follow-Up",
      cell: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.nextFollowUpDate ? row.nextFollowUpDate.split("T")[0] : "-"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Remarks",
      cell: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-[220px] block" title={row.remarks || ""}>
          {row.remarks || "-"}
        </span>
      ),
      grow: 1,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center w-full">
          <label className="relative inline-flex items-center cursor-pointer" onClick={() => handleStatusToggle(row)}>
            <input type="checkbox" checked={row.isActive} readOnly className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors relative ${row.isActive ? "bg-[#00234a]" : "bg-gray-300"}`}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200" style={{ left: row.isActive ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem" }} />
            </div>
          </label>
        </div>
      ),
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
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

  const selectStyles = (hasError: boolean) => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 44,
      borderRadius: "0.5rem",
      borderColor: hasError ? "#ef4444" : state.isFocused ? "#F37021" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #F37021" : "none",
      "&:hover": {
        borderColor: hasError ? "#ef4444" : "#F37021",
      },
    }),
  });

  const selectedCustomerValue = customerOptions.find((c) => c.value === formData.customerId) || null;

  return (
    <>
      <div ref={pageTopRef} className="min-h-screen space-y-6 bg-[#e4e8e1] p-4 md:p-6">
        {!showWizard ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="border-b-2 border-[#F37021] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                Listing of Follow-Up
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
                { label: "Follow-Up Details", icon: <Clock size={16} /> },
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

            <div className="p-8 bg-white min-h-[350px]">
              {activeTab === 0 && (
                <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    {/* Customer Selection (in place of companyId) */}
                    <div>
                      <label className={labelStyle}>
                        SELECT CUSTOMER <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={customerOptions}
                        value={selectedCustomerValue}
                        onChange={(opt) => setFormData((p) => ({ ...p, customerId: opt?.value || 0 }))}
                        isClearable
                        isSearchable
                        placeholder="Select Customer..."
                        styles={selectStyles(!!errors.customerId)}
                      />
                      {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
                    </div>

                    {/* Follow Up Date */}
                    <div>
                      <label className={labelStyle}>
                        FOLLOW-UP DATE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className={`${baseInputStyle} ${errors.followUpDate ? "border-red-500" : ""}`}
                        value={formData.followUpDate}
                        onChange={(e) => setFormData((p) => ({ ...p, followUpDate: e.target.value }))}
                      />
                      {errors.followUpDate && <p className="text-xs text-red-500 mt-1">{errors.followUpDate}</p>}
                    </div>

                    {/* Next Follow Up Date */}
                    <div>
                      <label className={labelStyle}>NEXT FOLLOW-UP DATE</label>
                      <input
                        type="date"
                        className={baseInputStyle}
                        value={formData.nextFollowUpDate}
                        onChange={(e) => setFormData((p) => ({ ...p, nextFollowUpDate: e.target.value }))}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className={labelStyle}>PRIORITY</label>
                      <select
                        className={baseInputStyle}
                        value={formData.priorityId}
                        onChange={(e) => setFormData((p) => ({ ...p, priorityId: Number(e.target.value) }))}
                      >
                        <option value={1}>High Priority</option>
                        <option value={2}>Medium Priority</option>
                        <option value={3}>Low Priority</option>
                      </select>
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                      <label className={labelStyle}>REMARKS / ACTION NOTES</label>
                      <textarea
                        rows={3}
                        placeholder="Enter follow-up details, agenda or discussion outcome..."
                        className={`${baseInputStyle} resize-none`}
                        value={formData.remarks}
                        onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
                      />
                    </div>
                  </div>

                  <aside className="xl:pt-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-center">
                      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 mb-4">
                        FOLLOW-UP PREVIEW
                      </h3>
                      <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-3 shadow-inner">
                        <Building2 size={36} className="text-[#F37021] mb-2" />
                        <span className="text-xs font-bold text-[#00234a] truncate max-w-[120px]">
                          {getCustomerName(formData.customerId) || "Customer"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formData.followUpDate || "Date"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${formData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {formData.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {formData.isActive ? "Active Follow-Up" : "Inactive"}
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
                    <p className="text-xs text-slate-500 mb-4">Set whether this follow-up is active in CRM operations.</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-5 w-5 rounded border-gray-300 text-[#00234a] focus:ring-[#F37021]"
                      />
                      <span className="text-sm font-semibold text-slate-700">Active and available in CRM lists</span>
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
                {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : editingItem ? "Update Follow-Up" : "Save Follow-Up"}
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
                  placeholder="Search customer or remarks..."
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
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Follow-Up Details</h3>
                  <p className="text-xs text-blue-200">ID #{selectedItem.followUpId}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Customer</span>
                  <p className="text-sm font-bold text-[#00234a]">{getCustomerName(selectedItem.customerId)}</p>
                  <p className="text-xs font-mono text-slate-500">ID: {selectedItem.customerId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Follow-Up Date</span>
                  <p className="text-xs font-semibold text-slate-800">{selectedItem.followUpDate ? selectedItem.followUpDate.split("T")[0] : "-"}</p>
                </div>
                {selectedItem.nextFollowUpDate && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Next Follow-Up Date</span>
                    <p className="text-xs font-semibold text-slate-800">{selectedItem.nextFollowUpDate.split("T")[0]}</p>
                  </div>
                )}
                {selectedItem.remarks && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Remarks</span>
                    <p className="text-xs text-slate-700">{selectedItem.remarks}</p>
                  </div>
                )}
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
        title="Delete Follow-Up"
        message={`Are you sure you want to permanently delete Follow-Up #${itemToDelete?.followUpId}?`}
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

export default FollowUpMaster;
