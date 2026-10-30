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
  const result: BdeUserItem[] = [];
  try {
    const response = await apiClient.get<any[]>(
      API_ENDPOINTS.BdeUser || API_ENDPOINTS.BdeUsers
    );
    const list = ensureArray<any>(response.data);
    list
      .filter((b) => b.isActive !== false && b.IsActive !== false)
      .forEach((b) => {
        result.push({
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
        });
      });
  } catch {}

  // Also supplement from tbl_Employee where DesignationId = 2 (BDE User)
  try {
    const empRes = await apiClient.get<RawEmployeeRecord[]>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`,
      { params: { designationId: 2 } }
    );
    const empList = ensureArray<RawEmployeeRecord>(empRes.data);
    empList.forEach((e) => {
      const id = Number(e.id ?? e.ID ?? 0);
      if (id > 0 && !result.some((r) => r.id === id)) {
        const name = (e.fullName ?? e.FullName ?? `${e.firstName || ""} ${e.lastName || ""}`).trim();
        result.push({
          id,
          value: name,
          code: e.employeeCode || e.EmployeeCode || "",
          directorId: Number(e.reportingTo ?? e.ReportingTo ?? 0) || null,
          directorEmployeeId: Number(e.reportingTo ?? e.ReportingTo ?? 0) || null,
          directorName: e.reportingToName || e.ReportingToName || null,
          isActive: true,
        });
      }
    });
  } catch {}

  return result;
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
  // 1st priority: Active employees from CRM Employee API
  try {
    const activeUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`;
    const response = await apiClient.get<RawEmployeeRecord[]>(activeUrl);
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
  } catch {}

  // 2nd priority: GET /api/employee
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
  } catch {}

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
  const result: SalesCoordinatorItem[] = [];
  try {
    const activeUrl = `${API_ENDPOINTS.BaseUrl}/sales-coordinator/active`;
    const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(activeUrl);
    const list = ensureArray<RawSalesCoordinator>(response.data);
    if (list.length > 0) {
      result.push(...list.map(normalizeSalesCoordinator));
    }
  } catch {}

  if (result.length === 0) {
    try {
      const fallbackUrl =
        API_ENDPOINTS.SalesCoordinator ||
        `${API_ENDPOINTS.BaseUrl}/sales-coordinator`;
      const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(fallbackUrl);
      const list = ensureArray<RawSalesCoordinator>(response.data);
      result.push(...list.map(normalizeSalesCoordinator));
    } catch {}
  }

  // Also supplement from tbl_Employee where DesignationId = 3 (Sales Coordinator)
  try {
    const empRes = await apiClient.get<RawEmployeeRecord[]>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`,
      { params: { designationId: 3 } }
    );
    const empList = ensureArray<RawEmployeeRecord>(empRes.data);
    empList.forEach((e) => {
      const id = Number(e.id ?? e.ID ?? 0);
      if (id > 0 && !result.some((sc) => sc.salesCoordinatorId === id)) {
        const name = (e.fullName ?? e.FullName ?? `${e.firstName || ""} ${e.lastName || ""}`).trim();
        result.push({
          salesCoordinatorId: id,
          salesCoordinatorName: name,
          salesCoordinatorCode: e.employeeCode || e.EmployeeCode || "",
          bdeUserId: Number(e.reportingTo ?? e.ReportingTo ?? 0) || null,
          bdeUserName: e.reportingToName || e.ReportingToName || null,
          isActive: true,
        });
      }
    });
  } catch {}

  return result;
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
        : `Director #${directorId}`;

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
 * Fetch Directors exclusively from tbl_Employee via Employee API.
 * Filtered by DesignationId = 1 (Director).
 */
export const getDirectors = async (): Promise<DirectorItem[]> => {
  // 1st priority: Employee API active endpoint with DesignationId = 1 (Director)
  try {
    const activeUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(activeUrl, {
      params: { designationId: 1 },
    });
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped = list
        .map(normalizeEmployeeAsDirector)
        .filter((d) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {}

  // 2nd priority: GET /api/employee/by-designation-id/1
  try {
    const url = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/by-designation-id/1`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(url);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped = list
        .map(normalizeEmployeeAsDirector)
        .filter((d) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {}

  // 3rd priority: GET /api/employee/by-designation/director
  try {
    const designatedUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/by-designation/director`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(designatedUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped = list
        .map(normalizeEmployeeAsDirector)
        .filter((d) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {}

  // 4th priority: GET /api/employee/active filtered by isDirectorEmployee
  try {
    const activeUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(activeUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped = list
        .filter(isDirectorEmployee)
        .map(normalizeEmployeeAsDirector)
        .filter((d) => d.isActive && d.directorId > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {}

  return [];
};
