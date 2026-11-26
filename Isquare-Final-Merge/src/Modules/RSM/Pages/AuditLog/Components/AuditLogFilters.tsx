import React, { useState } from "react";
import {
  RotateCcw,
  Calendar,
  Filter,
  User,
  Hash,
  Layers,
  X,
  AlertCircle,
} from "lucide-react";
import { FaSearch } from "react-icons/fa";
import type { AuditLogFilterParams } from "../Services/auditLogService";

interface AuditLogFiltersProps {
  filters: AuditLogFilterParams;
  onApplyFilters: (newFilters: Partial<AuditLogFilterParams>) => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

const COMMON_TABLES = [
  "tbl_Product",
  "tbl_Customer",
  "tbl_Enquiry",
  "tbl_Quotation",
  "tbl_Employee",
  "tbl_User",
  "tbl_CustomerContact",
  "tbl_Task",
];

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  isLoading,
}) => {
  // Local state for all filter inputs before user clicks Search or presses Enter
  const [search, setSearch] = useState(filters.search || "");
  const [fromDate, setFromDate] = useState(filters.fromDate || "");
  const [toDate, setToDate] = useState(filters.toDate || "");
  const [action, setAction] = useState(filters.action || "ALL");
  const [userId, setUserId] = useState<string>(
    filters.userId !== undefined ? String(filters.userId) : ""
  );
  const [recordId, setRecordId] = useState<string>(
    filters.recordId !== undefined ? String(filters.recordId) : ""
  );
  const [tableName, setTableName] = useState(filters.tableName || "");
  const [dateError, setDateError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const validateDates = (from: string, to: string): boolean => {
    if (from && to) {
      const fromObj = new Date(from);
      const toObj = new Date(to);
      if (fromObj > toObj) {
        setDateError("From Date cannot be later than To Date.");
        return false;
      }
    }
    setDateError(null);
    return true;
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    validateDates(val, toDate);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    validateDates(fromDate, val);
  };

  const handleActionChange = (newAction: string) => {
    setAction(newAction);
    onApplyFilters({
      search: search.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      action: newAction && newAction !== "ALL" ? newAction : undefined,
      userId: userId.trim() ? Number(userId.trim()) : undefined,
      recordId: recordId.trim() ? Number(recordId.trim()) : undefined,
      tableName: tableName.trim() || undefined,
      page: 1,
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateDates(fromDate, toDate)) return;

    onApplyFilters({
      search: search.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      action: action && action !== "ALL" ? action : undefined,
      userId: userId.trim() ? Number(userId.trim()) : undefined,
      recordId: recordId.trim() ? Number(recordId.trim()) : undefined,
      tableName: tableName.trim() || undefined,
      page: 1, // reset to page 1 on new filter
    });
  };

  const handleReset = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setAction("ALL");
    setUserId("");
    setRecordId("");
    setTableName("");
    setDateError(null);
    onResetFilters();
  };

  const hasActiveFilters = Boolean(
    search ||
      fromDate ||
      toDate ||
      (action && action !== "ALL") ||
      userId ||
      recordId ||
      tableName
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 space-y-3">
      {/* Top Search Bar & Primary Actions matching CustomerMaster Filter & Search Bar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 sm:gap-4">
          {/* Main Search Input */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search by employee, module, action, or record ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Segmented Controls styled like CustomerMaster Status pills */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Action:
            </span>
            <div className="flex bg-gray-100 p-1 rounded-lg flex-1 sm:flex-initial overflow-x-auto">
              {["ALL", "CREATE", "UPDATE", "DELETE"].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => handleActionChange(act)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-all text-center whitespace-nowrap cursor-pointer ${
                    action === act
                      ? "bg-white text-[#FF8500] shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {act === "ALL" ? "All" : act}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {/* Toggle More Filters */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                isExpanded || hasActiveFilters
                  ? "border-[#FF7900] bg-orange-50 text-[#FF7900]"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
              title="Toggle advanced filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#FF7900]"></span>
              )}
            </button>

            {/* Search Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[#00234a] hover:bg-[#FF7900] px-4 py-2 text-sm font-semibold text-white shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              <FaSearch size={12} />
              <span>Search</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              title="Reset all filters"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-semibold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Date Validation Alert */}
        {dateError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{dateError}</span>
          </div>
        )}

        {/* Advanced Filter Collapsible Drawer */}
        {isExpanded && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* From Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>From Date</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] bg-white"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>To Date</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] bg-white"
              />
            </div>

            {/* Module / Table Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span>Module / Table</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="common-tables"
                  placeholder="e.g. tbl_Customer"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] bg-white"
                />
                <datalist id="common-tables">
                  {COMMON_TABLES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Numeric IDs: User ID and Record ID */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>User ID</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span>Record ID</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 101"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
