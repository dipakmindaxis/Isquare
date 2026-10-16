import React, { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Building2,
  Briefcase,
  FileText,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type {
  CustomerUpdatePayload,
  CustomerAddress,
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
import {
  getCustomerById,
  getCustomerAddresses,
  updateCustomer,
} from "./Services/CustomerService";
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

interface EditCustomerModalProps {
  isOpen: boolean;
  customerId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  customerId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CustomerUpdatePayload>({
    customerName: "",
    isActive: true,
  });
  const [activeTab, setActiveTab] = useState<number>(0);
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

  useEffect(() => {
    if (isOpen && customerId) {
      setActiveTab(0);

      const loadData = async () => {
        setIsLoading(true);
        try {
          const [customerRes, addressesRes, ...masterRes] = await Promise.all([
            getCustomerById(customerId),
            getCustomerAddresses(customerId).catch(() => []),
            getIndustries().catch(() => []),
            getCustomerStatuses().catch(() => []),
            getCustomerSources().catch(() => []),
            getCustomerAreas().catch(() => []),
            getPaymentTerms().catch(() => []),
            getBdeUsers().catch(() => []),
            getSalesManagers().catch(() => []),
            getEmployees().catch(() => []),
            getCountries().catch(() => []),
            getAddressTypes().catch(() => []),
          ]);

          setIndustries(Array.isArray(masterRes[0]) ? (masterRes[0] as IndustryItem[]) : []);
          setStatuses(Array.isArray(masterRes[1]) ? (masterRes[1] as CustomerStatusItem[]) : []);
          setSources(Array.isArray(masterRes[2]) ? (masterRes[2] as CustomerSourceItem[]) : []);
          setAreas(Array.isArray(masterRes[3]) ? (masterRes[3] as CustomerAreaItem[]) : []);
          setPaymentTerms(Array.isArray(masterRes[4]) ? (masterRes[4] as PaymentTermItem[]) : []);
          setBdeUsers(Array.isArray(masterRes[5]) ? (masterRes[5] as BdeUserItem[]) : []);
          setSalesManagers(Array.isArray(masterRes[6]) ? (masterRes[6] as SalesUserManagerItem[]) : []);
          setEmployees(Array.isArray(masterRes[7]) ? (masterRes[7] as EmployeeSelectItem[]) : []);
          setCountries(Array.isArray(masterRes[8]) ? (masterRes[8] as CountryItem[]) : []);
          setAddressTypes(Array.isArray(masterRes[9]) ? (masterRes[9] as AddressTypeItem[]) : []);

          const mergedAddresses =
            addressesRes && addressesRes.length > 0
              ? addressesRes
              : customerRes.addresses || [];

          setFormData({
            ...customerRes,
            addresses: mergedAddresses,
            registrationDate: customerRes.registrationDate
              ? customerRes.registrationDate.substring(0, 10)
              : "",
            visitedDate: customerRes.visitedDate
              ? customerRes.visitedDate.substring(0, 10)
              : "",
          });
        } catch (err: unknown) {
          console.error("Failed to load customer:", err);
          toast.error("Failed to load customer details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, customerId, onClose]);

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
        "paymentTermId",
        "directorId",
        "bdeUserId",
        "salesCoordinatorId",
        "customerOwnerId",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
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

    if (!customerId) return;
    if (!formData.customerName?.trim()) {
      toast.error("Customer Name is required.");
      setActiveTab(0);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CustomerUpdatePayload = {
        ...formData,
        customerId,
        customerName: formData.customerName.trim(),
        customerCode: formData.customerCode?.trim() || undefined,
        customerShortName: formData.customerShortName?.trim() || undefined,
        companyName: formData.companyName?.trim() || undefined,
        companyGroup: formData.companyGroup?.trim() || undefined,
        plantCode: formData.plantCode?.trim() || undefined,
        pan: formData.pan?.trim() || undefined,
        tan: formData.tan?.trim() || undefined,
        gstin: formData.gstin?.trim() || undefined,
        cin: formData.cin?.trim() || undefined,
        msmeNumber: formData.msmeNumber?.trim() || undefined,
        salesCoordinatorName: formData.salesCoordinatorName?.trim() || undefined,
        remarks: formData.remarks?.trim() || undefined,
        addresses: (formData.addresses || []).map((addr) => ({
          ...addr,
          countryId: addr.countryId ? Number(addr.countryId) : 1,
          stateId: addr.stateId ? Number(addr.stateId) : 1,
          cityId: addr.cityId ? Number(addr.cityId) : 1,
          pincode: addr.pincode?.trim() || "000000",
        })),
      };

      await updateCustomer(customerId, payload);
      toast.success("Customer updated successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : "Failed to update customer.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { label: "Basic Details", icon: <Building2 size={16} /> },
    { label: "Business Info", icon: <Briefcase size={16} /> },
    { label: "Registration & Tax Information", icon: <FileText size={16} /> },
    { label: "Sales Assignment", icon: <Users size={16} /> },
    { label: "Addresses", icon: <MapPin size={16} /> },
    { label: "Other Details", icon: <Calendar size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#154068] text-white px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <div className="pr-2 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold tracking-wide truncate">
              Edit Customer: {formData.customerName || `#${customerId}`}
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-100 opacity-90 line-clamp-1 sm:line-clamp-none">
              Update customer information and save changes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-2 sm:px-6 overflow-x-auto shrink-0 scrollbar-none gap-1">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors shrink-0 min-h-[36px] ${
                activeTab === idx
                  ? "border-[#154068] text-[#154068] bg-white font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#154068]">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-medium text-sm">Loading customer data...</p>
              </div>
            ) : (
              <>
                {/* SECTION 1 - BASIC DETAILS */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 1 - Basic Customer Details
                      </h3>
                      <p className="text-xs text-gray-500">
                        Primary identification and company details.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Customer Code
                        </label>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                          Read-only
                        </span>
                      </div>
                      <input
                        type="text"
                        name="customerCode"
                        value={formData.customerCode || ""}
                        readOnly
                        disabled
                        placeholder="e.g. CUST001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none select-none font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                        <input
                          type="text"
                          name="customerName"
                          value={formData.customerName || ""}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter full legal customer name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Customer Short Name
                        </label>
                        <input
                          type="text"
                          name="customerShortName"
                          value={formData.customerShortName || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Corp"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Industries Ltd"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Company Group
                        </label>
                        <input
                          type="text"
                          name="companyGroup"
                          value={formData.companyGroup || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Holdings Group"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Plant Code
                        </label>
                        <input
                          type="text"
                          name="plantCode"
                          value={formData.plantCode || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. PL-01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2 - BUSINESS INFO */}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 2 - Business Information
                      </h3>
                      <p className="text-xs text-gray-500">
                        Industry classification, status, source, area and commercial terms.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Industry
                        </label>
                        <select
                          name="industryId"
                          value={formData.industryId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Customer Status
                        </label>
                        <select
                          name="customerStatusId"
                          value={formData.customerStatusId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Customer Source
                        </label>
                        <select
                          name="customerSourceId"
                          value={formData.customerSourceId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Customer Area
                        </label>
                        <select
                          name="customerAreaId"
                          value={formData.customerAreaId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Payment Terms
                        </label>
                        <select
                          name="paymentTermsId"
                          value={formData.paymentTermsId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                )}

                {/* SECTION 3 - REGISTRATION & TAX INFORMATION */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 3 - Registration & Tax Information
                      </h3>
                      <p className="text-xs text-gray-500">
                        Official statutory and tax registration numbers.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          PAN
                        </label>
                        <input
                          type="text"
                          name="pan"
                          value={formData.pan || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. ABCDE1234F"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          TAN
                        </label>
                        <input
                          type="text"
                          name="tan"
                          value={formData.tan || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. ABCD12345E"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          GSTIN
                        </label>
                        <input
                          type="text"
                          name="gstin"
                          value={formData.gstin || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. 27ABCDE1234F1Z5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          CIN
                        </label>
                        <input
                          type="text"
                          name="cin"
                          value={formData.cin || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. U12345MH2020PTC123456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          MSME Number
                        </label>
                        <input
                          type="text"
                          name="msmeNumber"
                          value={formData.msmeNumber || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. UDYAM-MH-01-0000000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4 - SALES ASSIGNMENT */}
                {activeTab === 3 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 4 - Sales Assignment
                      </h3>
                      <p className="text-xs text-gray-500">
                        Map leadership, account managers, and sales representatives.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Director
                        </label>
                        <select
                          name="directorId"
                          value={formData.directorId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Director</option>
                          {(Array.isArray(employees) ? employees : []).map((emp) => {
                            const displayName =
                              emp.fullName ||
                              [emp.firstName, emp.lastName].filter(Boolean).join(" ") ||
                              `Employee #${emp.id}`;
                            return (
                              <option key={emp.id} value={emp.id}>
                                {displayName}
                                {emp.designation ? ` (${emp.designation})` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          BDE (Business Development Executive)
                        </label>
                        <select
                          name="bdeUserId"
                          value={formData.bdeUserId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sales Coordinator
                        </label>
                        <input
                          type="text"
                          name="salesCoordinatorName"
                          value={formData.salesCoordinatorName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Sales Coordinator name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Customer Owner
                        </label>
                        <select
                          name="customerOwnerId"
                          value={formData.customerOwnerId ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Customer Owner</option>
                          {Array.isArray(salesManagers) && salesManagers.length > 0
                            ? salesManagers.map((mgr) => (
                                <option key={mgr.id} value={mgr.id}>
                                  {mgr.userName} {mgr.code ? `(${mgr.code})` : ""}
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
                )}

                {/* SECTION 5 - ADDRESS */}
                {activeTab === 4 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 5 - Customer Addresses
                      </h3>
                      <p className="text-xs text-gray-500">
                        Manage corporate, registered, billing and shipping locations.
                      </p>
                    </div>

                    <CustomerAddressSection
                      addresses={formData.addresses || []}
                      onChange={handleAddressesChange}
                      countries={countries}
                      addressTypes={addressTypes}
                    />
                  </div>
                )}

                {/* SECTION 6 - OTHER DETAILS */}
                {activeTab === 5 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-bold text-[#154068] uppercase tracking-wider">
                        Section 6 - Other Details & Remarks
                      </h3>
                      <p className="text-xs text-gray-500">
                        Record history dates, relationship comments and account status.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Registration Date
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Visited Date
                      </label>
                      <input
                        type="date"
                        name="visitedDate"
                        value={formData.visitedDate || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Remarks / Notes
                      </label>
                      <textarea
                        name="remarks"
                        value={formData.remarks || ""}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Add internal notes, communication highlights, or account instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex items-center pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive ?? true}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#154068] border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          Customer is Active
                        </span>
                      </label>
                    </div>
                  </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 px-3 sm:px-6 py-3 bg-gray-50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab((prev) => prev - 1)}
                  className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[38px] flex items-center justify-center"
                >
                  Previous
                </button>
              )}
              {activeTab < tabs.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab((prev) => prev + 1)}
                  className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[38px] flex items-center justify-center"
                >
                  Next
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[38px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-medium text-white bg-[#154068] hover:bg-[#103050] rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[38px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Update Customer</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
