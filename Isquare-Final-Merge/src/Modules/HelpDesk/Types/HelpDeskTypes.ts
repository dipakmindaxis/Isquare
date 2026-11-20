export type TicketStatus =
  | "Open"
  | "Submitted"
  | "Received"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Rejected";

export interface ExternalAttachment {
  id?: string | number;
  attachmentId?: string | number;
  originalFileName?: string;
  fileName?: string;
  name?: string;
  fileSize?: number;
  size?: number;
  formattedSize?: string;
  contentType?: string;
  type?: string;
  url?: string;
}

export interface ExternalTicketReply {
  id?: string | number;
  senderName: string;
  senderRole?: "Client" | "Support" | "Employee" | string;
  message: string;
  createdAt?: string;
  createdDate?: string;
  isCustomerReply?: boolean;
  attachments?: ExternalAttachment[];
}

export interface ExternalTicketListItem {
  ticketNumber: string;
  subject: string;
  priority: string;
  status: string;
  createdDate: string;
  replyCount: number;
  attachmentCount: number;
  companyCode?: string;
  companyName?: string;
  softwareCode?: string;
  softwareName?: string;
  externalCustomerId?: string;
  customerName?: string;
}

export interface ExternalTicketsResponse {
  items: ExternalTicketListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExternalTicketDetail {
  ticketNumber: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  companyCode?: string;
  companyName?: string;
  softwareCode?: string;
  softwareName?: string;
  externalCustomerId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  createdDate: string;
  createdAt?: string;
  replyCount?: number;
  attachmentCount?: number;
  replies: ExternalTicketReply[];
  attachments: ExternalAttachment[];
  categoryId?: number | string;
  categoryName?: string;
}

export interface CreateSupportTicketInput {
  subject: string;
  description: string;
  priority?: "Low" | "Medium" | "High" | "Critical" | string;
  categoryId?: number | string;
  attachments?: File[];
  companyCode?: string;
  softwareCode?: string;
  externalCustomerId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
}

export interface CreateTicketResponse {
  ticketNumber: string;
  companyCode?: string;
  companyName?: string;
  softwareCode?: string;
  softwareName?: string;
  externalCustomerId?: string;
  customerName?: string;
  subject?: string;
  priority?: string;
  status?: string;
  replyCount?: number;
  attachmentCount?: number;
  message?: string;
  isOptimistic?: boolean;
}

export interface TicketSummaryStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  // compatibility
  submitted?: number;
  received?: number;
  rejected?: number;
}

export interface TicketFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
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

export interface TicketFormValidationErrors {
  category?: string;
  priority?: string;
  subject?: string;
  description?: string;
  attachments?: string;
}

// Backward compatibility
export type SupportTicketItem = ExternalTicketListItem & {
  id?: string | number;
  description?: string;
  categoryId?: string | number;
  categoryName?: string;
  priorityId?: string | number;
  priorityName?: string;
  priorityColor?: string;
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
  attachments?: any[];
  supportRemarks?: string;
  assignedTo?: string;
  lastUpdatedDate?: string;
  replies?: any[];
};

export type SupportTicketCreatePayload = CreateSupportTicketInput & {
  categoryName?: string;
  priorityId?: number | string;
  priorityName?: string;
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
};

export interface SupportTicketResponse {
  success: boolean;
  isEndpointConfigured: boolean;
  message: string;
  ticketId?: number | string;
  ticketNumber?: string;
  data?: any;
}
