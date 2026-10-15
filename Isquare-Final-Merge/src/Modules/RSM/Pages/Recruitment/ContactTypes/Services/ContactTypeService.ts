// Only API communication:
// GET
// POST
// PUT
// DELETE

import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

import type {
    ContactType,
    ContactTypeCreatePayload,
} from "../Types/ContactType";

export const getAllContactTypes = async (): Promise<ContactType[]> => {
    const response = await apiClient.get<ContactType[]>(
        API_ENDPOINTS.ContactTypes
    );

    return response.data.map((item) => ({
        contactTypeId: item.contactTypeId,
        value: item.value,
        code: item.code,
        isActive: item.isActive,
        isDeleted: item.isDeleted,
    }));
};

export const getContactTypeById = async (
    id: number
): Promise<ContactType> => {const response = await apiClient.get<ContactType>(
        `${API_ENDPOINTS.ContactTypes}/${id}`
    );

    return response.data;
};

export const createContactType = async (payload: ContactTypeCreatePayload): Promise<ContactType> => {
    const response = await apiClient.post<ContactType>(
        API_ENDPOINTS.ContactTypes,
        payload
    );

    return response.data;
};

export const updateContactType = async (
    id: number,
    payload: ContactTypeCreatePayload
): Promise<void> => {
    await apiClient.put(
        `${API_ENDPOINTS.ContactTypes}/${id}`,
        payload
    );
};

export const deleteContactType = async (
    id: number
): Promise<void> => {
    await apiClient.delete(
        `${API_ENDPOINTS.ContactTypes}/${id}`
    );
};