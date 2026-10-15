import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  CallType,
  CallTypeCreatePayload,
  CallTypeUpdatePayload,
} from "../Types/CallTypeTypes";

export * from "../Types/CallTypeTypes";

export const getAllCallTypes = async (): Promise<CallType[]> => {
  const response = await apiClient.get<any>(API_ENDPOINTS.CallType);
  let list: any[] = [];
  if (Array.isArray(response.data)) {
    list = response.data;
  } else if (response.data && Array.isArray((response.data as any).data)) {
    list = (response.data as any).data;
  } else if (response.data && Array.isArray((response.data as any).result)) {
    list = (response.data as any).result;
  }

  return list.map((item: any) => ({
    id: item.id ?? item.Id ?? item.callTypeId ?? 0,
    callTypeName: item.callTypeName ?? item.CallTypeName ?? item.name ?? "",
    isActive:
      item.isActive !== undefined
        ? Boolean(item.isActive)
        : item.IsActive !== undefined
        ? Boolean(item.IsActive)
        : true,
  }));
};

export const getCallTypeById = async (id: number): Promise<CallType> => {
  const response = await apiClient.get<any>(`${API_ENDPOINTS.CallType}/${id}`);
  const data = response.data?.data ?? response.data;
  return {
    id: data?.id ?? data?.Id ?? id,
    callTypeName: data?.callTypeName ?? data?.CallTypeName ?? "",
    isActive:
      data?.isActive !== undefined
        ? Boolean(data.isActive)
        : data?.IsActive !== undefined
        ? Boolean(data.IsActive)
        : true,
  };
};

export const createCallType = async (
  payload: CallTypeCreatePayload
): Promise<CallType> => {
  const body = {
    id: 0,
    callTypeName: payload.callTypeName.trim(),
    isActive: payload.isActive,
  };
  const response = await apiClient.post<any>(API_ENDPOINTS.CallType, body);
  const data = response.data?.data ?? response.data;
  return {
    id: data?.id ?? data?.Id ?? 0,
    callTypeName: data?.callTypeName ?? payload.callTypeName,
    isActive: data?.isActive !== undefined ? Boolean(data.isActive) : payload.isActive,
  };
};

export const updateCallType = async (
  id: number,
  payload: CallTypeUpdatePayload
): Promise<void> => {
  const body = {
    id,
    callTypeName: payload.callTypeName.trim(),
    isActive: payload.isActive,
  };
  await apiClient.put(`${API_ENDPOINTS.CallType}/${id}`, body);
};

export const deleteCallType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CallType}/${id}`);
};

// Aliases for compatibility
export type CallTypeItem = CallType;
export const getCallTypes = getAllCallTypes;
