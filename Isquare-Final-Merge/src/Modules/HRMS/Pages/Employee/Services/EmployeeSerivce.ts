import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { EmployeeSelectItem } from "../../../../HRMS/Services/MasterDataService";
import { getStatutoryDetailsByEmployeeId } from "./EmployeeStatutoryService";
import { getBankDetailsByEmployeeId } from "./EmployeeBankService";
import { getDocumentsByEmployeeId } from "./EmployeeDocumentService";
import { getPFDetailsByEmployeeId } from "./EmployeePFSerivce";

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  isActive: boolean;
  workLocationName: string;
  departmentName: string;
  designationName: string;
  panNumber: string;
  aadhaarNumber: string;
  companyName: string;
}

export interface NewEmployeePayload {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  presentAddress: string;
  dateOfJoining: string;
  workLocationID: number;
  departmentID: number;
  designationID: number;
  reportingTo?: number | null;
  biometricID?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateEmployeePayload {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  presentAddress: string;
  workLocationID: number;
  departmentID: number;
  designationID: number;
  reportingTo?: number | null;
  isActive: boolean;
  role?: string;
}

export interface EmployeeDetail extends Employee {
  dateOfBirth?: string;
  dateOfJoining?: string;
  gender?: string;
  presentAddress?: string;
  workLocationID?: number;
  departmentID?: number;
  designationID?: number;
  reportingTo?: number;
  role?: string;
}

export interface ViewDocument {
  id: number;
  documentName: string;
  filePath: string;
  uploadedDate: string;
}

export interface ViewBankDetails {
  accountHolderName: string;
  bankAddress: string;
  sortCode: string;
  swiftCode: string;
  ibanNo: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ViewStatutoryDetails {
  aadhaarNumber: string;
  passportNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
}

export interface ViewPFDetails {
  pfDeductionPercentage: number;
  isCappedAt15k: boolean;
}

export interface ViewTDSDetails {
  tdsAmount: number;
}

export interface Qualification {
  degree: string;
  university: string;
  passingYear: string;
  percentage: string;
}

export interface Experience {
  companyName: string;
  designation: string;
  fromDate: string;
  toDate: string;
  location: string;
}

export interface EmployeeFullDetail {
  id: number;
  role: string;
  googleCalendarId?: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress: string;
  curMobileNo?: string;
  curEmail?: string;
  mobileNumber: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  gender?: string;
  workLocationName: string;
  departmentName: string;
  designationName: string;
  reportingToName: string;
  isActive: boolean;
  photoPath?: string;
  companyName?: string;
  curFlatNo?: string;
  curPremisesName?: string;
  curRoadName?: string;
  curLocality?: string;
  curTownDistrict?: string;
  curPinNo?: string;
  curCountryName?: string;
  curStateName?: string;
  presentAddress?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  uanNo?: string;
  statutoryDetails: ViewStatutoryDetails | null;
  bankDetails: ViewBankDetails | null;
  documents: ViewDocument[];
  pfDetails: ViewPFDetails | null;
  tdsDetails: ViewTDSDetails | null;
  qualifications: Qualification[];
  experiences: Experience[];
}

export interface CrmEmployeeRecord {
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
  dateOfBirth?: string;
  DateOfBirth?: string;
  gender?: string;
  Gender?: string;
  mobileNumber?: string;
  MobileNumber?: string;
  emailAddress?: string;
  EmailAddress?: string;
  presentAddress?: string;
  PresentAddress?: string;
  dateOfJoining?: string;
  DateOfJoining?: string;
  workLocationID?: number;
  WorkLocationID?: number;
  workLocationName?: string;
  WorkLocationName?: string;
  departmentID?: number;
  DepartmentID?: number;
  departmentName?: string;
  DepartmentName?: string;
  designationID?: number;
  DesignationID?: number;
  designationName?: string;
  DesignationName?: string;
  reportingTo?: number;
  ReportingTo?: number;
  reportingToName?: string;
  ReportingToName?: string;
  userId?: string;
  UserId?: string;
  dateOfLeaving?: string;
  DateOfLeaving?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
  panNumber?: string;
  PANNumber?: string;
  panNo?: string;
  PANNo?: string;
  aadhaarNumber?: string;
  AadhaarNumber?: string;
  aadharNumber?: string;
  AadharNumber?: string;
  aadhaarNo?: string;
  AadhaarNo?: string;
  passportNumber?: string;
  PassportNumber?: string;
  uanNo?: string;
  UanNo?: string;
  uanNumber?: string;
  UanNumber?: string;
  companyName?: string;
  CompanyName?: string;
  companyId?: number | string;
  CompanyId?: number | string;
  curFlatNo?: string;
  CurFlatNo?: string;
  curPremisesName?: string;
  CurPremisesName?: string;
  curRoadName?: string;
  CurRoadName?: string;
  curLocality?: string;
  CurLocality?: string;
  curTownDistrict?: string;
  CurTownDistrict?: string;
  curPinNo?: string;
  CurPinNo?: string;
  curMobileNo?: string;
  CurMobileNo?: string;
  curEmail?: string;
  CurEmail?: string;
  statutoryDetails?: any;
  bankDetails?: any;
}

const mapCrmEmployeeToHrms = (e: CrmEmployeeRecord): Employee => {
  const pan =
    e.panNumber ??
    e.PANNumber ??
    e.panNo ??
    e.PANNo ??
    e.statutoryDetails?.panNumber ??
    e.statutoryDetails?.panNo ??
    "";

  const aadhaar =
    e.aadhaarNumber ??
    e.AadhaarNumber ??
    e.aadharNumber ??
    e.AadharNumber ??
    e.aadhaarNo ??
    e.AadhaarNo ??
    e.statutoryDetails?.aadhaarNumber ??
    e.statutoryDetails?.aadhaarNo ??
    "";

  const company =
    e.companyName ??
    e.CompanyName ??
    "I-Square Safety Equipments Pvt. Ltd.";

  return {
    id: e.id ?? e.ID ?? 0,
    employeeCode: e.employeeCode ?? e.EmployeeCode ?? "",
    firstName: e.firstName ?? e.FirstName ?? "",
    middleName: e.middleName ?? e.MiddleName ?? "",
    lastName: e.lastName ?? e.LastName ?? "",
    emailAddress: e.emailAddress ?? e.EmailAddress ?? e.curEmail ?? e.CurEmail ?? "",
    mobileNumber: e.mobileNumber ?? e.MobileNumber ?? e.curMobileNo ?? e.CurMobileNo ?? "",
    isActive: e.isActive ?? e.IsActive ?? true,
    workLocationName: e.workLocationName ?? e.WorkLocationName ?? "Head Office",
    departmentName: e.departmentName ?? e.DepartmentName ?? "",
    designationName: e.designationName ?? e.DesignationName ?? "",
    panNumber: pan,
    aadhaarNumber: aadhaar,
    companyName: company,
  };
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  let records: CrmEmployeeRecord[] = [];

  try {
    const response = await apiClient.get<CrmEmployeeRecord[]>(API_ENDPOINTS.Employees);
    if (Array.isArray(response.data) && response.data.length > 0) {
      records = response.data;
    }
  } catch {
    // If payroll-employees fails or is empty, fall back to CRM endpoints
  }

  // Fallback 1: GET /api/employees (CompanyPlatform.CRM)
  if (records.length === 0) {
    try {
      const crmUrl = API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`;
      const response = await apiClient.get<CrmEmployeeRecord[]>(crmUrl);
      if (Array.isArray(response.data) && response.data.length > 0) {
        records = response.data;
      }
    } catch {}
  }

  // Fallback 2: GET /api/employee (CompanyPlatform.CRM)
  if (records.length === 0) {
    try {
      const crmSingleUrl = API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`;
      const response = await apiClient.get<CrmEmployeeRecord[]>(crmSingleUrl);
      if (Array.isArray(response.data) && response.data.length > 0) {
        records = response.data;
      }
    } catch {}
  }

  let employees = records.map(mapCrmEmployeeToHrms);

  // If any employees are missing PAN or Aadhaar, attempt bulk lookup from statutory details
  try {
    const statRes = await apiClient.get<any[]>(API_ENDPOINTS.EmployeeStatutoryDetails);
    const statList = Array.isArray(statRes.data)
      ? statRes.data
      : Array.isArray((statRes.data as any)?.data)
      ? (statRes.data as any).data
      : [];
    if (statList.length > 0) {
      const statMap = new Map<number, any>();
      statList.forEach((s: any) => {
        const empId = Number(s.employeeID ?? s.employeeId ?? s.EmployeeID ?? 0);
        if (empId) statMap.set(empId, s);
      });
      employees = employees.map((emp) => {
        const s = statMap.get(emp.id);
        if (s) {
          return {
            ...emp,
            panNumber: emp.panNumber || s.panNumber || s.PANNumber || s.panNo || s.PANNo || "",
            aadhaarNumber: emp.aadhaarNumber || s.aadhaarNumber || s.AadhaarNumber || s.aadharNumber || s.AadharNumber || "",
          };
        }
        return emp;
      });
    }
  } catch {}

  // Parallel fallback: fetch statutory details per employee for any remaining records missing PAN or Aadhaar
  const missingStatutory = employees.filter(
    (emp) => (!emp.panNumber || !emp.aadhaarNumber) && emp.id > 0
  );

  if (missingStatutory.length > 0) {
    await Promise.allSettled(
      missingStatutory.map(async (emp) => {
        try {
          const s = await getStatutoryDetailsByEmployeeId(emp.id);
          if (s) {
            emp.panNumber =
              emp.panNumber ||
              s.panNumber ||
              (s as any).PANNumber ||
              (s as any).panNo ||
              (s as any).PANNo ||
              "";
            emp.aadhaarNumber =
              emp.aadhaarNumber ||
              s.aadhaarNumber ||
              (s as any).AadhaarNumber ||
              (s as any).aadharNumber ||
              (s as any).AadharNumber ||
              (s as any).aadhaarNo ||
              "";
          }
        } catch {
          // Ignore individual 404/failure
        }
      })
    );
  }

  return employees;
};

export const addEmployee = async (
  payload: NewEmployeePayload | FormData,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.Register,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Failed to add employee:", error);

    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("An unexpected error occurred while adding the employee.");
  }
};

export const getEmployeeById = async (id: number): Promise<EmployeeDetail> => {
  try {
    const response = await apiClient.get<EmployeeDetail>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}:`, error);
    throw new Error("Could not fetch employee details.");
  }
};

export const getEmployeeFullDetails = async (
  id: number,
): Promise<EmployeeFullDetail> => {
  let employeeData: any = null;

  try {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.Employees}/${id}/full-details`,
    );
    if (response.data) employeeData = response.data;
  } catch {
    // If full-details endpoint doesn't exist, fallback to CRM employee
  }

  if (!employeeData) {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`,
      );
      if (response.data) employeeData = response.data;
    } catch {}
  }

  if (!employeeData) {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.Employees}/${id}`,
      );
      if (response.data) employeeData = response.data;
    } catch {}
  }

  if (!employeeData) {
    throw new Error("Could not fetch employee's details.");
  }

  const d = employeeData;

  const [statutoryRes, bankRes, docsRes, pfRes] = await Promise.all([
    getStatutoryDetailsByEmployeeId(id).catch(() => null),
    getBankDetailsByEmployeeId(id).catch(() => null),
    getDocumentsByEmployeeId(id).catch(() => []),
    getPFDetailsByEmployeeId(id).catch(() => null),
  ]);

  const pan =
    statutoryRes?.panNumber ||
    d.statutoryDetails?.panNumber ||
    d.panNumber ||
    d.PANNumber ||
    d.panNo ||
    d.PANNo ||
    "";

  const aadhaar =
    statutoryRes?.aadhaarNumber ||
    d.statutoryDetails?.aadhaarNumber ||
    d.aadhaarNumber ||
    d.AadhaarNumber ||
    d.aadharNumber ||
    d.AadharNumber ||
    d.aadhaarNo ||
    d.AadhaarNo ||
    "";

  const passport =
    (statutoryRes as any)?.passportNumber ||
    d.statutoryDetails?.passportNumber ||
    d.passportNumber ||
    d.PassportNumber ||
    "";

  const uan =
    statutoryRes?.uanNo ||
    d.statutoryDetails?.uanNo ||
    d.uanNo ||
    d.UanNo ||
    d.uanNumber ||
    d.UanNumber ||
    "";

  const company =
    d.companyName ||
    d.CompanyName ||
    "I-Square Safety Equipments Pvt. Ltd.";

  const location =
    d.workLocationName ||
    d.WorkLocationName ||
    d.location ||
    d.Location ||
    "Head Office";

  const reportingTo =
    d.reportingToName ||
    d.ReportingToName ||
    d.reportingManager ||
    d.ReportingManager ||
    "";

  const statutory: ViewStatutoryDetails = {
    aadhaarNumber: aadhaar,
    panNumber: pan,
    passportNumber: passport,
    uanNo: uan,
    pfNo: statutoryRes?.pfNo || d.statutoryDetails?.pfNo || d.pfNo || d.PfNo || "",
    esiNo: statutoryRes?.esiNo || d.statutoryDetails?.esiNo || d.esiNo || d.EsiNo || "",
  };

  const bank: ViewBankDetails | null = bankRes
    ? {
        bankName: bankRes.bankName || "",
        accountHolderName: bankRes.accountHolderName || "",
        accountNumber: bankRes.accountNumber || "",
        ifscCode: bankRes.ifscCode || "",
        bankAddress: (bankRes as any).bankAddress || "",
        sortCode: (bankRes as any).sortCode || "",
        swiftCode: (bankRes as any).swiftCode || "",
        ibanNo: (bankRes as any).ibanNo || "",
      }
    : (d.bankDetails?.bankName || d.bankName || d.BankName
    ? {
        bankName: d.bankDetails?.bankName || d.bankName || d.BankName || "",
        accountHolderName: d.bankDetails?.accountHolderName || d.accountHolderName || d.AccountHolderName || "",
        accountNumber: d.bankDetails?.accountNumber || d.accountNumber || d.AccountNumber || "",
        ifscCode: d.bankDetails?.ifscCode || d.ifscCode || d.IFSCCode || d.ifsc || "",
        bankAddress: d.bankDetails?.bankAddress || d.bankAddress || d.BankAddress || "",
        sortCode: d.bankDetails?.sortCode || d.sortCode || d.SortCode || "",
        swiftCode: d.bankDetails?.swiftCode || d.swiftCode || d.SwiftCode || "",
        ibanNo: d.bankDetails?.ibanNo || d.ibanNo || d.IBANNo || "",
      }
    : null);

  const docs = Array.isArray(d.documents) && d.documents.length > 0 ? d.documents : docsRes;

  return {
    id: Number(d.id ?? d.ID ?? id),
    role: d.role || d.Role || "",
    googleCalendarId: d.googleCalendarId || d.GoogleCalendarId || "",
    employeeCode: d.employeeCode || d.EmployeeCode || "",
    firstName: d.firstName || d.FirstName || "",
    middleName: d.middleName || d.MiddleName || "",
    lastName: d.lastName || d.LastName || "",
    emailAddress: d.emailAddress || d.EmailAddress || d.curEmail || d.CurEmail || d.email || d.Email || "",
    curMobileNo: d.curMobileNo || d.CurMobileNo || d.mobileNumber || d.MobileNumber || d.mobileNo || d.MobileNo || "",
    curEmail: d.curEmail || d.CurEmail || d.emailAddress || d.EmailAddress || d.email || d.Email || "",
    mobileNumber: d.mobileNumber || d.MobileNumber || d.curMobileNo || d.CurMobileNo || d.mobileNo || d.MobileNo || "",
    dateOfBirth: d.dateOfBirth || d.DateOfBirth,
    dateOfJoining: d.dateOfJoining || d.DateOfJoining,
    gender: d.gender || d.Gender,
    workLocationName: location,
    departmentName: d.departmentName || d.DepartmentName || "",
    designationName: d.designationName || d.DesignationName || "",
    reportingToName: reportingTo,
    isActive: d.isActive ?? d.IsActive ?? true,
    photoPath: d.photoPath || d.PhotoPath,
    companyName: company,
    curFlatNo: d.curFlatNo || d.CurFlatNo || d.flatNo || d.FlatNo || "",
    curPremisesName: d.curPremisesName || d.CurPremisesName || d.premisesName || d.PremisesName || "",
    curRoadName: d.curRoadName || d.CurRoadName || d.roadName || d.RoadName || "",
    curLocality: d.curLocality || d.CurLocality || d.locality || d.Locality || "",
    curTownDistrict: d.curTownDistrict || d.CurTownDistrict || d.townDistrict || d.TownDistrict || d.city || d.City || "",
    curPinNo: d.curPinNo || d.CurPinNo || d.pinNo || d.PinNo || d.pincode || d.Pincode || "",
    presentAddress: d.presentAddress || d.PresentAddress || "",
    panNumber: pan,
    aadhaarNumber: aadhaar,
    passportNumber: passport,
    uanNo: uan,
    statutoryDetails: statutory,
    bankDetails: bank,
    documents: docs,
    pfDetails: pfRes || d.pfDetails || null,
    tdsDetails: d.tdsDetails || null,
    qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
    experiences: Array.isArray(d.experiences) ? d.experiences : [],
    ...(d as any),
  };
};

export const updateEmployee = async (
  id: number,
  payload: UpdateEmployeePayload | any,
): Promise<EmployeeDetail> => {
  try {
    const response = await apiClient.put<EmployeeDetail>(
      `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update employee with id ${id}:`, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "An unexpected error occurred while updating employee details.",
    );
  }
};

export const deleteEmployee = async (
  id: number,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.Employees}/${id}`,
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Failed to delete employee with id ${id}:`, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "An unexpected error occurred while deleting the employee.",
    );
  }
};

export const getEmployeesByRoleAndDepartment = async (
  role: string,
  departmentId: number,
): Promise<EmployeeSelectItem[]> => {
  const response = await apiClient.get<EmployeeSelectItem[]>(
    API_ENDPOINTS.EmployeesByRoleAndDepartment,
    { params: { role, departmentId } },
  );
  return response.data;
};

export const updateEmployeeStatus = async (id: number, isActive: boolean) => {
  const token = sessionStorage.getItem("token");
  await apiClient.patch(
    `${API_ENDPOINTS.Employees}/${id}/status`,
    { isActive },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};
