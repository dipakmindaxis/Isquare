import React from "react";
import { Eye, Save, X, ShieldAlert, Loader2 } from "lucide-react";
import { formatINR } from "../utils/quotationCalculations";
import type { QuotationTotalsResult } from "../utils/quotationCalculations";

interface QuotationSummaryProps {
  totals: QuotationTotalsResult;
  customerName?: string;
  enquiryRef?: string;
  hasHighDiscount?: boolean;
  isSubmitting?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
  onRequestApproval?: () => void;
  saveButtonText?: string;
}

export const QuotationSummary: React.FC<QuotationSummaryProps> = ({
  totals,
  customerName,
  enquiryRef,
  hasHighDiscount = false,
  isSubmitting = false,
  onSave,
  onCancel,
  onPreview,
  onRequestApproval,
  saveButtonText = "Save Quotation",
}) => {
  return (
    <div className="space-y-6">
      {/* High Discount Alert */}
      {hasHighDiscount && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
          <ShieldAlert size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Commercial Policy Warning: High Discount Detected (&gt;15%)</p>
            <p className="text-amber-700 mt-0.5">
              Quotations exceeding 15% discount threshold require internal Manager Approval before final release.
            </p>
          </div>
          {onRequestApproval && (
            <button
              type="button"
              onClick={onRequestApproval}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shrink-0"
            >
              Request Approval
            </button>
          )}
        </div>
      )}

      {/* Financial Summary Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-5 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Recap Column */}
          <div className="space-y-2 text-xs text-slate-600">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
              Commercial Proposal Summary
            </h4>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Target Customer:</span>
              <span className="font-semibold text-slate-800">{customerName || "Not Selected"}</span>
            </div>
            {enquiryRef && (
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Enquiry Ref:</span>
                <span className="font-mono text-slate-800">{enquiryRef}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Taxable Base Amount:</span>
              <span className="font-medium text-slate-800">{formatINR(totals.taxableAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Total GST Applicable:</span>
              <span className="font-medium text-slate-800">{formatINR(totals.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Freight &amp; Charges:</span>
              <span className="font-medium text-slate-800">
                {formatINR(
                  totals.freightCharges +
                    totals.installationCharges +
                    totals.otherCharges +
                    totals.additionalChargesTotal
                )}
              </span>
            </div>
          </div>

          {/* Right Grand Total Column */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-right space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Gross Catalog Subtotal:</span>
              <span className="font-mono font-medium">{formatINR(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Total Discount Benefit:</span>
                <span className="font-mono">- {formatINR(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Net Taxable Amount:</span>
              <span className="font-mono font-medium">{formatINR(totals.taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>GST (Goods &amp; Services Tax):</span>
              <span className="font-mono font-medium">{formatINR(totals.taxAmount)}</span>
            </div>
            <div className="border-t-2 border-slate-900/10 pt-3 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grand Total Value:
              </span>
              <span className="text-2xl font-extrabold text-[#00234a]">
                {formatINR(totals.grandTotal)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              All statutory taxes and charges computed as per GST guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          <X size={15} />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onClick={onPreview}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
        >
          <Eye size={15} />
          <span>Preview Quotation</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00234a] hover:bg-[#003366] text-white shadow-md shadow-blue-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Quotation...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{saveButtonText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuotationSummary;
