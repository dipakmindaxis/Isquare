export interface TaskItem {
  taskId: number;
  companyId: number;
  companyName?: string;
  taskTitle: string;
  taskType?: string;
  description?: string;
  assignedTo: number;
  assignedToName?: string;
  assignedBy: number;
  assignedByName?: string;
  priorityId: number;
  priorityName?: "Urgent" | "High" | "Medium" | "Low" | string;
  priorityColor?: string;
  taskStatusId: number;
  taskStatusName?: string;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  reminderId?: number;
  reminderDate?: string;
  reminderTime?: string;
  reminderRemarks?: string;
  remarks?: string;
  createdBy: number;
  createdDate?: string;
  isCompleted?: boolean;
  isDeleted?: boolean;
}

export interface TaskCreatePayload {
  taskId?: number;
  companyId: number;
  companyName?: string;
  taskTitle: string;
  taskType?: string;
  description?: string;
  assignedTo: number;
  assignedToName?: string;
  assignedBy: number;
  assignedByName?: string;
  priorityId: number;
  taskStatusId: number;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  reminderId?: number;
  reminderDate?: string;
  reminderTime?: string;
  reminderRemarks?: string;
  remarks?: string;
  createdBy: number;
  isDeleted?: boolean;
}

export interface TaskUpdatePayload {
  taskId: number;
  companyId?: number;
  taskTitle?: string;
  taskType?: string;
  description?: string;
  assignedTo?: number;
  assignedToName?: string;
  assignedBy?: number;
  assignedByName?: string;
  priorityId?: number;
  taskStatusId?: number;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  reminderId?: number;
  remarks?: string;
  isDeleted?: boolean;
}

export interface TaskAssignPayload {
  assignedTo: number;
  assignedBy: number;
}

export interface TaskStatusItem {
  taskStatusId: number;
  id?: number;
  statusName: string;
  statusCode?: string;
  isActive: boolean;
}

export interface TaskFilterParams {
  search?: string;
  status?: string | "All";
  priorityId?: number | "All";
  assignedTo?: number | "All";
  taskType?: string | "All";
  tabFilter?: "all" | "pending" | "completed" | "today" | "overdue";
}

export interface TaskSummaryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  dueToday: number;
  overdue: number;
}

export interface TaskActivityFeedItem {
  id: string | number;
  by: string;
  text: string;
  customer?: string;
  time: string;
  type?: string;
}
