import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface SalesManagerItem {
  id: number;
  userName: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface SalesManagerCreatePayload {
  userName: string;
  code: string;
  isActive: boolean;
}

export interface SalesManagerUpdatePayload {
  userName: string;
  code: string;
  isActive: boolean;
}

const BASE_URL =
  API_ENDPOINTS.SalesUserManagers || `${API_ENDPOINTS.BaseUrl}/salesusermanager`;

export const getAllSalesManagers = async (): Promise<SalesManagerItem[]> => {
  try {
    const response = await apiClient.get<any[]>(BASE_URL);
    const data = Array.isArray(response.data)
      ? response.data
      : (response.data as any)?.data || (response.data as any)?.result || [];

    return data
      .filter((item: any) => !item.isDeleted && !item.IsDeleted)
      .map((item: any) => ({
        id: Number(item.id ?? item.Id ?? item.ID ?? 0),
        userName: String(item.userName ?? item.UserName ?? "").trim(),
        code: String(item.code ?? item.Code ?? "").trim(),
        isActive: item.isActive !== false && item.IsActive !== false,
        isDeleted: Boolean(item.isDeleted || item.IsDeleted),
      }));
  } catch (error) {
    console.warn("getAllSalesManagers API error:", error);
    return [];
  }
};

export const createSalesManager = async (
  payload: SalesManagerCreatePayload
): Promise<SalesManagerItem> => {
  const response = await apiClient.post<SalesManagerItem>(BASE_URL, {
    UserName: payload.userName,
    Code: payload.code,
    IsActive: payload.isActive,
    IsDeleted: false,
  });
  return response.data;
};

export const updateSalesManager = async (
  id: number,
  payload: SalesManagerUpdatePayload
): Promise<void> => {
  await apiClient.put(`${BASE_URL}/${id}`, {
    ID: id,
    UserName: payload.userName,
    Code: payload.code,
    IsActive: payload.isActive,
    IsDeleted: false,
  });
};

export const deleteSalesManager = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};
