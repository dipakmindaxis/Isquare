import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface CustomerSource {
  customerSourceId: number;
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerSourceCreatePayload {
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
}

export interface CustomerSourceUpdatePayload {
  customerSourceId?: number;
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
}

export const getAllCustomerSources = async (): Promise<CustomerSource[]> => {
  const response = await apiClient.get<CustomerSource[]>(API_ENDPOINTS.CustomerSource);
  return response.data;
};

export const getCustomerSourceById = async (id: number): Promise<CustomerSource> => {
  const response = await apiClient.get<CustomerSource>(`${API_ENDPOINTS.CustomerSource}/${id}`);
  return response.data;
};

export const createCustomerSource = async (payload: CustomerSourceCreatePayload): Promise<CustomerSource> => {
  const response = await apiClient.post<CustomerSource>(API_ENDPOINTS.CustomerSource, payload);
  return response.data;
};

export const updateCustomerSource = async (id: number, payload: CustomerSourceUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.CustomerSource}/${id}`, payload);
};

export const deleteCustomerSource = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CustomerSource}/${id}`);
};
