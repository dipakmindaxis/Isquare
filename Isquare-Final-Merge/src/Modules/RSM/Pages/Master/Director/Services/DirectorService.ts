import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  Director,
  DirectorCreatePayload,
  DirectorUpdatePayload,
} from "../Types/DirectorTypes";

interface BackendEmployeeDto {
  id?: number;
  ID?: number;
  employeeCode?: string;
  EmployeeCode?: string;
  firstName?: string;
  FirstName?: string;
  middleName?: string;
  MiddleName?: string;
  lastName?: string;
  LastName?: string;
  fullName?: string;
  FullName?: string;
  designationID?: number;
  DesignationID?: number;
  designationName?: string;
  DesignationName?: string;
  emailAddress?: string;
  EmailAddress?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

const mapEmployeeToDirector = (emp: BackendEmployeeDto): Director => {
  const id = Number(emp.id ?? emp.ID ?? 0);
  const code = (emp.employeeCode ?? emp.EmployeeCode ?? "").trim();
  const firstName = (emp.firstName ?? emp.FirstName ?? "").trim();
  const lastName = (emp.lastName ?? emp.LastName ?? "").trim();
  const fullName = (emp.fullName ?? emp.FullName ?? "").trim();
  const directorName = fullName || [firstName, lastName].filter(Boolean).join(" ") || `Director #${id}`;
  const isActive = emp.isActive !== false && emp.IsActive !== false;
  const isDeleted = emp.isDeleted === true || emp.IsDeleted === true;

  return {
    directorId: id,
    directorName,
    directorCode: code,
    isActive,
    isDeleted,
  };
};

export const getAllDirectors = async (): Promise<Director[]> => {
  try {
    // Single source: tbl_Employee via Employee API filtering by DesignationId = 1 (Director)
    const response = await apiClient.get<BackendEmployeeDto[] | { data?: BackendEmployeeDto[] }>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}`,
      { params: { designationId: 1 } }
    );
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];

    if (data.length > 0) {
      return data.map(mapEmployeeToDirector);
    }

    // Fallback: by-designation-id/1
    const fallbackRes = await apiClient.get<BackendEmployeeDto[]>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/by-designation-id/1`
    );
    if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
      return fallbackRes.data.map(mapEmployeeToDirector);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch directors from employee API:", error);
    return [];
  }
};

export const getDirectorById = async (id: number): Promise<Director> => {
  const response = await apiClient.get<BackendEmployeeDto>(
    `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`
  );
  return mapEmployeeToDirector(response.data);
};

export const createDirector = async (
  payload: DirectorCreatePayload
): Promise<Director> => {
  const parts = payload.directorName.trim().split(" ");
  const firstName = parts[0] || payload.directorName.trim();
  const lastName = parts.slice(1).join(" ") || ".";

  const employeePayload = {
    employeeCode: payload.directorCode.trim(),
    firstName,
    lastName,
    designationID: 1, // Director Designation ID
    emailAddress: `${payload.directorCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "director"}@isquare.com`,
    isActive: payload.isActive,
  };

  const response = await apiClient.post<BackendEmployeeDto>(
    `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}`,
    employeePayload
  );
  return mapEmployeeToDirector(response.data);
};

export const updateDirector = async (
  id: number,
  payload: DirectorUpdatePayload
): Promise<void> => {
  const parts = payload.directorName.trim().split(" ");
  const firstName = parts[0] || payload.directorName.trim();
  const lastName = parts.slice(1).join(" ") || ".";

  const employeePayload = {
    employeeCode: payload.directorCode.trim(),
    firstName,
    lastName,
    designationID: 1,
    emailAddress: `${payload.directorCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "director"}@isquare.com`,
    isActive: payload.isActive,
  };

  await apiClient.put(
    `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`,
    employeePayload
  );
};

export const deleteDirector = async (id: number): Promise<void> => {
  await apiClient.delete(
    `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`
  );
};
