export interface Industry {
  industryId: number;
  industryName: string;
  industryCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface IndustryCreatePayload {
  industryName: string;
  industryCode: string;
  isActive: boolean;
}

export interface IndustryUpdatePayload {
  industryId?: number;
  industryName: string;
  industryCode: string;
  isActive: boolean;
}
