import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface CustomerStatus {
  customerStatusId: number;
  statusName: string;
  description: string;
  statusCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerStatusCreatePayload {
  statusName: string;
  description?: string;
  statusCode: string;
  isActive: boolean;
}

export interface CustomerStatusUpdatePayload {
  customerStatusId?: number;
  statusName: string;
  description?: string;
  statusCode: string;
  isActive: boolean;
}

export const getAllCustomerStatuses = async (): Promise<CustomerStatus[]> => {
  const response = await apiClient.get<CustomerStatus[]>(API_ENDPOINTS.CustomerStatus);
  return response.data;
};

export const getCustomerStatusById = async (id: number): Promise<CustomerStatus> => {
  const response = await apiClient.get<CustomerStatus>(`${API_ENDPOINTS.CustomerStatus}/${id}`);
  return response.data;
};

export const createCustomerStatus = async (payload: CustomerStatusCreatePayload): Promise<CustomerStatus> => {
  const response = await apiClient.post<CustomerStatus>(API_ENDPOINTS.CustomerStatus, payload);
  return response.data;
};

export const updateCustomerStatus = async (id: number, payload: CustomerStatusUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.CustomerStatus}/${id}`, payload);
};

export const deleteCustomerStatus = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CustomerStatus}/${id}`);
};
