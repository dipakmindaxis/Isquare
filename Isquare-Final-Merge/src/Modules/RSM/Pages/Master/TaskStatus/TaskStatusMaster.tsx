import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllTaskStatuses,
  deleteTaskStatus,
} from "./Services/TaskStatusService";
import type { TaskStatus } from "./Types/TaskStatusTypes";
import AddEditTaskStatusModal from "./Components/AddEditTaskStatusModal";
import ViewTaskStatusModal from "./Components/ViewTaskStatusModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

interface TaskStatusMasterProps {
  isTab?: boolean;
}

export const TaskStatusMaster: React.FC<TaskStatusMasterProps> = ({
  isTab = false,
}) => {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [statusToEdit, setStatusToEdit] = useState<TaskStatus | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<TaskStatus | null>(null);

  // Search & Filter
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchStatuses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTaskStatuses();
      setStatuses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load task statuses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const filteredStatuses = useMemo(() => {
    return statuses.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.statusName.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search);

      const isActive = !item.isDeleted;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && isActive) ||
        (statusFilter === "Inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [statuses, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = statuses.length;
    const active = statuses.filter((s) => !s.isDeleted).length;
    const inactive = statuses.filter((s) => s.isDeleted).length;
    return { total, active, inactive };
  }, [statuses]);

  const handleExport = () => {
    if (!filteredStatuses.length) {
      toast.error("No data to export");
      return;
    }
    const dataToExport = filteredStatuses.map((item, index) => ({
      "Sr. No.": index + 1,
      "Status ID": item.id,
      "Status Name": item.statusName,
      Status: !item.isDeleted ? "Active" : "Inactive",
    }));
    exportToExcel(
      dataToExport,
      `Task_Status_List_${new Date().toISOString().slice(0, 10)}`,
      "Task Statuses"
    );
  };

  const handleDeleteConfirm = async () => {
    if (!statusToDelete) return;
    try {
      await deleteTaskStatus(statusToDelete.id);
      toast.success(`Task status "${statusToDelete.statusName}" deleted successfully!`);
      setStatusToDelete(null);
      fetchStatuses();
    } catch {
      toast.error("Failed to delete task status.");
    }
  };

  const columns: TableColumn<TaskStatus>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "70px",
    },
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
      cell: (row) => (
        <span className="font-semibold text-slate-700">#{row.id}</span>
      ),
    },
    {
      name: "Status Name",
      selector: (row) => row.statusName,
      sortable: true,
      minWidth: "200px",
      grow: 2,
      cell: (row) => (
        <span className="font-bold text-slate-800 text-[13.5px]">
          {row.statusName}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => (!row.isDeleted ? "Active" : "Inactive"),
      sortable: true,
      width: "120px",
      cell: (row) => {
        const isActive = !row.isDeleted;
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
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus(row);
              setIsViewOpen(true);
            }}
            className={actionButtonStyles.view}
            title="View Details"
          >
            <Eye size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusToEdit(row);
              setIsAddEditOpen(true);
            }}
            className={actionButtonStyles.edit}
            title="Edit Status"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setStatusToDelete(row)}
            className={actionButtonStyles.delete}
            title="Delete Status"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-4 ${isTab ? "" : "p-4 md:p-6"}`}>
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7900]">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#172B4D]">
                Task Status
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchStatuses}
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
              onClick={() => {
                setStatusToEdit(null);
                setIsAddEditOpen(true);
              }}
              className="rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white px-4 py-2 text-xs md:text-sm font-semibold shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add Task Status</span>
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
              TOTAL STATUSES
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 size={18} />
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
              placeholder="Search by status name or ID..."
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
                <option value="All">All Statuses</option>
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

        {/* DataTable with Standard Orange Header */}
        <DataTable
          columns={columns}
          data={filteredStatuses}
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          customStyles={listingTableStyles}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          noDataComponent={
            <div className="p-12 text-center text-gray-400 font-medium text-sm">
              No task statuses found.
            </div>
          }
        />
      </div>

      {/* Add / Edit Modal */}
      <AddEditTaskStatusModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setStatusToEdit(null);
        }}
        onSuccess={() => {
          setIsAddEditOpen(false);
          setStatusToEdit(null);
          fetchStatuses();
        }}
        statusToEdit={statusToEdit}
      />

      {/* View Modal */}
      <ViewTaskStatusModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedStatus(null);
        }}
        status={selectedStatus}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusToDelete}
        onClose={() => setStatusToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task Status"
        message={`Are you sure you want to delete status "${statusToDelete?.statusName}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default TaskStatusMaster;
