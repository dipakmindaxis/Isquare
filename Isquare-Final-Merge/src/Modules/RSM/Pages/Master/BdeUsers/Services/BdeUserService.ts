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

export interface RawEmployeeRecord {
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
  designationName?: string;
  DesignationName?: string;
  designation?: string;
  role?: string;
  Role?: string;
  roleName?: string;
  levelId?: number;
  levelID?: number;
  LevelId?: number;
  LevelID?: number;
  levelName?: string;
  LevelName?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

interface RawEmployeeApiResponse {
  data?: RawEmployeeRecord[];
  result?: RawEmployeeRecord[];
  items?: RawEmployeeRecord[];
}

type EmployeeApiResponseType = RawEmployeeRecord[] | RawEmployeeApiResponse | null;

const ensureEmployeeArray = (data: EmployeeApiResponseType): RawEmployeeRecord[] => {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

const isDirectorRecord = (emp: RawEmployeeRecord): boolean => {
  if (emp.isDeleted === true || emp.IsDeleted === true) return false;
  if (emp.isActive === false || emp.IsActive === false) return false;

  const levelId: number = Number(
    emp.levelID ?? emp.levelId ?? emp.LevelID ?? emp.LevelId ?? 0
  );
  if (levelId === 1) return true;

  const levelName: string = (emp.levelName ?? emp.LevelName ?? "").toLowerCase();
  if (levelName.includes("director")) return true;

  const designation: string = (
    emp.designationName ??
    emp.DesignationName ??
    emp.designation ??
    ""
  ).toLowerCase();
  if (designation.includes("director")) return true;

  const role: string = (emp.role ?? emp.Role ?? emp.roleName ?? "").toLowerCase();
  if (role.includes("director")) return true;

  return false;
};

const normalizeDirectorRecord = (emp: RawEmployeeRecord): DirectorEmployeeOption => {
  const id: number = Number(
    emp.id ?? emp.ID ?? emp.employeeId ?? emp.EmployeeId ?? 0
  );
  const firstName: string = (emp.firstName ?? emp.FirstName ?? "").trim();
  const middleName: string = (emp.middleName ?? emp.MiddleName ?? "").trim();
  const lastName: string = (emp.lastName ?? emp.LastName ?? "").trim();

  const parts: string[] = [firstName, middleName, lastName].filter(
    (p: string) => p.length > 0
  );
  const fromParts: string = parts.join(" ").trim();
  const rawName: string = (emp.fullName ?? emp.FullName ?? "").trim();
  const cleanedFullName: string = rawName.replace(/\s*\([^)]*\)\s*$/, "").trim();

  const name: string =
    fromParts.length > 0
      ? fromParts
      : cleanedFullName.length > 0
      ? cleanedFullName
      : `Director #${id}`;

  const code: string = (
    emp.employeeCode ??
    emp.EmployeeCode ??
    emp.code ??
    ""
  ).trim();

  return { id, name, code };
};

/**
 * Fetch employees with Director role / LevelId = 1 from the Employee table.
 * Strictly typed with no any or unknown types.
 */
export const getDirectorEmployees = async (): Promise<DirectorEmployeeOption[]> => {
  // 1st priority: Employee Selection List (/api/payroll-employees/selection-list) - LevelID = 1
  try {
    const selectionListUrl: string =
      API_ENDPOINTS.EmployeeSelectionList ||
      `${API_ENDPOINTS.BaseUrl}/payroll-employees/selection-list`;
    const response = await apiClient.get<EmployeeApiResponseType>(selectionListUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors: DirectorEmployeeOption[] = list
        .filter(isDirectorRecord)
        .map(normalizeDirectorRecord)
        .filter((d: DirectorEmployeeOption) => d.id > 0);

      if (directors.length > 0) return directors;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 2nd priority: Payroll Employees endpoint (/api/payroll-employees)
  try {
    const payrollUrl: string =
      API_ENDPOINTS.Employees || `${API_ENDPOINTS.BaseUrl}/payroll-employees`;
    const response = await apiClient.get<EmployeeApiResponseType>(payrollUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors: DirectorEmployeeOption[] = list
        .filter(isDirectorRecord)
        .map(normalizeDirectorRecord)
        .filter((d: DirectorEmployeeOption) => d.id > 0);

      if (directors.length > 0) return directors;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 3rd priority: CRM Employees active endpoint (/api/employees/active)
  try {
    const activeUrl: string = `${
      API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
    }/active`;
    const response = await apiClient.get<EmployeeApiResponseType>(activeUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors: DirectorEmployeeOption[] = list
        .filter(isDirectorRecord)
        .map(normalizeDirectorRecord)
        .filter((d: DirectorEmployeeOption) => d.id > 0);

      if (directors.length > 0) return directors;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 4th priority: CRM Employees by designation (/api/employees/by-designation/director)
  try {
    const designatedUrl: string = `${
      API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
    }/by-designation/director`;
    const response = await apiClient.get<EmployeeApiResponseType>(designatedUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors: DirectorEmployeeOption[] = list
        .filter(isDirectorRecord)
        .map(normalizeDirectorRecord)
        .filter((d: DirectorEmployeeOption) => d.id > 0);

      if (directors.length > 0) return directors;
    }
  } catch {
    // All endpoints failed
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
