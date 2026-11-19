import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Paperclip,
  Clock,
  User,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import type {
  ExternalTicketDetail,
  ExternalTicketListItem,
  SupportTicketItem,
  ExternalAttachment,
} from "../Types/HelpDeskTypes";
import {
  getExternalTicketDetails,
  replyToExternalSupportTicket,
  downloadExternalTicketAttachment,
  formatFileSize,
} from "../Services/HelpDeskService";

interface ViewTicketDetailsModalProps {
  isOpen: boolean;
  ticket: SupportTicketItem | ExternalTicketListItem | null;
  ticketNumber?: string | null;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export const ViewTicketDetailsModal: React.FC<ViewTicketDetailsModalProps> = ({
  isOpen,
  ticket,
  ticketNumber: propTicketNumber,
  onClose,
  onTicketUpdated,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTicketNumber = propTicketNumber || ticket?.ticketNumber;

  const [ticketDetail, setTicketDetail] = useState<ExternalTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

  // Load ticket details from API 3
  const loadTicketDetails = useCallback(async () => {
    if (!activeTicketNumber) return;
    setIsLoading(true);
    try {
      const data = await getExternalTicketDetails(activeTicketNumber, user);
      setTicketDetail(data);
    } catch {
      toast.error("Failed to fetch ticket details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTicketNumber, user]);

  useEffect(() => {
    if (isOpen && activeTicketNumber) {
      setReplyMessage("");
      setReplyFiles([]);
      loadTicketDetails();
    } else {
      setTicketDetail(null);
    }
  }, [isOpen, activeTicketNumber, loadTicketDetails]);

  if (!isOpen) return null;

  // Handle file selection for reply (Max 5 files, 5MB each, .jpg, .jpeg, .png, .pdf)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
    const maxSizeBytes = 5 * 1024 * 1024;
    const currentCount = replyFiles.length;

    const validNewFiles: File[] = [];

    Array.from(selected).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(ext)) {
        toast.error(`"${file.name}" has an unsupported format. Allowed: .jpg, .jpeg, .png, .pdf`);
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds the 5 MB limit (${formatFileSize(file.size)}).`);
        return;
      }
      if (currentCount + validNewFiles.length >= 5) {
        toast.error("Maximum 5 attachments allowed per reply.");
        return;
      }
      validNewFiles.push(file);
    });

    if (validNewFiles.length > 0) {
      setReplyFiles((prev) => [...prev, ...validNewFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit reply via API 4
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketNumber) return;

    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setIsSending(true);
    try {
      await replyToExternalSupportTicket(
        activeTicketNumber,
        replyMessage.trim(),
        replyFiles,
        user
      );
      toast.success("Reply submitted successfully!");
      setReplyMessage("");
      setReplyFiles([]);
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Download attachment via API 5 (Blob download)
  const handleDownload = async (att: ExternalAttachment) => {
    if (!activeTicketNumber) return;
    const attId = att.attachmentId || att.id || "1";
    const fileName = att.fileName || att.name || "attachment";

    setDownloadingId(attId);
    try {
      await downloadExternalTicketAttachment(activeTicketNumber, attId, fileName, user);
      toast.success(`Downloading "${fileName}"`);
    } catch (err: any) {
      toast.error(err?.message || "Unable to download file.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "open" || s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} /> {status || "Open"}
        </span>
      );
    }
    if (s === "received") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 size={12} /> Received
        </span>
      );
    }
    if (s.includes("progress")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock size={12} className="animate-pulse" /> In Progress
        </span>
      );
    }
    if (s === "resolved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s === "closed" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle size={12} /> {status || "Closed"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priorityName: string) => {
    const p = (priorityName || "").toLowerCase().trim();
    if (p.includes("urgent") || p.includes("critical")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Critical
        </span>
      );
    }
    if (p.includes("high")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
          High
        </span>
      );
    }
    if (p.includes("low")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
          Low
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        Medium
      </span>
    );
  };

  const displaySubject = ticketDetail?.subject || ticket?.subject || "Support Ticket";
  const displayStatus = ticketDetail?.status || ticket?.status || "Open";
  const displayPriority = ticketDetail?.priority || (ticket as any)?.priorityName || ticket?.priority || "Medium";
  const displayCreatedDate = ticketDetail?.createdDate || ticket?.createdDate || "";
  const displayDescription = ticketDetail?.description || (ticket as any)?.description || "";
  const displayCustomerName = ticketDetail?.customerName || ticket?.customerName || (user as any)?.name || "Customer";
  const displayEmail = ticketDetail?.email || (user as any)?.email || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#00234a] text-white border-b border-[#001833] shrink-0">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 font-mono text-xs font-bold tracking-wider text-orange-300">
              {activeTicketNumber}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight line-clamp-1">
                {displaySubject}
              </h2>
              {displayCreatedDate && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Created on {new Date(displayCreatedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTicketDetails}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Refresh Ticket Details"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {isLoading && !ticketDetail ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#00234a]" />
              <p className="text-xs font-medium">Loading ticket details and conversation...</p>
            </div>
          ) : (
            <>
              {/* Status & Priority Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Status
                    </span>
                    {getStatusBadge(displayStatus)}
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Priority
                    </span>
                    {getPriorityBadge(displayPriority)}
                  </div>
                  {ticketDetail?.categoryName && (
                    <>
                      <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Category
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700">
                          {ticketDetail.categoryName}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer
                  </span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                    <User size={12} className="text-slate-400" />
                    {displayCustomerName}
                  </span>
                  {displayEmail && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {displayEmail}
                    </span>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Description
                </label>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {displayDescription || "No detailed description provided."}
                </div>
              </div>

              {/* Attachments Section (API 5 Blob Download) */}
              {ticketDetail?.attachments && ticketDetail.attachments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Paperclip size={13} />
                    Attachments ({ticketDetail.attachments.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ticketDetail.attachments.map((att, idx) => {
                      const attId = att.attachmentId || att.id || idx;
                      const fileName = att.fileName || att.name || `Attachment-${idx + 1}`;
                      const isImg =
                        att.contentType?.includes("image") ||
                        att.type?.includes("image") ||
                        /\.(jpg|jpeg|png)$/i.test(fileName);
                      const isPdf =
                        att.contentType?.includes("pdf") ||
                        /\.pdf$/i.test(fileName);
                      const sizeStr = att.formattedSize || formatFileSize(att.fileSize || att.size);
                      const isDownloading = downloadingId === attId;

                      return (
                        <div
                          key={String(attId)}
                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#00234a] flex items-center justify-center shrink-0">
                              {isImg ? (
                                <ImageIcon size={16} className="text-blue-600" />
                              ) : isPdf ? (
                                <FileText size={16} className="text-rose-600" />
                              ) : (
                                <Paperclip size={16} className="text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate" title={fileName}>
                                {fileName}
                              </p>
                              {sizeStr && (
                                <p className="text-[10px] text-slate-400 mt-0.5">{sizeStr}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownload(att)}
                            disabled={isDownloading}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-white transition cursor-pointer shrink-0 disabled:opacity-50"
                            title="Download Attachment"
                          >
                            {isDownloading ? (
                              <RefreshCw size={14} className="animate-spin text-blue-600" />
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conversation & Replies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-500" />
                    Conversation History ({ticketDetail?.replies?.length || 0})
                  </h3>
                </div>

                {/* Replies List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {!ticketDetail?.replies || ticketDetail.replies.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No replies posted yet. Send a message below to communicate with MindAxis Support.
                    </div>
                  ) : (
                    ticketDetail.replies.map((reply, idx) => {
                      const isClient =
                        reply.isCustomerReply === true ||
                        (reply.senderRole || "").toLowerCase().trim() === "client" ||
                        (reply.senderRole || "").toLowerCase().trim() === "customer";

                      const replyDate = reply.createdAt || reply.createdDate || "";

                      return (
                        <div
                          key={reply.id || idx}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                            isClient
                              ? "bg-slate-50 border-slate-200 ml-4"
                              : "bg-blue-50/70 border-blue-200 mr-4"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <span
                                className={
                                  isClient
                                    ? "text-slate-800"
                                    : "text-[#00234a] flex items-center gap-1"
                                }
                              >
                                {!isClient && <ShieldCheck size={14} className="text-blue-600" />}
                                {reply.senderName || (isClient ? "Customer" : "MindAxis Support")}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white border border-slate-200 text-slate-500">
                                {isClient ? "Client" : "Support"}
                              </span>
                            </div>
                            {replyDate && (
                              <span className="text-[10px] text-slate-400">
                                {new Date(replyDate).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {reply.message}
                          </p>

                          {/* Reply Attachments */}
                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                              {reply.attachments.map((rAtt, rIdx) => (
                                <button
                                  key={rAtt.id || rIdx}
                                  type="button"
                                  onClick={() => handleDownload(rAtt)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:text-blue-600 transition cursor-pointer"
                                >
                                  <Download size={11} />
                                  <span className="max-w-[140px] truncate">
                                    {rAtt.fileName || rAtt.name || "attachment"}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Post Reply Form (API 4) */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Reply
                  </label>

                  <textarea
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Enter reply"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-y min-h-[64px]"
                    disabled={isSending}
                  />

                  {/* Attached files preview */}
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {replyFiles.map((file, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                        >
                          <Paperclip size={11} className="text-slate-400" />
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({formatFileSize(file.size)})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending || replyFiles.length >= 5}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                      >
                        <Paperclip size={12} />
                        <span>Attach Files ({replyFiles.length}/5)</span>
                      </button>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        (Max 5 files, 5MB each, .jpg, .png, .pdf)
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !replyMessage.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00234a] hover:bg-[#003366] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>{isSending ? "Sending..." : "Send Reply"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTicketDetailsModal;
