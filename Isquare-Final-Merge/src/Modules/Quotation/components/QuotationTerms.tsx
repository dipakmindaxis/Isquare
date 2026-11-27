import React from "react";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";
import { FileText, MessageSquareQuote } from "lucide-react";

interface QuotationTermsProps {
  subject?: string | null;
  greeting?: string | null;
  introduction?: string | null;
  deliveryPeriod?: string | null;
  paymentTermId?: number | null;
  paymentTermsList?: PaymentTerm[];
  warranty?: string | null;
  validity?: string | null;
  validUntil?: string | null;
  termsAndConditions?: string | null;
  onLoadDefaults?: () => void;
  onChange: (fields: {
    subject?: string;
    greeting?: string;
    introduction?: string;
    termsAndConditions?: string;
    deliveryPeriod?: string;
    paymentTermId?: number;
    warranty?: string;
    validity?: string;
    validUntil?: string;
  }) => void;
  disabled?: boolean;
}

export const QuotationTerms: React.FC<QuotationTermsProps> = ({
  subject = "Offer for PPP",
  greeting = "Dear Sir/Madam,",
  introduction = "We take pleasure in submitting our competitive offer for your requirement.",
  termsAndConditions = "",
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Proposal Letter Header: Subject (Editable), Greeting (Editable), and Introduction (Editable) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareQuote size={16} className="text-[#FF7900]" />
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
            Proposal Letter &amp; Greeting
          </h4>
        </div>

        <div className="space-y-4">
          {/* Row 1: Subject (50%) & Greeting (50%) side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subject (50% width) */}
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="Offer for PPP"
                value={subject ?? ""}
                onChange={(e) => onChange({ subject: e.target.value })}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
              />
            </div>

            {/* Greeting (50% width) */}
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Greeting
              </label>
              <input
                type="text"
                placeholder="Dear Sir/Madam,"
                value={greeting ?? ""}
                onChange={(e) => onChange({ greeting: e.target.value })}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
              />
            </div>
          </div>

          {/* Row 2: Introduction (100% full width) */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              Introduction
            </label>
            <textarea
              rows={2}
              placeholder="We take pleasure in submitting our competitive offer for your requirement."
              value={introduction ?? ""}
              onChange={(e) => onChange({ introduction: e.target.value })}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs resize-none"
            />
          </div>
        </div>
      </div>

      {/* Commercial Terms & Conditions */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[#FF7900]" />
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
            Commercial Terms &amp; Conditions
          </h4>
        </div>

        <textarea
          rows={5}
          value={termsAndConditions || ""}
          onChange={(e) => onChange({ termsAndConditions: e.target.value })}
          disabled={disabled}
          placeholder="1. Taxes extra as applicable.&#10;2. Prices firm for validity period.&#10;3. Goods once sold will not be returned.&#10;4. Subject to Pune Jurisdiction."
          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
        />
      </div>
    </div>
  );
};

export default QuotationTerms;
