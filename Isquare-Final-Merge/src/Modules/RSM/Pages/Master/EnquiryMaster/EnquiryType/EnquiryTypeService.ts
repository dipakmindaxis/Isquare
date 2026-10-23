import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface EnquiryTypeItem {
  enquiryTypeId: number;
  enquiryTypeCode: string;
  enquiryTypeName: string;
  enquiryTypeDescription?: string;
  enquiryTypeSortOrder?: number;
  enquiryTypeIsActive: boolean;
  enquiryTypeCreatedAt?: string;
  enquiryTypeUpdatedAt?: string;
}

export interface EnquiryTypeCreatePayload {
  enquiryTypeCode: string;
  enquiryTypeName: string;
  enquiryTypeDescription?: string;
  enquiryTypeSortOrder?: number;
  enquiryTypeIsActive: boolean;
}

export interface EnquiryTypeUpdatePayload {
  enquiryTypeName: string;
  enquiryTypeDescription?: string;
  enquiryTypeSortOrder?: number;
  enquiryTypeIsActive: boolean;
}

export const getAllEnquiryTypes = async (): Promise<EnquiryTypeItem[]> => {
  try {
    const response = await apiClient.get<EnquiryTypeItem[]>(API_ENDPOINTS.EnquiryTypes);
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
    console.warn("getAllEnquiryTypes API error:", error);
    return [];
  }
};

export const createEnquiryType = async (payload: EnquiryTypeCreatePayload): Promise<EnquiryTypeItem> => {
  const response = await apiClient.post<EnquiryTypeItem>(API_ENDPOINTS.EnquiryTypes, payload);
  return response.data;
};

export const updateEnquiryType = async (id: number, payload: EnquiryTypeUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.EnquiryTypes}/${id}`, payload);
};

export const deleteEnquiryType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.EnquiryTypes}/${id}`);
};