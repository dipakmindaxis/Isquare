import React, { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Building,
  Briefcase,
  FileText,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type {
  CustomerCreatePayload,
  CustomerAddress,
  CustomerAddressPayload,
  IndustryItem,
  CustomerStatusItem,
  CustomerSourceItem,
  CustomerAreaItem,
  PaymentTermItem,
  CountryItem,
  AddressTypeItem,
  SalesCoordinatorItem,
} from "./Types/CustomerTypes";
import { createCustomer, getNextCustomerCode } from "./Services/CustomerService";
import {
  getIndustries,
  getCustomerStatuses,
  getCustomerSources,
  getCustomerAreas,
  getPaymentTerms,
  getBdeUsers,
  getCountries,
  getAddressTypes,
  getSalesCoordinators,
  getDirectors,
} from "./Services/CustomerMasterDataService";
import CustomerAddressSection from "./CustomerAddressSection";
import SalesAssignmentSection from "./SalesAssignmentSection";
import AddSalesCoordinatorModal from "../Master/SalesCoordinator/Components/AddSalesCoordinatorModal";

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
  directorName: string;
  bdeUserId: number | "";
  bdeUserName: string;
  salesCoordinatorId: number | "";
  salesCoordinatorName: string;
  customerOwnerId: number | "";
  customerOwnerName: string;
  customerOwnerType: "Director" | "BDE" | string;
  customerOwnerValue: string;
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
  directorName: "",
  bdeUserId: "",
  bdeUserName: "",
  salesCoordinatorId: "",
  salesCoordinatorName: "",
  customerOwnerId: "",
  customerOwnerName: "",
  customerOwnerType: "",
  customerOwnerValue: "",
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
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const cachedNextCodeRef = React.useRef<string>("");

  // Master dropdown data lists
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [statuses, setStatuses] = useState<CustomerStatusItem[]>([]);
  const [sources, setSources] = useState<CustomerSourceItem[]>([]);
  const [areas, setAreas] = useState<CustomerAreaItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [addressTypes, setAddressTypes] = useState<AddressTypeItem[]>([]);
  const [, setSalesCoordinators] = useState<SalesCoordinatorItem[]>([]);
  const [isAddCoordinatorOpen, setIsAddCoordinatorOpen] = useState(false);

  const refreshSalesCoordinators = async () => {
    const list = await getSalesCoordinators();
    if (Array.isArray(list)) {
      setSalesCoordinators(list);
    }
  };

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
      cachedNextCodeRef.current = "";

      // Pre-fetch next sequential customer code from backend
      getNextCustomerCode().then((code) => {
        if (code) {
          cachedNextCodeRef.current = code;
        }
      });

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
            getCountries(),
            getAddressTypes(),
            getSalesCoordinators(),
            getDirectors(),
          ]);

          if (results[0].status === "fulfilled" && Array.isArray(results[0].value)) setIndustries(results[0].value);
          if (results[1].status === "fulfilled" && Array.isArray(results[1].value)) setStatuses(results[1].value);
          if (results[2].status === "fulfilled" && Array.isArray(results[2].value)) setSources(results[2].value);
          if (results[3].status === "fulfilled" && Array.isArray(results[3].value)) setAreas(results[3].value);
          if (results[4].status === "fulfilled" && Array.isArray(results[4].value)) setPaymentTerms(results[4].value);
          if (results[6].status === "fulfilled" && Array.isArray(results[6].value)) setCountries(results[6].value);
          if (results[7].status === "fulfilled" && Array.isArray(results[7].value)) setAddressTypes(results[7].value);
          if (results[8].status === "fulfilled" && Array.isArray(results[8].value)) setSalesCoordinators(results[8].value);
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
    } else if (name === "customerName") {
      const trimmedVal = value.trim();
      if (trimmedVal.length > 0) {
        if (!formData.customerCode) {
          if (cachedNextCodeRef.current) {
            setFormData((prev) => ({
              ...prev,
              customerName: value,
              customerCode: cachedNextCodeRef.current,
            }));
            return;
          } else {
            setIsFetchingCode(true);
            getNextCustomerCode()
              .then((code) => {
                const assignedCode = code || "CUST001";
                cachedNextCodeRef.current = assignedCode;
                setFormData((prev) => ({
                  ...prev,
                  customerName: value,
                  customerCode: prev.customerCode || assignedCode,
                }));
              })
              .catch(() => {
                setFormData((prev) => ({
                  ...prev,
                  customerName: value,
                  customerCode: prev.customerCode || "CUST001",
                }));
              })
              .finally(() => {
                setIsFetchingCode(false);
              });
          }
        }
      } else {
        // If customer name is cleared, clear auto-generated code
        setFormData((prev) => ({
          ...prev,
          customerName: value,
          customerCode: "",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, customerName: value }));
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
        const hasContent = Boolean(addr.address?.trim());

        if (!hasContent) {
          continue; // skip completely empty address card
        }
        if (!addr.address?.trim()) {
          toast.error(`Address #${i + 1}: Full Address is required.`);
          return;
        }
        validAddresses.push({
          companyId: 0,
          addressType: addr.addressType?.trim() || "Billing",
          address: addr.address.trim(),
          countryId: addr.countryId ? Number(addr.countryId) : 1,
          stateId: addr.stateId ? Number(addr.stateId) : 1,
          cityId: addr.cityId ? Number(addr.cityId) : 1,
          pincode: addr.pincode?.trim() || "000000",
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
      let finalCode = formData.customerCode?.trim() || "";
      if (!finalCode) {
        finalCode = cachedNextCodeRef.current || "";
      }

      const payload: CustomerCreatePayload = {
        // Section 1: Basic Details
        customerCode: finalCode,
        customerName: formData.customerName.trim(),
        customerShortName: formData.customerShortName?.trim() || null,
        companyName: formData.companyName?.trim() || null,
        companyGroup: formData.companyGroup?.trim() || null,
        plantCode: formData.plantCode?.trim() || null,

        // Section 2: Business Info
        industryId:
          formData.industryId !== "" ? Number(formData.industryId) : null,
        industryName:
          formData.industryId !== ""
            ? industries.find(
                (i) => i.industryId === Number(formData.industryId)
              )?.industryName || null
            : null,
        customerStatusId:
          formData.customerStatusId !== ""
            ? Number(formData.customerStatusId)
            : null,
        customerStatusName:
          formData.customerStatusId !== ""
            ? statuses.find(
                (s) => s.customerStatusId === Number(formData.customerStatusId)
              )?.statusName || null
            : null,
        customerSourceId:
          formData.customerSourceId !== ""
            ? Number(formData.customerSourceId)
            : null,
        customerSourceName:
          formData.customerSourceId !== ""
            ? sources.find(
                (s) => s.customerSourceId === Number(formData.customerSourceId)
              )?.sourceName || null
            : null,
        customerAreaId:
          formData.customerAreaId !== ""
            ? Number(formData.customerAreaId)
            : null,
        customerAreaName:
          formData.customerAreaId !== ""
            ? areas.find(
                (a) => a.customerAreaId === Number(formData.customerAreaId)
              )?.areaName || null
            : null,
        paymentTermsId:
          formData.paymentTermsId !== ""
            ? Number(formData.paymentTermsId)
            : null,
        paymentTermName:
          formData.paymentTermsId !== ""
            ? paymentTerms.find(
                (p) => p.paymentTermId === Number(formData.paymentTermsId)
              )?.paymentTermName || null
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
        directorName: formData.directorName?.trim() || null,
        bdeUserId:
          formData.bdeUserId !== "" ? Number(formData.bdeUserId) : null,
        bdeUserName: formData.bdeUserName?.trim() || null,
        salesCoordinatorId:
          formData.salesCoordinatorId !== "" &&
          formData.salesCoordinatorId !== undefined &&
          formData.salesCoordinatorId !== null
            ? Number(formData.salesCoordinatorId)
            : null,
        salesCoordinatorName: formData.salesCoordinatorName?.trim() || null,
        customerOwnerId:
          formData.customerOwnerId !== ""
            ? Number(formData.customerOwnerId)
            : null,
        customerOwnerName: formData.customerOwnerName?.trim() || null,
        customerOwnerType: formData.customerOwnerType || null,

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

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
      {/* Form Top Bar */}
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5">
          <Building size={20} className="text-white" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
            Create New Customer
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
          title="Back to Customers List"
        >
          <X size={20} />
        </button>
      </div>

      {/* Single Unified Customer Form */}
      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-6 sm:p-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#FF7900]">
              <Loader2 size={36} className="animate-spin mb-3 text-[#FF7900]" />
              <p className="text-sm font-semibold text-gray-700">
                Loading form master data...
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* SECTION 1: BASIC CUSTOMER DETAILS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Building size={16} /> Section 1 - Basic Customer Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block">
                        Customer Code
                      </label>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                        Auto-generated
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="customerCode"
                        value={formData.customerCode || ""}
                        readOnly
                        disabled
                        placeholder={isFetchingCode ? "Generating code..." : "e.g. CUST001"}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600 text-sm cursor-not-allowed select-none font-medium"
                      />
                      {isFetchingCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="customer-name-field"
                      type="text"
                      name="customerName"
                      value={formData.customerName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Customer Name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Short Name
                    </label>
                    <input
                      type="text"
                      name="customerShortName"
                      value={formData.customerShortName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Short Name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Company Name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Company Group
                    </label>
                    <input
                      type="text"
                      name="companyGroup"
                      value={formData.companyGroup || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Company Group"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Plant Code
                    </label>
                    <input
                      type="text"
                      name="plantCode"
                      value={formData.plantCode || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Plant Code"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BUSINESS INFORMATION */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} /> Section 2 - Business Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Industry
                    </label>
                    <select
                      name="industryId"
                      value={formData.industryId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Industry...</option>
                      {industries.map((ind) => (
                        <option key={ind.industryId} value={ind.industryId}>
                          {ind.industryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Status
                    </label>
                    <select
                      name="customerStatusId"
                      value={formData.customerStatusId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Customer Status...</option>
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Source
                    </label>
                    <select
                      name="customerSourceId"
                      value={formData.customerSourceId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Customer Source...</option>
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Area
                    </label>
                    <select
                      name="customerAreaId"
                      value={formData.customerAreaId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Customer Area...</option>
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Payment Terms
                    </label>
                    <select
                      name="paymentTermsId"
                      value={formData.paymentTermsId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Payment Terms...</option>
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

              {/* SECTION 3: REGISTRATION & TAX INFORMATION */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} /> Section 3 - Registration & Tax Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      PAN No.
                    </label>
                    <input
                      type="text"
                      name="pan"
                      value={formData.pan || ""}
                      onChange={handleInputChange}
                      placeholder="Enter PAN Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      TAN No.
                    </label>
                    <input
                      type="text"
                      name="tan"
                      value={formData.tan || ""}
                      onChange={handleInputChange}
                      placeholder="Enter TAN Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin || ""}
                      onChange={handleInputChange}
                      placeholder="Enter GSTIN Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      CIN No.
                    </label>
                    <input
                      type="text"
                      name="cin"
                      value={formData.cin || ""}
                      onChange={handleInputChange}
                      placeholder="Enter CIN Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      MSME Number
                    </label>
                    <input
                      type="text"
                      name="msmeNumber"
                      value={formData.msmeNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter MSME Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: SALES ASSIGNMENT (Cascading Flow) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> Section 4 - Sales Assignment
                  </h3>
                </div>
                <SalesAssignmentSection
                  hideHeader={true}
                  values={{
                    directorId: formData.directorId ? Number(formData.directorId) : "",
                    directorName: formData.directorName ?? "",
                    bdeUserId: formData.bdeUserId ? Number(formData.bdeUserId) : "",
                    bdeUserName: formData.bdeUserName ?? "",
                    salesCoordinatorId: formData.salesCoordinatorId ? Number(formData.salesCoordinatorId) : "",
                    salesCoordinatorName: formData.salesCoordinatorName ?? "",
                    customerOwnerId: formData.customerOwnerId ? Number(formData.customerOwnerId) : "",
                    customerOwnerName: formData.customerOwnerName ?? "",
                    customerOwnerType: formData.customerOwnerType ?? "",
                    customerOwnerValue: formData.customerOwnerValue ?? "",
                  }}
                  onChange={(updates) => {
                    setFormData((prev) => ({
                      ...prev,
                      ...updates,
                    }));
                  }}
                />
              </div>

              {/* SECTION 5: ADDRESSES */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={16} /> Section 5 - Customer Addresses
                  </h3>
                </div>
                <CustomerAddressSection
                  addresses={formData.addresses || []}
                  onChange={handleAddressesChange}
                  countries={countries}
                  addressTypes={addressTypes}
                />
              </div>

              {/* SECTION 6: OTHER DETAILS & REMARKS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} /> Section 6 - Other Details & Remarks
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Registration Date
                    </label>
                    <input
                      type="date"
                      name="registrationDate"
                      value={formData.registrationDate || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Visited Date
                    </label>
                    <input
                      type="date"
                      name="visitedDate"
                      value={formData.visitedDate || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Remarks / Notes
                    </label>
                    <textarea
                      name="remarks"
                      rows={3}
                      value={formData.remarks || ""}
                      onChange={handleInputChange}
                      placeholder="Enter observations, commercial agreements or special requirements..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#FF7900] rounded focus:ring-[#FF7900] border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        Customer is Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Matching Employee Module Design) */}
        <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={buttonStyles.cancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={buttonStyles.save}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin inline mr-1" size={16} /> Saving...
              </>
            ) : (
              "Save Customer"
            )}
          </button>
        </div>
      </form>

      <AddSalesCoordinatorModal
        isOpen={isAddCoordinatorOpen}
        onClose={() => setIsAddCoordinatorOpen(false)}
        onSuccess={refreshSalesCoordinators}
      />
    </div>
  );
};

export default AddCustomerModal;
