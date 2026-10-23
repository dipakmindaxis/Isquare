import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
} from "../Types/RoleTypes";

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>(API_ENDPOINTS.Roles);
  return Array.isArray(response.data) ? response.data : [];
};

export const getRoleById = async (id: string): Promise<Role> => {
  const response = await apiClient.get<Role>(
    `${API_ENDPOINTS.Roles}/${encodeURIComponent(id)}`
  );
  return response.data;
};

export const createRole = async (
  payload: RoleCreatePayload
): Promise<Role> => {
  const response = await apiClient.post<any>(API_ENDPOINTS.Roles, payload);
  return response.data?.role || response.data;
};

export const updateRole = async (
  id: string,
  payload: RoleUpdatePayload
): Promise<void> => {
  await apiClient.put(
    `${API_ENDPOINTS.Roles}/${encodeURIComponent(id)}`,
    payload
  );
};

export const deleteRole = async (roleName: string): Promise<void> => {
  await apiClient.delete(
    `${API_ENDPOINTS.Roles}/${encodeURIComponent(roleName)}`
  );
};
