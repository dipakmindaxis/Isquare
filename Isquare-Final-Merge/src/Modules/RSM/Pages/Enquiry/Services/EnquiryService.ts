import axios from "axios";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { EnquiryDto, EnquiryCreatePayload } from "../Types/EnquiryTypes";

export const getEnquiries = async (): Promise<EnquiryDto[]> => {
  const response = await axios.get(API_ENDPOINTS.Enquiry);
  return response.data;
};

export const getNextEnquiryNumber = async (): Promise<string> => {
  const response = await axios.get(`${API_ENDPOINTS.Enquiry}/next-number`);
  return response.data.nextEnquiryNumber;
};

export const createEnquiry = async (payload: EnquiryCreatePayload): Promise<EnquiryDto> => {
  const response = await axios.post(API_ENDPOINTS.Enquiry, payload);
  return response.data;
};

export const uploadEnquiryDocument = async (file: File): Promise<{ filePath: string; originalName: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await axios.post(`${API_ENDPOINTS.Enquiry}/upload-doc`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};