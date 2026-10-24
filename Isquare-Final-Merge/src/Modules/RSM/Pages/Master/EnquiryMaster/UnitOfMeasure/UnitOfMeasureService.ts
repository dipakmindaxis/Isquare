import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface UnitOfMeasureItem {
  unitOfMeasureId: number;
  unitOfMeasureCode: string;
  unitOfMeasureName: string;
  unitOfMeasureDescription?: string;
  unitOfMeasureSortOrder?: number;
  unitOfMeasureIsActive: boolean;
  unitOfMeasureIsDeleted?: boolean;
  unitOfMeasureCreatedAt?: string;
  unitOfMeasureUpdatedAt?: string;
}

export interface UnitOfMeasureCreatePayload {
  unitOfMeasureCode: string;
  unitOfMeasureName: string;
  unitOfMeasureDescription?: string;
  unitOfMeasureSortOrder?: number;
  unitOfMeasureIsActive: boolean;
}

export interface UnitOfMeasureUpdatePayload {
  unitOfMeasureName: string;
  unitOfMeasureDescription?: string;
  unitOfMeasureSortOrder?: number;
  unitOfMeasureIsActive: boolean;
}

export const getAllUnitOfMeasures = async (): Promise<UnitOfMeasureItem[]> => {
  try {
    const response = await apiClient.get<UnitOfMeasureItem[]>(API_ENDPOINTS.UnitOfMeasures);
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
    console.warn("getAllUnitOfMeasures API error:", error);
    return [];
  }
};

export const createUnitOfMeasure = async (payload: UnitOfMeasureCreatePayload): Promise<UnitOfMeasureItem> => {
  const response = await apiClient.post<UnitOfMeasureItem>(API_ENDPOINTS.UnitOfMeasures, payload);
  return response.data;
};

export const updateUnitOfMeasure = async (id: number, payload: UnitOfMeasureUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.UnitOfMeasures}/${id}`, payload);
};

export const deleteUnitOfMeasure = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.UnitOfMeasures}/${id}`);
};