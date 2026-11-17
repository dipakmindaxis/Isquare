import React, { useState } from "react";
import {
  X,
  Tag,
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
} from "lucide-react";
import { toast } from "sonner";
import type { SupportTicketItem } from "../Types/HelpDeskTypes";
import { addTicketReply } from "../Services/HelpDeskService";

interface ViewTicketDetailsModalProps {
  isOpen: boolean;
  ticket: SupportTicketItem | null;
  onClose: () => void;
  onTicketUpdated?: (updated: SupportTicketItem) => void;
}

export const ViewTicketDetailsModal: React.FC<ViewTicketDetailsModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onTicketUpdated,
}) => {
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen || !ticket) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a message to reply.");
      return;
    }

    setIsSending(true);
    try {
      const updated = await addTicketReply(
        ticket.id,
        replyMessage.trim(),
        ticket.createdByName || "Client"
      );
      if (updated) {
        toast.success("Reply posted successfully!");
        setReplyMessage("");
        if (onTicketUpdated) onTicketUpdated(updated);
      }
    } catch {
      toast.error("Failed to post reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} /> Submitted
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
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle size={12} /> Rejected
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
          Urgent
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
              {ticket.ticketNumber}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight line-clamp-1">
                {ticket.subject}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Created on {ticket.createdDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                {getStatusBadge(ticket.status)}
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Priority
                </span>
                {getPriorityBadge(ticket.priorityName)}
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700">
                  <Tag size={11} className="text-slate-400" />
                  {ticket.categoryName}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Created By
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                <User size={12} className="text-slate-400" />
                {ticket.createdByName || "Client"}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Issue Description
            </label>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Attachments Section */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Paperclip size={13} />
                Attachments ({ticket.attachments.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ticket.attachments.map((att) => {
                  const isImg = att.type?.includes("image") || /\.(jpg|jpeg|png)$/i.test(att.name);
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                        {isImg ? <ImageIcon size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                          {att.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{att.formattedSize}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MindAxis Support Team Remarks */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00234a]">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>MindAxis Support Team Remarks</span>
            </div>
            {ticket.supportRemarks ? (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6">
                {ticket.supportRemarks}
              </p>
            ) : (
              <p className="text-xs text-slate-500 pl-6 italic">
                Awaiting review and remarks from the MindAxis Support Team.
              </p>
            )}
          </div>

          {/* Reply / History Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-500" />
                Discussion & Reply History ({ticket.replies?.length || 0})
              </h3>
            </div>

            {/* Replies List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {!ticket.replies || ticket.replies.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No replies yet.
                </p>
              ) : (
                ticket.replies.map((reply) => {
                  const isClient = reply.senderRole === "Client";
                  return (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                        isClient
                          ? "bg-slate-50 border-slate-200 ml-4"
                          : "bg-blue-50/80 border-blue-200 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span
                            className={isClient ? "text-slate-800" : "text-[#00234a] flex items-center gap-1"}
                          >
                            {!isClient && <ShieldCheck size={13} className="text-blue-600" />}
                            {reply.senderName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white border border-slate-200 text-slate-500">
                            {reply.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {reply.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Post Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-2 pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Send a Message / Reply to MindAxis Support
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message or clarification here..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-y min-h-[64px]"
                  disabled={isSending}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Note: MindAxis Support handles status resolution and updates.
                </span>
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
