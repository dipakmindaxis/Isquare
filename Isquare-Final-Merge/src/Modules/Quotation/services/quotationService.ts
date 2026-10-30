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
import { STANDARD_UOMS } from "../utils/quotationCalculations";

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
// ==========================================
// 0. QUOTATION ENRICHMENT CACHE & HELPERS
// ==========================================
export const QUOTATION_ENRICHMENT_KEY = "isquare_quotation_enrichment_cache_v2";

export interface QuotationEnrichmentData {
  customerName?: string | null;
  enquiryRef?: string | null;
  enquiryId?: number | null;
  customerId?: number | null;
}

export function getQuotationEnrichmentCache(): Record<string, QuotationEnrichmentData> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(QUOTATION_ENRICHMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveQuotationEnrichment(
  quotationIdOrNum: string | number,
  data: QuotationEnrichmentData
): void {
  if (!quotationIdOrNum || typeof window === "undefined" || !window.localStorage) return;
  try {
    const cache = getQuotationEnrichmentCache();
    const key = String(quotationIdOrNum).trim();
    cache[key] = { ...(cache[key] || {}), ...data };
    window.localStorage.setItem(QUOTATION_ENRICHMENT_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to save quotation enrichment to cache:", e);
  }
}

export async function enrichQuotations(quotations: Quotation[]): Promise<Quotation[]> {
  if (!quotations || quotations.length === 0) return quotations;

  // 1. Synchronous enrichment from local cache
  const localCache = getQuotationEnrichmentCache();
  for (const q of quotations) {
    const cached =
      localCache[String(q.quotationId)] ||
      (q.quotationNumber ? localCache[q.quotationNumber] : undefined);
    if (cached) {
      if (!q.customerName && cached.customerName) q.customerName = cached.customerName;
      if (!q.enquiryRef && cached.enquiryRef) q.enquiryRef = cached.enquiryRef;
      if (!q.enquiryId && cached.enquiryId) q.enquiryId = cached.enquiryId;
    }
  }

  // 2. Fetch master data in parallel
  let customers: Customer[] = [];
  let enquiries: any[] = [];
  try {
    const [custsRes, enqsRes] = await Promise.allSettled([
      masterDataService.getCustomers(),
      masterDataService.getEnquiries(),
    ]);
    if (custsRes.status === "fulfilled") customers = custsRes.value;
    if (enqsRes.status === "fulfilled") enquiries = enqsRes.value;
  } catch (err) {
    console.warn("Enrichment master data fetch error:", err);
  }

  const customerMap = new Map<number, string>();
  for (const c of customers) {
    const id = Number(c.customerId || (c as any).companyId || 0);
    const name = c.companyName || c.customerName || (c as any).clientName || "";
    if (id && name) {
      customerMap.set(id, name);
    }
  }

  const enquiryMap = new Map<number, string>();
  for (const e of enquiries) {
    const id = Number(e.enquiryId || (e as any).id || 0);
    const no =
      e.enquiryNumber ||
      e.enquiryNo ||
      (id ? `ENQ-${String(id).padStart(3, "0")}` : "");
    if (id && no) {
      enquiryMap.set(id, no);
    }
  }

  // 3. Map customerName and enquiryRef
  for (const q of quotations) {
    if (!q.customerName && q.customerId) {
      const matchName = customerMap.get(Number(q.customerId));
      if (matchName) {
        q.customerName = matchName;
      }
    }

    if (!q.enquiryRef && q.enquiryId) {
      const matchEnq = enquiryMap.get(Number(q.enquiryId));
      if (matchEnq) {
        q.enquiryRef = matchEnq;
      } else {
        q.enquiryRef = `ENQ-${String(q.enquiryId).padStart(3, "0")}`;
      }
    } else if (q.enquiryRef && q.enquiryRef.includes(" - ")) {
      const match = q.enquiryRef.match(/(ENQ-[A-Za-z0-9-]+)/i);
      if (match) q.enquiryRef = match[1];
    }

    // Persist enrichment
    if (q.quotationId && (q.customerName || q.enquiryRef)) {
      saveQuotationEnrichment(q.quotationId, {
        customerName: q.customerName,
        enquiryRef: q.enquiryRef,
        enquiryId: q.enquiryId,
        customerId: q.customerId,
      });
      if (q.quotationNumber) {
        saveQuotationEnrichment(q.quotationNumber, {
          customerName: q.customerName,
          enquiryRef: q.enquiryRef,
          enquiryId: q.enquiryId,
          customerId: q.customerId,
        });
      }
    }
  }

  return quotations;
}

export const quotationService = {
  getAll: async (): Promise<Quotation[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Quotations);
      const list = normalizeArray<Quotation>(response.data);
      return await enrichQuotations(list);
    } catch (error) {
      console.warn("Failed to fetch quotations:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Quotation> => {
    const response = await apiClient.get<Quotation>(`${API_ENDPOINTS.Quotations}/${id}`);
    const [enriched] = await enrichQuotations([response.data]);
    return enriched || response.data;
  },

  create: async (payload: Partial<Quotation>): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>(API_ENDPOINTS.Quotations, payload);
    const created = response.data;
    if (created && created.quotationId) {
      const cleanRef = payload.enquiryRef
        ? payload.enquiryRef.match(/(ENQ-[A-Za-z0-9-]+)/i)?.[1] ||
          payload.enquiryRef.split(" - ")[0].trim()
        : null;
      saveQuotationEnrichment(created.quotationId, {
        customerName: payload.customerName,
        enquiryRef: cleanRef,
        enquiryId: payload.enquiryId,
        customerId: payload.customerId,
      });
      if (created.quotationNumber) {
        saveQuotationEnrichment(created.quotationNumber, {
          customerName: payload.customerName,
          enquiryRef: cleanRef,
          enquiryId: payload.enquiryId,
          customerId: payload.customerId,
        });
      }
    }
    return created;
  },

  update: async (id: number, payload: Partial<Quotation>): Promise<Quotation | void> => {
    const response = await apiClient.put(`${API_ENDPOINTS.Quotations}/${id}`, payload);
    if (id) {
      const cleanRef = payload.enquiryRef
        ? payload.enquiryRef.match(/(ENQ-[A-Za-z0-9-]+)/i)?.[1] ||
          payload.enquiryRef.split(" - ")[0].trim()
        : null;
      saveQuotationEnrichment(id, {
        customerName: payload.customerName,
        enquiryRef: cleanRef,
        enquiryId: payload.enquiryId,
        customerId: payload.customerId,
      });
    }
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Quotations}/${id}`);
  },
};

// ==========================================
// 2. QUOTATION ITEM SERVICE
// ==========================================
function sanitizeQuotationItemPayload(payload: Partial<QuotationItem>): Record<string, any> {
  const body: Record<string, any> = {
    quotationId: Number(payload.quotationId) || 0,
    isAccessory: Boolean(payload.isAccessory),
    itemName: (payload.itemName || "").trim(),
    quantity: Math.max(0.001, Number(payload.quantity) || 1),
    rate: Math.max(0, Number(payload.rate) || 0),
    discountPercentage: Math.max(0, Math.min(100, Number(payload.discountPercentage) || 0)),
    discountAmount: Math.max(0, Number(payload.discountAmount) || 0),
    gstRate: Math.max(0, Math.min(100, Number(payload.gstRate) || 0)),
    taxableAmount: Math.max(0, Number(payload.taxableAmount) || 0),
    taxAmount: Math.max(0, Number(payload.taxAmount) || 0),
    lineTotal: Math.max(0, Number(payload.lineTotal) || 0),
    displayOrder: Number(payload.displayOrder) || 1,
    isActive: payload.isActive ?? true,
    isDeleted: payload.isDeleted ?? false,
  };

  if (payload.quotationItemId && payload.quotationItemId > 0) {
    body.quotationItemId = payload.quotationItemId;
  }
  if (payload.productId != null && Number(payload.productId) > 0) {
    body.productId = Number(payload.productId);
  }
  if (payload.parentQuotationItemId != null && Number(payload.parentQuotationItemId) > 0) {
    body.parentQuotationItemId = Number(payload.parentQuotationItemId);
  }
  if (payload.itemCode) {
    body.itemCode = payload.itemCode;
  }
  if (payload.brand) {
    body.brand = payload.brand;
  }
  if (payload.specification) {
    body.specification = payload.specification;
  }
  if (payload.unitOfMeasurementId != null) {
    body.unitOfMeasurementId = Number(payload.unitOfMeasurementId);
  }

  return body;
}

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
    const cleanBody = sanitizeQuotationItemPayload(payload);
    const response = await apiClient.post<QuotationItem>(API_ENDPOINTS.QuotationItems, cleanBody);
    return response.data;
  },

  update: async (id: number, payload: Partial<QuotationItem>): Promise<QuotationItem | void> => {
    const cleanBody = sanitizeQuotationItemPayload(payload);
    const response = await apiClient.put(`${API_ENDPOINTS.QuotationItems}/${id}`, cleanBody);
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

const PRODUCT_IMAGE_STORAGE_KEY = "isquare_product_images_cache_v1";

export function getProductImageCache(path?: string | null): string | null {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  try {
    const raw = localStorage.getItem(PRODUCT_IMAGE_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return map[trimmed] || map[trimmed.toLowerCase()] || null;
    }
  } catch (e) {
    console.warn("Failed to get product image from cache", e);
  }
  return null;
}

export function saveProductImageCache(path: string, dataUrl: string): void {
  if (!path || !dataUrl) return;
  try {
    const raw = localStorage.getItem(PRODUCT_IMAGE_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[path] = dataUrl;
    map[path.toLowerCase()] = dataUrl;
    localStorage.setItem(PRODUCT_IMAGE_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to save product image to cache", e);
  }
}

export function resolveImageUrl(path?: string | null): string | null {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  // 1. Direct usable protocols (http, https, blob:, data:)
  if (/^(?:https?:|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Check local product image cache (saved on file upload in Product Master)
  const cached = getProductImageCache(trimmed);
  if (cached) {
    return cached;
  }

  // 3. Resolve relative path against backend BaseUrl
  const backendBase = (API_ENDPOINTS?.BaseUrl || "")
    .replace(/\/api\/?$/i, "")
    .replace(/\/+$/, "");

  if (!backendBase) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
}

const PRODUCT_UOM_STORAGE_KEY = "isquare_product_uom_cache_v1";
const PRODUCT_META_STORAGE_KEY = "isquare_product_meta_cache_v1";

export interface ProductMetaData {
  uom?: string | null;
  purchaseRate?: number | null;
  profitPercentage?: number | null;
  stock?: number | null;
}

export function getAllProductMeta(): Record<string, ProductMetaData> {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(PRODUCT_META_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to get product meta cache", e);
    return {};
  }
}

export function saveProductMeta(key: string | number, meta: ProductMetaData): void {
  if (!key || !meta || typeof window === "undefined" || typeof window.localStorage === "undefined") return;
  try {
    const all = getAllProductMeta();
    const str = String(key).trim();
    all[str] = { ...(all[str] || {}), ...meta };
    all[str.toLowerCase()] = { ...(all[str.toLowerCase()] || {}), ...meta };
    window.localStorage.setItem(PRODUCT_META_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Failed to save product meta to cache", e);
  }
}

export function getProductMeta(id?: string | number | null, fallback?: any): ProductMetaData | null {
  const all = getAllProductMeta();
  if (id != null) {
    const str = String(id).trim();
    if (all[str]) return all[str];
    if (all[str.toLowerCase()]) return all[str.toLowerCase()];
  }
  if (fallback) {
    if (fallback.productId && all[String(fallback.productId)]) {
      return all[String(fallback.productId)];
    }
    if (fallback.itemCode) {
      const code = String(fallback.itemCode).trim();
      if (all[code]) return all[code];
      if (all[code.toLowerCase()]) return all[code.toLowerCase()];
    }
    if (fallback.productName) {
      const name = String(fallback.productName).trim();
      if (all[name]) return all[name];
      if (all[name.toLowerCase()]) return all[name.toLowerCase()];
    }
  }
  return null;
}

export function getAllProductUoms(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PRODUCT_UOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to get product UOM cache", e);
    return {};
  }
}

export function saveProductUom(key: string | number, uom: string): void {
  if (!key || !uom) return;
  try {
    const all = getAllProductUoms();
    const str = String(key).trim();
    all[str] = uom.trim();
    all[str.toLowerCase()] = uom.trim();
    localStorage.setItem(PRODUCT_UOM_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Failed to save product UOM to cache", e);
  }
}

export function getProductUom(id?: string | number | null, fallback?: any): string | null {
  const all = getAllProductUoms();
  if (id != null) {
    const str = String(id).trim();
    if (all[str]) return all[str];
    if (all[str.toLowerCase()]) return all[str.toLowerCase()];
  }
  if (fallback) {
    if (fallback.productId && all[String(fallback.productId)]) {
      return all[String(fallback.productId)];
    }
    if (fallback.itemCode) {
      const code = String(fallback.itemCode).trim();
      if (all[code]) return all[code];
      if (all[code.toLowerCase()]) return all[code.toLowerCase()];
    }
    if (fallback.productName) {
      const name = String(fallback.productName).trim();
      if (all[name]) return all[name];
      if (all[name.toLowerCase()]) return all[name.toLowerCase()];
    }
    if (fallback.unitName) return fallback.unitName;
    if (fallback.uom) return fallback.uom;
  }
  return null;
}

export function resolveUomId(uomText: string): number {
  const trimmed = (uomText || "").trim().toLowerCase();
  if (!trimmed) return 1;
  const match = STANDARD_UOMS.find(
    (u) =>
      u.name.toLowerCase() === trimmed ||
      u.code.toLowerCase() === trimmed ||
      (u.name.toLowerCase() + "s") === trimmed ||
      (u.name.toLowerCase() + "es") === trimmed ||
      (trimmed === "meters" || trimmed === "meter" ? u.code === "MTR" : false) ||
      (trimmed === "liters" || trimmed === "litres" || trimmed === "litre" || trimmed === "liter" ? u.code === "LTR" : false) ||
      (trimmed === "pieces" || trimmed === "piece" ? u.code === "PCS" : false) ||
      (trimmed === "kilograms" || trimmed === "kilogram" ? u.code === "KG" : false)
  );
  return match ? match.id : 1;
}

export function mapProductFromApi(raw: any): Product {
  if (!raw || typeof raw !== "object") {
    return {
      productId: 0,
      itemCode: "",
      productName: "",
      brand: "",
      specification: "",
      unitOfMeasurementId: 1,
      standardRate: 0,
      gstRate: 18,
      isActive: true,
      isDeleted: false,
    };
  }

  const productId = Number(raw.productId ?? raw.ProductId ?? raw.id ?? raw.Id ?? 0);
  const itemCode = (raw.itemCode ?? raw.ItemCode ?? raw.code ?? raw.Code ?? "") || "";
  const productName = (raw.productName ?? raw.ProductName ?? raw.name ?? raw.Name ?? "") || "";
  const brand = (raw.brand ?? raw.Brand ?? "") || "";
  const specification =
    (raw.specification ?? raw.Specification ?? raw.description ?? raw.Description ?? "") || "";
  const rawUom = raw.unitOfMeasurementId ?? raw.UnitOfMeasurementId;
  const unitOfMeasurementId = rawUom != null && !isNaN(Number(rawUom)) ? Number(rawUom) : 1;

  const cachedMeta = getProductMeta(productId, { itemCode, productName });

  const rawUnitName =
    raw.unitName ??
    raw.UnitName ??
    raw.unitOfMeasurement ??
    raw.UnitOfMeasurement ??
    raw.defaultUom ??
    raw.DefaultUom ??
    raw.defaultUOM ??
    raw.DefaultUOM ??
    raw.unitOfMeasure ??
    raw.UnitOfMeasure ??
    raw.uomName ??
    raw.UomName ??
    raw.uom ??
    raw.Uom ??
    null;
  const unitName =
    (rawUnitName != null && String(rawUnitName).trim() !== "" ? String(rawUnitName).trim() : null) ||
    cachedMeta?.uom ||
    getProductUom(productId, { itemCode, productName }) ||
    STANDARD_UOMS.find((u) => u.id === unitOfMeasurementId)?.name ||
    "Nos";
  const rawRate = raw.standardRate ?? raw.StandardRate ?? raw.rate ?? raw.Rate;
  const standardRate = rawRate != null && !isNaN(Number(rawRate)) ? Number(rawRate) : 0;
  const rawGst = raw.gstRate ?? raw.GstRate ?? raw.gst ?? raw.Gst;
  const gstRate = rawGst != null && !isNaN(Number(rawGst)) ? Number(rawGst) : 18;
  const isActive = raw.isActive ?? raw.IsActive ?? true;
  const isDeleted = raw.isDeleted ?? raw.IsDeleted ?? false;
  const productImage =
    raw.productImage ??
    raw.ProductImage ??
    raw.productImagePath ??
    raw.ProductImagePath ??
    raw.imageUrl ??
    raw.ImageUrl ??
    raw.image ??
    raw.Image ??
    raw.imagePath ??
    raw.ImagePath ??
    null;

  const resolved = resolveImageUrl(productImage);

  const rawHsn = raw.hsnCode ?? raw.HsnCode ?? raw.hsn ?? raw.Hsn;
  const hsnCode = rawHsn != null ? String(rawHsn).trim() : null;

  const parseSafeNumeric = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === "number") return isNaN(val) ? null : val;
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.-]/g, "").trim();
      if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const rawPurchaseRate =
    raw.purchaseRate ??
    raw.PurchaseRate ??
    raw.purchaserate ??
    raw.PURCHASERATE ??
    raw.purchase_rate ??
    raw.Purchase_Rate ??
    raw.purchasePrice ??
    raw.PurchasePrice ??
    raw.buyingPrice ??
    raw.BuyingPrice ??
    raw.costPrice ??
    raw.CostPrice ??
    raw.cost ??
    raw.Cost;
  const parsedPR = parseSafeNumeric(rawPurchaseRate);
  const purchaseRate = parsedPR != null ? parsedPR : (cachedMeta?.purchaseRate ?? null);

  const rawProfit =
    raw.profitPercentage ??
    raw.ProfitPercentage ??
    raw.profit_percentage ??
    raw.Profit_Percentage ??
    raw.profitpercentage ??
    raw.PROFITPERCENTAGE ??
    raw.profitPercent ??
    raw.ProfitPercent ??
    raw.profit ??
    raw.Profit ??
    raw.profitMargin ??
    raw.ProfitMargin ??
    raw.margin ??
    raw.Margin;
  const parsedProfit = parseSafeNumeric(rawProfit);
  const profitPercentage = parsedProfit != null ? parsedProfit : (cachedMeta?.profitPercentage ?? null);

  const rawStock =
    raw.stock ??
    raw.Stock ??
    raw.STOCK ??
    raw.stockQty ??
    raw.StockQty ??
    raw.stockQuantity ??
    raw.StockQuantity ??
    raw.availableStock ??
    raw.AvailableStock;
  const parsedStock = parseSafeNumeric(rawStock);
  const stock =
    parsedStock != null
      ? Math.round(parsedStock)
      : cachedMeta?.stock != null
      ? Math.round(cachedMeta.stock)
      : null;

  return {
    productId,
    itemCode,
    productName,
    brand,
    specification,
    unitOfMeasurementId,
    unitName,
    uom: unitName,
    standardRate,
    gstRate,
    hsnCode: hsnCode || null,
    purchaseRate,
    profitPercentage,
    profit: profitPercentage,
    stock,
    isActive: Boolean(isActive),
    isDeleted: Boolean(isDeleted),
    productImage: productImage || null,
    productImagePath: productImage || null,
    imageUrl: resolved || productImage || null,
  };
}

// ==========================================
// 10. PRODUCT SERVICE
// ==========================================
export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Products);
      const rawList = normalizeArray<any>(response.data);
      return rawList.map(mapProductFromApi).filter((p) => !p.isDeleted);
    } catch (error) {
      console.warn("Failed to fetch products:", error);
      return [];
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`${API_ENDPOINTS.Products}/${id}`);
    const raw = (response.data as any)?.data ?? (response.data as any)?.result ?? response.data;
    return mapProductFromApi(raw);
  },

  create: async (payload: Partial<Product>): Promise<Product> => {
    const img =
      payload.productImage ??
      payload.productImagePath ??
      payload.imageUrl ??
      null;
    const body: Record<string, any> = {
      productName: payload.productName?.trim() || "",
      itemCode: payload.itemCode?.trim() || null,
      brand: payload.brand?.trim() || null,
      specification: payload.specification?.trim() || null,
      unitOfMeasurementId:
        payload.unitOfMeasurementId != null ? Number(payload.unitOfMeasurementId) : 1,
      standardRate: Number(payload.standardRate) || 0,
      gstRate: Number(payload.gstRate) || 0,
      productImage: img ? img.trim() : null,
      productImagePath: img ? img.trim() : null,
      hsnCode: payload.hsnCode != null && payload.hsnCode.trim() !== "" ? payload.hsnCode.trim() : null,
      purchaseRate:
        payload.purchaseRate != null && !isNaN(Number(payload.purchaseRate))
          ? Number(payload.purchaseRate)
          : null,
      profitPercentage:
        payload.profitPercentage != null && !isNaN(Number(payload.profitPercentage))
          ? Number(payload.profitPercentage)
          : payload.profit != null && !isNaN(Number(payload.profit))
            ? Number(payload.profit)
            : null,
      stock:
        payload.stock != null && !isNaN(Number(payload.stock))
          ? Math.round(Number(payload.stock))
          : null,
      isActive: payload.isActive ?? true,
      isDeleted: payload.isDeleted ?? false,
    };
    const response = await apiClient.post<Product>(API_ENDPOINTS.Products, body);
    const raw = (response.data as any)?.data ?? (response.data as any)?.result ?? response.data;
    const createdProduct = mapProductFromApi(raw);
    const uomToSave = payload.unitName || payload.uom;
    const metaToSave: ProductMetaData = {
      uom: uomToSave || undefined,
      purchaseRate: payload.purchaseRate,
      profitPercentage: payload.profitPercentage,
      stock: payload.stock,
    };
    if (createdProduct.productId) {
      if (uomToSave) saveProductUom(createdProduct.productId, uomToSave);
      saveProductMeta(createdProduct.productId, metaToSave);
    }
    if (createdProduct.itemCode) {
      if (uomToSave) saveProductUom(createdProduct.itemCode, uomToSave);
      saveProductMeta(createdProduct.itemCode, metaToSave);
    }
    if (createdProduct.productName) {
      if (uomToSave) saveProductUom(createdProduct.productName, uomToSave);
      saveProductMeta(createdProduct.productName, metaToSave);
    }
    if (uomToSave) {
      createdProduct.unitName = uomToSave;
      createdProduct.uom = uomToSave;
    }
    if (payload.purchaseRate !== undefined && payload.purchaseRate !== null) createdProduct.purchaseRate = payload.purchaseRate;
    if (payload.profitPercentage !== undefined && payload.profitPercentage !== null) createdProduct.profitPercentage = payload.profitPercentage;
    if (payload.stock !== undefined && payload.stock !== null) createdProduct.stock = payload.stock;
    return createdProduct;
  },

  update: async (id: number, payload: Partial<Product>): Promise<Product | void> => {
    const uomToSave = payload.unitName || payload.uom;
    const metaToSave: ProductMetaData = {
      uom: uomToSave || undefined,
      purchaseRate: payload.purchaseRate,
      profitPercentage: payload.profitPercentage,
      stock: payload.stock,
    };
    if (id) {
      if (uomToSave) saveProductUom(id, uomToSave);
      saveProductMeta(id, metaToSave);
    }
    if (payload.itemCode) {
      if (uomToSave) saveProductUom(payload.itemCode, uomToSave);
      saveProductMeta(payload.itemCode, metaToSave);
    }
    if (payload.productName) {
      if (uomToSave) saveProductUom(payload.productName, uomToSave);
      saveProductMeta(payload.productName, metaToSave);
    }
    const img =
      payload.productImage !== undefined
        ? payload.productImage
        : payload.productImagePath !== undefined
          ? payload.productImagePath
          : payload.imageUrl;
    const body: Record<string, any> = {
      productId: id,
      productName: payload.productName?.trim() || "",
      itemCode: payload.itemCode != null ? payload.itemCode.trim() : "",
      brand: payload.brand?.trim() || null,
      specification: payload.specification?.trim() || null,
      unitOfMeasurementId:
        payload.unitOfMeasurementId != null ? Number(payload.unitOfMeasurementId) : 1,
      standardRate: Number(payload.standardRate) || 0,
      gstRate: Number(payload.gstRate) || 0,
      hsnCode:
        payload.hsnCode !== undefined
          ? payload.hsnCode != null && payload.hsnCode.trim() !== ""
            ? payload.hsnCode.trim()
            : null
          : undefined,
      purchaseRate:
        payload.purchaseRate !== undefined
          ? payload.purchaseRate != null && !isNaN(Number(payload.purchaseRate))
            ? Number(payload.purchaseRate)
            : null
          : undefined,
      profitPercentage:
        payload.profitPercentage !== undefined
          ? payload.profitPercentage != null && !isNaN(Number(payload.profitPercentage))
            ? Number(payload.profitPercentage)
            : payload.profit != null && !isNaN(Number(payload.profit))
              ? Number(payload.profit)
              : null
          : undefined,
      stock:
        payload.stock !== undefined
          ? payload.stock != null && !isNaN(Number(payload.stock))
            ? Math.round(Number(payload.stock))
            : null
          : undefined,
      isActive: payload.isActive ?? true,
      isDeleted: payload.isDeleted ?? false,
    };
    if (img !== undefined) {
      body.productImage = img ? img.trim() : null;
      body.productImagePath = img ? img.trim() : null;
    }
    const response = await apiClient.put(`${API_ENDPOINTS.Products}/${id}`, body);
    const raw = (response.data as any)?.data ?? (response.data as any)?.result ?? response.data;
    const updated = raw ? mapProductFromApi(raw) : undefined;
    if (updated) {
      if (uomToSave) {
        updated.unitName = uomToSave;
        updated.uom = uomToSave;
      }
      if (payload.purchaseRate !== undefined && payload.purchaseRate !== null) updated.purchaseRate = payload.purchaseRate;
      if (payload.profitPercentage !== undefined && payload.profitPercentage !== null) updated.profitPercentage = payload.profitPercentage;
      if (payload.stock !== undefined && payload.stock !== null) updated.stock = payload.stock;
    }
    return updated;
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

  getEnquiries: async (): Promise<any[]> => {
    try {
      const endpoint =
        API_ENDPOINTS.Enquiry ||
        API_ENDPOINTS.Enquiries ||
        `${API_ENDPOINTS.BaseUrl}/Enquiry`;
      const response = await apiClient.get<any>(endpoint);
      return normalizeArray<any>(response.data);
    } catch (error) {
      console.warn("Failed to fetch enquiries:", error);
      return [];
    }
  },
};
