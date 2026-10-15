import apiClient from "../../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../../API/apiConfig";

export interface FollowUp {
  followUpId: number;
  customerId: number;
  companyId?: number;
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
  customerId: number;
  companyId?: number;
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
  customerId: number;
  companyId?: number;
  userId?: number;
  followUpDate: string;
  remarks: string;
  statusId?: number;
  priorityId?: number;
  nextFollowUpDate?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const getAllFollowUps = async (): Promise<FollowUp[]> => {
  const response = await apiClient.get<FollowUp[]>(API_ENDPOINTS.FollowUp);
  return response.data;
};

export const getFollowUpById = async (id: number): Promise<FollowUp> => {
  const response = await apiClient.get<FollowUp>(`${API_ENDPOINTS.FollowUp}/${id}`);
  return response.data;
};

export const createFollowUp = async (payload: FollowUpCreatePayload): Promise<FollowUp> => {
  const requestPayload = {
    ...payload,
    companyId: payload.customerId,
  };
  const response = await apiClient.post<FollowUp>(API_ENDPOINTS.FollowUp, requestPayload);
  return response.data;
};

export const updateFollowUp = async (id: number, payload: FollowUpUpdatePayload): Promise<void> => {
  const requestPayload = {
    ...payload,
    followUpId: id,
    companyId: payload.customerId,
  };
  await apiClient.put(`${API_ENDPOINTS.FollowUp}/${id}`, requestPayload);
};

export const deleteFollowUp = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.FollowUp}/${id}`);
};
