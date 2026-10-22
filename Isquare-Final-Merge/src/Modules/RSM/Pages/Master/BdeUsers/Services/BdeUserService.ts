import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  BdeUser,
  BdeUserCreatePayload,
  BdeUserUpdatePayload,
} from "../Types/BdeUser";

export type { BdeUser, BdeUserCreatePayload, BdeUserUpdatePayload };

export interface DirectorEmployeeOption {
  id: number;
  name: string;
  code?: string;
}

interface RawEmployeeRecord {
  id?: number;
  ID?: number;
  employeeId?: number;
  EmployeeId?: number;
  fullName?: string;
  FullName?: string;
  firstName?: string;
  FirstName?: string;
  middleName?: string;
  MiddleName?: string;
  lastName?: string;
  LastName?: string;
  employeeCode?: string;
  EmployeeCode?: string;
  code?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

/**
 * Fetch employees with Director role / designation dynamically from backend
 * Primary endpoint: GET /api/payroll-employees/by-role/Director
 * Fallback: GET /api/payroll-employees/selection-list
 */
export const getDirectorEmployees = async (): Promise<DirectorEmployeeOption[]> => {
  try {
    const url = `${API_ENDPOINTS.Employees}/by-role/Director`;
    const response = await apiClient.get<RawEmployeeRecord[] | { data?: RawEmployeeRecord[] }>(url);
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data ?? [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((emp) => {
          const id = Number(emp.id ?? emp.ID ?? emp.employeeId ?? emp.EmployeeId ?? 0);
          const rawName = emp.fullName ?? emp.FullName;
          const nameParts = [emp.firstName ?? emp.FirstName, emp.middleName ?? emp.MiddleName, emp.lastName ?? emp.LastName].filter(Boolean);
          const name = rawName || nameParts.join(" ").trim() || `Director #${id}`;
          const code = emp.employeeCode ?? emp.EmployeeCode ?? emp.code ?? "";
          return { id, name, code };
        })
        .filter((d) => d.id > 0);
    }
  } catch (error) {
    console.warn("Could not fetch /api/payroll-employees/by-role/Director, trying fallback:", error);
  }

  // Fallback to employee selection list
  try {
    const response = await apiClient.get<RawEmployeeRecord[] | { data?: RawEmployeeRecord[] }>(API_ENDPOINTS.EmployeeSelectionList);
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data ?? [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((emp) => {
          const id = Number(emp.id ?? emp.ID ?? emp.employeeId ?? emp.EmployeeId ?? 0);
          const rawName = emp.fullName ?? emp.FullName;
          const nameParts = [emp.firstName ?? emp.FirstName, emp.middleName ?? emp.MiddleName, emp.lastName ?? emp.LastName].filter(Boolean);
          const name = rawName || nameParts.join(" ").trim() || `Employee #${id}`;
          const code = emp.employeeCode ?? emp.EmployeeCode ?? emp.code ?? "";
          return { id, name, code };
        })
        .filter((d) => d.id > 0);
    }
  } catch (err) {
    console.error("Failed to load director employees:", err);
  }

  return [];
};

interface RawBdeUser {
  id?: number;
  ID?: number;
  value?: string;
  Value?: string;
  code?: string;
  Code?: string;
  directorEmployeeId?: number | null;
  DirectorEmployeeId?: number | null;
  directorName?: string | null;
  DirectorName?: string | null;
  director?: { id?: number; fullName?: string; name?: string } | null;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

const normalizeBdeUser = (item: RawBdeUser): BdeUser => ({
  id: item.id ?? item.ID ?? 0,
  value: item.value ?? item.Value ?? "",
  code: item.code ?? item.Code ?? "",
  directorEmployeeId:
    item.directorEmployeeId ??
    item.DirectorEmployeeId ??
    item.director?.id ??
    null,
  directorName:
    item.directorName ??
    item.DirectorName ??
    item.director?.fullName ??
    item.director?.name ??
    null,
  isActive: item.isActive !== false && item.IsActive !== false,
  isDeleted: item.isDeleted || item.IsDeleted || false,
});

export const getAllBdeUsers = async (): Promise<BdeUser[]> => {
  const response = await apiClient.get<RawBdeUser[] | { data?: RawBdeUser[] }>(API_ENDPOINTS.BdeUsers);
  const list = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
  return list.map(normalizeBdeUser);
};

export const getBdeUsersByDirector = async (directorEmployeeId: number): Promise<BdeUser[]> => {
  const response = await apiClient.get<RawBdeUser[] | { data?: RawBdeUser[] }>(
    `${API_ENDPOINTS.BdeUsers}/by-director/${directorEmployeeId}`
  );
  const list = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
  return list.map(normalizeBdeUser);
};

export const getBdeUserById = async (id: number): Promise<BdeUser> => {
  const response = await apiClient.get<RawBdeUser>(`${API_ENDPOINTS.BdeUsers}/${id}`);
  return normalizeBdeUser(response.data);
};

export const createBdeUser = async (payload: BdeUserCreatePayload): Promise<BdeUser> => {
  const response = await apiClient.post<RawBdeUser>(API_ENDPOINTS.BdeUsers, payload);
  return normalizeBdeUser(response.data);
};

export const updateBdeUser = async (id: number, payload: BdeUserUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.BdeUsers}/${id}`, payload);
};

export const deleteBdeUser = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.BdeUsers}/${id}`);
};
