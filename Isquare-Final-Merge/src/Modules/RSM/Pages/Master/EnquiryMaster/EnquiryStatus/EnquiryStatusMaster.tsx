import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  RefreshCw,
  PieChart,
  X,
  Loader2,

} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import { listingTableStyles } from "../../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../../../Components/Common/LogoLoader";
import ConfirmationModal from "../../../../../../Components/Common/ConfirmationModal";
import {
  getAllEnquiryStatuses,
  createEnquiryStatus,
  updateEnquiryStatus,
  deleteEnquiryStatus,
  type EnquiryStatusItem,
} from "./EnquiryStatusService";

interface EnquiryStatusMasterProps {
  isTab?: boolean;
}

export const EnquiryStatusMaster: React.FC<EnquiryStatusMasterProps> = ({ isTab = false }) => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<EnquiryStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<EnquiryStatusItem | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnquiryStatusItem | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EnquiryStatusItem | null>(null);

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllEnquiryStatuses();
      setItems(data);
    } catch {
      toast.error("Failed to load enquiry statuses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextCode = `STS_${String(items.length + 1).padStart(3, "0")}`;
    setFormData({
      code: nextCode,
      name: "",
      description: "",
      sortOrder: items.length > 0 ? Math.max(...items.map((i) => i.enquiryStatusSortOrder || 0)) + 1 : 1,
      isActive: true,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleOpenEdit = (item: EnquiryStatusItem) => {
    setEditingItem(item);
    setFormData({
      code: item.enquiryStatusCode,
      name: item.enquiryStatusName,
      description: item.enquiryStatusDescription || "",
      sortOrder: item.enquiryStatusSortOrder || 0,
      isActive: item.enquiryStatusIsActive,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.code.trim()) newErrors.code = "Status Code is required";
    if (!formData.name.trim()) newErrors.name = "Status Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem?.enquiryStatusId) {
        await updateEnquiryStatus(editingItem.enquiryStatusId, {
          enquiryStatusName: formData.name.trim(),
          enquiryStatusDescription: formData.description.trim(),
          enquiryStatusSortOrder: formData.sortOrder,
          enquiryStatusIsActive: formData.isActive,
        });
        toast.success("Enquiry status updated successfully.");
      } else {
        await createEnquiryStatus({
          enquiryStatusCode: formData.code.trim(),
          enquiryStatusName: formData.name.trim(),
          enquiryStatusDescription: formData.description.trim(),
          enquiryStatusSortOrder: formData.sortOrder,
          enquiryStatusIsActive: formData.isActive,
        });
        toast.success("Enquiry status created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save enquiry status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: EnquiryStatusItem) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteEnquiryStatus(itemToDelete.enquiryStatusId);
      toast.success("Enquiry status deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete enquiry status.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item: EnquiryStatusItem) => {
    try {
      await updateEnquiryStatus(item.enquiryStatusId, {
        enquiryStatusName: item.enquiryStatusName,
        enquiryStatusDescription: item.enquiryStatusDescription,
        enquiryStatusSortOrder: item.enquiryStatusSortOrder,
        enquiryStatusIsActive: !item.enquiryStatusIsActive,
      });
      toast.success(`Enquiry status marked as ${!item.enquiryStatusIsActive ? "Active" : "Inactive"}`);
      loadData();
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.enquiryStatusName.toLowerCase().includes(filterText.toLowerCase()) ||
        item.enquiryStatusCode.toLowerCase().includes(filterText.toLowerCase());
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && item.enquiryStatusIsActive) ||
        (selectedStatus === "Inactive" && !item.enquiryStatusIsActive);
      return matchSearch && matchStatus;
    });
  }, [items, filterText, selectedStatus]);

  const columns: TableColumn<EnquiryStatusItem>[] = [
    {
      name: "Status Code",
      cell: (row) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00234a]/10 text-[#00234a]">
            <PieChart size={16} />
          </div>
          <span className="font-mono text-xs font-bold text-[#00234a]">
            {row.enquiryStatusCode}
          </span>
        </div>
      ),
      sortable: true,
      width: "160px",
    },
    {
      name: "Status Name",
      cell: (row) => (
        <span
          className="font-semibold text-slate-800 hover:text-[#F37021] cursor-pointer"
          onClick={() => {
            setSelectedItem(row);
            setIsViewModalOpen(true);
          }}
        >
          {row.enquiryStatusName}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Sort Order",
      selector: (row) => row.enquiryStatusSortOrder || 0,
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center w-full">
          <label className="relative inline-flex items-center cursor-pointer" onClick={() => handleStatusToggle(row)}>
            <input type="checkbox" checked={row.enquiryStatusIsActive} readOnly className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors relative ${row.enquiryStatusIsActive ? "bg-[#00234a]" : "bg-gray-300"}`}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200" style={{ left: row.enquiryStatusIsActive ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem" }} />
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
                Listing of Enquiry Statuses
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

        {/* Form UI */}
        {showWizard && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex bg-[#00234a] p-1.5">
              <div className="flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md bg-white text-[#00234a] shadow-lg border-b-2 border-[#F37021] flex items-center justify-center gap-2 relative pointer-events-none">
                <PieChart size={16} /> STATUS DETAILS
              </div>
            </div>

            <div className="p-8 bg-white min-h-[350px]">
              <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div>
                    <label className={labelStyle}>
                      STATUS CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. STS_001"
                      className={`${baseInputStyle} ${errors.code ? "border-red-500" : ""}`}
                      value={formData.code}
                      onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      disabled={!!editingItem} // Usually code is not edited after creation
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className={labelStyle}>
                      STATUS NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New, In Progress, Closed"
                      className={`${baseInputStyle} ${errors.name ? "border-red-500" : ""}`}
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelStyle}>DESCRIPTION</label>
                    <textarea
                      rows={3}
                      placeholder="Additional details about this status state..."
                      className={`${baseInputStyle} resize-none`}
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      DISPLAY SORT ORDER
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`${baseInputStyle}`}
                      value={formData.sortOrder}
                      onChange={(e) => setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-bold text-[#00234a] mb-1">Availability Status</h4>
                    <p className="text-[11px] text-slate-500 mb-3">Set whether this enquiry status is visible in dropdowns.</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-5 w-5 rounded border-gray-300 text-[#00234a] focus:ring-[#F37021]"
                      />
                      <span className="text-sm font-semibold text-slate-700">Active and available</span>
                    </label>
                  </div>
                </div>


              </div>
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
              <button type="button" onClick={() => setShowWizard(false)} className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition">
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-10 py-2.5 bg-[#00234a] hover:bg-[#F37021] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : editingItem ? "Update Status" : "Save Status"}
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
                  placeholder="Search code or name..."
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
                  <PieChart size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Status Details</h3>
                  <p className="text-xs text-blue-200">ID #{selectedItem.enquiryStatusId}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Status Code</span>
                  <p className="text-sm font-mono font-bold text-[#00234a]">{selectedItem.enquiryStatusCode}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Status Name</span>
                  <p className="text-base font-semibold text-slate-800">{selectedItem.enquiryStatusName}</p>
                </div>
                {selectedItem.enquiryStatusDescription && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Description</span>
                    <p className="text-sm text-slate-600">{selectedItem.enquiryStatusDescription}</p>
                  </div>
                )}
                <div className="flex items-center gap-6 pt-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Sort Order</span>
                    <p className="text-sm font-semibold text-slate-800">{selectedItem.enquiryStatusSortOrder}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedItem.enquiryStatusIsActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {selectedItem.enquiryStatusIsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
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
        title="Delete Enquiry Status"
        message={`Are you sure you want to permanently delete "${itemToDelete?.enquiryStatusName}" (${itemToDelete?.enquiryStatusCode})?`}
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

export default EnquiryStatusMaster;