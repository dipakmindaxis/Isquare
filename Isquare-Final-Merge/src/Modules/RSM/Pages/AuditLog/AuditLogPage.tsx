import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  getAuditLogs,
  getAuditLogSummary,
  getAuditLogById,
  type AuditLogItem,
  type AuditLogSummary as SummaryData,
  type AuditLogFilterParams,
} from "./Services/auditLogService";
import { AuditLogSummary } from "./Components/AuditLogSummary";
import { AuditLogFilters } from "./Components/AuditLogFilters";
import { AuditLogTable } from "./Components/AuditLogTable";
import { AuditLogDetailsModal } from "./Components/AuditLogDetailsModal";

export const AuditLogPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = useMemo(() => {
    const roleNormalized = (user?.role || "").trim().toLowerCase();
    return (
      roleNormalized === "admin" ||
      roleNormalized === "administrator" ||
      roleNormalized === "superadmin" ||
      roleNormalized.includes("system admin")
    );
  }, [user?.role]);

  // Query / Filter state
  const [filters, setFilters] = useState<AuditLogFilterParams>({
    page: 1,
    pageSize: 10,
    sortField: "auditDate",
    sortOrder: "desc",
  });

  // Data states
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Loading & error states
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal state
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  /**
   * Fetch paginated audit log activities.
   */
  const fetchLogs = useCallback(async (currentFilters: AuditLogFilterParams) => {
    setIsLoadingLogs(true);
    setError(null);
    try {
      const result = await getAuditLogs(currentFilters);
      setLogs(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load audit activities. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  /**
   * Fetch audit log summary cards count with current filters applied.
   */
  const fetchSummary = useCallback(async (currentFilters: AuditLogFilterParams) => {
    setIsLoadingSummary(true);
    try {
      const summaryData = await getAuditLogSummary({
        search: currentFilters.search,
        tableName: currentFilters.tableName,
        action: currentFilters.action,
        userId: currentFilters.userId,
        recordId: currentFilters.recordId,
        fromDate: currentFilters.fromDate,
        toDate: currentFilters.toDate,
      });
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching audit log summary:", err);
      // Fallback empty summary
      setSummary({
        totalActivities: 0,
        createActivities: 0,
        updateActivities: 0,
        deleteActivities: 0,
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Fetch data whenever filters change
  useEffect(() => {
    fetchLogs(filters);
    fetchSummary(filters);
  }, [filters, fetchLogs, fetchSummary]);

  /**
   * Handler to apply new filters from the filter bar.
   */
  const handleApplyFilters = (newFilters: Partial<AuditLogFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page
    }));
  };

  /**
   * Handler to reset all filters.
   */
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      sortField: "auditDate",
      sortOrder: "desc",
      search: undefined,
      tableName: undefined,
      action: undefined,
      userId: undefined,
      recordId: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  };

  /**
   * Sorting handler.
   */
  const handleSortChange = (field: string) => {
    setFilters((prev) => {
      const isSameField = prev.sortField?.toLowerCase() === field.toLowerCase();
      const nextOrder = isSameField && prev.sortOrder === "asc" ? "desc" : "asc";
      return {
        ...prev,
        sortField: field,
        sortOrder: nextOrder,
        page: 1,
      };
    });
  };

  /**
   * Pagination handlers.
   */
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1,
    }));
  };

  /**
   * View details click handler: opens modal and fetches full details by ID.
   */
  const handleViewDetails = async (item: AuditLogItem) => {
    setSelectedAuditLog(item);
    setIsModalOpen(true);
    setIsLoadingDetail(true);

    try {
      const detailedLog = await getAuditLogById(item.auditLogId);
      if (detailedLog) {
        setSelectedAuditLog(detailedLog);
      }
    } catch (err) {
      console.error("Failed to fetch detailed audit log:", err);
      // Fallback to already populated table item
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleManualRefresh = () => {
    toast.info("Refreshing audit activities...");
    fetchLogs(filters);
    fetchSummary(filters);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/rsm" replace />;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card matching CustomerMaster */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <History className="w-6 h-6 text-[#FF7900]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#00234a]">
                Audit Log
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">
                Track and monitor all activities performed in the CRM system.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isLoadingLogs || isLoadingSummary}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              title="Refresh logs and summary"
            >
              <RefreshCw
                size={15}
                className={isLoadingLogs || isLoadingSummary ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Listing Section */}
      <div className="space-y-6">
        {/* Listing Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
              Activities
            </h2>
          </div>
        </div>

        {/* Analytics / Stats Bar */}
        <AuditLogSummary
          summary={summary}
          isLoading={isLoadingSummary}
        />

        {/* Filter & Search Bar */}
        <AuditLogFilters
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          isLoading={isLoadingLogs}
        />

        {/* Activity Table Section */}
        <AuditLogTable
          logs={logs}
          isLoading={isLoadingLogs}
          error={error}
          onRetry={() => fetchLogs(filters)}
          page={filters.page || 1}
          pageSize={filters.pageSize || 10}
          totalCount={totalCount}
          totalPages={totalPages}
          sortField={filters.sortField}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Activity Detail Modal */}
      {isModalOpen && (
        <AuditLogDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAuditLog(null);
          }}
          auditLog={selectedAuditLog}
          isLoading={isLoadingDetail}
        />
      )}
    </div>
  );
};

export default AuditLogPage;
