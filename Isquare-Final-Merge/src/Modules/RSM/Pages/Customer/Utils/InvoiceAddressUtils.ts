/**
 * InvoiceAddressUtils.ts
 * Helper utilities, models, and hooks for Customer Bill To and Ship To functionality
 * in Invoice Master and other future sales order/invoice modules.
 */

import type { CustomerAddress } from "../Types/CustomerTypes";

export interface InvoiceAddressOption {
  value: number; // addressId
  label: string; // "Location Name – Plant Code" or fallback
  address: CustomerAddress;
  fullAddress: string;
  plantCode: string;
  locationName: string;
}

export interface InvoiceAddressSelectionState {
  billToAddressId: number | null;
  selectedBillToAddress: CustomerAddress | null;
  billingFullAddress: string;
  billingPlantCode: string;

  sameAsBilling: boolean;

  shipToAddressId: number | null;
  selectedShipToAddress: CustomerAddress | null;
  deliveryFullAddress: string;
  deliveryPlantCode: string;
}

/**
 * Filter addresses where Use for Billing = true (or fallback if primary and flags unset)
 */
export const getBillingAddresses = (addresses: CustomerAddress[] = []): CustomerAddress[] => {
  return addresses.filter(
    (a) => a.isActive !== false && (a.isBilling === true || (a.isPrimary && a.isBilling !== false && a.isDelivery === undefined))
  );
};

/**
 * Filter addresses where Use for Delivery = true (or fallback if primary and flags unset)
 */
export const getDeliveryAddresses = (addresses: CustomerAddress[] = []): CustomerAddress[] => {
  return addresses.filter(
    (a) =>
      a.isActive !== false &&
      (a.isDelivery === true || a.isShipping === true || (a.isPrimary && a.isDelivery !== false && a.isBilling === undefined))
  );
};

/**
 * Formats full address string including street, city, state, country, and pincode
 */
export const formatFullAddressText = (addr?: CustomerAddress | null): string => {
  if (!addr) return "";
  const parts: string[] = [];
  if (addr.locationName && addr.locationName.trim()) {
    parts.push(addr.locationName.trim());
  }
  if (addr.address && addr.address.trim()) {
    parts.push(addr.address.trim());
  }
  if (addr.cityName && addr.cityName.trim()) {
    parts.push(addr.cityName.trim());
  }
  if (addr.stateName && addr.stateName.trim()) {
    parts.push(addr.stateName.trim());
  }
  if (addr.countryName && addr.countryName.trim()) {
    parts.push(addr.countryName.trim());
  }
  if (addr.pincode && addr.pincode.trim()) {
    parts.push(`PIN: ${addr.pincode.trim()}`);
  }
  return parts.join(", ");
};

/**
 * Format address dropdown option label: "Location Name – Plant Code"
 * Example: "Ambethan Plant – PL01" or "Biradwadi Warehouse – PL02"
 */
export const formatAddressDropdownLabel = (addr: CustomerAddress): string => {
  const location =
    (addr.locationName && addr.locationName.trim()) ||
    (addr.addressType && addr.addressType.trim()) ||
    "Address";
  const plantCode = addr.plantCode && addr.plantCode.trim();

  return plantCode ? `${location} – ${plantCode}` : location;
};

/**
 * Converts addresses into React-Select / SearchableSelect compatible options
 */
export const mapToAddressOptions = (addresses: CustomerAddress[]): InvoiceAddressOption[] => {
  return addresses.map((a, index) => {
    const id = a.addressId || index + 1;
    return {
      value: id,
      label: formatAddressDropdownLabel(a),
      address: a,
      fullAddress: formatFullAddressText(a),
      plantCode: a.plantCode || "",
      locationName: a.locationName || a.addressType || "",
    };
  });
};

/**
 * Handles Bill To address selection and automatic cascade to Ship To if "Same as Billing" is enabled
 */
export const handleBillToSelection = (
  selectedOption: InvoiceAddressOption | null,
  currentState: InvoiceAddressSelectionState
): InvoiceAddressSelectionState => {
  const addr = selectedOption?.address || null;
  const fullAddress = selectedOption?.fullAddress || "";
  const plantCode = selectedOption?.plantCode || "";
  const addressId = selectedOption?.value || null;

  const nextState: InvoiceAddressSelectionState = {
    ...currentState,
    billToAddressId: addressId,
    selectedBillToAddress: addr,
    billingFullAddress: fullAddress,
    billingPlantCode: plantCode,
  };

  if (currentState.sameAsBilling) {
    nextState.shipToAddressId = addressId;
    nextState.selectedShipToAddress = addr;
    nextState.deliveryFullAddress = fullAddress;
    nextState.deliveryPlantCode = plantCode;
  }

  return nextState;
};

/**
 * Handles Ship To address selection when "Same as Billing" is false
 */
export const handleShipToSelection = (
  selectedOption: InvoiceAddressOption | null,
  currentState: InvoiceAddressSelectionState
): InvoiceAddressSelectionState => {
  return {
    ...currentState,
    shipToAddressId: selectedOption?.value || null,
    selectedShipToAddress: selectedOption?.address || null,
    deliveryFullAddress: selectedOption?.fullAddress || "",
    deliveryPlantCode: selectedOption?.plantCode || "",
  };
};

/**
 * Handles "Same as Billing Address" checkbox toggle
 */
export const toggleSameAsBilling = (
  checked: boolean,
  currentState: InvoiceAddressSelectionState
): InvoiceAddressSelectionState => {
  if (checked) {
    return {
      ...currentState,
      sameAsBilling: true,
      shipToAddressId: currentState.billToAddressId,
      selectedShipToAddress: currentState.selectedBillToAddress,
      deliveryFullAddress: currentState.billingFullAddress,
      deliveryPlantCode: currentState.billingPlantCode,
    };
  }

  return {
    ...currentState,
    sameAsBilling: false,
    shipToAddressId: null,
    selectedShipToAddress: null,
    deliveryFullAddress: "",
    deliveryPlantCode: "",
  };
};

/**
 * Resets address state when customer changes
 */
export const resetInvoiceAddressState = (): InvoiceAddressSelectionState => ({
  billToAddressId: null,
  selectedBillToAddress: null,
  billingFullAddress: "",
  billingPlantCode: "",
  sameAsBilling: true,
  shipToAddressId: null,
  selectedShipToAddress: null,
  deliveryFullAddress: "",
  deliveryPlantCode: "",
});

