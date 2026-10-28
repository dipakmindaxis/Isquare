import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { Contact, CreateContactDTO, UpdateContactDTO } from "../Types/ContactTypes";

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.Data)) return data.Data;
  if (data && Array.isArray(data.result)) return data.result;
  if (data && Array.isArray(data.Result)) return data.Result;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.Items)) return data.Items;
  return [];
};

const notifyContactsUpdated = (contact?: any) => {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("contact-created", { detail: contact }));
      window.dispatchEvent(new Event("contacts-updated"));
      localStorage.setItem("contacts_updated_at", Date.now().toString());
    } catch {
      // Ignore
    }
  }
};

const getBaseEndpoint = (): string => {
  return API_ENDPOINTS.Contact || API_ENDPOINTS.Contacts || `${API_ENDPOINTS.BaseUrl}/Contact`;
};

export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    const endpoint = getBaseEndpoint();
    const response = await apiClient.get<any>(endpoint);
    return ensureArray<Contact>(response.data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export const getContactById = async (id: number): Promise<Contact> => {
  const endpoint = `${getBaseEndpoint()}/${id}`;
  const response = await apiClient.get<any>(endpoint);
  const result =
    response.data?.data ||
    response.data?.Data ||
    response.data?.result ||
    response.data?.Result ||
    response.data;
  return result as Contact;
};

export const getContactsByCompanyId = async (companyId: number): Promise<Contact[]> => {
  if (!companyId || companyId <= 0) return [];
  const baseContactUrl = getBaseEndpoint();

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
  const endpoint = getBaseEndpoint();
  const response = await apiClient.post<any>(endpoint, data);
  const result =
    response.data?.data ||
    response.data?.Data ||
    response.data?.result ||
    response.data?.Result ||
    response.data;
  notifyContactsUpdated(result);
  return result as Contact;
};

export const updateContact = async (id: number, data: UpdateContactDTO): Promise<Contact> => {
  const baseEndpoint = getBaseEndpoint();
  const payload = {
    contactId: id,
    ...data,
  };
  let result: any;
  try {
    const response = await apiClient.put<any>(`${baseEndpoint}/${id}`, payload);
    result =
      response.data?.data ||
      response.data?.Data ||
      response.data?.result ||
      response.data?.Result ||
      response.data;
  } catch (err) {
    // Fallback: some ASP.NET controllers accept PUT /api/Contact without ID in route
    const response = await apiClient.put<any>(baseEndpoint, payload);
    result =
      response.data?.data ||
      response.data?.Data ||
      response.data?.result ||
      response.data?.Result ||
      response.data;
  }
  notifyContactsUpdated(result);
  return result as Contact;
};

export const deleteContact = async (id: number): Promise<void> => {
  const baseEndpoint = getBaseEndpoint();
  try {
    await apiClient.delete(`${baseEndpoint}/${id}`);
  } catch (err) {
    // Fallback: DELETE /api/Contact?id={id}
    await apiClient.delete(`${baseEndpoint}?id=${id}`);
  }
  notifyContactsUpdated();
};

export const toggleContactStatus = async (
  id: number,
  isActive: boolean,
  currentContact?: Partial<Contact>
): Promise<Contact> => {
  const payload: UpdateContactDTO = {
    contactId: id,
    companyId: currentContact?.companyId || 0,
    fullName: currentContact?.fullName || "",
    department: currentContact?.department || null,
    designation: currentContact?.designation || null,
    mobileNo: currentContact?.mobileNo || null,
    altMobileNo: currentContact?.altMobileNo || null,
    emailAddress: currentContact?.emailAddress || null,
    altEmailAddress: currentContact?.altEmailAddress || null,
    isActive,
    updatedBy: 1,
  };
  return await updateContact(id, payload);
};
