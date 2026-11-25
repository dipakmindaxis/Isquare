import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Building2,
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
  History,
  Play,
  CheckCircle2,
  ShieldCheck,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem } from "../Types/TaskTypes";
import { isTaskCompletedStatus, updateTaskStatusFlow } from "../Services/TaskService";
import {
  getAttachmentsByTaskId,
  createTaskAttachment,
  deleteTaskAttachment,
} from "../../Master/TaskAttachment/Services/TaskAttachmentService";
import type { TaskAttachment } from "../../Master/TaskAttachment/Types/TaskAttachmentTypes";
import {
  getTaskHistoriesByTaskId,
  createTaskHistory,
} from "../../Master/TaskHistory/Services/TaskHistoryService";
import type { TaskHistoryItem } from "../../Master/TaskHistory/Types/TaskHistoryTypes";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface ViewTaskModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
  onDelete?: (task: TaskItem) => void;
  onEdit?: (task: TaskItem) => void;
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
    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">
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
      <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900]">
        {title}
      </h3>
    </div>
    {badge}
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
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [uploadDocName, setUploadDocName] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Task History State
  const [histories, setHistories] = useState<TaskHistoryItem[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState<boolean>(false);
  const [showAddHistory, setShowAddHistory] = useState<boolean>(false);
  const [historyActivity, setHistoryActivity] = useState<string>("");
  const [historyRemarks, setHistoryRemarks] = useState<string>("");
  const [isAddingHistory, setIsAddingHistory] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

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

  const loadHistories = useCallback(async () => {
    if (!task?.taskId) return;
    setIsLoadingHistories(true);
    try {
      const list = await getTaskHistoriesByTaskId(task.taskId);
      setHistories(list);
    } catch {
      setHistories([]);
    } finally {
      setIsLoadingHistories(false);
    }
  }, [task?.taskId]);

  useEffect(() => {
    if (isOpen && task) {
      loadAttachments();
      loadHistories();
      setShowUploadForm(false);
      setUploadDocName("");
      setUploadFile(null);
      setShowAddHistory(false);
      setHistoryActivity("");
      setHistoryRemarks("");
    }
  }, [isOpen, task, loadAttachments, loadHistories]);

  const handleAddHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.taskId || !historyActivity.trim()) return;
    setIsAddingHistory(true);
    try {
      await createTaskHistory({
        taskId: task.taskId,
        activity: historyActivity.trim(),
        remarks: historyRemarks.trim() || undefined,
        performedBy: task.assignedTo || 1,
      });
      toast.success("Activity note recorded in task history!");
      setHistoryActivity("");
      setHistoryRemarks("");
      setShowAddHistory(false);
      loadHistories();
      if (onStatusUpdated) onStatusUpdated();
    } catch {
      toast.error("Failed to add task history.");
    } finally {
      setIsAddingHistory(false);
    }
  };

  const handleStatusTransition = async (newStatus: "In Progress" | "Completed" | "Approved") => {
    if (!task?.taskId) return;
    setIsUpdatingStatus(true);
    try {
      const statusIdMap = {
        "In Progress": 3,
        "Completed": 4,
        "Approved": 4,
      };
      await updateTaskStatusFlow(
        task.taskId,
        statusIdMap[newStatus],
        newStatus,
        `Task status updated to ${newStatus}`
      );
      toast.success(`Task status updated to "${newStatus}"!`);
      loadHistories();
      if (onStatusUpdated) onStatusUpdated();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const isCompleted = isTaskCompletedStatus(task.taskStatusName, task.taskStatusId, task.isCompleted);

  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isToday =
    !isCompleted &&
    task.dueDate === new Date().toISOString().split("T")[0];

  const hasReminder = Boolean(task.reminderDate || task.reminderTime);

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (isCompleted || s.includes("complete")) return "bg-emerald-500 text-white";
    if (isOverdue || s.includes("overdue") || s.includes("cancel")) return "bg-red-500 text-white";
    if (s.includes("progress") || s.includes("process")) return "bg-blue-500 text-white";
    if (s.includes("due") || s.includes("today")) return "bg-amber-500 text-white";
    return "bg-[#154068] text-white";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200">
        {/* Header - Matching ViewSalesActivityModal */}
        <div className="bg-[#FF7900] p-4 sm:p-6 text-white flex justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-inner shrink-0">
              {task.taskTitle ? task.taskTitle.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-xl font-bold tracking-wide truncate max-w-[220px] sm:max-w-lg">
                  {task.taskTitle}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(
                    task.taskStatusName
                  )}`}
                >
                  {isCompleted ? "Completed" : isOverdue ? "Overdue" : task.taskStatusName || "Pending"}
                </span>
                {task.priorityName && (
                  <span className="bg-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase shrink-0">
                    {task.priorityName}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 opacity-90 mt-0.5 truncate">
                Task #{task.taskId} | Customer: {task.companyName || "General"} | Assigned To:{" "}
                {task.assignedToName || (task.assignedTo ? "Employee" : "Unassigned")}
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

        {/* Content Body */}
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
                  {isOverdue ? "Task Overdue: " : "Task Due Today: "}
                </span>
                <span>
                  Due date was scheduled for {task.dueDate || "today"}.
                </span>
              </div>
            </div>
          )}

          {/* SECTION 1 - BASIC DETAILS */}
          <div>
            <SectionHeader icon={Building2} title="Basic Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <DetailItem
                label="Assigned To"
                value={task.assignedToName || (task.assignedTo ? "Employee" : "Unassigned")}
              />
              <DetailItem
                label="Assigned By"
                value={task.assignedByName || "System Admin"}
              />
              <DetailItem
                label="Customer / Company"
                value={task.companyName || "General"}
              />
              <DetailItem label="Due Date" value={task.dueDate} />
              <DetailItem label="Priority" value={task.priorityName} />
              <DetailItem
                label="Status"
                value={isCompleted ? "Completed" : isOverdue ? "Overdue" : task.taskStatusName || "Pending"}
              />
            </div>
          </div>

          {/* SECTION 2 - DESCRIPTION & REMARKS */}
          <div>
            <SectionHeader icon={FileText} title="Description & Instructions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <DetailItem
                  label="Description & Requirements"
                  value={task.description || "No specific description provided."}
                />
              </div>
              {task.remarks && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <DetailItem label="Remarks / Instructions" value={task.remarks} />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3 - REMINDER */}
          <div>
            <SectionHeader
              icon={Bell}
              title="Reminder"
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
              <DetailItem label="Reminder Date" value={task.reminderDate} />
              <DetailItem label="Reminder Time" value={task.reminderTime} />
            </div>
          </div>

          {/* SECTION 4 - TASK ATTACHMENTS */}
          <div>
            <SectionHeader
              icon={Paperclip}
              title={`Task Attachments (${attachments.length})`}
              badge={
                <button
                  type="button"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="text-xs font-semibold text-[#FF7900] hover:text-[#e06800] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{showUploadForm ? "Cancel" : "Add Attachment"}</span>
                </button>
              }
            />

            {/* Quick Upload Form */}
            {showUploadForm && (
              <form
                onSubmit={handleUploadSubmit}
                className="p-3 mb-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    placeholder="Document Name (e.g. Report)"
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#FF7900]"
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
              <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Loading attachments...</span>
              </div>
            ) : attachments.length === 0 ? (
              <div className="bg-gray-50/80 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                <Package className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-xs font-medium">No files attached to this task.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((att) => {
                  const fileUrl = att.filePath
                    ? `${API_ENDPOINTS.BaseUrl.replace(/\/api$/, "")}/${att.filePath.replace(/^\/+/, "")}`
                    : undefined;
                  return (
                    <div
                      key={att.attachmentId}
                      className="flex items-center justify-between p-3 bg-gray-50/80 border border-gray-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={16} className="text-[#FF7900] shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-[#154068] truncate">
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
                            className="text-[#154068] hover:text-[#F37021] text-xs flex items-center gap-1 font-semibold px-1.5 py-1 rounded transition"
                            title="Download file"
                          >
                            <Download size={13} />
                            <span>Download</span>
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

          {/* SECTION 5 - TASK HISTORY & AUDIT */}
          <div>
            <SectionHeader
              icon={History}
              title={`Task History & Audit (${histories.length})`}
              badge={
                <button
                  type="button"
                  onClick={() => setShowAddHistory(!showAddHistory)}
                  className="text-xs font-semibold text-[#FF7900] hover:text-[#e06800] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{showAddHistory ? "Cancel" : "Add Update"}</span>
                </button>
              }
            />

            {/* Quick Add History Form */}
            {showAddHistory && (
              <form
                onSubmit={handleAddHistorySubmit}
                className="p-3 mb-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={historyActivity}
                    onChange={(e) => setHistoryActivity(e.target.value)}
                    placeholder="Activity (e.g. Work In Progress, Client Review, Approved...)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#FF7900]"
                  />
                  <textarea
                    rows={2}
                    value={historyRemarks}
                    onChange={(e) => setHistoryRemarks(e.target.value)}
                    placeholder="Remarks / Progress update details..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#FF7900]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHistory(false)}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingHistory || !historyActivity.trim()}
                    className="px-3 py-1 rounded-lg bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAddingHistory ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <History size={12} />
                    )}
                    <span>Save Update</span>
                  </button>
                </div>
              </form>
            )}

            {/* Histories Timeline List */}
            {isLoadingHistories ? (
              <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Loading task history...</span>
              </div>
            ) : histories.length === 0 ? (
              <div className="bg-gray-50/80 border border-dashed border-gray-300 rounded-xl p-5 text-center text-gray-500">
                <p className="text-xs italic">No history records logged yet for this task.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {histories.map((h) => {
                  const actLower = (h.activity || "").toLowerCase();
                  let badge = "bg-purple-50 text-purple-700 border-purple-200";
                  if (actLower.includes("approv") || actLower.includes("complet") || actLower.includes("complat")) {
                    badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (actLower.includes("progress")) {
                    badge = "bg-blue-50 text-blue-700 border-blue-200";
                  } else if (actLower.includes("assign") || actLower.includes("creat")) {
                    badge = "bg-amber-50 text-amber-700 border-amber-200";
                  }

                  return (
                    <div
                      key={h.historyId}
                      className="p-3 bg-gray-50/80 border border-gray-200 rounded-lg text-xs space-y-1 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${badge}`}>
                          {h.activity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {h.performedDate ? new Date(h.performedDate).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                        <span>By: <strong className="font-semibold text-[#154068]">{h.performedByName || (h.performedBy ? `Employee #${h.performedBy}` : "System")}</strong></span>
                        {h.remarks && <span className="text-gray-600 truncate max-w-xs italic" title={h.remarks}>{h.remarks}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Matching ViewSalesActivityModal */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono">
              Task ID: #{task.taskId}
            </span>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task);
                  onClose();
                }}
                className="px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Flow Buttons */}
            {!isCompleted && !(task.taskStatusName || "").toLowerCase().includes("progress") && (
              <button
                type="button"
                onClick={() => handleStatusTransition("In Progress")}
                disabled={isUpdatingStatus}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 min-h-[36px]"
              >
                {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                <span>Start Progress</span>
              </button>
            )}

            {!isCompleted && (
              <button
                type="button"
                onClick={() => handleStatusTransition("Completed")}
                disabled={isUpdatingStatus}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 min-h-[36px]"
              >
                {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Mark Completed</span>
              </button>
            )}

            {!(task.taskStatusName || "").toLowerCase().includes("approv") && (
              <button
                type="button"
                onClick={() => handleStatusTransition("Approved")}
                disabled={isUpdatingStatus}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 min-h-[36px]"
              >
                {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                <span>Approve Task</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center cursor-pointer"
            >
              Close
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="px-6 py-2 bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Pencil size={14} />
                <span>Edit Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
