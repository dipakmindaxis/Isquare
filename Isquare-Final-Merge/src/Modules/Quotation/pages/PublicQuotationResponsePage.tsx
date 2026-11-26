import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Building2,
  Calendar,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { quotationService, getApiErrorMessage } from "../services/quotationService";
import type { PublicQuotationResponseDto } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const PublicQuotationResponsePage: React.FC = () => {
  const { publicResponseId } = useParams<{ publicResponseId: string }>();
  const [searchParams] = useSearchParams();
  const actionParam = (searchParams.get("action") || "").toLowerCase();
  const requestedAction: "Accepted" | "Rejected" | null =
    actionParam === "accept"
      ? "Accepted"
      : actionParam === "reject"
        ? "Rejected"
        : null;

  const [data, setData] = useState<PublicQuotationResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const autoActionTriggeredRef = useRef<boolean>(false);

  const loadPublicQuotation = async () => {
    if (!publicResponseId) {
      setErrorMsg("Invalid quotation link.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await quotationService.getPublicQuotation(publicResponseId);
      setData(res);
    } catch (err) {
      const errData = axios.isAxiosError(err) ? err.response?.data : null;
      setErrorMsg(
        getApiErrorMessage(errData) || "This quotation link is invalid or no longer available."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    autoActionTriggeredRef.current = false;
    loadPublicQuotation();
  }, [publicResponseId]);

  const handleDecision = async (decision: "Accepted" | "Rejected") => {
    if (!publicResponseId || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await quotationService.submitPublicDecision(publicResponseId, {
        decision,
        customerRemarks: remarks.trim() || undefined,
      });
      await loadPublicQuotation();
    } catch (err) {
      const errData = axios.isAxiosError(err) ? err.response?.data : null;
      setErrorMsg(
        getApiErrorMessage(errData) || "Unable to submit your response. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      requestedAction &&
      data &&
      data.responseStatus === "Pending" &&
      !data.isExpired &&
      !data.isRevoked &&
      !autoActionTriggeredRef.current
    ) {
      autoActionTriggeredRef.current = true;
      handleDecision(requestedAction);
    }
  }, [requestedAction, data]);

  if (isLoading || (requestedAction && isSubmitting)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7900]" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Loading Quotation...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-[#052B50]">Invalid Quotation Link</h2>
          <p className="text-sm text-slate-600">
            {errorMsg || "This quotation link is invalid or no longer available."}
          </p>
        </div>
      </div>
    );
  }

  const isPending = data.responseStatus === "Pending";
  const isAccepted = data.responseStatus === "Accepted";
  const isRejected = data.responseStatus === "Rejected";
  const canRespond = isPending && !data.isExpired && !data.isRevoked;

  if (isAccepted || isRejected) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 text-[#172B4D]">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div
            className={`px-6 py-8 text-center space-y-3 ${
              isAccepted
                ? "bg-emerald-50 border-b border-emerald-100"
                : "bg-rose-50 border-b border-rose-100"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                isAccepted
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {isAccepted ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>
            <h1
              className={`text-xl sm:text-2xl font-bold ${
                isAccepted ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {isAccepted ? "Quotation Accepted Successfully" : "Quotation Rejected"}
            </h1>
            <p className="text-sm text-slate-600">
              {isAccepted
                ? "Thank you for confirming this quotation. Our sales team has been notified."
                : "Your response has been recorded. Thank you for letting us know."}
            </p>
          </div>

          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Company</span>
              <span className="font-semibold text-[#052B50]">{data.companyName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Quotation #</span>
              <span className="font-semibold text-[#052B50]">
                {data.quotationNumber} (R{data.revisionNumber})
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Customer</span>
              <span className="font-semibold text-slate-700">{data.customerName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Grand Total</span>
              <span className="font-bold text-[#FF7900]">{formatINR(data.grandTotal)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Responded On</span>
              <span className="font-medium text-slate-700">{formatDate(data.respondedAt)}</span>
            </div>
            {data.customerRemarks && (
              <div className="pt-2">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                  Remarks
                </p>
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  {data.customerRemarks}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (canRespond && requestedAction) {
    const isAcceptFlow = requestedAction === "Accepted";
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 text-[#172B4D]">
        <div className="bg-white max-w-xl w-full rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-[#052B50] text-white px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#FF7900]" />
              <span className="text-lg font-bold tracking-tight">{data.companyName}</span>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF7900] text-white text-[10px] font-bold uppercase tracking-wider">
                Commercial Quotation
              </span>
              <p className="text-sm font-bold mt-1">
                {data.quotationNumber} (R{data.revisionNumber})
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="rounded-xl p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Prepared For
                </p>
                <p className="text-sm font-bold text-[#052B50] mt-0.5">{data.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Grand Total
                </p>
                <p className="text-base font-bold text-[#FF7900] mt-0.5">
                  {formatINR(data.grandTotal)}
                </p>
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border flex items-center gap-3 ${
                isAcceptFlow
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {isAcceptFlow ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <p className="text-xs font-semibold">
                {isAcceptFlow
                  ? "Please confirm below to accept this quotation."
                  : "Please confirm below to reject this quotation."}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">
                {isAcceptFlow
                  ? "Remarks / Feedback (Optional)"
                  : "Rejection Remarks (Optional)"}
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  isAcceptFlow
                    ? "Add any comments or instructions regarding this quotation..."
                    : "Optionally share the reason for rejecting this quotation..."
                }
                className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision(requestedAction)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50 ${
                  isAcceptFlow
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isAcceptFlow ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                <span>
                  {isAcceptFlow ? "Confirm Accept Quotation" : "Confirm Reject Quotation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 text-[#172B4D]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Expired / Revoked Banner */}
        {!canRespond && (
          <div className="rounded-2xl p-5 border shadow-xs flex items-start gap-3.5 bg-amber-50 border-amber-200 text-amber-900">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold">
                {data.isRevoked ? "Quotation Link Revoked" : "Quotation Link Expired"}
              </h3>
              <p className="text-xs opacity-90">
                {data.isRevoked
                  ? "A newer revision or email link has been issued for this quotation. Please refer to the latest email."
                  : `This quotation link expired on ${formatDate(data.expiresAt)}. Please contact our sales team.`}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Quotation Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Brand Header */}
          <div className="bg-[#052B50] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-[#FF7900]" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {data.companyName}
                </h1>
              </div>
              {data.companyAddress && (
                <p className="text-xs text-slate-300 max-w-md">{data.companyAddress}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-300 pt-1">
                {data.companyGstin && <span>GSTIN: {data.companyGstin}</span>}
                {data.companyEmail && <span>Email: {data.companyEmail}</span>}
                {data.companyPhone && <span>Phone: {data.companyPhone}</span>}
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FF7900] text-white text-[11px] font-bold uppercase tracking-wider">
                Commercial Quotation
              </span>
              <p className="text-lg font-bold">
                {data.quotationNumber} (R{data.revisionNumber})
              </p>
            </div>
          </div>

          {/* Customer & Quotation Info */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="space-y-1">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Prepared For
                </p>
                <p className="text-sm font-bold text-[#052B50]">{data.customerName}</p>
                <p className="text-xs text-slate-600">{data.customerEmail}</p>
                {data.customerPhone && (
                  <p className="text-xs text-slate-600">Phone: {data.customerPhone}</p>
                )}
                {data.customerGstin && (
                  <p className="text-xs text-slate-600">GSTIN: {data.customerGstin}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Calendar size={11} /> Date
                  </p>
                  <p className="font-semibold text-[#052B50] mt-0.5">
                    {formatDate(data.quotationDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> Valid Until
                  </p>
                  <p className="font-semibold text-[#052B50] mt-0.5">
                    {formatDate(data.validUntil || data.expiresAt)}
                  </p>
                </div>
                {data.deliveryPeriod && (
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Delivery
                    </p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {data.deliveryPeriod}
                    </p>
                  </div>
                )}
                {data.warranty && (
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Warranty
                    </p>
                    <p className="font-semibold text-slate-700 mt-0.5">{data.warranty}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-3 text-right">Rate</th>
                    <th className="py-3 px-3 text-right">Disc %</th>
                    <th className="py-3 px-3 text-right">GST %</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No items listed.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item, idx) => (
                      <tr key={item.quotationItemId || idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#052B50]">{item.itemName}</p>
                          {item.brand && (
                            <p className="text-[11px] text-slate-500">Brand: {item.brand}</p>
                          )}
                          {item.specification && (
                            <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">
                              {item.specification}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">{item.quantity}</td>
                        <td className="py-3 px-3 text-right">{formatINR(item.rate)}</td>
                        <td className="py-3 px-3 text-right">{item.discountPercentage || 0}%</td>
                        <td className="py-3 px-3 text-right">{item.gstRate || 0}%</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#052B50]">
                          {formatINR(item.lineTotal || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Additional Charges & Grand Total */}
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex-1 space-y-2">
                {data.termsAndConditions && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-1.5">
                      <FileText size={12} /> Terms & Conditions
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {data.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatINR(data.subtotal)}</span>
                </div>
                {data.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">- {formatINR(data.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount</span>
                  <span className="font-semibold">{formatINR(data.taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax</span>
                  <span className="font-semibold">{formatINR(data.taxAmount)}</span>
                </div>
                {data.freightCharges > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Freight Charges</span>
                    <span className="font-semibold">{formatINR(data.freightCharges)}</span>
                  </div>
                )}
                {data.installationCharges > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Installation Charges</span>
                    <span className="font-semibold">{formatINR(data.installationCharges)}</span>
                  </div>
                )}
                {data.otherCharges > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Other Charges</span>
                    <span className="font-semibold">{formatINR(data.otherCharges)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-base font-bold text-[#052B50]">
                  <span>Grand Total</span>
                  <span className="text-[#FF7900]">{formatINR(data.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Customer Response Action Bar */}
            {canRespond && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                {requestedAction && (
                  <div
                    className={`rounded-xl p-4 border flex items-center gap-3 ${
                      requestedAction === "Accepted"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    {requestedAction === "Accepted" ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-rose-600 shrink-0" />
                    )}
                    <p className="text-xs font-semibold">
                      {requestedAction === "Accepted"
                        ? "Please confirm below to accept this quotation."
                        : "Please confirm below to reject this quotation."}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">
                    {requestedAction === "Rejected"
                      ? "Rejection Remarks (Optional)"
                      : "Remarks / Feedback (Optional)"}
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      requestedAction === "Rejected"
                        ? "Optionally share the reason for rejecting this quotation..."
                        : "Add any comments or instructions regarding this quotation..."
                    }
                    className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  {(!requestedAction || requestedAction === "Rejected") && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision("Rejected")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span>
                        {requestedAction === "Rejected" ? "Confirm Reject Quotation" : "Reject Quotation"}
                      </span>
                    </button>
                  )}

                  {(!requestedAction || requestedAction === "Accepted") && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision("Accepted")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      <span>
                        {requestedAction === "Accepted" ? "Confirm Accept Quotation" : "Accept Quotation"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQuotationResponsePage;
