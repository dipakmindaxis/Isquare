import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface CustomerArea {
  customerAreaId: number;
  areaName: string;
  areaCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerAreaCreatePayload {
  areaName: string;
  areaCode: string;
  isActive: boolean;
}

export interface CustomerAreaUpdatePayload {
  customerAreaId?: number;
  areaName: string;
  areaCode: string;
  isActive: boolean;
}

export const getAllCustomerAreas = async (): Promise<CustomerArea[]> => {
  const response = await apiClient.get<CustomerArea[]>(API_ENDPOINTS.CustomerArea);
  return response.data;
};

export const getCustomerAreaById = async (id: number): Promise<CustomerArea> => {
  const response = await apiClient.get<CustomerArea>(`${API_ENDPOINTS.CustomerArea}/${id}`);
  return response.data;
};

export const createCustomerArea = async (payload: CustomerAreaCreatePayload): Promise<CustomerArea> => {
  const response = await apiClient.post<CustomerArea>(API_ENDPOINTS.CustomerArea, payload);
  return response.data;
};

export const updateCustomerArea = async (id: number, payload: CustomerAreaUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.CustomerArea}/${id}`, payload);
};

export const deleteCustomerArea = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CustomerArea}/${id}`);
};
