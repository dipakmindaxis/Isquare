export interface BdeUser {
  id: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface BdeUserCreatePayload {
  id: number;
  value: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}
