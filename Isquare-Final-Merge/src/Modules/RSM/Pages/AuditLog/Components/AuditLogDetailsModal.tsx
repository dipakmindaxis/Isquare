import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Layers,
  Info,
  Code,
  Loader2,
  FileText,
} from "lucide-react";
import type { AuditLogItem } from "../Services/auditLogService";
import { formatAuditDateTime } from "../Utils/auditDateUtils";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLogItem | null;
  srNo?: number | null;
  isLoading?: boolean;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => (
  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-colors">
    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-[#154068] break-words">
      {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
    </p>
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
}> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-3 mt-4 first:mt-0">
    <div className="bg-[#FF7900] p-1.5 rounded text-white">
      <Icon size={14} />
    </div>
    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900]">
      {title}
    </h3>
  </div>
);

/**
 * Formats JSON with copy button and structured display
 */
const JsonViewer: React.FC<{
  title: string;
  jsonString: string | null | undefined;
  variant: "old" | "new";
  emptyMessage: string;
}> = ({ title, jsonString, variant, emptyMessage }) => {
  const [copied, setCopied] = useState(false);

  let formattedJson = "";

  if (jsonString && jsonString.trim()) {
    try {
      const parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
      formattedJson = JSON.stringify(parsed, null, 2);
    } catch {
      formattedJson = String(jsonString);
    }
  }

  const handleCopy = async () => {
    if (!formattedJson) return;
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  const isOld = variant === "old";

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs h-full">
      {/* Header with Title and Copy Button */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isOld ? "bg-amber-50/70 border-amber-200 text-amber-900" : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 opacity-70" />
          <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
        </div>
        {formattedJson && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs transition active:scale-95 cursor-pointer"
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Display Area */}
      <div className="p-3.5 flex-1 min-h-[160px] max-h-[360px] overflow-auto bg-slate-900 font-mono text-xs rounded-b-xl text-slate-200 select-text">
        {formattedJson ? (
          <pre className="whitespace-pre-wrap break-words leading-relaxed">
            {formattedJson}
          </pre>
        ) : (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Info className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-xs italic">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  isOpen,
  onClose,
  auditLog,
  srNo,
  isLoading,
}) => {
  if (!isOpen) return null;

  const actionUpper = auditLog?.action ? auditLog.action.toUpperCase() : "ACTIVITY";
  const displayId = srNo != null ? srNo : auditLog?.auditLogId;

  const formatDate = (dateStr?: string) => {
    return formatAuditDateTime(dateStr);
  };

  const getActionBadgeColor = (act: string) => {
    switch (act) {
      case "CREATE":
        return "bg-emerald-500 text-white";
      case "UPDATE":
        return "bg-amber-500 text-white";
      case "DELETE":
        return "bg-red-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const avatarInitial = auditLog?.employeeName
    ? auditLog.employeeName.charAt(0).toUpperCase()
    : auditLog?.tableName
    ? auditLog.tableName.replace(/^tbl_/, "").charAt(0).toUpperCase()
    : "A";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching ViewCustomerModal Orange Theme */}
        <div className="bg-[#FF7900] p-4 sm:p-6 text-white flex justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-inner shrink-0">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-xl font-bold tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {auditLog?.tableName || "Audit Activity Details"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${getActionBadgeColor(
                    actionUpper
                  )}`}
                >
                  {actionUpper}
                </span>
                {displayId != null && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 bg-white/20 text-white">
                    #{displayId}
                  </span>
                )}
              </div>
              <p className="text-xs text-orange-100 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 sm:mt-1">
                <span>Record ID: #{auditLog?.recordId ?? "-"}</span>
                <span className="hidden sm:inline opacity-60">•</span>
                <span className="truncate">
                  {actionUpper === "CREATE"
                    ? `Created By: ${auditLog?.createdByEmployeeName || auditLog?.previousActionByEmployeeName || auditLog?.employeeName || "Not Available"}`
                    : `Previous Action By: ${auditLog?.previousActionByEmployeeName || "Not Available"}`}
                </span>
                {actionUpper !== "CREATE" && (
                  <>
                    <span className="hidden sm:inline opacity-60">•</span>
                    <span className="truncate">
                      {actionUpper === "UPDATE"
                        ? "Modified By"
                        : actionUpper === "DELETE"
                        ? "Deleted By"
                        : "Action By"}
                      : {auditLog?.employeeName || `User #${auditLog?.userId ?? "-"}`}
                    </span>
                  </>
                )}
                <span className="hidden sm:inline opacity-60">•</span>
                <span>Date: {formatDate(auditLog?.auditDate)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF7900]" />
              <p className="text-sm font-medium text-gray-500">
                Loading audit record details...
              </p>
            </div>
          ) : !auditLog ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm font-medium">No audit record details available.</p>
            </div>
          ) : (
            <>
              {/* Activity Details Section */}
              <div>
                <SectionHeader icon={Info} title="Activity Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <DetailItem label="Audit Log ID" value={`#${displayId}`} />
                  <DetailItem
                    label={actionUpper === "CREATE" ? "Created By" : "Previous Action By"}
                    value={
                      actionUpper === "CREATE"
                        ? auditLog.createdByEmployeeName ||
                          auditLog.previousActionByEmployeeName ||
                          auditLog.employeeName ||
                          "Not Available"
                        : auditLog.previousActionByEmployeeName || "Not Available"
                    }
                  />
                  <DetailItem
                    label={
                      actionUpper === "UPDATE"
                        ? "Employee Name (Modified By)"
                        : actionUpper === "DELETE"
                        ? "Employee Name (Deleted By)"
                        : "Employee Name"
                    }
                    value={auditLog.employeeName || `User #${auditLog.userId}`}
                  />
                  <DetailItem label="User ID" value={auditLog.userId} />
                  <DetailItem label="Company ID" value={auditLog.companyId} />
                  <DetailItem label="Table Name" value={auditLog.tableName} />
                  <DetailItem
                    label="Entity Name"
                    value={auditLog.entityName || auditLog.tableName.replace(/^tbl_/, "")}
                  />
                  <DetailItem label="Record ID" value={`#${auditLog.recordId}`} />
                  <DetailItem label="Date & Time" value={formatDate(auditLog.auditDate)} />
                </div>
              </div>

              {/* Description Callout */}
              {auditLog.description && (
                <div className="bg-orange-50/60 p-3.5 rounded-lg border border-orange-200/80 text-xs text-[#00234a] flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#FF7900] mr-1.5 uppercase tracking-wide text-[11px]">
                      Description:
                    </span>
                    <span className="font-medium text-gray-800">{auditLog.description}</span>
                  </div>
                </div>
              )}

              {/* State Mutation Comparison (Old Value vs New Value) */}
              <div>
                <SectionHeader icon={Layers} title="State Mutation Comparison" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Old Value */}
                  <div className={actionUpper === "CREATE" ? "opacity-75" : ""}>
                    <JsonViewer
                      title="Old Value – Before Change"
                      jsonString={auditLog.oldValue}
                      variant="old"
                      emptyMessage={
                        actionUpper === "CREATE"
                          ? "No previous state (New record creation)"
                          : "Old value was null or not captured."
                      }
                    />
                  </div>

                  {/* Right: New Value */}
                  <div className={actionUpper === "DELETE" ? "opacity-75" : ""}>
                    <JsonViewer
                      title="New Value – After Change"
                      jsonString={auditLog.newValue}
                      variant="new"
                      emptyMessage={
                        actionUpper === "DELETE"
                          ? "Record was permanently removed (No new value)"
                          : "New value was null or not captured."
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer matching ViewCustomerModal */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
