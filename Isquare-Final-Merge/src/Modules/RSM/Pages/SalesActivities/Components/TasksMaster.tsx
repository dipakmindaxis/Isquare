import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Calendar,
  CheckCircle,
  Plus,
  Search,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem, TaskSummaryStats } from "../Types/TaskTypes";
import {
  getAllTasks,
  getTaskSummaryStats,
  completeTask,
} from "../Services/TaskService";
import {
  getPrioritiesWithFallback,
  type PriorityOptionItem,
  type AssigneeOption,
} from "../Services/SalesActivityService";
import { getAllDirectors } from "../../Master/Director/Services/DirectorService";
import { getDirectorEmployees } from "../../Master/BdeUsers/Services/BdeUserService";
import { AddTaskModal } from "./AddTaskModal";
import { ViewTaskModal } from "./ViewTaskModal";

export interface TasksMasterProps {
  initialAddOpen?: boolean;
  onAddClosed?: () => void;
}

export const TasksMaster: React.FC<TasksMasterProps> = ({
  initialAddOpen = false,
  onAddClosed,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<TaskSummaryStats>({
    total: 0,
    pending: 0,
    dueToday: 0,
    overdue: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "today" | "overdue" | "completed">("all");
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>("All");
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>("All");

  // Dropdowns
  const [priorities, setPriorities] = useState<PriorityOptionItem[]>([]);
  const [directors, setDirectors] = useState<AssigneeOption[]>([]);

  // Modals / Inline Form State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(initialAddOpen);

  useEffect(() => {
    if (initialAddOpen !== undefined) {
      setIsAddOpen(initialAddOpen);
    }
  }, [initialAddOpen]);

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    if (onAddClosed) onAddClosed();
  };

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, statsData, prioList, directorEmp, directMaster] = await Promise.all([
        getAllTasks({
          search,
          tabFilter: activeTab,
          priorityId: selectedPriorityId === "All" ? "All" : Number(selectedPriorityId),
          assignedTo: selectedDirectorId === "All" ? "All" : Number(selectedDirectorId),
        }),
        getTaskSummaryStats(),
        getPrioritiesWithFallback(),
        getDirectorEmployees().catch(() => []),
        getAllDirectors().catch(() => []),
      ]);

      setTasks(data);
      setStats(statsData);
      setPriorities(prioList);

      const seen = new Set<string>();
      const dList: AssigneeOption[] = [];
      directorEmp.forEach((d) => {
        if (d && d.id && !seen.has(String(d.id))) {
          seen.add(String(d.id));
          dList.push({
            id: String(d.id),
            name: d.name,
            role: "Director",
            type: "Employee",
          });
        }
      });
      directMaster.forEach((d) => {
        if (d && d.directorId && !seen.has(String(d.directorId))) {
          seen.add(String(d.directorId));
          dList.push({
            id: String(d.directorId),
            name: d.directorName,
            role: "Director",
            type: "Employee",
          });
        }
      });
      setDirectors(dList);
    } catch {
      toast.error("Failed to load tasks and approval requests.");
    } finally {
      setIsLoading(false);
    }
  }, [search, activeTab, selectedPriorityId, selectedDirectorId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleMarkComplete = async (taskId: number) => {
    try {
      await completeTask(taskId);
      toast.success("Task / Request marked as Completed / Approved!");
      loadTasks();
    } catch {
      toast.error("Failed to complete task.");
    }
  };

  const getPriorityBadgeClass = (priorityName?: string) => {
    const p = (priorityName || "").toLowerCase();
    if (p.includes("urgent")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (p.includes("high")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (p.includes("medium")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {isAddOpen ? (
        <AddTaskModal
          isOpen={isAddOpen}
          isModal={false}
          onClose={handleCloseAdd}
          onSuccess={() => {
            handleCloseAdd();
            loadTasks();
          }}
        />
      ) : (
        <>
          {/* 1. Header Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#154068] text-white flex items-center justify-center shadow-xs">
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Task Assignment & Approvals
            </h1>
            <p className="text-xs text-slate-500">
              Submit, track, and assign operational tasks or approval requests to Directors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTasks}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-[#FF7900] hover:bg-[#e06800] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Add Task / Assignment Request</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-extrabold text-[#154068] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending / Approval</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Due Today</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.dueToday}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Overdue</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Completed / Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* 3. Filter Bar & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {(
            [
              { id: "all", label: "All Tasks" },
              { id: "pending", label: "Pending Requests" },
              { id: "today", label: "Due Today" },
              { id: "overdue", label: "Overdue" },
              { id: "completed", label: "Completed / Approved" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#154068] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inputs & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, customer..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriorityId}
              onChange={(e) => setSelectedPriorityId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="All">All Priorities (Urgent, High, Med, Low)</option>
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Director Filter */}
          <div>
            <select
              value={selectedDirectorId}
              onChange={(e) => setSelectedDirectorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="All">All Assigned Directors</option>
              {directors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tasks Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-white border-b border-[#e06800]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Sr.</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Task Title & Details</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Assigned Director</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Customer / Company</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Loading tasks and approval requests...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No tasks found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submit a new task or approval request using "+ Add Task" button above
                    </p>
                  </td>
                </tr>
              ) : (
                tasks.map((task, idx) => {
                  const isDone =
                    task.isCompleted ||
                    task.taskStatusId === 4 ||
                    (task.taskStatusName || "").toLowerCase().includes("completed") ||
                    (task.taskStatusName || "").toLowerCase().includes("approved");

                  const isLate =
                    !isDone &&
                    task.dueDate &&
                    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <tr key={task.taskId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsViewOpen(true);
                          }}
                          className="text-left font-bold text-slate-800 hover:text-[#154068] hover:underline text-xs line-clamp-1 cursor-pointer"
                        >
                          {task.taskTitle}
                        </button>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {task.description || task.remarks || "No description"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        <span className="font-semibold text-[#154068]">
                          {task.assignedToName || `Director #${task.assignedTo}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[160px]">
                        {task.companyName || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span className={isLate ? "text-rose-600 font-bold" : ""}>
                            {task.dueDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadgeClass(
                            task.priorityName
                          )}`}
                        >
                          {task.priorityName || "Medium"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isLate
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isDone ? "Completed" : isLate ? "Overdue" : task.taskStatusName || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsViewOpen(true);
                            }}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="View Task Details"
                          >
                            <Eye size={15} />
                          </button>
                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => handleMarkComplete(task.taskId)}
                              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                              title="Mark as Completed / Approved"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* View Task Modal */}

      <ViewTaskModal
        isOpen={isViewOpen}
        task={selectedTask}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTask(null);
        }}
        onStatusUpdated={loadTasks}
      />
    </div>
  );
};
