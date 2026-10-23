import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface EnquiryStageItem {
  enquiryStageId: number;
  enquiryStageCode: string;
  enquiryStageName: string;
  enquiryStageDescription?: string;
  enquiryStageSortOrder?: number;
  enquiryStageIsActive: boolean;
  enquiryStageIsDeleted?: boolean;
  enquiryStageCreatedAt?: string;
  enquiryStageUpdatedAt?: string;
}

export interface EnquiryStageCreatePayload {
  enquiryStageCode: string;
  enquiryStageName: string;
  enquiryStageDescription?: string;
  enquiryStageSortOrder?: number;
  enquiryStageIsActive: boolean;
  enquiryStageCreatedBy: number;
}

export interface EnquiryStageUpdatePayload {
  enquiryStageName: string;
  enquiryStageDescription?: string;
  enquiryStageSortOrder?: number;
  enquiryStageIsActive: boolean;
  enquiryStageUpdatedBy: number;
}

export const getAllEnquiryStages = async (): Promise<EnquiryStageItem[]> => {
  try {
    const response = await apiClient.get<EnquiryStageItem[]>(API_ENDPOINTS.EnquiryStages);
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
    console.warn("getAllEnquiryStages API error:", error);
    return [];
  }
};

export const createEnquiryStage = async (payload: EnquiryStageCreatePayload): Promise<EnquiryStageItem> => {
  const response = await apiClient.post<EnquiryStageItem>(API_ENDPOINTS.EnquiryStages, payload);
  return response.data;
};

export const updateEnquiryStage = async (id: number, payload: EnquiryStageUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.EnquiryStages}/${id}`, payload);
};

export const deleteEnquiryStage = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.EnquiryStages}/${id}`);
};