import axios from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  Customer,
  CustomerAddress,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  AddressValidationResult,
} from "../Types/CustomerTypes";

export type { Customer, CustomerAddress, CustomerCreatePayload, CustomerUpdatePayload, AddressValidationResult };

type CustomerApiRecord = Customer & {
  BDEUserId?: number | null;
  BDEUserName?: string | null;
};

const normalizeCustomer = (customer: CustomerApiRecord): Customer => ({
  ...customer,
  bdeUserId: customer.bdeUserId ?? customer.BDEUserId ?? undefined,
  bdeUserName: customer.bdeUserName ?? customer.BDEUserName ?? undefined,
});

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
  const response = await apiClient.get<CustomerApiRecord>(
    `${API_ENDPOINTS.Customer}/${id}`
  );
  return normalizeCustomer(response.data);
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
    throw error;
  }
};

export const updateCustomer = async (
  id: number,
  payload: CustomerUpdatePayload
): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Customer}/${id}`, payload);
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Customer}/${id}`);
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
