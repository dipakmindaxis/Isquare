import React, { useState } from "react";
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

  const handleAddAddress = () => {
    const newAddr: CustomerAddress = {
      addressType: addressTypes[0]?.name || addressTypes[0]?.addressTypeName || "Billing",
      address: "",
      countryId: 1,
      stateId: 1,
      cityId: 1,
      pincode: "",
      isPrimary: addresses.length === 0,
      isActive: true,
    };
    onChange([...addresses, newAddr]);
  };

  const handleRemoveAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFieldChange = (
    index: number,
    field: keyof CustomerAddress,
    value: string | number | boolean
  ) => {
    const updated = [...addresses];
    const current = { ...updated[index], [field]: value };

    // Handle primary address exclusivity
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
          Customer Addresses ({addresses.length})
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddAddress}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#154068] text-white text-xs font-medium rounded-md hover:bg-[#0d3357] transition shadow-sm min-h-[36px]"
          >
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
          No addresses added. {!readOnly && "Click \"Add Address\" to add an address."}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50/70 hover:bg-gray-50 transition space-y-3"
            >
              <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs text-[#154068] bg-blue-100 px-2 py-0.5 rounded">
                    #{idx + 1} {addr.addressType || "Address"}
                  </span>
                  {addr.isPrimary && (
                    <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  {addr.isActive === false && (
                    <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap ml-auto sm:ml-0">
                  {customerId && addr.addressId && (
                    <button
                      type="button"
                      disabled={validatingIndex === idx}
                      onClick={() => handleValidateAddress(idx)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition min-h-[30px]"
                      title="Validate this address via backend API"
                    >
                      {validatingIndex === idx ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Validate Address
                    </button>
                  )}

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 transition rounded hover:bg-red-50"
                      title="Remove Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Validation Result Banner */}
              {validationResults[idx] && (
                <div
                  className={`flex items-center gap-2 p-2 rounded text-xs ${
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

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-sm">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address Type
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.addressType || "-"}</p>
                  ) : (
                    <select
                      value={addr.addressType || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "addressType", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {addressTypes.length > 0 ? (
                        addressTypes.map((t) => {
                          const val = t.name || t.addressTypeName || t.type || String(t.id);
                          return (
                            <option key={t.id} value={val}>
                              {val}
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option value="Billing">Billing</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Registered">Registered</option>
                          <option value="Plant">Plant / Site</option>
                          <option value="Headquarters">Headquarters</option>
                          <option value="Correspondence">Correspondence</option>
                        </>
                      )}
                    </select>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Address / Street
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.address || "-"}</p>
                  ) : (
                    <input
                      type="text"
                      value={addr.address || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "address", e.target.value)
                      }
                      placeholder="Enter building, street, area details"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pin Code
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.pincode || "-"}</p>
                  ) : (
                    <input
                      type="text"
                      value={addr.pincode || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "pincode", e.target.value)
                      }
                      placeholder="e.g. 411026"
                      maxLength={10}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {!readOnly && (
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!addr.isPrimary}
                      onChange={(e) =>
                        handleFieldChange(idx, "isPrimary", e.target.checked)
                      }
                      className="h-3.5 w-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Primary Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addr.isActive !== false}
                      onChange={(e) =>
                        handleFieldChange(idx, "isActive", e.target.checked)
                      }
                      className="h-3.5 w-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Active</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAddressSection;
