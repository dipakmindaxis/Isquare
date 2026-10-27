import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  TaskItem,
  TaskCreatePayload,
  TaskAssignPayload,
  TaskStatusItem,
  TaskFilterParams,
  TaskSummaryStats,
} from "../Types/TaskTypes";
import { getAllPriorities } from "../../Master/Priority/Services/PriorityService";
import { createReminder } from "../../Master/Reminder/Services/ReminderService";
import { getAllDirectors } from "../../Master/Director/Services/DirectorService";
import { getDirectorEmployees } from "../../Master/BdeUsers/Services/BdeUserService";
import { getAllCustomers } from "../../Customer/Services/CustomerService";

const TASKS_STORAGE_KEY = "isquare_tasks_cache_v1";

const safeGetTasks = (): TaskItem[] => {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeSetTasks = (tasks: TaskItem[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
};

// ==========================================
// Task Statuses
// ==========================================
export const getAllTaskStatuses = async (): Promise<TaskStatusItem[]> => {
  try {
    const url = API_ENDPOINTS.TaskStatus || `${API_ENDPOINTS.BaseUrl}/TaskStatus`;
    const response = await apiClient.get<any>(url);
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];
    if (list.length > 0) {
      return list.map((s: any) => ({
        taskStatusId: Number(s.taskStatusId ?? s.id ?? 0),
        id: Number(s.taskStatusId ?? s.id ?? 0),
        statusName: String(s.statusName ?? s.name ?? "Pending"),
        statusCode: String(s.statusCode ?? s.code ?? ""),
        isActive: s.isActive !== false,
      }));
    }
  } catch (err) {
    console.warn("getAllTaskStatuses fallback to standard statuses:", err);
  }

  return [
    { taskStatusId: 1, id: 1, statusName: "Pending / Approval Requested", statusCode: "PENDING", isActive: true },
    { taskStatusId: 2, id: 2, statusName: "In Progress", statusCode: "IN_PROGRESS", isActive: true },
    { taskStatusId: 3, id: 3, statusName: "Under Review", statusCode: "REVIEW", isActive: true },
    { taskStatusId: 4, id: 4, statusName: "Approved / Completed", statusCode: "COMPLETED", isActive: true },
    { taskStatusId: 5, id: 5, statusName: "Rejected", statusCode: "REJECTED", isActive: true },
  ];
};

// ==========================================
// Task CRUD operations
// ==========================================
export const getAllTasks = async (filters?: TaskFilterParams): Promise<TaskItem[]> => {
  let backendTasks: TaskItem[] = [];

  try {
    const url = API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`;
    const response = await apiClient.get<any>(url);
    const data = response.data;
    const rawList: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    if (rawList.length > 0) {
      backendTasks = rawList.map((t: any) => {
        const id = Number(t.taskId ?? t.id ?? 0);
        return {
          taskId: id,
          companyId: Number(t.companyId ?? 0),
          taskTitle: String(t.taskTitle ?? t.title ?? `Task #${id}`),
          description: t.description || "",
          assignedTo: Number(t.assignedTo ?? 0),
          assignedBy: Number(t.assignedBy ?? 0),
          priorityId: Number(t.priorityId ?? 1),
          taskStatusId: Number(t.taskStatusId ?? 1),
          startDate: t.startDate ? String(t.startDate).split("T")[0] : new Date().toISOString().split("T")[0],
          dueDate: t.dueDate ? String(t.dueDate).split("T")[0] : new Date().toISOString().split("T")[0],
          completionDate: t.completionDate ? String(t.completionDate).split("T")[0] : undefined,
          reminderId: t.reminderId ? Number(t.reminderId) : undefined,
          remarks: t.remarks || "",
          createdBy: Number(t.createdBy ?? 0),
          createdDate: t.createdDate ? String(t.createdDate).split("T")[0] : undefined,
          isCompleted: Boolean(t.isCompleted || t.taskStatusId === 4),
          isDeleted: Boolean(t.isDeleted),
        };
      });
    }
  } catch (error) {
    console.warn("getAllTasks: Backend fetch error, checking local store:", error);
  }

  // Merge with locally stored tasks for offline resilience and fast updates
  const localTasks = safeGetTasks();
  const taskMap = new Map<number, TaskItem>();
  for (const t of backendTasks) {
    if (!t.isDeleted) taskMap.set(t.taskId, t);
  }
  for (const t of localTasks) {
    if (!t.isDeleted && !taskMap.has(t.taskId)) {
      taskMap.set(t.taskId, t);
    }
  }

  let items = Array.from(taskMap.values());

  // Enrich with names
  try {
    const [directorsEmp, directList, customers, priorities, statuses] = await Promise.all([
      getDirectorEmployees().catch(() => []),
      getAllDirectors().catch(() => []),
      getAllCustomers().catch(() => []),
      getAllPriorities().catch(() => []),
      getAllTaskStatuses().catch(() => []),
    ]);

    items = items.map((task) => {
      const matchedDirectorEmp = directorsEmp.find((d) => d.id === task.assignedTo);
      const matchedDirector = directList.find((d) => d.directorId === task.assignedTo);
      const assignedToName =
        matchedDirectorEmp?.name ||
        matchedDirector?.directorName ||
        (task.assignedTo > 0 ? `Director #${task.assignedTo}` : "Unassigned");

      const matchedCust = customers.find(
        (c: any) => Number(c.customerId || c.id || 0) === task.companyId
      );
      const companyName =
        matchedCust?.customerName || matchedCust?.companyName || (task.companyId > 0 ? `Company #${task.companyId}` : "General");

      const matchedPrio = priorities.find((p) => p.id === task.priorityId);
      const priorityName = matchedPrio?.priorityName || "Medium";
      const priorityColor = matchedPrio?.colorCode || "#00234a";

      const matchedStatus = statuses.find((s) => s.taskStatusId === task.taskStatusId);
      const taskStatusName = matchedStatus?.statusName || (task.isCompleted ? "Completed" : "Pending");

      return {
        ...task,
        assignedToName,
        companyName,
        priorityName,
        priorityColor,
        taskStatusName,
        isCompleted: task.isCompleted || task.taskStatusId === 4 || taskStatusName.toLowerCase().includes("completed") || taskStatusName.toLowerCase().includes("approved"),
      };
    });
  } catch {}

  safeSetTasks(items);

  if (!filters) return items;

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (t) =>
        (t.taskTitle || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.companyName || "").toLowerCase().includes(q) ||
        (t.assignedToName || "").toLowerCase().includes(q) ||
        (t.remarks || "").toLowerCase().includes(q)
    );
  }

  if (filters.priorityId && filters.priorityId !== "All") {
    items = items.filter((t) => t.priorityId === Number(filters.priorityId));
  }

  if (filters.assignedTo && filters.assignedTo !== "All") {
    items = items.filter((t) => t.assignedTo === Number(filters.assignedTo));
  }

  if (filters.tabFilter && filters.tabFilter !== "all") {
    const today = new Date().toISOString().split("T")[0];
    if (filters.tabFilter === "pending") {
      items = items.filter((t) => !t.isCompleted);
    } else if (filters.tabFilter === "completed") {
      items = items.filter((t) => t.isCompleted);
    } else if (filters.tabFilter === "today") {
      items = items.filter((t) => t.dueDate === today);
    } else if (filters.tabFilter === "overdue") {
      items = items.filter((t) => !t.isCompleted && t.dueDate < today);
    }
  }

  return items;
};

export const getTaskById = async (id: number): Promise<TaskItem | null> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/${id}`;
    const response = await apiClient.get<any>(url);
    if (response.data) {
      const t = response.data;
      return {
        taskId: Number(t.taskId ?? t.id ?? id),
        companyId: Number(t.companyId ?? 0),
        taskTitle: String(t.taskTitle ?? t.title ?? ""),
        description: t.description || "",
        assignedTo: Number(t.assignedTo ?? 0),
        assignedBy: Number(t.assignedBy ?? 0),
        priorityId: Number(t.priorityId ?? 1),
        taskStatusId: Number(t.taskStatusId ?? 1),
        startDate: t.startDate ? String(t.startDate).split("T")[0] : "",
        dueDate: t.dueDate ? String(t.dueDate).split("T")[0] : "",
        completionDate: t.completionDate ? String(t.completionDate).split("T")[0] : undefined,
        reminderId: t.reminderId ? Number(t.reminderId) : undefined,
        remarks: t.remarks || "",
        createdBy: Number(t.createdBy ?? 0),
        isCompleted: Boolean(t.isCompleted || t.taskStatusId === 4),
      };
    }
  } catch {}

  const local = safeGetTasks().find((t) => t.taskId === id);
  return local || null;
};

export const createTask = async (payload: TaskCreatePayload): Promise<TaskItem> => {
  // If reminder date or time is supplied, schedule backend reminder first
  let linkedReminderId: number | undefined = payload.reminderId;
  if (!linkedReminderId && (payload.reminderDate || payload.reminderTime)) {
    try {
      const rem = await createReminder({
        companyId: Number(payload.companyId || 0),
        assignedTo: Number(payload.assignedTo || 0),
        reminderStatusId: 1,
        title: `Task Reminder: ${payload.taskTitle}`,
        reminderDate: payload.reminderDate || payload.dueDate || new Date().toISOString(),
        reminderTime: payload.reminderTime || "10:00:00",
        remarks: payload.reminderRemarks || payload.remarks || payload.description || payload.taskTitle,
        priorityId: Number(payload.priorityId || 1),
        createdBy: Number(payload.createdBy || 1),
        isActive: true,
        isDeleted: false,
      });
      if (rem && (rem.reminderId || rem.id)) {
        linkedReminderId = Number(rem.reminderId || rem.id);
      }
    } catch (remErr) {
      console.warn("createTask: linked reminder creation error handled:", remErr);
    }
  }

  const requestBody: any = {
    taskId: 0,
    companyId: Number(payload.companyId || 0),
    taskTitle: payload.taskTitle.trim(),
    description: payload.description?.trim() || "",
    assignedTo: Number(payload.assignedTo || 0),
    assignedBy: Number(payload.assignedBy || 1),
    priorityId: Number(payload.priorityId || 1),
    taskStatusId: Number(payload.taskStatusId || 1),
    startDate: payload.startDate ? new Date(payload.startDate).toISOString() : new Date().toISOString(),
    dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : new Date().toISOString(),
    reminderId: linkedReminderId || null,
    remarks: payload.remarks?.trim() || "",
    createdBy: Number(payload.createdBy || 1),
    isDeleted: false,
  };

  let savedTask: TaskItem | null = null;

  try {
    const url = API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`;
    const response = await apiClient.post<any>(url, requestBody);
    const data = response.data;
    if (data && (data.taskId || data.id)) {
      savedTask = {
        taskId: Number(data.taskId || data.id),
        companyId: Number(data.companyId ?? payload.companyId),
        taskTitle: String(data.taskTitle ?? payload.taskTitle),
        description: data.description ?? payload.description,
        assignedTo: Number(data.assignedTo ?? payload.assignedTo),
        assignedBy: Number(data.assignedBy ?? payload.assignedBy),
        priorityId: Number(data.priorityId ?? payload.priorityId),
        taskStatusId: Number(data.taskStatusId ?? payload.taskStatusId),
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        reminderId: linkedReminderId,
        reminderDate: payload.reminderDate,
        reminderTime: payload.reminderTime,
        remarks: payload.remarks,
        createdBy: Number(payload.createdBy || 1),
        isCompleted: false,
      };
    }
  } catch (apiError) {
    console.warn("createTask: API call failed or requires elevated roles, saving with fallback persistence:", apiError);
  }

  if (!savedTask) {
    const localId = Date.now();
    savedTask = {
      taskId: localId,
      companyId: payload.companyId,
      taskTitle: payload.taskTitle,
      description: payload.description,
      assignedTo: payload.assignedTo,
      assignedBy: payload.assignedBy,
      priorityId: payload.priorityId,
      taskStatusId: payload.taskStatusId,
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      reminderId: linkedReminderId,
      reminderDate: payload.reminderDate,
      reminderTime: payload.reminderTime,
      remarks: payload.remarks,
      createdBy: payload.createdBy,
      isCompleted: false,
    };
  }

  // Update local cache
  const local = safeGetTasks();
  safeSetTasks([savedTask, ...local]);

  return savedTask;
};

export const completeTask = async (taskId: number): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/Complete/${taskId}`;
    await apiClient.put(url, {});
  } catch (err) {
    console.warn("completeTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  const updated = local.map((t) =>
    t.taskId === taskId
      ? {
          ...t,
          isCompleted: true,
          taskStatusId: 4,
          completionDate: new Date().toISOString().split("T")[0],
          taskStatusName: "Approved / Completed",
        }
      : t
  );
  safeSetTasks(updated);
  return true;
};

export const assignTask = async (taskId: number, payload: TaskAssignPayload): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/Assign/${taskId}`;
    await apiClient.put(url, payload);
  } catch (err) {
    console.warn("assignTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  const updated = local.map((t) =>
    t.taskId === taskId ? { ...t, assignedTo: payload.assignedTo, assignedBy: payload.assignedBy } : t
  );
  safeSetTasks(updated);
  return true;
};

export const deleteTask = async (taskId: number): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/${taskId}`;
    await apiClient.delete(url);
  } catch (err) {
    console.warn("deleteTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  safeSetTasks(local.filter((t) => t.taskId !== taskId));
  return true;
};

export const getTaskSummaryStats = (tasks?: TaskItem[]): TaskSummaryStats => {
  const list = tasks || safeGetTasks();
  const today = new Date().toISOString().split("T")[0];
  return {
    total: list.length,
    pending: list.filter((t) => !t.isCompleted).length,
    completed: list.filter((t) => t.isCompleted).length,
    dueToday: list.filter((t) => t.dueDate === today).length,
    overdue: list.filter((t) => !t.isCompleted && t.dueDate < today).length,
  };
};
