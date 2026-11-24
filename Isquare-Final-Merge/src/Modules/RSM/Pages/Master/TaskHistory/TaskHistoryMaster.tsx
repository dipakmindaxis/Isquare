import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllTaskHistories,
  deleteTaskHistory,
} from "./Services/TaskHistoryService";
import type { TaskHistoryItem } from "./Types/TaskHistoryTypes";
import { AddEditTaskHistoryModal } from "./Components/AddEditTaskHistoryModal";
import { ViewTaskHistoryModal } from "./Components/ViewTaskHistoryModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

interface TaskHistoryMasterProps {
  isTab?: boolean;
}

export const TaskHistoryMaster: React.FC<TaskHistoryMasterProps> = ({ isTab = false }) => {
  const [histories, setHistories] = useState<TaskHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<TaskHistoryItem | null>(null);
  const [historyToEdit, setHistoryToEdit] = useState<TaskHistoryItem | null>(null);
  const [historyToDelete, setHistoryToDelete] = useState<TaskHistoryItem | null>(null);

  // Search
  const [search, setSearch] = useState<string>("");

  const fetchHistories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTaskHistories();
      setHistories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load task histories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  const handleDelete = async () => {
    if (!historyToDelete) return;
    try {
      await deleteTaskHistory(historyToDelete.historyId);
      toast.success("Task history entry deleted.");
      setHistoryToDelete(null);
      fetchHistories();
    } catch {
      toast.error("Failed to delete task history entry.");
    }
  };

  const getActivityBadgeClass = (act: string) => {
    const a = act.toLowerCase();
    if (a.includes("approv") || a.includes("complet") || a.includes("complat")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (a.includes("progress")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (a.includes("assign") || a.includes("creat")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (a.includes("reject") || a.includes("cancel")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  const filteredHistories = useMemo(() => {
    if (!search.trim()) return histories;
    const q = search.toLowerCase().trim();
    return histories.filter(
      (h) =>
        (h.taskTitle || "").toLowerCase().includes(q) ||
        (h.activity || "").toLowerCase().includes(q) ||
        (h.remarks || "").toLowerCase().includes(q) ||
        (h.performedByName || "").toLowerCase().includes(q)
    );
  }, [histories, search]);

  const handleExport = () => {
    if (!filteredHistories || filteredHistories.length === 0) {
      toast.error("No task history data to export.");
      return;
    }
    const dataToExport = filteredHistories.map((h, i) => ({
      "Sr. No.": i + 1,
      "Task Title": h.taskTitle || `Task #${h.taskId}`,
      "Activity": h.activity,
      "Performed By": h.performedByName || `Employee #${h.performedBy}`,
      "Performed Date": h.performedDate ? new Date(h.performedDate).toLocaleString() : "-",
      "Remarks": h.remarks || "-",
    }));
    exportToExcel(dataToExport, `Task_History_${new Date().toISOString().slice(0, 10)}`, "History");
  };

  const columns: TableColumn<TaskHistoryItem>[] = [
    { name: "Sr. No.", cell: (_row, i) => (i ?? 0) + 1, width: "65px" },
    {
      name: "Task Title",
      selector: (row) => row.taskTitle || `Task #${row.taskId}`,
      cell: (row) => (
        <span className="font-semibold text-gray-800 text-xs">
          {row.taskTitle || `Task #${row.taskId}`}
        </span>
      ),
      minWidth: "160px",
      grow: 2,
    },
    {
      name: "Activity",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${getActivityBadgeClass(
            row.activity
          )}`}
        >
          {row.activity}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Performed By",
      selector: (row) => row.performedByName || `Employee #${row.performedBy}`,
      cell: (row) => (
        <span className="text-xs font-medium text-gray-700">
          {row.performedByName || `Employee #${row.performedBy}`}
        </span>
      ),
      minWidth: "130px",
    },
    {
      name: "Date & Time",
      selector: (row) => row.performedDate || "",
      cell: (row) => (
        <span className="text-xs text-gray-500 font-mono">
          {row.performedDate ? new Date(row.performedDate).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}
        </span>
      ),
      minWidth: "130px",
    },
    {
      name: "Remarks",
      selector: (row) => row.remarks || "-",
      cell: (row) => (
        <span className="text-xs text-gray-600 truncate max-w-xs" title={row.remarks}>
          {row.remarks || "—"}
        </span>
      ),
      minWidth: "150px",
      grow: 2,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedHistory(row);
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
              setHistoryToEdit(row);
              setIsAddEditOpen(true);
            }}
            className={actionButtonStyles.edit}
            title="Edit Entry"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setHistoryToDelete(row)}
            className={actionButtonStyles.delete}
            title="Delete Entry"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: "115px",
    },
  ];

  return (
    <div className={isTab ? "space-y-4" : "p-4 md:p-6 bg-gray-50 min-h-full space-y-6"}>
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity, task, employee..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF7900] bg-gray-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={fetchHistories}
            className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHistoryToEdit(null);
              setIsAddEditOpen(true);
            }}
            className="px-3.5 py-2 bg-[#FF7900] hover:bg-[#e06800] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus size={14} />
            <span>Add History</span>
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredHistories}
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          pagination
          striped
          highlightOnHover
          customStyles={listingTableStyles}
        />
      </div>

      {/* Modals */}
      <AddEditTaskHistoryModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={fetchHistories}
        historyToEdit={historyToEdit}
      />

      <ViewTaskHistoryModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        history={selectedHistory}
      />

      <ConfirmationModal
        isOpen={Boolean(historyToDelete)}
        onClose={() => setHistoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task History Entry"
        message="Are you sure you want to remove this history log? This action cannot be undone."
      />
    </div>
  );
};
