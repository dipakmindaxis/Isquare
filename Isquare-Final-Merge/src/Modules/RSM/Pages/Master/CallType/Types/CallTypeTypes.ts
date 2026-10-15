export interface CallType {
  id: number;
  callTypeName: string;
  isActive: boolean;
}

export interface CallTypeCreatePayload {
  id?: number;
  callTypeName: string;
  isActive: boolean;
}

export interface CallTypeUpdatePayload {
  id: number;
  callTypeName: string;
  isActive: boolean;
}
