export interface TaskHistoryItem {
  historyId: number;
  taskId: number;
  taskTitle?: string;
  activity: string;
  remarks?: string;
  performedBy?: number;
  performedByName?: string;
  performedDate?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface CreateTaskHistoryPayload {
  taskId: number;
  activity: string;
  remarks?: string;
  performedBy?: number;
  isActive?: boolean;
}
