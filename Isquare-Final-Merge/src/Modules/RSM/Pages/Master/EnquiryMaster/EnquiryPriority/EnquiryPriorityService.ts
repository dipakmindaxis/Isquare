import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface EnquiryPriorityItem {
  enquiryPriorityId: number;
  enquiryPriorityCode: string;
  enquiryPriorityName: string;
  enquiryPriorityDescription?: string;
  enquiryPrioritySortOrder?: number;
  enquiryPriorityIsActive: boolean;
  enquiryPriorityCreatedAt?: string;
  enquiryPriorityUpdatedAt?: string;
}

export interface EnquiryPriorityCreatePayload {
  enquiryPriorityCode: string;
  enquiryPriorityName: string;
  enquiryPriorityDescription?: string;
  enquiryPrioritySortOrder?: number;
  enquiryPriorityIsActive: boolean;
}

export interface EnquiryPriorityUpdatePayload {
  enquiryPriorityName: string;
  enquiryPriorityDescription?: string;
  enquiryPrioritySortOrder?: number;
  enquiryPriorityIsActive: boolean;
}

export const getAllEnquiryPriorities = async (): Promise<EnquiryPriorityItem[]> => {
  try {
    const response = await apiClient.get<EnquiryPriorityItem[]>(API_ENDPOINTS.EnquiryPriorities);
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
    console.warn("getAllEnquiryPriorities API error:", error);
    return [];
  }
};

export const createEnquiryPriority = async (
  payload: EnquiryPriorityCreatePayload
): Promise<EnquiryPriorityItem> => {
  const response = await apiClient.post<EnquiryPriorityItem>(
    API_ENDPOINTS.EnquiryPriorities,
    payload
  );
  return response.data;
};

export const updateEnquiryPriority = async (
  id: number,
  payload: EnquiryPriorityUpdatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.EnquiryPriorities}/${id}`, payload);
};

export const deleteEnquiryPriority = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.EnquiryPriorities}/${id}`);
};