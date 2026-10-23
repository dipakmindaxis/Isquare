import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

// Database & API Strongly Typed Interfaces
export interface RawEmployeeApiRecord {
  ID?: number;
  id?: number;
  EmployeeId?: number;
  employeeId?: number;
  EmployeeCode?: string;
  employeeCode?: string;
  code?: string;
  FirstName?: string;
  firstName?: string;
  MiddleName?: string;
  middleName?: string;
  LastName?: string;
  lastName?: string;
  FullName?: string;
  fullName?: string;
  name?: string;
  DesignationName?: string;
  designationName?: string;
  designation?: string;
  Role?: string;
  role?: string;
  roleName?: string;
  LevelId?: number;
  levelId?: number;
  LevelID?: number;
  levelID?: number;
  LevelName?: string;
  levelName?: string;
  DepartmentName?: string;
  departmentName?: string;
  department?: string;
  IsActive?: boolean;
  isActive?: boolean;
  IsDeleted?: boolean;
  isDeleted?: boolean;
}

export interface RawBdeApiRecord {
  id?: number;
  bdeUserId?: number;
  userId?: number;
  value?: string;
  name?: string;
  userName?: string;
  fullName?: string;
  code?: string;
  bdeCode?: string;
  directorId?: number;
  DirectorId?: number;
  directorEmployeeId?: number;
  DirectorEmployeeId?: number;
  isActive?: boolean;
  IsActive?: boolean;
}

export interface RawCoordinatorApiRecord {
  salesCoordinatorId?: number;
  SalesCoordinatorId?: number;
  id?: number;
  Id?: number;
  salesCoordinatorName?: string;
  SalesCoordinatorName?: string;
  name?: string;
  coordinatorName?: string;
  salesCoordinatorCode?: string;
  SalesCoordinatorCode?: string;
  code?: string;
  bdeUserId?: number;
  BdeUserId?: number;
  isActive?: boolean;
  IsActive?: boolean;
}

export interface RawOwnerApiRecord {
  id?: number;
  customerOwnerId?: number;
  userId?: number;
  name?: string;
  customerOwnerName?: string;
  userName?: string;
  fullName?: string;
  type?: string;
  customerOwnerType?: string;
  code?: string;
  salesCoordinatorId?: number;
  isActive?: boolean;
  IsActive?: boolean;
}

// Normalized UI DTOs
export interface DirectorEmployeeItem {
  id: number;
  fullName: string;
  employeeCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  designation: string;
  role: string;
  department: string;
  isActive: boolean;
}

export interface BdeUserOption {
  id: number;
  value: string;
  name: string;
  code: string;
  directorId: number;
  isActive: boolean;
}

export interface SalesCoordinatorOption {
  salesCoordinatorId: number;
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  bdeUserId: number;
  directorId?: number | null;
  isActive: boolean;
}

export interface CustomerOwnerOption {
  id: number;
  name: string;
  type: string;
  code: string;
  salesCoordinatorId: number;
  isActive: boolean;
}

export interface ApiWrappedResponse<T> {
  data?: T[];
  result?: T[];
  items?: T[];
}

export type ApiDataResponse<T> = T[] | ApiWrappedResponse<T> | null;

const ensureArray = <T>(data: ApiDataResponse<T>): T[] => {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === "object") {
    const wrapped = data as ApiWrappedResponse<T>;
    if (Array.isArray(wrapped.data)) return wrapped.data;
    if (Array.isArray(wrapped.result)) return wrapped.result;
    if (Array.isArray(wrapped.items)) return wrapped.items;
  }
  return [];
};

const isDirectorEmployeeApi = (e: RawEmployeeApiRecord): boolean => {
  if (e.IsDeleted === true || e.isDeleted === true) return false;
  if (e.IsActive === false || e.isActive === false) return false;

  const levelId: number = Number(
    e.levelID ?? e.levelId ?? e.LevelID ?? e.LevelId ?? 0
  );
  if (levelId === 1) return true;

  const levelName: string = (e.levelName ?? e.LevelName ?? "").toLowerCase();
  if (levelName.includes("director")) return true;

  const des: string = (
    e.DesignationName ??
    e.designationName ??
    e.designation ??
    ""
  ).toLowerCase();
  if (des.includes("director")) return true;

  const rol: string = (e.Role ?? e.role ?? e.roleName ?? "").toLowerCase();
  if (rol.includes("director")) return true;

  return false;
};

/**
 * Normalizes an employee record from the Employee table into DirectorEmployeeItem
 * Strictly typed with no any or unknown types.
 */
const normalizeEmp = (emp: RawEmployeeApiRecord): DirectorEmployeeItem => {
  const id: number = Number(emp.ID ?? emp.id ?? emp.EmployeeId ?? emp.employeeId ?? 0);
  const firstName: string = (emp.FirstName ?? emp.firstName ?? "").trim();
  const middleName: string = (emp.MiddleName ?? emp.middleName ?? "").trim();
  const lastName: string = (emp.LastName ?? emp.lastName ?? "").trim();

  const parts: string[] = [firstName, middleName, lastName].filter(
    (part: string) => part.length > 0
  );
  const fullNameFromParts: string = parts.join(" ").trim();
  const rawFullName: string = (emp.FullName ?? emp.fullName ?? emp.name ?? "").trim();
  const cleanedFullName: string = rawFullName.replace(/\s*\([^)]*\)\s*$/, "").trim();

  const fullName: string =
    fullNameFromParts.length > 0
      ? fullNameFromParts
      : cleanedFullName.length > 0
      ? cleanedFullName
      : `Employee #${id}`;

  const employeeCode: string = (
    emp.EmployeeCode ??
    emp.employeeCode ??
    emp.code ??
    ""
  ).trim();
  const designation: string = (
    emp.DesignationName ??
    emp.designationName ??
    emp.designation ??
    ""
  ).trim();
  const role: string = (emp.Role ?? emp.role ?? emp.roleName ?? "").trim();
  const department: string = (
    emp.DepartmentName ??
    emp.departmentName ??
    emp.department ??
    ""
  ).trim();
  const isActive: boolean =
    emp.IsActive !== false &&
    emp.isActive !== false &&
    emp.IsDeleted !== true &&
    emp.isDeleted !== true;

  return {
    id,
    fullName,
    employeeCode,
    firstName,
    middleName,
    lastName,
    designation,
    role,
    department,
    isActive,
  };
};

const normalizeBde = (b: RawBdeApiRecord, fallbackDirectorId: number): BdeUserOption => ({
  id: Number(b.id ?? b.bdeUserId ?? b.userId ?? 0),
  value: b.value ?? b.name ?? b.userName ?? b.fullName ?? "",
  name: b.name ?? b.value ?? b.fullName ?? "",
  code: b.code ?? b.bdeCode ?? "",
  directorId: Number(
    b.directorEmployeeId ??
      b.DirectorEmployeeId ??
      b.directorId ??
      b.DirectorId ??
      fallbackDirectorId
  ),
  isActive: b.isActive !== false && b.IsActive !== false,
});

const normalizeCoordinator = (sc: RawCoordinatorApiRecord, fallbackBdeId: number): SalesCoordinatorOption => ({
  salesCoordinatorId: Number(sc.salesCoordinatorId ?? sc.SalesCoordinatorId ?? sc.id ?? sc.Id ?? 0),
  salesCoordinatorName: sc.salesCoordinatorName ?? sc.SalesCoordinatorName ?? sc.name ?? sc.coordinatorName ?? "",
  salesCoordinatorCode: sc.salesCoordinatorCode ?? sc.SalesCoordinatorCode ?? sc.code ?? "",
  bdeUserId: Number(sc.bdeUserId ?? sc.BdeUserId ?? fallbackBdeId),
  isActive: sc.isActive !== false && sc.IsActive !== false,
});

const normalizeOwner = (co: RawOwnerApiRecord, fallbackCoordinatorId: number): CustomerOwnerOption => ({
  id: Number(co.id ?? co.customerOwnerId ?? co.userId ?? 0),
  name: co.name ?? co.customerOwnerName ?? co.userName ?? co.fullName ?? "",
  type: co.type ?? co.customerOwnerType ?? "SalesCoordinator",
  code: co.code ?? "",
  salesCoordinatorId: Number(co.salesCoordinatorId ?? fallbackCoordinatorId),
  isActive: co.isActive !== false && co.IsActive !== false,
});

/**
 * 1. Fetch Directors exclusively from the Employee table via Employee APIs.
 * Uses LevelId = 1 / Director role as primary source.
 */
export const getDirectorsFromEmployees = async (): Promise<DirectorEmployeeItem[]> => {
  // 1st priority: Employee Selection List (/api/payroll-employees/selection-list) - LevelID = 1
  try {
    const selectionListUrl: string =
      API_ENDPOINTS.EmployeeSelectionList ||
      `${API_ENDPOINTS.BaseUrl}/payroll-employees/selection-list`;
    const res = await apiClient.get<ApiDataResponse<RawEmployeeApiRecord>>(selectionListUrl);
    const list: RawEmployeeApiRecord[] = ensureArray<RawEmployeeApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: DirectorEmployeeItem[] = list
        .filter(isDirectorEmployeeApi)
        .map(normalizeEmp)
        .filter((e: DirectorEmployeeItem) => e.isActive && e.id > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 2nd priority: Payroll Employees endpoint (/api/payroll-employees)
  try {
    const payrollUrl: string =
      API_ENDPOINTS.Employees || `${API_ENDPOINTS.BaseUrl}/payroll-employees`;
    const res = await apiClient.get<ApiDataResponse<RawEmployeeApiRecord>>(payrollUrl);
    const list: RawEmployeeApiRecord[] = ensureArray<RawEmployeeApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: DirectorEmployeeItem[] = list
        .filter(isDirectorEmployeeApi)
        .map(normalizeEmp)
        .filter((e: DirectorEmployeeItem) => e.isActive && e.id > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 3rd priority: CRM Employees active endpoint (/api/employees/active)
  try {
    const activeUrl: string = `${
      API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
    }/active`;
    const res = await apiClient.get<ApiDataResponse<RawEmployeeApiRecord>>(activeUrl);
    const list: RawEmployeeApiRecord[] = ensureArray<RawEmployeeApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: DirectorEmployeeItem[] = list
        .filter(isDirectorEmployeeApi)
        .map(normalizeEmp)
        .filter((e: DirectorEmployeeItem) => e.isActive && e.id > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to standard employees endpoint
  }

  // 4th priority: CRM Employees by designation endpoint (/api/employees/by-designation/director)
  try {
    const designatedUrl: string = `${
      API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
    }/by-designation/director`;
    const res = await apiClient.get<ApiDataResponse<RawEmployeeApiRecord>>(designatedUrl);
    const list: RawEmployeeApiRecord[] = ensureArray<RawEmployeeApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: DirectorEmployeeItem[] = list
        .filter(isDirectorEmployeeApi)
        .map(normalizeEmp)
        .filter((e: DirectorEmployeeItem) => e.isActive && e.id > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // All employee endpoints failed
  }

  return [];
};

/**
 * 2. Fetch BDE Users assigned to a specific DirectorId
 */
export const getBdeUsersByDirectorId = async (
  directorId: number
): Promise<BdeUserOption[]> => {
  if (directorId <= 0) return [];

  try {
    const res = await apiClient.get<ApiDataResponse<RawBdeApiRecord>>(
      `${API_ENDPOINTS.BaseUrl}/bdeuser/by-director/${directorId}`
    );
    const list: RawBdeApiRecord[] = ensureArray<RawBdeApiRecord>(res.data);
    if (list.length > 0) {
      return list.map((b: RawBdeApiRecord) => normalizeBde(b, directorId));
    }
  } catch {
    // Fallback below
  }

  try {
    const res = await apiClient.get<ApiDataResponse<RawBdeApiRecord>>(
      `${API_ENDPOINTS.BdeUser || API_ENDPOINTS.BdeUsers}`,
      { params: { directorEmployeeId: directorId, directorId } }
    );
    const list: RawBdeApiRecord[] = ensureArray<RawBdeApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: BdeUserOption[] = list.map((b: RawBdeApiRecord) => normalizeBde(b, directorId));
      const filtered: BdeUserOption[] = mapped.filter(
        (b: BdeUserOption) => b.isActive && b.directorId === directorId
      );
      return filtered;
    }
  } catch (error) {
    console.error(`Failed to fetch BDE users for Director ${directorId}:`, error);
  }

  return [];
};

/**
 * 3. Fetch Sales Coordinators assigned to a specific BdeUserId
 */
export const getSalesCoordinatorsByBdeId = async (
  bdeUserId: number
): Promise<SalesCoordinatorOption[]> => {
  if (bdeUserId <= 0) return [];

  try {
    const res = await apiClient.get<ApiDataResponse<RawCoordinatorApiRecord>>(
      `${API_ENDPOINTS.BaseUrl}/sales-coordinator/by-bde/${bdeUserId}`
    );
    const list: RawCoordinatorApiRecord[] = ensureArray<RawCoordinatorApiRecord>(res.data);
    if (list.length > 0) {
      return list.map((sc: RawCoordinatorApiRecord) => normalizeCoordinator(sc, bdeUserId));
    }
  } catch {
    // Fallback below
  }

  try {
    const res = await apiClient.get<ApiDataResponse<RawCoordinatorApiRecord>>(
      `${API_ENDPOINTS.SalesCoordinator || API_ENDPOINTS.SalesCoordinators}`,
      { params: { bdeUserId } }
    );
    const list: RawCoordinatorApiRecord[] = ensureArray<RawCoordinatorApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: SalesCoordinatorOption[] = list.map((sc: RawCoordinatorApiRecord) =>
        normalizeCoordinator(sc, bdeUserId)
      );
      const filtered: SalesCoordinatorOption[] = mapped.filter(
        (sc: SalesCoordinatorOption) => sc.isActive && sc.bdeUserId === bdeUserId
      );
      return filtered;
    }
  } catch (error) {
    console.error(`Failed to fetch Sales Coordinators for BDE ${bdeUserId}:`, error);
  }

  return [];
};

/**
 * 4. Fetch Customer Owners assigned to a specific SalesCoordinatorId
 */
export const getCustomerOwnersByCoordinatorId = async (
  salesCoordinatorId: number
): Promise<CustomerOwnerOption[]> => {
  if (salesCoordinatorId <= 0) return [];

  try {
    const res = await apiClient.get<ApiDataResponse<RawOwnerApiRecord>>(
      `${API_ENDPOINTS.BaseUrl}/customer/owners/by-coordinator/${salesCoordinatorId}`
    );
    const list: RawOwnerApiRecord[] = ensureArray<RawOwnerApiRecord>(res.data);
    if (list.length > 0) {
      return list.map((co: RawOwnerApiRecord) => normalizeOwner(co, salesCoordinatorId));
    }
  } catch {
    // Fallback below
  }

  try {
    const res = await apiClient.get<ApiDataResponse<RawOwnerApiRecord>>(
      `${API_ENDPOINTS.BaseUrl}/salesusermanager`,
      { params: { salesCoordinatorId } }
    );
    const list: RawOwnerApiRecord[] = ensureArray<RawOwnerApiRecord>(res.data);
    if (list.length > 0) {
      const mapped: CustomerOwnerOption[] = list.map((co: RawOwnerApiRecord) =>
        normalizeOwner(co, salesCoordinatorId)
      );
      const filtered: CustomerOwnerOption[] = mapped.filter(
        (co: CustomerOwnerOption) => co.isActive && co.salesCoordinatorId === salesCoordinatorId
      );
      return filtered.length > 0 ? filtered : mapped.filter((co: CustomerOwnerOption) => co.isActive);
    }
  } catch (error) {
    console.error(`Failed to fetch Customer Owners for Coordinator ${salesCoordinatorId}:`, error);
  }

  return [];
};
