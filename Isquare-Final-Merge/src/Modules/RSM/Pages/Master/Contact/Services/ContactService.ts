import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { Contact, CreateContactDTO } from "../Types/ContactTypes";

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.result)) return data.result;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    const endpoint = API_ENDPOINTS.Contact || API_ENDPOINTS.Contacts || `${API_ENDPOINTS.BaseUrl}/Contact`;
    const response = await apiClient.get<any>(endpoint);
    return ensureArray<Contact>(response.data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export const getContactsByCompanyId = async (companyId: number): Promise<Contact[]> => {
  if (!companyId || companyId <= 0) return [];
  const baseContactUrl = API_ENDPOINTS.Contact || API_ENDPOINTS.Contacts || `${API_ENDPOINTS.BaseUrl}/Contact`;

  try {
    const endpoint = `${baseContactUrl}/company/${companyId}`;
    const response = await apiClient.get<any>(endpoint);
    const list = ensureArray<Contact>(response.data);
    if (list.length > 0) return list;
  } catch {
    // Ignore and fallback
  }

  try {
    const endpoint = `${baseContactUrl}?companyId=${companyId}`;
    const response = await apiClient.get<any>(endpoint);
    const list = ensureArray<Contact>(response.data);
    if (list.length > 0) return list;
  } catch {
    // Ignore and fallback
  }

  const all = await getAllContacts();
  return all.filter((c: Contact) => Number(c.companyId) === Number(companyId));
};

export const createContact = async (data: CreateContactDTO): Promise<Contact> => {
  const endpoint = API_ENDPOINTS.Contact || API_ENDPOINTS.Contacts || `${API_ENDPOINTS.BaseUrl}/Contact`;
  const response = await apiClient.post<any>(endpoint, data);
  const result = response.data?.data || response.data?.result || response.data;
  return result as Contact;
};
