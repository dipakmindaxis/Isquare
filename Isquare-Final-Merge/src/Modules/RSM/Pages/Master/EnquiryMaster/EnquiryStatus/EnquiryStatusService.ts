import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface EnquiryStatusItem {
  enquiryStatusId: number;
  enquiryStatusCode: string;
  enquiryStatusName: string;
  enquiryStatusDescription?: string;
  enquiryStatusSortOrder?: number;
  enquiryStatusIsActive: boolean;
  enquiryStatusIsDeleted?: boolean;
  enquiryStatusCreatedAt?: string;
  enquiryStatusUpdatedAt?: string;
}

export interface EnquiryStatusCreatePayload {
  enquiryStatusCode: string;
  enquiryStatusName: string;
  enquiryStatusDescription?: string;
  enquiryStatusSortOrder?: number;
  enquiryStatusIsActive: boolean;
}

export interface EnquiryStatusUpdatePayload {
  enquiryStatusName: string;
  enquiryStatusDescription?: string;
  enquiryStatusSortOrder?: number;
  enquiryStatusIsActive: boolean;
}

export const getAllEnquiryStatuses = async (): Promise<EnquiryStatusItem[]> => {
  try {
    const response = await apiClient.get<EnquiryStatusItem[]>(API_ENDPOINTS.EnquiryStatuses);
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
    console.warn("getAllEnquiryStatuses API error:", error);
    return [];
  }
};

export const createEnquiryStatus = async (payload: EnquiryStatusCreatePayload): Promise<EnquiryStatusItem> => {
  const response = await apiClient.post<EnquiryStatusItem>(API_ENDPOINTS.EnquiryStatuses, payload);
  return response.data;
};

export const updateEnquiryStatus = async (id: number, payload: EnquiryStatusUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.EnquiryStatuses}/${id}`, payload);
};

export const deleteEnquiryStatus = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.EnquiryStatuses}/${id}`);
};