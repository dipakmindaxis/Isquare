import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type {
  Director,
  DirectorCreatePayload,
  DirectorUpdatePayload,
} from "../Types/DirectorTypes";

export const getAllDirectors = async (): Promise<Director[]> => {
  const response = await apiClient.get<Director[]>(API_ENDPOINTS.Director);
  return response.data;
};

export const getDirectorById = async (id: number): Promise<Director> => {
  const response = await apiClient.get<Director>(`${API_ENDPOINTS.Director}/${id}`);
  return response.data;
};

export const createDirector = async (
  payload: DirectorCreatePayload
): Promise<Director> => {
  const response = await apiClient.post<Director>(API_ENDPOINTS.Director, payload);
  return response.data;
};

export const updateDirector = async (
  id: number,
  payload: DirectorUpdatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Director}/${id}`, payload);
};

export const deleteDirector = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Director}/${id}`);
};
