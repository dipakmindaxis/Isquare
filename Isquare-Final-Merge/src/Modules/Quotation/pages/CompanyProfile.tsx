import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Building2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { companyProfileService } from "../services/quotationService";
import type { CompanyProfile as CompanyProfileType } from "../models/quotationModels";

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [companyName, setCompanyName] = useState<string>("ISQUARE Technologies");
  const [legalName, setLegalName] = useState<string>("ISQUARE Technologies Private Limited");
  const [gstin, setGstin] = useState<string>("27AAAAA0000A1Z5");
  const [pan, setPan] = useState<string>("AAAAA0000A");
  const [address, setAddress] = useState<string>("Plot 14, Electronic Zone, MIDC");
  const [city, setCity] = useState<string>("Navi Mumbai");
  const [state, setState] = useState<string>("Maharashtra");
  const [pinCode, setPinCode] = useState<string>("400710");
  const [country, setCountry] = useState<string>("India");
  const [email, setEmail] = useState<string>("sales@isquare.com");
  const [phone, setPhone] = useState<string>("+91 98201 44521");
  const [website, setWebsite] = useState<string>("https://isquare.com");
  const [bankName, setBankName] = useState<string>("HDFC Bank Ltd");
  const [accountHolderName, setAccountHolderName] = useState<string>("ISQUARE Technologies Pvt Ltd");
  const [accountNumber, setAccountNumber] = useState<string>("50200012345678");
  const [ifscCode, setIfscCode] = useState<string>("HDFC0000123");
  const [branchName, setBranchName] = useState<string>("Mahape Industrial Branch");
  const [accountType, setAccountType] = useState<string>("Current Account");

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await companyProfileService.getDefaultProfile();
      if (data) {
        setProfile(data);
        setCompanyName(data.companyName || "");
        if (data.legalName) setLegalName(data.legalName);
        if (data.gstin) setGstin(data.gstin);
        if (data.pan) setPan(data.pan);
        if (data.address) setAddress(data.address);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        if (data.pinCode) setPinCode(data.pinCode);
        if (data.country) setCountry(data.country);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.website) setWebsite(data.website);
        if (data.bankName) setBankName(data.bankName);
        if (data.accountHolderName) setAccountHolderName(data.accountHolderName);
        if (data.accountNumber) setAccountNumber(data.accountNumber);
        if (data.ifscCode) setIfscCode(data.ifscCode);
        if (data.branchName) setBranchName(data.branchName);
        if (data.accountType) setAccountType(data.accountType);
      }
    } catch (e) {
      console.error("Failed to load company profile:", e);
      toast.error("Failed to fetch company profile from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<CompanyProfileType> = {
        companyName,
        legalName,
        gstin,
        pan,
        address,
        city,
        state,
        pinCode,
        country,
        email,
        phone,
        website,
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        branchName,
        accountType,
        isDefault: true,
        isActive: true,
        isDeleted: false,
      };

      if (profile && profile.companyProfileId > 0) {
        await companyProfileService.update(profile.companyProfileId, {
          ...payload,
          companyProfileId: profile.companyProfileId,
        });
        toast.success("Company profile updated successfully");
      } else {
        const created = await companyProfileService.create(payload);
        setProfile(created);
        toast.success("Company profile created successfully");
      }
    } catch (err) {
      toast.error("Failed to save company profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Company Profile Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Corporate identity, GSTIN, legal name, registered premises, and bank remittance accounts
          </p>
        </div>

        <button
          type="button"
          onClick={loadProfile}
          className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
          title="Reload profile"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Loading company profile details from API...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-5 [&_input]:min-h-11 [&_input]:rounded-lg [&_input]:border-gray-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:border-[#00234a] [&_input]:focus:ring-[#00234a]/15 [&_select]:min-h-11 [&_select]:rounded-lg [&_select]:border-gray-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:focus:border-[#00234a] [&_select]:focus:ring-[#00234a]/15 [&_textarea]:rounded-lg [&_textarea]:border-gray-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:focus:border-[#00234a] [&_textarea]:focus:ring-[#00234a]/15"
        >
        {/* Basic Company Identity */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="-mx-5 -mt-5 flex items-center gap-2 rounded-t-xl border-b border-[#163f65] bg-[#154068] px-5 py-3 text-white sm:-mx-6 sm:-mt-6 sm:px-6">
            <Building2 size={16} className="text-white" />
            <h3 className="text-sm font-bold text-white">
              Corporate Legal Entity Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Company Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ISQUARE Technologies"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Full Registered Legal Name
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. ISQUARE Technologies Private Limited"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                GSTIN Registration Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Corporate PAN
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="e.g. AAAAA0000A"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Registered Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, industrial area, plot number"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Commercial Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Remittance Details */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="-mx-5 -mt-5 flex items-center gap-2 rounded-t-xl border-b border-[#163f65] bg-[#154068] px-5 py-3 text-white sm:-mx-6 sm:-mt-6 sm:px-6">
            <CreditCard size={16} className="text-white" />
            <h3 className="text-sm font-bold text-white">
              Bank Remittance Details (Printed on Quotation PDFs)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              >
                <option value="Current Account">Current Account</option>
                <option value="Cash Credit Account">Cash Credit Account</option>
                <option value="Escrow Account">Escrow Account</option>
              </select>
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
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
            <span>{isSaving ? "Saving..." : "Save Company Profile"}</span>
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default CompanyProfile;
