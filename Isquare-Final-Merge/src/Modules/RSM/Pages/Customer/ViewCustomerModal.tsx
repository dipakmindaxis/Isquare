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
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Customer,
  CustomerAddress,
  IndustryItem,
  CustomerAreaItem,
  BdeUserItem,
  EmployeeSelectItem,
  DirectorItem,
  SalesCoordinatorItem,
  SalesUserManagerItem,
} from "./Types/CustomerTypes";
import {
  getCustomerById,
  getCustomerAddresses,
  validateCustomerAddress,
  type CustomerApiRecord,
} from "./Services/CustomerService";
import {
  getIndustries,
  getCustomerAreas,
  getBdeUsers,
  getEmployees,
  getDirectors,
  getSalesCoordinators,
  getSalesManagers,
} from "./Services/CustomerMasterDataService";

interface ViewCustomerModalProps {
  isOpen: boolean;
  customerId: number | null;
  onClose: () => void;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => (
  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-colors">
    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-[#154068] break-words">
      {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
    </p>
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
}> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-3 mt-4 first:mt-0">
    <div className="bg-[#FF7900] p-1.5 rounded text-white">
      <Icon size={14} />
    </div>
    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900]">
      {title}
    </h3>
  </div>
);

const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({
  isOpen,
  customerId,
  onClose,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [areas, setAreas] = useState<CustomerAreaItem[]>([]);
  const [bdeUsers, setBdeUsers] = useState<BdeUserItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [directors, setDirectors] = useState<DirectorItem[]>([]);
  const [salesCoordinators, setSalesCoordinators] = useState<SalesCoordinatorItem[]>([]);
  const [, setSalesManagers] = useState<SalesUserManagerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingAddrId, setValidatingAddrId] = useState<number | null>(null);
  const [validationMsg, setValidationMsg] = useState<{
    [addrId: number]: { success: boolean; text: string };
  }>({});

  useEffect(() => {
    if (isOpen && customerId) {
      let isMounted = true;
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [
            custData,
            addrData,
            indData,
            areaData,
            bdeData,
            empData,
            dirData,
            scData,
            smData,
          ] = await Promise.all([
            getCustomerById(customerId),
            getCustomerAddresses(customerId).catch(() => []),
            getIndustries().catch(() => []),
            getCustomerAreas().catch(() => []),
            getBdeUsers().catch(() => []),
            getEmployees().catch(() => []),
            getDirectors().catch(() => []),
            getSalesCoordinators().catch(() => []),
            getSalesManagers().catch(() => []),
          ]);

          if (!isMounted) return;

          setCustomer(custData);
          setIndustries(Array.isArray(indData) ? indData : []);
          setAreas(Array.isArray(areaData) ? areaData : []);
          setBdeUsers(Array.isArray(bdeData) ? bdeData : []);
          setEmployees(Array.isArray(empData) ? empData : []);
          setDirectors(Array.isArray(dirData) ? dirData : []);
          setSalesCoordinators(Array.isArray(scData) ? scData : []);
          setSalesManagers(Array.isArray(smData) ? smData : []);
          setAddresses(
            addrData && addrData.length > 0
              ? addrData
              : custData.addresses || []
          );
        } catch (err: unknown) {
          console.error(err);
          toast.error("Failed to load customer profile details.");
          onClose();
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, customerId, onClose]);

  const handleValidateAddress = async (addressId: number) => {
    if (!customerId) return;
    setValidatingAddrId(addressId);
    try {
      const res = await validateCustomerAddress(customerId, addressId);
      const isOk = res.isValid !== false && res.status !== "Failed";
      const msg = res.message || (isOk ? "Address verified successfully." : "Address validation failed.");
      setValidationMsg((prev) => ({
        ...prev,
        [addressId]: { success: isOk, text: msg },
      }));
      if (isOk) toast.success(msg);
      else toast.error(msg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validation error.";
      setValidationMsg((prev) => ({
        ...prev,
        [addressId]: { success: false, text: msg },
      }));
      toast.error(msg);
    } finally {
      setValidatingAddrId(null);
    }
  };

  if (!isOpen) return null;
  const custRecord = customer as CustomerApiRecord | null;

  const resolvedDirectorName =
    customer?.directorName ||
    custRecord?.DirectorName ||
    (customer?.directorId
      ? directors.find((d) => d.directorId === Number(customer.directorId))?.directorName ||
      employees.find((e) => e.id === Number(customer.directorId))?.fullName ||
      employees.find((e) => e.id === Number(customer.directorId))?.firstName ||
      `Director #${customer.directorId}`
      : "-");

  const resolvedBdeUserName =
    customer?.bdeUserName ||
    custRecord?.BDEUserName ||
    (customer?.bdeUserId && bdeUsers.length > 0
      ? bdeUsers.find(
        (b) =>
          b.id === Number(customer.bdeUserId) ||
          (b.code && b.code === String(customer.bdeUserId))
      )?.value
      : null) ||
    (customer?.bdeUserId && employees.length > 0
      ? employees.find((e) => e.id === Number(customer.bdeUserId))?.fullName ||
      employees.find((e) => e.id === Number(customer.bdeUserId))?.firstName
      : null) ||
    (customer?.salesCoordinatorId && salesCoordinators.length > 0
      ? (() => {
        const sc = salesCoordinators.find(
          (s) => s.salesCoordinatorId === Number(customer.salesCoordinatorId)
        );
        if (sc?.bdeUserId) {
          const matchedBde = bdeUsers.find((b) => b.id === sc.bdeUserId);
          return matchedBde?.value || sc.bdeUserName || null;
        }
        return null;
      })()
      : null) ||
    "-";

  const resolvedSalesPersonName =
    customer?.salesCoordinatorName ||
    custRecord?.SalesCoordinatorName ||
    (customer?.salesCoordinatorId && salesCoordinators.length > 0
      ? salesCoordinators.find(
        (s) => s.salesCoordinatorId === Number(customer.salesCoordinatorId)
      )?.salesCoordinatorName
      : null) ||
    (customer?.salesCoordinatorId && employees.length > 0
      ? employees.find((e) => e.id === Number(customer.salesCoordinatorId))?.fullName
      : null) ||
    (customer?.salesCoordinatorId ? `Sales Person #${customer.salesCoordinatorId}` : "-");

  const resolvedCustomerOwnerName = (() => {
    const rawOwnerName =
      customer?.customerOwnerName ||
      custRecord?.CustomerOwnerName ||
      custRecord?.OwnerName ||
      "";
    const rawOwnerType = (
      customer?.customerOwnerType ||
      custRecord?.CustomerOwnerType ||
      ""
    ).toUpperCase();
    const rawOwnerVal =
      customer?.customerOwnerValue ||
      custRecord?.CustomerOwnerValue ||
      "";

    // 1. Explicit owner type is BDE
    if (rawOwnerType === "BDE" || rawOwnerVal.startsWith("BDE:")) {
      return resolvedBdeUserName !== "-" ? resolvedBdeUserName : rawOwnerName || "-";
    }

    // 2. Explicit owner type is Director
    if (rawOwnerType === "DIRECTOR" || rawOwnerVal.startsWith("DIRECTOR:")) {
      return resolvedDirectorName !== "-" ? resolvedDirectorName : rawOwnerName || "-";
    }

    // 3. If customerOwnerId directly matches customer's assigned BDE User
    if (
      customer?.customerOwnerId &&
      customer?.bdeUserId &&
      Number(customer.customerOwnerId) === Number(customer.bdeUserId)
    ) {
      return resolvedBdeUserName !== "-" ? resolvedBdeUserName : rawOwnerName || "-";
    }

    // 4. If customerOwnerId directly matches customer's assigned Director
    if (
      customer?.customerOwnerId &&
      customer?.directorId &&
      Number(customer.customerOwnerId) === Number(customer.directorId)
    ) {
      return resolvedDirectorName !== "-" ? resolvedDirectorName : rawOwnerName || "-";
    }

    // 5. If raw owner name is directly present
    if (rawOwnerName && rawOwnerName.trim()) {
      return rawOwnerName.trim();
    }

    // 6. Match by customerOwnerId against BDEs, Directors, Employees
    if (customer?.customerOwnerId) {
      const ownerId = Number(customer.customerOwnerId);
      const matchedBde = bdeUsers.find(
        (b) => b.id === ownerId || (b.code && b.code === String(ownerId))
      );
      if (matchedBde) return matchedBde.value;

      const matchedDir = directors.find((d) => d.directorId === ownerId);
      if (matchedDir) return matchedDir.directorName;

      const matchedEmp = employees.find((e) => e.id === ownerId);
      if (matchedEmp) return matchedEmp.fullName;

      return `Owner #${ownerId}`;
    }

    return "-";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200">
        {/* Header */}
        <div className="bg-[#FF7900] p-4 sm:p-6 text-white flex justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-inner shrink-0">
              {customer?.customerName
                ? customer.customerName.charAt(0).toUpperCase()
                : "C"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-xl font-bold tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {customer?.customerName || "Customer Details"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${customer?.isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                    }`}
                >
                  {customer?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-orange-100 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 sm:mt-1">
                <span>Code: {customer?.customerCode || "-"}</span>
                <span className="hidden sm:inline opacity-60">•</span>
                <span className="truncate">
                  Company: {customer?.companyName || "-"}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white shrink-0"
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF7900]" />
              <p className="text-sm font-medium text-gray-500">
                Loading complete customer profile...
              </p>
            </div>
          ) : customer ? (
            <>
              {/* SECTION 1 - BASIC INFORMATION */}
              <div>
                <SectionHeader
                  icon={Building2}
                  title="Basic Business Information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <DetailItem
                    label="Customer Code"
                    value={customer.customerCode}
                  />
                  <DetailItem
                    label="Customer Name"
                    value={customer.customerName}
                  />
                  <DetailItem
                    label="Company Name"
                    value={customer.companyName}
                  />
                  <DetailItem
                    label="Short Name"
                    value={customer.customerShortName}
                  />
                  <DetailItem
                    label="Company Group"
                    value={customer.companyGroup}
                  />
                  <DetailItem label="Plant Code" value={customer.plantCode} />
                  <DetailItem label="Email Address" value={customer.email || customer.emailAddress} />
                  <DetailItem label="Mobile Number" value={customer.mobile || customer.phone} />
                  <DetailItem
                    label="Industry Type"
                    value={
                      customer.industryName ||
                      industries.find((i) => i.industryId === customer.industryId)
                        ?.industryName ||
                      customer.industryId
                    }
                  />
                </div>
              </div>

              {/* SECTION 2 - CATEGORIZATION */}
              <div>
                <SectionHeader
                  icon={Briefcase}
                  title="Status & Categorization"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem
                    label="Customer Status"
                    value={
                      customer.customerStatusName ||
                      customer.customerStatusId
                    }
                  />
                  <DetailItem
                    label="Customer Source"
                    value={
                      customer.customerSourceName ||
                      customer.customerSourceId
                    }
                  />
                  <DetailItem
                    label="Customer Area"
                    value={
                      customer.customerAreaName ||
                      areas.find((a) => a.customerAreaId === customer.customerAreaId)
                        ?.areaName ||
                      customer.customerAreaId
                    }
                  />
                </div>
              </div>

              {/* SECTION 3 - TAX & STATUTORY */}
              <div>
                <SectionHeader
                  icon={FileText}
                  title="Tax & Statutory Information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem label="PAN Number" value={customer.pan} />
                  <DetailItem label="TAN Number" value={customer.tan} />
                  <DetailItem label="GSTIN Number" value={customer.gstin} />
                  <DetailItem label="CIN Number" value={customer.cin} />
                  <DetailItem label="MSME Number" value={customer.msmeNumber} />
                  <DetailItem
                    label="Payment Term"
                    value={
                      customer.paymentTermName ||
                      customer.paymentTermId ||
                      customer.paymentTermsId
                    }
                  />
                </div>
              </div>

              {/* SECTION 4 - SALES ASSIGNMENT */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Sales & Organization Assignment"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <DetailItem
                    label="Director Name"
                    value={resolvedDirectorName}
                  />
                  <DetailItem
                    label="BDE User"
                    value={resolvedBdeUserName}
                  />
                  <DetailItem
                    label="Sales Person"
                    value={resolvedSalesPersonName}
                  />
                  <DetailItem
                    label="Customer Owner"
                    value={resolvedCustomerOwnerName}
                  />
                </div>
              </div>

              {/* SECTION 5 - CUSTOMER ADDRESSES */}
              <div>
                <SectionHeader
                  icon={MapPin}
                  title={`Customer Addresses (${addresses.length})`}
                />
                {addresses.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">
                      No addresses configured for this customer.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr.addressId || idx}
                        className={`p-4 rounded-xl border transition-all ${addr.isPrimary
                          ? "border-blue-300 bg-blue-50/30 ring-1 ring-blue-300/50"
                          : "border-gray-200 bg-white"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs uppercase text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {addr.addressType || "Billing"}
                            </span>
                            {addr.isPrimary && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          {addr.addressId && (
                            <button
                              type="button"
                              onClick={() => handleValidateAddress(addr.addressId!)}
                              disabled={validatingAddrId === addr.addressId}
                              className="text-[11px] font-medium text-[#154068] bg-[#154068]/10 hover:bg-[#154068]/20 px-2.5 py-1 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {validatingAddrId === addr.addressId ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle size={12} />
                              )}
                              <span>Validate</span>
                            </button>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-800 leading-relaxed mb-3">
                          {addr.address}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2 text-gray-600">
                          <div>
                            <span className="text-gray-400">City / State: </span>
                            <span className="font-medium text-gray-700">
                              {addr.cityName || addr.cityId || "-"}, {addr.stateName || addr.stateId || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Pincode: </span>
                            <span className="font-medium text-gray-700">{addr.pincode || "-"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">Country: </span>
                            <span className="font-medium text-gray-700">{addr.countryName || addr.countryId || "-"}</span>
                          </div>
                        </div>

                        {addr.addressId && validationMsg[addr.addressId] && (
                          <div
                            className={`mt-2.5 p-2 rounded text-xs flex items-center gap-1.5 ${validationMsg[addr.addressId].success
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                              }`}
                          >
                            {validationMsg[addr.addressId].success ? (
                              <CheckCircle size={14} className="shrink-0 text-emerald-600" />
                            ) : (
                              <AlertCircle size={14} className="shrink-0 text-red-600" />
                            )}
                            <span>{validationMsg[addr.addressId].text}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 6 - OTHER DETAILS */}
              <div>
                <SectionHeader icon={Calendar} title="Other Details & Remarks" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem
                    label="Registration Date"
                    value={
                      customer.registrationDate
                        ? customer.registrationDate.substring(0, 10)
                        : "-"
                    }
                  />
                  <DetailItem
                    label="Visited Date"
                    value={
                      customer.visitedDate
                        ? customer.visitedDate.substring(0, 10)
                        : "-"
                    }
                  />
                  <DetailItem
                    label="Account Status"
                    value={customer.isActive ? "Active Account" : "Inactive"}
                  />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <DetailItem label="Remarks / Notes" value={customer.remarks} />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerModal;
