import React from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  PlusCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
  User,
  Hash,
  Building,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FaHistory } from "react-icons/fa";
import type { AuditLogItem } from "../Services/auditLogService";
import { formatAuditDateTime } from "../Utils/auditDateUtils";

interface AuditLogTableProps {
  logs: AuditLogItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onViewDetails: (item: AuditLogItem, srNo?: number) => void;
}

const actionButtonStyles = {
  base: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow cursor-pointer",
  view: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
};

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  error,
  onRetry,
  page,
  pageSize,
  totalCount,
  totalPages,
  sortField = "auditDate",
  sortOrder = "desc",
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
}) => {
  const getSortIcon = (field: string) => {
    if (sortField?.toLowerCase() !== field.toLowerCase()) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-white/60 group-hover:text-white ml-1 inline transition" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-white ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-white ml-1 inline" />
    );
  };

  const renderActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    switch (act) {
      case "CREATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            <span>CREATE</span>
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>UPDATE</span>
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3 h-3 text-rose-600" />
            <span>DELETE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span>{act}</span>
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    return formatAuditDateTime(dateStr);
  };

  // Compute pagination range display (e.g. 1 to 10 of 42)
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[850px]">
          <table className="w-full text-left border-collapse">
            {/* Table Header matching CustomerMaster listingTableStyles (Orange #FF7900) */}
            <thead>
              <tr className="bg-[#FF7900] min-h-[50px] text-white text-[13px] font-semibold select-none">
                <th className="py-3 px-3 w-14 text-center border-r border-[#e06800] uppercase tracking-wider">
                  Sr. No.
                </th>
                <th
                  onClick={() => onSortChange("auditDate")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-white/80" />
                    <span>Date &amp; Time</span>
                    {getSortIcon("auditDate")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("employeeName")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-white/80" />
                    <span>Employee</span>
                    {getSortIcon("employeeName")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("userId")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group text-center uppercase tracking-wider w-24"
                >
                  <div className="flex items-center justify-center">
                    <span>User ID</span>
                    {getSortIcon("userId")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("action")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group uppercase tracking-wider w-28"
                >
                  <div className="flex items-center">
                    <span>Action</span>
                    {getSortIcon("action")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("tableName")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-white/80" />
                    <span>Module / Table</span>
                    {getSortIcon("tableName")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("recordId")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group text-center uppercase tracking-wider w-28"
                >
                  <div className="flex items-center justify-center">
                    <Hash className="w-3.5 h-3.5 mr-1 text-white/80" />
                    <span>Record ID</span>
                    {getSortIcon("recordId")}
                  </div>
                </th>
                <th
                  onClick={() => onSortChange("companyId")}
                  className="py-3 px-3 cursor-pointer hover:bg-[#e06800] border-r border-[#e06800] transition group text-center uppercase tracking-wider w-28"
                >
                  <div className="flex items-center justify-center">
                    <Building className="w-3.5 h-3.5 mr-1 text-white/80" />
                    <span>Company ID</span>
                    {getSortIcon("companyId")}
                  </div>
                </th>
                <th className="py-3 px-3 text-center uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body with borders and rows matching listingTableStyles */}
            <tbody className="divide-y divide-[#d9dde5]">
              {/* Loading Skeleton */}
              {isLoading && (
                <>
                  {Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse min-h-[52px]">
                      <td className="py-3 px-3 text-center border-r border-[#d9dde5]">
                        <div className="w-4 h-4 bg-gray-100 rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-28 h-4 bg-gray-100 rounded" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-24 h-4 bg-gray-100 rounded" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-8 h-4 bg-gray-100 rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-16 h-5 bg-gray-100 rounded-full" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-24 h-4 bg-gray-100 rounded" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-8 h-4 bg-gray-100 rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3 border-r border-[#d9dde5]">
                        <div className="w-8 h-4 bg-gray-100 rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg mx-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-2">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800 mb-1">
                        Failed to load audit logs
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">{error}</p>
                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-4 py-2 rounded-lg bg-[#00234a] hover:bg-[#FF7900] text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!isLoading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center text-gray-400">
                    <FaHistory size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No audit log records found</p>
                  </td>
                </tr>
              )}

              {/* Populated Data Rows */}
              {!isLoading &&
                !error &&
                logs.map((item, index) => {
                  const rowIndex = (page - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.auditLogId}
                      className="min-h-[52px] border-b border-[#d9dde5] hover:bg-[#f0f7ff] transition-all duration-200 cursor-pointer"
                      onClick={() => onViewDetails(item, rowIndex)}
                    >
                      {/* Sr. No. */}
                      <td className="py-2.5 px-3 text-center text-[13px] font-semibold text-gray-500 border-r border-[#d9dde5]">
                        {rowIndex}
                      </td>

                      {/* Date & Time */}
                      <td className="py-2.5 px-3 text-[13px] font-medium text-gray-700 whitespace-nowrap border-r border-[#d9dde5]">
                        {formatDate(item.auditDate)}
                      </td>

                      {/* Employee */}
                      <td className="py-2.5 px-3 text-[13px] font-semibold text-gray-900 border-r border-[#d9dde5]">
                        <div
                          className="flex items-center gap-2 max-w-[200px] truncate"
                          title={item.employeeName || `User #${item.userId}`}
                        >
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF7900] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(item.employeeName || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">
                            {item.employeeName || `User #${item.userId}`}
                          </span>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-2.5 px-3 text-[13px] font-medium text-gray-600 text-center border-r border-[#d9dde5]">
                        {item.userId}
                      </td>

                      {/* Action Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap border-r border-[#d9dde5]">
                        {renderActionBadge(item.action)}
                      </td>

                      {/* Module / Table */}
                      <td className="py-2.5 px-3 text-[13px] font-semibold text-gray-800 whitespace-nowrap border-r border-[#d9dde5]">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {item.tableName}
                        </span>
                      </td>

                      {/* Record ID */}
                      <td className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center border-r border-[#d9dde5]">
                        #{item.recordId}
                      </td>

                      {/* Company ID */}
                      <td className="py-2.5 px-3 text-[13px] font-medium text-gray-600 text-center border-r border-[#d9dde5]">
                        {item.companyId}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-2.5 px-3 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-center items-center w-full">
                          <button
                            type="button"
                            onClick={() => onViewDetails(item, rowIndex)}
                            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer matching CRM standard */}
      {!isLoading && !error && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 bg-white text-xs text-gray-600">
          {/* Page Size & Range Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 outline-none focus:border-[#FF7900] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <span className="text-gray-300">|</span>

            <span>
              Showing <span className="font-semibold text-gray-800">{startItem}</span> to{" "}
              <span className="font-semibold text-gray-800">{endItem}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalCount.toLocaleString()}</span> activities
              {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
            </span>
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = p === page;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isCurrent
                      ? "bg-[#00234a] text-white shadow-xs"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
