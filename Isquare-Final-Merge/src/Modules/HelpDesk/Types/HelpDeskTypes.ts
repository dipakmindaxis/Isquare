export type TicketStatus =
  | "Submitted"
  | "Received"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export interface TicketReply {
  id: string;
  senderName: string;
  senderRole: "Client" | "MindAxis Support";
  senderAvatar?: string;
  message: string;
  createdAt: string;
}

export interface StoredAttachment {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  url?: string;
}

export interface SupportTicketItem {
  id: string | number;
  ticketNumber: string;
  subject: string;
  description: string;
  categoryId: string | number;
  categoryName: string;
  priorityId: string | number;
  priorityName: string;
  priorityColor?: string;
  status: TicketStatus;
  createdDate: string;
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
  attachments?: StoredAttachment[];
  supportRemarks?: string;
  assignedTo?: string;
  lastUpdatedDate?: string;
  replies?: TicketReply[];
}

export interface TicketCategoryItem {
  id: number | string;
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface TicketPriorityItem {
  id: number | string;
  name: string;
  colorCode?: string;
  isActive?: boolean;
}

export interface TicketAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}

export interface SupportTicketCreatePayload {
  categoryId: number | string;
  categoryName?: string;
  priorityId: number | string;
  priorityName?: string;
  subject: string;
  description: string;
  attachments?: File[];
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
}

export interface SupportTicketResponse {
  success: boolean;
  isEndpointConfigured: boolean;
  message: string;
  ticketId?: number | string;
  ticketNumber?: string;
  data?: any;
}

export interface TicketFormValidationErrors {
  category?: string;
  priority?: string;
  subject?: string;
  description?: string;
  attachments?: string;
}

export interface TicketFilterParams {
  search?: string;
  status?: string;
  priority?: string;
}

export interface TicketSummaryStats {
  total: number;
  submitted: number;
  received: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}
