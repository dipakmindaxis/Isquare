import React from "react";
import { Activity, PlusCircle, RotateCcw, Trash2 } from "lucide-react";
import type { AuditLogSummary as SummaryData } from "../Services/auditLogService";

interface AuditLogSummaryProps {
  summary: SummaryData | null;
  isLoading: boolean;
}

export const AuditLogSummary: React.FC<AuditLogSummaryProps> = ({
  summary,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Activities */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
          <Activity size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
            Total Activities
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-800">
              {(summary?.totalActivities ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Create Activities */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <PlusCircle size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
            Create Activities
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600">
              {(summary?.createActivities ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Update Activities */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
          <RotateCcw size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
            Update Activities
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-amber-600">
              {(summary?.updateActivities ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Delete Activities */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
          <Trash2 size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
            Delete Activities
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-rose-600">
              {(summary?.deleteActivities ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
