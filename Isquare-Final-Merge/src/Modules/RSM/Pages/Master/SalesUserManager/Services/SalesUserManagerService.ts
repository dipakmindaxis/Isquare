import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

import type {
  SalesUserManager,
  SalesUserManagerCreatePayload,
} from "../Types/SalesUserManager";

export const getAllSalesUserManagers = async (): Promise<SalesUserManager[]> => {
  const response = await apiClient.get<SalesUserManager[]>(
    API_ENDPOINTS.SalesUserManagers
  );

  const list = Array.isArray(response.data)
    ? response.data
    : (response.data as any)?.data || (response.data as any)?.result || [];

  return list
    .map((item: any) => ({
      id: item.id ?? item.Id ?? 0,
      userName: item.userName ?? item.UserName ?? item.name ?? "",
      code: item.code ?? item.Code ?? "",
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      isDeleted: Boolean(item.isDeleted),
    }))
    .filter((item: any) => !item.isDeleted);
};

export const getSalesUserManagerById = async (
  id: number
): Promise<SalesUserManager> => {
  const response = await apiClient.get<SalesUserManager>(
    `${API_ENDPOINTS.SalesUserManagers}/${id}`
  );

  return response.data;
};

export const createSalesUserManager = async (
  payload: SalesUserManagerCreatePayload
): Promise<SalesUserManager> => {
  const response = await apiClient.post<SalesUserManager>(
    API_ENDPOINTS.SalesUserManagers,
    payload
  );

  return response.data;
};

export const updateSalesUserManager = async (
  id: number,
  payload: SalesUserManagerCreatePayload
): Promise<void> => {
  await apiClient.put(
    `${API_ENDPOINTS.SalesUserManagers}/${id}`,
    payload
  );
};

export const deleteSalesUserManager = async (
  id: number
): Promise<void> => {
  await apiClient.delete(
    `${API_ENDPOINTS.SalesUserManagers}/${id}`
  );
};
