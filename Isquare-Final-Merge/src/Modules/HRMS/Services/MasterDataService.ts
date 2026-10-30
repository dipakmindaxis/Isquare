import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";

export interface MasterDataItem {
  id: number;
  name: string;
}

export interface EmployeeSelectItem {
  id: number;
  fullName: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
}

export interface Role {
  id: string;
  name: string;
}
export interface LeaveTypeItem {
  id: number;
  leaveTypeName: string;
}

interface GenericMasterDataResponse {
  id: number;
  locationName?: string;
  departmentName?: string;
  designationName?: string;
}

export interface ExpenseTypeItem {
  id: number;
  expenseTypeName: string;
}

export interface CountryItem {
  id: number;
  countryName: string;
  countryCode: string;
}

export interface StateItem {
  id: number;
  stateName: string;
  countryId: number;
}

export interface CompanyItem {
  companyId: number;
  companyName: string;
}

export interface DepartmentItem {
  id: number;
  departmentName: string;
}

export interface DesignationItem {
  id: number;
  designationName: string;
}

export interface EmployeeLevelSelectItem {
  id: number;
  fullName: string;
  levelID: number;
  levelName: string;
  empName: string;
  levelOrder: number;
}

interface BackendEmployeeDto {
  id?: number;
  ID?: number;
  fullName?: string;
  FullName?: string;
  employeeCode?: string;
  EmployeeCode?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  designationName?: string;
  DesignationName?: string;
  levelID?: number;
  LevelID?: number;
  levelName?: string;
  LevelName?: string;
}

const mapToMasterDataItem = (
  item: GenericMasterDataResponse,
): MasterDataItem => {
  return {
    id: item.id,
    name:
      item.locationName || item.departmentName || item.designationName || "",
  };
};

export const getWorkLocations = async (): Promise<MasterDataItem[]> => {
  try {
    const response = await apiClient.get<GenericMasterDataResponse[]>(
      API_ENDPOINTS.WorkLocations,
    );
    return Array.isArray(response.data) ? response.data.map(mapToMasterDataItem) : [];
  } catch {
    return [];
  }
};

export const getDepartments = async (): Promise<MasterDataItem[]> => {
  try {
    const response = await apiClient.get<GenericMasterDataResponse[]>(
      API_ENDPOINTS.Departments,
    );
    return Array.isArray(response.data) ? response.data.map(mapToMasterDataItem) : [];
  } catch {
    return [];
  }
};

export const getDesignations = async (): Promise<MasterDataItem[]> => {
  try {
    const response = await apiClient.get<GenericMasterDataResponse[]>(
      API_ENDPOINTS.Designations,
    );
    return Array.isArray(response.data) ? response.data.map(mapToMasterDataItem) : [];
  } catch {
    return [];
  }
};

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await apiClient.get<Role[]>(API_ENDPOINTS.Roles);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getLeaveTypes = async (): Promise<LeaveTypeItem[]> => {
  try {
    const response = await apiClient.get<LeaveTypeItem[]>(
      API_ENDPOINTS.LeaveTypes,
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getEmployeeSelectionList = async (): Promise<
  EmployeeSelectItem[]
> => {
  try {
    const response = await apiClient.get<BackendEmployeeDto[]>(
      API_ENDPOINTS.EmployeeSelectionList,
    );
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((e) => {
      const explicitName = e.fullName || e.FullName;
      const combinedName = [e.firstName || e.FirstName || "", e.lastName || e.LastName || ""].filter(Boolean).join(" ");
      return {
        id: Number(e.id ?? e.ID ?? 0),
        fullName: explicitName || combinedName || `Employee #${e.id ?? e.ID}`,
        employeeCode: e.employeeCode ?? e.EmployeeCode ?? "",
        firstName: e.firstName ?? e.FirstName ?? "",
        lastName: e.lastName ?? e.LastName ?? "",
        designation: e.designationName ?? e.DesignationName ?? "",
      };
    });
  } catch {
    return [];
  }
};

export const getEmployeesByRole = async (
  role: string,
): Promise<EmployeeSelectItem[]> => {
  try {
    const response = await apiClient.get<BackendEmployeeDto[]>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`,
      { params: { role } },
    );
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((e) => {
      const explicitName = e.fullName || e.FullName;
      const combinedName = [e.firstName || e.FirstName || "", e.lastName || e.LastName || ""].filter(Boolean).join(" ");
      return {
        id: Number(e.id ?? e.ID ?? 0),
        fullName: explicitName || combinedName || `Employee #${e.id ?? e.ID}`,
        employeeCode: e.employeeCode ?? e.EmployeeCode ?? "",
        firstName: e.firstName ?? e.FirstName ?? "",
        lastName: e.lastName ?? e.LastName ?? "",
        designation: e.designationName ?? e.DesignationName ?? "",
      };
    });
  } catch {
    return [];
  }
};

export const getExpenseTypes = async (): Promise<ExpenseTypeItem[]> => {
  try {
    const response = await apiClient.get<ExpenseTypeItem[]>(
      API_ENDPOINTS.ExpenseType,
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getCountries = async (): Promise<CountryItem[]> => {
  try {
    const response = await apiClient.get<CountryItem[]>(API_ENDPOINTS.Country);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getStates = async (): Promise<StateItem[]> => {
  try {
    const response = await apiClient.get<StateItem[]>(API_ENDPOINTS.State);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
};

export const getCompanies = async (): Promise<CompanyItem[]> => {
  try {
    const url = API_ENDPOINTS.CompanyProfile || `${API_ENDPOINTS.BaseUrl}/company-profile`;
    const response = await apiClient.get<any>(url);
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    if (list.length > 0) {
      return list.map((c: any) => ({
        companyId: Number(c.companyProfileId ?? c.companyId ?? c.id ?? 0),
        companyName: String(c.companyName ?? c.legalName ?? "I-Square Safety"),
      }));
    }
  } catch {}

  try {
    const url = API_ENDPOINTS.Customer || `${API_ENDPOINTS.BaseUrl}/customer`;
    const response = await apiClient.get<any>(url);
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    if (list.length > 0) {
      return list.map((c: any) => ({
        companyId: Number(c.customerId ?? c.companyId ?? c.id ?? 0),
        companyName: String(c.customerName ?? c.companyName ?? ""),
      }));
    }
  } catch {}

  return [{ companyId: 1, companyName: "I-Square Safety Equipments Pvt. Ltd." }];
};

export const getDepartmentsList = async (): Promise<DepartmentItem[]> => {
  try {
    const response = await apiClient.get<DepartmentItem[]>(
      API_ENDPOINTS.Departments,
    );
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    return list.map((d: any) => ({
      id: Number(d.id ?? d.departmentID ?? 0),
      departmentName: String(d.departmentName ?? d.name ?? ""),
    }));
  } catch {
    return [];
  }
};

export const getDesignationsList = async (): Promise<DesignationItem[]> => {
  try {
    const response = await apiClient.get<DesignationItem[]>(
      API_ENDPOINTS.Designations,
    );
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    return list.map((d: any) => ({
      id: Number(d.id ?? d.designationID ?? 0),
      designationName: String(d.designationName ?? d.name ?? ""),
    }));
  } catch {
    return [];
  }
};

export const getEmployeeLevelSelectionList = async (): Promise<
  EmployeeLevelSelectItem[]
> => {
  try {
    const response = await apiClient.get<BackendEmployeeDto[]>(
      API_ENDPOINTS.EmployeeSelectionList,
    );
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((e) => {
      const explicitName = e.fullName || e.FullName;
      const combinedName = [e.firstName || e.FirstName || "", e.lastName || e.LastName || ""].filter(Boolean).join(" ");
      const name = explicitName || combinedName || `Employee #${e.id ?? e.ID}`;
      return {
        id: Number(e.id ?? e.ID ?? 0),
        fullName: name,
        levelID: Number(e.levelID ?? e.LevelID ?? 0),
        levelName: e.levelName ?? e.LevelName ?? "",
        empName: name,
        levelOrder: 0,
      };
    });
  } catch {
    return [];
  }
};

export const setEmployeeReporting = async (
  employeeId: number,
  reportingToId: number,
): Promise<string> => {
  try {
    const response = await apiClient.put<{ message?: string } | string>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${employeeId}`,
      {
        reportingTo: reportingToId,
      },
    );
    return typeof response.data === "string" ? response.data : response.data.message || "Updated";
  } catch {
    return "Error updating reporting";
  }
};
