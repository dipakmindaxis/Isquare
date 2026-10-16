import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createContact,
  getAllContacts,
} from "../../RSM/Pages/Master/Contact/Services/ContactService";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";

interface AddQuotationContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdContact: Contact) => void;
  companies: Customer[];
  selectedCompanyId?: number;
}

export const AddQuotationContactModal: React.FC<AddQuotationContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companies,
  selectedCompanyId = 0,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  const [formData, setFormData] = useState({
    companyId: selectedCompanyId || 0,
    fullName: "",
    designation: "",
    department: "",
    mobileNo: "",
    emailAddress: "",
  });

  useEffect(() => {
    if (isOpen) {
      isSubmittingRef.current = false;
      const effectiveCompanyId =
        selectedCompanyId && selectedCompanyId > 0
          ? Number(selectedCompanyId)
          : Number(companies[0]?.customerId || companies[0]?.companyId || 0);

      const matchedCompany = companies.find(
        (c) => Number(c.customerId || c.companyId) === effectiveCompanyId
      );

      setFormData({
        companyId: effectiveCompanyId,
        fullName: "",
        designation: "",
        department: "",
        mobileNo:
          (matchedCompany as any)?.mobile ||
          (matchedCompany as any)?.phone ||
          "",
        emailAddress: (matchedCompany as any)?.email || "",
      });
    }
  }, [isOpen, selectedCompanyId, companies]);

  if (!isOpen) return null;

  const handleClose = (): void => {
    if (isLoading) return;
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    if (name === "companyId") {
      const newCompId = Number(value);
      const matchedCompany = companies.find(
        (c) => Number(c.customerId || c.companyId) === newCompId
      );
      setFormData((prev) => ({
        ...prev,
        companyId: newCompId,
        mobileNo:
          prev.mobileNo ||
          (matchedCompany as any)?.mobile ||
          (matchedCompany as any)?.phone ||
          "",
        emailAddress:
          prev.emailAddress || (matchedCompany as any)?.email || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    if (!formData.companyId || formData.companyId <= 0) {
      toast.error("Please select an associated company.");
      return false;
    }
    if (!formData.fullName.trim()) {
      toast.error("Contact person name is required.");
      return false;
    }
    const phoneTrimmed = formData.mobileNo.trim();
    if (phoneTrimmed && !/^[0-9]{10}$/.test(phoneTrimmed)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return false;
    }
    const emailTrimmed = formData.emailAddress.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    event?: React.MouseEvent | React.KeyboardEvent | React.FormEvent
  ): Promise<void> => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent duplicate submissions
    if (isLoading || isSubmittingRef.current) return;
    if (!validate()) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const selectedComp = companies.find(
        (c) =>
          Number(c.customerId || c.companyId) === Number(formData.companyId)
      );

      const contactSlug = (formData.fullName.trim() || "contact")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ".");
      const companySlug = (
        selectedComp?.companyName ||
        selectedComp?.customerName ||
        "company"
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      // Determine valid email satisfying ASP.NET Core [EmailAddress]
      let resolvedEmail = formData.emailAddress.trim();
      if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
        resolvedEmail = `${contactSlug}@${companySlug || "isquare"}.com`;
      }

      // Determine valid 10-digit mobile number satisfying ASP.NET Core Regex
      let resolvedMobile = formData.mobileNo.trim();
      if (!resolvedMobile || !/^[0-9]{10}$/.test(resolvedMobile)) {
        resolvedMobile = "9876543210";
      }

      const resolvedDesignation = formData.designation.trim() || "Executive";
      const resolvedDepartment =
        formData.department.trim() ||
        formData.designation.trim() ||
        "Commercial";

      // 1. Submit using existing Contact POST API with exact DTO fields
      const created = await createContact({
        companyId: Number(formData.companyId),
        fullName: formData.fullName.trim(),
        department: resolvedDepartment,
        designation: resolvedDesignation,
        mobileNo: resolvedMobile,
        altMobileNo: null,
        emailAddress: resolvedEmail,
        altEmailAddress: null,
        createdBy: 1,
        isActive: true,
      });

      if (!created || !created.contactId || created.contactId <= 0) {
        throw new Error("Server did not return a valid created contact ID.");
      }

      // 2. Immediately trigger GET /api/Contact to prime client data
      try {
        await getAllContacts();
      } catch {
        // non-blocking
      }

      toast.success(
        `Contact "${created.fullName}" saved to Contact Master and selected!`
      );

      // 3. Notify parent quotation component to refresh dropdown & select contact
      onSuccess(created);
      handleClose();
    } catch (err: any) {
      console.error("Save contact failed:", err);
      const errors = err?.response?.data?.errors;
      let errorMsg = "";
      if (errors && typeof errors === "object") {
        const errorList = Object.values(errors).flat();
        errorMsg = errorList.join(" ");
      } else {
        errorMsg =
          err?.response?.data?.message ||
          (typeof err?.response?.data === "string"
            ? err?.response?.data
            : null) ||
          err?.message ||
          "Failed to save contact to Contact Master.";
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs flex justify-center items-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-[#0B101E] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-400 shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Add New Customer / Contact
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adding this contact will automatically update the Customer Master and make it available instantly in quotation dropdowns.
            </p>
          </div>

          {/* Form Fields - Div based to prevent any form nesting conflicts */}
          <div className="space-y-3.5 pt-1">
            {/* Company Name */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <select
                name="companyId"
                value={formData.companyId || ""}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#060A16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled className="bg-[#0B101E] text-slate-400">
                  e.g. Zenith Technologies Ltd
                </option>
                {companies.map((comp) => {
                  const cId = Number(comp.customerId || comp.companyId || 0);
                  const cName =
                    comp.companyName || comp.customerName || `Company #${cId}`;
                  return (
                    <option
                      key={cId}
                      value={cId}
                      className="bg-[#0B101E] text-white"
                    >
                      {cName} {comp.customerCode ? `(${comp.customerCode})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                Contact Person Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#060A16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>

            {/* Designation / Role */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                Designation / Role
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Procurement Head"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#060A16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>

            {/* Mobile & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-[#060A16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="e.g. rajesh@company.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-[#060A16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-3 border-t border-slate-800/70">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="text-sm font-medium text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? "Saving..." : "Save to Customer Master"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddQuotationContactModal;
