import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  TaskAttachment,
  CreateTaskAttachmentPayload,
} from "../Types/TaskAttachmentTypes";

const TASK_ATTACHMENT_URL =
  API_ENDPOINTS.TaskAttachment || `${API_ENDPOINTS.BaseUrl}/TaskAttachment`;

const mapAttachment = (item: any): TaskAttachment => {
  const id = Number(item.attachmentId ?? item.AttachmentId ?? item.id ?? 0);
  const isDel = Boolean(item.isDeleted ?? item.IsDeleted);
  const isAct = item.isActive !== undefined ? Boolean(item.isActive) : !isDel;

  return {
    attachmentId: id,
    taskId: Number(item.taskId ?? item.TaskId ?? 0),
    documentName: String(item.documentName ?? item.DocumentName ?? "Attachment").trim(),
    fileName: item.fileName ?? item.FileName ?? undefined,
    filePath: item.filePath ?? item.FilePath ?? undefined,
    fileExtension: item.fileExtension ?? item.FileExtension ?? undefined,
    fileSize: item.fileSize ?? item.FileSize ?? undefined,
    uploadedBy: Number(item.uploadedBy ?? item.UploadedBy ?? 0),
    uploadedDate: item.uploadedDate ?? item.UploadedDate ?? undefined,
    isActive: isAct,
    isDeleted: isDel,
  };
};

export const getAllTaskAttachments = async (): Promise<TaskAttachment[]> => {
  try {
    const response = await apiClient.get<any>(TASK_ATTACHMENT_URL);
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    return list.map(mapAttachment).filter((a) => !a.isDeleted);
  } catch (err) {
    console.warn("getAllTaskAttachments API error:", err);
    return [];
  }
};

export const getAttachmentsByTaskId = async (
  taskId: number
): Promise<TaskAttachment[]> => {
  if (!taskId || taskId <= 0) return [];
  try {
    const response = await apiClient.get<any>(
      `${TASK_ATTACHMENT_URL}/ByTask/${taskId}`
    );
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    return list.map(mapAttachment).filter((a) => !a.isDeleted);
  } catch (err) {
    console.warn(`getAttachmentsByTaskId error for taskId ${taskId}:`, err);
    return [];
  }
};

export const getTaskAttachmentById = async (
  id: number
): Promise<TaskAttachment | null> => {
  try {
    const response = await apiClient.get<any>(`${TASK_ATTACHMENT_URL}/${id}`);
    const item = response.data?.data || response.data?.result || response.data;
    if (!item) return null;
    return mapAttachment(item);
  } catch (err) {
    console.error(`getTaskAttachmentById error for ID ${id}:`, err);
    return null;
  }
};

export const createTaskAttachment = async (
  payload: CreateTaskAttachmentPayload
): Promise<TaskAttachment> => {
  const formData = new FormData();
  formData.append("TaskId", String(payload.taskId));
  formData.append("DocumentName", payload.documentName.trim());
  formData.append("File", payload.file);

  if (payload.uploadedBy && payload.uploadedBy > 0) {
    formData.append("UploadedBy", String(payload.uploadedBy));
  } else {
    // Attempt to get from session/auth
    try {
      const rawUser = sessionStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const empId = Number(u.employeeId ?? u.id ?? 0);
        if (empId > 0) formData.append("UploadedBy", String(empId));
      }
    } catch {}
  }

  formData.append("IsActive", String(payload.isActive ?? true));

  const response = await apiClient.post<any>(TASK_ATTACHMENT_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const created = response.data?.data || response.data?.result || response.data;
  return mapAttachment(created || { taskId: payload.taskId, documentName: payload.documentName });
};

export const deleteTaskAttachment = async (id: number): Promise<boolean> => {
  await apiClient.delete(`${TASK_ATTACHMENT_URL}/${id}`);
  return true;
};
