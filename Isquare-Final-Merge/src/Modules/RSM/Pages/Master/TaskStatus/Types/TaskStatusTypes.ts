export interface TaskStatus {
  id: number;
  statusName: string;
  isDeleted: boolean;
  // Aliases for compatibility
  taskStatusId?: number;
  isActive?: boolean;
}

export interface TaskStatusCreatePayload {
  statusName: string;
  isDeleted?: boolean;
}

export interface TaskStatusUpdatePayload {
  id: number;
  statusName: string;
  isDeleted?: boolean;
}
