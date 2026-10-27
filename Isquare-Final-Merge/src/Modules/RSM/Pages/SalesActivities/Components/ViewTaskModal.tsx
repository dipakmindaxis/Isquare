import React, { useState } from "react";
import {
  X,
  Calendar,
  Building2,
  CheckCircle,
  UserCheck,
  AlertCircle,
  Bell,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem } from "../Types/TaskTypes";
import { completeTask } from "../Services/TaskService";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface ViewTaskModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const DetailCard: React.FC<{
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
}> = ({ label, value, icon: Icon }) => (
  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
      {Icon && <Icon size={12} />}
      <span>{label}</span>
    </div>
    <p className="text-sm font-semibold text-slate-800 break-words">
      {value !== undefined && value !== null && String(value).trim() !== ""
        ? String(value)
        : "—"}
    </p>
  </div>
);

export const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onStatusUpdated,
}) => {
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  if (!isOpen || !task) return null;

  const isCompleted =
    task.isCompleted ||
    task.taskStatusId === 4 ||
    (task.taskStatusName || "").toLowerCase().includes("completed") ||
    (task.taskStatusName || "").toLowerCase().includes("approved");

  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      await completeTask(task.taskId);
      toast.success("Task / Request marked as Completed / Approved!");
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch {
      toast.error("Failed to update task status.");
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityBadgeClass = (priorityName?: string) => {
    const p = (priorityName || "").toLowerCase();
    if (p.includes("urgent")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (p.includes("high")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (p.includes("medium")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex justify-between items-start bg-[#FF7900] text-white p-5 sm:p-6 border-b border-[#e06800]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                Task #{task.taskId}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-white ${getPriorityBadgeClass(
                  task.priorityName
                )}`}
              >
                {task.priorityName || "Priority"}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isOverdue
                    ? "bg-rose-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {isCompleted ? "Completed" : isOverdue ? "Overdue" : task.taskStatusName || "Pending"}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {task.taskTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailCard
              label="Assigned Director"
              value={task.assignedToName || `Director #${task.assignedTo}`}
              icon={UserCheck}
            />
            <DetailCard
              label="Customer / Company"
              value={task.companyName || (task.companyId ? `Company #${task.companyId}` : "General")}
              icon={Building2}
            />
            <DetailCard
              label="Start Date"
              value={task.startDate}
              icon={Calendar}
            />
            <DetailCard
              label="Due Date"
              value={task.dueDate}
              icon={Calendar}
            />
          </div>

          {/* Description Section */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} />
              Description & Requirements
            </p>
            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || "No specific description provided."}
            </p>
          </div>

          {/* Remarks Section */}
          {task.remarks && (
            <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={12} />
                Remarks / Instructions
              </p>
              <p className="text-xs text-amber-900">{task.remarks}</p>
            </div>
          )}

          {/* Reminder Section */}
          {(task.reminderDate || task.reminderTime) && (
            <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-blue-600" />
                <span>
                  Reminder Scheduled: <strong className="font-semibold">{task.reminderDate}</strong> at{" "}
                  <strong className="font-semibold">{task.reminderTime || "10:00"}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.cancel}
          >
            Close
          </button>
          {!isCompleted && (
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isCompleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Mark as Completed / Approved
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
