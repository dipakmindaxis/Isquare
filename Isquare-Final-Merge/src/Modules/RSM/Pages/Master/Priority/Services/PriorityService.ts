import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Priority {
  id: number;
  priorityName: string;
  colorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface PriorityCreatePayload {
  id?: number;
  priorityName: string;
  colorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface PriorityUpdatePayload {
  id: number;
  priorityName: string;
  colorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const normalizePriority = (raw: any): Priority => {
  const id = Number(raw.id ?? raw.Id ?? 0);
  const priorityName = String(raw.priorityName ?? raw.PriorityName ?? raw.name ?? raw.Name ?? "");
  const colorCode = String(raw.colorCode ?? raw.ColorCode ?? "#00234a");
  const isActive =
    raw.isActive !== undefined
      ? Boolean(raw.isActive)
      : raw.IsActive !== undefined
        ? Boolean(raw.IsActive)
        : true;
  const isDeleted = Boolean(raw.isDeleted ?? raw.IsDeleted ?? false);

  return { id, priorityName, colorCode, isActive, isDeleted };
};

/**
 * GET /api/priority
 */
export const getAllPriorities = async (): Promise<Priority[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.Priority);
    let rawList: any[] = [];
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      rawList = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      rawList = (response.data as any).result;
    }

    const normalized = rawList.map(normalizePriority).filter((p) => !p.isDeleted);
    return normalized;
  } catch (error) {
    console.warn("getAllPriorities: API call failed", error);
    return [];
  }
};

/**
 * GET /api/priority/{id}
 */
export const getPriorityById = async (id: number): Promise<Priority> => {
  const response = await apiClient.get(`${API_ENDPOINTS.Priority}/${id}`);
  const data = response.data?.data ?? response.data;
  return normalizePriority(data);
};

/**
 * POST /api/priority
 */
export const createPriority = async (payload: PriorityCreatePayload): Promise<Priority> => {
  const requestBody = {
    id: 0,
    priorityName: payload.priorityName.trim(),
    colorCode: payload.colorCode.trim(),
    isActive: payload.isActive,
  };

  const response = await apiClient.post(API_ENDPOINTS.Priority, requestBody);
  const data = response.data?.data ?? response.data;
  return normalizePriority(data);
};

/**
 * PUT /api/priority/{id}
 */
export const updatePriority = async (
  id: number,
  payload: PriorityUpdatePayload
): Promise<void> => {
  const requestBody = {
    id,
    priorityName: payload.priorityName.trim(),
    colorCode: payload.colorCode.trim(),
    isActive: payload.isActive,
  };

  await apiClient.put(`${API_ENDPOINTS.Priority}/${id}`, requestBody);
};

/**
 * DELETE /api/priority/{id}
 */
export const deletePriority = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Priority}/${id}`);
};
