import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface BdeUser {
  id: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface BdeUserCreatePayload {
  id?: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface BdeUserUpdatePayload {
  id?: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const getAllBdeUsers = async (): Promise<BdeUser[]> => {
  const response = await apiClient.get<BdeUser[]>(API_ENDPOINTS.BdeUsers);
  return response.data;
};

export const getBdeUserById = async (id: number): Promise<BdeUser> => {
  const response = await apiClient.get<BdeUser>(`${API_ENDPOINTS.BdeUsers}/${id}`);
  return response.data;
};

export const createBdeUser = async (payload: BdeUserCreatePayload): Promise<BdeUser> => {
  const response = await apiClient.post<BdeUser>(API_ENDPOINTS.BdeUsers, payload);
  return response.data;
};

export const updateBdeUser = async (id: number, payload: BdeUserUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.BdeUsers}/${id}`, payload);
};

export const deleteBdeUser = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.BdeUsers}/${id}`);
};
