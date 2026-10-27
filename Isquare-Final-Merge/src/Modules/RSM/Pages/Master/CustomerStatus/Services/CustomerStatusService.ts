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
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.CustomerStatus);
    let list: any[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      list = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      list = (response.data as any).result;
    }
    return list
      .map((item: any) => ({
        customerStatusId:
          item.customerStatusId ?? item.id ?? item.Id ?? item.statusId ?? 0,
        statusName: item.statusName ?? item.StatusName ?? item.name ?? "",
        description: item.description ?? item.Description ?? "",
        statusCode: item.statusCode ?? item.StatusCode ?? item.code ?? "",
        isActive:
          item.isActive !== undefined
            ? Boolean(item.isActive)
            : item.IsActive !== undefined
              ? Boolean(item.IsActive)
              : true,
        isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
      }))
      .filter((item: any) => !item.isDeleted);
  } catch (error) {
    console.warn("getAllCustomerStatuses API error:", error);
    return [];
  }
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
