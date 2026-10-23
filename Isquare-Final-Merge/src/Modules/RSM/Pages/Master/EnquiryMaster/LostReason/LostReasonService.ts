import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface LostReasonItem {
  lostReasonId: number;
  lostReasonCode: string;
  lostReasonName: string;
  lostReasonDescription?: string;
  lostReasonSortOrder?: number;
  lostReasonIsActive: boolean;
  lostReasonIsDeleted?: boolean;
  lostReasonCreatedAt?: string;
  lostReasonUpdatedAt?: string;
}

export interface LostReasonCreatePayload {
  lostReasonCode: string;
  lostReasonName: string;
  lostReasonDescription?: string;
  lostReasonSortOrder?: number;
  lostReasonIsActive: boolean;
  lostReasonCreatedBy: number;
}

export interface LostReasonUpdatePayload {
  lostReasonName: string;
  lostReasonDescription?: string;
  lostReasonSortOrder?: number;
  lostReasonIsActive: boolean;
  lostReasonUpdatedBy: number;
}

export const getAllLostReasons = async (): Promise<LostReasonItem[]> => {
  try {
    const response = await apiClient.get<LostReasonItem[]>(API_ENDPOINTS.LostReasons);
    let list: any[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      list = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      list = (response.data as any).result;
    }
    return list;
  } catch (error) {
    console.warn("getAllLostReasons API error:", error);
    return [];
  }
};

export const createLostReason = async (payload: LostReasonCreatePayload): Promise<LostReasonItem> => {
  const response = await apiClient.post<LostReasonItem>(API_ENDPOINTS.LostReasons, payload);
  return response.data;
};

export const updateLostReason = async (id: number, payload: LostReasonUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.LostReasons}/${id}`, payload);
};

export const deleteLostReason = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.LostReasons}/${id}`);
};