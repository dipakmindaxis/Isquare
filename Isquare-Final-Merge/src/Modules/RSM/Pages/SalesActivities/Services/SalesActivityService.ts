import type {
  ActivitySummaryStats,
  CustomerOption,
  EmployeeOption,
  RelatedRecordOption,
  SalesActivity,
  SalesActivityCreatePayload,
  SalesActivityFilterParams,
  SalesActivityUpdatePayload,
} from "../Types/SalesActivityTypes";
import { getAllCustomers } from "../../Customer/Services/CustomerService";
import { getAllBdeUsers } from "../../Master/BdeUsers/Services/BdeUserService";
import { getAllDocumentTypes } from "../../Master/DocumentType/Services/DocumentTypeService";
import { getAllCallTypes } from "../../Master/CallType/Services/CallTypeService";
import {
  getAllActivityTypes,
  type ActivityType as MasterActivityType,
} from "../../Master/ActivityType/Services/ActivityTypeService";
import { getAllMeetingTypes } from "../../Master/MeetingType/Services/MeetingTypeService";
import {
  getAllCustomerStatuses,
  type CustomerStatus,
} from "../../Master/CustomerStatus/Services/CustomerStatusService";
import { getAllReminders } from "../../Master/Reminder/Services/ReminderService";

export { getAllActivityTypes, getAllMeetingTypes, getAllCustomerStatuses };
export const getActivityTypes = getAllActivityTypes;
export const getCustomerStatuses = getAllCustomerStatuses;
export type { MasterActivityType, CustomerStatus };

// Storage Keys
const ACTIVITIES_STORAGE_KEY = "isquare_sales_activities_v3";
const CALLS_STORAGE_KEY = "isquare_sales_calls_v3";
const MEETINGS_STORAGE_KEY = "isquare_sales_meetings_v3";
const FOLLOWUPS_STORAGE_KEY = "isquare_sales_followups_v3";
const ATTACHMENTS_STORAGE_KEY = "isquare_sales_attachments_v3";
const INTERVALS_STORAGE_KEY = "isquare_sales_fu_intervals_v2";

// Storage Helpers
const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, val: string): void => {
  try {
    localStorage.setItem(key, val);
  } catch {}
};

// ==========================================
// Types
// ==========================================

export interface CallRecord {
  id: string;
  callCode: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  callType: string;
  assignedTo: string;
  callDate: string;
  callTime: string;
  durationMinutes: number;
  status: string;
  callOutcome: string;
  nextFollowUpDate?: string;
  remarks: string;
}

export interface MeetingRecord {
  id: string;
  meetingCode: string;
  customerId: string;
  customerName: string;
  meetingType: string;
  assignedUser: string;
  meetingStatus: string;
  meetingDate: string;
  meetingTime: string;
  durationMinutes: number;
  location: string;
  agenda: string;
  outcome?: string;
  nextFollowUpDate?: string;
  attendees: string;
}

export interface FollowUpItem {
  id: string;
  followUpCode: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  followUpType: string;
  dueDate: string;
  dueTime: string;
  assignedRep: string;
  priority: string;
  status: string;
  relatedRecordCode?: string;
  actionDetails: string;
  completionNotes?: string;
}

export interface SalesAttachmentItem {
  id: string;
  name: string;
  category: "Visit Photograph" | "Site Survey Report" | "Customer PO" | "Technical Datasheet" | "MOM Document";
  customerId: string;
  customerName: string;
  relatedActivityCode?: string;
  fileSizeKB: number;
  fileType: string;
  isImage: boolean;
  uploadedBy: string;
  uploadedDate: string;
}

export interface CallTypeItem {
  id: number;
  value: string;
  label?: string;
  code: string;
  isActive: boolean;
}

export interface MeetingTypeItem {
  id: number;
  value: string;
  label?: string;
  code: string;
  isActive: boolean;
}

export interface ActivityOutcomeItem {
  id: number;
  value: string;
  label?: string;
  code: string;
  category: "Call" | "Meeting" | "General";
  isActive: boolean;
}

export interface FollowUpIntervalItem {
  id: number;
  value: string;
  label?: string;
  code: string;
  isActive: boolean;
}

export interface DocumentTypeItem {
  id: number;
  value: string;
  label?: string;
  code: string;
  isActive: boolean;
}

// ==========================================
// Sales Activities Store & CRUD
// ==========================================

export const getStoredActivities = (): SalesActivity[] => {
  const raw = safeGet(ACTIVITIES_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p: any) => !p.isMock);
      }
    } catch {}
  }
  return [];
};

export const saveActivities = (activities: SalesActivity[]): void => {
  safeSet(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
};

export const getSalesActivities = async (
  filters?: SalesActivityFilterParams
): Promise<SalesActivity[]> => {
  let items = getStoredActivities();

  // Gracefully merge backend reminders if available (max 400ms timeout)
  try {
    const fetchWithTimeout = Promise.race([
      getAllReminders(),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 400)),
    ]);
    const backendReminders = await fetchWithTimeout;
    if (Array.isArray(backendReminders)) {
      for (const r of backendReminders) {
        const idStr = `REM-${r.reminderId}`;
        const alreadyInList = items.some((it) => it.id === idStr || it.activityCode === idStr);
        if (!alreadyInList) {
          const rDate = r.reminderDate ? r.reminderDate.split("T")[0] : "";
          items.push({
            id: idStr,
            activityCode: `REM-${String(r.reminderId).padStart(3, "0")}`,
            activityType: "Phone Call",
            subject: r.title || "Sales Activity Reminder",
            customerId: String(r.companyId || ""),
            customerName: `Customer #${r.companyId || ""}`,
            contactPerson: "",
            assignedEmployeeId: String(r.assignedTo || ""),
            assignedEmployeeName: `Rep #${r.assignedTo || ""}`,
            activityDate: rDate || new Date().toISOString().split("T")[0],
            activityTime: "10:00 AM",
            durationMinutes: 15,
            status: r.isActive ? "Scheduled" : "Completed",
            discussionNotes: r.remarks || "",
            nextActionDate: rDate,
            nextActionDetails: r.remarks,
            relatedRecordType: "None",
            photographs: [],
            documents: [],
            createdAt: r.createdDate || new Date().toISOString(),
            updatedAt: r.createdDate || new Date().toISOString(),
          });
        }
      }
    }
  } catch {}

  if (!filters) return items;

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (a) =>
        a.subject.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.activityCode.toLowerCase().includes(q) ||
        a.assignedEmployeeName.toLowerCase().includes(q) ||
        (a.relatedRecordCode && a.relatedRecordCode.toLowerCase().includes(q)) ||
        (a.discussionNotes && a.discussionNotes.toLowerCase().includes(q))
    );
  }

  if (filters.activityType && filters.activityType !== "All") {
    items = items.filter((a) => a.activityType === filters.activityType);
  }

  if (filters.status && filters.status !== "All") {
    items = items.filter((a) => a.status === filters.status);
  }

  if (filters.assignedEmployeeId && filters.assignedEmployeeId !== "All") {
    items = items.filter((a) => a.assignedEmployeeId === filters.assignedEmployeeId);
  }

  if (filters.customerId && filters.customerId !== "All") {
    items = items.filter((a) => a.customerId === filters.customerId);
  }

  if (filters.tabFilter && filters.tabFilter !== "all") {
    if (filters.tabFilter === "today") {
      items = items.filter(
        (a) =>
          a.status === "Due Today" ||
          a.nextActionDate === new Date().toISOString().split("T")[0]
      );
    } else if (filters.tabFilter === "upcoming") {
      items = items.filter(
        (a) => a.status === "Scheduled" || a.status === "Upcoming"
      );
    } else if (filters.tabFilter === "overdue") {
      items = items.filter((a) => {
        const norm = (a.status || "").toLowerCase();
        if (norm === "completed" || norm === "complete" || norm === "cancelled")
          return false;
        if (norm === "overdue") return true;
        if (a.nextActionDate) {
          const targetDate = new Date(a.nextActionDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return targetDate < today;
        }
        return false;
      });
    } else if (filters.tabFilter === "completed") {
      items = items.filter((a) => {
        const norm = (a.status || "").toLowerCase();
        return norm === "completed" || norm === "complete";
      });
    }
  }

  return items;
};

export const getActivitySummaryStats = async (): Promise<ActivitySummaryStats> => {
  const items = getStoredActivities();
  const isCompleted = (s?: string) => {
    const norm = (s || "").toLowerCase();
    return norm === "completed" || norm === "complete";
  };
  const isToday = (a: SalesActivity) => {
    const today = new Date().toISOString().split("T")[0];
    return a.status === "Due Today" || a.nextActionDate === today;
  };
  const isOverdue = (a: SalesActivity) => {
    if (isCompleted(a.status) || (a.status || "").toLowerCase() === "cancelled")
      return false;
    if ((a.status || "").toLowerCase() === "overdue") return true;
    if (a.nextActionDate) {
      const targetDate = new Date(a.nextActionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return targetDate < today;
    }
    return false;
  };
  const isUpcoming = (a: SalesActivity) => {
    if (isCompleted(a.status) || (a.status || "").toLowerCase() === "cancelled")
      return false;
    return a.status === "Scheduled" || a.status === "Upcoming";
  };

  return {
    total: items.length,
    dueToday: items.filter(isToday).length,
    upcoming: items.filter(isUpcoming).length,
    overdue: items.filter(isOverdue).length,
    completed: items.filter((a) => isCompleted(a.status)).length,
  };
};

export const getActivityById = async (id: string): Promise<SalesActivity | null> => {
  const items = getStoredActivities();
  return items.find((a) => a.id === id) || null;
};

export const createSalesActivity = async (
  payload: SalesActivityCreatePayload
): Promise<SalesActivity> => {
  const items = getStoredActivities();
  const timestamp = Date.now();
  const newId = `ACT-${timestamp}`;
  const activityCode = `ACT-${new Date().getFullYear()}-${String(items.length + 1).padStart(3, "0")}`;

  const newActivity: SalesActivity = {
    ...payload,
    id: newId,
    activityCode,
    photographs: payload.photographs || [],
    documents: payload.documents || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newActivity, ...items];
  saveActivities(updated);

  // Auto-sync into calls
  if (payload.activityType === "Phone Call") {
    const calls = getStoredCalls();
    const callItem: CallRecord = {
      id: `CALL-${timestamp}`,
      callCode: `CALL-2026-${String(calls.length + 1).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      contactPerson: payload.contactPerson,
      phone: payload.contactPhone || "",
      callType: (payload.callType as any) || "Follow-up",
      assignedTo: payload.assignedEmployeeName,
      callDate: payload.activityDate,
      callTime: payload.activityTime,
      durationMinutes: payload.durationMinutes || 15,
      status: payload.status === "Completed" ? "Done" : "Pending",
      callOutcome: (payload.callOutcome as any) || "Connected - Follow-up Required",
      nextFollowUpDate: payload.nextActionDate,
      remarks: payload.discussionNotes,
    };
    saveCalls([callItem, ...calls]);
  }

  // Auto-sync into meetings
  if (
    payload.activityType === "Online Meeting" ||
    payload.activityType === "Customer Visit" ||
    payload.activityType === "Site Survey" ||
    payload.activityType === "Product Demonstration" ||
    payload.activityType === "Sample Submitted"
  ) {
    const meetings = getStoredMeetings();
    const meetingItem: MeetingRecord = {
      id: `MTG-${timestamp}`,
      meetingCode: `MTG-2026-${String(meetings.length + 1).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      meetingType: (payload.meetingType as any) || (payload.activityType === "Customer Visit" ? "Site Audit" : "Technical Review"),
      assignedUser: payload.assignedEmployeeName,
      meetingStatus: payload.status === "Completed" ? "Completed" : "Scheduled",
      meetingDate: payload.activityDate,
      meetingTime: payload.activityTime,
      durationMinutes: payload.durationMinutes || 45,
      location: payload.location || payload.meetingLink || "Plant Site / Office",
      agenda: payload.subject,
      outcome: payload.outcome || payload.discussionNotes,
      nextFollowUpDate: payload.nextActionDate,
      attendees: `${payload.contactPerson}, ${payload.assignedEmployeeName}`,
    };
    saveMeetings([meetingItem, ...meetings]);
  }

  // Auto-sync into followups
  if (payload.nextActionDate) {
    const followUps = getStoredFollowUps();
    const fuItem: FollowUpItem = {
      id: `FU-${timestamp}`,
      followUpCode: `FU-2026-${String(followUps.length + 1).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      contactPerson: payload.contactPerson,
      phone: payload.contactPhone || "",
      followUpType: payload.activityType === "Phone Call" ? "Call Follow-up" : "Meeting Follow-up",
      dueDate: payload.nextActionDate,
      dueTime: payload.dueTime || "11:00 AM",
      assignedRep: payload.assignedEmployeeName,
      priority: payload.priority || "High",
      status: "Upcoming",
      relatedRecordCode: payload.relatedRecordCode,
      actionDetails: payload.nextActionDetails || `Follow-up for ${payload.subject}`,
    };
    saveFollowUps([fuItem, ...followUps]);
  }

  return newActivity;
};

export const updateSalesActivity = async (
  payload: SalesActivityUpdatePayload
): Promise<SalesActivity> => {
  const items = getStoredActivities();
  const index = items.findIndex((a) => a.id === payload.id);
  if (index === -1) {
    throw new Error(`Activity ${payload.id} not found`);
  }

  const updatedItem: SalesActivity = {
    ...items[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updatedItem;
  saveActivities(items);
  return updatedItem;
};

export const deleteSalesActivity = async (id: string): Promise<boolean> => {
  const items = getStoredActivities();
  saveActivities(items.filter((a) => a.id !== id));
  return true;
};

// ==========================================
// Calls Master
// ==========================================

export const getStoredCalls = (): CallRecord[] => {
  const raw = safeGet(CALLS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((c: any) => !c.isMock);
      }
    } catch {}
  }
  return [];
};

export const saveCalls = (calls: CallRecord[]): void => {
  safeSet(CALLS_STORAGE_KEY, JSON.stringify(calls));
};

export const getCalls = async (): Promise<CallRecord[]> => {
  return getStoredCalls();
};

export const createCallRecord = async (call: CallRecord): Promise<CallRecord> => {
  const calls = getStoredCalls();
  const updated = [call, ...calls];
  saveCalls(updated);
  return call;
};

export const updateCallRecord = async (call: CallRecord): Promise<CallRecord> => {
  const calls = getStoredCalls();
  const updated = calls.map((c) => (c.id === call.id ? call : c));
  saveCalls(updated);
  return call;
};

export const deleteCallRecord = async (id: string): Promise<void> => {
  const calls = getStoredCalls();
  saveCalls(calls.filter((c) => c.id !== id));
};

// ==========================================
// Meetings Master
// ==========================================

export const getStoredMeetings = (): MeetingRecord[] => {
  const raw = safeGet(MEETINGS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((m: any) => !m.isMock);
      }
    } catch {}
  }
  return [];
};

export const saveMeetings = (meetings: MeetingRecord[]): void => {
  safeSet(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
};

export const getMeetings = async (): Promise<MeetingRecord[]> => {
  return getStoredMeetings();
};

export const createMeetingRecord = async (meeting: MeetingRecord): Promise<MeetingRecord> => {
  const meetings = getStoredMeetings();
  const updated = [meeting, ...meetings];
  saveMeetings(updated);
  return meeting;
};

export const updateMeetingRecord = async (meeting: MeetingRecord): Promise<MeetingRecord> => {
  const meetings = getStoredMeetings();
  const updated = meetings.map((m) => (m.id === meeting.id ? meeting : m));
  saveMeetings(updated);
  return meeting;
};

export const deleteMeetingRecord = async (id: string): Promise<void> => {
  const meetings = getStoredMeetings();
  saveMeetings(meetings.filter((m) => m.id !== id));
};

// ==========================================
// Follow-Up Tracker
// ==========================================

export const getStoredFollowUps = (): FollowUpItem[] => {
  const raw = safeGet(FOLLOWUPS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((f: any) => !f.isMock);
      }
    } catch {}
  }
  return [];
};

export const saveFollowUps = (followUps: FollowUpItem[]): void => {
  safeSet(FOLLOWUPS_STORAGE_KEY, JSON.stringify(followUps));
};

export const getFollowUps = async (): Promise<FollowUpItem[]> => {
  return getStoredFollowUps();
};

export const createFollowUpRecord = async (item: FollowUpItem): Promise<FollowUpItem> => {
  const followUps = getStoredFollowUps();
  const updated = [item, ...followUps];
  saveFollowUps(updated);
  return item;
};

export const updateFollowUpRecord = async (item: FollowUpItem): Promise<FollowUpItem> => {
  const followUps = getStoredFollowUps();
  const updated = followUps.map((f) => (f.id === item.id ? item : f));
  saveFollowUps(updated);
  return item;
};

export const deleteFollowUpRecord = async (id: string): Promise<void> => {
  const followUps = getStoredFollowUps();
  saveFollowUps(followUps.filter((f) => f.id !== id));
};

// ==========================================
// Attachments
// ==========================================

export const getStoredAttachments = (): SalesAttachmentItem[] => {
  const raw = safeGet(ATTACHMENTS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((a: any) => !a.isMock);
      }
    } catch {}
  }
  return [];
};

export const saveAttachments = (attachments: SalesAttachmentItem[]): void => {
  safeSet(ATTACHMENTS_STORAGE_KEY, JSON.stringify(attachments));
};

export const getAttachments = async (): Promise<SalesAttachmentItem[]> => {
  return getStoredAttachments();
};

export const createAttachmentRecord = async (
  item: SalesAttachmentItem
): Promise<SalesAttachmentItem> => {
  const attachments = getStoredAttachments();
  const updated = [item, ...attachments];
  saveAttachments(updated);
  return item;
};

export const deleteAttachmentRecord = async (id: string): Promise<void> => {
  const attachments = getStoredAttachments();
  saveAttachments(attachments.filter((a) => a.id !== id));
};

// ==========================================
// Module Counts Helper
// ==========================================

export const getSalesModuleCounts = (): {
  activities: number;
  calls: number;
  meetings: number;
  followUps: number;
  attachments: number;
} => {
  return {
    activities: getStoredActivities().length,
    calls: getStoredCalls().length,
    meetings: getStoredMeetings().length,
    followUps: getStoredFollowUps().length,
    attachments: getStoredAttachments().length,
  };
};

// ==========================================
// Dynamic Master Dropdown Data
// ==========================================

export const getCustomerOptions = async (): Promise<CustomerOption[]> => {
  try {
    const list = await getAllCustomers();
    const data = Array.isArray(list) ? list : (list as any)?.data || [];
    return data.map((c: any) => ({
      id: String(c.customerId || c.id || ""),
      name: c.customerName || "",
      contactPerson: c.contactPerson || c.customerName || "",
      phone: c.phone || "",
      email: c.email || "",
      industry: c.industryName || "",
      city: c.cityName || "",
    }));
  } catch {
    return [];
  }
};

export const getEmployeeOptions = async (): Promise<EmployeeOption[]> => {
  try {
    const list = await getAllBdeUsers();
    const data = Array.isArray(list) ? list : (list as any)?.data || [];
    return data.map((u: any) => ({
      id: String(u.id || ""),
      name: u.value || "",
      role: "Sales Representative",
      email: "",
    }));
  } catch {
    return [];
  }
};

export const getRelatedRecordOptions = async (
  _customerId?: string
): Promise<RelatedRecordOption[]> => {
  return [];
};

export const getCallTypes = async (): Promise<CallTypeItem[]> => {
  try {
    const list = await getAllCallTypes();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item) => ({
        id: item.id,
        value: item.callTypeName,
        label: item.callTypeName,
        code: `CALL_${String(item.id).padStart(3, "0")}`,
        isActive: item.isActive,
      }));
    }
  } catch {}
  return [];
};

export const saveCallType = async (
  item: Omit<CallTypeItem, "id"> & { id?: number }
): Promise<CallTypeItem> => {
  return { id: item.id || Date.now(), ...item, label: item.value };
};

export const deleteCallType = async (_id: number): Promise<boolean> => {
  return true;
};

export const getMeetingTypes = async (): Promise<MeetingTypeItem[]> => {
  try {
    const list = await getAllMeetingTypes();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((m) => ({
        id: m.id,
        value: m.meetingTypeName,
        label: m.meetingTypeName,
        code: m.code || `MEET_${String(m.id).padStart(3, "0")}`,
        isActive: m.isActive,
      }));
    }
  } catch {}
  return [];
};

export const saveMeetingType = async (
  item: Omit<MeetingTypeItem, "id"> & { id?: number }
): Promise<MeetingTypeItem> => {
  return { id: item.id || Date.now(), ...item, label: item.value };
};

export const deleteMeetingType = async (_id: number): Promise<boolean> => {
  return true;
};

export const getActivityOutcomes = async (): Promise<ActivityOutcomeItem[]> => {
  try {
    const list = await getAllActivityTypes();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((t) => ({
        id: t.id,
        value: t.activityName,
        label: t.activityName,
        code: t.code || `ACT_${String(t.id).padStart(3, "0")}`,
        category: (t.category as any) || "General",
        isActive: t.isActive,
      }));
    }
  } catch {}
  return [];
};

export const saveActivityOutcome = async (
  item: Omit<ActivityOutcomeItem, "id"> & { id?: number }
): Promise<ActivityOutcomeItem> => {
  return { id: item.id || Date.now(), ...item, label: item.value };
};

export const deleteActivityOutcome = async (_id: number): Promise<boolean> => {
  return true;
};

export const getFollowUpIntervals = async (): Promise<FollowUpIntervalItem[]> => {
  const raw = safeGet(INTERVALS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return [
    { id: 1, value: "Same Day", label: "Same Day", code: "INT_001", isActive: true },
    { id: 2, value: "Next Day", label: "Next Day", code: "INT_002", isActive: true },
    { id: 3, value: "In 3 Days", label: "In 3 Days", code: "INT_003", isActive: true },
    { id: 4, value: "In 1 Week", label: "In 1 Week", code: "INT_004", isActive: true },
    { id: 5, value: "In 15 Days", label: "In 15 Days", code: "INT_005", isActive: true },
  ];
};

export const saveFollowUpInterval = async (
  item: Omit<FollowUpIntervalItem, "id"> & { id?: number }
): Promise<FollowUpIntervalItem> => {
  const items = await getFollowUpIntervals();
  const nextId = item.id || (items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1);
  const saved = { ...item, label: item.value, id: nextId };
  safeSet(INTERVALS_STORAGE_KEY, JSON.stringify([...items.filter((i) => i.id !== nextId), saved]));
  return saved;
};

export const deleteFollowUpInterval = async (id: number): Promise<boolean> => {
  const items = await getFollowUpIntervals();
  safeSet(INTERVALS_STORAGE_KEY, JSON.stringify(items.filter((i) => i.id !== id)));
  return true;
};

export const getDocumentTypes = async (): Promise<DocumentTypeItem[]> => {
  try {
    const list = await getAllDocumentTypes();
    if (Array.isArray(list)) {
      return list.map((d) => ({
        id: d.id,
        value: d.documentName,
        label: d.documentName,
        code: d.code,
        isActive: d.isActive,
      }));
    }
  } catch {}
  return [];
};

export const saveDocumentType = async (
  item: Omit<DocumentTypeItem, "id"> & { id?: number }
): Promise<DocumentTypeItem> => {
  return { id: item.id || Date.now(), ...item, label: item.value };
};

export const deleteDocumentType = async (_id: number): Promise<boolean> => {
  return true;
};
