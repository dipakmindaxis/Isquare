export interface CustomerArea {
  customerAreaId: number;
  areaName: string;
  areaCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerAreaCreatePayload {
  areaName: string;
  areaCode: string;
  isActive: boolean;
}

export interface CustomerAreaUpdatePayload {
  customerAreaId?: number;
  areaName: string;
  areaCode: string;
  isActive: boolean;
}
