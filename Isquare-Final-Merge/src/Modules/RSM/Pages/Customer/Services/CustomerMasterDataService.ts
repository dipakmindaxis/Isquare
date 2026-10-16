import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  IndustryItem,
  CustomerStatusItem,
  CustomerSourceItem,
  CustomerAreaItem,
  PaymentTermItem,
  CustomerCategoryItem,
  CustomerTypeItem,
  ClientTypeItem,
  BdeUserItem,
  SalesUserManagerItem,
  CountryItem,
  StateItem,
  CityItem,
  AddressTypeItem,
  EmployeeSelectItem,
} from "../Types/CustomerTypes";

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.result)) return data.result;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

export const getIndustries = async (): Promise<IndustryItem[]> => {
  try {
    const response = await apiClient.get<IndustryItem[]>(API_ENDPOINTS.Industry);
    return ensureArray<IndustryItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerStatuses = async (): Promise<CustomerStatusItem[]> => {
  try {
    const response = await apiClient.get<CustomerStatusItem[]>(
      API_ENDPOINTS.CustomerStatus
    );
    return ensureArray<CustomerStatusItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerSources = async (): Promise<CustomerSourceItem[]> => {
  try {
    const response = await apiClient.get<CustomerSourceItem[]>(
      API_ENDPOINTS.CustomerSource
    );
    return ensureArray<CustomerSourceItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerAreas = async (): Promise<CustomerAreaItem[]> => {
  try {
    const response = await apiClient.get<CustomerAreaItem[]>(
      API_ENDPOINTS.CustomerArea
    );
    return ensureArray<CustomerAreaItem>(response.data);
  } catch {
    return [];
  }
};

export const getPaymentTerms = async (): Promise<PaymentTermItem[]> => {
  try {
    const response = await apiClient.get<PaymentTermItem[]>(
      API_ENDPOINTS.PaymentTerm
    );
    return ensureArray<PaymentTermItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerCategories = async (): Promise<CustomerCategoryItem[]> => {
  try {
    const response = await apiClient.get<CustomerCategoryItem[]>(
      API_ENDPOINTS.CustomerCategory
    );
    return ensureArray<CustomerCategoryItem>(response.data);
  } catch {
    return [];
  }
};

export const getCustomerTypes = async (): Promise<CustomerTypeItem[]> => {
  try {
    const response = await apiClient.get<CustomerTypeItem[]>(
      API_ENDPOINTS.CustomerType
    );
    return ensureArray<CustomerTypeItem>(response.data);
  } catch {
    return [];
  }
};

export const getClientTypes = async (): Promise<ClientTypeItem[]> => {
  try {
    const response = await apiClient.get<ClientTypeItem[]>(
      API_ENDPOINTS.ClientType || API_ENDPOINTS.ContactTypes
    );
    return ensureArray<ClientTypeItem>(response.data);
  } catch {
    return [];
  }
};

export const getBdeUsers = async (): Promise<BdeUserItem[]> => {
  try {
    const response = await apiClient.get<BdeUserItem[]>(
      API_ENDPOINTS.BdeUser || API_ENDPOINTS.BdeUsers
    );
    return ensureArray<BdeUserItem>(response.data);
  } catch {
    return [];
  }
};

export const getSalesManagers = async (): Promise<SalesUserManagerItem[]> => {
  try {
    const response = await apiClient.get<SalesUserManagerItem[]>(
      API_ENDPOINTS.SalesUserManager || API_ENDPOINTS.SalesUserManagers
    );
    return ensureArray<SalesUserManagerItem>(response.data);
  } catch {
    return [];
  }
};

export const getEmployees = async (): Promise<EmployeeSelectItem[]> => {
  try {
    const response = await apiClient.get<EmployeeSelectItem[]>(
      API_ENDPOINTS.EmployeeSelectionList
    );
    const list = ensureArray<EmployeeSelectItem>(response.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn("Could not load from EmployeeSelectionList endpoint:", err);
  }

  try {
    const response = await apiClient.get<EmployeeSelectItem[]>(
      API_ENDPOINTS.Employees
    );
    return ensureArray<EmployeeSelectItem>(response.data);
  } catch (err) {
    console.warn("Could not load from Employees endpoint:", err);
    return [];
  }
};

export const getCountries = async (): Promise<CountryItem[]> => {
  try {
    const response = await apiClient.get<CountryItem[]>(API_ENDPOINTS.Country);
    return ensureArray<CountryItem>(response.data);
  } catch {
    return [];
  }
};

export const getStates = async (countryId?: number): Promise<StateItem[]> => {
  try {
    const url = countryId
      ? `${API_ENDPOINTS.State}/country/${countryId}`
      : API_ENDPOINTS.State;
    const response = await apiClient.get<StateItem[]>(url);
    return ensureArray<StateItem>(response.data);
  } catch {
    return [];
  }
};

export const getCities = async (stateId?: number): Promise<CityItem[]> => {
  try {
    const url = stateId
      ? `${API_ENDPOINTS.City}/state/${stateId}`
      : API_ENDPOINTS.City;
    const response = await apiClient.get<CityItem[]>(url);
    return ensureArray<CityItem>(response.data);
  } catch {
    return [];
  }
};

export const getAddressTypes = async (): Promise<AddressTypeItem[]> => {
  try {
    const response = await apiClient.get<AddressTypeItem[]>(
      API_ENDPOINTS.AddressType
    );
    return ensureArray<AddressTypeItem>(response.data);
  } catch {
    return [];
  }
};
