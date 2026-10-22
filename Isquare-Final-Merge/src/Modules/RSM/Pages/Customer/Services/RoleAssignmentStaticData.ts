/**
 * Role-Based Employee Assignment Mock Data & Helpers
 * Demonstrates role-based reporting hierarchy using static data only:
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
  assignedDate: string;
  status: "Active" | "Inactive";
}

// Initial Static Hierarchy Levels (matching Screenshot 1)
export const INITIAL_STATIC_LEVELS: HierarchyLevel[] = [
  { id: 1, levelOrder: 1, levelName: "DIRECTOR", isActive: true },
  { id: 2, levelOrder: 2, levelName: "General Manager", isActive: true },
  { id: 3, levelOrder: 3, levelName: "Deputy General Manager", isActive: false },
  { id: 4, levelOrder: 4, levelName: "Senior Manager", isActive: false },
  { id: 5, levelOrder: 5, levelName: "Manager", isActive: true },
  { id: 6, levelOrder: 6, levelName: "Sales Executive (Level 6)", isActive: true },
];

// Initial Static Sample Employees across all roles (multiple for each role)
export const INITIAL_STATIC_EMPLOYEES: MockEmployee[] = [
  // Directors (Leadership)
  {
    id: 1,
    name: "Mr Rajesh Sharma",
    code: "DIR001",
    role: "Director",
    levelName: "DIRECTOR",
    levelOrder: 1,
    email: "rajesh.sharma@isquare.com",
    phone: "+91 98230 11223",
    reportingToId: null,
  },
  {
    id: 2,
    name: "Mr Vikram Malhotra",
    code: "DIR002",
    role: "Director",
    levelName: "DIRECTOR",
    levelOrder: 1,
    email: "vikram.malhotra@isquare.com",
    phone: "+91 98230 44556",
    reportingToId: null,
  },
  {
    id: 3,
    name: "Mrs Sunita Deshmukh",
    code: "DIR003",
    role: "Director",
    levelName: "DIRECTOR",
    levelOrder: 1,
    email: "sunita.deshmukh@isquare.com",
    phone: "+91 98230 77889",
    reportingToId: null,
  },

  // BDE Users (Must report to a Director)
  {
    id: 101,
    name: "Mr Amit Patil",
    code: "BDE001",
    role: "BDE User",
    levelName: "Senior Manager",
    levelOrder: 4,
    email: "amit.patil@isquare.com",
    phone: "+91 98220 12345",
    reportingToId: 1,
    reportingToName: "Mr Rajesh Sharma",
    reportingToRole: "Director",
  },
  {
    id: 102,
    name: "Ms Priya Kulkarni",
    code: "BDE002",
    role: "BDE User",
    levelName: "Senior Manager",
    levelOrder: 4,
    email: "priya.kulkarni@isquare.com",
    phone: "+91 98220 67890",
    reportingToId: 2,
    reportingToName: "Mr Vikram Malhotra",
    reportingToRole: "Director",
  },
  {
    id: 103,
    name: "Mr Rohit Joshi",
    code: "BDE003",
    role: "BDE User",
    levelName: "Manager",
    levelOrder: 5,
    email: "rohit.joshi@isquare.com",
    phone: "+91 98220 54321",
    reportingToId: 3,
    reportingToName: "Mrs Sunita Deshmukh",
    reportingToRole: "Director",
  },
  {
    id: 104,
    name: "Ms Sneha Verma",
    code: "BDE004",
    role: "BDE User",
    levelName: "Manager",
    levelOrder: 5,
    email: "sneha.verma@isquare.com",
    phone: "+91 98220 98765",
    reportingToId: 1,
    reportingToName: "Mr Rajesh Sharma",
    reportingToRole: "Director",
  },

  // Sales Persons (Must report to a BDE User)
  {
    id: 201,
    name: "Mr Aniket Zine",
    code: "GAX003",
    role: "Sales Person",
    levelName: "Level 6",
    levelOrder: 6,
    email: "aniket.zine@isquare.com",
    phone: "+91 98900 11223",
    reportingToId: 101,
    reportingToName: "Mr Amit Patil",
    reportingToRole: "BDE User",
  },
  {
    id: 202,
    name: "Mr Rahul Shinde",
    code: "SP002",
    role: "Sales Person",
    levelName: "Level 6",
    levelOrder: 6,
    email: "rahul.shinde@isquare.com",
    phone: "+91 98900 33445",
    reportingToId: 101,
    reportingToName: "Mr Amit Patil",
    reportingToRole: "BDE User",
  },
  {
    id: 203,
    name: "Ms Pooja Mehta",
    code: "SP003",
    role: "Sales Person",
    levelName: "Level 6",
    levelOrder: 6,
    email: "pooja.mehta@isquare.com",
    phone: "+91 98900 55667",
    reportingToId: 102,
    reportingToName: "Ms Priya Kulkarni",
    reportingToRole: "BDE User",
  },
  {
    id: 204,
    name: "Mr Karan Desai",
    code: "SP004",
    role: "Sales Person",
    levelName: "Level 6",
    levelOrder: 6,
    email: "karan.desai@isquare.com",
    phone: "+91 98900 77889",
    reportingToId: 103,
    reportingToName: "Mr Rohit Joshi",
    reportingToRole: "BDE User",
  },

  // System Admins (No reporting required)
  {
    id: 301,
    name: "Mr Admin Ramesh",
    code: "ADM001",
    role: "System Admin",
    levelName: "System Administrator",
    levelOrder: 0,
    email: "admin.ramesh@isquare.com",
    phone: "+91 98111 00001",
    reportingToId: null,
  },
  {
    id: 302,
    name: "Ms Admin Neha",
    code: "ADM002",
    role: "System Admin",
    levelName: "IT Operations Admin",
    levelOrder: 0,
    email: "admin.neha@isquare.com",
    phone: "+91 98111 00002",
    reportingToId: null,
  },
];

// Initial preloaded Assignment records
export const INITIAL_STATIC_ASSIGNMENTS: AssignmentRecord[] = [
  {
    id: "asg-1",
    employeeId: 1,
    employeeName: "Mr Rajesh Sharma",
    employeeCode: "DIR001",
    role: "Director",
    reportingToId: null,
    reportingToName: null,
    reportingToRole: null,
    assignedDate: "2026-01-15",
    status: "Active",
  },
  {
    id: "asg-2",
    employeeId: 2,
    employeeName: "Mr Vikram Malhotra",
    employeeCode: "DIR002",
    role: "Director",
    reportingToId: null,
    reportingToName: null,
    reportingToRole: null,
    assignedDate: "2026-01-15",
    status: "Active",
  },
  {
    id: "asg-3",
    employeeId: 101,
    employeeName: "Mr Amit Patil",
    employeeCode: "BDE001",
    role: "BDE User",
    reportingToId: 1,
    reportingToName: "Mr Rajesh Sharma (DIR001)",
    reportingToRole: "Director",
    assignedDate: "2026-02-01",
    status: "Active",
  },
  {
    id: "asg-4",
    employeeId: 102,
    employeeName: "Ms Priya Kulkarni",
    employeeCode: "BDE002",
    role: "BDE User",
    reportingToId: 2,
    reportingToName: "Mr Vikram Malhotra (DIR002)",
    reportingToRole: "Director",
    assignedDate: "2026-02-10",
    status: "Active",
  },
  {
    id: "asg-5",
    employeeId: 201,
    employeeName: "Mr Aniket Zine",
    employeeCode: "GAX003",
    role: "Sales Person",
    reportingToId: 101,
    reportingToName: "Mr Amit Patil (BDE001)",
    reportingToRole: "BDE User",
    assignedDate: "2026-03-01",
    status: "Active",
  },
  {
    id: "asg-6",
    employeeId: 301,
    employeeName: "Mr Admin Ramesh",
    employeeCode: "ADM001",
    role: "System Admin",
    reportingToId: null,
    reportingToName: null,
    reportingToRole: null,
    assignedDate: "2026-01-01",
    status: "Active",
  },
];

/**
 * Filter eligible "Reporting To" employees strictly based on the chosen role.
 * - System Admin -> [] (No reporting required)
 * - Director -> [] (No reporting required)
 * - BDE User -> ONLY employees whose role is Director
 * - Sales Person -> ONLY employees whose role is BDE User
 */
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
