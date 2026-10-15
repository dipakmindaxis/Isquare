import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface DocumentType {
  id: number;
  documentName: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DocumentTypeCreatePayload {
  id?: number;
  documentName: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DocumentTypeUpdatePayload {
  id?: number;
  documentName: string;
  code: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export const normalizeDocumentType = (raw: any): DocumentType => {
  const id = Number(raw.id ?? raw.Id ?? 0);
  const documentName = String(raw.documentName ?? raw.DocumentName ?? raw.name ?? raw.Name ?? "");
  const code = String(raw.code ?? raw.Code ?? `DOC_${String(id).padStart(3, "0")}`);
  const isActive =
    raw.isActive !== undefined
      ? Boolean(raw.isActive)
      : raw.IsActive !== undefined
      ? Boolean(raw.IsActive)
      : true;
  const isDeleted = Boolean(raw.isDeleted ?? raw.IsDeleted ?? false);

  return { id, documentName, code, isActive, isDeleted };
};

/**
 * GET /api/documenttype
 */
export const getAllDocumentTypes = async (): Promise<DocumentType[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DocumentType);
    let rawList: any[] = [];
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      rawList = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      rawList = (response.data as any).result;
    }

    const normalized = rawList.map(normalizeDocumentType).filter((d) => !d.isDeleted);
    return normalized;
  } catch (error) {
    console.warn("getAllDocumentTypes: API call failed", error);
    return [];
  }
};

/**
 * GET /api/documenttype/{id}
 */
export const getDocumentTypeById = async (id: number): Promise<DocumentType> => {
  const response = await apiClient.get(`${API_ENDPOINTS.DocumentType}/${id}`);
  const data = response.data?.data ?? response.data;
  return normalizeDocumentType(data);
};

/**
 * POST /api/documenttype
 */
export const createDocumentType = async (
  payload: DocumentTypeCreatePayload
): Promise<DocumentType> => {
  const requestBody = {
    id: 0,
    documentName: payload.documentName.trim(),
    code: payload.code.trim(),
    isActive: payload.isActive,
    isDeleted: false,
  };

  const response = await apiClient.post(API_ENDPOINTS.DocumentType, requestBody);
  const data = response.data?.data ?? response.data;
  return normalizeDocumentType(data);
};

/**
 * PUT /api/documenttype/{id}
 */
export const updateDocumentType = async (
  id: number,
  payload: DocumentTypeUpdatePayload
): Promise<void> => {
  const requestBody = {
    id,
    documentName: payload.documentName.trim(),
    code: payload.code.trim(),
    isActive: payload.isActive,
    isDeleted: false,
  };

  await apiClient.put(`${API_ENDPOINTS.DocumentType}/${id}`, requestBody);
};

/**
 * DELETE /api/documenttype/{id}
 */
export const deleteDocumentType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.DocumentType}/${id}`);
};
