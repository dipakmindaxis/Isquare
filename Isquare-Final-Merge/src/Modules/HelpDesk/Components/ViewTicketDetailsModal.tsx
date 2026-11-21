import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Paperclip,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Headphones,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import type {
  ExternalTicketDetail,
  ExternalTicketListItem,
  SupportTicketItem,
  ExternalAttachment,
  ExternalTicketReply,
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

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null | React.ReactNode;
}> = ({ label, value }) => (
  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-colors">
    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <div className="text-sm font-semibold text-[#154068] break-words">
      {value !== undefined && value !== null && value !== "" ? value : "-"}
    </div>
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

export const ViewTicketDetailsModal: React.FC<ViewTicketDetailsModalProps> = ({
  isOpen,
  ticket,
  ticketNumber: propTicketNumber,
  onClose,
  onTicketUpdated,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPollingRef = useRef<boolean>(false);
  const hasInitialScrolledRef = useRef<string | null>(null);

  const activeTicketNumber = propTicketNumber || ticket?.ticketNumber;

  const [ticketDetail, setTicketDetail] = useState<ExternalTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"chat" | "details">("chat");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [initialReplyCount, setInitialReplyCount] = useState<number | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "nearest" });
    }
  }, []);

  const isUserNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= 150;
  }, []);

  // Helper: Format message time with UTC-to-local timezone conversion (e.g. "3:38 PM")
  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      let normalized = dateStr.trim();
      if (
        !normalized.endsWith("Z") &&
        !/[+-]\d{2}:\d{2}$/.test(normalized) &&
        !/[+-]\d{4}$/.test(normalized)
      ) {
        normalized = normalized.includes("T")
          ? `${normalized}Z`
          : `${normalized.replace(" ", "T")}Z`;
      }
      const d = new Date(normalized);
      if (isNaN(d.getTime())) {
        const orig = new Date(dateStr);
        if (isNaN(orig.getTime())) return "";
        return orig.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  // Helper: Format full message date with UTC-to-local conversion (e.g. "Nov 21, 2026, 03:38 PM")
  const formatMessageDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      let normalized = dateStr.trim();
      if (
        !normalized.endsWith("Z") &&
        !/[+-]\d{2}:\d{2}$/.test(normalized) &&
        !/[+-]\d{4}$/.test(normalized)
      ) {
        normalized = normalized.includes("T")
          ? `${normalized}Z`
          : `${normalized.replace(" ", "T")}Z`;
      }
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr || "";
    }
  };

  // Helper: Extract sender initials (e.g. "Nilesh Patange" -> "NP")
  const getInitials = (name?: string) => {
    if (!name) return "NP";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NP";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: Sender-based alignment
  // MindAxis Employee / Support / Admin -> LEFT SIDE (isOutgoing = false)
  // Our Message (External Customer / iSQUARE user) -> RIGHT SIDE (isOutgoing = true)
  const isOutgoingMessage = useCallback(
    (reply: ExternalTicketReply) => {
      const role = (
        reply.senderRole ||
        (reply as any).role ||
        (reply as any).userRole ||
        (reply as any).senderType ||
        (reply as any).userType ||
        ""
      ).toString().trim().toLowerCase();

      // 1. MindAxis Employee, Staff, Support or Agent -> LEFT SIDE
      if (
        role.includes("employee") ||
        role.includes("support") ||
        role.includes("staff") ||
        role.includes("agent")
      ) {
        return false;
      }

      // 2. Explicit non-customer reply from MindAxis portal -> LEFT SIDE
      if (reply.isCustomerReply === false) {
        return false;
      }

      // 3. External Customer / Client (our message from iSQUARE) -> RIGHT SIDE
      if (
        role.includes("external") ||
        role.includes("customer") ||
        role.includes("client")
      ) {
        return true;
      }

      // 4. Customer reply flag -> RIGHT SIDE
      if (reply.isCustomerReply === true) {
        return true;
      }

      // 5. Fallback: check senderName
      const sender = (reply.senderName || "").trim().toLowerCase();
      if (sender.includes("mindaxis") || sender.includes("support")) {
        return false;
      }

      return true;
    },
    []
  );

  // Deduplicate helper for ticket replies
  const deduplicateReplies = (replies: ExternalTicketReply[]): ExternalTicketReply[] => {
    const seen = new Set<string>();
    const deduped: ExternalTicketReply[] = [];
    replies.forEach((r, idx) => {
      const key = r.id
        ? `id_${r.id}`
        : `msg_${r.senderName}_${r.createdAt || r.createdDate || ""}_${r.message}_${idx}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    });
    return deduped;
  };

  // Load ticket details from API 3
  const loadTicketDetails = useCallback(async (resetInitialCount = false) => {
    if (!activeTicketNumber) return;
    setIsLoading(true);
    try {
      const data = await getExternalTicketDetails(activeTicketNumber, user);
      if (data?.replies) {
        data.replies = deduplicateReplies(data.replies);
      }
      setTicketDetail(data);
      const total = data?.replies?.length ?? 0;
      setInitialReplyCount((prev) => (resetInitialCount || prev === null ? total : prev));
    } catch {
      toast.error("Failed to fetch ticket details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTicketNumber, user]);

  // Real-time automatic background polling to detect new incoming messages
  const pollLatestMessages = useCallback(async () => {
    if (!isOpen || !activeTicketNumber || isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const updatedData = await getExternalTicketDetails(activeTicketNumber, user);
      if (!updatedData) return;

      setTicketDetail((prev) => {
        if (!prev) return updatedData;

        const prevReplies = prev.replies || [];
        const newReplies = deduplicateReplies(updatedData.replies || []);

        const prevKeys = new Set(
          prevReplies.map(
            (r, i) =>
              r.id
                ? `id_${r.id}`
                : `msg_${r.senderName}_${r.createdAt || r.createdDate || ""}_${r.message}_${i}`
          )
        );

        const hasNewIncoming = newReplies.some(
          (r, i) =>
            !prevKeys.has(
              r.id
                ? `id_${r.id}`
                : `msg_${r.senderName}_${r.createdAt || r.createdDate || ""}_${r.message}_${i}`
            )
        );

        const replyCountChanged =
          (updatedData.replyCount ?? newReplies.length) !==
          (prev.replyCount ?? prevReplies.length);
        const statusChanged = updatedData.status !== prev.status;

        // If no changes, preserve current state
        if (!hasNewIncoming && !replyCountChanged && !statusChanged && prevReplies.length === newReplies.length) {
          return prev;
        }

        // Auto-scroll to latest message if user is already near bottom
        if (hasNewIncoming && isUserNearBottom()) {
          setTimeout(() => scrollToBottom("smooth"), 100);
        }

        // Notify parent listing so table and KPI counts update
        if (hasNewIncoming && onTicketUpdated) {
          onTicketUpdated();
        }

        return {
          ...prev,
          ...updatedData,
          replies: newReplies,
          replyCount: updatedData.replyCount ?? newReplies.length,
        };
      });
    } catch {
      // Background poll silently fails without error alert
    } finally {
      isPollingRef.current = false;
    }
  }, [isOpen, activeTicketNumber, user, isUserNearBottom, scrollToBottom, onTicketUpdated]);

  useEffect(() => {
    if (isOpen && activeTicketNumber) {
      setActiveTab("chat");
      setReplyMessage("");
      setReplyFiles([]);
      hasInitialScrolledRef.current = null;
      setInitialReplyCount(null);
      loadTicketDetails();
    } else {
      setTicketDetail(null);
      hasInitialScrolledRef.current = null;
      setInitialReplyCount(null);
    }
  }, [isOpen, activeTicketNumber, loadTicketDetails]);

  // Real-time automatic message sync interval (every 3.5s when modal is open)
  useEffect(() => {
    if (!isOpen || !activeTicketNumber) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        pollLatestMessages();
      }
    }, 3500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen, activeTicketNumber, pollLatestMessages]);

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
      await loadTicketDetails(true);
      setTimeout(() => scrollToBottom("smooth"), 150);
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (
      activeTicketNumber &&
      ticketDetail?.replies &&
      hasInitialScrolledRef.current !== activeTicketNumber
    ) {
      hasInitialScrolledRef.current = activeTicketNumber;
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTicketNumber, ticketDetail?.replies, scrollToBottom]);

  if (!isOpen) return null;

  // Download attachment via API 5 (Blob download)
  const handleDownload = async (att: ExternalAttachment) => {
    if (!activeTicketNumber) return;
    const attId = att.attachmentId || att.id || "1";
    const fileName = att.originalFileName || att.fileName || att.name || "attachment";

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

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "open" || s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} /> {status || "Open"}
        </span>
      );
    }
    if (s === "received") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 size={11} /> Received
        </span>
      );
    }
    if (s.includes("progress")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock size={11} className="animate-pulse" /> In Progress
        </span>
      );
    }
    if (s === "resolved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} /> Resolved
        </span>
      );
    }
    if (s === "closed" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle size={11} /> {status || "Closed"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  const renderPriorityBadge = (priorityName: string) => {
    const p = (priorityName || "").toLowerCase().trim();
    if (p.includes("urgent") || p.includes("critical")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Critical
        </span>
      );
    }
    if (p.includes("high")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
          High
        </span>
      );
    }
    if (p.includes("low")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
          Low
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Orange Gradient Header */}
        <div className="bg-gradient-to-r from-[#FF5500] via-[#FF7500] to-[#FFA033] p-3.5 sm:p-4 text-white flex justify-between items-center gap-3 shrink-0 shadow-sm relative z-10 border-b border-[#e06800]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with Online Indicator */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#13759a] text-white font-bold text-sm flex items-center justify-center shadow-xs select-none">
                {getInitials(displayCustomerName)}
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-2xs" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-wide truncate max-w-[150px] sm:max-w-xs text-white">
                  {displayCustomerName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white border border-white/30 shrink-0 font-mono">
                  #{activeTicketNumber}
                </span>
              </div>
              <p className="text-xs text-orange-100 truncate max-w-[200px] sm:max-w-md mt-0.5 font-medium">
                {displaySubject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-black/15 p-1 rounded-full border border-white/20 select-none">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "chat"
                  ? "bg-white text-[#FF6A00] shadow-sm"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                <MessageSquare size={13} />
                <span>Chat ({ticketDetail?.replies?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "details"
                  ? "bg-white text-[#FF6A00] shadow-sm"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                <FileText size={13} />
                <span>Details</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadTicketDetails()}
              className="p-1.5 sm:p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-full transition cursor-pointer"
              title="Refresh Ticket Details"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/15 rounded-full transition text-white shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: Chat View (Default) or Ticket Details View */}
        {activeTab === "chat" ? (
          <div className="flex-1 flex flex-col overflow-hidden relative bg-gradient-to-b from-[#f3f7fc] via-[#f7faff] to-[#f0f4fa]">
            {/* Subtle decorative curved background shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <div className="absolute right-0 top-1/4 w-[380px] h-[380px] rounded-full bg-gradient-to-bl from-blue-100/40 via-sky-50/25 to-transparent blur-3xl" />
              <div className="absolute -left-16 bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-100/35 via-rose-50/15 to-transparent blur-2xl" />
            </div>

            {isLoading && !ticketDetail ? (
              <div className="py-24 text-center text-gray-500 relative z-10">
                <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#FF7900]" />
                <p className="text-sm font-semibold">Loading conversation...</p>
              </div>
            ) : (
              <>
                {/* Messages Scroll Area */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative z-10"
                >
                  {/* Date Separator Pill */}
                  <div className="flex justify-center my-2 select-none">
                    <div className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-gray-600 shadow-2xs border border-blue-100/70 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#3b82f6]" />
                      <span>Today</span>
                    </div>
                  </div>

                  {/* Initial Ticket Request Card (Clean Enterprise style) */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 shadow-xs max-w-xl mx-auto w-full mb-3 border border-orange-100 border-l-4 border-l-[#FF7900]">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5 mb-2">
                      <span className="text-[12px] font-bold text-[#FF7900] tracking-wide uppercase">
                        Initial Ticket Request
                      </span>
                      {displayCreatedDate && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatMessageDate(displayCreatedDate)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {displaySubject}
                    </div>
                    <p className="text-xs sm:text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {displayDescription || "No detailed description provided."}
                    </p>

                    {/* Attachments if any */}
                    {ticketDetail?.attachments && ticketDetail.attachments.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {ticketDetail.attachments.map((att, idx) => {
                          const attId = att.attachmentId || att.id || idx;
                          const fileName =
                            att.originalFileName || att.fileName || att.name || `Attachment-${idx + 1}`;
                          const isDownloading = downloadingId === attId;
                          return (
                            <button
                              key={String(attId)}
                              type="button"
                              onClick={() => handleDownload(att)}
                              disabled={isDownloading}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 transition cursor-pointer select-none"
                            >
                              <Paperclip size={12} className="text-[#FF7900]" />
                              <span className="max-w-[140px] truncate">{fileName}</span>
                              <Download
                                size={11}
                                className={
                                  isDownloading ? "animate-spin text-[#FF7900]" : "text-gray-400"
                                }
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Bubbles */}
                  {!ticketDetail?.replies || ticketDetail.replies.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-medium">
                      No conversation messages yet. Type below to send a message.
                    </div>
                  ) : (() => {
                    // Find index of the first new incoming message from MindAxis Employee
                    const firstNewIncomingIdx = ticketDetail.replies.findIndex(
                      (r, i) =>
                        !isOutgoingMessage(r) &&
                        initialReplyCount !== null &&
                        i >= initialReplyCount
                    );

                    return ticketDetail.replies.map((reply, idx) => {
                      const isOutgoing = isOutgoingMessage(reply);
                      const timeStr = formatMessageTime(reply.createdAt || reply.createdDate);
                      const isNewIncomingMessage =
                        !isOutgoing && initialReplyCount !== null && idx >= initialReplyCount;
                      const isFirstNewMessage =
                        firstNewIncomingIdx !== -1 && idx === firstNewIncomingIdx;

                      return (
                        <React.Fragment key={reply.id || idx}>
                          {/* New Messages Divider (only appears before incoming unread messages) */}
                          {isFirstNewMessage && (
                            <div className="relative flex items-center justify-center my-4 select-none">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#FF7900]/40"></div>
                              </div>
                              <span className="relative bg-[#FF7900] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs tracking-wide">
                                New Messages
                              </span>
                            </div>
                          )}

                          {!isOutgoing ? (
                            /* LEFT BUBBLE (MindAxis Employee / Received messages) */
                            <div className="flex justify-start mb-3">
                              <div className="relative bg-white rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs max-w-[85%] sm:max-w-[70%] border border-gray-100 text-gray-800">
                                {/* Sender Header */}
                                <div className="flex items-center gap-2 mb-1.5 select-none">
                                  <span className="text-[13px] font-bold text-gray-900">
                                    {reply.senderName || "System Admin"}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#eef2ff] text-[#4f46e5] border border-indigo-100">
                                    MindAxis Employee
                                  </span>
                                  {isNewIncomingMessage && (
                                    <span className="bg-[#FF7900] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs ml-auto">
                                      New
                                    </span>
                                  )}
                                </div>

                                {/* Message Content */}
                                <div className="text-sm text-gray-800 font-normal leading-relaxed whitespace-pre-wrap break-words">
                                  {reply.message}
                                </div>

                                {/* Attachments */}
                                {reply.attachments && reply.attachments.length > 0 && (
                                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                                    {reply.attachments.map((rAtt, rIdx) => {
                                      const attName =
                                        rAtt.originalFileName || rAtt.fileName || rAtt.name || "attachment";
                                      const attId = rAtt.attachmentId || rAtt.id || rIdx;
                                      const isDownloading = downloadingId === attId;
                                      return (
                                        <button
                                          key={attId}
                                          type="button"
                                          onClick={() => handleDownload(rAtt)}
                                          disabled={isDownloading}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 transition cursor-pointer select-none"
                                        >
                                          <Paperclip size={12} className="text-[#FF7900]" />
                                          <span className="max-w-[140px] truncate">{attName}</span>
                                          <Download
                                            size={11}
                                            className={
                                              isDownloading ? "animate-spin text-[#FF7900]" : "text-gray-400"
                                            }
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Timestamp */}
                                <div className="flex items-center justify-end gap-1 text-[11px] text-gray-400 mt-1 select-none font-medium leading-none">
                                  <Clock size={11} className="text-gray-400" />
                                  <span>{timeStr}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* RIGHT BUBBLE (External Customer / Sent messages) */
                            <div className="flex justify-end mb-3">
                              <div className="relative bg-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-[0_2px_12px_rgba(255,121,0,0.06)] max-w-[85%] sm:max-w-[70%] border border-[#fed7aa] text-gray-800">
                                {/* Header with role, sender name in orange (never marked with 'New') */}
                                <div className="flex items-center justify-between gap-3 mb-1.5 select-none">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100/90 text-gray-600">
                                      External Customer
                                    </span>
                                    <span className="text-[13px] font-bold text-[#FF7900]">
                                      {reply.senderName || displayCustomerName}
                                    </span>
                                  </div>
                                </div>

                                {/* Message Content */}
                                <div className="text-sm text-gray-800 font-normal leading-relaxed whitespace-pre-wrap break-words">
                                  {reply.message}
                                </div>

                                {/* Attachments */}
                                {reply.attachments && reply.attachments.length > 0 && (
                                  <div className="mt-2.5 pt-2 border-t border-orange-100 flex flex-wrap gap-1.5">
                                    {reply.attachments.map((rAtt, rIdx) => {
                                      const attName =
                                        rAtt.originalFileName || rAtt.fileName || rAtt.name || "attachment";
                                      const attId = rAtt.attachmentId || rAtt.id || rIdx;
                                      const isDownloading = downloadingId === attId;
                                      return (
                                        <button
                                          key={attId}
                                          type="button"
                                          onClick={() => handleDownload(rAtt)}
                                          disabled={isDownloading}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50/70 hover:bg-orange-50 border border-orange-200/80 text-xs font-medium text-gray-800 transition cursor-pointer select-none shadow-2xs"
                                        >
                                          <Paperclip size={12} className="text-[#FF7900]" />
                                          <span className="max-w-[140px] truncate">{attName}</span>
                                          <Download
                                            size={11}
                                            className={
                                              isDownloading ? "animate-spin text-[#FF7900]" : "text-gray-400"
                                            }
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Timestamp */}
                                <div className="flex items-center justify-end gap-1 text-[11px] text-gray-400 mt-1 select-none font-medium leading-none">
                                  <Clock size={11} className="text-gray-400" />
                                  <span>{timeStr}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                  <div ref={messagesEndRef} />
                </div>

                {/* Modern Bottom Message Composer */}
                <div className="p-3 sm:p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 shrink-0 relative z-10">
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 px-1">
                      {replyFiles.map((file, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs text-gray-800 shadow-2xs"
                        >
                          <Paperclip size={12} className="text-[#FF7900]" />
                          <span className="max-w-[140px] truncate">{file.name}</span>
                          <span className="text-[10px] text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="text-gray-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-full border border-gray-200/90 shadow-xs flex items-center px-3.5 py-1 gap-2 focus-within:border-[#FF7900] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <input
                        ref={fileInputRef}
                        id="reply-attachment-input"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        disabled={isSending || replyFiles.length >= 5}
                        className="sr-only"
                      />
                      <label
                        htmlFor="reply-attachment-input"
                        className={`p-1.5 rounded-full text-gray-400 hover:text-gray-700 transition cursor-pointer shrink-0 select-none ${isSending || replyFiles.length >= 5
                          ? "opacity-40 cursor-not-allowed pointer-events-none"
                          : ""
                          }`}
                        title={`Attach Files (${replyFiles.length}/5)`}
                      >
                        <Paperclip size={18} />
                      </label>

                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!isSending && replyMessage.trim()) {
                              handleSendReply(e);
                            }
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-800 placeholder-gray-400 py-1.5"
                        disabled={isSending}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !replyMessage.trim()}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF8E1D] hover:from-[#e64d00] hover:to-[#e67a0d] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Send Message"
                    >
                      {isSending ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <Send size={15} className="translate-x-[0.5px]" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ) : (
          /* DETAILS TAB */
          <div className="p-6 sm:p-8 bg-gray-50/60 space-y-6 overflow-y-auto flex-1">
            {/* SECTION 1: TICKET INFORMATION */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
              <SectionHeader icon={Headphones} title="Section 1 - Ticket Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <DetailItem label="Status" value={renderStatusBadge(displayStatus)} />
                <DetailItem label="Priority" value={renderPriorityBadge(displayPriority)} />
                <DetailItem label="Category" value={ticketDetail?.categoryName || "General Support"} />
                <DetailItem label="Customer Name" value={displayCustomerName} />
                <DetailItem label="Customer Email" value={displayEmail || "-"} />
                <DetailItem
                  label="Created Date"
                  value={
                    displayCreatedDate
                      ? new Date(displayCreatedDate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "-"
                  }
                />
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <DetailItem label="Subject" value={displaySubject} />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-100">
                    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
                      Description
                    </p>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {displayDescription || "No detailed description provided."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ATTACHMENTS */}
            {ticketDetail?.attachments && ticketDetail.attachments.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
                <SectionHeader
                  icon={Paperclip}
                  title={`Section 2 - Attachments (${ticketDetail.attachments.length})`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticketDetail.attachments.map((att, idx) => {
                    const attId = att.attachmentId || att.id || idx;
                    const fileName =
                      att.originalFileName || att.fileName || att.name || `Attachment-${idx + 1}`;
                    const isImg =
                      att.contentType?.includes("image") ||
                      att.type?.includes("image") ||
                      /\.(jpg|jpeg|png)$/i.test(fileName);
                    const isPdf = att.contentType?.includes("pdf") || /\.pdf$/i.test(fileName);
                    const sizeStr = att.formattedSize || formatFileSize(att.fileSize || att.size);
                    const isDownloading = downloadingId === attId;

                    return (
                      <div
                        key={String(attId)}
                        className="flex items-center justify-between p-3 bg-gray-50/80 border border-gray-200 rounded-xl hover:border-gray-300 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 mr-2">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-[#00234a] flex items-center justify-center shrink-0">
                            {isImg ? (
                              <ImageIcon size={16} className="text-blue-600" />
                            ) : isPdf ? (
                              <FileText size={16} className="text-rose-600" />
                            ) : (
                              <Paperclip size={16} className="text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate" title={fileName}>
                              {fileName}
                            </p>
                            {sizeStr && <p className="text-[11px] text-gray-400 mt-0.5">{sizeStr}</p>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(att)}
                          disabled={isDownloading}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer shrink-0 disabled:opacity-50"
                          title="Download Attachment"
                        >
                          {isDownloading ? (
                            <RefreshCw size={14} className="animate-spin" />
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
          </div>
        )}

        {/* Modal Footer matching reference design */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#5b6471] hover:bg-[#4b5563] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTicketDetailsModal;
