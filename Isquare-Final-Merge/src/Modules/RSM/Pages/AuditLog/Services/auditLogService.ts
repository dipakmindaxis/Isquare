import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface AuditLogItem {
  auditLogId: number;
  companyId: number;
  tableName: string;
  entityName?: string;
  recordId: number;
  action: "CREATE" | "UPDATE" | "DELETE" | string;
  description?: string;
  oldValue?: string | null;
  newValue?: string | null;
  userId: number;
  employeeName?: string;
  createdByEmployeeName?: string;
  previousActionByEmployeeName?: string;
  auditDate: string;
  isDeleted?: boolean;
}

export interface AuditLogSummary {
  totalActivities: number;
  createActivities: number;
  updateActivities: number;
  deleteActivities: number;
}

export interface AuditLogFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tableName?: string;
  action?: string;
  userId?: number | string;
  recordId?: number | string;
  fromDate?: string;
  toDate?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAuditLogResult {
  items: AuditLogItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Cleanly constructs URL search parameters, ignoring empty, null, or undefined values.
 */
const buildCleanParams = (params: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};

  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined || val === null || val === "") return;

    if (key === "userId" || key === "recordId") {
      const num = Number(val);
      if (!isNaN(num) && num >= 0) {
        clean[key] = num;
      }
      return;
    }

    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed) clean[key] = trimmed;
      return;
    }

    clean[key] = val;
  });

  return clean;
};

/**
 * Fetch paginated audit logs with search, filter, and sort options.
 */
export const getAuditLogs = async (
  params: AuditLogFilterParams
): Promise<PaginatedAuditLogResult> => {
  const queryParams = buildCleanParams({
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    search: params.search,
    tableName: params.tableName,
    action: params.action && params.action !== "ALL" ? params.action : undefined,
    userId: params.userId,
    recordId: params.recordId,
    fromDate: params.fromDate,
    toDate: params.toDate,
    sortField: params.sortField || "auditDate",
    sortOrder: params.sortOrder || "desc",
  });

  const response = await apiClient.get<PaginatedAuditLogResult>(
    API_ENDPOINTS.AuditLog,
    { params: queryParams }
  );

  return response.data;
};

/**
 * Fetch audit log activity summary counts (Total, Create, Update, Delete).
 * Supports contextual filtering matching active dashboard filters.
 */
export const getAuditLogSummary = async (
  filterParams?: Omit<AuditLogFilterParams, "page" | "pageSize" | "sortField" | "sortOrder">
): Promise<AuditLogSummary> => {
  const queryParams = filterParams
    ? buildCleanParams({
        search: filterParams.search,
        tableName: filterParams.tableName,
        action: filterParams.action && filterParams.action !== "ALL" ? filterParams.action : undefined,
        userId: filterParams.userId,
        recordId: filterParams.recordId,
        fromDate: filterParams.fromDate,
        toDate: filterParams.toDate,
      })
    : {};

  const response = await apiClient.get<AuditLogSummary>(
    API_ENDPOINTS.AuditLogSummary,
    { params: queryParams }
  );

  return response.data;
};

/**
 * Fetch single audit log record details by ID.
 */
export const getAuditLogById = async (id: number): Promise<AuditLogItem> => {
  const response = await apiClient.get<AuditLogItem>(
    `${API_ENDPOINTS.AuditLog}/${id}`
  );
  return response.data;
};
