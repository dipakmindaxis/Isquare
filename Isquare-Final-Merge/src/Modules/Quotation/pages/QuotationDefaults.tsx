import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
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
    "1. Taxes extra as applicable.\n2. Prices firm for validity period.\n3. Goods once sold will not be taken back.\n4. Subject to Mumbai Jurisdiction."
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
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Quotation Defaults Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Global commercial defaults applied automatically when new proposals are created
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
          title="Reload defaults"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Loading default configuration from API...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-5 [&_input]:min-h-11 [&_input]:rounded-lg [&_input]:border-gray-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:border-[#00234a] [&_input]:focus:ring-[#00234a]/15 [&_select]:min-h-11 [&_select]:rounded-lg [&_select]:border-gray-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:focus:border-[#00234a] [&_select]:focus:ring-[#00234a]/15 [&_textarea]:rounded-lg [&_textarea]:border-gray-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:focus:border-[#00234a] [&_textarea]:focus:ring-[#00234a]/15"
        >
        {/* Commercial Defaults Section */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="-mx-5 -mt-5 rounded-t-xl border-b border-[#163f65] bg-[#154068] px-5 py-3 text-sm font-bold text-white sm:-mx-6 sm:-mt-6 sm:px-6">
            Standard Delivery &amp; Commercial Terms
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Default Delivery Period <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={defaultDeliveryPeriod}
                onChange={(e) => setDefaultDeliveryPeriod(e.target.value)}
                placeholder="e.g. 2-3 Weeks"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Default Payment Term
              </label>
              <select
                value={paymentTermId || ""}
                onChange={(e) => setPaymentTermId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Standard Warranty <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={standardWarranty}
                onChange={(e) => setStandardWarranty(e.target.value)}
                placeholder="e.g. 1 Year Standard"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Quotation Validity <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quotationValidity}
                onChange={(e) => setQuotationValidity(e.target.value)}
                placeholder="e.g. 30 Days"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Standard Terms &amp; Conditions
            </label>
            <textarea
              rows={4}
              value={standardTermsAndConditions}
              onChange={(e) => setStandardTermsAndConditions(e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Company & Bank Defaults Section */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="-mx-5 -mt-5 rounded-t-xl border-b border-[#163f65] bg-[#154068] px-5 py-3 text-sm font-bold text-white sm:-mx-6 sm:-mt-6 sm:px-6">
            Default Company Identification &amp; Bank Remittance
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Company Address
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00234a] hover:bg-[#003366] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? "Saving..." : "Save Quotation Defaults"}</span>
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default QuotationDefaults;
