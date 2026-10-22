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
    const response = await apiClient.get<BdeUserItem[]>(
      API_ENDPOINTS.BdeUser || API_ENDPOINTS.BdeUsers
    );
    const list = ensureArray<BdeUserItem>(response.data);
    return list.filter((b) => b.isActive !== false);
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
    return [];
  }
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

interface RawEmployeeRecord {
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
  IsActive?: boolean;
  isActive?: boolean;
  IsDeleted?: boolean;
  isDeleted?: boolean;
}

const normalizeEmployeeAsDirector = (emp: RawEmployeeRecord): DirectorItem => {
  const directorId: number = Number(emp.ID ?? emp.id ?? emp.EmployeeId ?? emp.employeeId ?? 0);
  const firstName: string = emp.FirstName ?? emp.firstName ?? "";
  const middleName: string = emp.MiddleName ?? emp.middleName ?? "";
  const lastName: string = emp.LastName ?? emp.lastName ?? "";

  const nameParts: string[] = [firstName, middleName, lastName].filter((part: string) => part.length > 0);
  const nameFromParts: string = nameParts.join(" ").trim();
  const rawFullName: string = emp.FullName ?? emp.fullName ?? emp.name ?? "";
  const directorName: string =
    rawFullName.length > 0
      ? rawFullName
      : nameFromParts.length > 0
      ? nameFromParts
      : `Employee #${directorId}`;

  const directorCode: string = emp.EmployeeCode ?? emp.employeeCode ?? emp.code ?? "";
  const isActive: boolean =
    emp.IsActive !== false &&
    emp.isActive !== false &&
    !emp.IsDeleted &&
    !emp.isDeleted;

  return {
    directorId,
    directorName,
    directorCode,
    isActive,
  };
};

/**
 * Fetch Directors from Employee Backend APIs (tbl_Employee)
 * Removed Director Master connection - connected directly to Employee IDs
 */
export const getDirectors = async (): Promise<DirectorItem[]> => {
  // 1st priority: /api/payroll-employees/by-role/Director
  try {
    const byRoleUrl: string = `${API_ENDPOINTS.Employees}/by-role/Director`;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(byRoleUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // continue to next priority
  }

  // 2nd priority: /api/payroll-employees/selection-list
  try {
    const selectionListUrl: string = API_ENDPOINTS.EmployeeSelectionList;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(selectionListUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive);
      if (mapped.length > 0) {
        const directorTagged: DirectorItem[] = mapped.filter((d: DirectorItem) => {
          const code: string = (d.directorCode ?? "").toLowerCase();
          const name: string = d.directorName.toLowerCase();
          return code.includes("director") || name.includes("director");
        });
        return directorTagged.length > 0 ? directorTagged : mapped;
      }
    }
  } catch {
    // continue to next priority
  }

  // 3rd priority: /api/payroll-employees (All tbl_Employee records)
  try {
    const employeesUrl: string = API_ENDPOINTS.Employees;
    const response = await apiClient.get<ApiDataResponse<RawEmployeeRecord>>(employeesUrl);
    const list: RawEmployeeRecord[] = ensureArray<RawEmployeeRecord>(response.data);
    if (list.length > 0) {
      const mapped: DirectorItem[] = list
        .map(normalizeEmployeeAsDirector)
        .filter((d: DirectorItem) => d.isActive);
      if (mapped.length > 0) {
        const directorTagged: DirectorItem[] = mapped.filter((d: DirectorItem) => {
          const code: string = (d.directorCode ?? "").toLowerCase();
          const name: string = d.directorName.toLowerCase();
          return code.includes("director") || name.includes("director");
        });
        return directorTagged.length > 0 ? directorTagged : mapped;
      }
    }
  } catch {
    // return empty if failed
  }

  return [];
};


