export interface SalesUserManager {
  id: number;
  userName: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface SalesUserManagerCreatePayload {
  id: number;
  userName: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}
