export interface Quotation {
  quotationId: number;
  quotationNumber?: string | null;
  customerId: number;
  customerName?: string | null;
  enquiryId?: number | null;
  enquiryRef?: string | null;
  quotationDate?: string | null;
  revisionNumber: number;
  status?: string | null; // "Draft" | "Sent" | "Approved" | "Won" | "Lost" | "Revised"
  approvalStatus?: string | null; // "Pending" | "Approved" | "Rejected"
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  freightCharges: number;
  installationCharges: number;
  otherCharges: number;
  grandTotal: number;
  deliveryPeriod?: string | null;
  paymentTermId?: number | null;
  paymentTermsName?: string | null;
  warranty?: string | null;
  validUntil?: string | null;
  termsAndConditions?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  items?: QuotationItem[];
  charges?: QuotationCharge[];
  contactPersonId?: number | null;
  contactPerson?: string | null;
}

export interface QuotationItem {
  quotationItemId: number;
  quotationId: number;
  productId?: number | null;
  parentQuotationItemId?: number | null;
  isAccessory: boolean;
  itemCode?: string | null;
  itemName: string;
  brand?: string | null;
  specification?: string | null;
  quantity: number;
  unitOfMeasurementId?: number | null;
  unitName?: string | null;
  rate: number;
  discountPercentage: number;
  discountAmount: number;
  gstRate: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  accessories?: QuotationItem[];
  imageUrl?: string | null;
  customImageUrl?: string | null;
  hasCustomImage?: boolean;
  productImage?: string | null;
  productImagePath?: string | null;
  hasCustomSpecification?: boolean;
}

export interface QuotationCharge {
  quotationChargeId: number;
  quotationId: number;
  chargeName: string;
  description?: string | null;
  chargeType: "Fixed" | "Percentage";
  chargeAmount: number;
  taxRate: number;
  taxAmount?: number;
  totalAmount?: number;
  isTaxable: boolean;
  isActive: boolean;
}

export interface CreateQuotationChargeDto {
  quotationId: number;
  chargeName: string;
  description?: string | null;
  chargeType: "Fixed" | "Percentage";
  chargeAmount: number;
  taxRate: number;
  isTaxable: boolean;
}

export interface QuotationApproval {
  quotationApprovalId: number;
  quotationId: number;
  quotationNumber?: string | null;
  approvalStatus?: string | null;
  approvalReason?: string | null;
  requestedBy?: string | null;
  requestedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approverComments?: string | null;
}

export interface CreateQuotationApprovalDto {
  quotationId: number;
  approvalReason?: string | null;
}

export interface DecideQuotationApprovalDto {
  decision: "Approved" | "Rejected";
  approverComments?: string | null;
}

export interface QuotationRevision {
  quotationRevisionId: number;
  quotationId: number;
  revisionNumber: string | number;
  revisionReason?: string | null;
  revisedBy?: string | null;
  revisionDate?: string | null;
  quotationNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  enquiryId?: number | null;
  quotationDate?: string | null;
  quotationStatus?: string | null;
  subtotal?: number;
  discountAmount?: number;
  taxableAmount?: number;
  taxAmount?: number;
  freightCharges?: number;
  installationCharges?: number;
  otherCharges?: number;
  grandTotal?: number;
  deliveryPeriod?: string | null;
  paymentTermId?: number | null;
  warranty?: string | null;
  validUntil?: string | null;
  termsAndConditions?: string | null;
}

export interface CreateQuotationRevisionDto {
  quotationId: number;
  revisionReason: string;
}

export interface QuotationDefault {
  quotationDefaultId: number;
  defaultDeliveryPeriod: string;
  paymentTermId?: number | null;
  paymentTermName?: string | null;
  standardWarranty: string;
  quotationValidity: string;
  standardTermsAndConditions?: string | null;
  companyName?: string | null;
  gstNumber?: string | null;
  companyAddress?: string | null;
  companyLogoPath?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountHolderName?: string | null;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CompanyProfile {
  companyProfileId: number;
  companyName: string;
  legalName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logoPath?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branchName?: string | null;
  accountType?: string | null;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
}

export interface SalesOrder {
  salesOrderId: number;
  salesOrderNumber?: string | null;
  quotationId?: number | null;
  quotationNumber?: string | null;
  customerId: number;
  customerName?: string | null;
  orderDate?: string | null;
  expectedDeliveryDate?: string | null;
  orderStatus?: string | null;
  subtotal?: number;
  discountAmount?: number;
  taxableAmount?: number;
  taxAmount?: number;
  freightCharges?: number;
  otherCharges?: number;
  grandTotal?: number;
  paymentTerms?: string | null;
  deliveryAddress?: string | null;
  remarks?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  items?: SalesOrderItem[];
}

export interface CreateSalesOrderDto {
  quotationId?: number | null;
  customerId: number;
  expectedDeliveryDate?: string | null;
  paymentTerms?: string | null;
  deliveryAddress?: string | null;
  remarks?: string | null;
}

export interface SalesOrderItem {
  salesOrderItemId: number;
  salesOrderId: number;
  productId?: number | null;
  parentSalesOrderItemId?: number | null;
  isAccessory: boolean;
  itemCode?: string | null;
  itemName: string;
  brand?: string | null;
  specification?: string | null;
  quantity: number;
  unitOfMeasurement?: string | null; // string in SalesOrderItem
  rate: number;
  discountPercentage: number;
  discountAmount?: number;
  gstRate: number;
  taxableAmount?: number;
  taxAmount?: number;
  lineTotal?: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  accessories?: SalesOrderItem[];
}

export interface CreateSalesOrderItemDto {
  salesOrderId: number;
  productId?: number | null;
  parentSalesOrderItemId?: number | null;
  isAccessory?: boolean;
  itemCode?: string | null;
  itemName: string;
  brand?: string | null;
  specification?: string | null;
  quantity: number;
  unitOfMeasurement?: string | null;
  rate: number;
  discountPercentage?: number;
  gstRate?: number;
  displayOrder?: number;
}

export interface Product {
  productId: number;
  itemCode?: string | null;
  productName: string;
  brand?: string | null;
  specification?: string | null;
  unitOfMeasurementId?: number | null;
  standardRate: number;
  gstRate: number;
  isActive: boolean;
  isDeleted: boolean;
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  productImage?: string | null;
  productImagePath?: string | null;
}
