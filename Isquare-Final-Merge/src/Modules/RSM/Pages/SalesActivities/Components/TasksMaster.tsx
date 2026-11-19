import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import {
  RefreshCw,
  Upload,
  ChevronDown,
  AlertTriangle,
  CheckSquare,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type {
  TaskItem,
  TaskStatusItem,
  TaskSummaryStats,
  TaskActivityFeedItem,
} from "../Types/TaskTypes";
import {
  getAllTasks,
  completeTask,
  deleteTask,
  getAllTaskStatuses,
  getTaskSummaryStats,
  getTaskActivities,
} from "../Services/TaskService";
import {
  getPrioritiesWithFallback,
  type PriorityOptionItem,
} from "../Services/SalesActivityService";
import { AddTaskModal } from "./AddTaskModal";
import { ViewTaskModal } from "./ViewTaskModal";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";

export interface TasksMasterProps {
  initialAddOpen?: boolean;
  onAddClosed?: () => void;
}

const formatEmployeeDisplayName = (name?: string): string => {
  if (!name || name.trim() === "" || name === "—") return "—";
  const trimmed = name.trim();
  if (/^Employee\s*#\d+$/i.test(trimmed)) {
    return "Employee";
  }
  if (/^Director\s*#\d+$/i.test(trimmed)) {
    return "Director";
  }
  return trimmed;
};

export const TasksMaster: React.FC<TasksMasterProps> = ({
  initialAddOpen = false,
  onAddClosed,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View state: "overview" | "tasks" | "activities"
  const [currentView, setCurrentView] = useState<"overview" | "tasks" | "activities">("overview");

  // Summary Stats
  const [stats, setStats] = useState<TaskSummaryStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    dueToday: 0,
    overdue: 0,
    completed: 0,
  });

  // Activities Feed
  const [activities, setActivities] = useState<TaskActivityFeedItem[]>([]);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>("All");

  // Dropdowns
  const [priorities, setPriorities] = useState<PriorityOptionItem[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusItem[]>([]);

  // Modals / Form State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(initialAddOpen);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (initialAddOpen !== undefined) {
      setIsAddOpen(initialAddOpen);
    }
  }, [initialAddOpen]);

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    if (onAddClosed) onAddClosed();
  };

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, prioList, statusList] = await Promise.all([
        getAllTasks(),
        getPrioritiesWithFallback(),
        getAllTaskStatuses(),
      ]);

      setTasks(data);
      setStats(getTaskSummaryStats(data));
      setPriorities(prioList);
      setStatuses(statusList);
      setActivities(getTaskActivities());
    } catch {
      toast.error("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusToggle = async (row: TaskItem) => {
    try {
      const isCurrentlyDone =
        row.isCompleted ||
        row.taskStatusId === 4 ||
        (row.taskStatusName || "").toLowerCase().includes("completed") ||
        (row.taskStatusName || "").toLowerCase().includes("approved");

      if (isCurrentlyDone) {
        toast.info("Task is already completed.");
        return;
      }

      await completeTask(row.taskId);
      toast.success(`Task "${row.taskTitle}" marked as Completed!`);
      loadTasks();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.taskId, taskToDelete.taskTitle);
      toast.success(`Task "${taskToDelete.taskTitle}" deleted successfully!`);
      setTaskToDelete(null);
      if (selectedTask?.taskId === taskToDelete.taskId) {
        setSelectedTask(null);
        setIsViewOpen(false);
      }
      loadTasks();
    } catch {
      toast.error("Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityBadgeClass = (priorityName?: string) => {
    const p = (priorityName || "").toLowerCase();
    if (p.includes("urgent")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (p.includes("high") || p.includes("hig")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (p.includes("medium")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  // Filter tasks based on search, status, and priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = (t.taskTitle || "").toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesCompany = (t.companyName || "").toLowerCase().includes(q);
        const matchesBy = (t.assignedByName || "").toLowerCase().includes(q);
        const matchesTo = (t.assignedToName || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCompany && !matchesBy && !matchesTo) {
          return false;
        }
      }

      // 2. Priority filter
      if (selectedPriorityId && selectedPriorityId !== "All") {
        if (Number(t.priorityId) !== Number(selectedPriorityId)) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter && statusFilter !== "All") {
        const taskStatus = (t.taskStatusName || "").toLowerCase().trim();
        const filter = statusFilter.toLowerCase().trim();
        const isDone =
          t.isCompleted ||
          t.taskStatusId === 4 ||
          taskStatus.includes("completed") ||
          taskStatus.includes("approved");

        if (filter === "completed") return isDone;
        if (filter === "pending") return !isDone && !taskStatus.includes("progress");
        if (filter === "in progress") return !isDone && taskStatus.includes("progress");
        return taskStatus === filter;
      }

      return true;
    });
  }, [tasks, search, selectedPriorityId, statusFilter]);

  const handleExportClick = () => {
    if (!filteredTasks || filteredTasks.length === 0) {
      toast.error("No tasks to export.");
      return;
    }

    const dataToExport = filteredTasks.map((t, index) => ({
      "Sr. No.": index + 1,
      "Company Name": t.companyName || "I-Square Safety Equipments Pvt. Ltd.",
      "Task Title": t.taskTitle,
      "Description": t.description || "-",
      "Assigned By": formatEmployeeDisplayName(t.assignedByName),
      "Assigned To": formatEmployeeDisplayName(t.assignedToName),
      "Due Date": t.dueDate || "-",
      "Priority": t.priorityName || "Medium",
      "Status":
        t.isCompleted || t.taskStatusId === 4
          ? "Completed"
          : t.taskStatusName || "Pending",
    }));

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToExcel(dataToExport, `Task_Assignment_List_${timestamp}`, "Tasks");
  };

  const columns: TableColumn<TaskItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "I-Square Safety Equipments Pvt. Ltd.",
      cell: (row) => (
        <div className="w-full min-w-0 pr-1 break-words whitespace-normal leading-snug">
          <span className="text-[13px] font-medium text-slate-700">
            {row.companyName || "I-Square Safety Equipments Pvt. Ltd."}
          </span>
        </div>
      ),
      minWidth: "160px",
      grow: 2,
      wrap: true,
    },
    {
      name: "Task Title",
      selector: (row) => row.taskTitle,
      cell: (row) => (
        <div className="py-1 w-full min-w-0 pr-2 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setSelectedTask(row);
              setIsViewOpen(true);
            }}
            className="w-full text-left font-semibold text-[#172B4D] hover:text-[#153E63] text-[13px] leading-snug break-words whitespace-normal transition cursor-pointer"
          >
            {row.taskTitle}
          </button>
          {row.description && (
            <p className="text-[11px] text-slate-400 break-words whitespace-normal line-clamp-2 mt-0.5">
              {row.description}
            </p>
          )}
        </div>
      ),
      minWidth: "220px",
      grow: 2.5,
      wrap: true,
    },
    {
      name: "Assigned By",
      selector: (row) => formatEmployeeDisplayName(row.assignedByName),
      cell: (row) => (
        <div className="w-full min-w-0 break-words whitespace-normal">
          <span className="text-[13px] font-medium text-slate-600">
            {formatEmployeeDisplayName(row.assignedByName)}
          </span>
        </div>
      ),
      minWidth: "120px",
      grow: 1,
      wrap: true,
    },
    {
      name: "Assigned To",
      selector: (row) => formatEmployeeDisplayName(row.assignedToName),
      cell: (row) => (
        <div className="w-full min-w-0 break-words whitespace-normal">
          <span className="text-[13px] font-medium text-slate-600">
            {formatEmployeeDisplayName(row.assignedToName)}
          </span>
        </div>
      ),
      minWidth: "120px",
      grow: 1,
      wrap: true,
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate || "—",
      cell: (row) => (
        <div className="text-[12.5px] font-medium text-slate-600 whitespace-nowrap">
          <span>{row.dueDate || "—"}</span>
          {row.reminderTime && (
            <p className="text-[11px] text-slate-400 mt-0.5">Reminder: {row.reminderTime}</p>
          )}
        </div>
      ),
      minWidth: "115px",
      grow: 1,
    },
    {
      name: "Priority",
      selector: (row) => row.priorityName || "Medium",
      cell: (row) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(
            row.priorityName
          )}`}
        >
          {row.priorityName || "Medium"}
        </span>
      ),
      minWidth: "95px",
      grow: 1,
    },
    {
      name: "Status",
      cell: (row) => {
        const isCompleted =
          row.isCompleted ||
          row.taskStatusId === 4 ||
          (row.taskStatusName || "").toLowerCase().includes("completed") ||
          (row.taskStatusName || "").toLowerCase().includes("approved");

        return (
          <div className="flex justify-center w-full">
            <label
              className="relative inline-flex items-center cursor-pointer"
              onClick={() => handleStatusToggle(row)}
              title={isCompleted ? "Completed" : "Click to Mark Completed"}
            >
              <input
                type="checkbox"
                checked={isCompleted}
                readOnly
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${isCompleted ? "bg-[#154068]" : "bg-gray-300"
                  }`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out"
                  style={{
                    left: isCompleted ? "calc(100% - 1.25rem - 0.125rem)" : "0.125rem",
                  }}
                />
              </div>
            </label>
          </div>
        );
      },
      width: "80px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3.5">
          <button
            onClick={() => {
              setSelectedTask(row);
              setIsViewOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View Details"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => setTaskToEdit(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit Task"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => setTaskToDelete(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete Task"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <>
      {/* Top Header Card matching screenshot with View Switcher */}
      {!isAddOpen ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] p-4 md:p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#153E63] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckSquare size={22} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#172B4D]">
                  Task Assignment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track team assignments, tasks and deadlines
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Switcher: Overview, All Tasks, Activities */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentView === "overview"
                      ? "bg-white text-[#153E63] shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("tasks")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentView === "tasks"
                      ? "bg-white text-[#153E63] shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("activities")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentView === "activities"
                      ? "bg-white text-[#153E63] shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Activities
                </button>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadTasks}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm font-semibold text-[#153E63] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                title="Refresh tasks"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>

              {/* Add Task Button */}
              <button
                type="button"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsAddOpen(true);
                }}
                className="rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white px-4 py-2 text-xs md:text-sm font-semibold shadow-[0_10px_18px_rgba(255,121,0,0.22)] transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>+ Add Task</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* INLINE CREATE FORM */}
      {isAddOpen && (
        <AddTaskModal
          isOpen={isAddOpen}
          isModal={false}
          onClose={handleCloseAdd}
          onSuccess={() => {
            handleCloseAdd();
            loadTasks();
          }}
        />
      )}

      {/* KPI METRIC CARDS (Visible in Overview & All Tasks) - Styled like Customer Module */}
      {!isAddOpen && (currentView === "overview" || currentView === "tasks") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          {/* TOTAL TASKS */}
          <div
            onClick={() => setStatusFilter("All")}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 cursor-pointer transition ${
              statusFilter === "All"
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <CheckSquare size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>

          {/* PENDING */}
          <div
            onClick={() => setStatusFilter("Pending")}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 cursor-pointer transition ${
              statusFilter === "Pending"
                ? "border-amber-500 ring-2 ring-amber-500/20"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                Pending
              </p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div
            onClick={() => setStatusFilter("In Progress")}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 cursor-pointer transition ${
              statusFilter === "In Progress"
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <RefreshCw size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                In Progress
              </p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>

          {/* COMPLETED */}
          <div
            onClick={() => setStatusFilter("Completed")}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 cursor-pointer transition ${
              statusFilter === "Completed"
                ? "border-emerald-500 ring-2 ring-emerald-500/20"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                Completed
              </p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1 & 2: OVERVIEW / ALL TASKS TABLE */}
      {!isAddOpen && (currentView === "overview" || currentView === "tasks") && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="p-5 md:p-6">
            {/* Table Section Header in Overview view */}
            {currentView === "overview" && (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#172B4D]">My Assigned Tasks</h3>
                  <p className="text-xs text-slate-500">Tasks assigned to you and active assignments</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView("tasks")}
                  className="text-xs font-semibold text-[#153E63] hover:underline cursor-pointer"
                >
                  View all tasks →
                </button>
              </div>
            )}

            {/* Filter Bar matching EmployeeMaster */}
            <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex w-full items-center md:w-auto">
                <label className="mr-2 text-sm font-medium text-slate-600">Search:</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#153E63] focus:bg-white md:w-72"
                  placeholder="Search by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap w-full items-center justify-end gap-3 md:w-auto">
                <div className="relative">
                  <select
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#153E63]"
                    value={selectedPriorityId}
                    onChange={(e) => setSelectedPriorityId(e.target.value)}
                  >
                    <option value="All">All Priorities</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#153E63]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.statusName}>
                        {s.statusName}
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
                  className="inline-flex items-center gap-2 rounded-xl border border-[#153E63] bg-white px-4 py-2.5 text-sm font-semibold text-[#153E63] transition hover:bg-slate-50 cursor-pointer"
                >
                  <Upload size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredTasks}
                progressComponent={<LogoLoader />}
                pagination
                striped
                highlightOnHover
                progressPending={isLoading}
                customStyles={listingTableStyles}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVITIES FEED */}
      {!isAddOpen && currentView === "activities" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#172B4D]">Team Activity Visibility</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recent task updates and team assignments</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {activities.length} activities
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">
                No team activities recorded yet.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/60 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {act.by ? act.by.slice(0, 1).toUpperCase() : "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{act.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {act.by} {act.customer ? `· ${act.customer}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{act.time}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    Shared
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Task Details Modal */}
      {selectedTask && (
        <ViewTaskModal
          isOpen={isViewOpen}
          task={selectedTask}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedTask(null);
          }}
          onStatusUpdated={loadTasks}
          onDelete={(t) => setTaskToDelete(t)}
          onEdit={(t) => {
            setSelectedTask(null);
            setIsViewOpen(false);
            setTaskToEdit(t);
          }}
        />
      )}

      {/* Edit / Update Task Modal */}
      {taskToEdit && (
        <AddTaskModal
          isOpen={!!taskToEdit}
          isModal={true}
          taskToEdit={taskToEdit}
          onClose={() => setTaskToEdit(null)}
          onSuccess={() => {
            setTaskToEdit(null);
            loadTasks();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Task</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete task{" "}
              <strong className="font-semibold text-slate-800">
                "{taskToDelete.taskTitle}"
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TasksMaster;
