import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface CompanyOption {
  companyId: number;
  companyName: string;
  code?: string;
}

export interface FollowUp {
  followUpId: number;
  companyId: number;
  userId?: number;
  followUpDate: string;
  remarks: string;
  statusId?: number;
  priorityId?: number;
  nextFollowUpDate?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface FollowUpCreatePayload {
  companyId: number;
  userId?: number;
  followUpDate: string;
  remarks: string;
  statusId?: number;
  priorityId?: number;
  nextFollowUpDate?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface FollowUpUpdatePayload {
  followUpId?: number;
  companyId: number;
  userId?: number;
  followUpDate: string;
  remarks: string;
  statusId?: number;
  priorityId?: number;
  nextFollowUpDate?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const getAllCompanies = async (): Promise<CompanyOption[]> => {
  try {
    const customerUrl = API_ENDPOINTS.Customer || "/api/customer";
    const response = await apiClient.get<any>(customerUrl);
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    if (list.length > 0) {
      return list.map((item: any) => {
        const id = Number(item.customerId ?? item.companyId ?? item.id ?? 0);
        const name = String(
          item.customerName ??
            item.companyName ??
            item.customerShortName ??
            `Customer #${id}`
        );
        const code = item.customerCode || item.code || "";
        return {
          companyId: id,
          companyName: name,
          code,
        };
      });
    }
  } catch (err) {
    console.warn("Failed fetching from Customer endpoint in follow-up:", err);
  }

  // Fallback to CompanyProfile or Company
  try {
    const url = API_ENDPOINTS.CompanyProfile || "/api/company-profile";
    const response = await apiClient.get<any>(url);
    const list = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
      ? (response.data as any).data
      : [];
    if (list.length > 0) {
      return list.map((item: any) => ({
        companyId: Number(item.companyProfileId ?? item.companyId ?? item.id ?? 0),
        companyName: String(item.companyName ?? item.legalName ?? `Company #${item.companyProfileId || item.companyId}`),
        code: item.gstin || item.pan || "",
      }));
    }
  } catch {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.Company);
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((item: any) => ({
        companyId: Number(item.companyId ?? item.id ?? 0),
        companyName: String(item.companyName ?? `Company #${item.companyId}`),
      }));
    } catch {
      return [];
    }
  }
  return [];
};

export const getAllFollowUps = async (): Promise<FollowUp[]> => {
  const response = await apiClient.get<FollowUp[]>(API_ENDPOINTS.FollowUp);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

export const getFollowUpById = async (id: number): Promise<FollowUp> => {
  const response = await apiClient.get<FollowUp>(`${API_ENDPOINTS.FollowUp}/${id}`);
  return response.data;
};

export const createFollowUp = async (payload: FollowUpCreatePayload): Promise<FollowUp> => {
  const requestPayload = {
    followUpId: 0,
    companyId: Number(payload.companyId || 0),
    userId: Number(payload.userId || 0),
    followUpDate: payload.followUpDate
      ? new Date(payload.followUpDate).toISOString()
      : new Date().toISOString(),
    remarks: String(payload.remarks || ""),
    statusId: Number(payload.statusId || 1),
    priorityId: Number(payload.priorityId || 1),
    nextFollowUpDate: payload.nextFollowUpDate
      ? new Date(payload.nextFollowUpDate).toISOString()
      : null,
    isActive: payload.isActive !== false,
    isDeleted: false,
  };
  const response = await apiClient.post<FollowUp>(API_ENDPOINTS.FollowUp, requestPayload);
  return response.data;
};

export const updateFollowUp = async (id: number, payload: FollowUpUpdatePayload): Promise<void> => {
  const requestPayload = {
    followUpId: Number(id),
    companyId: Number(payload.companyId || 0),
    userId: Number(payload.userId || 0),
    followUpDate: payload.followUpDate
      ? new Date(payload.followUpDate).toISOString()
      : new Date().toISOString(),
    remarks: String(payload.remarks || ""),
    statusId: Number(payload.statusId || 1),
    priorityId: Number(payload.priorityId || 1),
    nextFollowUpDate: payload.nextFollowUpDate
      ? new Date(payload.nextFollowUpDate).toISOString()
      : null,
    isActive: payload.isActive !== false,
    isDeleted: false,
  };
  await apiClient.put(`${API_ENDPOINTS.FollowUp}/${id}`, requestPayload);
};

export const deleteFollowUp = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.FollowUp}/${id}`);
};
