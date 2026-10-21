import React, { useState } from "react";
import {
  Printer,
  FileText,
  Package,
  CheckCircle,
  RefreshCw,
  ShoppingCart,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import type { Quotation, CompanyProfile } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR, calculateItemTotals } from "../utils/quotationCalculations";
import { exportQuotationToPdf } from "../utils/quotationExportPdf";
import { exportQuotationToCustomerExcel } from "../utils/quotationExportExcel";
import {
  isCustomerFormatQuotation,
  getCustomerQuotationFile,
  downloadOriginalCustomerQuotation,
} from "../utils/customerQuotationStorage";

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
  const [showDiscount, setShowDiscount] = useState<boolean>(true);

  if (!isOpen) return null;

  const isUploadedCustomerFormat = isCustomerFormatQuotation(
    quotation.quotationId,
    quotation
  );
  const uploadedFileRecord = getCustomerQuotationFile(quotation.quotationId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    try {
      if (isUploadedCustomerFormat) {
        const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
        if (ok) {
          toast.success("Downloaded original customer quotation file");
          return;
        }
      }
      exportQuotationToPdf(quotation, companyProfile, customer, showDiscount);
      toast.success("PDF exported successfully");
    } catch (e) {
      console.error("PDF export failed:", e);
      toast.error("Failed to generate PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      if (isUploadedCustomerFormat) {
        const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
        if (ok) {
          toast.success("Downloaded original customer quotation file");
          return;
        }
      }
      exportQuotationToCustomerExcel(quotation, showDiscount);
      toast.success("Excel exported successfully");
    } catch (e) {
      console.error("Excel export failed:", e);
      toast.error("Failed to generate Excel file");
    }
  };

  // Extract contact person display
  const contactDisplay =
    quotation.contactPerson ||
    (customer as any)?.contactPerson ||
    (customer as any)?.contactPersonName ||
    null;

  // Commercial & freight terms formatting
  const freightType = (quotation as any).freightType;
  const freightDisplay =
    freightType && freightType !== "Custom value"
      ? freightType
      : quotation.freightCharges > 0
      ? formatINR(quotation.freightCharges)
      : "Inclusive";

  const installationType = (quotation as any).installationType;
  const installationDisplay =
    installationType && installationType !== "Custom value"
      ? installationType
      : quotation.installationCharges > 0
      ? formatINR(quotation.installationCharges)
      : "At your scope";

  const otherDesc =
    (quotation as any).otherChargesDescription || "Standard Packaging & Handling";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-8 flex flex-col max-h-[92vh] overflow-hidden print:shadow-none print:border-none print:my-0 print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        {/* Top Action Bar */}
        <div className="p-3.5 sm:px-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-blue-400 shrink-0" />
            <h3 className="font-bold text-sm tracking-tight text-white">
              Customer-Facing Quotation Format
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Show/Hide Discount Column Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-200 hover:text-white select-none bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 transition">
              <input
                type="checkbox"
                checked={showDiscount}
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Show Discount Column</span>
            </label>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer"
              title="Export quotation to Excel (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow transition cursor-pointer"
              title="Export quotation to PDF (.pdf)"
            >
              <Download size={14} />
              <span>Export to PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
              title="Print quotation document"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white shadow transition cursor-pointer"
            >
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Customer-Facing Quotation Sheet Body */}
        <div
          id="printableDocument"
          className="p-8 sm:p-10 overflow-y-auto space-y-6 flex-1 text-xs text-gray-800 bg-white"
        >
          {/* Preserved Customer Quotation Banner if uploaded format */}
          {isUploadedCustomerFormat && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 print:hidden">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">
                    Customer-Formatted Quotation Document
                  </p>
                  <p className="text-[11px] text-amber-700">
                    File: {uploadedFileRecord?.fileName || "Original Customer Quotation.xlsx"} (Original customer format preserved)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
                  if (ok) toast.success("Downloaded original file");
                  else toast.error("Original file could not be retrieved");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Download size={13} />
                <span>Download Original Customer File</span>
              </button>
            </div>
          )}

          {/* Header Section: Company Branding & Quotation Metadata */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                {companyProfile?.companyName || "ISQUARE CRM"}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Sales &amp; Commercial Quotation Proposal
              </p>
              {companyProfile?.gstin && (
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  GSTIN:{" "}
                  <span className="font-mono text-slate-600">
                    {companyProfile.gstin}
                  </span>
                  {companyProfile.pan && (
                    <span>
                      {" "}
                      | PAN:{" "}
                      <span className="font-mono text-slate-600">
                        {companyProfile.pan}
                      </span>
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="text-right">
              <h2 className="text-base sm:text-lg font-bold text-blue-600 font-mono">
                {quotation.quotationNumber ||
                  `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Date:{" "}
                {quotation.quotationDate
                  ? new Date(quotation.quotationDate)
                      .toISOString()
                      .substring(0, 10)
                  : new Date().toISOString().substring(0, 10)}
              </p>
              <p className="text-xs text-slate-500">
                Enquiry Ref: {quotation.enquiryRef || "FNQ-2026-100"}
              </p>
              {quotation.validUntil && (
                <p className="text-xs text-slate-500">
                  Valid Until:{" "}
                  {new Date(quotation.validUntil).toISOString().substring(0, 10)}
                </p>
              )}
            </div>
          </div>

          {/* Customer / Bill To & Commercial / Freight Terms Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                CUSTOMER / BILL TO:
              </p>
              <h4 className="font-bold text-sm text-slate-900">
                {quotation.customerName ||
                  customer?.customerName ||
                  customer?.companyName ||
                  "Global Tech Solutions"}
              </h4>
              {contactDisplay && (
                <p className="text-xs text-slate-600 mt-0.5">
                  Attn: {contactDisplay}
                </p>
              )}
              {(customer as any)?.email && (
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {(customer as any).email}{" "}
                  {(customer as any).phone
                    ? `· ${(customer as any).phone}`
                    : ""}
                </p>
              )}
              {customer?.gstin && (
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  GSTIN: {customer.gstin}
                </p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                COMMERCIAL &amp; FREIGHT TERMS:
              </p>
              <p className="text-xs text-slate-700">
                Freight:{" "}
                <span className="font-semibold text-slate-900">
                  {freightDisplay}
                </span>
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                Installation:{" "}
                <span className="font-semibold text-slate-900">
                  {installationDisplay}
                </span>
              </p>
              {quotation.otherCharges > 0 && (
                <p className="text-xs text-slate-700 mt-0.5">
                  {otherDesc}:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatINR(quotation.otherCharges)}
                  </span>
                </p>
              )}
              {quotation.deliveryPeriod && (
                <p className="text-xs text-slate-500 mt-1">
                  Delivery Period: {quotation.deliveryPeriod}
                </p>
              )}
            </div>
          </div>

          {/* 9-Column Customer-Facing Product Table (Item Codes Hidden) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3 text-left">
                    PRODUCT NAME &amp; SPECIFICATION
                  </th>
                  <th className="p-3 w-16 text-center">IMAGE</th>
                  <th className="p-3 w-20 text-center">HSN CODE</th>
                  <th className="p-3 w-14 text-center">QTY</th>
                  <th className="p-3 w-14 text-center">UOM</th>
                  <th className="p-3 w-24 text-right">RATE (₹)</th>
                  {showDiscount && (
                    <th className="p-3 w-20 text-center">DISCOUNT (%)</th>
                  )}
                  <th className="p-3 w-16 text-center">GST (%)</th>
                  <th className="p-3 w-28 text-right">TOTAL (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(quotation.items || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={showDiscount ? 9 : 8}
                      className="p-8 text-center text-slate-400"
                    >
                      No products added to this quotation.
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
                    const itemImg =
                      (item as any).imageUrl ||
                      (item as any).image ||
                      (item as any).productImage;
                    const hsnCode =
                      (item as any).hsnCode ||
                      (item as any).hsn ||
                      (item as any).hsn_code ||
                      "—";
                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50/50 transition">
                          {/* 1. Product Name & Specification */}
                          <td className="p-3.5 align-middle">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.itemName}
                              {item.brand ? ` (${item.brand})` : ""}
                            </div>
                            {item.specification && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {item.specification}
                              </div>
                            )}
                          </td>

                          {/* 2. Image Thumbnail */}
                          <td className="p-3.5 align-middle text-center">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto overflow-hidden shadow-2xs">
                              {itemImg ? (
                                <img
                                  src={itemImg}
                                  alt={item.itemName}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              ) : (
                                <Package size={16} className="text-slate-400" />
                              )}
                            </div>
                          </td>

                          {/* 3. HSN Code */}
                          <td className="p-3.5 align-middle text-center font-mono text-[11px] text-slate-600">
                            {hsnCode}
                          </td>

                          {/* 4. Qty */}
                          <td className="p-3.5 align-middle text-center font-semibold text-slate-800">
                            {item.quantity}
                          </td>

                          {/* 5. UOM */}
                          <td className="p-3.5 align-middle text-center font-medium text-slate-600">
                            {item.unitName || "Nos"}
                          </td>

                          {/* 6. Rate (₹) */}
                          <td className="p-3.5 align-middle text-right font-medium text-slate-800">
                            {formatINR(item.rate)}
                          </td>

                          {/* 7. Discount (%) (Conditionally displayed) */}
                          {showDiscount && (
                            <td className="p-3.5 align-middle text-center text-slate-600">
                              {item.discountPercentage}%
                            </td>
                          )}

                          {/* 8. GST (%) */}
                          <td className="p-3.5 align-middle text-center font-bold text-blue-600">
                            {item.gstRate}%
                          </td>

                          {/* 9. Total (₹) */}
                          <td className="p-3.5 align-middle text-right font-bold text-slate-900">
                            {formatINR(calc.lineTotal)}
                          </td>
                        </tr>

                        {/* Accessories linked to parent */}
                        {item.accessories &&
                          item.accessories.map((acc, aIdx) => {
                            const aCalc = calculateItemTotals(
                              acc.quantity,
                              acc.rate,
                              acc.discountPercentage,
                              acc.gstRate
                            );
                            const accImg =
                              (acc as any).imageUrl || (acc as any).image;
                            const accHsn =
                              (acc as any).hsnCode ||
                              (acc as any).hsn ||
                              (acc as any).hsn_code ||
                              "—";
                            return (
                              <tr
                                key={`acc-${aIdx}`}
                                className="bg-slate-50/40 text-[11px]"
                              >
                                {/* 1. Product Name & Specification */}
                                <td className="p-2.5 pl-6 align-middle">
                                  <span className="font-semibold text-slate-800">
                                    ↳ [Accessory] {acc.itemName}
                                  </span>
                                  {acc.specification && (
                                    <div className="text-slate-500 text-[10px] mt-0.5">
                                      {acc.specification}
                                    </div>
                                  )}
                                </td>

                                {/* 2. Image Thumbnail */}
                                <td className="p-2.5 align-middle text-center">
                                  <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                                    {accImg ? (
                                      <img
                                        src={accImg}
                                        alt={acc.itemName}
                                        className="w-full h-full object-contain p-0.5"
                                      />
                                    ) : (
                                      <Package
                                        size={12}
                                        className="text-slate-400"
                                      />
                                    )}
                                  </div>
                                </td>

                                {/* 3. HSN Code */}
                                <td className="p-2.5 align-middle text-center font-mono text-[10px] text-slate-600">
                                  {accHsn}
                                </td>

                                {/* 4. Qty */}
                                <td className="p-2.5 align-middle text-center font-semibold text-slate-800">
                                  {acc.quantity}
                                </td>

                                {/* 5. UOM */}
                                <td className="p-2.5 align-middle text-center font-medium text-slate-600">
                                  {acc.unitName || "Nos"}
                                </td>

                                {/* 6. Rate (₹) */}
                                <td className="p-2.5 align-middle text-right font-medium text-slate-800">
                                  {formatINR(acc.rate)}
                                </td>

                                {/* 7. Discount (%) */}
                                {showDiscount && (
                                  <td className="p-2.5 align-middle text-center text-slate-600">
                                    {acc.discountPercentage}%
                                  </td>
                                )}

                                {/* 8. GST (%) */}
                                <td className="p-2.5 align-middle text-center font-bold text-blue-600">
                                  {acc.gstRate}%
                                </td>

                                {/* 9. Total (₹) */}
                                <td className="p-2.5 align-middle text-right font-bold text-slate-800">
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

          {/* Pricing Totals Summary Box */}
          <div className="flex justify-end pt-1">
            <div className="w-80 rounded-xl border border-slate-200 bg-white p-4.5 space-y-2 text-xs shadow-2xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">
                  {formatINR(quotation.taxableAmount || quotation.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST:</span>
                <span className="font-mono font-medium">
                  {formatINR(quotation.taxAmount)}
                </span>
              </div>
              {quotation.freightCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Freight Charges:</span>
                  <span className="font-mono font-medium">
                    {formatINR(quotation.freightCharges)}
                  </span>
                </div>
              )}
              {quotation.installationCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Installation Charges:</span>
                  <span className="font-mono font-medium">
                    {formatINR(quotation.installationCharges)}
                  </span>
                </div>
              )}
              {quotation.otherCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{otherDesc}:</span>
                  <span className="font-mono font-medium">
                    {formatINR(quotation.otherCharges)}
                  </span>
                </div>
              )}
              {(quotation.charges || []).map((ch, cIdx) => (
                <div key={cIdx} className="flex justify-between text-slate-600">
                  <span>{ch.chargeName}:</span>
                  <span className="font-mono font-medium">
                    {formatINR(ch.totalAmount || ch.chargeAmount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2.5">
                <span>Grand Total:</span>
                <span className="text-blue-600 font-extrabold text-base">
                  {formatINR(quotation.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Terms & Bank Remittance Details */}
          {(quotation.termsAndConditions ||
            companyProfile?.bankName ||
            quotation.paymentTermsName) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="space-y-1 text-slate-600">
                <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                  Commercial Terms:
                </p>
                {quotation.paymentTermsName && (
                  <p>
                    <span className="font-semibold text-slate-700">
                      Payment Terms:
                    </span>{" "}
                    {quotation.paymentTermsName}
                  </p>
                )}
                {quotation.warranty && (
                  <p>
                    <span className="font-semibold text-slate-700">
                      Warranty:
                    </span>{" "}
                    {quotation.warranty}
                  </p>
                )}
                {quotation.termsAndConditions && (
                  <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1">
                    {quotation.termsAndConditions}
                  </p>
                )}
              </div>

              {companyProfile?.bankName && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                  <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    Bank Remittance Details:
                  </p>
                  <p>
                    Bank:{" "}
                    <span className="font-semibold text-slate-800">
                      {companyProfile.bankName}
                    </span>
                  </p>
                  {companyProfile.accountNumber && (
                    <p>
                      A/C No:{" "}
                      <span className="font-mono font-semibold text-slate-800">
                        {companyProfile.accountNumber}
                      </span>
                    </p>
                  )}
                  {companyProfile.ifscCode && (
                    <p>
                      IFSC:{" "}
                      <span className="font-mono font-semibold text-slate-800">
                        {companyProfile.ifscCode}
                      </span>
                      {companyProfile.branchName &&
                        ` · Branch: ${companyProfile.branchName}`}
                    </p>
                  )}
                  <p className="text-slate-400 text-[10px] mt-1">
                    Please quote quotation number in RTGS / NEFT transfer remarks
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Computer Generated Footer Note matching Screenshot 2 */}
          <p className="text-center text-[11px] text-slate-400 pt-6 border-t border-slate-100">
            This is a computer-generated quotation from ISQUARE CRM and does not
            require a physical signature.
          </p>
        </div>

        {/* Modal Footer Workflow Actions (hidden on print) */}
        {(onCreateRevision || onRequestApproval || onConvertToOrder) && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Quotation ID: #{quotation.quotationId}
              </span>
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
                    {isConvertingToOrder
                      ? "Converting..."
                      : "Convert to Sales Order"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Print / PDF Media Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printableDocument, #printableDocument * {
            visibility: visible !important;
          }
          #printableDocument {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: #0f172a !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotationPreviewModal;
