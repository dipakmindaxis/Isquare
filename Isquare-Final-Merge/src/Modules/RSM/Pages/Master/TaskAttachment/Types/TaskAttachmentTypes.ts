export interface TaskAttachment {
  attachmentId: number;
  taskId: number;
  documentName: string;
  fileName?: string;
  filePath?: string;
  fileExtension?: string;
  fileSize?: number;
  uploadedBy?: number;
  uploadedByName?: string;
  uploadedDate?: string;
  isActive: boolean;
  isDeleted: boolean;
  taskTitle?: string;
}

export interface CreateTaskAttachmentPayload {
  taskId: number;
  documentName: string;
  file: File;
  uploadedBy?: number;
  isActive?: boolean;
}
