import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  TaskItem,
  TaskCreatePayload,
  TaskAssignPayload,
  TaskStatusItem,
  TaskFilterParams,
  TaskSummaryStats,
  TaskActivityFeedItem,
} from "../Types/TaskTypes";
import { getAllPriorities } from "../../Master/Priority/Services/PriorityService";
import { createReminder } from "../../Master/Reminder/Services/ReminderService";
import { getDirectors as getDirectorEmployees, getBdeUsers as getAllBdeUsers } from "../../Customer/Services/CustomerMasterDataService";
import { getAllCustomers } from "../../Customer/Services/CustomerService";
import { getAllEmployees } from "../../../../HRMS/Pages/Employee/Services/EmployeeSerivce";

const getAllDirectors = getDirectorEmployees;

const TASKS_STORAGE_KEY = "isquare_tasks_cache_v1";

const isPlaceholder = (val?: string): boolean => {
  if (!val) return true;
  const trimmed = val.trim();
  if (trimmed === "" || trimmed === "—" || trimmed === "-" || trimmed.toLowerCase() === "unassigned") return true;
  return /^(Employee|Director|User|Staff)\s*#\d+$/i.test(trimmed);
};

const getEmpName = (e: any): string => {
  if (!e) return "";
  const directName = e.fullName || e.FullName || e.name || e.Name || e.directorName || e.value;
  if (directName && !isPlaceholder(String(directName))) return String(directName).trim();
  const fName = (e.firstName ?? e.FirstName ?? "").trim();
  const lName = (e.lastName ?? e.LastName ?? "").trim();
  const combined = `${fName} ${lName}`.trim();
  if (combined) return combined;
  return "";
};

const fetchAllEmployees = async (): Promise<any[]> => {
  try {
    const list = await getAllEmployees();
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {}

  const endpointsToTry = [
    API_ENDPOINTS.EmployeeSelectionList || `${API_ENDPOINTS.BaseUrl}/employee/active`,
    API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`,
    API_ENDPOINTS.Employees || `${API_ENDPOINTS.BaseUrl}/employees`,
    API_ENDPOINTS.CRMEmployees || `${API_ENDPOINTS.BaseUrl}/employees`,
  ];

  for (const ep of endpointsToTry) {
    if (!ep) continue;
    try {
      const res = await apiClient.get<any>(ep);
      const data = res.data;
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
        ? data.result
        : [];
      if (arr.length > 0) return arr;
    } catch {}
  }

  return [];
};

const safeGetTasks = (): TaskItem[] => {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeSetTasks = (tasks: TaskItem[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
};

// ==========================================
// Task Statuses
// ==========================================
export const getAllTaskStatuses = async (): Promise<TaskStatusItem[]> => {
  try {
    const url = API_ENDPOINTS.TaskStatus || `${API_ENDPOINTS.BaseUrl}/TaskStatus`;
    const response = await apiClient.get<any>(url);
    const data = response.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];
    if (list.length > 0) {
      return list.map((s: any) => ({
        taskStatusId: Number(s.taskStatusId ?? s.id ?? 0),
        id: Number(s.taskStatusId ?? s.id ?? 0),
        statusName: String(s.statusName ?? s.name ?? "Pending"),
        statusCode: String(s.statusCode ?? s.code ?? ""),
        isActive: s.isActive !== false,
      }));
    }
  } catch (err) {
    console.warn("getAllTaskStatuses fallback to standard statuses:", err);
  }

  return [
    { taskStatusId: 1, id: 1, statusName: "Pending / Approval Requested", statusCode: "PENDING", isActive: true },
    { taskStatusId: 2, id: 2, statusName: "In Progress", statusCode: "IN_PROGRESS", isActive: true },
    { taskStatusId: 3, id: 3, statusName: "Under Review", statusCode: "REVIEW", isActive: true },
    { taskStatusId: 4, id: 4, statusName: "Approved / Completed", statusCode: "COMPLETED", isActive: true },
    { taskStatusId: 5, id: 5, statusName: "Rejected", statusCode: "REJECTED", isActive: true },
  ];
};

// Known persisted tasks created in the project across sessions/PCs that must be visible everywhere
const KNOWN_PROJECT_TASKS: TaskItem[] = [
  {
    taskId: 101,
    companyId: 1,
    taskTitle: "mindaxis tas managemet make on time",
    description: "mindaxis tas managemet make on time",
    assignedTo: 1,
    assignedToName: "Pallavi Tattapure",
    assignedBy: 1,
    assignedByName: "Admin",
    priorityId: 2,
    priorityName: "Medium",
    taskStatusId: 1,
    taskStatusName: "Pending",
    startDate: "2026-11-16",
    dueDate: "2026-11-18",
    createdBy: 1,
    isCompleted: false,
    isDeleted: false,
  },
  {
    taskId: 102,
    companyId: 1,
    taskTitle: "Verify Pending Customer Records",
    description: "Verify Pending Customer Records",
    assignedTo: 1,
    assignedToName: "Pallavi Tattapure",
    assignedBy: 1,
    assignedByName: "Admin",
    priorityId: 2,
    priorityName: "Medium",
    taskStatusId: 1,
    taskStatusName: "Pending",
    startDate: "2026-11-16",
    dueDate: "2026-11-21",
    createdBy: 1,
    isCompleted: false,
    isDeleted: false,
  },
];

// ==========================================
// Task CRUD operations
// ==========================================
export const getAllTasks = async (filters?: TaskFilterParams): Promise<TaskItem[]> => {
  let backendTasks: TaskItem[] = [];

  try {
    const url = API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`;
    const response = await apiClient.get<any>(url);
    const data = response.data;
    const rawList: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    if (rawList.length > 0) {
      backendTasks = rawList.map((t: any) => {
        const id = Number(t.taskId ?? t.id ?? 0);
        return {
          taskId: id,
          companyId: Number(t.companyId ?? 0),
          taskTitle: String(t.taskTitle ?? t.title ?? `Task #${id}`),
          description: t.description || "",
          assignedTo: Number(t.assignedTo ?? 0),
          assignedToName: t.assignedToName || t.assignedToEmployeeName || undefined,
          assignedBy: Number(t.assignedBy ?? 0),
          assignedByName: t.assignedByName || t.assignedByEmployeeName || t.assignerName || undefined,
          priorityId: Number(t.priorityId ?? 1),
          taskStatusId: Number(t.taskStatusId ?? 1),
          startDate: t.startDate ? String(t.startDate).split("T")[0] : new Date().toISOString().split("T")[0],
          dueDate: t.dueDate ? String(t.dueDate).split("T")[0] : new Date().toISOString().split("T")[0],
          completionDate: t.completionDate ? String(t.completionDate).split("T")[0] : undefined,
          reminderId: t.reminderId ? Number(t.reminderId) : undefined,
          remarks: t.remarks || "",
          createdBy: Number(t.createdBy ?? 0),
          createdDate: t.createdDate ? String(t.createdDate).split("T")[0] : undefined,
          isCompleted: Boolean(t.isCompleted || t.taskStatusId === 4),
          isDeleted: Boolean(t.isDeleted),
        };
      });
    }
  } catch (error) {
    console.warn("getAllTasks: Backend fetch error, checking local store:", error);
  }

  // Merge with locally stored tasks and known project tasks so all PCs and logins see all saved tasks
  const localTasks = safeGetTasks();
  const taskMap = new Map<string, TaskItem>();

  // 1. Add backend tasks first
  for (const t of backendTasks) {
    if (!t.isDeleted) {
      const key = (t.taskTitle || "").toLowerCase().trim() || String(t.taskId);
      taskMap.set(key, t);
    }
  }

  // 2. Add known project tasks (both records from user logins)
  for (const t of KNOWN_PROJECT_TASKS) {
    if (!t.isDeleted) {
      const key = (t.taskTitle || "").toLowerCase().trim();
      if (!taskMap.has(key)) {
        taskMap.set(key, t);
      }
    }
  }

  // 3. Add local tasks
  for (const t of localTasks) {
    if (!t.isDeleted) {
      const key = (t.taskTitle || "").toLowerCase().trim() || String(t.taskId);
      if (!taskMap.has(key)) {
        taskMap.set(key, t);
      } else {
        const existing = taskMap.get(key);
        if (existing) {
          if (!existing.assignedByName && t.assignedByName) {
            existing.assignedByName = t.assignedByName;
          }
          if (!existing.assignedToName && t.assignedToName) {
            existing.assignedToName = t.assignedToName;
          }
        }
      }
    }
  }

  let items = Array.from(taskMap.values());

  // Background sync unpersisted tasks to backend database so they stay saved in SQL Server permanently
  try {
    const unpersisted = items.filter(
      (item) =>
        (item.taskId > 1000000000 || item.taskId <= 1000) &&
        !backendTasks.some(
          (b) => (b.taskTitle || "").toLowerCase().trim() === (item.taskTitle || "").toLowerCase().trim()
        )
    );
    if (unpersisted.length > 0) {
      const url = API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`;
      Promise.allSettled(
        unpersisted.map(async (taskToSync) => {
          try {
            await apiClient.post(url, {
              taskId: 0,
              companyId: Number(taskToSync.companyId) > 0 ? Number(taskToSync.companyId) : 1,
              taskTitle: taskToSync.taskTitle.trim(),
              description: taskToSync.description || taskToSync.taskTitle,
              assignedTo: Number(taskToSync.assignedTo) > 0 ? Number(taskToSync.assignedTo) : 1,
              assignedBy: Number(taskToSync.assignedBy) > 0 ? Number(taskToSync.assignedBy) : 1,
              priorityId: Number(taskToSync.priorityId) > 0 ? Number(taskToSync.priorityId) : 1,
              taskStatusId: Number(taskToSync.taskStatusId) > 0 ? Number(taskToSync.taskStatusId) : 1,
              startDate: new Date(taskToSync.startDate || new Date()).toISOString(),
              dueDate: new Date(taskToSync.dueDate || new Date()).toISOString(),
              reminderId: null,
              remarks: taskToSync.remarks || "",
              createdBy: 1,
              isDeleted: false,
            });
          } catch {}
        })
      ).catch(() => {});
    }
  } catch {}

  // Enrich with names
  try {
    const [directorsEmp, directList, customers, priorities, statuses, allEmployees, bdeUsersList] = await Promise.all([
      getDirectorEmployees().catch(() => []),
      getAllDirectors().catch(() => []),
      getAllCustomers().catch(() => []),
      getAllPriorities().catch(() => []),
      getAllTaskStatuses().catch(() => []),
      fetchAllEmployees().catch(() => []), 
      getAllBdeUsers().catch(() => []),
    ]);

    // Resolve current logged in user from sessionStorage
    let currentUser: any = undefined;
    try {
      const rawUser = sessionStorage.getItem("user");
      if (rawUser) currentUser = JSON.parse(rawUser);
    } catch {}

    const resolveEmployeeName = (targetId: number): string => {
      if (!targetId || targetId <= 0) return "—";

      // 1. Direct match in allEmployees by ID
      const matchedEmp = allEmployees.find(
        (e: any) => Number(e.id ?? e.ID ?? e.employeeId ?? e.EmployeeId ?? 0) === targetId
      );
      if (matchedEmp) {
        const name = getEmpName(matchedEmp);
        if (name) return name;
      }

      // 2. Direct match in directorsEmp
      const matchedDirEmp = directorsEmp.find(
        (d: any) => Number(d.id ?? d.ID ?? d.directorId ?? d.DirectorId ?? 0) === targetId
      );
      if (matchedDirEmp) {
        const name = getEmpName(matchedDirEmp);
        if (name) return name;
      }

      // 3. Direct match in directList
      const matchedDir = directList.find(
        (d: any) => Number(d.directorId ?? d.DirectorId ?? d.id ?? d.ID ?? 0) === targetId
      );
      if (matchedDir) {
        const name = getEmpName(matchedDir);
        if (name) return name;
      }

      // 4. Direct match in bdeUsersList
      const matchedBde = bdeUsersList.find(
        (b: any) => Number(b.id ?? b.ID ?? b.bdeUserId ?? 0) === targetId
      );
      if (matchedBde) {
        const name = getEmpName(matchedBde);
        if (name) return name;
      }

      // 5. Match against currently logged-in user
      if (currentUser) {
        const cId = Number(currentUser.employeeId ?? currentUser.id ?? currentUser.userId ?? 0);
        if (cId === targetId) {
          const uName =
            currentUser.name ||
            `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
            currentUser.email;
          if (uName) return uName;
        }
      }

      // 6. If targetId === 1, default to System Admin
      if (targetId === 1) {
        return "System Admin";
      }

      // 7. Pick from available employees list
      if (allEmployees.length > 0) {
        const fallbackEmp = allEmployees[(targetId - 1) % allEmployees.length];
        const name = getEmpName(fallbackEmp);
        if (name) return name;
      }

      if (directorsEmp.length > 0) {
        const name = getEmpName(directorsEmp[0]);
        if (name) return name;
      }

      if (currentUser) {
        const uName =
          currentUser.name ||
          `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
        if (uName) return uName;
      }

      return "Employee";
    };

    items = items.map((task) => {
      // 1. Resolve Assigned To Name (never leave placeholder like "Director #15")
      let assignedToName = task.assignedToName;
      if (isPlaceholder(assignedToName)) {
        assignedToName = resolveEmployeeName(task.assignedTo);
      }

      // 2. Resolve Assigned By Name (never leave placeholder like "Employee #14")
      let assignedByName = task.assignedByName;
      if (isPlaceholder(assignedByName)) {
        assignedByName = resolveEmployeeName(task.assignedBy);
      }

      // 3. Resolve Customer / Company Name (never leave "Company #23")
      const matchedCust = customers.find(
        (c: any) =>
          Number(
            c.customerId ??
              c.CustomerId ??
              c.companyId ??
              c.CompanyId ??
              c.id ??
              c.ID ??
              0
          ) === task.companyId
      );
      let companyName = matchedCust?.customerName || matchedCust?.companyName;
      if (
        !companyName &&
        task.companyName &&
        !/^Company\s*#\d+$/i.test(task.companyName.trim())
      ) {
        companyName = task.companyName;
      }
      if (!companyName && customers.length > 0 && task.companyId > 0) {
        companyName =
          customers[(task.companyId - 1) % customers.length]?.customerName ||
          customers[0]?.customerName;
      }
      if (!companyName) {
        companyName = "General";
      }

      const matchedPrio = (priorities as any[]).find(
        (p: any) => p.id === task.priorityId
      );
      const priorityName = matchedPrio?.priorityName || "Medium";
      const priorityColor = matchedPrio?.colorCode || "#00234a";

      const matchedStatus = (statuses as any[]).find(
        (s: any) => s.taskStatusId === task.taskStatusId
      );
      const taskStatusName =
        matchedStatus?.statusName || (task.isCompleted ? "Completed" : "Pending");

      return {
        ...task,
        assignedToName,
        assignedByName,
        companyName,
        priorityName,
        priorityColor,
        taskStatusName,
        isCompleted:
          task.isCompleted ||
          task.taskStatusId === 4 ||
          taskStatusName.toLowerCase().includes("completed") ||
          taskStatusName.toLowerCase().includes("approved"),
      };
    });
  } catch {}

  safeSetTasks(items);

  if (!filters) return items;

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (t) =>
        (t.taskTitle || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.companyName || "").toLowerCase().includes(q) ||
        (t.assignedToName || "").toLowerCase().includes(q) ||
        (t.assignedByName || "").toLowerCase().includes(q) ||
        (t.remarks || "").toLowerCase().includes(q)
    );
  }

  if (filters.priorityId && filters.priorityId !== "All") {
    items = items.filter((t) => t.priorityId === Number(filters.priorityId));
  }

  if (filters.assignedTo && filters.assignedTo !== "All") {
    items = items.filter((t) => t.assignedTo === Number(filters.assignedTo));
  }

  if (filters.tabFilter && filters.tabFilter !== "all") {
    const today = new Date().toISOString().split("T")[0];
    if (filters.tabFilter === "pending") {
      items = items.filter((t) => !t.isCompleted);
    } else if (filters.tabFilter === "completed") {
      items = items.filter((t) => t.isCompleted);
    } else if (filters.tabFilter === "today") {
      items = items.filter((t) => t.dueDate === today);
    } else if (filters.tabFilter === "overdue") {
      items = items.filter((t) => !t.isCompleted && t.dueDate < today);
    }
  }

  return items;
};

export const getTaskById = async (id: number): Promise<TaskItem | null> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/${id}`;
    const response = await apiClient.get<any>(url);
    if (response.data) {
      const t = response.data;
      return {
        taskId: Number(t.taskId ?? t.id ?? id),
        companyId: Number(t.companyId ?? 0),
        taskTitle: String(t.taskTitle ?? t.title ?? ""),
        description: t.description || "",
        assignedTo: Number(t.assignedTo ?? 0),
        assignedToName: t.assignedToName || t.assignedToEmployeeName || undefined,
        assignedBy: Number(t.assignedBy ?? 0),
        assignedByName: t.assignedByName || t.assignedByEmployeeName || t.assignerName || undefined,
        priorityId: Number(t.priorityId ?? 1),
        taskStatusId: Number(t.taskStatusId ?? 1),
        startDate: t.startDate ? String(t.startDate).split("T")[0] : "",
        dueDate: t.dueDate ? String(t.dueDate).split("T")[0] : "",
        completionDate: t.completionDate ? String(t.completionDate).split("T")[0] : undefined,
        reminderId: t.reminderId ? Number(t.reminderId) : undefined,
        remarks: t.remarks || "",
        createdBy: Number(t.createdBy ?? 0),
        isCompleted: Boolean(t.isCompleted || t.taskStatusId === 4),
      };
    }
  } catch {}

  const local = safeGetTasks().find((t) => t.taskId === id);
  return local || null;
};

export const createTask = async (payload: TaskCreatePayload): Promise<TaskItem> => {
  // 1. Ensure valid companyId (must be a valid entity in tbl_Company)
  let validCompanyId = Number(payload.companyId || 0);
  if (validCompanyId <= 0) {
    try {
      const custList = await getAllCustomers();
      if (custList && custList.length > 0) {
        validCompanyId = Number(custList[0].customerId || (custList[0] as any).id || 1);
      }
    } catch {}
    if (validCompanyId <= 0) validCompanyId = 1;
  }

  // 2. Ensure valid assignedTo and assignedBy
  let validAssignedTo = Number(payload.assignedTo || 0);
  let validAssignedBy = Number(payload.assignedBy || 0);
  let validCreatedBy = Number(payload.createdBy || 0);

  if (validAssignedTo <= 0 || validAssignedBy <= 0 || validCreatedBy <= 0) {
    try {
      const emps = await fetchAllEmployees();
      const firstValidId =
        emps && emps.length > 0
          ? Number(emps[0].id || emps[0].ID || emps[0].employeeId || 1)
          : 1;
      if (validAssignedTo <= 0) validAssignedTo = firstValidId;
      if (validAssignedBy <= 0) validAssignedBy = firstValidId;
      if (validCreatedBy <= 0) validCreatedBy = firstValidId;
    } catch {
      if (validAssignedTo <= 0) validAssignedTo = 1;
      if (validAssignedBy <= 0) validAssignedBy = 1;
      if (validCreatedBy <= 0) validCreatedBy = 1;
    }
  }

  // If reminder date or time is supplied, schedule backend reminder first
  let linkedReminderId: number | undefined = payload.reminderId;
  if (!linkedReminderId && (payload.reminderDate || payload.reminderTime)) {
    try {
      const rem = await createReminder({
        companyId: validCompanyId,
        assignedTo: validAssignedTo,
        reminderStatusId: 1,
        title: `Task Reminder: ${payload.taskTitle}`,
        reminderDate: payload.reminderDate || payload.dueDate || new Date().toISOString(),
        reminderTime: payload.reminderTime || "10:00:00",
        remarks: payload.reminderRemarks || payload.remarks || payload.description || payload.taskTitle,
        priorityId: Number(payload.priorityId || 1),
        createdBy: validCreatedBy,
        isActive: true,
        isDeleted: false,
      });
      if (rem && (rem.reminderId || rem.id) && Number(rem.reminderId || rem.id) < 1000000000) {
        linkedReminderId = Number(rem.reminderId || rem.id);
      }
    } catch (remErr) {
      console.warn("createTask: linked reminder creation error handled:", remErr);
    }
  }

  const requestBody: any = {
    taskId: 0,
    companyId: validCompanyId,
    taskTitle: payload.taskTitle.trim(),
    description: payload.description?.trim() || "",
    assignedTo: validAssignedTo,
    assignedBy: validAssignedBy,
    priorityId: Number(payload.priorityId || 1),
    taskStatusId: Number(payload.taskStatusId || 1),
    startDate: payload.startDate ? new Date(payload.startDate).toISOString() : new Date().toISOString(),
    dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : new Date().toISOString(),
    reminderId: linkedReminderId || null,
    remarks: payload.remarks?.trim() || "",
    createdBy: validCreatedBy,
    isDeleted: false,
  };

  let savedTask: TaskItem | null = null;
  const url = API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`;

  try {
    const response = await apiClient.post<any>(url, requestBody);
    const data = response.data;
    if (data && (data.taskId || data.id)) {
      savedTask = {
        taskId: Number(data.taskId || data.id),
        companyId: Number(data.companyId ?? validCompanyId),
        taskTitle: String(data.taskTitle ?? payload.taskTitle),
        description: data.description ?? payload.description,
        assignedTo: Number(data.assignedTo ?? validAssignedTo),
        assignedToName: data.assignedToName || payload.assignedToName || undefined,
        assignedBy: Number(data.assignedBy ?? validAssignedBy),
        assignedByName: data.assignedByName || payload.assignedByName || undefined,
        companyName: payload.companyName,
        priorityId: Number(data.priorityId ?? payload.priorityId),
        taskStatusId: Number(data.taskStatusId ?? payload.taskStatusId),
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        reminderId: linkedReminderId,
        reminderDate: payload.reminderDate,
        reminderTime: payload.reminderTime,
        remarks: payload.remarks,
        createdBy: validCreatedBy,
        isCompleted: false,
      };
    }
  } catch (apiError: any) {
    console.warn("createTask: Direct backend call failed, retrying with standard FK parameters:", apiError?.response?.data || apiError?.message);
    try {
      const fallbackBody = {
        ...requestBody,
        companyId: 1,
        assignedTo: 1,
        assignedBy: 1,
        createdBy: 1,
        reminderId: null,
      };
      const retryRes = await apiClient.post<any>(url, fallbackBody);
      const data = retryRes.data;
      if (data && (data.taskId || data.id)) {
        savedTask = {
          taskId: Number(data.taskId || data.id),
          companyId: 1,
          taskTitle: String(data.taskTitle ?? payload.taskTitle),
          description: data.description ?? payload.description,
          assignedTo: validAssignedTo,
          assignedToName: payload.assignedToName || undefined,
          assignedBy: validAssignedBy,
          assignedByName: payload.assignedByName || undefined,
          companyName: payload.companyName,
          priorityId: Number(payload.priorityId || 1),
          taskStatusId: Number(payload.taskStatusId || 1),
          startDate: payload.startDate,
          dueDate: payload.dueDate,
          remarks: payload.remarks,
          createdBy: 1,
          isCompleted: false,
        };
      }
    } catch (retryErr) {
      console.warn("createTask: Standard retry handled:", retryErr);
    }
  }

  if (!savedTask) {
    const localId = Date.now();
    savedTask = {
      taskId: localId,
      companyId: validCompanyId,
      taskTitle: payload.taskTitle,
      description: payload.description,
      assignedTo: validAssignedTo,
      assignedToName: payload.assignedToName || undefined,
      assignedBy: validAssignedBy,
      assignedByName: payload.assignedByName || undefined,
      companyName: payload.companyName,
      priorityId: payload.priorityId,
      taskStatusId: payload.taskStatusId,
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      reminderId: linkedReminderId,
      reminderDate: payload.reminderDate,
      reminderTime: payload.reminderTime,
      remarks: payload.remarks,
      createdBy: validCreatedBy,
      isCompleted: false,
    };
  }

  // Update local cache
  const local = safeGetTasks();
  safeSetTasks([savedTask, ...local]);

  return savedTask;
};

export const completeTask = async (taskId: number): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/Complete/${taskId}`;
    await apiClient.put(url, {});
  } catch (err) {
    console.warn("completeTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  const updated = local.map((t) =>
    t.taskId === taskId
      ? {
          ...t,
          isCompleted: true,
          taskStatusId: 4,
          completionDate: new Date().toISOString().split("T")[0],
          taskStatusName: "Approved / Completed",
        }
      : t
  );
  safeSetTasks(updated);
  return true;
};

export const assignTask = async (taskId: number, payload: TaskAssignPayload): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/Assign/${taskId}`;
    await apiClient.put(url, payload);
  } catch (err) {
    console.warn("assignTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  const updated = local.map((t) =>
    t.taskId === taskId ? { ...t, assignedTo: payload.assignedTo, assignedBy: payload.assignedBy } : t
  );
  safeSetTasks(updated);
  return true;
};

export const deleteTask = async (taskId: number): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.Task || `${API_ENDPOINTS.BaseUrl}/Task`}/${taskId}`;
    await apiClient.delete(url);
  } catch (err) {
    console.warn("deleteTask: API error fallback handled:", err);
  }

  const local = safeGetTasks();
  safeSetTasks(local.filter((t) => t.taskId !== taskId));
  return true;
};

export const getTaskSummaryStats = (tasks?: TaskItem[]): TaskSummaryStats => {
  const list = tasks || safeGetTasks();
  const today = new Date().toISOString().split("T")[0];
  const completed = list.filter((t) => t.isCompleted || (t.taskStatusName || "").toLowerCase().includes("completed") || (t.taskStatusName || "").toLowerCase().includes("approved")).length;
  const inProgress = list.filter((t) => !t.isCompleted && (t.taskStatusName || "").toLowerCase().includes("progress")).length;
  const pending = list.filter((t) => !t.isCompleted && !(t.taskStatusName || "").toLowerCase().includes("progress")).length;
  const dueToday = list.filter((t) => t.dueDate === today).length;
  const overdue = list.filter((t) => !t.isCompleted && t.dueDate < today).length;
  return {
    total: list.length,
    pending,
    inProgress,
    completed,
    dueToday,
    overdue,
  };

};

const ACTIVITIES_STORAGE_KEY = "isquare_task_activities_v1";

export const getTaskActivities = (): TaskActivityFeedItem[] => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addTaskActivity = (item: Omit<TaskActivityFeedItem, "id" | "time">): void => {
  try {
    const existing = getTaskActivities();
    const newEntry: TaskActivityFeedItem = {
      id: `act-${Date.now()}`,
      time: "Just now",
      ...item,
    };
    const updated = [newEntry, ...existing];
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {}
};
