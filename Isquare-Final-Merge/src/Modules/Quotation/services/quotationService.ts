import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import type {
  Quotation,
  QuotationItem,
  QuotationCharge,
  CreateQuotationChargeDto,
  QuotationApproval,
  CreateQuotationApprovalDto,
  DecideQuotationApprovalDto,
  QuotationRevision,
  CreateQuotationRevisionDto,
  QuotationDefault,
  CompanyProfile,
  SalesOrder,
  CreateSalesOrderDto,
  SalesOrderItem,
  CreateSalesOrderItemDto,
  Product,
} from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";

// Helper to normalize array responses
function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.result)) return data.result;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export const getApiErrorMessage = (data: unknown): string | undefined => {
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return undefined;

  const body = data as Record<string, unknown>;
  for (const key of ["detail", "message", "title"]) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  const errors = body.errors;
  if (errors && typeof errors === "object") {
    const messages = Object.values(errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(
        (value): value is string =>
          typeof value === "string" && !!value.trim(),
      );
    if (messages.length > 0) return messages.join(" ");
  }

  return undefined;
};

// ==========================================
// 1. QUOTATION SERVICE
// ==========================================
export const quotationService = {
  getAll: async (): Promise<Quotation[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Quotations);
      return normalizeArray<Quotation>(response.data);
    } catch (error) {
      console.warn("Failed to fetch quotations:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Quotation> => {
    const response = await apiClient.get<Quotation>(`${API_ENDPOINTS.Quotations}/${id}`);
    return response.data;
  },

  create: async (payload: Partial<Quotation>): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>(API_ENDPOINTS.Quotations, payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<Quotation>): Promise<Quotation | void> => {
    const response = await apiClient.put(`${API_ENDPOINTS.Quotations}/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Quotations}/${id}`);
  },
};

// ==========================================
// 2. QUOTATION ITEM SERVICE
// ==========================================
export const quotationItemService = {
  getAll: async (): Promise<QuotationItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.QuotationItems);
    return normalizeArray<QuotationItem>(response.data);
  },

  getByQuotation: async (quotationId: number): Promise<QuotationItem[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.QuotationItems}/by-quotation/${quotationId}`
      );
      return normalizeArray<QuotationItem>(response.data);
    } catch (error) {
      console.warn(`Failed to fetch quotation items for quotation ${quotationId}:`, error);
      return [];
    }
  },

  getById: async (id: number): Promise<QuotationItem> => {
    const response = await apiClient.get<QuotationItem>(`${API_ENDPOINTS.QuotationItems}/${id}`);
    return response.data;
  },

  create: async (payload: Partial<QuotationItem>): Promise<QuotationItem> => {
    const response = await apiClient.post<QuotationItem>(API_ENDPOINTS.QuotationItems, payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<QuotationItem>): Promise<QuotationItem | void> => {
    const response = await apiClient.put(`${API_ENDPOINTS.QuotationItems}/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.QuotationItems}/${id}`);
  },
};

// ==========================================
// 3. QUOTATION APPROVAL SERVICE
// ==========================================
export const quotationApprovalService = {
  getAll: async (): Promise<QuotationApproval[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QuotationApprovals);
      return normalizeArray<QuotationApproval>(response.data);
    } catch (error) {
      console.warn("Failed to fetch quotation approvals:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<QuotationApproval> => {
    const response = await apiClient.get<QuotationApproval>(
      `${API_ENDPOINTS.QuotationApprovals}/${id}`
    );
    return response.data;
  },

  getByQuotation: async (quotationId: number): Promise<QuotationApproval[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.QuotationApprovals}/quotation/${quotationId}`
      );
      return normalizeArray<QuotationApproval>(response.data);
    } catch (error) {
      console.warn(`Failed to fetch approvals for quotation ${quotationId}:`, error);
      return [];
    }
  },

  requestApproval: async (payload: CreateQuotationApprovalDto): Promise<QuotationApproval> => {
    const response = await apiClient.post<QuotationApproval>(
      API_ENDPOINTS.QuotationApprovals,
      payload
    );
    return response.data;
  },

  decideApproval: async (
    id: number,
    payload: DecideQuotationApprovalDto
  ): Promise<QuotationApproval | void> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.QuotationApprovals}/${id}/decision`,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.QuotationApprovals}/${id}`);
  },
};

// ==========================================
// 4. QUOTATION REVISION SERVICE
// ==========================================
export const quotationRevisionService = {
  getAll: async (): Promise<QuotationRevision[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QuotationRevisions);
      return normalizeArray<QuotationRevision>(response.data);
    } catch (error) {
      console.warn("Failed to fetch quotation revisions:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<QuotationRevision> => {
    const response = await apiClient.get<QuotationRevision>(
      `${API_ENDPOINTS.QuotationRevisions}/${id}`
    );
    return response.data;
  },

  getByQuotation: async (quotationId: number): Promise<QuotationRevision[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.QuotationRevisions}/quotation/${quotationId}`
      );
      return normalizeArray<QuotationRevision>(response.data);
    } catch (error) {
      console.warn(`Failed to fetch revisions for quotation ${quotationId}:`, error);
      return [];
    }
  },

  create: async (payload: CreateQuotationRevisionDto): Promise<QuotationRevision> => {
    const response = await apiClient.post<QuotationRevision>(
      API_ENDPOINTS.QuotationRevisions,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.QuotationRevisions}/${id}`);
  },
};

// ==========================================
// 5. QUOTATION CHARGE SERVICE
// ==========================================
export const quotationChargeService = {
  getAll: async (): Promise<QuotationCharge[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QuotationCharges);
      return normalizeArray<QuotationCharge>(response.data);
    } catch (error) {
      console.warn("Failed to fetch quotation charges:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<QuotationCharge> => {
    const response = await apiClient.get<QuotationCharge>(
      `${API_ENDPOINTS.QuotationCharges}/${id}`
    );
    return response.data;
  },

  getByQuotation: async (quotationId: number): Promise<QuotationCharge[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.QuotationCharges}/quotation/${quotationId}`
      );
      return normalizeArray<QuotationCharge>(response.data);
    } catch (error) {
      console.warn(`Failed to fetch charges for quotation ${quotationId}:`, error);
      return [];
    }
  },

  create: async (payload: CreateQuotationChargeDto): Promise<QuotationCharge> => {
    const response = await apiClient.post<QuotationCharge>(
      API_ENDPOINTS.QuotationCharges,
      payload
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: CreateQuotationChargeDto
  ): Promise<QuotationCharge | void> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.QuotationCharges}/${id}`,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.QuotationCharges}/${id}`);
  },
};

// ==========================================
// 6. QUOTATION DEFAULT SERVICE
// ==========================================
export const quotationDefaultService = {
  getAll: async (): Promise<QuotationDefault[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QuotationDefaults);
      return normalizeArray<QuotationDefault>(response.data);
    } catch (error) {
      console.warn("Failed to fetch quotation defaults:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<QuotationDefault> => {
    const response = await apiClient.get<QuotationDefault>(
      `${API_ENDPOINTS.QuotationDefaults}/${id}`
    );
    return response.data;
  },

  getDefault: async (): Promise<QuotationDefault | null> => {
    const list = await quotationDefaultService.getAll();
    return list.find((item) => item.isActive && !item.isDeleted) || list[0] || null;
  },

  create: async (payload: Partial<QuotationDefault>): Promise<QuotationDefault> => {
    const response = await apiClient.post<QuotationDefault>(
      API_ENDPOINTS.QuotationDefaults,
      payload
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<QuotationDefault>
  ): Promise<QuotationDefault | void> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.QuotationDefaults}/${id}`,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.QuotationDefaults}/${id}`);
  },
};

// ==========================================
// 7. COMPANY PROFILE SERVICE
// ==========================================
export const companyProfileService = {
  getAll: async (): Promise<CompanyProfile[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CompanyProfile);
      return normalizeArray<CompanyProfile>(response.data);
    } catch (error) {
      console.warn("Failed to fetch company profiles:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<CompanyProfile> => {
    const response = await apiClient.get<CompanyProfile>(
      `${API_ENDPOINTS.CompanyProfile}/${id}`
    );
    return response.data;
  },

  getDefaultProfile: async (): Promise<CompanyProfile | null> => {
    const list = await companyProfileService.getAll();
    return list.find((c) => c.isDefault && c.isActive && !c.isDeleted) || list[0] || null;
  },

  create: async (payload: Partial<CompanyProfile>): Promise<CompanyProfile> => {
    const response = await apiClient.post<CompanyProfile>(
      API_ENDPOINTS.CompanyProfile,
      payload
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<CompanyProfile>
  ): Promise<CompanyProfile | void> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.CompanyProfile}/${id}`,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.CompanyProfile}/${id}`);
  },
};

// ==========================================
// 8. SALES ORDER SERVICE
// ==========================================
export const salesOrderService = {
  getAll: async (): Promise<SalesOrder[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SalesOrders);
      return normalizeArray<SalesOrder>(response.data);
    } catch (error) {
      console.warn("Failed to fetch sales orders:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<SalesOrder> => {
    const response = await apiClient.get<SalesOrder>(`${API_ENDPOINTS.SalesOrders}/${id}`);
    return response.data;
  },

  getByQuotation: async (quotationId: number): Promise<SalesOrder | null> => {
    // Keep lookup failures visible so conversion never proceeds when existence is unknown.
    const response = await apiClient.get(API_ENDPOINTS.SalesOrders);
    return (
      normalizeArray<SalesOrder>(response.data).find(
        (order) => order.quotationId === quotationId,
      ) || null
    );
  },

  create: async (payload: CreateSalesOrderDto): Promise<SalesOrder | undefined> => {
    const response = await apiClient.post<SalesOrder>(API_ENDPOINTS.SalesOrders, payload);
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<CreateSalesOrderDto>
  ): Promise<SalesOrder | void> => {
    const response = await apiClient.put(`${API_ENDPOINTS.SalesOrders}/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.SalesOrders}/${id}`);
  },
};

// ==========================================
// 9. SALES ORDER ITEM SERVICE
// ==========================================
export const salesOrderItemService = {
  getAll: async (): Promise<SalesOrderItem[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SalesOrderItems);
      return normalizeArray<SalesOrderItem>(response.data);
    } catch (error) {
      console.warn("Failed to fetch sales order items:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<SalesOrderItem> => {
    const response = await apiClient.get<SalesOrderItem>(
      `${API_ENDPOINTS.SalesOrderItems}/${id}`
    );
    return response.data;
  },

  getBySalesOrder: async (salesOrderId: number): Promise<SalesOrderItem[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SalesOrderItems}/sales-order/${salesOrderId}`
      );
      return normalizeArray<SalesOrderItem>(response.data);
    } catch (error) {
      console.warn(`Failed to fetch items for sales order ${salesOrderId}:`, error);
      return [];
    }
  },

  create: async (payload: CreateSalesOrderItemDto): Promise<SalesOrderItem> => {
    const response = await apiClient.post<SalesOrderItem>(
      API_ENDPOINTS.SalesOrderItems,
      payload
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<CreateSalesOrderItemDto>
  ): Promise<SalesOrderItem | void> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.SalesOrderItems}/${id}`,
      payload
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.SalesOrderItems}/${id}`);
  },
};

// ==========================================
// 10. PRODUCT SERVICE
// ==========================================
export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Products);
      return normalizeArray<Product>(response.data);
    } catch (error) {
      console.warn("Failed to fetch products:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`${API_ENDPOINTS.Products}/${id}`);
    return response.data;
  },

  create: async (payload: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post<Product>(API_ENDPOINTS.Products, payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<Product>): Promise<Product | void> => {
    const response = await apiClient.put(`${API_ENDPOINTS.Products}/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Products}/${id}`);
  },
};

// ==========================================
// 11. REUSED MASTERS (CUSTOMERS & PAYMENT TERMS)
// ==========================================
export const masterDataService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Customer);
      return normalizeArray<Customer>(response.data);
    } catch (error) {
      console.warn("Failed to fetch customers:", error);
      return [];
    }
  },

  getPaymentTerms: async (): Promise<PaymentTerm[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PaymentTerms);
      return normalizeArray<PaymentTerm>(response.data);
    } catch (error) {
      console.warn("Failed to fetch payment terms:", error);
      return [];
    }
  },
};
