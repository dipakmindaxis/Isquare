import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface ContactType {
  contactTypeId: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface ContactTypeCreatePayload {
  contactTypeId?: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface ContactTypeUpdatePayload {
  contactTypeId?: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const getAllContactTypes = async (): Promise<ContactType[]> => {
  const response = await apiClient.get<ContactType[]>(API_ENDPOINTS.ContactTypes);
  return response.data;
};

export const getContactTypeById = async (id: number): Promise<ContactType> => {
  const response = await apiClient.get<ContactType>(`${API_ENDPOINTS.ContactTypes}/${id}`);
  return response.data;
};

export const createContactType = async (payload: ContactTypeCreatePayload): Promise<ContactType> => {
  const response = await apiClient.post<ContactType>(API_ENDPOINTS.ContactTypes, payload);
  return response.data;
};

export const updateContactType = async (id: number, payload: ContactTypeUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.ContactTypes}/${id}`, payload);
};

export const deleteContactType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.ContactTypes}/${id}`);
};