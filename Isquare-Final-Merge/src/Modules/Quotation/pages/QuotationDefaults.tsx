import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Sliders } from "lucide-react";
import { toast } from "sonner";
import {
  quotationDefaultService,
  masterDataService,
} from "../services/quotationService";
import type { QuotationDefault } from "../models/quotationModels";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";

export const QuotationDefaults: React.FC = () => {
  const [defaults, setDefaults] = useState<QuotationDefault | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [defaultDeliveryPeriod, setDefaultDeliveryPeriod] = useState<string>("2-3 Weeks");
  const [paymentTermId, setPaymentTermId] = useState<number | null>(null);
  const [standardWarranty, setStandardWarranty] = useState<string>("1 Year Standard");
  const [quotationValidity, setQuotationValidity] = useState<string>("30 Days");
  const [standardTermsAndConditions, setStandardTermsAndConditions] = useState<string>(
    "1. Taxes extra as applicable.\n2. Prices firm for validity period.\n3. Goods once sold will not be taken back.\n4. Subject to Pune Jurisdiction."
  );
  const [companyName, setCompanyName] = useState<string>("ISQUARE Technologies");
  const [gstNumber, setGstNumber] = useState<string>("27AAAAA0000A1Z5");
  const [companyAddress, setCompanyAddress] = useState<string>(
    "Plot 14, Electronic Zone, MIDC, Mahape, Navi Mumbai"
  );
  const [bankName, setBankName] = useState<string>("HDFC Bank Ltd");
  const [accountNumber, setAccountNumber] = useState<string>("50200012345678");
  const [ifscCode, setIfscCode] = useState<string>("HDFC0000123");
  const [accountHolderName, setAccountHolderName] = useState<string>("ISQUARE Technologies Pvt Ltd");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [defaultsData, terms] = await Promise.all([
        quotationDefaultService.getDefault(),
        masterDataService.getPaymentTerms(),
      ]);

      setPaymentTerms(terms);

      if (defaultsData) {
        setDefaults(defaultsData);
        if (defaultsData.defaultDeliveryPeriod) setDefaultDeliveryPeriod(defaultsData.defaultDeliveryPeriod);
        if (defaultsData.paymentTermId) setPaymentTermId(defaultsData.paymentTermId);
        if (defaultsData.standardWarranty) setStandardWarranty(defaultsData.standardWarranty);
        if (defaultsData.quotationValidity) setQuotationValidity(defaultsData.quotationValidity);
        if (defaultsData.standardTermsAndConditions) setStandardTermsAndConditions(defaultsData.standardTermsAndConditions);
        if (defaultsData.companyName) setCompanyName(defaultsData.companyName);
        if (defaultsData.gstNumber) setGstNumber(defaultsData.gstNumber);
        if (defaultsData.companyAddress) setCompanyAddress(defaultsData.companyAddress);
        if (defaultsData.bankName) setBankName(defaultsData.bankName);
        if (defaultsData.accountNumber) setAccountNumber(defaultsData.accountNumber);
        if (defaultsData.ifscCode) setIfscCode(defaultsData.ifscCode);
        if (defaultsData.accountHolderName) setAccountHolderName(defaultsData.accountHolderName);
      } else if (terms.length > 0) {
        setPaymentTermId(terms[0].paymentTermId);
      }
    } catch (e) {
      console.error("Failed to load quotation defaults:", e);
      toast.error("Failed to fetch quotation defaults from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<QuotationDefault> = {
        defaultDeliveryPeriod,
        paymentTermId: paymentTermId || null,
        standardWarranty,
        quotationValidity,
        standardTermsAndConditions,
        companyName,
        gstNumber,
        companyAddress,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        isActive: true,
        isDeleted: false,
      };

      if (defaults && defaults.quotationDefaultId > 0) {
        await quotationDefaultService.update(defaults.quotationDefaultId, {
          ...payload,
          quotationDefaultId: defaults.quotationDefaultId,
        });
        toast.success("Quotation defaults updated successfully");
      } else {
        const created = await quotationDefaultService.create(payload);
        setDefaults(created);
        toast.success("Quotation defaults saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save quotation defaults to database");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Sliders size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Quotation Defaults
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                System Configuration
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Global commercial defaults applied automatically when new proposals are created.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Proposal Defaults
        </h2>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
          title="Reload defaults"
        >
          <RefreshCw size={14} className="text-[#FF7900]" />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400 font-medium bg-white rounded-2xl border border-gray-200 shadow-xs">
          Loading default configuration from API...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Commercial Defaults Section */}
          <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                Section 1
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7900]">
                Standard Delivery &amp; Commercial Terms
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Default Delivery Period <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={defaultDeliveryPeriod}
                  onChange={(e) => setDefaultDeliveryPeriod(e.target.value)}
                  placeholder="e.g. 2-3 Weeks"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Default Payment Term
                </label>
                <select
                  value={paymentTermId || ""}
                  onChange={(e) => setPaymentTermId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs cursor-pointer"
                >
                  <option value="">Select Payment Term...</option>
                  {paymentTerms.map((pt) => (
                    <option key={pt.paymentTermId} value={pt.paymentTermId}>
                      {pt.paymentTermName} ({pt.paymentTermCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Standard Warranty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={standardWarranty}
                  onChange={(e) => setStandardWarranty(e.target.value)}
                  placeholder="e.g. 1 Year Standard"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Quotation Validity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quotationValidity}
                  onChange={(e) => setQuotationValidity(e.target.value)}
                  placeholder="e.g. 30 Days"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Standard Terms &amp; Conditions
              </label>
              <textarea
                rows={4}
                value={standardTermsAndConditions}
                onChange={(e) => setStandardTermsAndConditions(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-xs font-mono text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
              />
            </div>
          </div>

          {/* Company & Bank Defaults Section */}
          <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                Section 2
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7900]">
                Default Company Identification &amp; Bank Remittance
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Company Address
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? "Saving Defaults..." : "Save Quotation Defaults"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuotationDefaults;

