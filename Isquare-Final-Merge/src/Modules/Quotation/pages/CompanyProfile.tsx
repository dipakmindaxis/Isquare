import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Building2 } from "lucide-react";
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
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Company Profile Master
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                Corporate Identity
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Corporate identity, GSTIN, legal name, registered premises, and bank remittance accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Company Information
        </h2>

        <button
          type="button"
          onClick={loadProfile}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
          title="Reload profile"
        >
          <RefreshCw size={14} className="text-[#FF7900]" />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400 font-medium bg-white rounded-2xl border border-gray-200 shadow-xs">
          Loading company profile details from API...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Company Identity */}
          <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                Corporate Entity
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7900]">
                Corporate Legal Entity Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Company Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. ISQUARE Technologies"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Full Registered Legal Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. ISQUARE Technologies Private Limited"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  GSTIN Registration Number
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Corporate PAN
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="e.g. AAAAA0000A"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Registered Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, industrial area, plot number"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Commercial Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Remittance Details */}
          <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                Bank Details
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7900]">
                Bank Remittance Details (Printed on Quotation Documents)
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs cursor-pointer"
                >
                  <option value="Current Account">Current Account</option>
                  <option value="Cash Credit Account">Cash Credit Account</option>
                  <option value="Escrow Account">Escrow Account</option>
                </select>
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

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
              <span>{isSaving ? "Saving Profile..." : "Save Company Profile"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyProfile;

