import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  RefreshCw,
  Scale, // Using Scale icon for Unit of Measure
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
  getAllUnitOfMeasures,
  createUnitOfMeasure,
  updateUnitOfMeasure,
  deleteUnitOfMeasure,
  type UnitOfMeasureItem,
} from "./UnitOfMeasureService";

interface UnitOfMeasureMasterProps {
  isTab?: boolean;
}

export const UnitOfMeasureMaster: React.FC<UnitOfMeasureMasterProps> = ({ isTab = false }) => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<UnitOfMeasureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitOfMeasureItem | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnitOfMeasureItem | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UnitOfMeasureItem | null>(null);

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
      const data = await getAllUnitOfMeasures();
      setItems(data);
    } catch {
      toast.error("Failed to load unit of measures.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextCode = `UOM_${String(items.length + 1).padStart(3, "0")}`;
    setFormData({
      code: nextCode,
      name: "",
      description: "",
      sortOrder: items.length > 0 ? Math.max(...items.map((i) => i.unitOfMeasureSortOrder || 0)) + 1 : 1,
      isActive: true,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleOpenEdit = (item: UnitOfMeasureItem) => {
    setEditingItem(item);
    setFormData({
      code: item.unitOfMeasureCode,
      name: item.unitOfMeasureName,
      description: item.unitOfMeasureDescription || "",
      sortOrder: item.unitOfMeasureSortOrder || 0,
      isActive: item.unitOfMeasureIsActive,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.code.trim()) newErrors.code = "UOM Code is required";
    if (!formData.name.trim()) newErrors.name = "UOM Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem?.unitOfMeasureId) {
        await updateUnitOfMeasure(editingItem.unitOfMeasureId, {
          unitOfMeasureName: formData.name.trim(),
          unitOfMeasureDescription: formData.description.trim(),
          unitOfMeasureSortOrder: formData.sortOrder,
          unitOfMeasureIsActive: formData.isActive,
        });
        toast.success("Unit of Measure updated successfully.");
      } else {
        await createUnitOfMeasure({
          unitOfMeasureCode: formData.code.trim(),
          unitOfMeasureName: formData.name.trim(),
          unitOfMeasureDescription: formData.description.trim(),
          unitOfMeasureSortOrder: formData.sortOrder,
          unitOfMeasureIsActive: formData.isActive,
        });
        toast.success("Unit of Measure created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save unit of measure.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: UnitOfMeasureItem) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteUnitOfMeasure(itemToDelete.unitOfMeasureId);
      toast.success("Unit of Measure deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete unit of measure.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item: UnitOfMeasureItem) => {
    try {
      await updateUnitOfMeasure(item.unitOfMeasureId, {
        unitOfMeasureName: item.unitOfMeasureName,
        unitOfMeasureDescription: item.unitOfMeasureDescription,
        unitOfMeasureSortOrder: item.unitOfMeasureSortOrder,
        unitOfMeasureIsActive: !item.unitOfMeasureIsActive,
      });
      toast.success(`Unit of Measure marked as ${!item.unitOfMeasureIsActive ? "Active" : "Inactive"}`);
      loadData();
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.unitOfMeasureName.toLowerCase().includes(filterText.toLowerCase()) ||
        item.unitOfMeasureCode.toLowerCase().includes(filterText.toLowerCase());
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && item.unitOfMeasureIsActive) ||
        (selectedStatus === "Inactive" && !item.unitOfMeasureIsActive);
      return matchSearch && matchStatus;
    });
  }, [items, filterText, selectedStatus]);

  const columns: TableColumn<UnitOfMeasureItem>[] = [
    {
      name: "UOM Code",
      cell: (row) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00234a]/10 text-[#00234a]">
            <Scale size={16} />
          </div>
          <span className="font-mono text-xs font-bold text-[#00234a]">
            {row.unitOfMeasureCode}
          </span>
        </div>
      ),
      sortable: true,
      width: "160px",
    },
    {
      name: "UOM Name",
      cell: (row) => (
        <span
          className="font-semibold text-slate-800 hover:text-[#F37021] cursor-pointer"
          onClick={() => {
            setSelectedItem(row);
            setIsViewModalOpen(true);
          }}
        >
          {row.unitOfMeasureName}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Sort Order",
      selector: (row) => row.unitOfMeasureSortOrder || 0,
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center w-full">
          <label className="relative inline-flex items-center cursor-pointer" onClick={() => handleStatusToggle(row)}>
            <input type="checkbox" checked={row.unitOfMeasureIsActive} readOnly className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors relative ${row.unitOfMeasureIsActive ? "bg-[#00234a]" : "bg-gray-300"}`}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200" style={{ left: row.unitOfMeasureIsActive ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem" }} />
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
                Listing of Unit of Measures
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
                <Scale size={16} /> UOM DETAILS
              </div>
            </div>

            <div className="p-8 bg-white min-h-[350px]">
              <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div>
                    <label className={labelStyle}>
                      UOM CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UOM_001"
                      className={`${baseInputStyle} ${errors.code ? "border-red-500" : ""}`}
                      value={formData.code}
                      onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      disabled={!!editingItem} // Usually code is not edited after creation
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className={labelStyle}>
                      UOM NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kilogram, Meter, Box, Piece"
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
                      placeholder="Additional details about this unit of measure..."
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
                    <p className="text-[11px] text-slate-500 mb-3">Set whether this unit of measure is visible in dropdowns.</p>
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
                {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : editingItem ? "Update UOM" : "Save UOM"}
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
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">UOM Details</h3>
                  <p className="text-xs text-blue-200">ID #{selectedItem.unitOfMeasureId}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">UOM Code</span>
                  <p className="text-sm font-mono font-bold text-[#00234a]">{selectedItem.unitOfMeasureCode}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">UOM Name</span>
                  <p className="text-base font-semibold text-slate-800">{selectedItem.unitOfMeasureName}</p>
                </div>
                {selectedItem.unitOfMeasureDescription && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Description</span>
                    <p className="text-sm text-slate-600">{selectedItem.unitOfMeasureDescription}</p>
                  </div>
                )}
                <div className="flex items-center gap-6 pt-2">
                   <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Sort Order</span>
                    <p className="text-sm font-semibold text-slate-800">{selectedItem.unitOfMeasureSortOrder}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedItem.unitOfMeasureIsActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {selectedItem.unitOfMeasureIsActive ? "Active" : "Inactive"}
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
        title="Delete Unit of Measure"
        message={`Are you sure you want to permanently delete "${itemToDelete?.unitOfMeasureName}" (${itemToDelete?.unitOfMeasureCode})?`}
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

export default UnitOfMeasureMaster;