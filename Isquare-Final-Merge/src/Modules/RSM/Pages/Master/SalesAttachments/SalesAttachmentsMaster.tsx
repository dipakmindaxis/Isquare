import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Upload, RefreshCw, Download, FileText, Paperclip } from "lucide-react";
import { FaEye, FaTrash } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import SalesAttachmentWizard from "./SalesAttachmentWizard";
import ViewSalesAttachmentModal from "./ViewSalesAttachmentModal";
import type { SalesAttachmentItem } from "./Types/SalesAttachmentTypes";
import {
  getAllSalesAttachments,
  deleteSalesAttachment,
  downloadSalesAttachment,
} from "./Services/SalesAttachmentService";

export const SalesAttachmentsMaster: React.FC = () => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<SalesAttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<SalesAttachmentItem | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    id: number | string;
    name: string;
  } | null>(null);

  const fetchAttachments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllSalesAttachments();
      setAttachments(data);
    } catch (err: unknown) {
      console.error("Error fetching attachments:", err);
      toast.error("Failed to fetch sales attachments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttachments();

    const handleRefresh = () => {
      fetchAttachments();
    };

    window.addEventListener("app-refresh", handleRefresh);
    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchAttachments]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(
      attachments.map((a) => a.documentType || a.category || "General")
    );
    return ["All", ...Array.from(categories)];
  }, [attachments]);

  const filteredAttachments = useMemo(() => {
    return attachments.filter((item) => {
      const name = (item.fileName || item.name || "").toLowerCase();
      const customer = (item.customerName || "").toLowerCase();
      const category = (item.documentType || item.category || "").toLowerCase();
      const search = filterText.toLowerCase();

      const matchesSearch =
        name.includes(search) ||
        customer.includes(search) ||
        category.includes(search) ||
        String(item.id).includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        (item.documentType || item.category) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [attachments, filterText, selectedCategory]);

  const handleExportClick = () => {
    if (attachments.length === 0) {
      toast.info("No data available to export.");
      return;
    }

    const exportData = filteredAttachments.map((item) => ({
      ID: item.id,
      "File Name": item.fileName || item.name,
      "Document Type": item.documentType || item.category || "Attachment",
      Customer: item.customerName || "-",
      "Enquiry ID": item.enquiryId || "-",
      "Activity ID": item.salesActivityId || item.relatedActivityCode || "-",
      "Size (KB)": item.fileSizeKB || 0,
      "Uploaded Date": item.uploadedDate || item.createdDate || "-",
      "Uploaded By": item.uploadedBy || "Admin",
    }));

    exportToExcel(exportData, "Sales_Attachments_List", "Attachments");
  };

  const handleDeleteRequest = (item: SalesAttachmentItem) => {
    setAttachmentToDelete({
      id: item.id,
      name: item.fileName || item.name,
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return;
    try {
      await deleteSalesAttachment(attachmentToDelete.id);
      toast.success("Attachment deleted successfully.");
      fetchAttachments();
    } catch {
      toast.error("Failed to delete attachment.");
    } finally {
      setIsConfirmModalOpen(false);
      setAttachmentToDelete(null);
    }
  };

  const handleViewClick = (item: SalesAttachmentItem) => {
    setSelectedAttachment(item);
    setIsViewModalOpen(true);
  };

  const handleDownloadClick = (item: SalesAttachmentItem) => {
    downloadSalesAttachment(item.id, item.fileName || item.name);
  };

  const columns: TableColumn<SalesAttachmentItem>[] = [
    {
      name: "File / Document",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00234a]/10 text-[#00234a]">
            {row.isImage ? <FileText size={18} /> : <Paperclip size={18} />}
          </div>
          <div className="overflow-hidden">
            <span
              onClick={() => handleViewClick(row)}
              className="font-semibold text-[#00234a] hover:text-[#F37021] cursor-pointer truncate block max-w-[220px]"
              title={row.fileName || row.name}
            >
              {row.fileName || row.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {row.fileSizeKB ? `${row.fileSizeKB} KB` : "Document"}
            </span>
          </div>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Document Type",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#F37021] border border-orange-200">
          {row.documentType || row.category || "General"}
        </span>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: "Customer",
      selector: (row) => row.customerName || "-",
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Related ID",
      cell: (row) => (
        <div className="text-xs">
          {row.enquiryId && (
            <div className="font-mono text-slate-700">Enq: {row.enquiryId}</div>
          )}
          {(row.salesActivityId || row.relatedActivityCode) && (
            <div className="text-slate-500">
              Act: {row.salesActivityId || row.relatedActivityCode}
            </div>
          )}
          {!row.enquiryId && !row.salesActivityId && !row.relatedActivityCode && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
      width: "140px",
    },
    {
      name: "Upload Date",
      selector: (row) => row.uploadedDate || row.createdDate || "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handleViewClick(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View Details"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleDownloadClick(row)}
            className="text-[#00234a] hover:text-[#F37021] hover:scale-110 transition cursor-pointer"
            title="Download File"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => handleDeleteRequest(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={15} />
          </button>
        </div>
      ),
      width: "140px",
    },
  ];

  return (
    <>
      <div
        ref={pageTopRef}
        className="min-h-screen space-y-6 bg-[#F4F7FB] p-4 md:p-6"
      >
        {/* Header matching EmployeeMaster */}
        {!showWizard ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl font-bold tracking-tight text-gray-900">
                Listing of Sales Attachments
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAttachments}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="rounded-lg bg-[#FF7900] hover:bg-[#E66D00] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center gap-2"
              >
                + Create New
              </button>
            </div>
          </div>
        ) : null}

        {/* Inline Create Form matching EmployeeWizard */}
        {showWizard && (
          <SalesAttachmentWizard
            onCancel={() => setShowWizard(false)}
            onSuccess={() => {
              setShowWizard(false);
              fetchAttachments();
            }}
          />
        )}

        {/* Table Card matching EmployeeMaster */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="p-5 md:p-6">
            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
              {/* Search */}
              <div className="flex w-full items-center md:w-auto">
                <label className="mr-2 text-sm font-medium text-slate-600">
                  Search:
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#F37021] focus:bg-white md:w-72"
                  placeholder="Search file, customer..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>

              {/* Filters & Export */}
              <div className="flex w-full items-center justify-end gap-3 md:w-auto">
                <div className="relative">
                  <select
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#F37021]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All" ? "All Document Types" : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                <button
                  onClick={handleExportClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00234a] bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] transition hover:bg-slate-50 cursor-pointer"
                >
                  <Upload size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredAttachments}
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

      {/* View Attachment Modal */}
      <ViewSalesAttachmentModal
        isOpen={isViewModalOpen}
        attachment={selectedAttachment}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAttachment(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Sales Attachment"
        message={`Are you sure you want to permanently delete "${attachmentToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setAttachmentToDelete(null);
        }}
      />
    </>
  );
};

export default SalesAttachmentsMaster;
