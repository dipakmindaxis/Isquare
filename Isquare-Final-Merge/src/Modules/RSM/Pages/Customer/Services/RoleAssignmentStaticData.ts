/**
 * Role-Based Employee Assignment Types & Hierarchy Helpers
 * Dynamic API-Driven reporting hierarchy
 * - System Admin: No Reporting To required (hidden/disabled)
 * - Director: No Reporting To required (hidden/disabled)
 * - BDE User: Reporting To strictly restricted to Director employees
 * - Sales Person: Reporting To strictly restricted to BDE User employees
 */

export type RoleType = "System Admin" | "Director" | "BDE User" | "Sales Person";

export const AVAILABLE_ROLES: RoleType[] = [
  "System Admin",
  "Director",
  "BDE User",
  "Sales Person",
];

export interface HierarchyLevel {
  id: number;
  levelOrder: number;
  levelName: string;
  isActive: boolean;
}

export interface MockEmployee {
  id: number;
  name: string;
  code: string;
  role: RoleType;
  levelName: string;
  levelOrder: number;
  email: string;
  phone: string;
  reportingToId: number | null;
  reportingToName?: string;
  reportingToRole?: RoleType;
}

export interface AssignmentRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  role: RoleType;
  reportingToId: number | null;
  reportingToName: string | null;
  reportingToRole: RoleType | null;
  directorId?: number | null;
  directorName?: string | null;
  directorCode?: string | null;
  bdeUserId?: number | null;
  bdeUserName?: string | null;
  salesCoordinatorId?: number | null;
  salesCoordinatorName?: string | null;
  assignedDate: string;
  status: "Active" | "Inactive";
}

// Persistent storage key for organization hierarchy assignments
export const HIERARCHY_STORAGE_KEY = "CRM_SALES_HIERARCHY_ASSIGNMENTS";

export const getStoredAssignments = (): AssignmentRecord[] => {
  try {
    const raw = localStorage.getItem(HIERARCHY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Error reading hierarchy assignments from storage:", err);
  }
  return [];
};

export const saveStoredAssignments = (assignments: AssignmentRecord[]): void => {
  try {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(assignments));
  } catch (err) {
    console.error("Error saving hierarchy assignments to storage:", err);
  }
};

export const INITIAL_STATIC_LEVELS: HierarchyLevel[] = [];
export const INITIAL_STATIC_EMPLOYEES: MockEmployee[] = [];
export const INITIAL_STATIC_ASSIGNMENTS: AssignmentRecord[] = [];

export const getEligibleReportingEmployees = (
  role: RoleType | "",
  employees: MockEmployee[],
  currentEmployeeId?: number | ""
): MockEmployee[] => {
  if (!role) return [];

  if (role === "System Admin" || role === "Director") {
    return [];
  }

  if (role === "BDE User") {
    // Only employees whose role is Director
    return employees.filter(
      (emp) => emp.role === "Director" && emp.id !== currentEmployeeId
    );
  }

  if (role === "Sales Person") {
    // Only employees whose role is BDE User
    return employees.filter(
      (emp) => emp.role === "BDE User" && emp.id !== currentEmployeeId
    );
  }

  return [];
};

/**
 * Validate role-based assignment before saving
 */
export interface AssignmentValidationResult {
  isValid: boolean;
  errors: {
    employeeId?: string;
    role?: string;
    reportingToId?: string;
  };
}

export const validateRoleAssignment = (
  employeeId: number | "",
  role: RoleType | "",
  reportingToId: number | "" | null,
  employees: MockEmployee[]
): AssignmentValidationResult => {
  const errors: {
    employeeId?: string;
    role?: string;
    reportingToId?: string;
  } = {};

  if (!employeeId) {
    errors.employeeId = "Please select an employee.";
  }

  if (!role) {
    errors.role = "Please select a role for the employee.";
  } else if (role === "BDE User") {
    if (!reportingToId) {
      errors.reportingToId = "Reporting To is required for BDE User (Must report to a Director).";
    } else {
      const reportingEmp = employees.find((e) => e.id === Number(reportingToId));
      if (!reportingEmp || reportingEmp.role !== "Director") {
        errors.reportingToId = "Invalid assignment: BDE User can ONLY report to an employee with Director role.";
      }
    }
  } else if (role === "Sales Person") {
    if (!reportingToId) {
      errors.reportingToId = "Reporting To is required for Sales Person (Must report to a BDE User).";
    } else {
      const reportingEmp = employees.find((e) => e.id === Number(reportingToId));
      if (!reportingEmp || reportingEmp.role !== "BDE User") {
        errors.reportingToId = "Invalid assignment: Sales Person can ONLY report to an employee with BDE User role.";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
