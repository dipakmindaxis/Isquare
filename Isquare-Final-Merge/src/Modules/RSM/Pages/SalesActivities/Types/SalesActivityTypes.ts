export type ActivityType =
  | "Phone Call"
  | "Email"
  | "WhatsApp Follow-up"
  | "Customer Visit"
  | "Online Meeting"
  | "Site Survey"
  | "Product Demonstration"
  | "Sample Submitted"
  | "Discussion Notes"
  | (string & {});

export type ActivityStatus =
  | "Scheduled"
  | "Due Today"
  | "Overdue"
  | "Completed"
  | "In Progress"
  | "Cancelled"
  | (string & {});

export type RelatedRecordType = "Enquiry" | "Quotation" | "None";

export interface ActivityAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  isImage?: boolean;
  uploadedAt: string;
  documentType?: string;
  remarks?: string;
  file?: File;
}

export interface SalesActivity {
  id: string;
  activityCode: string; // e.g., ACT-2026-001
  activityType: ActivityType;
  subject: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  activityDate: string; // YYYY-MM-DD
  activityTime: string; // HH:mm (or 10:30 AM)
  durationMinutes?: number;
  status: ActivityStatus;
  statusDescription?: string;
  discussionNotes: string;
  outcome?: string;
  nextActionDate?: string; // YYYY-MM-DD
  nextActionDetails?: string;
  followUpDate?: string;
  followUpStatus?: string;
  reminderTitle?: string;
  reminderDate?: string;
  reminderTime?: string;
  reminderRemarks?: string;

  // Association with Enquiry / Quotation
  relatedRecordType: RelatedRecordType;
  relatedRecordId?: string;
  relatedRecordCode?: string; // e.g. ENQ-2026-042 or QUO-2026-108
  relatedRecordTitle?: string;

  // Conditional Fields
  location?: string; // For Customer Visit / Site Survey
  workLocationId?: number | string; // Linked WorkLocation
  meetingLink?: string; // For Online Meeting
  productName?: string; // For Product Demonstration / Sample Submitted
  sampleQuantity?: string; // For Sample Submitted
  callOutcome?: string; // For Phone Call (e.g. Connected, Left Voicemail, Busy)
  callType?: string; // From Call Types Master
  meetingType?: string; // From Meeting Types Master
  activitySubType?: string; // Sub Type from ActivityType Master
  priority?: "Urgent" | "High" | "Medium" | "Low" | string; // Follow-up Priority
  priorityId?: number;
  followUpPriorityId?: number;
  followUpStatusId?: number;
  assignedType?: "Employee" | "Team";
  assignedTeamId?: number | string;
  assignedTeamName?: string;
  reminderAssignedTo?: number | string;
  reminderPriorityId?: number;
  reminderStatusId?: number;
  dueTime?: string; // Follow-up Due Time
  documentCategory?: string; // From Document Types Master

  // Attachments & Photographs
  photographs: ActivityAttachment[];
  documents: ActivityAttachment[];

  createdAt: string;
  updatedAt: string;
}

export interface SalesActivityCreatePayload {
  activityType: ActivityType;
  subject: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedType?: "Employee" | "Team";
  assignedTeamId?: number | string;
  assignedTeamName?: string;
  activityDate: string;
  activityTime: string;
  durationMinutes?: number;
  status: ActivityStatus;
  statusDescription?: string;
  discussionNotes: string;
  outcome?: string;
  nextActionDate?: string;
  nextActionDetails?: string;
  followUpDate?: string;
  followUpStatus?: string;
  followUpPriorityId?: number;
  followUpStatusId?: number;
  reminderTitle?: string;
  reminderDate?: string;
  reminderTime?: string;
  reminderRemarks?: string;
  reminderAssignedTo?: number | string;
  reminderPriorityId?: number;
  reminderStatusId?: number;
  relatedRecordType: RelatedRecordType;
  relatedRecordId?: string;
  relatedRecordCode?: string;
  relatedRecordTitle?: string;
  location?: string;
  workLocationId?: number | string;
  meetingLink?: string;
  productName?: string;
  sampleQuantity?: string;
  callOutcome?: string;
  callType?: string;
  meetingType?: string;
  activitySubType?: string;
  priority?: "Urgent" | "High" | "Medium" | "Low" | string;
  priorityId?: number;
  dueTime?: string;
  documentCategory?: string;
  photographs?: ActivityAttachment[];
  documents?: ActivityAttachment[];
}

export type SalesActivityUpdatePayload = Partial<SalesActivityCreatePayload> & {
  id: string;
};

export interface SalesActivityFilterParams {
  search?: string;
  activityType?: ActivityType | "All";
  status?: ActivityStatus | "All";
  assignedEmployeeId?: string | "All";
  customerId?: string | "All";
  tabFilter?: "all" | "today" | "upcoming" | "overdue" | "completed";
  startDate?: string;
  endDate?: string;
}

export interface ActivitySummaryStats {
  total: number;
  dueToday: number;
  upcoming: number;
  overdue: number;
  completed: number;
}

export interface CustomerOption {
  id: string;
  name: string;
  companyName?: string;
  contactPerson: string;
  phone: string;
  email: string;
  industry: string;
  city: string;
  directorId?: number | null;
  directorName?: string | null;
  bdeUserId?: number | null;
  bdeUserName?: string | null;
  salesCoordinatorId?: number | null;
  salesCoordinatorName?: string | null;
  customerOwnerId?: number | null;
  customerOwnerName?: string | null;
  customerOwnerType?: string | null;
  contactPersons?: any[];
}

export interface EmployeeOption {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface RelatedRecordOption {
  id: string;
  type: "Enquiry" | "Quotation";
  code: string;
  title: string;
  customerId?: string;
  date: string;
  amount?: string;
}
