import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface SalesTerritoryItem {
  salesTerritoryId: number;
  salesTerritoryCode: string;
  salesTerritoryName: string;
  salesTerritoryDescription?: string;
  salesTerritorySortOrder?: number;
  salesTerritoryIsActive: boolean;
  salesTerritoryCreatedAt?: string;
  salesTerritoryUpdatedAt?: string;
}

export interface SalesTerritoryCreatePayload {
  salesTerritoryCode: string;
  salesTerritoryName: string;
  salesTerritoryDescription?: string;
  salesTerritorySortOrder?: number;
  salesTerritoryIsActive: boolean;
}

export interface SalesTerritoryUpdatePayload {
  salesTerritoryName: string;
  salesTerritoryDescription?: string;
  salesTerritorySortOrder?: number;
  salesTerritoryIsActive: boolean;
}

export const getAllSalesTerritories = async (): Promise<SalesTerritoryItem[]> => {
  try {
    const response = await apiClient.get<SalesTerritoryItem[]>(API_ENDPOINTS.SalesTerritories);
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
    console.warn("getAllSalesTerritories API error:", error);
    return [];
  }
};

export const createSalesTerritory = async (
  payload: SalesTerritoryCreatePayload
): Promise<SalesTerritoryItem> => {
  const response = await apiClient.post<SalesTerritoryItem>(
    API_ENDPOINTS.SalesTerritories,
    payload
  );
  return response.data;
};

export const updateSalesTerritory = async (
  id: number,
  payload: SalesTerritoryUpdatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.SalesTerritories}/${id}`, payload);
};

export const deleteSalesTerritory = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.SalesTerritories}/${id}`);
};