export interface CustomerSource {
  customerSourceId: number;
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerSourceCreatePayload {
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
}

export interface CustomerSourceUpdatePayload {
  customerSourceId?: number;
  sourceName: string;
  sourceCode: string;
  isActive: boolean;
}
