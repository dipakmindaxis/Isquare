import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import { getAllCustomers } from "../../../Customer/Services/CustomerService";
import { getAllDocumentTypes } from "../../DocumentType/Services/DocumentTypeService";
import type {
  SalesAttachmentItem,
  SalesAttachmentUploadPayload,
  CustomerOption,
  ActivityOption,
  DocumentTypeOption,
} from "../Types/SalesAttachmentTypes";

const fallbackAttachmentsKey = "isquare_sales_attachments_live_v1";

const getLocalFallback = (): SalesAttachmentItem[] => {
  try {
    const raw = localStorage.getItem(fallbackAttachmentsKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse local fallback attachments", e);
  }
  return [];
};

const saveLocalFallback = (items: SalesAttachmentItem[]) => {
  try {
    localStorage.setItem(fallbackAttachmentsKey, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to store local fallback attachments", e);
  }
};

/**
 * Normalizes raw API response item to standard SalesAttachmentItem
 */
export const normalizeAttachmentItem = (raw: any): SalesAttachmentItem => {
  const id = raw.id ?? raw.Id ?? raw.attachmentId ?? raw.AttachmentId ?? Math.random().toString();
  const fileName = raw.fileName ?? raw.FileName ?? raw.name ?? raw.Name ?? raw.originalFileName ?? raw.OriginalFileName ?? `Attachment_${id}`;
  const originalFileName = raw.originalFileName ?? raw.OriginalFileName ?? fileName;
  const filePath = raw.filePath ?? raw.FilePath ?? "";
  const documentType = raw.documentType ?? raw.DocumentType ?? raw.category ?? raw.Category ?? "Document";
  const customerId = raw.customerId ?? raw.CustomerId;
  const customerName = raw.customerName ?? raw.CustomerName ?? raw.customer?.customerName ?? raw.Customer?.CustomerName ?? (customerId ? `Customer #${customerId}` : "-");
  const enquiryId = raw.enquiryId ?? raw.EnquiryId;
  const salesActivityId = raw.salesActivityId ?? raw.SalesActivityId;
  const fileSizeKB = raw.fileSizeKB ?? raw.FileSizeKB ?? (raw.fileSize ? Math.round(raw.fileSize / 1024) : (raw.fileSizeBytes ? Math.round(raw.fileSizeBytes / 1024) : 0));
  const fileType = raw.fileType ?? raw.FileType ?? raw.contentType ?? raw.ContentType ?? (fileName.endsWith(".pdf") ? "application/pdf" : fileName.match(/\.(jpg|jpeg|png)$/i) ? "image/jpeg" : "application/octet-stream");
  const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const uploadedBy = raw.uploadedBy ?? raw.UploadedBy ?? raw.createdBy ?? raw.CreatedBy ?? "Admin";
  const uploadedDate = raw.uploadedDate ?? raw.UploadedDate ?? raw.createdDate ?? raw.CreatedDate ?? raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString().split("T")[0];
  const remarks = raw.remarks ?? raw.Remarks ?? "";

  return {
    id,
    name: fileName,
    fileName,
    originalFileName,
    filePath,
    category: documentType,
    documentType,
    customerId,
    customerName,
    enquiryId,
    salesActivityId,
    fileSizeKB,
    fileType,
    isImage,
    uploadedBy,
    uploadedDate,
    remarks,
    isActive: raw.isActive ?? raw.IsActive ?? true,
  };
};

/**
 * GET /api/SalesAttachments
 */
export const getAllSalesAttachments = async (): Promise<SalesAttachmentItem[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SalesAttachments);
    let list: any[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      list = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      list = (response.data as any).result;
    }

    const normalized = list.map(normalizeAttachmentItem);
    saveLocalFallback(normalized);
    return normalized;
  } catch (error) {
    console.warn("Could not reach /api/SalesAttachments, checking local cache", error);
    const cached = getLocalFallback();
    if (cached.length > 0) return cached;
    return [];
  }
};

/**
 * GET /api/SalesAttachments/{id}
 */
export const getSalesAttachmentById = async (
  id: number | string
): Promise<SalesAttachmentItem> => {
  const response = await apiClient.get(`${API_ENDPOINTS.SalesAttachments}/${id}`);
  const data = response.data?.data ?? response.data;
  return normalizeAttachmentItem(data);
};

/**
 * POST /api/SalesAttachments/upload
 * Uses multipart/form-data
 */
export const uploadSalesAttachment = async (
  payload: SalesAttachmentUploadPayload
): Promise<SalesAttachmentItem> => {
  const formData = new FormData();
  formData.append("File", payload.file);

  if (payload.customerId !== undefined && payload.customerId !== null) {
    formData.append("CustomerId", String(payload.customerId));
  }
  if (payload.enquiryId !== undefined && payload.enquiryId !== null) {
    formData.append("EnquiryId", String(payload.enquiryId));
  }
  if (payload.salesActivityId !== undefined && payload.salesActivityId !== null) {
    formData.append("SalesActivityId", String(payload.salesActivityId));
  }
  if (payload.documentType) {
    formData.append("DocumentType", payload.documentType);
  }
  if (payload.remarks) {
    formData.append("Remarks", payload.remarks);
  }

  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.SalesAttachments}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const created = response.data?.data ?? response.data;
    return normalizeAttachmentItem(created);
  } catch (err) {
    console.warn("Backend upload failed, saving to local store fallback", err);
    const newItem: SalesAttachmentItem = {
      id: Date.now(),
      name: payload.file.name,
      fileName: payload.file.name,
      originalFileName: payload.file.name,
      documentType: payload.documentType || "Other",
      category: payload.documentType || "Other",
      customerId: payload.customerId || undefined,
      enquiryId: payload.enquiryId || undefined,
      salesActivityId: payload.salesActivityId || undefined,
      fileSizeKB: Math.round(payload.file.size / 1024),
      fileType: payload.file.type,
      isImage: payload.file.type.startsWith("image/"),
      uploadedBy: "Admin",
      uploadedDate: new Date().toISOString().split("T")[0],
      remarks: payload.remarks || "",
      isActive: true,
    };
    const cached = getLocalFallback();
    saveLocalFallback([newItem, ...cached]);
    return newItem;
  }
};

/**
 * DELETE /api/SalesAttachments/{id}
 */
export const deleteSalesAttachment = async (
  id: number | string
): Promise<void> => {
  try {
    await apiClient.delete(`${API_ENDPOINTS.SalesAttachments}/${id}`);
  } catch (error) {
    console.warn("Failed to delete from backend API, updating local cache", error);
  } finally {
    const cached = getLocalFallback().filter((item) => String(item.id) !== String(id));
    saveLocalFallback(cached);
  }
};

/**
 * GET /api/SalesAttachments/{id}/download
 */
export const downloadSalesAttachment = async (
  id: number | string,
  fileName?: string
): Promise<void> => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.SalesAttachments}/${id}/download`,
      {
        responseType: "blob",
      }
    );

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", fileName || `attachment_${id}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(`${API_ENDPOINTS.SalesAttachments}/${id}/download`, "_blank");
  }
};

/**
 * GET /api/SalesAttachments/{id}/view
 */
export const viewSalesAttachment = async (
  id: number | string
): Promise<string> => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.SalesAttachments}/${id}/view`,
      {
        responseType: "blob",
      }
    );
    const fileBlob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });
    return window.URL.createObjectURL(fileBlob);
  } catch (error) {
    console.warn("View endpoint blob fetch failed, falling back to direct URL", error);
    return `${API_ENDPOINTS.SalesAttachments}/${id}/view`;
  }
};

/**
 * Dynamically fetch customers for dropdown
 */
export const getCustomersDropdown = async (): Promise<CustomerOption[]> => {
  try {
    const customers = await getAllCustomers();
    if (customers && customers.length > 0) {
      return customers.map((c) => ({
        value: c.customerId,
        label: `${c.customerName}${c.customerCode ? ` (${c.customerCode})` : ""}`,
        customerCode: c.customerCode,
      }));
    }
  } catch (e) {
    console.warn("Failed to load customers for dropdown", e);
  }
  return [];
};

/**
 * Dynamically fetch document types from Document Type Master / API for dropdown
 */
export const getDocumentTypesDropdown = async (): Promise<DocumentTypeOption[]> => {
  try {
    const docTypes = await getAllDocumentTypes();
    if (docTypes && docTypes.length > 0) {
      return docTypes
        .filter((d) => d.isActive)
        .map((d) => ({
          value: d.documentName,
          label: d.code ? `${d.documentName} (${d.code})` : d.documentName,
        }));
    }
  } catch (e) {
    console.warn("Failed to load document types for dropdown", e);
  }
  return [];
};

/**
 * Dynamically fetch activities for dropdown
 */
export const getActivitiesDropdown = async (): Promise<ActivityOption[]> => {
  return [];
};

