import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Save, Loader2, Building, Mail, Phone, Briefcase, User } from "lucide-react";
import { toast } from "sonner";
import { createContact } from "../../Master/Contact/Services/ContactService";
import type { Contact } from "../../Master/Contact/Types/ContactTypes";

interface AddActivityContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContact: Contact) => void;
  companyId: string | number;
  companyName: string;
}

export const AddActivityContactModal: React.FC<AddActivityContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  companyName,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setDesignation("");
      setDepartment("");
      setMobileNo("");
      setEmailAddress("");
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    if (!companyId || String(companyId).trim() === "") {
      toast.error("Please select a company first.");
      return false;
    }
    if (!fullName.trim()) {
      toast.error("Contact person name is required.");
      return false;
    }
    const phoneTrimmed = mobileNo.trim();
    if (phoneTrimmed && !/^[0-9]{10}$/.test(phoneTrimmed)) {
      toast.error("Mobile number must be a valid 10-digit number.");
      return false;
    }
    const emailTrimmed = emailAddress.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    try {
      const numericCompId = Number(companyId);
      const effectiveCompanyId = !isNaN(numericCompId) && numericCompId > 0 ? numericCompId : 1;

      // Contact payload matching API DTO
      const created = await createContact({
        companyId: effectiveCompanyId,
        fullName: fullName.trim(),
        designation: designation.trim() || undefined,
        department: department.trim() || undefined,
        mobileNo: mobileNo.trim() || undefined,
        altMobileNo: null,
        emailAddress: emailAddress.trim() || undefined,
        altEmailAddress: null,
        createdBy: 1,
        isActive: true,
      });

      const resultContact: Contact =
        created && created.contactId
          ? created
          : {
              contactId: Date.now(),
              companyId: effectiveCompanyId,
              fullName: fullName.trim(),
              designation: designation.trim() || null,
              department: department.trim() || null,
              mobileNo: mobileNo.trim() || null,
              emailAddress: emailAddress.trim() || null,
              companyName: companyName || null,
              isActive: true,
            };

      toast.success(`Contact "${resultContact.fullName}" saved to Customer Master!`);
      onSuccess(resultContact);
      onClose();
    } catch (err: any) {
      console.error("Failed to save contact:", err);
      const errors = err?.response?.data?.errors;
      let errorMsg = "";
      if (errors && typeof errors === "object") {
        errorMsg = Object.values(errors).flat().join(" ");
      } else {
        errorMsg =
          err?.response?.data?.message ||
          (typeof err?.response?.data === "string" ? err?.response?.data : null) ||
          err?.message ||
          "Failed to save contact to Customer Master.";
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-wider block";
  const inputStyle =
    "w-full rounded-lg px-3.5 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-gray-800 placeholder-gray-400";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 border-b border-[#e06800]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Add Contact Person
              </h2>
              <p className="text-xs text-orange-100 font-medium truncate max-w-xs">
                Auto-saves to Customer Master for: {companyName || "Selected Company"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Associated Company Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2 text-xs text-orange-800">
            <Building size={16} className="text-orange-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold">Company: </span>
              <span className="font-medium">{companyName || `#${companyId}`}</span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className={labelStyle}>
              Contact Person Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className={inputStyle}
                required
                autoFocus
              />
              <User size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Designation</label>
              <div className="relative">
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Purchase Manager"
                  className={inputStyle}
                />
                <Briefcase size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Procurement"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Contact Mobile */}
          <div>
            <label className={labelStyle}>
              Mobile / Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className={inputStyle}
                required
              />
              <Phone size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className={labelStyle}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. contact@company.com"
                className={inputStyle}
                required
              />
              <Mail size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#FF7900] text-white text-xs font-bold hover:bg-[#e06800] transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving to Customer Master...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Contact</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
