import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { TaskHistoryItem, CreateTaskHistoryPayload } from "../Types/TaskHistoryTypes";
import { getAllTasks } from "../../../SalesActivities/Services/TaskService";
import { getEmployees } from "../../../Customer/Services/CustomerMasterDataService";

const TASK_HISTORY_STORAGE_KEY = "isquare_task_histories_v1";

const safeGetHistories = (): TaskHistoryItem[] => {
  try {
    const raw = localStorage.getItem(TASK_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeSetHistories = (list: TaskHistoryItem[]): void => {
  try {
    localStorage.setItem(TASK_HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch { }
};

export const getAllTaskHistories = async (): Promise<TaskHistoryItem[]> => {
  let backendHistories: TaskHistoryItem[] = [];

  try {
    const url = API_ENDPOINTS.TaskHistory || `${API_ENDPOINTS.BaseUrl}/TaskHistory`;
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
      backendHistories = rawList
        .map((h: any) => ({
          historyId: Number(h.historyId ?? h.id ?? 0),
          taskId: Number(h.taskId ?? 0),
          activity: String(h.activity || ""),
          remarks: h.remarks || "",
          performedBy: Number(h.performedBy ?? 0),
          performedDate: h.performedDate ? String(h.performedDate) : new Date().toISOString(),
          isActive: h.isActive !== false,
          isDeleted: Boolean(h.isDeleted),
        }))
        .filter((h) => !h.isDeleted && h.historyId > 0);
    }
  } catch (error) {
    console.warn("getAllTaskHistories: Backend fetch error, checking local store:", error);
  }

  // Merge with local records
  const localList = safeGetHistories();
  const mergedMap = new Map<number, TaskHistoryItem>();

  backendHistories.forEach((h) => mergedMap.set(h.historyId, h));
  localList.forEach((h) => {
    if (!mergedMap.has(h.historyId)) {
      mergedMap.set(h.historyId, h);
    }
  });

  const allHistories = Array.from(mergedMap.values());

  // Enrich with Task Titles and Employee names
  try {
    const [tasks, employees] = await Promise.all([
      getAllTasks().catch(() => []),
      getEmployees().catch(() => []),
    ]);

    const taskMap = new Map<number, string>();
    tasks.forEach((t: any) => taskMap.set(t.taskId, t.taskTitle));

    const empMap = new Map<number, string>();
    employees.forEach((e: any) => {
      const id = Number(e.id || e.employeeId || 0);
      const name = e.name || e.fullName || `${e.firstName || ""} ${e.lastName || ""}`.trim();
      if (id && name) empMap.set(id, name);
    });

    const enriched = allHistories.map((h) => ({
      ...h,
      taskTitle: taskMap.get(h.taskId) || `Task #${h.taskId}`,
      performedByName: empMap.get(h.performedBy || 0) || (h.performedBy ? `Employee #${h.performedBy}` : "System"),
    }));

    safeSetHistories(enriched);
    return enriched.sort((a, b) => new Date(b.performedDate || 0).getTime() - new Date(a.performedDate || 0).getTime());
  } catch {
    safeSetHistories(allHistories);
    return allHistories.sort((a, b) => new Date(b.performedDate || 0).getTime() - new Date(a.performedDate || 0).getTime());
  }
};

export const getTaskHistoriesByTaskId = async (taskId: number): Promise<TaskHistoryItem[]> => {
  const all = await getAllTaskHistories();
  return all.filter((h) => Number(h.taskId) === Number(taskId));
};

export const getTaskHistoryById = async (id: number): Promise<TaskHistoryItem | null> => {
  try {
    const url = `${API_ENDPOINTS.TaskHistory || `${API_ENDPOINTS.BaseUrl}/TaskHistory`}/${id}`;
    const res = await apiClient.get<any>(url);
    const data = res.data?.data || res.data?.result || res.data;
    if (data) {
      return {
        historyId: Number(data.historyId ?? data.id ?? id),
        taskId: Number(data.taskId ?? 0),
        activity: String(data.activity || ""),
        remarks: data.remarks || "",
        performedBy: Number(data.performedBy ?? 0),
        performedDate: data.performedDate ? String(data.performedDate) : new Date().toISOString(),
        isActive: data.isActive !== false,
        isDeleted: Boolean(data.isDeleted),
      };
    }
  } catch { }

  const local = safeGetHistories();
  return local.find((h) => h.historyId === id) || null;
};

export const createTaskHistory = async (payload: CreateTaskHistoryPayload): Promise<TaskHistoryItem> => {
  const requestBody = {
    taskId: Number(payload.taskId),
    activity: String(payload.activity).trim(),
    remarks: payload.remarks ? String(payload.remarks).trim() : undefined,
    performedBy: payload.performedBy ? Number(payload.performedBy) : 1,
    isActive: payload.isActive !== false,
  };

  let created: TaskHistoryItem | null = null;

  try {
    const url = API_ENDPOINTS.TaskHistory || `${API_ENDPOINTS.BaseUrl}/TaskHistory`;
    const res = await apiClient.post<any>(url, requestBody);
    const data = res.data?.data || res.data?.result || res.data;
    if (data && (data.historyId || data.id)) {
      created = {
        historyId: Number(data.historyId || data.id),
        taskId: Number(data.taskId || payload.taskId),
        activity: String(data.activity || payload.activity),
        remarks: data.remarks || payload.remarks || "",
        performedBy: Number(data.performedBy || payload.performedBy || 1),
        performedDate: data.performedDate ? String(data.performedDate) : new Date().toISOString(),
        isActive: data.isActive !== false,
      };
    }
  } catch (err) {
    console.warn("createTaskHistory API error, saving to local store:", err);
  }

  if (!created) {
    created = {
      historyId: Date.now(),
      taskId: Number(payload.taskId),
      activity: String(payload.activity).trim(),
      remarks: payload.remarks || "",
      performedBy: payload.performedBy || 1,
      performedDate: new Date().toISOString(),
      isActive: payload.isActive !== false,
    };
  }

  const existing = safeGetHistories().filter((h) => h.historyId !== created!.historyId);
  safeSetHistories([created, ...existing]);

  return created;
};

export const updateTaskHistory = async (id: number, payload: Partial<CreateTaskHistoryPayload>): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.TaskHistory || `${API_ENDPOINTS.BaseUrl}/TaskHistory`}/${id}`;
    await apiClient.put(url, {
      historyId: id,
      taskId: payload.taskId,
      activity: payload.activity,
      remarks: payload.remarks,
      performedBy: payload.performedBy,
      isActive: payload.isActive !== false,
    });
  } catch (err) {
    console.warn("updateTaskHistory API error, updating local store:", err);
  }

  const list = safeGetHistories();
  const updated = list.map((h) => {
    if (h.historyId === id) {
      return {
        ...h,
        ...payload,
      };
    }
    return h;
  });
  safeSetHistories(updated);
  return true;
};

export const deleteTaskHistory = async (id: number): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.TaskHistory || `${API_ENDPOINTS.BaseUrl}/TaskHistory`}/${id}`;
    await apiClient.delete(url);
  } catch (err) {
    console.warn("deleteTaskHistory API error:", err);
  }

  const list = safeGetHistories().filter((h) => h.historyId !== id);
  safeSetHistories(list);
  return true;
};
