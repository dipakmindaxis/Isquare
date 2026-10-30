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
 * Fetch employees with Director role / DesignationId = 1 from tbl_Employee via Employee API.
 */
export const getDirectorEmployees = async (): Promise<DirectorEmployeeOption[]> => {
  // 1st priority: Active employees filtered by DesignationId = 1 (Director)
  try {
    const response = await apiClient.get<EmployeeApiResponseType>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`,
      { params: { designationId: 1 } }
    );
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors = list.map(normalizeDirectorRecord).filter((d) => d.id > 0);
      if (directors.length > 0) return directors;
    }
  } catch {}

  // 2nd priority: /api/employee/by-designation-id/1
  try {
    const response = await apiClient.get<EmployeeApiResponseType>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/by-designation-id/1`
    );
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors = list.map(normalizeDirectorRecord).filter((d) => d.id > 0);
      if (directors.length > 0) return directors;
    }
  } catch {}

  // 3rd priority: /api/employee/by-designation/director
  try {
    const designatedUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/by-designation/director`;
    const response = await apiClient.get<EmployeeApiResponseType>(designatedUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors = list.map(normalizeDirectorRecord).filter((d) => d.id > 0);
      if (directors.length > 0) return directors;
    }
  } catch {}

  // 4th priority: /api/employee/active filtered by isDirectorRecord
  try {
    const activeUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`;
    const response = await apiClient.get<EmployeeApiResponseType>(activeUrl);
    const list: RawEmployeeRecord[] = ensureEmployeeArray(response.data);
    if (list.length > 0) {
      const directors = list
        .filter(isDirectorRecord)
        .map(normalizeDirectorRecord)
        .filter((d) => d.id > 0);
      if (directors.length > 0) return directors;
    }
  } catch {}

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
  directorId?: number | null;
  DirectorId?: number | null;
  directorName?: string | null;
  DirectorName?: string | null;
  director?: {
    id?: number;
    ID?: number;
    name?: string;
    fullName?: string;
    directorName?: string;
  } | null;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

const normalizeBdeUser = (b: RawBdeUser): BdeUser => ({
  id: Number(b.id || b.ID || 0),
  value: b.value || b.Value || "",
  code: b.code || b.Code || "",
  directorEmployeeId:
    Number(
      b.directorEmployeeId ||
      b.DirectorEmployeeId ||
      b.directorId ||
      b.DirectorId ||
      b.director?.id ||
      b.director?.ID ||
      0
    ) || null,
  directorName:
    b.directorName ||
    b.DirectorName ||
    b.director?.fullName ||
    b.director?.directorName ||
    b.director?.name ||
    null,
  isActive: b.isActive !== false && b.IsActive !== false,
  isDeleted: b.isDeleted === true || b.IsDeleted === true,
});

export const getAllBdeUsers = async (): Promise<BdeUser[]> => {
  const response = await apiClient.get<RawBdeUser[]>(API_ENDPOINTS.BdeUser);
  const data = Array.isArray(response.data) ? response.data : [];
  return data.map(normalizeBdeUser);
};

export const getBdeUserById = async (id: number): Promise<BdeUser> => {
  const response = await apiClient.get<RawBdeUser>(`${API_ENDPOINTS.BdeUser}/${id}`);
  return normalizeBdeUser(response.data);
};

export const createBdeUser = async (
  payload: BdeUserCreatePayload
): Promise<BdeUser> => {
  const backendPayload = {
    value: payload.value,
    code: payload.code,
    directorEmployeeId: payload.directorEmployeeId || null,
    isActive: payload.isActive,
  };
  const response = await apiClient.post<RawBdeUser>(
    API_ENDPOINTS.BdeUser,
    backendPayload
  );
  return normalizeBdeUser(response.data);
};

export const updateBdeUser = async (
  id: number,
  payload: BdeUserUpdatePayload
): Promise<void> => {
  const backendPayload = {
    id,
    value: payload.value,
    code: payload.code,
    directorEmployeeId: payload.directorEmployeeId || null,
    isActive: payload.isActive,
  };
  await apiClient.put(`${API_ENDPOINTS.BdeUser}/${id}`, backendPayload);
};

export const deleteBdeUser = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.BdeUser}/${id}`);
};
