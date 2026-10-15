export interface AddressType {
  addressTypeId: number;
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface AddressTypeCreatePayload {
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
}

export interface AddressTypeUpdatePayload {
  addressTypeId?: number;
  addressTypeName: string;
  addressTypeCode: string;
  isActive: boolean;
}
