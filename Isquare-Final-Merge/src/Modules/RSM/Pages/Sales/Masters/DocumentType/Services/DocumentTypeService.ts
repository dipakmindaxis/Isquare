import apiClient from "../../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../../API/apiConfig";

export interface DocumentType {
  id: number;
  documentName: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DocumentTypeCreatePayload {
  documentName: string;
  code: string;
  isActive: boolean;
}

export interface DocumentTypeUpdatePayload {
  id?: number;
  documentName: string;
  code: string;
  isActive: boolean;
}

export const getAllDocumentTypes = async (): Promise<DocumentType[]> => {
  const response = await apiClient.get<DocumentType[]>(API_ENDPOINTS.DocumentType);
  return response.data;
};

export const getDocumentTypeById = async (id: number): Promise<DocumentType> => {
  const response = await apiClient.get<DocumentType>(`${API_ENDPOINTS.DocumentType}/${id}`);
  return response.data;
};

export const createDocumentType = async (payload: DocumentTypeCreatePayload): Promise<DocumentType> => {
  const response = await apiClient.post<DocumentType>(API_ENDPOINTS.DocumentType, payload);
  return response.data;
};

export const updateDocumentType = async (id: number, payload: DocumentTypeUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.DocumentType}/${id}`, payload);
};

export const deleteDocumentType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.DocumentType}/${id}`);
};
