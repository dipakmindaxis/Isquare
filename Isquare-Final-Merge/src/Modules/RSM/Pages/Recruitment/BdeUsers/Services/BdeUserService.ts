import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

import type { BdeUser, BdeUserCreatePayload } from "../Types/BdeUser";

export const getAllBdeUsers = async (): Promise<BdeUser[]> => {
  const response = await apiClient.get<BdeUser[]>(
    API_ENDPOINTS.BdeUsers
  );

  return response.data;
};

export const getBdeUserById = async (id: number): Promise<BdeUser> => {
  const response = await apiClient.get<BdeUser>(
    `${API_ENDPOINTS.BdeUsers}/${id}`
  );

  return response.data;
};

export const createBdeUser = async (
  payload: BdeUserCreatePayload
): Promise<BdeUser> => {
  const response = await apiClient.post<BdeUser>(
    API_ENDPOINTS.BdeUsers,
    payload
  );

  return response.data;
};

export const updateBdeUser = async (
  id: number,
  payload: BdeUserCreatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.BdeUsers}/${id}`, payload);
};

export const deleteBdeUser = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.BdeUsers}/${id}`);
};
