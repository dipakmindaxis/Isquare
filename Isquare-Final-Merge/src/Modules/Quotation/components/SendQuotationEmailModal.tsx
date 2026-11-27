import React, { useState, useEffect } from "react";
import { Mail, Send, X, Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { quotationService, companyProfileService, getApiErrorMessage } from "../services/quotationService";
import type { Quotation, QuotationCustomerResponseDto } from "../models/quotationModels";
import { buildQuotationEmailHtml } from "../utils/quotationEmailTemplate";
import { generateQuotationPdfBase64 } from "../utils/quotationExportPdf";
import { getCustomerById } from "../../RSM/Pages/Customer/Services/CustomerService";
import axios from "axios";

interface SendQuotationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  defaultEmail?: string;
  customerName?: string;
  onEmailSent?: (response: QuotationCustomerResponseDto) => void;
}

export const SendQuotationEmailModal: React.FC<SendQuotationEmailModalProps> = ({
  isOpen,
  onClose,
  quotation,
  defaultEmail = "",
  customerName = "",
  onEmailSent,
}) => {
  const [customerEmail, setCustomerEmail] = useState<string>(defaultEmail);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentResult, setSentResult] = useState<QuotationCustomerResponseDto | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && quotation) {
      setCustomerEmail(defaultEmail || "");
      const qNo = quotation.quotationNumber || `QT-${quotation.quotationId}`;
      setSubject(`Commercial Quotation ${qNo} (Rev ${quotation.revisionNumber})`);
      setMessage(
        `Please review the attached commercial quotation ${qNo} and share your acceptance or feedback using the link below.`
      );
      setSentResult(null);
      setCopied(false);
    }
  }, [isOpen, quotation, defaultEmail]);

  if (!isOpen || !quotation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      toast.error("Please enter the customer email address.");
      return;
    }

    setIsSending(true);
    try {
      let fullQuotation = quotation;
      if (!fullQuotation.items || fullQuotation.items.length === 0) {
        try {
          const fetched = await quotationService.getById(quotation.quotationId);
          if (fetched) fullQuotation = fetched;
        } catch {
          // fallback to passed quotation
        }
      }

      const [profilesRes, customerRes] = await Promise.all([
        companyProfileService.getAll().catch(() => []),
        fullQuotation.customerId
          ? getCustomerById(fullQuotation.customerId).catch(() => null)
          : Promise.resolve(null),
      ]);
      const companyProfile =
        profilesRes.find((p) => p.isDefault && p.isActive) ||
        profilesRes.find((p) => p.isActive) ||
        profilesRes[0] ||
        null;

      const [htmlBody, pdfAttachment] = await Promise.all([
        buildQuotationEmailHtml(fullQuotation, {
          companyProfile,
          customer: customerRes,
          customMessage: message.trim() || undefined,
        }),
        generateQuotationPdfBase64(fullQuotation, companyProfile, customerRes),
      ]);

      if (!pdfAttachment?.base64) {
        throw new Error("Failed to generate Quotation PDF attachment.");
      }

      const res = await quotationService.sendEmail(quotation.quotationId, {
        customerEmail: customerEmail.trim(),
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        htmlBody,
        pdfBase64: pdfAttachment.base64,
        pdfFileName: pdfAttachment.fileName,
      });
      toast.success(res.message || "Quotation email sent successfully.");
      setSentResult(res.data);
      if (onEmailSent) {
        onEmailSent(res.data);
      }
    } catch (err) {
      const errData = axios.isAxiosError(err) ? err.response?.data : null;
      const fallbackMsg = err instanceof Error ? err.message : "Failed to send quotation email.";
      toast.error(getApiErrorMessage(errData) || fallbackMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    const url =
      sentResult?.publicUrl ||
      (sentResult?.publicResponseId
        ? `${window.location.origin}/frontend/quotation-response/${sentResult.publicResponseId}`
        : "");
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Public quotation link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between bg-[#FF7900] text-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Mail size={18} className="text-white" />
            <div>
              <h3 className="text-base font-bold text-white">Send Quotation Email</h3>
              <p className="text-[11px] text-white/90">
                {quotation.quotationNumber || `QT-${quotation.quotationId}`} (R{quotation.revisionNumber})
                {customerName ? ` • ${customerName}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/85 hover:text-white p-1.5 hover:bg-white/15 rounded-none transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {sentResult ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={26} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900">
                Quotation Email Sent Successfully
              </h4>
              <p className="text-xs text-gray-600">
                Sent to <span className="font-semibold text-gray-900">{sentResult.customerEmail}</span>.
                Customer can preview and Accept or Reject directly via the secure link.
              </p>
            </div>

            {sentResult.publicResponseId && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-none text-left space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Public Customer Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      sentResult.publicUrl ||
                      `${window.location.origin}/frontend/quotation-response/${sentResult.publicResponseId}`
                    }
                    className="w-full text-xs bg-white border border-gray-200 rounded-none px-2.5 py-1.5 text-gray-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-none bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@company.com"
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900]"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Commercial Quotation..."
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900]"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional note for the customer..."
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-none transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-none bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Quotation Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendQuotationEmailModal;
