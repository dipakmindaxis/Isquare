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
import {
  getAllBdeUsers,
  getDirectorEmployees,
  type BdeUser,
} from "../../Master/BdeUsers/Services/BdeUserService";
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
import { getAllFollowUps } from "../../Master/FollowUp/Services/FollowUpService";
import { getAllDirectors } from "../../Master/Director/Services/DirectorService";
import { getDepartments } from "../../../../HRMS/Services/MasterDataService";
import { getAllPriorities } from "../../Master/Priority/Services/PriorityService";
import {
  getAllContacts,
  getContactsByCompanyId,
  createContact,
} from "../../Master/Contact/Services/ContactService";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Contact } from "../../Master/Contact/Types/ContactTypes";

export {
  getAllActivityTypes,
  getAllMeetingTypes,
  getAllCustomerStatuses,
  getAllContacts,
  getContactsByCompanyId,
  createContact,
  getAllDirectors,
  getDirectorEmployees,
};
export const getActivityTypes = getAllActivityTypes;
export const getCustomerStatuses = getAllCustomerStatuses;
export type { MasterActivityType, CustomerStatus, Contact };

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
  assignedType?: "Employee" | "Team";
  assignedTeamId?: string;
  assignedTeamName?: string;
  priority: string;
  priorityId?: string;
  status: string;
  relatedRecordCode?: string;
  actionDetails: string;
  completionNotes?: string;
  reminderDateTime?: string;
  reminderDetails?: string;
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
  category?: string;
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

const isMockOrStaticItem = (p: any): boolean => {
  if (!p) return true;
  if (p.isMock === true) return true;
  const id = String(p.id || "");
  if (
    id === "ACT-001" ||
    id === "ACT-002" ||
    id === "CALL-101" ||
    id === "CALL-102" ||
    id === "MTG-201" ||
    id === "MTG-202" ||
    id === "FU-301" ||
    id === "FU-302" ||
    id === "ATT-001" ||
    id === "ATT-002"
  ) {
    return true;
  }
  return false;
};

export const getStoredActivities = (): SalesActivity[] => {
  const raw = safeGet(ACTIVITIES_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((p: any) => !isMockOrStaticItem(p));
        if (cleaned.length !== parsed.length) {
          saveActivities(cleaned);
        }
        return cleaned;
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
    if (Array.isArray(backendReminders) && backendReminders.length > 0) {
      const custOptions = await getCustomerOptions().catch(() => []);
      const empOptions = await getEmployeeOptions().catch(() => []);
      for (const r of backendReminders) {
        if (!r.reminderId) continue;
        const idStr = `REM-${r.reminderId}`;
        const alreadyInList = items.some((it) => it.id === idStr || it.activityCode === idStr);
        if (!alreadyInList) {
          const matchedCust = custOptions.find((c) => String(c.id) === String(r.companyId));
          const matchedEmp = empOptions.find((e) => String(e.id) === String(r.assignedTo));
          const rDate = r.reminderDate ? r.reminderDate.split("T")[0] : "";
          const resolvedCustName = matchedCust ? (matchedCust.companyName || matchedCust.name) : "";
          if (!resolvedCustName) continue;
          items.push({
            id: idStr,
            activityCode: `REM-${String(r.reminderId).padStart(3, "0")}`,
            activityType: "Phone Call",
            subject: r.title || `Follow-up: ${resolvedCustName}`,
            customerId: String(r.companyId || ""),
            customerName: resolvedCustName,
            contactPerson: matchedCust?.contactPerson || "",
            contactPhone: matchedCust?.phone || "",
            contactEmail: matchedCust?.email || "",
            assignedEmployeeId: String(r.assignedTo || ""),
            assignedEmployeeName: matchedEmp ? matchedEmp.name : "-",
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

  // Gracefully merge backend follow-ups (max 400ms timeout) for complete activity visibility
  try {
    const fetchFollowUps = Promise.race([
      getAllFollowUps(),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 400)),
    ]);
    const backendFollowUps = await fetchFollowUps;
    if (Array.isArray(backendFollowUps) && backendFollowUps.length > 0) {
      const custOptions = await getCustomerOptions().catch(() => []);
      const empOptions = await getEmployeeOptions().catch(() => []);
      for (const f of backendFollowUps) {
        if (!f.followUpId) continue;
        const idStr = `FU-${f.followUpId}`;
        const alreadyInList = items.some((it) => it.id === idStr || it.activityCode === idStr);
        if (!alreadyInList) {
          const matchedCust = custOptions.find((c) => String(c.id) === String(f.companyId));
          const matchedEmp = empOptions.find((e) => String(e.id) === String(f.userId));
          const fDate = f.followUpDate ? f.followUpDate.split("T")[0] : "";
          const resolvedCustName = matchedCust ? (matchedCust.companyName || matchedCust.name) : "";
          if (!resolvedCustName) continue;
          items.push({
            id: idStr,
            activityCode: `FU-${String(f.followUpId).padStart(3, "0")}`,
            activityType: "Discussion Notes",
            subject: f.remarks ? `Follow-up: ${f.remarks.slice(0, 45)}` : `Follow-up: ${resolvedCustName}`,
            customerId: String(f.companyId || ""),
            customerName: resolvedCustName,
            contactPerson: matchedCust?.contactPerson || "",
            contactPhone: matchedCust?.phone || "",
            contactEmail: matchedCust?.email || "",
            assignedEmployeeId: String(f.userId || ""),
            assignedEmployeeName: matchedEmp ? matchedEmp.name : "Sales Team",
            activityDate: fDate || new Date().toISOString().split("T")[0],
            activityTime: "10:30 AM",
            durationMinutes: 20,
            status: f.isActive ? "Scheduled" : "Completed",
            discussionNotes: f.remarks || "",
            nextActionDate: f.nextFollowUpDate ? f.nextFollowUpDate.split("T")[0] : fDate,
            nextActionDetails: f.remarks,
            relatedRecordType: "None",
            photographs: [],
            documents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
  const existingNums = items
    .map((a) => {
      const m = (a.activityCode || "").match(/ACT-\d{4}-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : items.length + 1;
  const activityCode = `ACT-${new Date().getFullYear()}-${String(nextNum).padStart(3, "0")}`;

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
    const existingCallNums = calls
      .map((c) => {
        const m = (c.callCode || "").match(/CALL-\d{4}-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextCallNum = existingCallNums.length > 0 ? Math.max(...existingCallNums) + 1 : calls.length + 1;
    const callItem: CallRecord = {
      id: `CALL-${timestamp}`,
      callCode: `CALL-${new Date().getFullYear()}-${String(nextCallNum).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      contactPerson: payload.contactPerson,
      phone: payload.contactPhone || "",
      callType: payload.callType || "Follow-up",
      assignedTo: payload.assignedEmployeeName,
      callDate: payload.activityDate,
      callTime: payload.activityTime,
      durationMinutes: payload.durationMinutes || 15,
      status: payload.status === "Completed" ? "Done" : "Pending",
      callOutcome: payload.callOutcome || "Connected - Follow-up Required",
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
    const existingMtgNums = meetings
      .map((m) => {
        const match = (m.meetingCode || "").match(/MTG-\d{4}-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextMtgNum = existingMtgNums.length > 0 ? Math.max(...existingMtgNums) + 1 : meetings.length + 1;
    const meetingItem: MeetingRecord = {
      id: `MTG-${timestamp}`,
      meetingCode: `MTG-${new Date().getFullYear()}-${String(nextMtgNum).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      meetingType: payload.meetingType || (payload.activityType === "Customer Visit" ? "Site Audit" : "Technical Review"),
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
    const existingFuNums = followUps
      .map((f) => {
        const m = (f.followUpCode || "").match(/FU-\d{4}-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextFuNum = existingFuNums.length > 0 ? Math.max(...existingFuNums) + 1 : followUps.length + 1;
    const fuItem: FollowUpItem = {
      id: `FU-${timestamp}`,
      followUpCode: `FU-${new Date().getFullYear()}-${String(nextFuNum).padStart(3, "0")}`,
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
        const cleaned = parsed.filter((c: any) => !isMockOrStaticItem(c));
        if (cleaned.length !== parsed.length) {
          saveCalls(cleaned);
        }
        return cleaned;
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
        const cleaned = parsed.filter((m: any) => !isMockOrStaticItem(m));
        if (cleaned.length !== parsed.length) {
          saveMeetings(cleaned);
        }
        return cleaned;
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
        const cleaned = parsed.filter((f: any) => !isMockOrStaticItem(f));
        if (cleaned.length !== parsed.length) {
          saveFollowUps(cleaned);
        }
        return cleaned;
      }
    } catch {}
  }
  return [];
};

export const saveFollowUps = (followUps: FollowUpItem[]): void => {
  safeSet(FOLLOWUPS_STORAGE_KEY, JSON.stringify(followUps));
};

export const getFollowUps = async (): Promise<FollowUpItem[]> => {
  const stored = getStoredFollowUps();
  try {
    const fetchBackend = Promise.race([
      getAllFollowUps(),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 500)),
    ]);
    const backend = await fetchBackend;
    if (Array.isArray(backend) && backend.length > 0) {
      const customers = await getCustomerOptions().catch(() => []);
      for (const f of backend) {
        if (!f.followUpId) continue;
        const idStr = `FU-${f.followUpId}`;
        if (!stored.some((s) => s.id === idStr || s.followUpCode === idStr)) {
          const cust = customers.find((c) => String(c.id) === String(f.companyId));
          const fDate = f.followUpDate ? f.followUpDate.split("T")[0] : new Date().toISOString().split("T")[0];
          stored.push({
            id: idStr,
            followUpCode: `FU-${String(f.followUpId).padStart(3, "0")}`,
            customerId: String(f.companyId || ""),
            customerName: cust ? (cust.companyName || cust.name) : `Company #${f.companyId}`,
            contactPerson: cust?.contactPerson || "-",
            phone: cust?.phone || "",
            followUpType: "Sales Follow-up",
            dueDate: fDate,
            dueTime: "11:00 AM",
            assignedRep: "Sales Team",
            priority: f.priorityId === 1 ? "Urgent" : f.priorityId === 2 ? "High" : "Medium",
            status: f.isActive ? "Upcoming" : "Completed",
            actionDetails: f.remarks || "Sales activity follow-up",
          });
        }
      }
    }
  } catch {}
  return stored;
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
        const cleaned = parsed.filter((a: any) => !isMockOrStaticItem(a));
        if (cleaned.length !== parsed.length) {
          saveAttachments(cleaned);
        }
        return cleaned;
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
    const data = await getAllCustomers();
    return data.map((c: any) => ({
      id: String(c.customerId || c.id || ""),
      name: c.customerName || c.companyName || "",
      companyName: c.companyName || c.customerName || "",
      contactPerson: c.contactPerson || c.customerName || "",
      phone: c.phone || c.mobile || "",
      email: c.email || c.emailAddress || "",
      industry: c.industryName || "",
      city: c.cityName || c.city || "",
    }));
  } catch {
    return [];
  }
};

export const getContactsForCustomer = async (
  customerIdOrCompanyId: number | string
): Promise<Contact[]> => {
  const numericId = Number(customerIdOrCompanyId);
  if (!numericId || isNaN(numericId) || numericId <= 0) return [];

  try {
    const list = await getContactsByCompanyId(numericId);
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {}

  try {
    const all = await getAllContacts();
    return all.filter((c: Contact) => Number(c.companyId) === numericId);
  } catch {}

  return [];
};

export const getEmployeeOptions = async (): Promise<EmployeeOption[]> => {
  try {
    const data = await getAllBdeUsers();
    return data.map((u: BdeUser) => ({
      id: String(u.id || ""),
      name: u.value || "",
      role: "Sales Representative",
      email: "",
    }));
  } catch {
    return [];
  }
};

export type UserRoleCategory =
  | "Director"
  | "BDE"
  | "SalesPerson"
  | "Admin"
  | "SalesCoordinator"
  | "Other";

export interface AssigneeOption {
  id: string;
  name: string;
  role?: string;
  type: "Employee" | "Team";
}

export const getUserRoleCategory = (role?: string): UserRoleCategory => {
  if (!role) return "Admin";
  const r = role.toLowerCase().trim();
  if (r.includes("director")) return "Director";
  if (r.includes("bde")) return "BDE";
  if (r.includes("sales coord") || r.includes("coordinator")) return "SalesCoordinator";
  if (r.includes("sales") || r.includes("rep")) return "SalesPerson";
  if (r.includes("admin") || r.includes("hr")) return "Admin";
  return "Other";
};

/**
 * Role-based employee assignment as per client requirement:
 * - Director: hide the Assigned To person field when creating their own activity/task
 * - BDE User: Assigned To must list only Directors
 * - Sales Person: Assigned To must list only BDE Users
 * - System Admin / Other: show the employees/teams permitted by existing access rules
 */
export const getRoleBasedAssignees = async (
  roleCategory: UserRoleCategory
): Promise<AssigneeOption[]> => {
  if (roleCategory === "Director") {
    // Director hides person field when creating their own activity/task
    return [];
  }

  if (roleCategory === "BDE") {
    // BDE User: Assigned To must list ONLY Directors
    try {
      const [directorEmployees, allDirectors] = await Promise.all([
        getDirectorEmployees().catch(() => []),
        getAllDirectors().catch(() => []),
      ]);

      const seen = new Set<string>();
      const list: AssigneeOption[] = [];

      directorEmployees.forEach((d) => {
        if (d && d.id && !seen.has(String(d.id))) {
          seen.add(String(d.id));
          list.push({
            id: String(d.id),
            name: d.name,
            role: "Director",
            type: "Employee",
          });
        }
      });

      allDirectors.forEach((d) => {
        if (d && d.directorId && !seen.has(String(d.directorId))) {
          seen.add(String(d.directorId));
          list.push({
            id: String(d.directorId),
            name: d.directorName,
            role: "Director",
            type: "Employee",
          });
        }
      });

      return list;
    } catch {
      return [];
    }
  }

  if (roleCategory === "SalesPerson") {
    // Sales Person: Assigned To must list ONLY BDE Users
    try {
      const bdes = await getAllBdeUsers();
      return bdes
        .filter((b) => b.isActive !== false)
        .map((b) => ({
          id: String(b.id),
          name: b.value || b.code || `BDE User #${b.id}`,
          role: "BDE",
          type: "Employee",
        }));
    } catch {
      return [];
    }
  }

  // System Admin / Sales Coordinator / Other:
  // Shows all permitted employees (Directors + BDE Users)
  try {
    const [bdes, directors] = await Promise.all([
      getAllBdeUsers().catch(() => []),
      getAllDirectors().catch(() => []),
    ]);

    const list: AssigneeOption[] = [];
    const seen = new Set<string>();

    directors.forEach((d) => {
      if (d && d.directorId && !seen.has(`dir-${d.directorId}`)) {
        seen.add(`dir-${d.directorId}`);
        list.push({
          id: String(d.directorId),
          name: `${d.directorName} (Director)`,
          role: "Director",
          type: "Employee",
        });
      }
    });

    bdes.forEach((b) => {
      if (b && b.id && !seen.has(`bde-${b.id}`)) {
        seen.add(`bde-${b.id}`);
        list.push({
          id: String(b.id),
          name: `${b.value || b.code} (BDE)`,
          role: "BDE",
          type: "Employee",
        });
      }
    });

    return list;
  } catch {
    return [];
  }
};

/**
 * Team assignment: Sales Coordinator, Accounts Team, Service Team, Store Team
 * Cleanly typed as "Team" to avoid mixing up team and employee IDs.
 */
export const getAssigneeTeams = async (): Promise<AssigneeOption[]> => {
  try {
    const depts = await getDepartments();
    const activeDepts: AssigneeOption[] = (depts || []).map((d) => ({
      id: String(d.id),
      name: d.name,
      role: "Department / Team",
      type: "Team",
    }));

    const requiredTeams = [
      "Sales Coordinator",
      "Accounts Team",
      "Service Team",
      "Store Team",
    ];

    const result = [...activeDepts];
    requiredTeams.forEach((teamName, idx) => {
      const exists = result.some(
        (t) =>
          t.name.toLowerCase().includes(teamName.toLowerCase()) ||
          teamName.toLowerCase().includes(t.name.toLowerCase())
      );
      if (!exists) {
        result.push({
          id: `team-${idx + 1}`,
          name: teamName,
          role: "Team",
          type: "Team",
        });
      }
    });

    return result;
  } catch {
    return [
      { id: "team-1", name: "Sales Coordinator", role: "Team", type: "Team" },
      { id: "team-2", name: "Accounts Team", role: "Team", type: "Team" },
      { id: "team-3", name: "Service Team", role: "Team", type: "Team" },
      { id: "team-4", name: "Store Team", role: "Team", type: "Team" },
    ];
  }
};

export interface PriorityOptionItem {
  id: number | string;
  name: "Urgent" | "High" | "Medium" | "Low" | string;
  colorCode: string;
}

/**
 * Priority helper: Urgent, High, Medium, Low
 * Reuses existing Priority Master (/api/priority) and supports fallback
 */
export const getPrioritiesWithFallback = async (): Promise<PriorityOptionItem[]> => {
  try {
    const list = await getAllPriorities();
    if (Array.isArray(list) && list.length > 0) {
      const active = list.filter((p) => p.isActive && !p.isDeleted);
      if (active.length > 0) {
        return active.map((p) => ({
          id: p.id,
          name: p.priorityName,
          colorCode: p.colorCode || "#00234a",
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to load priorities from Priority Master (/api/priority):", err);
  }

  return [];
};

export const getRelatedRecordOptions = async (
  customerId?: string
): Promise<RelatedRecordOption[]> => {
  const records: RelatedRecordOption[] = [];
  const seenCodes = new Set<string>();

  // 1. Fetch from Master / CRM Enquiry API (/api/Enquiry)
  try {
    const enquiryUrl = API_ENDPOINTS.Enquiries || `${API_ENDPOINTS.BaseUrl}/Enquiry`;
    const res = await apiClient.get(enquiryUrl);
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.result)
      ? res.data.result
      : [];
    list.forEach((enq: any) => {
      const code =
        enq.enquiryNumber ||
        enq.enquiryNo ||
        enq.enquiryCode ||
        (enq.enquiryId ? `ENQ-${enq.enquiryId}` : (enq.id ? `ENQ-${enq.id}` : null));
      if (code && !seenCodes.has(String(code))) {
        seenCodes.add(String(code));
        const customerName = enq.customerName || enq.companyName || "";
        const subject =
          enq.requirementSubject ||
          enq.subject ||
          enq.enquiryTitle ||
          enq.customerRequirement ||
          "";
        const titleText = customerName
          ? `${code} - ${customerName}${subject ? ` (${subject})` : ""}`
          : subject
          ? `${code} - ${subject}`
          : String(code);
        records.push({
          id: String(enq.enquiryId || enq.id || code),
          type: "Enquiry",
          code: String(code),
          title: titleText,
          customerId: String(enq.customerId || enq.companyId || ""),
          date: enq.enquiryDate || enq.createdDate || new Date().toISOString().split("T")[0],
        });
      }
    });
  } catch (err) {
    console.warn("Could not fetch enquiries from /api/Enquiry:", err);
  }

  // 2. Try Quotation endpoint (extract linked Enquiry IDs)
  try {
    const res = await apiClient.get(API_ENDPOINTS.Quotations || "/quotation");
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.result)
      ? res.data.result
      : [];
    list.forEach((q: any) => {
      const enqCode = q.enquiryRef || (q.enquiryId ? `ENQ-${q.enquiryId}` : null);
      if (enqCode && !seenCodes.has(String(enqCode))) {
        seenCodes.add(String(enqCode));
        records.push({
          id: String(q.enquiryId || enqCode),
          type: "Enquiry",
          code: String(enqCode),
          title: `Enquiry #${enqCode} - ${q.customerName || "Customer"}`,
          customerId: String(q.customerId || ""),
          date: q.quotationDate || new Date().toISOString().split("T")[0],
          amount: q.grandTotal ? `₹${q.grandTotal}` : undefined,
        });
      }
    });
  } catch (err) {
    console.warn("Could not fetch quotations for enquiry options:", err);
  }

  if (customerId) {
    const customerSpecific = records.filter(
      (r) => String(r.customerId) === String(customerId)
    );
    if (customerSpecific.length > 0) {
      return customerSpecific;
    }
  }

  return records;
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
      return list.map((t: MasterActivityType): ActivityOutcomeItem => ({
        id: t.id,
        value: t.activityName,
        label: t.activityName,
        code: t.code || `ACT_${String(t.id).padStart(3, "0")}`,
        category: (t as any).category || "General",
        isActive: t.isActive,
      }));
    }
  } catch {
    return [];
  }
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

export interface RawWorkLocationDto {
  id?: number;
  workLocationID?: number;
  workLocationId?: number;
  locationName?: string;
  workLocationName?: string;
  name?: string;
  locationCode?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

export interface WorkLocationsApiResponse {
  data?: RawWorkLocationDto[];
  result?: RawWorkLocationDto[];
}

export interface WorkLocationItem {
  id: number;
  locationName: string;
  locationCode: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
}

export const getWorkLocations = async (): Promise<WorkLocationItem[]> => {
  try {
    const response = await apiClient.get<RawWorkLocationDto[] | WorkLocationsApiResponse>(API_ENDPOINTS.WorkLocations);
    const data = response.data;
    let list: RawWorkLocationDto[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.data)) {
      list = data.data;
    } else if (data && Array.isArray(data.result)) {
      list = data.result;
    }
    return list
      .map((item: RawWorkLocationDto): WorkLocationItem => ({
        id: item.id || item.workLocationID || item.workLocationId || 0,
        locationName: item.locationName || item.workLocationName || item.name || "",
        locationCode: item.locationCode || item.code || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        isActive: typeof item.isActive === "boolean" ? item.isActive : true,
      }))
      .filter((l: WorkLocationItem) => l.isActive && Boolean(l.locationName));
  } catch (error) {
    console.warn("getWorkLocations error:", error);
    return [];
  }
};

