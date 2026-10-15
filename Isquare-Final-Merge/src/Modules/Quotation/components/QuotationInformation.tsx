import React from "react";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";

interface QuotationInformationProps {
  quotationNumber?: string | null;
  customerId: number;
  enquiryRef?: string | null;
  quotationDate?: string | null;
  revisionNumber: number;
  status?: string | null;
  customers: Customer[];
  onChange: (fields: {
    customerId?: number;
    enquiryRef?: string;
    quotationDate?: string;
    status?: string;
    revisionNumber?: number;
  }) => void;
  disabled?: boolean;
}

export const QuotationInformation: React.FC<QuotationInformationProps> = ({
  quotationNumber,
  customerId,
  enquiryRef = "",
  quotationDate,
  revisionNumber = 0,
  status = "Draft",
  customers,
  onChange,
  disabled = false,
}) => {
  const selectedCustomer = customers.find((c) => c.customerId === customerId);

  // Format date string for HTML date input: YYYY-MM-DD
  const formattedDate = quotationDate
    ? quotationDate.substring(0, 10)
    : new Date().toISOString().substring(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quotation Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Quotation Number
          </label>
          <input
            type="text"
            readOnly
            value={quotationNumber || "Auto-generated upon save"}
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-3 text-sm font-mono font-semibold text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Customer Name Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <select
            value={customerId || ""}
            onChange={(e) =>
              onChange({ customerId: parseInt(e.target.value, 10) || 0 })
            }
            disabled={disabled}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          >
            <option value="" disabled>
              Select Customer...
            </option>
            {customers.map((c) => (
              <option key={c.customerId} value={c.customerId}>
                {c.customerName || c.companyName || `Customer #${c.customerId}`}
              </option>
            ))}
          </select>
        </div>

        {/* Enquiry Reference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Enquiry Reference
          </label>
          <input
            type="text"
            placeholder="e.g. ENQ-2026-884"
            value={enquiryRef || ""}
            onChange={(e) => onChange({ enquiryRef: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-mono text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          />
        </div>

        {/* Quotation Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Quotation Date
          </label>
          <input
            type="date"
            value={formattedDate}
            onChange={(e) =>
              onChange({
                quotationDate: new Date(e.target.value).toISOString(),
              })
            }
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Revision Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Revision
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-bold font-mono">
              R{revisionNumber}
            </span>
            <span className="text-xs text-gray-500">
              {revisionNumber === 0 ? "Initial Proposal" : `Revision #${revisionNumber}`}
            </span>
          </div>
        </div>

        {/* Quotation Status */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status || "Draft"}
            onChange={(e) => onChange({ status: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Revised">Revised</option>
          </select>
        </div>
      </div>

      {/* Selected Customer Details Preview Banner */}
      {selectedCustomer && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-800 mr-2">Contact Person:</span>
            <span>{(selectedCustomer as any).contactPerson || "N/A"}</span>
            {(selectedCustomer as any).email && (
              <span className="ml-3 text-slate-500">| {(selectedCustomer as any).email}</span>
            )}
            {(selectedCustomer as any).phone && (
              <span className="ml-2 text-slate-500">| {(selectedCustomer as any).phone}</span>
            )}
          </div>
          <div>
            {selectedCustomer.gstin && (
              <span className="mr-3">
                <span className="font-bold text-slate-700">GSTIN:</span> {selectedCustomer.gstin}
              </span>
            )}
            {(selectedCustomer as any).city && (
              <span>
                <span className="font-bold text-slate-700">Location:</span> {(selectedCustomer as any).city}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationInformation;
