import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface AddressType {
  addressTypeId: number;
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface AddressTypeCreatePayload {
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
}

export interface AddressTypeUpdatePayload {
  addressTypeId?: number;
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
}

export const getAllAddressTypes = async (): Promise<AddressType[]> => {
  const response = await apiClient.get<AddressType[]>(API_ENDPOINTS.AddressType);
  return response.data;
};

export const getAddressTypeById = async (id: number): Promise<AddressType> => {
  const response = await apiClient.get<AddressType>(`${API_ENDPOINTS.AddressType}/${id}`);
  return response.data;
};

export const createAddressType = async (payload: AddressTypeCreatePayload): Promise<AddressType> => {
  const response = await apiClient.post<AddressType>(API_ENDPOINTS.AddressType, payload);
  return response.data;
};

export const updateAddressType = async (id: number, payload: AddressTypeUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.AddressType}/${id}`, payload);
};

export const deleteAddressType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.AddressType}/${id}`);
};
