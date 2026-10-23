import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  IndustryItem,
  CustomerStatusItem,
  CustomerSourceItem,
  CustomerAreaItem,
  PaymentTermItem,
  CustomerCategoryItem,
  CustomerTypeItem,
  ClientTypeItem,
  BdeUserItem,
  SalesUserManagerItem,
  CountryItem,
  StateItem,
  CityItem,
  AddressTypeItem,
  EmployeeSelectItem,
  SalesCoordinatorItem,
  DirectorItem,
} from "../Types/CustomerTypes";

type ApiDataResponse<T> =
  | T[]
  | { data?: T[]; result?: T[]; items?: T[] }
  | null
  | void;

const ensureArray = <T>(data: ApiDataResponse<T>): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

export const getIndustries = async (): Promise<IndustryItem[]> => {
  try {
    const response = await apiClient.get<IndustryItem[]>(API_ENDPOINTS.Industry);
    return ensureArray<IndustryItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerStatuses = async (): Promise<CustomerStatusItem[]> => {
  try {
    const response = await apiClient.get<CustomerStatusItem[]>(
      API_ENDPOINTS.CustomerStatus
    );
    return ensureArray<CustomerStatusItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerSources = async (): Promise<CustomerSourceItem[]> => {
  try {
    const response = await apiClient.get<CustomerSourceItem[]>(
      API_ENDPOINTS.CustomerSource
    );
    return ensureArray<CustomerSourceItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerAreas = async (): Promise<CustomerAreaItem[]> => {
  try {
    const response = await apiClient.get<CustomerAreaItem[]>(
      API_ENDPOINTS.CustomerArea
    );
    return ensureArray<CustomerAreaItem>(response.data);
  } catch {
    return [];
  }
};

export const getPaymentTerms = async (): Promise<PaymentTermItem[]> => {
  try {
    const response = await apiClient.get<PaymentTermItem[]>(
      API_ENDPOINTS.PaymentTerm
    );
    return ensureArray<PaymentTermItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerCategories = async (): Promise<CustomerCategoryItem[]> => {
  try {
    const response = await apiClient.get<CustomerCategoryItem[]>(
      API_ENDPOINTS.CustomerCategory
    );
    return ensureArray<CustomerCategoryItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerTypes = async (): Promise<CustomerTypeItem[]> => {
  try {
    const response = await apiClient.get<CustomerTypeItem[]>(
      API_ENDPOINTS.CustomerType
    );
    return ensureArray<CustomerTypeItem>(response.data);
  } catch {
    return [];
  }
};

export const getClientTypes = async (): Promise<ClientTypeItem[]> => {
  try {
    const response = await apiClient.get<ClientTypeItem[]>(
      API_ENDPOINTS.ClientType || API_ENDPOINTS.ContactTypes
    );
    return ensureArray<ClientTypeItem>(response.data);
  } catch {
    return [];
  }
};

export const getBdeUsers = async (): Promise<BdeUserItem[]> => {
  try {
    const response = await apiClient.get<any[]>(
      API_ENDPOINTS.BdeUser || API_ENDPOINTS.BdeUsers
    );
    const list = ensureArray<any>(response.data);
    return list
      .filter((b) => b.isActive !== false && b.IsActive !== false)
      .map((b) => ({
        id: Number(b.id || b.ID || b.bdeUserId || b.userId || 0),
        value: b.value || b.Value || b.name || b.userName || b.fullName || "",
        code: b.code || b.Code || b.bdeCode || "",
        directorId:
          Number(
            b.directorEmployeeId ||
            b.DirectorEmployeeId ||
            b.directorId ||
            b.DirectorId ||
            b.director?.id ||
            0
          ) || null,
        directorEmployeeId:
          Number(
            b.directorEmployeeId ||
            b.DirectorEmployeeId ||
            b.directorId ||
            b.DirectorId ||
            b.director?.id ||
            0
          ) || null,
        directorName:
          b.directorName ||
          b.DirectorName ||
          b.director?.fullName ||
          b.director?.name ||
          null,
        isActive: b.isActive !== false && b.IsActive !== false,
      }));
  } catch {
    return [];
  }
};

export const getSalesManagers = async (): Promise<SalesUserManagerItem[]> => {
  try {
    const response = await apiClient.get<SalesUserManagerItem[]>(
      API_ENDPOINTS.SalesUserManager || API_ENDPOINTS.SalesUserManagers
    );
    return ensureArray<SalesUserManagerItem>(response.data);
  } catch {
    return [];
  }
};

export const getEmployees = async (): Promise<EmployeeSelectItem[]> => {
  try {
    const response = await apiClient.get<EmployeeSelectItem[]>(
      API_ENDPOINTS.EmployeeSelectionList
    );
    const list = ensureArray<EmployeeSelectItem>(response.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn("Could not load from EmployeeSelectionList endpoint:", err);
  }

  try {
    const response = await apiClient.get<EmployeeSelectItem[]>(
      API_ENDPOINTS.Employees
    );
    return ensureArray<EmployeeSelectItem>(response.data);
  } catch (err) {
    console.warn("Could not load from Employees endpoint:", err);
  }

  try {
    const crmUrl = API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`;
    const response = await apiClient.get<RawEmployeeRecord[]>(crmUrl);
    const list = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      return list.map((e: RawEmployeeRecord) => ({
        id: Number(e.id ?? e.ID ?? 0),
        fullName:
          e.fullName ||
          `${e.firstName || e.FirstName || ""} ${e.lastName || e.LastName || ""}`.trim() ||
          e.name ||
          `Employee #${e.id ?? e.ID}`,
        employeeCode: e.employeeCode || e.EmployeeCode || e.code || "",
        firstName: e.firstName || e.FirstName || "",
        lastName: e.lastName || e.LastName || "",
        designation: e.designationName || e.DesignationName || e.designation || "",
        role: e.role || e.Role || e.designationName || e.DesignationName || e.designation || "",
        reportingTo: Number(e.reportingTo ?? e.ReportingTo ?? 0) || undefined,
        reportingToName: e.reportingToName || e.ReportingToName || undefined,
      }));
    }
  } catch { }

  try {
    const crmSingleUrl = API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`;
    const response = await apiClient.get<RawEmployeeRecord[]>(crmSingleUrl);
    const list = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      return list.map((e: RawEmployeeRecord) => ({
        id: Number(e.id ?? e.ID ?? 0),
        fullName:
          e.fullName ||
          `${e.firstName || e.FirstName || ""} ${e.lastName || e.LastName || ""}`.trim() ||
          e.name ||
          `Employee #${e.id ?? e.ID}`,
        employeeCode: e.employeeCode || e.EmployeeCode || e.code || "",
        firstName: e.firstName || e.FirstName || "",
        lastName: e.lastName || e.LastName || "",
        designation: e.designationName || e.DesignationName || e.designation || "",
        role: e.role || e.Role || e.designationName || e.DesignationName || e.designation || "",
        reportingTo: Number(e.reportingTo ?? e.ReportingTo ?? 0) || undefined,
        reportingToName: e.reportingToName || e.ReportingToName || undefined,
      }));
    }
  } catch { }

  return [];
};

export const getCountries = async (): Promise<CountryItem[]> => {
  try {
    const response = await apiClient.get<CountryItem[]>(API_ENDPOINTS.Country);
    return ensureArray<CountryItem>(response.data);
  } catch {
    return [];
  }
};

export const getStates = async (countryId?: number): Promise<StateItem[]> => {
  try {
    const url = countryId
      ? `${API_ENDPOINTS.State}/country/${countryId}`
      : API_ENDPOINTS.State;
    const response = await apiClient.get<StateItem[]>(url);
    return ensureArray<StateItem>(response.data);
  } catch {
    return [];
  }
};

export const getCities = async (stateId?: number): Promise<CityItem[]> => {
  try {
    const url = stateId
      ? `${API_ENDPOINTS.City}/state/${stateId}`
      : API_ENDPOINTS.City;
    const response = await apiClient.get<CityItem[]>(url);
    return ensureArray<CityItem>(response.data);
  } catch {
    return [];
  }
};

export const getAddressTypes = async (): Promise<AddressTypeItem[]> => {
  try {
    const response = await apiClient.get<AddressTypeItem[]>(
      API_ENDPOINTS.AddressType
    );
    return ensureArray<AddressTypeItem>(response.data);
  } catch {
    return [];
  }
};

interface RawSalesCoordinator {
  salesCoordinatorId?: number;
  SalesCoordinatorId?: number;
  id?: number;
  Id?: number;
  salesCoordinatorName?: string;
  SalesCoordinatorName?: string;
  name?: string;
  Name?: string;
  coordinatorName?: string;
  salesCoordinatorCode?: string;
  SalesCoordinatorCode?: string;
  code?: string;
  Code?: string;
  bdeUserId?: number | null;
  BdeUserId?: number | null;
  bdeUser?: {
    id?: number;
    value?: string;
    code?: string;
    directorId?: number;
    directorEmployeeId?: number;
    directorName?: string;
  } | null;
  bdeUserName?: string | null;
  BdeUserName?: string | null;
  directorId?: number | null;
  DirectorId?: number | null;
  directorName?: string | null;
  DirectorName?: string | null;
  isActive?: boolean;
  IsActive?: boolean;
}

const normalizeSalesCoordinator = (item: RawSalesCoordinator): SalesCoordinatorItem => ({
  salesCoordinatorId:
    item.salesCoordinatorId ||
    item.SalesCoordinatorId ||
    item.id ||
    item.Id ||
    0,
  salesCoordinatorName:
    item.salesCoordinatorName ||
    item.SalesCoordinatorName ||
    item.name ||
    item.Name ||
    item.coordinatorName ||
    "",
  salesCoordinatorCode:
    item.salesCoordinatorCode ||
    item.SalesCoordinatorCode ||
    item.code ||
    item.Code ||
    "",
  bdeUserId:
    item.bdeUserId ??
    item.BdeUserId ??
    item.bdeUser?.id ??
    null,
  bdeUserName:
    item.bdeUserName ??
    item.BdeUserName ??
    item.bdeUser?.value ??
    null,
  directorId:
    item.directorId ??
    item.DirectorId ??
    item.bdeUser?.directorId ??
    item.bdeUser?.directorEmployeeId ??
    null,
  directorName:
    item.directorName ??
    item.DirectorName ??
    item.bdeUser?.directorName ??
    null,
  isActive: item.isActive !== false && item.IsActive !== false,
});

export const getSalesCoordinators = async (): Promise<SalesCoordinatorItem[]> => {
  try {
    const activeUrl = `${API_ENDPOINTS.BaseUrl}/sales-coordinator/active`;
    const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(activeUrl);
    const list = ensureArray<RawSalesCoordinator>(response.data);
    if (list.length > 0) {
      return list.map(normalizeSalesCoordinator);
    }
  } catch {
    // fallback to main endpoint if active endpoint is unavailable
  }

  try {
    const fallbackUrl =
      API_ENDPOINTS.SalesCoordinator ||
      `${API_ENDPOINTS.BaseUrl}/sales-coordinator`;
    const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(fallbackUrl);
    const list = ensureArray<RawSalesCoordinator>(response.data);
    return list.map(normalizeSalesCoordinator);
  } catch {
    return [];
  }
};

export interface RawEmployeeRecord {
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
  IsActive?: boolean;
  isActive?: boolean;
  IsDeleted?: boolean;
  isDeleted?: boolean;
  ReportingTo?: number;
  reportingTo?: number;
  ReportingToName?: string;
  reportingToName?: string;
}

const isDirectorEmployee = (emp: RawEmployeeRecord): boolean => {
  if (emp.IsDeleted === true || emp.isDeleted === true) return false;
  if (emp.IsActive === false || emp.isActive === false) return false;

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

const normalizeEmployeeAsDirector = (emp: RawEmployeeRecord): DirectorItem => {
  const directorId: number = Number(
    emp.ID ?? emp.id ?? emp.EmployeeId ?? emp.employeeId ?? 0
  );
  const firstName: string = (emp.FirstName ?? emp.firstName ?? "").trim();
  const middleName: string = (emp.MiddleName ?? emp.middleName ?? "").trim();
  const lastName: string = (emp.LastName ?? emp.lastName ?? "").trim();

  const nameParts: string[] = [firstName, middleName, lastName].filter(
    (part: string) => part.length > 0
  );
  const nameFromParts: string = nameParts.join(" ").trim();
  const rawFullName: string = (emp.FullName ?? emp.fullName ?? emp.name ?? "").trim();
  const cleanedFullName: string = rawFullName.replace(/\s*\([^)]*\)\s*$/, "").trim();

  const directorName: string =
    nameFromParts.length > 0
      ? nameFromParts
      : cleanedFullName.length > 0
        ? cleanedFullName
        : `Employee #${directorId}`;

  const directorCode: string = (
    emp.EmployeeCode ??
    emp.employeeCode ??
    emp.code ??
    ""
  ).trim();
  const isActive: boolean =
    emp.IsActive !== false &&
    emp.isActive !== false &&
    emp.IsDeleted !== true &&
    emp.isDeleted !== true;

  return {
    directorId,
    directorName,
    directorCode,
    isActive,
  };
};

/**
 * Fetch Directors exclusively from the Employee table via Employee APIs.
 * Uses LevelId = 1 / Director role from the Employee table as primary source.
 */
export const getDirectors = async (): Promise<DirectorItem[]> => {
  // 1st priority: Employee Selection List (/api/payroll-employees/selection-list) - LevelID = 1
  try {
    const selectionListUrl: string =
      API_ENDPOINTS.EmployeeSelectionList ||
      `${API_ENDPOINTS.BaseUrl}/payroll-employees/selection-list`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(
      selectionListUrl
    );
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .filter(isDirectorEmployee)
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 2nd priority: Payroll Employees endpoint (/api/payroll-employees)
  try {
    const payrollUrl: string =
      API_ENDPOINTS.Employees || `${API_ENDPOINTS.BaseUrl}/payroll-employees`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(payrollUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .filter(isDirectorEmployee)
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 3rd priority: CRM Employees active endpoint (/api/employees/active)
  try {
    const activeUrl: string = `${API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
      }/active`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(activeUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .filter(isDirectorEmployee)
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Continue to next employee endpoint
  }

  // 4th priority: CRM Employees by designation (/api/employees/by-designation/director)
  try {
    const designatedUrl: string = `${API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`
      }/by-designation/director`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(
      designatedUrl
    );
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .filter(isDirectorEmployee)
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // All endpoints failed
  }

  return [];
};


