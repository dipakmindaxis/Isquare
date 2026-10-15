import apiClient from "../../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../../API/apiConfig";

export interface CallType {
  id: number;
  callTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export interface CallTypeCreatePayload {
  callTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export interface CallTypeUpdatePayload {
  id?: number;
  callTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export const getAllCallTypes = async (): Promise<CallType[]> => {
  const response = await apiClient.get<CallType[]>(API_ENDPOINTS.CallType);
  return response.data;
};

export const getCallTypeById = async (id: number): Promise<CallType> => {
  const response = await apiClient.get<CallType>(`${API_ENDPOINTS.CallType}/${id}`);
  return response.data;
};

export const createCallType = async (payload: CallTypeCreatePayload): Promise<CallType> => {
  const requestBody = {
    callTypeName: payload.callTypeName,
    isActive: payload.isActive,
  };
  const response = await apiClient.post<CallType>(API_ENDPOINTS.CallType, requestBody);
  return response.data;
};

export const updateCallType = async (id: number, payload: CallTypeUpdatePayload): Promise<void> => {
  const requestBody = {
    id,
    callTypeName: payload.callTypeName,
    isActive: payload.isActive,
  };
  await apiClient.put(`${API_ENDPOINTS.CallType}/${id}`, requestBody);
};

export const deleteCallType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CallType}/${id}`);
};

// Aliases for compatibility
export interface CallTypeItem {
  id: number;
  callTypeName: string;
  value: string;
  label: string;
  code: string;
  isActive: boolean;
}

export const getCallTypes = getAllCallTypes;
export const saveCallType = async (
  item: Omit<CallType, "id"> & { id?: number; value?: string }
): Promise<CallType> => {
  const name = item.callTypeName || item.value || "";
  if (item.id) {
    await updateCallType(item.id, {
      id: item.id,
      callTypeName: name,
      isActive: item.isActive,
    });
    return { id: item.id, callTypeName: name, isActive: item.isActive };
  } else {
    return await createCallType({
      callTypeName: name,
      isActive: item.isActive,
    });
  }
};
