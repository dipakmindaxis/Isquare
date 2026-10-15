import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Industry {
  industryId: number;
  industryName: string;
  industryCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface IndustryCreatePayload {
  industryName: string;
  industryCode: string;
  isActive: boolean;
}

export interface IndustryUpdatePayload {
  industryId?: number;
  industryName: string;
  industryCode: string;
  isActive: boolean;
}

export const getAllIndustries = async (): Promise<Industry[]> => {
  const response = await apiClient.get<Industry[]>(API_ENDPOINTS.Industry);
  return response.data;
};

export const getIndustryById = async (id: number): Promise<Industry> => {
  const response = await apiClient.get<Industry>(`${API_ENDPOINTS.Industry}/${id}`);
  return response.data;
};

export const createIndustry = async (payload: IndustryCreatePayload): Promise<Industry> => {
  const response = await apiClient.post<Industry>(API_ENDPOINTS.Industry, payload);
  return response.data;
};

export const updateIndustry = async (id: number, payload: IndustryUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Industry}/${id}`, payload);
};

export const deleteIndustry = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Industry}/${id}`);
};
