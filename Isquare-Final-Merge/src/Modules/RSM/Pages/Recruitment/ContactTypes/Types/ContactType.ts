export interface ContactType {
  contactTypeId: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ContactTypeCreatePayload {
  contactTypeId: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}