export interface SalesCoordinator {
  salesCoordinatorId: number;
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface SalesCoordinatorCreatePayload {
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface SalesCoordinatorUpdatePayload {
  salesCoordinatorId?: number;
  salesCoordinatorName: string;
  salesCoordinatorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}
