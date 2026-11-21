import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  Plus,
  Search,
  Paperclip,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllTaskAttachments,
  deleteTaskAttachment,
} from "./Services/TaskAttachmentService";
import type { TaskAttachment } from "./Types/TaskAttachmentTypes";
import UploadTaskAttachmentModal from "./Components/UploadTaskAttachmentModal";
import ViewTaskAttachmentModal from "./Components/ViewTaskAttachmentModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface TaskAttachmentMasterProps {
  isTab?: boolean;
}

export const TaskAttachmentMaster: React.FC<TaskAttachmentMasterProps> = ({
  isTab = false,
}) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<TaskAttachment | null>(null);

  // Search & Filter
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchAttachments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTaskAttachments();
      setAttachments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load task attachments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const filteredAttachments = useMemo(() => {
    return attachments.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.documentName.toLowerCase().includes(search.toLowerCase()) ||
        (item.fileName && item.fileName.toLowerCase().includes(search.toLowerCase())) ||
        String(item.taskId).includes(search);

      const isActive = item.isActive && !item.isDeleted;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && isActive) ||
        (statusFilter === "Inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [attachments, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = attachments.length;
    const active = attachments.filter((a) => a.isActive && !a.isDeleted).length;
    const inactive = attachments.filter((a) => !a.isActive || a.isDeleted).length;
    return { total, active, inactive };
  }, [attachments]);

  const handleExport = () => {
    if (!filteredAttachments.length) {
      toast.error("No data to export");
      return;
    }
    const dataToExport = filteredAttachments.map((item, index) => ({
      "Sr. No.": index + 1,
      "Attachment ID": item.attachmentId,
      "Task ID": item.taskId,
      "Document Name": item.documentName,
      "File Name": item.fileName || "—",
      "File Size (KB)": item.fileSize ? (item.fileSize / 1024).toFixed(1) : "—",
      "Uploaded Date": item.uploadedDate ? String(item.uploadedDate).split("T")[0] : "—",
      Status: item.isActive && !item.isDeleted ? "Active" : "Inactive",
    }));
    exportToExcel(
      dataToExport,
      `Task_Attachments_${new Date().toISOString().slice(0, 10)}`,
      "Attachments"
    );
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;
    try {
      await deleteTaskAttachment(attachmentToDelete.attachmentId);
      toast.success(
        `Attachment "${attachmentToDelete.documentName}" deleted successfully!`
      );
      setAttachmentToDelete(null);
      fetchAttachments();
    } catch {
      toast.error("Failed to delete attachment.");
    }
  };

  const columns: TableColumn<TaskAttachment>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "70px",
    },
    {
      name: "Document Name",
      selector: (row) => row.documentName,
      sortable: true,
      minWidth: "180px",
      grow: 2,
      cell: (row) => (
        <div className="py-1">
          <button
            type="button"
            onClick={() => {
              setSelectedAttachment(row);
              setIsViewOpen(true);
            }}
            className="text-left font-bold text-slate-800 hover:text-[#FF7900] text-[13.5px] transition cursor-pointer"
          >
            {row.documentName}
          </button>
          {row.fileName && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {row.fileName}
            </p>
          )}
        </div>
      ),
    },
    {
      name: "Task ID",
      selector: (row) => row.taskId,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span className="font-semibold text-slate-700">#{row.taskId}</span>
      ),
    },
    {
      name: "File Info",
      width: "120px",
      cell: (row) => (
        <div className="text-xs text-slate-600">
          <span className="uppercase font-semibold text-slate-500">
            {row.fileExtension ? row.fileExtension.replace(/^\./, "") : "FILE"}
          </span>
          {row.fileSize && (
            <span className="text-[11px] text-slate-400 block">
              {(row.fileSize / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Uploaded Date",
      selector: (row) => row.uploadedDate || "—",
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.uploadedDate ? String(row.uploadedDate).split("T")[0] : "—"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => (row.isActive && !row.isDeleted ? "Active" : "Inactive"),
      sortable: true,
      width: "120px",
      cell: (row) => {
        const isActive = row.isActive && !row.isDeleted;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      width: "130px",
      cell: (row) => {
        const fileUrl = row.filePath
          ? `${API_ENDPOINTS.BaseUrl.replace(/\/api$/, "")}/${row.filePath.replace(/^\/+/, "")}`
          : undefined;

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedAttachment(row);
                setIsViewOpen(true);
              }}
              className={actionButtonStyles.view}
              title="View Details"
            >
              <Eye size={13} />
            </button>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                title="Download / Open File"
              >
                <Download size={13} />
              </a>
            )}
            <button
              type="button"
              onClick={() => setAttachmentToDelete(row)}
              className={actionButtonStyles.delete}
              title="Delete Attachment"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={`space-y-4 ${isTab ? "" : "p-4 md:p-6"}`}>
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7900]">
              <Paperclip size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#172B4D]">
                Task Attachments
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchAttachments}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm font-semibold text-[#153E63] shadow-sm transition hover:bg-slate-50 cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white px-4 py-2 text-xs md:text-sm font-semibold shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Upload Attachment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* TOTAL */}
        <div
          onClick={() => setStatusFilter("All")}
          className={`bg-white p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === "All"
              ? "border-[#FF7900] ring-2 ring-[#FF7900]/20"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              TOTAL ATTACHMENTS
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Paperclip size={18} />
          </div>
        </div>

        {/* ACTIVE */}
        <div
          onClick={() => setStatusFilter("Active")}
          className={`bg-white p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === "Active"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              ACTIVE
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* INACTIVE */}
        <div
          onClick={() => setStatusFilter("Inactive")}
          className={`bg-white p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === "Inactive"
              ? "border-rose-500 ring-2 ring-rose-500/20"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              INACTIVE
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{stats.inactive}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by document name, file name or Task ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Filter:</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-pointer"
              >
                <option value="All">All Attachments</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredAttachments}
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          customStyles={listingTableStyles}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          noDataComponent={
            <div className="p-12 text-center text-gray-400 font-medium text-sm">
              No task attachments found.
            </div>
          }
        />
      </div>

      {/* Upload Modal */}
      <UploadTaskAttachmentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchAttachments();
        }}
      />

      {/* View Modal */}
      <ViewTaskAttachmentModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedAttachment(null);
        }}
        attachment={selectedAttachment}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!attachmentToDelete}
        onClose={() => setAttachmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task Attachment"
        message={`Are you sure you want to delete attachment "${attachmentToDelete?.documentName}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default TaskAttachmentMaster;
