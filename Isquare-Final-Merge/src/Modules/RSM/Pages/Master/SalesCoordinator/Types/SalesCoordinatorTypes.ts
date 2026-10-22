export interface SalesCoordinator {
  salesCoordinatorId: number;
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  bdeUserId?: number | null;
  bdeUserName?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface SalesCoordinatorCreatePayload {
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  bdeUserId?: number | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface SalesCoordinatorUpdatePayload {
  salesCoordinatorId?: number;
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  bdeUserId?: number | null;
  isActive: boolean;
  isDeleted?: boolean;
}
