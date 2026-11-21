import React from "react";
import {
  X,
  Paperclip,
  Hash,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Download,
} from "lucide-react";
import type { TaskAttachment } from "../Types/TaskAttachmentTypes";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

interface ViewTaskAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: TaskAttachment | null;
}

export const ViewTaskAttachmentModal: React.FC<ViewTaskAttachmentModalProps> = ({
  isOpen,
  onClose,
  attachment,
}) => {
  if (!isOpen || !attachment) return null;

  const isActive = attachment.isActive && !attachment.isDeleted;
  const fileUrl = attachment.filePath
    ? `${API_ENDPOINTS.BaseUrl.replace(/\/api$/, "")}/${attachment.filePath.replace(/^\/+/, "")}`
    : undefined;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Attachment Details
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Hash size={13} className="text-[#FF7900]" />
                <span>Attachment ID</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                #{attachment.attachmentId}
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Hash size={13} className="text-[#FF7900]" />
                <span>Task ID</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                #{attachment.taskId}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Document Name
            </p>
            <p className="text-base font-bold text-gray-900">
              {attachment.documentName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <FileText size={13} className="text-blue-500" />
                <span>File Name</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 break-words">
                {attachment.fileName || "—"}
              </p>
              {attachment.fileSize ? (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {(attachment.fileSize / 1024).toFixed(1)} KB
                </p>
              ) : null}
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Calendar size={13} className="text-slate-500" />
                <span>Uploaded Date</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">
                {attachment.uploadedDate
                  ? String(attachment.uploadedDate).split("T")[0]
                  : "—"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle size={15} className="text-emerald-600" />
              ) : (
                <XCircle size={15} className="text-rose-500" />
              )}
              <span className="text-xs font-bold text-gray-700">Status</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {fileUrl && (
            <div className="pt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF7900] border border-[#FF7900]/20 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Download / Open Attached File</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ViewTaskAttachmentModal;
