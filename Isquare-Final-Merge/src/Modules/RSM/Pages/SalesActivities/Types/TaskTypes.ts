export interface TaskItem {
  taskId: number;
  companyId: number;
  companyName?: string;
  taskTitle: string;
  description?: string;
  assignedTo: number; // Director ID
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
  taskTitle: string;
  description?: string;
  assignedTo: number; // Director's ID
  assignedBy: number;
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
  description?: string;
  assignedTo?: number;
  assignedBy?: number;
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
  tabFilter?: "all" | "pending" | "completed" | "today" | "overdue";
}

export interface TaskSummaryStats {
  total: number;
  pending: number;
  completed: number;
  dueToday: number;
  overdue: number;
}
