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

const sanitizeId = (id?: number | string): number => {
  const n = Number(id);
  return !isNaN(n) && n > 0 ? n : 1;
};

const formatTimeSpan = (timeVal?: any): string => {
  if (!timeVal) return "10:00:00";
  const str = String(timeVal).trim();
  const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4]?.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return "10:00:00";
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
  const validCompanyId = sanitizeId(payload.companyId);
  const validAssignedTo = sanitizeId(payload.assignedTo);
  const validCreatedBy = sanitizeId(payload.createdBy);
  const validPriorityId = sanitizeId(payload.priorityId);
  const validReminderStatusId = sanitizeId(payload.reminderStatusId);

  const requestPayload: any = {
    reminderId: 0,
    companyId: validCompanyId,
    assignedTo: validAssignedTo,
    reminderStatusId: validReminderStatusId,
    title: String(payload.title || "Reminder").trim(),
    reminderDate: payload.reminderDate
      ? (String(payload.reminderDate).includes("T") ? payload.reminderDate : `${payload.reminderDate}T00:00:00.000Z`)
      : new Date().toISOString(),
    reminderTime: formatTimeSpan(payload.reminderTime),
    remarks: String(payload.remarks || "").trim(),
    priorityId: validPriorityId,
    createdBy: validCreatedBy,
    createdDate: new Date().toISOString(),
    isActive: payload.isActive !== false,
    isDeleted: false,
  };

  const url = API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`;
  const response = await apiClient.post(url, requestPayload);
  return response.data;
};

export const updateReminder = async (
  id: number,
  payload: ReminderUpdatePayload
): Promise<void> => {
  const validCompanyId = sanitizeId(payload.companyId);
  const validAssignedTo = sanitizeId(payload.assignedTo);
  const validCreatedBy = sanitizeId(payload.createdBy);
  const validPriorityId = sanitizeId(payload.priorityId);
  const validReminderStatusId = sanitizeId(payload.reminderStatusId);

  const requestPayload: any = {
    reminderId: Number(id),
    companyId: validCompanyId,
    assignedTo: validAssignedTo,
    reminderStatusId: validReminderStatusId,
    title: String(payload.title || "Reminder").trim(),
    reminderDate: payload.reminderDate
      ? (String(payload.reminderDate).includes("T") ? payload.reminderDate : `${payload.reminderDate}T00:00:00.000Z`)
      : new Date().toISOString(),
    reminderTime: formatTimeSpan(payload.reminderTime),
    remarks: String(payload.remarks || "").trim(),
    priorityId: validPriorityId,
    createdBy: validCreatedBy,
    createdDate: payload.createdDate || new Date().toISOString(),
    isActive: payload.isActive !== false,
    isDeleted: false,
  };

  const url = `${API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`}/${id}`;
  await apiClient.put(url, requestPayload);
};

export const deleteReminder = async (id: number): Promise<void> => {
  const url = `${API_ENDPOINTS.Reminder || `${API_ENDPOINTS.BaseUrl}/Reminder`}/${id}`;
  await apiClient.delete(url);
};
