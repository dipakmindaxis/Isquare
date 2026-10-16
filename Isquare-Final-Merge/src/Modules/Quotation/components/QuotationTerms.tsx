import React from "react";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";
import { FileText, RefreshCw } from "lucide-react";

interface QuotationTermsProps {
  deliveryPeriod?: string | null;
  paymentTermId?: number | null;
  paymentTermsList: PaymentTerm[];
  warranty?: string | null;
  validity?: string | null;
  validUntil?: string | null;
  termsAndConditions?: string | null;
  onLoadDefaults?: () => void;
  onChange: (fields: {
    deliveryPeriod?: string;
    paymentTermId?: number;
    warranty?: string;
    validity?: string;
    validUntil?: string;
    termsAndConditions?: string;
  }) => void;
  disabled?: boolean;
}

export const QuotationTerms: React.FC<QuotationTermsProps> = ({
  deliveryPeriod = "2-3 Weeks",
  paymentTermId,
  paymentTermsList = [],
  validity = "30 Days",
  validUntil,
  termsAndConditions = "",
  onLoadDefaults,
  onChange,
  disabled = false,
}) => {
  const formattedValidUntil = validUntil
    ? validUntil.substring(0, 10)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  return (
    <div className="space-y-6">
      {/* Delivery & Commercial Terms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">
              Delivery &amp; Commercial Terms
            </h4>
            <p className="text-xs text-gray-500">
              Commercial conditions, payment schedule and proposal validity
            </p>
          </div>

          {onLoadDefaults && !disabled && (
            <button
              type="button"
              onClick={onLoadDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
              title="Reset fields to standard company defaults"
            >
              <RefreshCw size={12} />
              <span>Load Company Defaults</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Delivery Period */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Delivery Period
            </label>
            <input
              type="text"
              placeholder="e.g. 2-3 Weeks from PO"
              value={deliveryPeriod || ""}
              onChange={(e) => onChange({ deliveryPeriod: e.target.value })}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            />
          </div>

          {/* Payment Terms from Master */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Payment Terms
            </label>
            <select
              value={paymentTermId || ""}
              onChange={(e) =>
                onChange({
                  paymentTermId: parseInt(e.target.value, 10) || undefined,
                })
              }
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            >
              <option value="">Select Payment Term...</option>
              {paymentTermsList.map((pt) => (
                <option key={pt.paymentTermId} value={pt.paymentTermId}>
                  {pt.paymentTermName} ({pt.paymentTermCode || `PT-${pt.paymentTermId}`})
                </option>
              ))}
            </select>
          </div>

          {/* Quotation Validity & Valid Until */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Valid Until Date
            </label>
            <input
              type="date"
              value={formattedValidUntil}
              onChange={(e) =>
                onChange({
                  validUntil: new Date(e.target.value).toISOString(),
                  validity: `${Math.max(
                    0,
                    Math.ceil(
                      (new Date(e.target.value).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )} Days`,
                })
              }
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">Calculated validity: {validity || "30 Days"}</p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions (Section 5) */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-[#00234a]" />
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
            Commercial Terms &amp; Conditions
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Legally binding commercial conditions included in the generated quotation document
        </p>

        <textarea
          rows={5}
          value={termsAndConditions || ""}
          onChange={(e) => onChange({ termsAndConditions: e.target.value })}
          disabled={disabled}
          placeholder="1. Taxes extra as applicable.\n2. Prices firm for validity period.\n3. Goods once sold will not be returned.\n4. Subject to Mumbai Jurisdiction."
          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm font-mono text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
        />
      </div>
    </div>
  );
};

export default QuotationTerms;
