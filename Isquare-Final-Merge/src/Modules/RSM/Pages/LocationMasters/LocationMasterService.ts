import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

export interface CountryRecord {
  countryId: number;
  countryName: string;
  countryCode?: string | null;
  isoCode?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  createdDate?: string;
  updatedBy?: string | null;
  updatedDate?: string | null;
}

export interface StateRecord {
  stateId: number;
  countryId: number;
  stateName: string;
  stateCode?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  createdDate?: string;
  updatedBy?: string | null;
  updatedDate?: string | null;
}

export interface CityRecord {
  cityId: number;
  stateId: number;
  cityName: string;
  isActive: boolean;
  createdBy?: string | null;
  createdDate?: string;
  updatedBy?: string | null;
  updatedDate?: string | null;
}

export type CountryPayload = Pick<
  CountryRecord,
  "countryName" | "countryCode" | "isoCode" | "isActive"
>;
export type StatePayload = Pick<
  StateRecord,
  "countryId" | "stateName" | "stateCode" | "isActive"
>;
export type CityPayload = Pick<CityRecord, "stateId" | "cityName" | "isActive">;

const apiPath = (path: string): string => `${API_ENDPOINTS.BaseUrl}/${path}`;

const unwrapList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;
    for (const key of ["data", "result", "items", "records"]) {
      if (Array.isArray(result[key])) return result[key] as T[];
    }
  }
  throw new Error("The API returned an unexpected list response.");
};

const unwrapRecord = <T>(data: unknown): T => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    for (const key of ["data", "result"]) {
      const nested = result[key];
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        return nested as T;
      }
    }
    return data as T;
  }
  throw new Error("The API returned an unexpected record response.");
};

export const getCountries = async (): Promise<CountryRecord[]> => {
  const response = await apiClient.get<unknown>(apiPath("country"));
  return unwrapList<CountryRecord>(response.data);
};

export const getCountryById = async (id: number): Promise<CountryRecord> => {
  const response = await apiClient.get<unknown>(apiPath(`country/${id}`));
  return unwrapRecord<CountryRecord>(response.data);
};

export const createCountry = async (
  payload: CountryPayload,
): Promise<void> => {
  await apiClient.post(apiPath("country"), payload);
};

export const updateCountry = async (
  id: number,
  payload: CountryPayload,
): Promise<void> => {
  await apiClient.put(apiPath(`country/${id}`), { countryId: id, ...payload });
};

export const deleteCountry = async (id: number): Promise<void> => {
  await apiClient.delete(apiPath(`country/${id}`));
};

export const getStates = async (): Promise<StateRecord[]> => {
  const response = await apiClient.get<unknown>(apiPath("state"));
  return unwrapList<StateRecord>(response.data);
};

export const getStatesByCountry = async (
  countryId: number,
): Promise<StateRecord[]> => {
  const response = await apiClient.get<unknown>(
    apiPath(`state/country/${countryId}`),
  );
  return unwrapList<StateRecord>(response.data);
};

export const getStateById = async (id: number): Promise<StateRecord> => {
  const response = await apiClient.get<unknown>(apiPath(`state/${id}`));
  return unwrapRecord<StateRecord>(response.data);
};

export const createState = async (payload: StatePayload): Promise<void> => {
  await apiClient.post(apiPath("state"), payload);
};

export const updateState = async (
  id: number,
  payload: StatePayload,
): Promise<void> => {
  await apiClient.put(apiPath(`state/${id}`), { stateId: id, ...payload });
};

export const deleteState = async (id: number): Promise<void> => {
  await apiClient.delete(apiPath(`state/${id}`));
};

export const getCities = async (): Promise<CityRecord[]> => {
  const response = await apiClient.get<unknown>(apiPath("city"));
  return unwrapList<CityRecord>(response.data);
};

export const getCitiesByState = async (
  stateId: number,
): Promise<CityRecord[]> => {
  const response = await apiClient.get<unknown>(
    apiPath(`city/state/${stateId}`),
  );
  return unwrapList<CityRecord>(response.data);
};

export const getCityById = async (id: number): Promise<CityRecord> => {
  const response = await apiClient.get<unknown>(apiPath(`city/${id}`));
  return unwrapRecord<CityRecord>(response.data);
};

export const createCity = async (payload: CityPayload): Promise<void> => {
  await apiClient.post(apiPath("city"), payload);
};

export const updateCity = async (
  id: number,
  payload: CityPayload,
): Promise<void> => {
  await apiClient.put(apiPath(`city/${id}`), { cityId: id, ...payload });
};

export const deleteCity = async (id: number): Promise<void> => {
  await apiClient.delete(apiPath(`city/${id}`));
};
