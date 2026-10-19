import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Building2,
  User,
  Activity,
  HardDrive,
} from "lucide-react";
import type { SalesAttachmentItem } from "./Types/SalesAttachmentTypes";
import {
  downloadSalesAttachment,
  viewSalesAttachment,
} from "./Services/SalesAttachmentService";

interface ViewSalesAttachmentModalProps {
  isOpen: boolean;
  attachment: SalesAttachmentItem | null;
  onClose: () => void;
}

const ViewSalesAttachmentModal: React.FC<ViewSalesAttachmentModalProps> = ({
  isOpen,
  attachment,
  onClose,
}) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && attachment) {
      viewSalesAttachment(attachment.id)
        .then((url) => setViewUrl(url))
        .catch(() => setViewUrl(null));
    } else {
      setViewUrl(null);
    }
  }, [isOpen, attachment]);

  if (!isOpen || !attachment) return null;

  const handleDownload = () => {
    downloadSalesAttachment(attachment.id, attachment.fileName || attachment.name);
  };

  const handleOpenExternal = () => {
    if (viewUrl) {
      window.open(viewUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Logo Theme */}
        <div className="flex items-center justify-between bg-[#FF7900] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Sales Attachment Details
              </h3>
              <p className="text-xs text-orange-100">
                Attachment ID: #{attachment.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* File Overview Banner */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00234a] text-white">
                <FileText size={24} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 truncate max-w-sm">
                  {attachment.fileName || attachment.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{attachment.fileSizeKB || 0} KB</span>
                  <span>•</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-[#F37021]">
                    {attachment.documentType || attachment.category || "Attachment"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewUrl && (
                <button
                  onClick={handleOpenExternal}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  title="Open Preview"
                >
                  <ExternalLink size={16} />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl bg-[#00234a] hover:bg-[#F37021] px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
              >
                <Download size={15} /> Download
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#00234a] text-xs font-bold uppercase tracking-wider">
                <Building2 size={15} /> Customer Details
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Customer
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {attachment.customerName || "N/A"}
                </p>
              </div>
              {attachment.customerId && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                    Customer ID
                  </span>
                  <p className="text-xs font-mono text-slate-600">
                    {attachment.customerId}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#F37021] text-xs font-bold uppercase tracking-wider">
                <Activity size={15} /> CRM Linkage
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Enquiry ID
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {attachment.enquiryId || "-"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Sales Activity ID
                </span>
                <p className="text-xs font-mono text-slate-600">
                  {attachment.salesActivityId || attachment.relatedActivityCode || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <User size={15} /> Upload Info
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Uploaded By
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {attachment.uploadedBy || "System User"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Uploaded Date
                </span>
                <p className="text-xs text-slate-600">
                  {attachment.uploadedDate || attachment.createdDate || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <HardDrive size={15} /> Technical Details
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  File Type / Format
                </span>
                <p className="text-xs font-mono text-slate-800">
                  {attachment.fileType || "application/octet-stream"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest">
                  Status
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {attachment.remarks && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest mb-1">
                Remarks / Notes
              </span>
              <p className="text-xs text-slate-700">{attachment.remarks}</p>
            </div>
          )}

          {/* Image Inline Preview if image */}
          {attachment.isImage && viewUrl && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-widest mb-2">
                Image Preview
              </span>
              <img
                src={viewUrl}
                alt="File preview"
                className="mx-auto max-h-64 rounded-lg object-contain border border-slate-200 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-[#FF7900] hover:bg-[#E66D00] px-6 py-2 text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            <Download size={14} /> Download File
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSalesAttachmentModal;
