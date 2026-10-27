import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  UserPlus,
  Edit3,
  Building2,
  User,
  Briefcase,
  Layers,
  Phone,
  Mail,
  Loader2,
  Save,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { createContact, updateContact } from "../Services/ContactService";
import { getAllCustomers, type Customer } from "../../../Customer/Services/CustomerService";
import type { Contact, CreateContactDTO, UpdateContactDTO } from "../Types/ContactTypes";

interface AddEditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedContact?: Contact) => void;
  contact?: Contact | null;
  companies?: Customer[];
  selectedCompanyId?: number;
}

interface FormErrors {
  companyId?: string;
  fullName?: string;
  department?: string;
  designation?: string;
  mobileNo?: string;
  altMobileNo?: string;
  emailAddress?: string;
  altEmailAddress?: string;
}

export const AddEditContactModal: React.FC<AddEditContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contact = null,
  companies: initialCompanies,
  selectedCompanyId = 0,
}) => {
  const isEditMode = Boolean(contact && contact.contactId && contact.contactId > 0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companiesList, setCompaniesList] = useState<Customer[]>(initialCompanies || []);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState<boolean>(false);
  const [companySearchQuery, setCompanySearchQuery] = useState<string>("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    companyId: 0,
    fullName: "",
    department: "",
    designation: "",
    mobileNo: "",
    altMobileNo: "",
    emailAddress: "",
    altEmailAddress: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch companies if not passed in props
  useEffect(() => {
    if (isOpen) {
      if (!initialCompanies || initialCompanies.length === 0) {
        setIsFetchingCompanies(true);
        getAllCustomers()
          .then((data) => {
            setCompaniesList(Array.isArray(data) ? data : []);
          })
          .catch((err) => {
            console.warn("Failed to load companies:", err);
          })
          .finally(() => {
            setIsFetchingCompanies(false);
          });
      } else {
        setCompaniesList(initialCompanies);
      }
    }
  }, [isOpen, initialCompanies]);

  // Close company dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setCompanySearchQuery("");
      setIsCompanyDropdownOpen(false);

      if (contact) {
        setFormData({
          companyId: Number(contact.companyId) || 0,
          fullName: contact.fullName || "",
          department: contact.department || "",
          designation: contact.designation || "",
          mobileNo: contact.mobileNo || "",
          altMobileNo: contact.altMobileNo || "",
          emailAddress: contact.emailAddress || "",
          altEmailAddress: contact.altEmailAddress || "",
          isActive: contact.isActive !== undefined ? Boolean(contact.isActive) : true,
        });
      } else {
        const defaultCompanyId =
          selectedCompanyId && selectedCompanyId > 0
            ? Number(selectedCompanyId)
            : Number(companiesList[0]?.customerId || companiesList[0]?.companyId || 0);

        setFormData({
          companyId: defaultCompanyId,
          fullName: "",
          department: "",
          designation: "",
          mobileNo: "",
          altMobileNo: "",
          emailAddress: "",
          altEmailAddress: "",
          isActive: true,
        });
      }
    }
  }, [isOpen, contact, selectedCompanyId, companiesList]);

  const selectedCompany = useMemo(() => {
    return companiesList.find(
      (c) => Number(c.customerId || c.companyId) === Number(formData.companyId)
    );
  }, [companiesList, formData.companyId]);

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) return companiesList;
    const q = companySearchQuery.toLowerCase().trim();
    return companiesList.filter((c) => {
      const name = (c.companyName || c.customerName || "").toLowerCase();
      const code = (c.customerCode || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [companiesList, companySearchQuery]);

  if (!isOpen) return null;

  const handleClose = (): void => {
    if (isLoading) return;
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectCompany = (comp: Customer) => {
    const compId = Number(comp.customerId || comp.companyId);
    setFormData((prev) => ({
      ...prev,
      companyId: compId,
    }));
    setIsCompanyDropdownOpen(false);
    setCompanySearchQuery("");
    if (errors.companyId) {
      setErrors((prev) => ({ ...prev, companyId: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyId || formData.companyId <= 0) {
      newErrors.companyId = "Please select a company";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    const phoneTrimmed = formData.mobileNo.trim();
    if (!phoneTrimmed) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(phoneTrimmed)) {
      newErrors.mobileNo = "Mobile number must be exactly 10 digits";
    }

    const altPhoneTrimmed = formData.altMobileNo.trim();
    if (altPhoneTrimmed && !/^[0-9]{10}$/.test(altPhoneTrimmed)) {
      newErrors.altMobileNo = "Alternate mobile must be exactly 10 digits";
    }

    const emailTrimmed = formData.emailAddress.trim();
    if (!emailTrimmed) {
      newErrors.emailAddress = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    const altEmailTrimmed = formData.altEmailAddress.trim();
    if (altEmailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(altEmailTrimmed)) {
      newErrors.altEmailAddress = "Please enter a valid alternate email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && contact) {
        const updatePayload: UpdateContactDTO = {
          contactId: contact.contactId,
          companyId: Number(formData.companyId),
          fullName: formData.fullName.trim(),
          department: formData.department.trim(),
          designation: formData.designation.trim(),
          mobileNo: formData.mobileNo.trim(),
          altMobileNo: formData.altMobileNo.trim() || null,
          emailAddress: formData.emailAddress.trim(),
          altEmailAddress: formData.altEmailAddress.trim() || null,
          isActive: formData.isActive,
          updatedBy: 1,
        };

        const updated = await updateContact(contact.contactId, updatePayload);
        toast.success(`Contact "${formData.fullName}" updated successfully!`);
        onSuccess(updated);
        handleClose();
      } else {
        const createPayload: CreateContactDTO = {
          companyId: Number(formData.companyId),
          fullName: formData.fullName.trim(),
          department: formData.department.trim(),
          designation: formData.designation.trim(),
          mobileNo: formData.mobileNo.trim(),
          altMobileNo: formData.altMobileNo.trim() || null,
          emailAddress: formData.emailAddress.trim(),
          altEmailAddress: formData.altEmailAddress.trim() || null,
          isActive: formData.isActive,
          createdBy: 1,
        };

        const created = await createContact(createPayload);
        toast.success(`Contact "${formData.fullName}" created successfully!`);
        onSuccess(created);
        handleClose();
      }
    } catch (err: any) {
      console.error("Save contact failed:", err);
      const errorsObj = err?.response?.data?.errors;
      let errorMsg = "";
      if (errorsObj && typeof errorsObj === "object") {
        const errorList = Object.values(errorsObj).flat();
        errorMsg = errorList.join(" ");
      } else {
        errorMsg =
          err?.response?.data?.message ||
          (typeof err?.response?.data === "string" ? err?.response?.data : null) ||
          err?.message ||
          (isEditMode ? "Failed to update contact." : "Failed to create contact.");
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in duration-150">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/25 rounded-xl flex items-center justify-center shrink-0">
                {isEditMode ? (
                  <Edit3 className="w-5 h-5 text-[#FF7900]" />
                ) : (
                  <UserPlus className="w-5 h-5 text-[#FF7900]" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditMode ? "Edit Contact Person" : "Add Contact Person"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode
                    ? "Update contact details in Contact Master"
                    : "Create a new contact record linked to an organization"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto grow">
            {/* Company Name searchable dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => {
                  if (!isLoading) setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                }}
                className={`w-full min-h-[42px] px-3.5 py-2.5 bg-white border rounded-lg text-sm flex items-center justify-between cursor-pointer transition ${
                  errors.companyId
                    ? "border-red-400 bg-red-50/20"
                    : "border-gray-300 hover:border-gray-400 focus-within:border-[#FF7900]"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span
                    className={
                      selectedCompany
                        ? "text-gray-900 font-medium truncate"
                        : "text-gray-400 truncate"
                    }
                  >
                    {selectedCompany
                      ? `${selectedCompany.companyName || selectedCompany.customerName}${
                          selectedCompany.customerCode ? ` (${selectedCompany.customerCode})` : ""
                        }`
                      : isFetchingCompanies
                      ? "Loading companies..."
                      : "Select Company..."}
                  </span>
                </div>
                <span className="text-xs text-gray-400 ml-2">▼</span>
              </div>

              {errors.companyId && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.companyId}</p>
              )}

              {/* Company Dropdown Menu */}
              {isCompanyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search company name or code..."
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400"
                    />
                    {companySearchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompanySearchQuery("");
                        }}
                        className="text-gray-400 hover:text-gray-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-44 divide-y divide-gray-50">
                    {filteredCompanies.length === 0 ? (
                      <div className="p-3 text-xs text-center text-gray-400">
                        No matching companies found
                      </div>
                    ) : (
                      filteredCompanies.map((comp) => {
                        const cId = Number(comp.customerId || comp.companyId);
                        const isSelected = cId === Number(formData.companyId);
                        const name = comp.companyName || comp.customerName;
                        return (
                          <button
                            key={cId}
                            type="button"
                            onClick={() => handleSelectCompany(comp)}
                            className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-50/80 text-[#FF7900] font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="truncate">{name}</span>
                            {comp.customerCode && (
                              <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                                {comp.customerCode}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., Rajesh Kumar"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                    errors.fullName ? "border-red-400 bg-red-50/20" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Department & Designation 2-Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Layers size={16} />
                  </span>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Procurement / Safety"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.department ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Designation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g., Purchase Manager"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.designation ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.designation && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.designation}</p>
                )}
              </div>
            </div>

            {/* Mobile Number & Alternate Mobile Number 2-Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    name="mobileNo"
                    maxLength={10}
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    placeholder="e.g., 9876543210"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.mobileNo ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.mobileNo && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.mobileNo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Alternate Mobile (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    name="altMobileNo"
                    maxLength={10}
                    value={formData.altMobileNo}
                    onChange={handleInputChange}
                    placeholder="e.g., 9123456789"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.altMobileNo ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.altMobileNo && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.altMobileNo}</p>
                )}
              </div>
            </div>

            {/* Email Address & Alternate Email Address 2-Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder="e.g., rajesh@company.com"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.emailAddress ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.emailAddress && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.emailAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Alternate Email (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="altEmailAddress"
                    value={formData.altEmailAddress}
                    onChange={handleInputChange}
                    placeholder="e.g., procurement@company.com"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition ${
                      errors.altEmailAddress ? "border-red-400 bg-red-50/20" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.altEmailAddress && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.altEmailAddress}</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Status
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF7900] hover:bg-[#E66D00] text-white rounded-lg text-sm font-semibold transition shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>
                {isLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                  ? "Update Contact"
                  : "Save Contact"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditContactModal;
