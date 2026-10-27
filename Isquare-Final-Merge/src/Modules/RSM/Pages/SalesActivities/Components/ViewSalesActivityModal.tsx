import React from "react";
import {
  X,
  Calendar,
  Clock,
  Building2,
  FileText,
  MapPin,
  Edit,
  Download,
  AlertCircle,
  Package,
  FileCheck,
} from "lucide-react";
import type { SalesActivity } from "../Types/SalesActivityTypes";

interface ViewSalesActivityModalProps {
  isOpen: boolean;
  activity: SalesActivity | null;
  onClose: () => void;
  onEdit: (activity: SalesActivity) => void;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={`bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-colors ${
      className || ""
    }`}
  >
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-[#154068] break-words">
      {value !== undefined && value !== null && String(value).trim() !== ""
        ? String(value)
        : "-"}
    </p>
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  badge?: React.ReactNode;
}> = ({ icon: Icon, title, badge }) => (
  <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-3 mt-4 first:mt-0">
    <div className="flex items-center gap-2">
      <div className="bg-[#FF7900] p-1.5 rounded text-white">
        <Icon size={14} />
      </div>
      <h3 className="font-bold text-[#FF7900] uppercase text-xs tracking-wider">
        {title}
      </h3>
    </div>
    {badge}
  </div>
);

export const ViewSalesActivityModal: React.FC<ViewSalesActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !activity) return null;

  const statusNorm = (activity.status || "").toLowerCase();
  const isOverdue =
    activity.nextActionDate &&
    statusNorm !== "completed" &&
    statusNorm !== "complete" &&
    statusNorm !== "cancelled" &&
    new Date(activity.nextActionDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isToday =
    activity.nextActionDate === new Date().toISOString().split("T")[0];

  const hasReminder = Boolean(
    activity.reminderDate ||
      activity.reminderTitle ||
      activity.nextActionDate ||
      activity.followUpDate
  );

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("complete")) {
      return "bg-emerald-500 text-white";
    }
    if (s.includes("progress") || s.includes("process")) {
      return "bg-blue-500 text-white";
    }
    if (s.includes("overdue") || s.includes("cancel")) {
      return "bg-red-500 text-white";
    }
    if (s.includes("due") || s.includes("today")) {
      return "bg-amber-500 text-white";
    }
    return "bg-[#154068] text-white";
  };

  const formatPriority = (prio?: string) => {
    if (!prio) return "-";
    const upper = prio.toUpperCase();
    if (upper.startsWith("U")) return "Urgent Priority";
    if (upper.startsWith("H")) return "High Priority";
    if (upper.startsWith("M")) return "Medium Priority";
    if (upper.startsWith("L")) return "Low Priority";
    return prio;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200">
        {/* Header - Matching Customer Profile Header */}
        <div className="bg-[#FF7900] p-4 sm:p-6 text-white flex justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-inner shrink-0">
              {activity.customerName
                ? activity.customerName.charAt(0).toUpperCase()
                : "A"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-xl font-bold tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {activity.customerName || "Sales Activity"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(
                    activity.status
                  )}`}
                >
                  {activity.status || "Scheduled"}
                </span>
                {activity.activityType && (
                  <span className="bg-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase shrink-0">
                    {activity.activityType}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 opacity-90 mt-0.5 truncate">
                Activity Code: {activity.activityCode || "-"} | Subject:{" "}
                {activity.subject || "-"} | Logged by:{" "}
                {activity.assignedEmployeeName || "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">
          {/* Overdue / Due Today Banner */}
          {(isOverdue || isToday) && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                isOverdue
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <AlertCircle size={18} className="shrink-0" />
              <div className="text-xs">
                <span className="font-bold">
                  {isOverdue ? "Action Overdue: " : "Action Due Today: "}
                </span>
                <span>
                  Next follow-up was scheduled for{" "}
                  {activity.nextActionDate || activity.reminderDate || "today"}.{" "}
                  {activity.nextActionDetails || activity.reminderRemarks}
                </span>
              </div>
            </div>
          )}

          {/* SECTION 1 - BASIC DETAILS (Customer Name properly labeled, not Company Name) */}
          <div>
            <SectionHeader icon={Building2} title="Basic Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <DetailItem label="Customer Code" value={activity.customerId} />
              <DetailItem label="Customer Name" value={activity.customerName} />
              <DetailItem label="Contact Person" value={activity.contactPerson} />
              <DetailItem label="Contact Phone" value={activity.contactPhone} />
              <DetailItem label="Contact Email" value={activity.contactEmail} />
              <DetailItem
                label="Assigned Sales Rep"
                value={activity.assignedEmployeeName}
              />
            </div>
          </div>

          {/* SECTION 2 - ACTIVITY INFORMATION */}
          <div>
            <SectionHeader icon={Calendar} title="Activity Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <DetailItem label="Activity Type" value={activity.activityType} />
              <DetailItem label="Activity Status" value={activity.status} />
              <DetailItem label="Activity Date" value={activity.activityDate} />
              <DetailItem label="Activity Time" value={activity.activityTime} />
              <DetailItem
                label="Duration"
                value={
                  activity.durationMinutes
                    ? `${activity.durationMinutes} mins`
                    : null
                }
              />
              <DetailItem
                label="Call / Meeting Type"
                value={activity.callType || activity.meetingType}
              />
              <DetailItem label="Call Outcome" value={activity.callOutcome} />
              <DetailItem
                label="Status Description"
                value={activity.statusDescription}
              />
              <DetailItem label="Outcome" value={activity.outcome} />
            </div>
          </div>

          {/* SECTION 3 - DISCUSSION & NOTES */}
          <div>
            <SectionHeader icon={FileText} title="Discussion & Notes" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <DetailItem label="Subject / Purpose" value={activity.subject} />
              </div>
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <DetailItem
                  label="Discussion Notes & MOM"
                  value={activity.discussionNotes}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4 - NEXT FOLLOW-UP & REMINDER */}
          <div>
            <SectionHeader
              icon={Clock}
              title="Next Follow-Up & Reminder"
              badge={
                hasReminder ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Reminder Active
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">
                    No active reminder
                  </span>
                )
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <DetailItem
                label="Next Follow-Up Date"
                value={activity.nextActionDate || activity.followUpDate}
              />
              <DetailItem
                label="Follow-Up Due Time"
                value={activity.dueTime || activity.reminderTime}
              />
              <DetailItem
                label="Priority Level"
                value={formatPriority(activity.priority)}
              />
              <DetailItem
                label="Assigned Target"
                value={
                  activity.assignedType === "Team"
                    ? `Team: ${activity.assignedTeamName || "Functional Team"}`
                    : activity.assignedEmployeeName || "-"
                }
              />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <DetailItem
                  label="Action Plan / Remarks"
                  value={
                    activity.nextActionDetails || activity.reminderRemarks
                  }
                />
              </div>
              <DetailItem
                label="Reminder Title"
                value={activity.reminderTitle}
              />
              <DetailItem
                label="Reminder Date"
                value={activity.reminderDate}
              />
              <DetailItem
                label="Reminder Time"
                value={activity.reminderTime}
              />
            </div>
          </div>

          {/* SECTION 5 - ACTIVITY SPECIFICS & REFERENCES */}
          <div>
            <SectionHeader icon={MapPin} title="Activity Specifics & References" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <DetailItem label="Site / Location" value={activity.location} />
              <DetailItem label="Meeting Link" value={activity.meetingLink} />
              <DetailItem
                label="Product / Sensor"
                value={activity.productName}
              />
              <DetailItem
                label="Sample Quantity"
                value={activity.sampleQuantity}
              />
              <DetailItem
                label="Linked Record Type"
                value={
                  activity.relatedRecordType &&
                  activity.relatedRecordType !== "None"
                    ? activity.relatedRecordType
                    : null
                }
              />
              <DetailItem
                label="Record Reference Code"
                value={activity.relatedRecordCode}
              />
            </div>
          </div>

          {/* SECTION 6 - ATTACHMENTS & PHOTOGRAPHS */}
          <div>
            <SectionHeader
              icon={FileCheck}
              title={`Attachments & Photographs (${
                activity.photographs.length + activity.documents.length
              })`}
            />
            {activity.photographs.length === 0 &&
            activity.documents.length === 0 ? (
              <div className="bg-gray-50/80 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                <Package className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-xs font-medium">
                  No documents or visit photographs uploaded.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activity.photographs.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">📷</span>
                      <span className="font-semibold text-gray-800 truncate text-[11px]">
                        {photo.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{(photo.size / 1024).toFixed(0)} KB</span>
                      <span>{photo.uploadedAt}</span>
                    </div>
                  </div>
                ))}
                {activity.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">📄</span>
                      <span className="font-semibold text-gray-800 truncate text-[11px]">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({(doc.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Simulating preview / download for document: ${doc.name}`
                        )
                      }
                      className="text-[#154068] hover:text-[#F37021] text-xs flex items-center gap-1 font-semibold ml-2 shrink-0 cursor-pointer transition"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer - Matching Customer View Modal */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            Activity ID: {activity.activityCode || activity.id}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(activity);
              }}
              className="px-6 py-2 bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit size={14} />
              <span>Edit Activity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalesActivityModal;
