import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  TaskStatus,
  TaskStatusCreatePayload,
  TaskStatusUpdatePayload,
} from "../Types/TaskStatusTypes";

const TASK_STATUS_CACHE_KEY = "isquare_task_statuses_cache_v1";

// Ensure any previously saved local dummy data is cleared
try {
  localStorage.removeItem(TASK_STATUS_CACHE_KEY);
} catch { }

const getEndpoint = () => {
  return API_ENDPOINTS.TaskStatus || `${API_ENDPOINTS.BaseUrl}/TaskStatus`;
};

export const getAllTaskStatuses = async (): Promise<TaskStatus[]> => {
  const url = getEndpoint();
  try {
    const response = await apiClient.get<any>(url);
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
          ? data.result
          : [];

    return list.map((item: any) => {
      const id = Number(item.id ?? item.ID ?? item.taskStatusId ?? 0);
      const isDel = Boolean(item.isDeleted ?? item.IsDeleted);
      return {
        id,
        taskStatusId: id,
        statusName: String(item.statusName ?? item.StatusName ?? "").trim(),
        isDeleted: isDel,
        isActive: !isDel,
      };
    });
  } catch (err) {
    console.warn("getAllTaskStatuses API error:", err);
    return [];
  }
};

export const getTaskStatusById = async (id: number): Promise<TaskStatus | null> => {
  const url = getEndpoint();
  try {
    const response = await apiClient.get<any>(`${url}/${id}`);
    const item = response.data?.data || response.data?.result || response.data;
    if (!item) return null;
    const isDel = Boolean(item.isDeleted ?? item.IsDeleted);
    return {
      id: Number(item.id ?? item.ID ?? id),
      taskStatusId: Number(item.id ?? item.ID ?? id),
      statusName: String(item.statusName ?? item.StatusName ?? "").trim(),
      isDeleted: isDel,
      isActive: !isDel,
    };
  } catch {
    return null;
  }
};

export const createTaskStatus = async (
  payload: TaskStatusCreatePayload
): Promise<TaskStatus> => {
  const url = getEndpoint();
  const cleanName = payload.statusName.trim();
  const isDel = Boolean(payload.isDeleted ?? false);

  const body = {
    id: 0,
    ID: 0,
    statusName: cleanName,
    StatusName: cleanName,
    isDeleted: isDel,
    IsDeleted: isDel,
  };

  const response = await apiClient.post<any>(url, body);
  const data = response.data?.data || response.data?.result || response.data;
  const newId = Number(data?.id ?? data?.ID ?? 0);

  return {
    id: newId,
    taskStatusId: newId,
    statusName: cleanName,
    isDeleted: isDel,
    isActive: !isDel,
  };
};

export const updateTaskStatus = async (
  id: number,
  payload: TaskStatusUpdatePayload
): Promise<boolean> => {
  const url = getEndpoint();
  const cleanName = payload.statusName.trim();
  const isDel = Boolean(payload.isDeleted ?? false);

  const body = {
    id,
    ID: id,
    statusName: cleanName,
    StatusName: cleanName,
    isDeleted: isDel,
    IsDeleted: isDel,
  };

  await apiClient.put(`${url}/${id}`, body);
  return true;
};

export const deleteTaskStatus = async (id: number): Promise<boolean> => {
  const url = getEndpoint();
  await apiClient.delete(`${url}/${id}`);
  return true;
};
