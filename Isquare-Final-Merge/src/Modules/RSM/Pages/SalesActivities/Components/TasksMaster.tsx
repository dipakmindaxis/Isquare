import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem, TaskSummaryStats, TaskActivityFeedItem } from "../Types/TaskTypes";
import {
  getAllTasks,
  getTaskSummaryStats,
  completeTask,
  getTaskActivities,
} from "../Services/TaskService";
import {
  getPrioritiesWithFallback,
  type PriorityOptionItem,
} from "../Services/SalesActivityService";
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
  const [activities, setActivities] = useState<TaskActivityFeedItem[]>([]);
  const [stats, setStats] = useState<TaskSummaryStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    dueToday: 0,
    overdue: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View state: "overview" | "tasks" | "activities"
  const [currentView, setCurrentView] = useState<"overview" | "tasks" | "activities">("overview");

  // Filters for All Tasks
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>("All");

  // Dropdowns
  const [priorities, setPriorities] = useState<PriorityOptionItem[]>([]);

  // Modals / Form State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(initialAddOpen);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);

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
      const [data, prioList] = await Promise.all([
        getAllTasks({
          search,
          status: statusFilter,
          priorityId: selectedPriorityId === "All" ? "All" : Number(selectedPriorityId),
        }),
        getPrioritiesWithFallback(),
      ]);

      setTasks(data);
      setStats(getTaskSummaryStats(data));
      setPriorities(prioList);
      setActivities(getTaskActivities());
    } catch {
      toast.error("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, selectedPriorityId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleMarkComplete = async (taskId: number) => {
    try {
      await completeTask(taskId);
      toast.success("Task marked as Completed!");
      loadTasks();
    } catch {
      toast.error("Failed to complete task.");
    }
  };

  const getStatusBadge = (task: TaskItem) => {
    const isDone =
      task.isCompleted ||
      task.taskStatusId === 4 ||
      (task.taskStatusName || "").toLowerCase().includes("completed") ||
      (task.taskStatusName || "").toLowerCase().includes("approved");

    if (isDone) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle size={11} /> Completed
        </span>
      );
    }

    if ((task.taskStatusName || "").toLowerCase().includes("progress")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
          <Clock size={11} /> In Progress
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
        <Clock size={11} /> Pending
      </span>
    );
  };

  const getPriorityBadgeClass = (priorityName?: string) => {
    const p = (priorityName || "").toLowerCase();
    if (p.includes("urgent")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (p.includes("high")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (p.includes("medium")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  // Filter tasks based on statusFilter
  const filteredTasks = tasks.filter((t) => {
    const isDone =
      t.isCompleted ||
      t.taskStatusId === 4 ||
      (t.taskStatusName || "").toLowerCase().includes("completed") ||
      (t.taskStatusName || "").toLowerCase().includes("approved");

    const isInProgress = !isDone && (t.taskStatusName || "").toLowerCase().includes("progress");
    const isPending = !isDone && !isInProgress;

    if (statusFilter === "Pending") return isPending;
    if (statusFilter === "In Progress") return isInProgress;
    if (statusFilter === "Completed") return isDone;
    return true;
  });

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
          {/* Header & Navigation Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#00234a] text-white flex items-center justify-center shadow-xs">
                <CheckSquare size={22} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  Task Assignment
                </h1>
                <p className="text-xs text-slate-500">
                  Track team assignments, tasks and deadlines
                </p>
              </div>
            </div>

            {/* Navigation View Switcher + Add Task Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentView("overview")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentView === "overview"
                      ? "bg-white text-[#00234a] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("tasks")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentView === "tasks"
                      ? "bg-white text-[#00234a] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("activities")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentView === "activities"
                      ? "bg-white text-[#00234a] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Activities
                </button>
              </div>

              <button
                type="button"
                onClick={loadTasks}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>

              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-[#FF7900] hover:bg-[#e06800] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: OVERVIEW */}
          {currentView === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* KPI Dashboard Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-extrabold text-[#00234a] mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.completed}</p>
                </div>
              </div>

              {/* My Assigned Tasks Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-sm sm:text-base text-slate-800">
                    My Assigned Tasks
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentView("tasks")}
                    className="text-xs font-semibold text-[#00234a] hover:text-[#FF7900] transition cursor-pointer"
                  >
                    View all tasks →
                  </button>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="text-left py-2.5 px-3">Task Title</th>
                        <th className="text-left py-2.5 px-3">Assigned By</th>
                        <th className="text-left py-2.5 px-3">Assigned To</th>
                        <th className="text-left py-2.5 px-3">Due Date</th>
                        <th className="text-center py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            No tasks assigned yet.
                          </td>
                        </tr>
                      ) : (
                        tasks.slice(0, 5).map((t) => (
                          <tr key={t.taskId} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTask(t);
                                  setIsViewOpen(true);
                                }}
                                className="font-bold text-slate-800 hover:text-blue-600 text-left cursor-pointer"
                              >
                                {t.taskTitle}
                              </button>
                              {t.companyName && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {t.companyName}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3 text-xs font-medium text-slate-700">
                              {t.assignedByName || "—"}
                            </td>
                            <td className="py-3 px-3 text-xs font-medium text-slate-700">
                              {t.assignedToName || "—"}
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-600">
                              {t.dueDate || "—"}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {getStatusBadge(t)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Activity Feed Preview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-800">
                      Team Activity Visibility
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView("activities")}
                    className="text-xs font-semibold text-[#00234a] hover:text-[#FF7900] transition cursor-pointer"
                  >
                    View feed →
                  </button>
                </div>
                <div className="space-y-3 pt-2">
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No team activities recorded yet.
                    </p>
                  ) : (
                    activities.slice(0, 4).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {act.by.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{act.text}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {act.by} {act.customer ? `· ${act.customer}` : ""}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          Shared
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ALL TASKS */}
          {currentView === "tasks" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="All">All statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Priority Level
                    </label>
                    <select
                      value={selectedPriorityId}
                      onChange={(e) => setSelectedPriorityId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="All">All Priorities</option>
                      {priorities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} Priority
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Search Task
                    </label>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-2.5 text-slate-400"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title, assignee, customer..."
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Table (No Task Type column) */}
              <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FF7900] text-white border-b border-[#e06800]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Sr.
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Task Title
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Assigned By
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                            Loading tasks...
                          </td>
                        </tr>
                      ) : filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center">
                            <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">No tasks found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task, idx) => {
                          const isDone =
                            task.isCompleted ||
                            task.taskStatusId === 4 ||
                            (task.taskStatusName || "").toLowerCase().includes("completed") ||
                            (task.taskStatusName || "").toLowerCase().includes("approved");

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
                                  className="font-bold text-slate-900 hover:text-blue-600 text-left transition cursor-pointer"
                                >
                                  {task.taskTitle}
                                </button>
                                {task.description && (
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[200px]">
                                    {task.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                                {task.assignedByName || "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-700 font-semibold">
                                {task.assignedToName || "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                {task.companyName || "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                <p className="font-medium">{task.dueDate || "—"}</p>
                                {task.reminderTime && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Reminder: {task.reminderTime}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getPriorityBadgeClass(
                                    task.priorityName
                                  )}`}
                                >
                                  {task.priorityName || "Medium"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {getStatusBadge(task)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setIsViewOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-[#00234a] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {!isDone && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkComplete(task.taskId)}
                                      className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                      title="Mark as Completed"
                                    >
                                      <CheckCircle size={16} />
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
            </div>
          )}

          {/* VIEW 3: ACTIVITIES FEED */}
          {currentView === "activities" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Activity Feed</h2>
              </div>

              <div className="space-y-3 pt-2">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No team activities recorded yet.
                  </p>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {act.by.slice(0, 1)}
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
        </>
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
        />
      )}
    </div>
  );
};

export default TasksMaster;
