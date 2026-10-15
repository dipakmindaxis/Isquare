import React from "react";
import { X, Printer, CheckCircle, RefreshCw, ShoppingCart } from "lucide-react";
import type { Quotation, CompanyProfile } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR, calculateItemTotals } from "../utils/quotationCalculations";
import QuotationStatusBadge from "./QuotationStatusBadge";

interface QuotationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  companyProfile?: CompanyProfile | null;
  customer?: Customer | null;
  onRequestApproval?: () => void;
  onCreateRevision?: () => void;
  onConvertToOrder?: () => void;
  isConvertingToOrder?: boolean;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  onClose,
  quotation,
  companyProfile,
  customer,
  onRequestApproval,
  onCreateRevision,
  onConvertToOrder,
  isConvertingToOrder = false,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-8 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-gray-200 flex items-center justify-between bg-[#00234a] text-white shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
              iS
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Quotation Preview — {quotation.quotationNumber || `QT-${quotation.quotationId}`}
              </h3>
              <p className="text-xs text-blue-200 font-mono">
                Revision R{quotation.revisionNumber} · Status: {quotation.status || "Draft"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow transition"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Quotation Document Body */}
        <div id="printableDocument" className="p-8 overflow-y-auto space-y-6 flex-1 text-xs text-gray-800">
          {/* Company Branding & Meta Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 bg-[#00234a] rounded-lg text-white font-bold flex items-center justify-center text-base">
                  iS
                </div>
                <h1 className="text-lg font-extrabold tracking-tight text-[#00234a] uppercase">
                  {companyProfile?.companyName || "ISQUARE TECHNOLOGIES"}
                </h1>
              </div>
              <p className="text-gray-500">
                {companyProfile?.address || "Plot 14, Electronic Zone, MIDC, Mahape, Navi Mumbai"}
              </p>
              <p className="text-gray-500 font-medium mt-0.5">
                GSTIN: <span className="font-mono text-gray-700">{companyProfile?.gstin || "27AAAAA0000A1Z5"}</span> | PAN: <span className="font-mono text-gray-700">{companyProfile?.pan || "AAAAA0000A"}</span>
              </p>
              {companyProfile?.phone && (
                <p className="text-gray-400 mt-0.5">Phone: {companyProfile.phone} | Email: {companyProfile.email || "sales@isquare.com"}</p>
              )}
            </div>

            <div className="text-right">
              <h2 className="text-base font-extrabold text-blue-700 font-mono">
                {quotation.quotationNumber || `QT-2026-${String(quotation.quotationId).padStart(3, "0")}`}
              </h2>
              <span className="inline-block mt-1">
                <QuotationStatusBadge status={quotation.status} />
              </span>
              <p className="text-gray-500 mt-1">
                Date: {quotation.quotationDate ? new Date(quotation.quotationDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}
              </p>
              {quotation.validUntil && (
                <p className="text-gray-500">
                  Valid Until: {new Date(quotation.validUntil).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Enquiry Info Banner */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer Details:
              </p>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                {quotation.customerName || customer?.customerName || customer?.companyName || "Valued Client"}
              </h4>
              {(customer as any)?.contactPerson && (
                <p className="text-slate-600 mt-0.5">Attn: {(customer as any).contactPerson}</p>
              )}
              {(customer as any)?.email && (
                <p className="text-slate-500 text-[11px]">{(customer as any).email} {(customer as any).phone ? `· ${(customer as any).phone}` : ""}</p>
              )}
              {customer?.gstin && (
                <p className="text-slate-500 text-[11px] font-mono">GSTIN: {customer.gstin}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Enquiry &amp; Delivery:
              </p>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5 font-mono">
                {quotation.enquiryRef || "Direct Proposal"}
              </h4>
              <p className="text-slate-600 mt-0.5">
                Delivery Period: <span className="font-semibold text-slate-800">{quotation.deliveryPeriod || "2-3 Weeks"}</span>
              </p>
              <p className="text-slate-600 mt-0.5">
                Warranty: <span className="font-semibold text-slate-800">{quotation.warranty || "1 Year Standard"}</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#154068] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2.5 w-8">#</th>
                  <th className="p-2.5">Product &amp; Specification</th>
                  <th className="p-2.5 w-16 text-center">Qty</th>
                  <th className="p-2.5 w-24 text-right">Rate (₹)</th>
                  <th className="p-2.5 w-16 text-center">Disc %</th>
                  <th className="p-2.5 w-16 text-center">GST %</th>
                  <th className="p-2.5 w-28 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(quotation.items || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No items in this quotation.
                    </td>
                  </tr>
                ) : (
                  quotation.items!.map((item, idx) => {
                    const calc = calculateItemTotals(
                      item.quantity,
                      item.rate,
                      item.discountPercentage,
                      item.gstRate
                    );
                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-2.5 align-top font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 align-top">
                            <div className="font-bold text-slate-900">
                              {item.itemName} {item.brand ? `(${item.brand})` : ""}
                            </div>
                            {item.itemCode && (
                              <div className="text-[10px] font-mono text-blue-600">
                                Code: {item.itemCode}
                              </div>
                            )}
                            {item.specification && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {item.specification}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 align-top text-center font-bold">
                            {item.quantity} {item.unitName || "Nos"}
                          </td>
                          <td className="p-2.5 align-top text-right font-medium">
                            {formatINR(item.rate)}
                          </td>
                          <td className="p-2.5 align-top text-center text-slate-600">
                            {item.discountPercentage}%
                          </td>
                          <td className="p-2.5 align-top text-center text-slate-600">
                            {item.gstRate}%
                          </td>
                          <td className="p-2.5 align-top text-right font-bold text-slate-900">
                            {formatINR(calc.lineTotal)}
                          </td>
                        </tr>

                        {/* Accessories */}
                        {item.accessories &&
                          item.accessories.map((acc, aIdx) => {
                            const aCalc = calculateItemTotals(
                              acc.quantity,
                              acc.rate,
                              acc.discountPercentage,
                              acc.gstRate
                            );
                            return (
                              <tr key={`acc-${aIdx}`} className="bg-blue-50/30 text-[11px]">
                                <td className="p-2 text-right text-blue-500">↳</td>
                                <td className="p-2">
                                  <span className="font-semibold text-slate-800">
                                    [Accessory] {acc.itemName}
                                  </span>
                                  {acc.specification && (
                                    <span className="text-slate-500 ml-1">
                                      - {acc.specification}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center font-medium">
                                  {acc.quantity} {acc.unitName || "Nos"}
                                </td>
                                <td className="p-2 text-right">{formatINR(acc.rate)}</td>
                                <td className="p-2 text-center">{acc.discountPercentage}%</td>
                                <td className="p-2 text-center">{acc.gstRate}%</td>
                                <td className="p-2 text-right font-bold text-slate-800">
                                  {formatINR(aCalc.lineTotal)}
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="flex justify-end pt-1">
            <div className="w-80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono font-medium">{formatINR(quotation.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST Amount:</span>
                <span className="font-mono font-medium">{formatINR(quotation.taxAmount)}</span>
              </div>
              {(quotation.freightCharges > 0 ||
                quotation.installationCharges > 0 ||
                quotation.otherCharges > 0) && (
                <div className="flex justify-between text-slate-600">
                  <span>Freight &amp; Services:</span>
                  <span className="font-mono font-medium">
                    {formatINR(
                      quotation.freightCharges +
                        quotation.installationCharges +
                        quotation.otherCharges
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t-2 border-slate-900/10 pt-2">
                <span>Grand Total:</span>
                <span className="text-blue-700">{formatINR(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Commercial Terms & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="space-y-1 text-slate-600">
              <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Commercial Terms:
              </p>
              <p>
                <span className="font-semibold text-slate-700">Payment Terms:</span>{" "}
                {quotation.paymentTermsName || "Standard as agreed"}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Warranty:</span>{" "}
                {quotation.warranty || "1 Year Standard"}
              </p>
              {quotation.termsAndConditions && (
                <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1">
                  {quotation.termsAndConditions}
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
              <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Bank Remittance Details:
              </p>
              <p>
                Bank: <span className="font-semibold text-slate-800">{companyProfile?.bankName || "HDFC Bank Ltd"}</span>
              </p>
              <p>
                A/C No: <span className="font-mono font-semibold text-slate-800">{companyProfile?.accountNumber || "50200012345678"}</span>
              </p>
              <p>
                IFSC: <span className="font-mono font-semibold text-slate-800">{companyProfile?.ifscCode || "HDFC0000123"}</span>
                {companyProfile?.branchName && ` · Branch: ${companyProfile.branchName}`}
              </p>
              <p className="text-slate-400 text-[10px] mt-1">
                Please quote quotation number in RTGS / NEFT transfer remarks
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Workflow Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Quotation ID: #{quotation.quotationId}</span>
          </div>

          <div className="flex items-center gap-2">
            {onCreateRevision && (
              <button
                type="button"
                onClick={onCreateRevision}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw size={13} />
                <span>Create Revision (+R)</span>
              </button>
            )}

            {onRequestApproval && (
              <button
                type="button"
                onClick={onRequestApproval}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
              >
                <CheckCircle size={13} />
                <span>Approval Workflow</span>
              </button>
            )}

            {onConvertToOrder && (
              <button
                type="button"
                onClick={onConvertToOrder}
                disabled={isConvertingToOrder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60"
              >
                <ShoppingCart size={13} />
                <span>
                  {isConvertingToOrder ? "Converting..." : "Convert to Sales Order"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewModal;
