import axios from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { EnquiryDto, EnquiryCreatePayload } from "../Types/EnquiryTypes";

export const getEnquiries = async (): Promise<EnquiryDto[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.Enquiry);
    return response.data;
  } catch {
    const response = await axios.get(API_ENDPOINTS.Enquiry);
    return response.data;
  }
};

export const getNextEnquiryNumber = async (): Promise<string> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.Enquiry}/next-number`);
    return response.data.nextEnquiryNumber;
  } catch {
    const response = await axios.get(`${API_ENDPOINTS.Enquiry}/next-number`);
    return response.data.nextEnquiryNumber;
  }
};

export const createEnquiry = async (payload: EnquiryCreatePayload): Promise<EnquiryDto> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.Enquiry, payload);
    return response.data;
  } catch {
    const response = await axios.post(API_ENDPOINTS.Enquiry, payload);
    return response.data;
  }
};

export const uploadEnquiryDocument = async (file: File): Promise<{ filePath: string; originalName: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await apiClient.post(`${API_ENDPOINTS.Enquiry}/upload-doc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch {
    const response = await axios.post(`${API_ENDPOINTS.Enquiry}/upload-doc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};

export const deleteEnquiry = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_ENDPOINTS.Enquiry}/${id}`);
  } catch {
    await axios.delete(`${API_ENDPOINTS.Enquiry}/${id}`);
  }
};

// Add this to your existing EnquiryService.ts file
export const getEnquiryById = async (id: number): Promise<EnquiryDto> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.Enquiry}/${id}`);
    return response.data;
  } catch {
    const response = await axios.get(`${API_ENDPOINTS.Enquiry}/${id}`);
    return response.data;
  }
};

export const updateEnquiry = async (id: number, payload: any): Promise<void> => {
  try {
    await apiClient.put(`${API_ENDPOINTS.Enquiry}/${id}`, payload);
  } catch {
    await axios.put(`${API_ENDPOINTS.Enquiry}/${id}`, payload);
  }
};
