import React, { useState } from "react";
import { SearchableSelect } from "../../../../Components/Common/SearchableSelect";
import { Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type {
  CustomerAddress,
  CountryItem,
  AddressTypeItem,
} from "./Types/CustomerTypes";
import { validateCustomerAddress } from "./Services/CustomerService";
import { toast } from "sonner";

interface CustomerAddressSectionProps {
  addresses: CustomerAddress[];
  onChange: (addresses: CustomerAddress[]) => void;
  customerId?: number;
  countries?: CountryItem[];
  addressTypes: AddressTypeItem[];
  readOnly?: boolean;
}

const CustomerAddressSection: React.FC<CustomerAddressSectionProps> = ({
  addresses,
  onChange,
  customerId,
  addressTypes,
  readOnly = false,
}) => {
  const [validatingIndex, setValidatingIndex] = useState<number | null>(null);
  const [validationResults, setValidationResults] = useState<{
    [index: number]: { success: boolean; message: string };
  }>({});

  // Purely dynamic address types fetched from backend master data
  const dynamicAddressTypes: string[] = React.useMemo(() => {
    if (!Array.isArray(addressTypes)) return [];
    const list: string[] = [];
    for (const t of addressTypes) {
      const val = (t.addressTypeName || t.name || t.type || "").trim();
      if (val && !list.includes(val)) {
        list.push(val);
      }
    }
    return list;
  }, [addressTypes]);

  const handleAddAddress = () => {
    const defaultType = dynamicAddressTypes[0] || "";
    const newAddr: CustomerAddress = {
      locationName: "",
      plantCode: "",
      addressType: defaultType,
      address: "",
      countryId: 1,
      stateId: 1,
      cityId: 1,
      pincode: "",
      isBilling: true,
      isDelivery: true,
      isPrimary: addresses.length === 0,
      isActive: true,
    };
    onChange([...addresses, newAddr]);
  };

  const handleRemoveAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    if (addresses[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleFieldChange = (
    index: number,
    field: keyof CustomerAddress,
    value: string | number | boolean | null
  ) => {
    const updated = [...addresses];
    const current = { ...updated[index], [field]: value };

    // Primary address exclusivity
    if (field === "isPrimary" && value === true) {
      updated.forEach((a, i) => {
        a.isPrimary = i === index;
      });
    }

    updated[index] = current;
    onChange(updated);
  };

  const handleValidateAddress = async (index: number) => {
    const addr = addresses[index];
    if (!customerId || !addr.addressId) {
      toast.info("Please save the customer address first before running server validation.");
      return;
    }

    setValidatingIndex(index);
    try {
      const result = await validateCustomerAddress(customerId, addr.addressId);
      const isSuccess = result.isValid !== false && result.status !== "Failed";
      const message = result.message || (isSuccess ? "Address is valid." : "Address validation failed.");

      setValidationResults((prev) => ({
        ...prev,
        [index]: { success: isSuccess, message },
      }));

      if (isSuccess) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validation request failed.";
      setValidationResults((prev) => ({
        ...prev,
        [index]: { success: false, message: msg },
      }));
      toast.error(msg);
    } finally {
      setValidatingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">
            Customer Addresses ({addresses.length})
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Add multiple plant or office locations with plant codes, billing, and delivery specifications.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddAddress}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FF7900] text-white text-xs font-semibold rounded-lg hover:bg-[#e06800] transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>

      {/* Empty State */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs sm:text-sm">
          No addresses added. {!readOnly && 'Click "+ Add Address" to configure locations.'}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr, idx) => {
            const hasAtLeastOneUse = !!addr.isBilling || !!addr.isDelivery || !!addr.isShipping;

            // Options dynamically fetched from addressTypes master
            const typeOptions = (() => {
              const list = [...dynamicAddressTypes];
              if (addr.addressType && !list.includes(addr.addressType)) {
                list.unshift(addr.addressType);
              }
              return list.map((t) => ({ value: t, label: t }));
            })();

            return (
              <div
                key={idx}
                className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white transition space-y-4 shadow-2xs"
              >
                {/* Header: Title, Badges, & Action Buttons */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-gray-800">
                      Address #{idx + 1}
                    </span>
                    {addr.locationName && (
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        • {addr.locationName}
                      </span>
                    )}
                    {addr.isPrimary && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                    {addr.isActive === false && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {customerId && addr.addressId && (
                      <button
                        type="button"
                        disabled={validatingIndex === idx}
                        onClick={() => handleValidateAddress(idx)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition cursor-pointer"
                        title="Validate address via server"
                      >
                        {validatingIndex === idx ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        <span>Validate</span>
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(idx)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 transition rounded-md cursor-pointer"
                        title="Remove Address"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Message */}
                {validationResults[idx] && (
                  <div
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                      validationResults[idx].success
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {validationResults[idx].success ? (
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-red-600 shrink-0" />
                    )}
                    <span>{validationResults[idx].message}</span>
                  </div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-3.5 text-sm">
                  {/* Plant / Location Name */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Plant / Location Name <span className="text-red-500">*</span>
                    </label>
                    {readOnly ? (
                      <p className="font-medium text-gray-900 py-1">{addr.locationName || "-"}</p>
                    ) : (
                      <input
                        type="text"
                        value={addr.locationName || ""}
                        onChange={(e) =>
                          handleFieldChange(idx, "locationName", e.target.value)
                        }
                        placeholder="e.g. Ambethan Plant"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 min-h-[42px] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 placeholder:text-gray-400"
                      />
                    )}
                  </div>

                  {/* Plant Code */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Plant Code <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    {readOnly ? (
                      <p className="font-medium text-gray-900 py-1">{addr.plantCode || "-"}</p>
                    ) : (
                      <input
                        type="text"
                        value={addr.plantCode || ""}
                        onChange={(e) =>
                          handleFieldChange(idx, "plantCode", e.target.value)
                        }
                        placeholder="e.g. PL-01"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 min-h-[42px] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 placeholder:text-gray-400"
                      />
                    )}
                  </div>

                  {/* Address Type - Purely Dynamic */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Address Type
                    </label>
                    {readOnly ? (
                      <p className="font-medium text-gray-900 py-1">{addr.addressType || "-"}</p>
                    ) : (
                      <SearchableSelect
                        value={addr.addressType || (typeOptions[0]?.value ?? "")}
                        onChange={(val) =>
                          handleFieldChange(idx, "addressType", String(val || ""))
                        }
                        options={typeOptions}
                        placeholder="Select Address Type..."
                      />
                    )}
                  </div>

                  {/* Full Address / Street (Spans 2 columns) */}
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Full Address / Street <span className="text-red-500">*</span>
                    </label>
                    {readOnly ? (
                      <p className="font-medium text-gray-900 py-1">{addr.address || "-"}</p>
                    ) : (
                      <input
                        type="text"
                        value={addr.address || ""}
                        onChange={(e) =>
                          handleFieldChange(idx, "address", e.target.value)
                        }
                        placeholder="Enter building, street, plot number, area details"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 min-h-[42px] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 placeholder:text-gray-400"
                      />
                    )}
                  </div>

                  {/* Pin Code */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">
                      Pin Code
                    </label>
                    {readOnly ? (
                      <p className="font-medium text-gray-900 py-1">{addr.pincode || "-"}</p>
                    ) : (
                      <input
                        type="text"
                        value={addr.pincode || ""}
                        onChange={(e) =>
                          handleFieldChange(idx, "pincode", e.target.value)
                        }
                        placeholder="e.g. 411026"
                        maxLength={10}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 min-h-[42px] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 placeholder:text-gray-400"
                      />
                    )}
                  </div>
                </div>

                {/* Clean Bottom Checkbox Bar */}
                {!readOnly && (
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs">
                    {/* Left: Address Use */}
                    <div className="flex flex-wrap items-center gap-5">
                      <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">
                        Address Use <span className="text-red-500">*</span>:
                      </span>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900 select-none">
                        <input
                          type="checkbox"
                          checked={!!addr.isBilling}
                          onChange={(e) =>
                            handleFieldChange(idx, "isBilling", e.target.checked)
                          }
                          className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                        />
                        <span>Use for Billing (Bill To)</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900 select-none">
                        <input
                          type="checkbox"
                          checked={!!addr.isDelivery || !!addr.isShipping}
                          onChange={(e) => {
                            handleFieldChange(idx, "isDelivery", e.target.checked);
                            handleFieldChange(idx, "isShipping", e.target.checked);
                          }}
                          className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                        />
                        <span>Use for Delivery (Ship To)</span>
                      </label>
                    </div>

                    {/* Right: Primary & Active */}
                    <div className="flex items-center gap-5">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                        <input
                          type="checkbox"
                          checked={!!addr.isPrimary}
                          onChange={(e) =>
                            handleFieldChange(idx, "isPrimary", e.target.checked)
                          }
                          className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                        />
                        <span>Primary Address</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                        <input
                          type="checkbox"
                          checked={addr.isActive !== false}
                          onChange={(e) =>
                            handleFieldChange(idx, "isActive", e.target.checked)
                          }
                          className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                        />
                        <span>Active</span>
                      </label>
                    </div>

                    {/* Validation error for Address Use */}
                    {!hasAtLeastOneUse && (
                      <div className="w-full text-xs text-red-500 font-medium flex items-center gap-1.5 pt-0.5">
                        <AlertCircle size={13} />
                        Please select at least one Address Use (Billing or Delivery).
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerAddressSection;
