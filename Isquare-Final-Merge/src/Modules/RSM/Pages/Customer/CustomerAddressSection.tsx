import React, { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type {
  CustomerAddress,
  CountryItem,
  StateItem,
  CityItem,
  AddressTypeItem,
} from "./Types/CustomerTypes";
import {
  getStates,
  getCities,
} from "./Services/CustomerMasterDataService";
import { validateCustomerAddress } from "./Services/CustomerService";
import { toast } from "sonner";

interface CustomerAddressSectionProps {
  addresses: CustomerAddress[];
  onChange: (addresses: CustomerAddress[]) => void;
  customerId?: number;
  countries: CountryItem[];
  addressTypes: AddressTypeItem[];
  readOnly?: boolean;
}

const CustomerAddressSection: React.FC<CustomerAddressSectionProps> = ({
  addresses,
  onChange,
  customerId,
  countries,
  addressTypes,
  readOnly = false,
}) => {
  // Cache for states and cities per address index
  const [statesByAddress, setStatesByAddress] = useState<{
    [index: number]: StateItem[];
  }>({});
  const [citiesByAddress, setCitiesByAddress] = useState<{
    [index: number]: CityItem[];
  }>({});
  const [validatingIndex, setValidatingIndex] = useState<number | null>(null);
  const [validationResults, setValidationResults] = useState<{
    [index: number]: { success: boolean; message: string };
  }>({});

  // When addresses are initialized, load dependent states & cities
  useEffect(() => {
    addresses.forEach(async (addr, idx) => {
      if (addr.countryId) {
        try {
          const fetchedStates = await getStates(addr.countryId);
          setStatesByAddress((prev) =>
            prev[idx] ? prev : { ...prev, [idx]: fetchedStates }
          );
        } catch (e) {
          console.error("Failed to load states for address " + idx, e);
        }
      }
      if (addr.stateId) {
        try {
          const fetchedCities = await getCities(addr.stateId);
          setCitiesByAddress((prev) =>
            prev[idx] ? prev : { ...prev, [idx]: fetchedCities }
          );
        } catch (e) {
          console.error("Failed to load cities for address " + idx, e);
        }
      }
    });
  }, [addresses]);

  const handleAddAddress = () => {
    const newAddr: CustomerAddress = {
      addressType: addressTypes[0]?.name || addressTypes[0]?.addressTypeName || "Billing",
      address: "",
      countryId: countries[0]?.countryId || 1,
      stateId: 0,
      cityId: 0,
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

  const handleFieldChange = async (
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

    // Country changed -> reset state and city
    if (field === "countryId") {
      const countryId = Number(value);
      current.countryId = countryId;
      current.stateId = 0;
      current.cityId = 0;
      try {
        const fetchedStates = await getStates(countryId);
        setStatesByAddress((prev) => ({ ...prev, [index]: fetchedStates }));
        setCitiesByAddress((prev) => ({ ...prev, [index]: [] }));
      } catch (err) {
        console.error(err);
      }
    }

    // State changed -> reset city
    if (field === "stateId") {
      const stateId = Number(value);
      current.stateId = stateId;
      current.cityId = 0;
      try {
        const fetchedCities = await getCities(stateId);
        setCitiesByAddress((prev) => ({ ...prev, [index]: fetchedCities }));
      } catch (err) {
        console.error(err);
      }
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
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

                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
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

                {/* Country */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.countryName || "-"}</p>
                  ) : (
                    <select
                      value={addr.countryId || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "countryId", Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {(Array.isArray(countries) ? countries : []).map((c) => (
                        <option key={c.countryId} value={c.countryId}>
                          {c.countryName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.stateName || "-"}</p>
                  ) : (
                    <select
                      value={addr.stateId || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "stateId", Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {(statesByAddress[idx] || []).map((s) => (
                        <option key={s.stateId} value={s.stateId}>
                          {s.stateName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {readOnly ? (
                    <p className="font-medium text-gray-900">{addr.cityName || "-"}</p>
                  ) : (
                    <select
                      value={addr.cityId || ""}
                      onChange={(e) =>
                        handleFieldChange(idx, "cityId", Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select City</option>
                      {(citiesByAddress[idx] || []).map((ci) => (
                        <option key={ci.cityId} value={ci.cityId}>
                          {ci.cityName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pincode
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
