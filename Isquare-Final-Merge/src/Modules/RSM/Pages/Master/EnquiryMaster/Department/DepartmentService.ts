import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface DepartmentItem {
  id?: number;
  ID?: number;
  departmentName: string;
  isDeleted?: boolean;
}

export interface DepartmentCreatePayload {
  departmentName: string;
}

export interface DepartmentUpdatePayload {
  departmentName: string;
}

export const getAllDepartments = async (): Promise<DepartmentItem[]> => {
  try {
    const response = await apiClient.get<DepartmentItem[]>(API_ENDPOINTS.Departments);
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
    console.warn("getAllDepartments API error:", error);
    return [];
  }
};

export const createDepartment = async (payload: DepartmentCreatePayload): Promise<DepartmentItem> => {
  const response = await apiClient.post<DepartmentItem>(API_ENDPOINTS.Departments, payload);
  return response.data;
};

export const updateDepartment = async (id: number, payload: DepartmentUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Departments}/${id}`, payload);
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Departments}/${id}`);
};