import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  SalesCoordinator,
  SalesCoordinatorCreatePayload,
  SalesCoordinatorUpdatePayload,
} from "../Types/SalesCoordinatorTypes";

const SALES_COORDINATOR_URL =
  API_ENDPOINTS.SalesCoordinator || `${API_ENDPOINTS.BaseUrl}/sales-coordinator`;

type ApiDataResponse<T> =
  | T[]
  | { data?: T[]; result?: T[]; items?: T[] }
  | null
  | void;

const ensureArray = <T>(data: ApiDataResponse<T>): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

interface RawSalesCoordinator {
  salesCoordinatorId?: number;
  SalesCoordinatorId?: number;
  id?: number;
  Id?: number;
  salesCoordinatorName?: string;
  SalesCoordinatorName?: string;
  name?: string;
  Name?: string;
  coordinatorName?: string;
  salesCoordinatorCode?: string;
  SalesCoordinatorCode?: string;
  code?: string;
  Code?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

const normalizeSalesCoordinator = (
  item: RawSalesCoordinator
): SalesCoordinator => ({
  salesCoordinatorId:
    item.salesCoordinatorId ||
    item.SalesCoordinatorId ||
    item.id ||
    item.Id ||
    0,
  salesCoordinatorName:
    item.salesCoordinatorName ||
    item.SalesCoordinatorName ||
    item.name ||
    item.Name ||
    item.coordinatorName ||
    "",
  salesCoordinatorCode:
    item.salesCoordinatorCode ||
    item.SalesCoordinatorCode ||
    item.code ||
    item.Code ||
    "",
  isActive: item.isActive !== false && item.IsActive !== false,
  isDeleted: item.isDeleted || item.IsDeleted || false,
});

export const getAllSalesCoordinators = async (): Promise<SalesCoordinator[]> => {
  const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(
    SALES_COORDINATOR_URL
  );
  const list = ensureArray<RawSalesCoordinator>(response.data);
  return list.map(normalizeSalesCoordinator);
};

export const getActiveSalesCoordinators = async (): Promise<SalesCoordinator[]> => {
  const response = await apiClient.get<ApiDataResponse<RawSalesCoordinator>>(
    `${SALES_COORDINATOR_URL}/active`
  );
  const list = ensureArray<RawSalesCoordinator>(response.data);
  return list.map(normalizeSalesCoordinator);
};

export const getSalesCoordinatorById = async (
  id: number
): Promise<SalesCoordinator> => {
  const response = await apiClient.get<RawSalesCoordinator>(
    `${SALES_COORDINATOR_URL}/${id}`
  );
  return normalizeSalesCoordinator(response.data);
};

export const createSalesCoordinator = async (
  payload: SalesCoordinatorCreatePayload
): Promise<SalesCoordinator> => {
  const response = await apiClient.post<RawSalesCoordinator>(
    SALES_COORDINATOR_URL,
    payload
  );
  return normalizeSalesCoordinator(response.data);
};

export const updateSalesCoordinator = async (
  id: number,
  payload: SalesCoordinatorUpdatePayload
): Promise<void> => {
  await apiClient.put(`${SALES_COORDINATOR_URL}/${id}`, payload);
};

export const deleteSalesCoordinator = async (id: number): Promise<void> => {
  await apiClient.delete(`${SALES_COORDINATOR_URL}/${id}`);
};
