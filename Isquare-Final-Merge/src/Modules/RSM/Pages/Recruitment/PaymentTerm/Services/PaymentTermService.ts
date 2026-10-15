import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface PaymentTerm {
  paymentTermId: number;
  paymentTermName: string;
  paymentTermCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface PaymentTermCreatePayload {
  paymentTermName: string;
  paymentTermCode: string;
  isActive: boolean;
}

export interface PaymentTermUpdatePayload {
  paymentTermId?: number;
  paymentTermName: string;
  paymentTermCode: string;
  isActive: boolean;
}

export const getAllPaymentTerms = async (): Promise<PaymentTerm[]> => {
  const response = await apiClient.get<PaymentTerm[]>(API_ENDPOINTS.PaymentTerms);
  return response.data;
};

export const getPaymentTermById = async (id: number): Promise<PaymentTerm> => {
  const response = await apiClient.get<PaymentTerm>(`${API_ENDPOINTS.PaymentTerms}/${id}`);
  return response.data;
};

export const createPaymentTerm = async (payload: PaymentTermCreatePayload): Promise<PaymentTerm> => {
  const response = await apiClient.post<PaymentTerm>(API_ENDPOINTS.PaymentTerms, payload);
  return response.data;
};

export const updatePaymentTerm = async (id: number, payload: PaymentTermUpdatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.PaymentTerms}/${id}`, payload);
};

export const deletePaymentTerm = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PaymentTerms}/${id}`);
};
