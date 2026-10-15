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
