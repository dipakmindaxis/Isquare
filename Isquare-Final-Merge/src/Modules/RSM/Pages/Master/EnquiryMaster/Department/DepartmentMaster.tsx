import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Building2,
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
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentItem,
} from "./DepartmentService";

interface DepartmentMasterProps {
  isTab?: boolean;
}

export const DepartmentMaster: React.FC<DepartmentMasterProps> = ({ isTab = false }) => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentItem | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DepartmentItem | null>(null);

  // Delete modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DepartmentItem | null>(null);

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    departmentName: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getItemId = (item: DepartmentItem): number => {
    return item.id ?? item.ID ?? 0;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllDepartments();
      setItems(data);
    } catch {
      toast.error("Failed to load departments.");
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
      departmentName: "",
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleOpenEdit = (item: DepartmentItem) => {
    setEditingItem(item);
    setFormData({
      departmentName: item.departmentName,
    });
    setErrors({});
    setShowWizard(true);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "Department Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please enter Department Name.");
      return;
    }

    setIsSaving(true);
    try {
      const targetId = editingItem ? getItemId(editingItem) : 0;
      if (editingItem && targetId > 0) {
        await updateDepartment(targetId, {
          departmentName: formData.departmentName.trim(),
        });
        toast.success("Department updated successfully.");
      } else {
        await createDepartment({
          departmentName: formData.departmentName.trim(),
        });
        toast.success("Department created successfully.");
      }

      setShowWizard(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save department.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (item: DepartmentItem) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const targetId = getItemId(itemToDelete);
    try {
      await deleteDepartment(targetId);
      toast.success("Department deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete department.");
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return (
        item.departmentName?.toLowerCase().includes(filterText.toLowerCase()) ||
        String(getItemId(item)).includes(filterText.trim())
      );
    });
  }, [items, filterText]);

  const columns: TableColumn<DepartmentItem>[] = [
    {
      name: "Dept ID",
      cell: (row) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00234a]/10 text-[#00234a]">
            <Building2 size={16} />
          </div>
          <span className="font-mono text-xs font-bold text-[#00234a]">
            #{getItemId(row)}
          </span>
        </div>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Department Name",
      cell: (row) => (
        <span
          className="font-semibold text-slate-800 hover:text-[#F37021] cursor-pointer"
          onClick={() => {
            setSelectedItem(row);
            setIsViewModalOpen(true);
          }}
        >
          {row.departmentName}
        </span>
      ),
      sortable: true,
      grow: 2,
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
      <div
        ref={pageTopRef}
        className={
          isTab
            ? "w-full space-y-6"
            : "min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"
        }
      >
        {!showWizard ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="border-b-2 border-[#F37021] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                Listing of Departments
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

        {/* Form UI styled identical to screenshot */}
        {showWizard && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex bg-[#00234a] p-1.5">
              <div className="flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md bg-white text-[#00234a] shadow-lg border-b-2 border-[#F37021] flex items-center justify-center gap-2 relative pointer-events-none">
                <Building2 size={16} /> DEPARTMENT DETAILS
              </div>
            </div>

            <div className="p-8 bg-white min-h-[220px]">
              <div className="grid w-full grid-cols-1 gap-6 max-w-2xl">
                <div>
                  <label className={labelStyle}>
                    DEPARTMENT NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales, Marketing, HR, Engineering"
                    className={`${baseInputStyle} ${
                      errors.departmentName ? "border-red-500" : ""
                    }`}
                    value={formData.departmentName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, departmentName: e.target.value }))
                    }
                  />
                  {errors.departmentName && (
                    <p className="text-xs text-red-500 mt-1">{errors.departmentName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-10 py-2.5 bg-[#00234a] hover:bg-[#F37021] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving...
                  </>
                ) : editingItem ? (
                  "Update Department"
                ) : (
                  "Save Department"
                )}
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
                  placeholder="Search department name..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
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
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Department Details</h3>
                  <p className="text-xs text-blue-200">ID #{getItemId(selectedItem)}</p>
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
                    Department ID
                  </span>
                  <p className="text-sm font-mono font-bold text-[#00234a]">
                    #{getItemId(selectedItem)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Department Name
                  </span>
                  <p className="text-base font-semibold text-slate-800">
                    {selectedItem.departmentName}
                  </p>
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
        title="Delete Department"
        message={`Are you sure you want to deactivate department "${itemToDelete?.departmentName}"?`}
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

export default DepartmentMaster;