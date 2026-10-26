import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface PlaceOfSupplyItem {
  placeOfSupplyId: number;
  placeOfSupplyCode: string;
  placeOfSupplyName: string;
  placeOfSupplyDescription?: string;
  placeOfSupplySortOrder?: number;
  placeOfSupplyIsActive: boolean;
  placeOfSupplyCreatedAt?: string;
  placeOfSupplyUpdatedAt?: string;
}

export interface PlaceOfSupplyCreatePayload {
  placeOfSupplyCode: string;
  placeOfSupplyName: string;
  placeOfSupplyDescription?: string;
  placeOfSupplySortOrder?: number;
  placeOfSupplyIsActive: boolean;
}

export interface PlaceOfSupplyUpdatePayload {
  placeOfSupplyName: string;
  placeOfSupplyDescription?: string;
  placeOfSupplySortOrder?: number;
  placeOfSupplyIsActive: boolean;
}

export const getAllPlaceOfSupplies = async (): Promise<PlaceOfSupplyItem[]> => {
  try {
    const response = await apiClient.get<PlaceOfSupplyItem[]>(API_ENDPOINTS.PlaceOfSupplies);
    let list: any[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      list = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      list = (response.data as any).result;
    }
    return list;
  } catch (error) {
    console.warn("getAllPlaceOfSupplies API error:", error);
    return [];
  }
};

export const createPlaceOfSupply = async (
  payload: PlaceOfSupplyCreatePayload
): Promise<PlaceOfSupplyItem> => {
  const response = await apiClient.post<PlaceOfSupplyItem>(
    API_ENDPOINTS.PlaceOfSupplies,
    payload
  );
  return response.data;
};

export const updatePlaceOfSupply = async (
  id: number,
  payload: PlaceOfSupplyUpdatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.PlaceOfSupplies}/${id}`, payload);
};

export const deletePlaceOfSupply = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PlaceOfSupplies}/${id}`);
};