import React, { useEffect, useState } from "react";
import {
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type {
  CustomerCreatePayload,
  CustomerAddress,
  CustomerAddressPayload,
  IndustryItem,
  CustomerStatusItem,
  CustomerSourceItem,
  CustomerAreaItem,
  PaymentTermItem,
  BdeUserItem,
  SalesUserManagerItem,
  EmployeeSelectItem,
  CountryItem,
  AddressTypeItem,
} from "./Types/CustomerTypes";
import { createCustomer } from "./Services/CustomerService";
import {
  getIndustries,
  getCustomerStatuses,
  getCustomerSources,
  getCustomerAreas,
  getPaymentTerms,
  getBdeUsers,
  getSalesManagers,
  getEmployees,
  getCountries,
  getAddressTypes,
} from "./Services/CustomerMasterDataService";
import CustomerAddressSection from "./CustomerAddressSection";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CustomerFormState {
  customerCode: string;
  customerName: string;
  customerShortName: string;
  companyName: string;
  companyGroup: string;
  plantCode: string;
  industryId: number | "";
  customerStatusId: number | "";
  customerSourceId: number | "";
  customerAreaId: number | "";
  paymentTermsId: number | "";
  pan: string;
  tan: string;
  gstin: string;
  cin: string;
  msmeNumber: string;
  directorId: number | "";
  bdeUserId: number | "";
  salesCoordinatorId: number | "";
  customerOwnerId: number | "";
  addresses: CustomerAddress[];
  registrationDate: string;
  visitedDate: string;
  remarks: string;
  isActive: boolean;
}

const INITIAL_FORM_STATE: CustomerFormState = {
  customerCode: "",
  customerName: "",
  customerShortName: "",
  companyName: "",
  companyGroup: "",
  plantCode: "",
  industryId: "",
  customerStatusId: "",
  customerSourceId: "",
  customerAreaId: "",
  paymentTermsId: "",
  pan: "",
  tan: "",
  gstin: "",
  cin: "",
  msmeNumber: "",
  directorId: "",
  bdeUserId: "",
  salesCoordinatorId: "",
  customerOwnerId: "",
  addresses: [],
  registrationDate: "",
  visitedDate: "",
  remarks: "",
  isActive: true,
};

const formatDateForApi = (dateStr?: string | null): string | null => {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  }

  // YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  }

  const d = new Date(trimmed);
  return !isNaN(d.getTime()) ? d.toISOString() : null;
};

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] =
    useState<CustomerFormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master dropdown data lists
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [statuses, setStatuses] = useState<CustomerStatusItem[]>([]);
  const [sources, setSources] = useState<CustomerSourceItem[]>([]);
  const [areas, setAreas] = useState<CustomerAreaItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermItem[]>([]);
  const [bdeUsers, setBdeUsers] = useState<BdeUserItem[]>([]);
  const [salesManagers, setSalesManagers] = useState<SalesUserManagerItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [addressTypes, setAddressTypes] = useState<AddressTypeItem[]>([]);

  // Support ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_STATE);

      const loadDropdownData = async () => {
        setIsLoading(true);
        try {
          const results = await Promise.allSettled([
            getIndustries(),
            getCustomerStatuses(),
            getCustomerSources(),
            getCustomerAreas(),
            getPaymentTerms(),
            getBdeUsers(),
            getSalesManagers(),
            getEmployees(),
            getCountries(),
            getAddressTypes(),
          ]);

          if (results[0].status === "fulfilled" && Array.isArray(results[0].value)) setIndustries(results[0].value);
          if (results[1].status === "fulfilled" && Array.isArray(results[1].value)) setStatuses(results[1].value);
          if (results[2].status === "fulfilled" && Array.isArray(results[2].value)) setSources(results[2].value);
          if (results[3].status === "fulfilled" && Array.isArray(results[3].value)) setAreas(results[3].value);
          if (results[4].status === "fulfilled" && Array.isArray(results[4].value)) setPaymentTerms(results[4].value);
          if (results[5].status === "fulfilled" && Array.isArray(results[5].value)) setBdeUsers(results[5].value);
          if (results[6].status === "fulfilled" && Array.isArray(results[6].value)) setSalesManagers(results[6].value);
          if (results[7].status === "fulfilled" && Array.isArray(results[7].value)) setEmployees(results[7].value);
          if (results[8].status === "fulfilled" && Array.isArray(results[8].value)) setCountries(results[8].value);
          if (results[9].status === "fulfilled" && Array.isArray(results[9].value)) setAddressTypes(results[9].value);
        } catch (err) {
          console.error("Error loading dropdown data:", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadDropdownData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (
      [
        "industryId",
        "customerStatusId",
        "customerSourceId",
        "customerAreaId",
        "paymentTermsId",
        "directorId",
        "bdeUserId",
        "salesCoordinatorId",
        "customerOwnerId",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressesChange = (newAddresses: CustomerAddress[]) => {
    setFormData((prev) => ({
      ...prev,
      addresses: newAddresses,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName?.trim()) {
      toast.error("Customer Name is required.");
      const el = document.getElementById("customer-name-field");
      if (el) el.focus();
      return;
    }

    // Process & validate addresses
    const validAddresses: CustomerAddressPayload[] = [];
    if (formData.addresses && formData.addresses.length > 0) {
      for (let i = 0; i < formData.addresses.length; i++) {
        const addr = formData.addresses[i];
        const hasContent =
          Boolean(addr.address?.trim()) ||
          Boolean(addr.pincode?.trim()) ||
          (Boolean(addr.stateId) && Number(addr.stateId) > 0) ||
          (Boolean(addr.cityId) && Number(addr.cityId) > 0);

        if (!hasContent) {
          continue; // skip completely empty address card
        }
        if (!addr.address?.trim()) {
          toast.error(`Address #${i + 1}: Full Address is required.`);
          return;
        }
        if (!addr.pincode?.trim()) {
          toast.error(`Address #${i + 1}: Pincode is required.`);
          return;
        }
        validAddresses.push({
          addressType: addr.addressType?.trim() || "Billing",
          address: addr.address.trim(),
          countryId: addr.countryId ? Number(addr.countryId) : 1,
          stateId: addr.stateId ? Number(addr.stateId) : 1,
          cityId: addr.cityId ? Number(addr.cityId) : 1,
          pincode: addr.pincode.trim(),
          isPrimary:
            addr.isPrimary !== undefined
              ? !!addr.isPrimary
              : validAddresses.length === 0,
          isActive: addr.isActive !== false,
        });
      }
    }

    setIsSubmitting(true);
    try {
      const payload: CustomerCreatePayload = {
        // Section 1: Basic Details
        customerCode: formData.customerCode?.trim() || "",
        customerName: formData.customerName.trim(),
        customerShortName: formData.customerShortName?.trim() || null,
        companyName: formData.companyName?.trim() || null,
        companyGroup: formData.companyGroup?.trim() || null,
        plantCode: formData.plantCode?.trim() || null,

        // Section 2: Business Info
        industryId:
          formData.industryId !== "" ? Number(formData.industryId) : null,
        customerStatusId:
          formData.customerStatusId !== ""
            ? Number(formData.customerStatusId)
            : null,
        customerSourceId:
          formData.customerSourceId !== ""
            ? Number(formData.customerSourceId)
            : null,
        customerAreaId:
          formData.customerAreaId !== ""
            ? Number(formData.customerAreaId)
            : null,
        paymentTermsId:
          formData.paymentTermsId !== ""
            ? Number(formData.paymentTermsId)
            : null,

        // Section 3: Registration & Tax Information
        pan: formData.pan?.trim() || null,
        tan: formData.tan?.trim() || null,
        gstin: formData.gstin?.trim() || null,
        cin: formData.cin?.trim() || null,
        msmeNumber: formData.msmeNumber?.trim() || null,

        // Section 4: Sales Assignment
        directorId:
          formData.directorId !== "" ? Number(formData.directorId) : null,
        bdeUserId:
          formData.bdeUserId !== "" ? Number(formData.bdeUserId) : null,
        salesCoordinatorId:
          formData.salesCoordinatorId !== ""
            ? Number(formData.salesCoordinatorId)
            : null,
        customerOwnerId:
          formData.customerOwnerId !== ""
            ? Number(formData.customerOwnerId)
            : null,

        // Section 5: Addresses
        addresses: validAddresses,

        // Section 6: Other Details
        registrationDate: formatDateForApi(formData.registrationDate),
        visitedDate: formatDateForApi(formData.visitedDate),
        remarks: formData.remarks?.trim() || null,
        isActive: !!formData.isActive,
      };

      await createCustomer(payload);
      toast.success("Customer created successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Customer POST error response:", {
          status: err.response?.status,
          data: err.response?.data,
        });
        const errorData = err.response?.data;
        let errorMessage = "Failed to create customer.";
        if (errorData?.errors) {
          const fieldErrors = Object.entries(errorData.errors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join("; ");
          errorMessage = fieldErrors || errorData.title || errorMessage;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.title) {
          errorMessage = errorData.title;
        }
        toast.error(errorMessage);
      } else {
        const msg =
          err instanceof Error ? err.message : "Failed to create customer.";
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col overflow-hidden">
        {/* Customer form header */}
        <div className="flex justify-between items-center bg-[#154068] text-white px-6 py-4 sm:px-8 sm:py-4.5 shrink-0 border-b border-[#0f3458]">
          <div className="pr-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              Add New Customer
            </h2>
            <p className="text-xs sm:text-[13px] text-blue-100/90 font-normal mt-0.5">
              Enter customer profile details across all relevant sections
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer form body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 bg-slate-50/60"
        >
          <div className="px-4 py-5 sm:px-8 sm:py-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#154068]">
                <Loader2 size={36} className="animate-spin mb-3 text-[#154068]" />
                <p className="text-sm font-semibold text-gray-700">
                  Loading form master data...
                </p>
              </div>
            ) : (
              <>
                {/* SECTION 1 - BASIC CUSTOMER DETAILS */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 1
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Basic Customer Details
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Primary identifying details for the customer and company.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Code
                      </label>
                      <input
                        type="text"
                        name="customerCode"
                        value={formData.customerCode || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. CUST-001"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customer-name-field"
                        type="text"
                        name="customerName"
                        value={formData.customerName || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corporation Pvt Ltd"
                        required
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Short Name
                      </label>
                      <input
                        type="text"
                        name="customerShortName"
                        value={formData.customerShortName || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Holdings"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Company Group
                      </label>
                      <input
                        type="text"
                        name="companyGroup"
                        value={formData.companyGroup || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Enterprise Group"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Plant Code
                      </label>
                      <input
                        type="text"
                        name="plantCode"
                        value={formData.plantCode || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. PL-01"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 - BUSINESS INFORMATION */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 2
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Business Information
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tax details, industry classifications and commercial terms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Industry
                      </label>
                      <select
                        name="industryId"
                        value={formData.industryId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Industry</option>
                        {industries.map((ind) => (
                          <option key={ind.industryId} value={ind.industryId}>
                            {ind.industryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Status
                      </label>
                      <select
                        name="customerStatusId"
                        value={formData.customerStatusId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Customer Status</option>
                        {statuses.map((st) => (
                          <option
                            key={st.customerStatusId}
                            value={st.customerStatusId}
                          >
                            {st.statusName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Source
                      </label>
                      <select
                        name="customerSourceId"
                        value={formData.customerSourceId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Customer Source</option>
                        {sources.map((src) => (
                          <option
                            key={src.customerSourceId}
                            value={src.customerSourceId}
                          >
                            {src.sourceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Area
                      </label>
                      <select
                        name="customerAreaId"
                        value={formData.customerAreaId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Customer Area</option>
                        {areas.map((ar) => (
                          <option
                            key={ar.customerAreaId}
                            value={ar.customerAreaId}
                          >
                            {ar.areaName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Payment Terms
                      </label>
                      <select
                        name="paymentTermsId"
                        value={formData.paymentTermsId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Payment Terms</option>
                        {paymentTerms.map((pt) => (
                          <option
                            key={pt.paymentTermId}
                            value={pt.paymentTermId}
                          >
                            {pt.paymentTermName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 3 - REGISTRATION & TAX INFORMATION */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 3
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Registration & Tax Information
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Statutory and registration identifiers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        PAN
                      </label>
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        TAN
                      </label>
                      <input
                        type="text"
                        name="tan"
                        value={formData.tan || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. ABCD12345E"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        CIN
                      </label>
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. U12345MH2020PTC123456"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        MSME Number
                      </label>
                      <input
                        type="text"
                        name="msmeNumber"
                        value={formData.msmeNumber || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. UDYAM-MH-01-0000000"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4 - SALES ASSIGNMENT */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 4
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Sales Assignment
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Map leadership, account managers, and sales representatives.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Director
                      </label>
                      <select
                        name="directorId"
                        value={formData.directorId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Director</option>
                        {(Array.isArray(employees) ? employees : []).map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName}{" "}
                            {emp.designation ? `(${emp.designation})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        BDE (Business Development Executive)
                      </label>
                      <select
                        name="bdeUserId"
                        value={formData.bdeUserId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select BDE User</option>
                        {(Array.isArray(bdeUsers) ? bdeUsers : []).map((bde) => (
                          <option key={bde.id} value={bde.id}>
                            {bde.value} {bde.code ? `(${bde.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Sales Coordinator
                      </label>
                      <select
                        name="salesCoordinatorId"
                        value={formData.salesCoordinatorId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Sales Coordinator</option>
                        {(Array.isArray(employees) ? employees : []).map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Customer Owner
                      </label>
                      <select
                        name="customerOwnerId"
                        value={formData.customerOwnerId ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      >
                        <option value="">Select Customer Owner</option>
                        {Array.isArray(salesManagers) && salesManagers.length > 0
                          ? salesManagers.map((mgr) => (
                              <option key={mgr.id} value={mgr.id}>
                                {mgr.userName}{" "}
                                {mgr.code ? `(${mgr.code})` : ""}
                              </option>
                            ))
                          : (Array.isArray(employees) ? employees : []).map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.fullName}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 5 - ADDRESSES */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 5
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Customer Addresses
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage billing, shipping, plant and registered addresses.
                    </p>
                  </div>

                  <CustomerAddressSection
                    addresses={formData.addresses || []}
                    onChange={handleAddressesChange}
                    countries={countries}
                    addressTypes={addressTypes}
                  />
                </div>

                {/* SECTION 6 - OTHER DETAILS & REMARKS */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#154068] border border-blue-200">
                        Section 6
                      </span>
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Other Details & Remarks
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Registration milestones, internal notes, and active status.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Registration Date
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate || ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Visited Date
                      </label>
                      <input
                        type="date"
                        name="visitedDate"
                        value={formData.visitedDate || ""}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Remarks / Notes
                      </label>
                      <textarea
                        name="remarks"
                        rows={3}
                        value={formData.remarks || ""}
                        onChange={handleInputChange}
                        placeholder="Enter observations, commercial agreements or special requirements..."
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#154068]/20 focus:border-[#154068] transition"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-[#154068] rounded focus:ring-[#154068] border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          Customer is Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Form actions */}
          <div className="border-t border-gray-200 bg-white px-6 py-3.5 sm:px-8 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-6 py-2.5 rounded-lg transition min-h-[40px] shadow-xs disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-[#154068] hover:bg-[#0f3050] text-white font-semibold text-sm px-7 py-2.5 rounded-lg shadow-sm transition min-h-[40px] flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              <span>{isSubmitting ? "Saving..." : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddCustomerModal;
