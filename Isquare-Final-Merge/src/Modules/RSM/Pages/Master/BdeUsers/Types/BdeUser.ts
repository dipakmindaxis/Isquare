export interface BdeUser {
  id: number;
  value: string;
  code: string;
  directorEmployeeId?: number | null;
  directorName?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface BdeUserCreatePayload {
  id?: number;
  value: string;
  code: string;
  directorEmployeeId?: number | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface BdeUserUpdatePayload {
  id?: number;
  value: string;
  code: string;
  directorEmployeeId?: number | null;
  isActive: boolean;
  isDeleted?: boolean;
}
