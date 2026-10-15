import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Reminder {
  reminderId: number;
  companyId: number;
  assignedTo?: number;
  reminderStatusId?: number;
  title: string;
  reminderDate: string;
  reminderTime?: any;
  remarks: string;
  priorityId?: number;
  createdBy?: number;
  createdDate?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface ReminderCreatePayload {
  companyId: number;
  assignedTo?: number;
  reminderStatusId?: number;
  title: string;
  reminderDate: string;
  reminderTime?: any;
  remarks?: string;
  priorityId?: number;
  createdBy?: number;
  createdDate?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface ReminderUpdatePayload {
  reminderId?: number;
  companyId: number;
  assignedTo?: number;
  reminderStatusId?: number;
  title: string;
  reminderDate: string;
  reminderTime?: any;
  remarks?: string;
  priorityId?: number;
  createdBy?: number;
  createdDate?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export const getAllReminders = async (): Promise<Reminder[]> => {
  try {
    const url = API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`;
    const response = await apiClient.get<Reminder[]>(url);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).data)) return (data as any).data;
    return [];
  } catch (error) {
    console.warn("Failed to fetch reminders:", error);
    return [];
  }
};

export const getReminderById = async (id: number): Promise<Reminder | null> => {
  try {
    const url = `${API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`}/${id}`;
    const response = await apiClient.get<Reminder>(url);
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch reminder by id:", error);
    return null;
  }
};

export const createReminder = async (
  payload: ReminderCreatePayload
): Promise<Reminder | any> => {
  const requestPayload: any = {
    reminderId: 0,
    companyId: Number(payload.companyId || 0),
    assignedTo: Number(payload.assignedTo || 0),
    reminderStatusId: Number(payload.reminderStatusId || 1),
    title: String(payload.title || "Sales Activity Reminder"),
    reminderDate: payload.reminderDate
      ? new Date(payload.reminderDate).toISOString()
      : new Date().toISOString(),
    remarks: String(payload.remarks || ""),
    priorityId: Number(payload.priorityId || 1),
    createdBy: Number(payload.createdBy || 0),
    createdDate: new Date().toISOString(),
    isActive: payload.isActive !== false,
    isDeleted: false,
  };

  if (payload.reminderTime) {
    if (typeof payload.reminderTime === "string") {
      const parts = payload.reminderTime.split(":");
      const hours = parseInt(parts[0] || "0", 10);
      const minutes = parseInt(parts[1] || "0", 10);
      const seconds = parseInt(parts[2] || "0", 10);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      requestPayload.reminderTime = {
        ticks: totalSeconds * 10000000,
      };
    } else {
      requestPayload.reminderTime = payload.reminderTime;
    }
  } else {
    requestPayload.reminderTime = { ticks: 0 };
  }

  const url = API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`;
  const response = await apiClient.post(url, requestPayload);
  return response.data;
};

export const updateReminder = async (
  id: number,
  payload: ReminderUpdatePayload
): Promise<void> => {
  const requestPayload: any = {
    reminderId: Number(id),
    companyId: Number(payload.companyId || 0),
    assignedTo: Number(payload.assignedTo || 0),
    reminderStatusId: Number(payload.reminderStatusId || 1),
    title: String(payload.title || "Sales Activity Reminder"),
    reminderDate: payload.reminderDate
      ? new Date(payload.reminderDate).toISOString()
      : new Date().toISOString(),
    remarks: String(payload.remarks || ""),
    priorityId: Number(payload.priorityId || 1),
    createdBy: Number(payload.createdBy || 0),
    createdDate: payload.createdDate || new Date().toISOString(),
    isActive: payload.isActive !== false,
    isDeleted: false,
  };

  if (payload.reminderTime) {
    if (typeof payload.reminderTime === "string") {
      const parts = payload.reminderTime.split(":");
      const hours = parseInt(parts[0] || "0", 10);
      const minutes = parseInt(parts[1] || "0", 10);
      const seconds = parseInt(parts[2] || "0", 10);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      requestPayload.reminderTime = {
        ticks: totalSeconds * 10000000,
      };
    } else {
      requestPayload.reminderTime = payload.reminderTime;
    }
  } else {
    requestPayload.reminderTime = { ticks: 0 };
  }

  const url = `${API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`}/${id}`;
  await apiClient.put(url, requestPayload);
};

export const deleteReminder = async (id: number): Promise<void> => {
  const url = `${API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`}/${id}`;
  await apiClient.delete(url);
};
