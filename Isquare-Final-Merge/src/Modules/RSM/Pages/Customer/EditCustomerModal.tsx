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
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type {
  CustomerUpdatePayload,
  CustomerAddress,
  IndustryItem,
  CustomerStatusItem,
  CustomerSourceItem,
  CustomerAreaItem,
  PaymentTermItem,
  BdeUserItem,
  CountryItem,
  AddressTypeItem,
  SalesCoordinatorItem,
  DirectorItem,
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
  getCountries,
  getAddressTypes,
  getSalesCoordinators,
  getDirectors,
} from "./Services/CustomerMasterDataService";
import CustomerAddressSection from "./CustomerAddressSection";
import SalesAssignmentSection from "./SalesAssignmentSection";
import AddSalesCoordinatorModal from "../Master/SalesCoordinator/Components/AddSalesCoordinatorModal";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master dropdown data lists
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [statuses, setStatuses] = useState<CustomerStatusItem[]>([]);
  const [sources, setSources] = useState<CustomerSourceItem[]>([]);
  const [areas, setAreas] = useState<CustomerAreaItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [addressTypes, setAddressTypes] = useState<AddressTypeItem[]>([]);
  const [salesCoordinators, setSalesCoordinators] = useState<SalesCoordinatorItem[]>([]);
  const [selectedCoordinatorIds, setSelectedCoordinatorIds] = useState<number[]>([]);
  const [customerOwnerValue, setCustomerOwnerValue] = useState<string>("");
  const [isAddCoordinatorOpen, setIsAddCoordinatorOpen] = useState(false);

  const refreshSalesCoordinators = async () => {
    const list = await getSalesCoordinators();
    if (Array.isArray(list)) {
      setSalesCoordinators(list);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {

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
            getCountries().catch(() => []),
            getAddressTypes().catch(() => []),
            getSalesCoordinators().catch(() => []),
            getDirectors().catch(() => []),
          ]);

          setIndustries(Array.isArray(masterRes[0]) ? (masterRes[0] as IndustryItem[]) : []);
          setStatuses(Array.isArray(masterRes[1]) ? (masterRes[1] as CustomerStatusItem[]) : []);
          setSources(Array.isArray(masterRes[2]) ? (masterRes[2] as CustomerSourceItem[]) : []);
          setAreas(Array.isArray(masterRes[3]) ? (masterRes[3] as CustomerAreaItem[]) : []);
          setPaymentTerms(Array.isArray(masterRes[4]) ? (masterRes[4] as PaymentTermItem[]) : []);
          const loadedBdes = Array.isArray(masterRes[5]) ? (masterRes[5] as BdeUserItem[]) : [];
          setCountries(Array.isArray(masterRes[6]) ? (masterRes[6] as CountryItem[]) : []);
          setAddressTypes(Array.isArray(masterRes[7]) ? (masterRes[7] as AddressTypeItem[]) : []);
          const loadedCoordinators = Array.isArray(masterRes[8]) ? (masterRes[8] as SalesCoordinatorItem[]) : [];
          setSalesCoordinators(loadedCoordinators);
          const loadedDirectors = Array.isArray(masterRes[9]) ? (masterRes[9] as DirectorItem[]) : [];

          // Restore multi-selected coordinators
          const initialCoordinatorIds: number[] = [];
          if (customerRes.salesCoordinatorName) {
            const splitNames = customerRes.salesCoordinatorName
              .split(",")
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean);
            for (const name of splitNames) {
              const found = loadedCoordinators.find(
                (sc) => sc.salesCoordinatorName.trim().toLowerCase() === name
              );
              if (found && !initialCoordinatorIds.includes(found.salesCoordinatorId)) {
                initialCoordinatorIds.push(found.salesCoordinatorId);
              }
            }
          }
          if (
            customerRes.salesCoordinatorId &&
            !initialCoordinatorIds.includes(Number(customerRes.salesCoordinatorId))
          ) {
            initialCoordinatorIds.unshift(Number(customerRes.salesCoordinatorId));
          }
          setSelectedCoordinatorIds(initialCoordinatorIds);

          // Resolve coordinator name from ID if name was not stored
          let resolvedCoordinatorName = customerRes.salesCoordinatorName || "";
          if (!resolvedCoordinatorName && initialCoordinatorIds.length > 0) {
            resolvedCoordinatorName = loadedCoordinators
              .filter((sc) => initialCoordinatorIds.includes(sc.salesCoordinatorId))
              .map((sc) => sc.salesCoordinatorName)
              .join(", ");
          }

          // Normalize name for robust comparison (strips codes like "(3)" or "(EMP001)" and trims)
          const normalizeForCompare = (str?: string | null): string => {
            if (!str) return "";
            return str
              .replace(/\([^)]*\)/g, "")
              .trim()
              .toLowerCase();
          };

          // Restore Customer Owner
          let resolvedOwnerType: "Director" | "BDE" | "" = "";
          let resolvedOwnerId: number | "" = "";
          let resolvedOwnerName = "";
          let resolvedOwnerVal = "";

          const rawOwnerType = customerRes.customerOwnerType?.trim().toUpperCase();
          const rawOwnerId = customerRes.customerOwnerId ? Number(customerRes.customerOwnerId) : null;
          const rawOwnerName = customerRes.customerOwnerName?.trim() || "";
          const assignedBdeId = customerRes.bdeUserId ? Number(customerRes.bdeUserId) : null;
          const assignedBdeName = customerRes.bdeUserName?.trim() || "";
          const assignedDirId = customerRes.directorId ? Number(customerRes.directorId) : null;
          const assignedDirName = customerRes.directorName?.trim() || "";

          // 1. Explicit owner type check
          if (rawOwnerType === "BDE") {
            resolvedOwnerType = "BDE";
            resolvedOwnerId = rawOwnerId || assignedBdeId || "";
            resolvedOwnerName = rawOwnerName || assignedBdeName;
          } else if (rawOwnerType === "DIRECTOR") {
            resolvedOwnerType = "Director";
            resolvedOwnerId = rawOwnerId || assignedDirId || "";
            resolvedOwnerName = rawOwnerName || assignedDirName;
          }

          // 2. Direct comparison against customer's assigned BDE User and Director
          if (!resolvedOwnerType) {
            const normOwnerName = normalizeForCompare(rawOwnerName);
            const normBdeName = normalizeForCompare(assignedBdeName);
            const normDirName = normalizeForCompare(assignedDirName);

            // BDE Match by ID
            if (rawOwnerId && assignedBdeId && rawOwnerId === assignedBdeId) {
              resolvedOwnerType = "BDE";
              resolvedOwnerId = assignedBdeId;
              resolvedOwnerName = assignedBdeName || rawOwnerName;
            }
            // BDE Match by Name
            else if (
              normOwnerName &&
              normBdeName &&
              (normOwnerName === normBdeName ||
                normOwnerName.includes(normBdeName) ||
                normBdeName.includes(normOwnerName))
            ) {
              resolvedOwnerType = "BDE";
              resolvedOwnerId = assignedBdeId || rawOwnerId || "";
              resolvedOwnerName = assignedBdeName || rawOwnerName;
            }
            // Director Match by ID
            else if (rawOwnerId && assignedDirId && rawOwnerId === assignedDirId) {
              resolvedOwnerType = "Director";
              resolvedOwnerId = assignedDirId;
              resolvedOwnerName = assignedDirName || rawOwnerName;
            }
            // Director Match by Name
            else if (
              normOwnerName &&
              normDirName &&
              (normOwnerName === normDirName ||
                normOwnerName.includes(normDirName) ||
                normDirName.includes(normOwnerName))
            ) {
              resolvedOwnerType = "Director";
              resolvedOwnerId = assignedDirId || rawOwnerId || "";
              resolvedOwnerName = assignedDirName || rawOwnerName;
            }
          }

          // 3. Fallback matching against loaded master lists
          if (!resolvedOwnerType) {
            const normOwnerName = normalizeForCompare(rawOwnerName);

            // Check loaded BDE users
            const matchedBde = loadedBdes.find((b) => {
              if (rawOwnerId && b.id === rawOwnerId) return true;
              if (normOwnerName) {
                const normVal = normalizeForCompare(b.value);
                return normVal && (normVal === normOwnerName || normVal.includes(normOwnerName) || normOwnerName.includes(normVal));
              }
              return false;
            });

            if (matchedBde) {
              resolvedOwnerType = "BDE";
              resolvedOwnerId = matchedBde.id;
              resolvedOwnerName = matchedBde.value || rawOwnerName;
            } else {
              // Check loaded Directors
              const matchedDir = loadedDirectors.find((d) => {
                if (rawOwnerId && d.directorId === rawOwnerId) return true;
                if (normOwnerName) {
                  const normDir = normalizeForCompare(d.directorName);
                  return normDir && (normDir === normOwnerName || normDir.includes(normOwnerName) || normOwnerName.includes(normDir));
                }
                return false;
              });

              if (matchedDir) {
                resolvedOwnerType = "Director";
                resolvedOwnerId = matchedDir.directorId;
                resolvedOwnerName = matchedDir.directorName || rawOwnerName;
              }
            }
          }

          if (resolvedOwnerType && resolvedOwnerId) {
            resolvedOwnerVal = `${resolvedOwnerType}:${resolvedOwnerId}`;
          }

          setCustomerOwnerValue(resolvedOwnerVal);

          const mergedAddresses =
            addressesRes && addressesRes.length > 0
              ? addressesRes
              : customerRes.addresses || [];

          setFormData({
            ...customerRes,
            paymentTermsId: customerRes.paymentTermsId ?? customerRes.paymentTermId,
            salesCoordinatorId:
              initialCoordinatorIds.length > 0
                ? initialCoordinatorIds[0]
                : (customerRes.salesCoordinatorId ? Number(customerRes.salesCoordinatorId) : undefined),
            salesCoordinatorName: resolvedCoordinatorName || customerRes.salesCoordinatorName || "",
            customerOwnerId:
              resolvedOwnerId !== ""
                ? Number(resolvedOwnerId)
                : (customerRes.customerOwnerId ? Number(customerRes.customerOwnerId) : undefined),
            customerOwnerName: resolvedOwnerName || customerRes.customerOwnerName || "",
            customerOwnerType: resolvedOwnerType || customerRes.customerOwnerType || "",
            customerOwnerValue: resolvedOwnerVal,
            addresses: mergedAddresses,
            registrationDate: customerRes.registrationDate
              ? customerRes.registrationDate.substring(0, 10)
              : "",
            visitedDate: customerRes.visitedDate
              ? customerRes.visitedDate.substring(0, 10)
              : "",
          });
        } catch (err) {
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

        // Business Information
        industryId: formData.industryId ? Number(formData.industryId) : null,
        industryName:
          formData.industryId
            ? industries.find((i) => i.industryId === Number(formData.industryId))?.industryName || null
            : null,
        customerStatusId: formData.customerStatusId ? Number(formData.customerStatusId) : null,
        customerStatusName:
          formData.customerStatusId
            ? statuses.find((s) => s.customerStatusId === Number(formData.customerStatusId))?.statusName || null
            : null,
        customerSourceId: formData.customerSourceId ? Number(formData.customerSourceId) : null,
        customerSourceName:
          formData.customerSourceId
            ? sources.find((s) => s.customerSourceId === Number(formData.customerSourceId))?.sourceName || null
            : null,
        customerAreaId: formData.customerAreaId ? Number(formData.customerAreaId) : null,
        customerAreaName:
          formData.customerAreaId
            ? areas.find((a) => a.customerAreaId === Number(formData.customerAreaId))?.areaName || null
            : null,
        paymentTermsId:
          formData.paymentTermsId || formData.paymentTermId
            ? Number(formData.paymentTermsId || formData.paymentTermId)
            : null,
        paymentTermName:
          formData.paymentTermsId || formData.paymentTermId
            ? paymentTerms.find((p) => p.paymentTermId === Number(formData.paymentTermsId || formData.paymentTermId))?.paymentTermName || null
            : null,

        // Sales Assignment fields
        directorId: formData.directorId ? Number(formData.directorId) : null,
        directorName: formData.directorName?.trim() || null,
        bdeUserId: formData.bdeUserId ? Number(formData.bdeUserId) : null,
        bdeUserName: formData.bdeUserName?.trim() || null,
        salesCoordinatorId:
          selectedCoordinatorIds.length > 0
            ? Number(selectedCoordinatorIds[0])
            : (formData.salesCoordinatorId ? Number(formData.salesCoordinatorId) : null),
        salesCoordinatorName:
          formData.salesCoordinatorName?.trim() ||
          (selectedCoordinatorIds.length > 0
            ? salesCoordinators
                .filter((sc) => selectedCoordinatorIds.includes(sc.salesCoordinatorId))
                .map((sc) => sc.salesCoordinatorName)
                .join(", ")
            : null),
        customerOwnerId:
          formData.customerOwnerId !== undefined && formData.customerOwnerId !== null && Boolean(formData.customerOwnerId)
            ? Number(formData.customerOwnerId)
            : (customerOwnerValue.includes(":") ? Number(customerOwnerValue.split(":")[1]) : null),
        customerOwnerName: formData.customerOwnerName?.trim() || null,
        customerOwnerType:
          formData.customerOwnerType ||
          (customerOwnerValue.includes(":") ? customerOwnerValue.split(":")[0] : null),

        remarks: formData.remarks?.trim() || undefined,
        addresses: (formData.addresses || [])
          .filter((addr) => Boolean(addr.address?.trim()))
          .map((addr) => ({
            addressId: addr.addressId && addr.addressId > 0 ? addr.addressId : undefined,
            companyId: customerId,
            addressType: addr.addressType?.trim() || "Billing",
            address: addr.address.trim(),
            countryId: addr.countryId ? Number(addr.countryId) : 1,
            stateId: addr.stateId ? Number(addr.stateId) : 1,
            cityId: addr.cityId ? Number(addr.cityId) : 1,
            pincode: addr.pincode?.trim() || "000000",
            isPrimary: !!addr.isPrimary,
            isActive: addr.isActive !== false,
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

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
      {/* Form Top Bar */}
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5 pr-2 min-w-0">
          <Building2 size={20} className="text-white shrink-0" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
            Edit Customer: {formData.customerName || `#${customerId}`}
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
            <div className="flex flex-col items-center justify-center py-20 text-[#FF7900]">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-medium text-sm">Loading customer data...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* SECTION 1: BASIC CUSTOMER DETAILS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} /> Section 1 - Basic Customer Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block">
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
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600 text-sm cursor-not-allowed select-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full legal customer name"
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
                      placeholder="e.g. Acme Corp"
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
                      placeholder="e.g. Acme Industries Ltd"
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
                      placeholder="e.g. Acme Holdings Group"
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
                      placeholder="e.g. PL-01"
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
                      <option value="">Select Industry</option>
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Source
                    </label>
                    <select
                      name="customerSourceId"
                      value={formData.customerSourceId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Customer Area
                    </label>
                    <select
                      name="customerAreaId"
                      value={formData.customerAreaId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Payment Terms
                    </label>
                    <select
                      name="paymentTermsId"
                      value={formData.paymentTermsId ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
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
                      placeholder="e.g. ABCDE1234F"
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
                      placeholder="e.g. ABCD12345E"
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
                      placeholder="e.g. 27ABCDE1234F1Z5"
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
                      placeholder="e.g. U12345MH2020PTC123456"
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
                      placeholder="e.g. UDYAM-MH-01-0000000"
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
                    directorCode: formData.directorCode ?? "",
                    bdeUserId: formData.bdeUserId ? Number(formData.bdeUserId) : "",
                    bdeUserName: formData.bdeUserName ?? "",
                    salesCoordinatorId: formData.salesCoordinatorId ? Number(formData.salesCoordinatorId) : "",
                    salesCoordinatorName: formData.salesCoordinatorName ?? "",
                    customerOwnerId: formData.customerOwnerId ? Number(formData.customerOwnerId) : "",
                    customerOwnerName: formData.customerOwnerName ?? "",
                    customerOwnerType: formData.customerOwnerType ?? "",
                    customerOwnerValue: customerOwnerValue,
                  }}
                  onChange={(updates) => {
                    if (updates.customerOwnerValue !== undefined) {
                      setCustomerOwnerValue(updates.customerOwnerValue);
                    }
                    setFormData((prev) => ({
                      ...prev,
                      directorId:
                        updates.directorId !== undefined
                          ? updates.directorId === ""
                            ? null
                            : Number(updates.directorId)
                          : prev.directorId,
                      directorName:
                        updates.directorName !== undefined
                          ? updates.directorName
                          : prev.directorName,
                      directorCode:
                        updates.directorCode !== undefined
                          ? updates.directorCode
                          : prev.directorCode,
                      bdeUserId:
                        updates.bdeUserId !== undefined
                          ? updates.bdeUserId === ""
                            ? null
                            : Number(updates.bdeUserId)
                          : prev.bdeUserId,
                      bdeUserName:
                        updates.bdeUserName !== undefined
                          ? updates.bdeUserName
                          : prev.bdeUserName,
                      salesCoordinatorId:
                        updates.salesCoordinatorId !== undefined
                          ? updates.salesCoordinatorId === ""
                            ? null
                            : Number(updates.salesCoordinatorId)
                          : prev.salesCoordinatorId,
                      salesCoordinatorName:
                        updates.salesCoordinatorName !== undefined
                          ? updates.salesCoordinatorName
                          : prev.salesCoordinatorName,
                      customerOwnerId:
                        updates.customerOwnerId !== undefined
                          ? updates.customerOwnerId === ""
                            ? null
                            : Number(updates.customerOwnerId)
                          : prev.customerOwnerId,
                      customerOwnerName:
                        updates.customerOwnerName !== undefined
                          ? updates.customerOwnerName
                          : prev.customerOwnerName,
                      customerOwnerType:
                        updates.customerOwnerType !== undefined
                          ? updates.customerOwnerType
                          : prev.customerOwnerType,
                      customerOwnerValue:
                        updates.customerOwnerValue !== undefined
                          ? updates.customerOwnerValue
                          : (prev as any).customerOwnerValue,
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
                      value={formData.remarks || ""}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Add internal notes, communication highlights, or account instructions..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive ?? true}
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
              "Update Customer"
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

export default EditCustomerModal;
