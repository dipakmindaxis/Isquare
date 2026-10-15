export interface SalesAttachmentItem {
  id: number | string;
  name: string;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  category?: string;
  documentType?: string;
  customerId?: number | string;
  customerName?: string;
  enquiryId?: number | string;
  salesActivityId?: number | string;
  relatedActivityCode?: string;
  fileSizeKB?: number;
  fileSizeBytes?: number;
  fileType?: string;
  contentType?: string;
  isImage?: boolean;
  uploadedBy?: string;
  uploadedDate?: string;
  createdDate?: string;
  createdAt?: string;
  remarks?: string;
  isActive?: boolean;
}

export interface SalesAttachmentUploadPayload {
  file: File;
  customerId?: number | string | null;
  enquiryId?: number | string | null;
  salesActivityId?: number | string | null;
  documentType?: string;
  remarks?: string;
}

export interface CustomerOption {
  value: number;
  label: string;
  customerCode?: string;
  phone?: string;
  email?: string;
  city?: string;
}

export interface ActivityOption {
  value: number;
  label: string;
  activityCode?: string;
  activityType?: string;
  customerName?: string;
}

export interface DocumentTypeOption {
  value: string;
  label: string;
}
