import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

// Fallback just in case ProductCategory isn't added to your API_ENDPOINTS yet
const ENDPOINT = (API_ENDPOINTS as any).ProductCategory || `${API_ENDPOINTS.BaseUrl}/ProductCategory`;

export interface ProductCategoryItem {
  productCategoryId: number;
  productCategoryCode: string;
  productCategoryName: string;
  productCategoryDescription?: string;
  productCategorySortOrder?: number;
  productCategoryIsActive: boolean;
  productCategoryIsDeleted?: boolean;
  productCategoryCreatedAt?: string;
  productCategoryUpdatedAt?: string;
}

export interface ProductCategoryCreatePayload {
  productCategoryCode: string;
  productCategoryName: string;
  productCategoryDescription?: string;
  productCategorySortOrder?: number;
  productCategoryIsActive: boolean;
}

export interface ProductCategoryUpdatePayload {
  productCategoryName: string;
  productCategoryDescription?: string;
  productCategorySortOrder?: number;
  productCategoryIsActive: boolean;
}

export const getAllProductCategories = async (): Promise<ProductCategoryItem[]> => {
  try {
    const response = await apiClient.get<ProductCategoryItem[]>(ENDPOINT);
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
    console.warn("getAllProductCategories API error:", error);
    return [];
  }
};

export const createProductCategory = async (payload: ProductCategoryCreatePayload): Promise<ProductCategoryItem> => {
  const response = await apiClient.post<ProductCategoryItem>(ENDPOINT, payload);
  return response.data;
};

export const updateProductCategory = async (id: number, payload: ProductCategoryUpdatePayload): Promise<void> => {
  await apiClient.put(`${ENDPOINT}/${id}`, payload);
};

export const deleteProductCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${ENDPOINT}/${id}`);
};