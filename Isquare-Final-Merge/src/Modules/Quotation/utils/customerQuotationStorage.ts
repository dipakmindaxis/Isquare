export interface CustomerQuotationFileRecord {
  quotationId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string; // base64 data URL
  uploadedAt: string;
  customerName?: string;
  contactPerson?: string;
}

const STORAGE_KEY = "isquare_customer_quotations_files_v1";

export function getAllCustomerQuotationFiles(): Record<string, CustomerQuotationFileRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse customer quotation files from localStorage", e);
  }
  return {};
}

export function saveCustomerQuotationFile(record: CustomerQuotationFileRecord): void {
  try {
    const all = getAllCustomerQuotationFiles();
    all[String(record.quotationId)] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save customer quotation file to localStorage", e);
  }
}

export function getCustomerQuotationFile(quotationId: number | string): CustomerQuotationFileRecord | null {
  const all = getAllCustomerQuotationFiles();
  return all[String(quotationId)] || null;
}

export function isCustomerFormatQuotation(quotationId: number | string, quotation?: any): boolean {
  if (getCustomerQuotationFile(quotationId)) return true;
  if (quotation) {
    const num = (quotation.quotationNumber || "").toLowerCase();
    const terms = (quotation.termsAndConditions || "").toLowerCase();
    if (num.includes("-ext-") || num.includes("cust-") || terms.includes("original customer format file")) {
      return true;
    }
  }
  return false;
}

export function downloadOriginalCustomerQuotation(quotationId: number | string): boolean {
  const record = getCustomerQuotationFile(quotationId);
  if (!record || !record.dataUrl) {
    return false;
  }

  const link = document.createElement("a");
  link.href = record.dataUrl;
  link.download = record.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
