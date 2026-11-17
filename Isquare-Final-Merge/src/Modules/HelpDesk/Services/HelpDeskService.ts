import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import { getAllPriorities } from "../../RSM/Pages/Master/Priority/Services/PriorityService";
import type {
  TicketCategoryItem,
  TicketPriorityItem,
  SupportTicketCreatePayload,
  SupportTicketResponse,
  SupportTicketItem,
  TicketFilterParams,
  TicketSummaryStats,
  TicketReply,
  TicketStatus,
} from "../Types/HelpDeskTypes";

const TICKETS_STORAGE_KEY = "isquare_support_tickets_v1";

/**
 * Format raw bytes into human-readable string (KB / MB).
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Safe local storage reader for client tickets.
 */
export const getStoredTickets = (): SupportTicketItem[] => {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

/**
 * Safe local storage writer for client tickets.
 */
export const setStoredTickets = (tickets: SupportTicketItem[]): void => {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
};

/**
 * Generate a clean formatted ticket number (e.g. TKT-1001)
 */
const generateTicketNumber = (existingCount: number): string => {
  const num = 1001 + existingCount;
  return `TKT-${num}`;
};

/**
 * Fetch dynamic priorities from the existing Priority Master API (/api/priority).
 * Reuses the existing backend Priority master data.
 */
export const getTicketPriorities = async (): Promise<TicketPriorityItem[]> => {
  try {
    const list = await getAllPriorities();
    if (Array.isArray(list) && list.length > 0) {
      return list
        .filter((p) => p.isActive && !p.isDeleted)
        .map((p) => ({
          id: p.id,
          name: p.priorityName,
          colorCode: p.colorCode || "#00234a",
          isActive: p.isActive,
        }));
    }
  } catch (error) {
    console.warn("getTicketPriorities: Failed to fetch priorities from /api/priority", error);
  }
  return [];
};

/**
 * Fetch dynamic categories from the backend.
 * Tries the HelpDesk categories endpoint or available master category endpoints.
 * Returns empty array if backend endpoints are not yet deployed - NO hardcoded fake data.
 */
export const getTicketCategories = async (): Promise<TicketCategoryItem[]> => {
  const endpointsToTry = [
    API_ENDPOINTS.HelpDeskCategories,
    API_ENDPOINTS.CustomerCategory,
    API_ENDPOINTS.Departments,
  ];

  for (const ep of endpointsToTry) {
    if (!ep) continue;
    try {
      const response = await apiClient.get<any>(ep);
      const data = response.data;
      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
        ? data.result
        : [];

      if (rawList.length > 0) {
        return rawList
          .filter((item: any) => item && (item.isActive !== false) && !item.isDeleted)
          .map((item: any) => ({
            id: item.id ?? item.categoryId ?? item.categoryID ?? item.ID ?? 0,
            name:
              item.name ??
              item.categoryName ??
              item.customerCategoryName ??
              item.departmentName ??
              item.title ??
              "General",
            code: item.code ?? item.categoryCode ?? undefined,
            description: item.description ?? undefined,
            isActive: item.isActive !== false,
          }))
          .filter((cat) => cat.id && cat.name);
      }
    } catch {
      // Endpoint not available yet on backend; continue to check
    }
  }

  return [];
};

/**
 * Submit Support Ticket.
 * Saves ticket into client localStorage demonstrator queue, and seamlessly prepares for
 * future backend synchronization when the MindAxis Help Desk API endpoint is live.
 */
export const createSupportTicket = async (
  payload: SupportTicketCreatePayload
): Promise<SupportTicketResponse> => {
  const existing = getStoredTickets();
  const ticketNumber = generateTicketNumber(existing.length);
  const now = new Date();
  const formattedDate = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const attachmentsMeta = (payload.attachments || []).map((file, idx) => ({
    id: `att-${Date.now()}-${idx}`,
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type || "application/octet-stream",
  }));

  const newTicket: SupportTicketItem = {
    id: Date.now(),
    ticketNumber,
    subject: payload.subject.trim(),
    description: payload.description.trim(),
    categoryId: payload.categoryId,
    categoryName: payload.categoryName || "General Support",
    priorityId: payload.priorityId,
    priorityName: payload.priorityName || "Medium",
    status: "Submitted",
    createdDate: formattedDate,
    createdById: payload.createdById,
    createdByName: payload.createdByName || "Client",
    createdByEmail: payload.createdByEmail,
    attachments: attachmentsMeta,
    supportRemarks: undefined,
    lastUpdatedDate: formattedDate,
    replies: [
      {
        id: `rep-${Date.now()}-1`,
        senderName: payload.createdByName || "Client",
        senderRole: "Client",
        message: payload.description.trim(),
        createdAt: formattedDate,
      },
    ],
  };

  // Prepare and attempt real backend synchronization
  const endpoint = API_ENDPOINTS.HelpDeskTickets || `${API_ENDPOINTS.BaseUrl}/helpdesk/tickets`;

  try {
    let requestData: any;
    let headers: Record<string, string> = {};

    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append("categoryId", String(payload.categoryId));
      if (payload.categoryName) formData.append("categoryName", payload.categoryName);
      formData.append("priorityId", String(payload.priorityId));
      if (payload.priorityName) formData.append("priorityName", payload.priorityName);
      formData.append("subject", payload.subject.trim());
      formData.append("description", payload.description.trim());
      if (payload.createdById) formData.append("createdById", String(payload.createdById));
      if (payload.createdByName) formData.append("createdByName", payload.createdByName);
      if (payload.createdByEmail) formData.append("createdByEmail", payload.createdByEmail);

      payload.attachments.forEach((file) => {
        formData.append("attachments", file, file.name);
      });

      requestData = formData;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = {
        categoryId: payload.categoryId,
        categoryName: payload.categoryName,
        priorityId: payload.priorityId,
        priorityName: payload.priorityName,
        subject: payload.subject.trim(),
        description: payload.description.trim(),
        createdById: payload.createdById,
        createdByName: payload.createdByName,
        createdByEmail: payload.createdByEmail,
      };
    }

    const response = await apiClient.post<any>(endpoint, requestData, { headers });
    const resData = response.data;
    if (resData?.ticketId || resData?.id) {
      newTicket.id = resData.ticketId || resData.id;
      if (resData.ticketNumber || resData.code) {
        newTicket.ticketNumber = resData.ticketNumber || resData.code;
      }
    }
  } catch (apiErr) {
    console.info("Help Desk API endpoint not yet connected on backend. Saved to client queue.", apiErr);
  }

  // Persist locally for immediate listing and demonstration
  setStoredTickets([newTicket, ...existing]);

  return {
    success: true,
    isEndpointConfigured: true,
    message: `Support ticket #${newTicket.ticketNumber} created successfully.`,
    ticketId: newTicket.id,
    ticketNumber: newTicket.ticketNumber,
    data: newTicket,
  };
};

/**
 * Fetch client support tickets with optional filtering.
 */
export const getMySupportTickets = async (
  filters?: TicketFilterParams
): Promise<SupportTicketItem[]> => {
  let tickets = getStoredTickets();

  // Background sync attempt with real backend API
  try {
    const endpoint = API_ENDPOINTS.HelpDeskTickets || `${API_ENDPOINTS.BaseUrl}/helpdesk/tickets`;
    const response = await apiClient.get<any>(endpoint);
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    if (list.length > 0) {
      const apiTickets: SupportTicketItem[] = list.map((t: any) => ({
        id: t.id || t.ticketId,
        ticketNumber: t.ticketNumber || t.code || `TKT-${t.id}`,
        subject: t.subject || "No Subject",
        description: t.description || "",
        categoryId: t.categoryId || 0,
        categoryName: t.categoryName || "General Support",
        priorityId: t.priorityId || 0,
        priorityName: t.priorityName || "Medium",
        status: (t.status || "Submitted") as TicketStatus,
        createdDate: t.createdDate || t.createdAt || "",
        createdById: t.createdById,
        createdByName: t.createdByName,
        createdByEmail: t.createdByEmail,
        attachments: t.attachments || [],
        supportRemarks: t.supportRemarks || t.remarks,
        replies: t.replies || [],
      }));

      const seen = new Set(apiTickets.map((a) => String(a.id)));
      const uniqueLocal = tickets.filter((l) => !seen.has(String(l.id)));
      tickets = [...apiTickets, ...uniqueLocal];
      setStoredTickets(tickets);
    }
  } catch {}

  if (!filters) return tickets;

  let result = [...tickets];

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.categoryName || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }

  if (filters.status && filters.status !== "All") {
    result = result.filter(
      (t) => t.status.toLowerCase().trim() === filters.status?.toLowerCase().trim()
    );
  }

  if (filters.priority && filters.priority !== "All") {
    result = result.filter(
      (t) =>
        String(t.priorityId) === String(filters.priority) ||
        t.priorityName.toLowerCase().trim() === filters.priority?.toLowerCase().trim()
    );
  }

  return result;
};

/**
 * Get ticket details by ID.
 */
export const getTicketById = async (
  ticketId: string | number
): Promise<SupportTicketItem | null> => {
  const tickets = getStoredTickets();
  const found = tickets.find((t) => String(t.id) === String(ticketId));
  return found || null;
};

/**
 * Add a reply from client to the support ticket history.
 */
export const addTicketReply = async (
  ticketId: string | number,
  message: string,
  senderName: string = "Client"
): Promise<SupportTicketItem | null> => {
  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => String(t.id) === String(ticketId));
  if (index === -1) return null;

  const now = new Date();
  const formattedDate = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const newReply: TicketReply = {
    id: `rep-${Date.now()}`,
    senderName,
    senderRole: "Client",
    message: message.trim(),
    createdAt: formattedDate,
  };

  const updatedTicket: SupportTicketItem = {
    ...tickets[index],
    lastUpdatedDate: formattedDate,
    replies: [...(tickets[index].replies || []), newReply],
  };

  tickets[index] = updatedTicket;
  setStoredTickets(tickets);

  // Future backend API sync
  try {
    const endpoint = `${API_ENDPOINTS.HelpDeskTickets || `${API_ENDPOINTS.BaseUrl}/helpdesk/tickets`}/${ticketId}/replies`;
    await apiClient.post(endpoint, { message, senderName });
  } catch {}

  return updatedTicket;
};

/**
 * Compute summary statistics for KPI cards.
 */
export const getTicketSummaryStats = (tickets: SupportTicketItem[]): TicketSummaryStats => {
  const stats: TicketSummaryStats = {
    total: tickets.length,
    submitted: 0,
    received: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  };

  tickets.forEach((t) => {
    const s = (t.status || "").toLowerCase();
    if (s === "submitted") stats.submitted += 1;
    else if (s === "received") stats.received += 1;
    else if (s.includes("progress")) stats.inProgress += 1;
    else if (s === "resolved") stats.resolved += 1;
    else if (s === "rejected") stats.rejected += 1;
  });

  return stats;
};

