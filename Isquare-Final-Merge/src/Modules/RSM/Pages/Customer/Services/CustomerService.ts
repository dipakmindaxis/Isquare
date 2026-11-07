import axios from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  Customer,
  CustomerAddress,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerAddressPayload,
  AddressValidationResult,
  CustomerDuplicateCheckPayload,
  CustomerDuplicateCheckResult,
} from "../Types/CustomerTypes";

export type {
  Customer,
  CustomerAddress,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerAddressPayload,
  AddressValidationResult,
  CustomerDuplicateCheckPayload,
  CustomerDuplicateCheckResult,
};

export interface CustomerApiRecord extends Customer {
  DirectorId?: number;
  DirectorName?: string;
  BDEUserId?: number | null;
  BDEUserName?: string | null;
  SalesCoordinatorId?: number;
  SalesCoordinatorName?: string;
  CustomerOwnerId?: number;
  CustomerOwnerName?: string;
  CustomerOwnerType?: string | null;
  CustomerOwnerValue?: string | null;
  OwnerName?: string | null;
}

const normalizeCustomer = (customer: CustomerApiRecord): Customer => {
  if (!customer) return {} as Customer;
  const raw = customer as any;
  const rawId = raw.customerId ?? raw.CustomerId ?? raw.companyId ?? raw.CompanyId ?? raw.id ?? raw.ID;
  const custId = rawId ? Number(rawId) : 0;
  const customerCode = raw.customerCode || raw.CustomerCode || raw.companyCode || raw.CompanyCode || "";
  const customerName = raw.customerName || raw.CustomerName || raw.companyName || raw.CompanyName || "";
  const companyName = raw.companyName || raw.CompanyName || customerName;

  const directorId = customer.directorId || customer.DirectorId;
  const directorName = customer.directorName || customer.DirectorName;
  const bdeUserId = customer.bdeUserId || customer.BDEUserId;
  const bdeUserName = customer.bdeUserName || customer.BDEUserName;
  const salesCoordinatorId = customer.salesCoordinatorId || customer.SalesCoordinatorId;
  const salesCoordinatorName = customer.salesCoordinatorName || customer.SalesCoordinatorName;
  const customerOwnerId = customer.customerOwnerId || customer.CustomerOwnerId;
  const customerOwnerName = customer.customerOwnerName || customer.CustomerOwnerName || customer.OwnerName;
  const customerOwnerType = customer.customerOwnerType || customer.CustomerOwnerType;
  const customerOwnerValue = customer.customerOwnerValue || customer.CustomerOwnerValue;
  const email = customer.email || raw.Email || raw.emailAddress || raw.EmailAddress;
  const alternateEmail = customer.alternateEmail || raw.AlternateEmail;
  const mobile = customer.mobile || raw.Mobile || raw.phone || raw.Phone;
  const alternateMobile = customer.alternateMobile || raw.AlternateMobile;

  return {
    ...customer,
    customerId: custId,
    companyId: custId,
    customerCode,
    customerName,
    companyName,
    ...(directorId ? { directorId: Number(directorId) } : {}),
    ...(directorName ? { directorName: String(directorName) } : {}),
    ...(bdeUserId ? { bdeUserId: Number(bdeUserId) } : {}),
    ...(bdeUserName ? { bdeUserName: String(bdeUserName) } : {}),
    ...(salesCoordinatorId ? { salesCoordinatorId: Number(salesCoordinatorId) } : {}),
    ...(salesCoordinatorName ? { salesCoordinatorName: String(salesCoordinatorName) } : {}),
    ...(customerOwnerId ? { customerOwnerId: Number(customerOwnerId) } : {}),
    ...(customerOwnerName ? { customerOwnerName: String(customerOwnerName) } : {}),
    ...(customerOwnerType ? { customerOwnerType: String(customerOwnerType) } : {}),
    ...(customerOwnerValue ? { customerOwnerValue: String(customerOwnerValue) } : {}),
    ...(email ? { email: String(email) } : {}),
    ...(alternateEmail ? { alternateEmail: String(alternateEmail) } : {}),
    ...(mobile ? { mobile: String(mobile) } : {}),
    ...(alternateMobile ? { alternateMobile: String(alternateMobile) } : {}),
  };
};

const extractErrorMessage = (error: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.Message) return data.Message;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (data?.Title) return data.Title;
    if (data?.errors && typeof data.errors === "object") {
      const msgs = Object.entries(data.errors)
        .map(([key, errs]) => `${key}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
        .join(" | ");
      if (msgs) return msgs;
    }
    if (data?.error) return data.error;
    if (error.response?.statusText) return `${error.response.statusText} (${error.response.status})`;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return defaultMsg;
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await apiClient.get<
      CustomerApiRecord[] | { data?: CustomerApiRecord[] }
    >(API_ENDPOINTS.Customer);
    if (Array.isArray(response.data)) return response.data.map(normalizeCustomer);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(normalizeCustomer);
    }
    return [];
  } catch (error) {
    console.warn("Failed to fetch customers from backend:", error);
    return [];
  }
};

export const getCustomers = getAllCustomers;

export const getNextCustomerCode = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{ customerCode: string } | string>(
      `${API_ENDPOINTS.Customer}/next-code`
    );
    if (typeof response.data === "string") {
      return response.data;
    }
    if (response.data && response.data.customerCode) {
      return response.data.customerCode;
    }
    return "";
  } catch (error) {
    console.error("Failed to fetch next customer code:", error);
    return "";
  }
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const response = await apiClient.get<CustomerApiRecord | { data?: CustomerApiRecord }>(
    `${API_ENDPOINTS.Customer}/${id}`
  );
  const data = (response.data && (response.data as any).data) ? (response.data as any).data : response.data;
  return normalizeCustomer(data);
};

export const createCustomer = async (
  payload: CustomerCreatePayload
): Promise<Customer> => {
  try {
    const response = await apiClient.post<Customer>(
      API_ENDPOINTS.Customer,
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Customer POST error response:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error(extractErrorMessage(error, "Failed to create customer."));
  }
};

export const updateCustomer = async (
  id: number,
  payload: CustomerUpdatePayload
): Promise<void> => {
  try {
    await apiClient.put(`${API_ENDPOINTS.Customer}/${id}`, payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Customer PUT error response:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error(extractErrorMessage(error, "Failed to update customer."));
  }
};

export const deleteCustomer = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_ENDPOINTS.Customer}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Customer DELETE error response:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error(extractErrorMessage(error, "Failed to delete customer."));
  }
};

export const getCustomerAddresses = async (
  id: number
): Promise<CustomerAddress[]> => {
  const response = await apiClient.get<CustomerAddress[]>(
    `${API_ENDPOINTS.Customer}/${id}/addresses`
  );
  return response.data;
};

export const getCustomerAddressValidation = async (
  id: number,
  addressId: number
): Promise<AddressValidationResult> => {
  const response = await apiClient.get<AddressValidationResult>(
    `${API_ENDPOINTS.Customer}/${id}/validate-address/${addressId}`
  );
  return response.data;
};

export const validateCustomerAddress = async (
  id: number,
  addressId: number
): Promise<AddressValidationResult> => {
  const response = await apiClient.post<AddressValidationResult>(
    `${API_ENDPOINTS.Customer}/${id}/validate-address/${addressId}`
  );
  return response.data;
};

export const checkCustomerDuplicate = async (
  payload: CustomerDuplicateCheckPayload
): Promise<CustomerDuplicateCheckResult> => {
  try {
    const response = await apiClient.post<CustomerDuplicateCheckResult>(
      `${API_ENDPOINTS.Customer}/check-duplicate`,
      payload
    );
    return response.data;
  } catch (error) {
    console.warn("Duplicate check API call failed:", error);
    return {
      isDuplicate: false,
      isExactMatch: false,
      isPossibleMatch: false,
      matchType: "None",
      message: "Duplicate check service unavailable.",
      matchedCustomers: [],
    };
  }
};

export const addAddressToExistingCustomer = async (
  customerId: number,
  addressPayload: CustomerAddressPayload
): Promise<CustomerAddress> => {
  try {
    const response = await apiClient.post<CustomerAddress>(
      `${API_ENDPOINTS.Customer}/${customerId}/addresses`,
      addressPayload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Add customer address error response:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error(extractErrorMessage(error, "Failed to add address to existing customer."));
  }
};
