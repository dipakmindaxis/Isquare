import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface CurrencyItem {
  currencyId: number;
  currencyCode: string;
  currencyName: string;
  currencyDescription?: string;
  currencySortOrder?: number;
  currencyIsActive: boolean;
  currencyCreatedAt?: string;
  currencyUpdatedAt?: string;
}

export interface CurrencyCreatePayload {
  currencyCode: string;
  currencyName: string;
  currencyDescription?: string;
  currencySortOrder?: number;
  currencyIsActive: boolean;
}

export interface CurrencyUpdatePayload {
  currencyName: string;
  currencyDescription?: string;
  currencySortOrder?: number;
  currencyIsActive: boolean;
}

export const getAllCurrencies = async (): Promise<CurrencyItem[]> => {
  try {
    const response = await apiClient.get<CurrencyItem[]>(API_ENDPOINTS.Currencies);
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
    console.warn("getAllCurrencies API error:", error);
    return [];
  }
};

export const createCurrency = async (payload: CurrencyCreatePayload): Promise<CurrencyItem> => {
  const response = await apiClient.post<CurrencyItem>(API_ENDPOINTS.Currencies, payload);
  return response.data;
};

export const updateCurrency = async (id: number, payload: CurrencyUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Currencies}/${id}`, payload);
};

export const deleteCurrency = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Currencies}/${id}`);
};