export interface CustomerStatus {
  customerStatusId: number;
  statusName: string;
  description: string;
  statusCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerStatusCreatePayload {
  statusName: string;
  description?: string;
  statusCode: string;
  isActive: boolean;
}

export interface CustomerStatusUpdatePayload {
  customerStatusId?: number;
  statusName: string;
  description?: string;
  statusCode: string;
  isActive: boolean;
}
