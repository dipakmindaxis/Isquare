import React, { useState, useEffect, useCallback } from "react";
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
  Trash2,
  Pencil,
  Paperclip,
  Download,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem } from "../Types/TaskTypes";
import { completeTask } from "../Services/TaskService";
import {
  getAttachmentsByTaskId,
  createTaskAttachment,
  deleteTaskAttachment,
} from "../../Master/TaskAttachment/Services/TaskAttachmentService";
import type { TaskAttachment } from "../../Master/TaskAttachment/Types/TaskAttachmentTypes";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface ViewTaskModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
  onDelete?: (task: TaskItem) => void;
  onEdit?: (task: TaskItem) => void;
}

const DetailCard: React.FC<{
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
}> = ({ label, value, icon: Icon }) => (
  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-extrabold uppercase tracking-widest">
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
  onDelete,
  onEdit,
}) => {
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [uploadDocName, setUploadDocName] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!task?.taskId) return;
    setIsLoadingAttachments(true);
    try {
      const list = await getAttachmentsByTaskId(task.taskId);
      setAttachments(list);
    } catch {
      setAttachments([]);
    } finally {
      setIsLoadingAttachments(false);
    }
  }, [task?.taskId]);

  useEffect(() => {
    if (isOpen && task) {
      loadAttachments();
      setShowUploadForm(false);
      setUploadDocName("");
      setUploadFile(null);
    }
  }, [isOpen, task, loadAttachments]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.taskId || !uploadFile) return;
    setIsUploading(true);
    try {
      await createTaskAttachment({
        taskId: task.taskId,
        documentName: uploadDocName.trim() || uploadFile.name,
        file: uploadFile,
        isActive: true,
      });
      toast.success("Attachment uploaded successfully!");
      setShowUploadForm(false);
      setUploadDocName("");
      setUploadFile(null);
      loadAttachments();
    } catch {
      toast.error("Failed to upload attachment.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId: number) => {
    try {
      await deleteTaskAttachment(attId);
      toast.success("Attachment deleted successfully!");
      loadAttachments();
    } catch {
      toast.error("Failed to delete attachment.");
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
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
              label="Assigned To"
              value={task.assignedToName || (task.assignedTo ? "Employee" : "Unassigned")}
              icon={UserCheck}
            />
            <DetailCard
              label="Assigned By"
              value={task.assignedByName || "System Admin"}
              icon={UserCheck}
            />
            <DetailCard
              label="Customer / Company"
              value={task.companyName || "General"}
              icon={Building2}
            />
            <DetailCard
              label="Due Date"
              value={task.dueDate}
              icon={Calendar}
            />
          </div>

          {/* Description Section */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-1.5">
              <FileText size={12} />
              Description & Requirements
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || "No specific description provided."}
            </p>
          </div>

          {/* Remarks Section */}
          {task.remarks && (
            <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Remarks / Instructions
              </p>
              <p className="text-sm text-amber-900">{task.remarks}</p>
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

          {/* Attachments Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-1.5">
                <Paperclip size={13} />
                <span>Task Attachments ({attachments.length})</span>
              </p>
              <button
                type="button"
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="text-xs font-semibold text-[#FF7900] hover:text-[#e06800] inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>{showUploadForm ? "Cancel" : "Add Attachment"}</span>
              </button>
            </div>

            {/* Quick Upload Form */}
            {showUploadForm && (
              <form
                onSubmit={handleUploadSubmit}
                className="p-3 bg-white border border-gray-200 rounded-lg space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    placeholder="Document Name (e.g. Report)"
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF7900]"
                  />
                  <input
                    type="file"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setUploadFile(f);
                        if (!uploadDocName.trim()) {
                          const base =
                            f.name.substring(0, f.name.lastIndexOf(".")) || f.name;
                          setUploadDocName(base);
                        }
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-orange-50 file:text-[#FF7900]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="px-3 py-1.5 rounded-lg bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    <span>Upload</span>
                  </button>
                </div>
              </form>
            )}

            {/* Attachments List */}
            {isLoadingAttachments ? (
              <div className="p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={13} className="animate-spin" />
                <span>Loading attachments...</span>
              </div>
            ) : attachments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No files attached to this task.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => {
                  const fileUrl = att.filePath
                    ? `${API_ENDPOINTS.BaseUrl.replace(/\/api$/, "")}/${att.filePath.replace(/^\/+/, "")}`
                    : undefined;
                  return (
                    <div
                      key={att.attachmentId}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={15} className="text-[#FF7900] shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-gray-800 truncate">
                            {att.documentName}
                          </p>
                          {att.fileName && (
                            <p className="text-[11px] text-gray-400 truncate">
                              {att.fileName}{" "}
                              {att.fileSize
                                ? `(${(att.fileSize / 1024).toFixed(1)} KB)`
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Download file"
                          >
                            <Download size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.attachmentId)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete attachment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(task);
                onClose();
              }}
              className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={15} />
              Delete Task
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="px-3.5 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={15} />
                Edit Task
              </button>
            )}
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
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
    </div>
  );
};
