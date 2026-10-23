import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface EnquirySourceItem {
  enquirySourceId: number;
  enquirySourceCode: string;
  enquirySourceName: string;
  enquirySourceDescription?: string;
  enquirySourceSortOrder?: number;
  enquirySourceIsActive: boolean;
  enquirySourceCreatedAt?: string;
  enquirySourceUpdatedAt?: string;
}

export interface EnquirySourceCreatePayload {
  enquirySourceCode: string;
  enquirySourceName: string;
  enquirySourceDescription?: string;
  enquirySourceSortOrder?: number;
  enquirySourceIsActive: boolean;
}

export interface EnquirySourceUpdatePayload {
  enquirySourceName: string;
  enquirySourceDescription?: string;
  enquirySourceSortOrder?: number;
  enquirySourceIsActive: boolean;
}

export const getAllEnquirySources = async (): Promise<EnquirySourceItem[]> => {
  try {
    const response = await apiClient.get<EnquirySourceItem[]>(API_ENDPOINTS.EnquirySources);
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
    console.warn("getAllEnquirySources API error:", error);
    return [];
  }
};

export const createEnquirySource = async (payload: EnquirySourceCreatePayload): Promise<EnquirySourceItem> => {
  const response = await apiClient.post<EnquirySourceItem>(API_ENDPOINTS.EnquirySources, payload);
  return response.data;
};

export const updateEnquirySource = async (id: number, payload: EnquirySourceUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.EnquirySources}/${id}`, payload);
};

export const deleteEnquirySource = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.EnquirySources}/${id}`);
};