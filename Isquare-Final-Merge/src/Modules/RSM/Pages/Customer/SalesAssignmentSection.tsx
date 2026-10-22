import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Layers,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  type RoleType,
  AVAILABLE_ROLES,
  type MockEmployee,
  type HierarchyLevel,
  type AssignmentRecord,
  INITIAL_STATIC_EMPLOYEES,
  INITIAL_STATIC_LEVELS,
  INITIAL_STATIC_ASSIGNMENTS,
  getEligibleReportingEmployees,
  validateRoleAssignment,
} from "./Services/RoleAssignmentStaticData";

export interface SalesAssignmentFormValues {
  directorId?: number | "";
  directorName?: string;
  directorCode?: string;
  bdeUserId?: number | "";
  bdeUserName?: string;
  salesCoordinatorId?: number | "";
  salesCoordinatorName?: string;
  customerOwnerId?: number | "";
  customerOwnerName?: string;
  customerOwnerType?: "Director" | "BDE" | string;
  customerOwnerValue?: string;
  employeeId?: number | "";
  employeeName?: string;
  employeeCode?: string;
  role?: RoleType | string;
  reportingToId?: number | "";
  reportingToName?: string;
}

const DEFAULT_VALUES: SalesAssignmentFormValues = {
  directorId: "",
  directorName: "",
  directorCode: "",
  bdeUserId: "",
  bdeUserName: "",
  salesCoordinatorId: "",
  salesCoordinatorName: "",
  customerOwnerId: "",
  customerOwnerName: "",
  customerOwnerType: "",
  customerOwnerValue: "",
  employeeId: "",
  employeeName: "",
  employeeCode: "",
  role: "",
  reportingToId: "",
  reportingToName: "",
};

export interface SalesAssignmentSectionProps {
  values?: SalesAssignmentFormValues;
  onChange?: (updates: Partial<SalesAssignmentFormValues>) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof SalesAssignmentFormValues, string>>;
  hideHeader?: boolean;
  standalone?: boolean;
  initialSubTab?: "reporting" | "levels";
}

/**
 * CRM Sales Assignment & Organization Hierarchy Module
 * Role-Based Employee Assignment Flow (Static Data Only)
 *
 * Rules:
 * - System Admin: No Reporting To required (hidden / disabled)
 * - Director: No Reporting To required (hidden / disabled)
 * - BDE User: Reporting To restricted to employees with Director role
 * - Sales Person: Reporting To restricted to employees with BDE User role
 * - In Customer Modal (!standalone):
 *     * Data is automatically synced to the customer form via onChange
 *     * NO local "Save Assignment" button (saved when complete customer form is submitted)
 *     * NO inner assignments table
 * - On Standalone Page (standalone=true):
 *     * Full management interface with Levels tab and Assignments table
 */
const SalesAssignmentSection: React.FC<SalesAssignmentSectionProps> = ({
  values: propValues,
  onChange,
  disabled = false,
  errors: propErrors = {},
  hideHeader = false,
  standalone = false,
  initialSubTab = "reporting",
}) => {
  // Support both controlled and standalone usage
  const [internalValues, setInternalValues] = useState<SalesAssignmentFormValues>(DEFAULT_VALUES);
  const values = propValues ?? internalValues;

  const handleValuesUpdate = (updates: Partial<SalesAssignmentFormValues>) => {
    if (onChange) {
      onChange(updates);
    } else {
      setInternalValues((prev) => ({ ...prev, ...updates }));
    }
  };

  // Active sub-tab: "reporting" (Reporting To) or "levels" (Levels)
  const [activeSubTab, setActiveSubTab] = useState<"reporting" | "levels">(initialSubTab);

  // In-memory static state
  const [employees, setEmployees] = useState<MockEmployee[]>(INITIAL_STATIC_EMPLOYEES);
  const [levels, setLevels] = useState<HierarchyLevel[]>(INITIAL_STATIC_LEVELS);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>(INITIAL_STATIC_ASSIGNMENTS);

  // Form states for role assignment
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">(() => {
    if (values.employeeId) return Number(values.employeeId);
    if (values.salesCoordinatorId) return Number(values.salesCoordinatorId);
    if (values.bdeUserId) return Number(values.bdeUserId);
    if (values.directorId) return Number(values.directorId);
    return standalone ? 201 : "";
  });

  const [selectedRole, setSelectedRole] = useState<RoleType | "">(() => {
    if (values.role && AVAILABLE_ROLES.includes(values.role as RoleType)) {
      return values.role as RoleType;
    }
    if (values.salesCoordinatorId) return "Sales Person";
    if (values.bdeUserId) return "BDE User";
    if (values.directorId) return "Director";
    return standalone ? "Sales Person" : "";
  });

  const [selectedReportingToId, setSelectedReportingToId] = useState<number | "">(() => {
    if (values.reportingToId) return Number(values.reportingToId);
    if (values.salesCoordinatorId && values.bdeUserId) return Number(values.bdeUserId);
    if (values.bdeUserId && values.directorId) return Number(values.directorId);
    return standalone ? 101 : "";
  });

  // Keep state in sync if prop values change externally (e.g. customer data loaded in Edit mode)
  useEffect(() => {
    if (propValues) {
      if (propValues.employeeId) {
        setSelectedEmployeeId(Number(propValues.employeeId));
        if (propValues.role && AVAILABLE_ROLES.includes(propValues.role as RoleType)) {
          setSelectedRole(propValues.role as RoleType);
        }
        if (propValues.reportingToId) {
          setSelectedReportingToId(Number(propValues.reportingToId));
        }
      } else if (propValues.salesCoordinatorId) {
        setSelectedEmployeeId(Number(propValues.salesCoordinatorId));
        setSelectedRole("Sales Person");
        if (propValues.bdeUserId) {
          setSelectedReportingToId(Number(propValues.bdeUserId));
        }
      } else if (propValues.bdeUserId) {
        setSelectedEmployeeId(Number(propValues.bdeUserId));
        setSelectedRole("BDE User");
        if (propValues.directorId) {
          setSelectedReportingToId(Number(propValues.directorId));
        }
      } else if (propValues.directorId) {
        setSelectedEmployeeId(Number(propValues.directorId));
        setSelectedRole("Director");
        setSelectedReportingToId("");
      }
    }
  }, [
    propValues?.employeeId,
    propValues?.role,
    propValues?.reportingToId,
    propValues?.salesCoordinatorId,
    propValues?.bdeUserId,
    propValues?.directorId,
  ]);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    employeeId?: string;
    role?: string;
    reportingToId?: string;
  }>({});

  // Filter & Search states (for standalone view)
  const [levelSearchText, setLevelSearchText] = useState<string>("");
  const [assignmentSearchText, setAssignmentSearchText] = useState<string>("");
  const [assignmentRoleFilter, setAssignmentRoleFilter] = useState<string>("All");

  // Level Modal States (Add / Edit)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [editingLevelId, setEditingLevelId] = useState<number | null>(null);
  const [levelFormData, setLevelFormData] = useState<{
    levelName: string;
    levelOrder: number | "";
    isActive: boolean;
  }>({
    levelName: "",
    levelOrder: 1,
    isActive: true,
  });

  // Current selected employee object
  const currentEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === Number(selectedEmployeeId)) || null;
  }, [employees, selectedEmployeeId]);

  // Eligible "Reporting To" employees strictly based on chosen role
  const eligibleReportingEmployees = useMemo(() => {
    return getEligibleReportingEmployees(selectedRole, employees, selectedEmployeeId);
  }, [selectedRole, employees, selectedEmployeeId]);

  // Current selected reporting-to employee object
  const currentReportingTo = useMemo(() => {
    if (!selectedReportingToId) return null;
    return employees.find((emp) => emp.id === Number(selectedReportingToId)) || null;
  }, [employees, selectedReportingToId]);

  /**
   * Automatically synchronizes all role-based sales assignment fields with the parent customer form
   * without needing to press an inner "Save" button!
   */
  const syncToParent = (
    emp: MockEmployee | null,
    role: RoleType | "",
    reportingEmp: MockEmployee | null
  ) => {
    if (!emp || !role) {
      handleValuesUpdate({
        employeeId: "",
        employeeName: "",
        employeeCode: "",
        role: "",
        reportingToId: "",
        reportingToName: "",
        directorId: "",
        directorName: "",
        directorCode: "",
        bdeUserId: "",
        bdeUserName: "",
        salesCoordinatorId: "",
        salesCoordinatorName: "",
        customerOwnerId: "",
        customerOwnerName: "",
        customerOwnerType: "",
        customerOwnerValue: "",
      });
      return;
    }

    const updates: Partial<SalesAssignmentFormValues> = {
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.code,
      role: role,
      reportingToId: reportingEmp ? reportingEmp.id : "",
      reportingToName: reportingEmp ? reportingEmp.name : "",
    };

    if (role === "Director") {
      updates.directorId = emp.id;
      updates.directorName = emp.name;
      updates.directorCode = emp.code;
      updates.bdeUserId = "";
      updates.bdeUserName = "";
      updates.salesCoordinatorId = "";
      updates.salesCoordinatorName = "";
      updates.customerOwnerId = emp.id;
      updates.customerOwnerName = emp.name;
      updates.customerOwnerType = "Director";
      updates.customerOwnerValue = `Director:${emp.id}`;
    } else if (role === "BDE User") {
      updates.bdeUserId = emp.id;
      updates.bdeUserName = emp.name;
      if (reportingEmp) {
        updates.directorId = reportingEmp.id;
        updates.directorName = reportingEmp.name;
        updates.directorCode = reportingEmp.code;
      } else {
        updates.directorId = "";
        updates.directorName = "";
        updates.directorCode = "";
      }
      updates.salesCoordinatorId = "";
      updates.salesCoordinatorName = "";
      updates.customerOwnerId = emp.id;
      updates.customerOwnerName = emp.name;
      updates.customerOwnerType = "BDE";
      updates.customerOwnerValue = `BDE:${emp.id}`;
    } else if (role === "Sales Person") {
      updates.salesCoordinatorId = emp.id;
      updates.salesCoordinatorName = emp.name;
      if (reportingEmp) {
        updates.bdeUserId = reportingEmp.id;
        updates.bdeUserName = reportingEmp.name;
        // If the assigned BDE user reports to a Director, also map the Director
        if (reportingEmp.reportingToId) {
          const bdeDirector = employees.find((e) => e.id === reportingEmp.reportingToId);
          if (bdeDirector) {
            updates.directorId = bdeDirector.id;
            updates.directorName = bdeDirector.name;
            updates.directorCode = bdeDirector.code;
          }
        }
      } else {
        updates.bdeUserId = "";
        updates.bdeUserName = "";
        updates.directorId = "";
        updates.directorName = "";
        updates.directorCode = "";
      }
      updates.customerOwnerId = emp.id;
      updates.customerOwnerName = emp.name;
      updates.customerOwnerType = "SalesCoordinator";
      updates.customerOwnerValue = `SalesCoordinator:${emp.id}`;
    } else if (role === "System Admin") {
      updates.directorId = "";
      updates.directorName = "";
      updates.directorCode = "";
      updates.bdeUserId = "";
      updates.bdeUserName = "";
      updates.salesCoordinatorId = "";
      updates.salesCoordinatorName = "";
      updates.customerOwnerId = emp.id;
      updates.customerOwnerName = emp.name;
      updates.customerOwnerType = "System Admin";
      updates.customerOwnerValue = `SystemAdmin:${emp.id}`;
    }

    handleValuesUpdate(updates);
  };

  // Handle Employee Change
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value ? Number(e.target.value) : "";
    setSelectedEmployeeId(empId);
    setValidationErrors((prev) => ({ ...prev, employeeId: undefined }));

    if (!empId) {
      setSelectedRole("");
      setSelectedReportingToId("");
      syncToParent(null, "", null);
      return;
    }

    const emp = employees.find((item) => item.id === empId);
    if (emp) {
      // Auto-set the employee's role
      const newRole = emp.role;
      setSelectedRole(newRole);

      let initialReportingToId: number | "" = "";
      let initialReportingEmp: MockEmployee | null = null;

      // Check if employee has existing reporting relationship
      if (newRole === "System Admin" || newRole === "Director") {
        initialReportingToId = "";
      } else if (emp.reportingToId) {
        const validReporting = getEligibleReportingEmployees(newRole, employees, emp.id);
        const validMatch = validReporting.find((r) => r.id === emp.reportingToId);
        if (validMatch) {
          initialReportingToId = validMatch.id;
          initialReportingEmp = validMatch;
        }
      }

      setSelectedReportingToId(initialReportingToId);
      // Synchronize immediately with customer form
      syncToParent(emp, newRole, initialReportingEmp);
    }
  };

  // Handle Role Change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as RoleType | "";
    setSelectedRole(newRole);

    // CRITICAL REQUIREMENT: Clear previous Reporting To selection whenever role changes
    setSelectedReportingToId("");

    // Clear validation errors
    setValidationErrors((prev) => ({
      ...prev,
      role: undefined,
      reportingToId: undefined,
    }));

    // Synchronize immediately with customer form
    syncToParent(currentEmployee, newRole, null);
  };

  // Handle Reporting To Change
  const handleReportingToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repId = e.target.value ? Number(e.target.value) : "";
    setSelectedReportingToId(repId);
    setValidationErrors((prev) => ({ ...prev, reportingToId: undefined }));

    const reportingEmp = employees.find((item) => item.id === repId) || null;
    // Synchronize immediately with customer form
    syncToParent(currentEmployee, selectedRole, reportingEmp);
  };

  // Reset Assignment Form
  const handleReset = () => {
    setSelectedEmployeeId("");
    setSelectedRole("");
    setSelectedReportingToId("");
    setValidationErrors({});
    syncToParent(null, "", null);
    toast.info("Sales assignment selection cleared.");
  };

  // Standalone mode Save Assignment (Only used in Standalone Hierarchy Management demo)
  const handleSaveAssignment = () => {
    const validation = validateRoleAssignment(
      selectedEmployeeId,
      selectedRole,
      selectedReportingToId,
      employees
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError || "Please fix validation errors before saving.");
      return;
    }

    if (!currentEmployee || !selectedRole) return;

    const newAssignment: AssignmentRecord = {
      id: `asg-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeCode: currentEmployee.code,
      role: selectedRole,
      reportingToId: selectedReportingToId ? Number(selectedReportingToId) : null,
      reportingToName: currentReportingTo ? `${currentReportingTo.name} (${currentReportingTo.code})` : null,
      reportingToRole: currentReportingTo ? currentReportingTo.role : null,
      assignedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setAssignments((prev) => {
      const filtered = prev.filter((a) => a.employeeId !== currentEmployee.id);
      return [newAssignment, ...filtered];
    });

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmployee.id) {
          return {
            ...emp,
            role: selectedRole,
            reportingToId: selectedReportingToId ? Number(selectedReportingToId) : null,
            reportingToName: currentReportingTo ? currentReportingTo.name : undefined,
            reportingToRole: currentReportingTo ? currentReportingTo.role : undefined,
          };
        }
        return emp;
      })
    );

    syncToParent(currentEmployee, selectedRole, currentReportingTo);

    toast.success(
      `Assignment saved for ${currentEmployee.name} as ${selectedRole}${
        currentReportingTo ? ` (Reporting to: ${currentReportingTo.name})` : ""
      }`
    );
  };

  // Quick Select an existing assignment into the form (Standalone only)
  const handleSelectAssignment = (asg: AssignmentRecord) => {
    setSelectedEmployeeId(asg.employeeId);
    setSelectedRole(asg.role);
    setSelectedReportingToId(asg.reportingToId || "");
    setValidationErrors({});
    const emp = employees.find((e) => e.id === asg.employeeId) || null;
    const sup = asg.reportingToId ? employees.find((e) => e.id === asg.reportingToId) || null : null;
    syncToParent(emp, asg.role, sup);
    toast.info(`Loaded assignment for ${asg.employeeName}`);
  };

  // Delete an assignment (Standalone only)
  const handleDeleteAssignment = (id: string, name: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Removed assignment for ${name}`);
  };

  // Filtered Assignments List (Standalone only)
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSearch =
        asg.employeeName.toLowerCase().includes(assignmentSearchText.toLowerCase()) ||
        asg.employeeCode.toLowerCase().includes(assignmentSearchText.toLowerCase()) ||
        (asg.reportingToName &&
          asg.reportingToName.toLowerCase().includes(assignmentSearchText.toLowerCase()));
      const matchesRole =
        assignmentRoleFilter === "All" || asg.role === assignmentRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [assignments, assignmentSearchText, assignmentRoleFilter]);

  // Filtered Levels List (for Levels tab)
  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) =>
      lvl.levelName.toLowerCase().includes(levelSearchText.toLowerCase())
    );
  }, [levels, levelSearchText]);

  // Open Level Modal
  const handleOpenAddLevel = () => {
    setEditingLevelId(null);
    setLevelFormData({
      levelName: "",
      levelOrder: levels.length + 1,
      isActive: true,
    });
    setIsLevelModalOpen(true);
  };

  const handleOpenEditLevel = (lvl: HierarchyLevel) => {
    setEditingLevelId(lvl.id);
    setLevelFormData({
      levelName: lvl.levelName,
      levelOrder: lvl.levelOrder,
      isActive: lvl.isActive,
    });
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormData.levelName.trim()) {
      toast.error("Level Name is required.");
      return;
    }

    if (editingLevelId) {
      setLevels((prev) =>
        prev.map((lvl) =>
          lvl.id === editingLevelId
            ? {
                ...lvl,
                levelName: levelFormData.levelName.trim(),
                levelOrder: Number(levelFormData.levelOrder) || lvl.levelOrder,
                isActive: levelFormData.isActive,
              }
            : lvl
        )
      );
      toast.success("Level updated successfully!");
    } else {
      const newLvl: HierarchyLevel = {
        id: Date.now(),
        levelName: levelFormData.levelName.trim(),
        levelOrder: Number(levelFormData.levelOrder) || levels.length + 1,
        isActive: levelFormData.isActive,
      };
      setLevels((prev) => [...prev, newLvl]);
      toast.success("New Level added successfully!");
    }
    setIsLevelModalOpen(false);
  };

  const handleDeleteLevel = (id: number, name: string) => {
    setLevels((prev) => prev.filter((lvl) => lvl.id !== id));
    toast.success(`Level "${name}" deleted.`);
  };

  // Helper for role color badge
  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case "System Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Director":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "BDE User":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Sales Person":
        return "bg-amber-100 text-[#b45309] border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className={
        standalone
          ? "bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          : "space-y-6"
      }
    >
      {/* 1. Header (Only rendered when standalone or when hideHeader is false) */}
      {(!hideHeader || standalone) && (
        <div className="p-5 md:p-6 pb-0 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 bg-blue-50 border border-blue-200 text-[#154068] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight font-serif">
                    Hierarchy Management
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#154068] border border-blue-200">
                    Static Demo Flow
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Manage organization hierarchy levels and reporting structure.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation matching Screenshot: Levels | Reporting To */}
          <div className="flex items-center gap-2 pt-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSubTab("levels")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeSubTab === "levels"
                  ? "border-[#154068] text-[#154068] bg-blue-50/40 rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              <Layers className="w-4 h-4 text-[#154068]" />
              <span>Levels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("reporting")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeSubTab === "reporting"
                  ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              <GitBranch className="w-4 h-4 text-purple-600" />
              <span>Reporting To</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT: REPORTING TO (Role-Based Employee Assignment Flow) */}
      {activeSubTab === "reporting" && (
        <div className={standalone ? "p-5 md:p-6 space-y-6" : "space-y-6"}>
          {/* Workflow Instruction Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-orange-50 border border-blue-100 rounded-xl p-4 text-xs text-gray-700 shadow-2xs">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#154068] uppercase tracking-wide">
                  Role-Based Assignment Rules (Static Demo)
                </span>
                <p className="text-gray-600">
                  <strong className="text-purple-700">System Admin</strong> &amp;{" "}
                  <strong className="text-emerald-700">Director</strong>: No reporting to required.{" "}
                  &bull; <strong className="text-blue-700">BDE User</strong>: Can ONLY report to a{" "}
                  <span className="underline decoration-emerald-500 font-semibold">Director</span>.{" "}
                  &bull; <strong className="text-amber-700">Sales Person</strong>: Can ONLY report
                  to a <span className="underline decoration-blue-500 font-semibold">BDE User</span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Main Assignment Form Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck size={16} className="text-[#154068]" />
                  Employee Role &amp; Hierarchy Assignment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select an employee, pick their role, and assign their valid supervisor.
                </p>
              </div>

              {/* Status Badge */}
              {currentEmployee && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium border border-gray-200">
                  Selected: <strong className="text-gray-900">{currentEmployee.code}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FIELD 1: Select Employee */}
              <div>
                <label
                  htmlFor="role_assignment_employee_select"
                  className="text-xs font-bold text-gray-700 block mb-1.5"
                >
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <select
                  id="role_assignment_employee_select"
                  value={selectedEmployeeId}
                  onChange={handleEmployeeChange}
                  disabled={disabled}
                  className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 cursor-pointer shadow-2xs ${
                    validationErrors.employeeId || propErrors.employeeId
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                  } ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code}){emp.levelName ? ` (${emp.levelName})` : ""}
                    </option>
                  ))}
                </select>
                {validationErrors.employeeId && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.employeeId}
                  </p>
                )}
                {currentEmployee && (
                  <p className="text-[11px] text-gray-500 mt-1 truncate">
                    Email: {currentEmployee.email}
                  </p>
                )}
              </div>

              {/* FIELD 2: Select Role */}
              <div>
                <label
                  htmlFor="role_assignment_role_select"
                  className="text-xs font-bold text-gray-700 block mb-1.5"
                >
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role_assignment_role_select"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  disabled={disabled || !selectedEmployeeId}
                  className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 shadow-2xs ${
                    validationErrors.role || propErrors.role
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                  } ${
                    !selectedEmployeeId || disabled
                      ? "opacity-60 bg-gray-100 cursor-not-allowed text-gray-400"
                      : "cursor-pointer"
                  }`}
                >
                  <option value="">-- Select Role --</option>
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {validationErrors.role && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.role}
                  </p>
                )}
                {selectedRole && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Selected Level:</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRoleBadge(
                        selectedRole
                      )}`}
                    >
                      {selectedRole}
                    </span>
                  </div>
                )}
              </div>

              {/* FIELD 3: Reporting To */}
              <div>
                <label
                  htmlFor="role_assignment_reporting_to_select"
                  className="text-xs font-bold text-gray-700 block mb-1.5"
                >
                  Reporting To{" "}
                  {selectedRole === "BDE User" || selectedRole === "Sales Person" ? (
                    <span className="text-red-500">*</span>
                  ) : null}
                </label>

                {/* State A: System Admin / Director -> No reporting to required (hidden/disabled) */}
                {selectedRole === "System Admin" || selectedRole === "Director" ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-500 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      No Reporting To required for{" "}
                      <strong className="text-gray-800">{selectedRole}</strong>.
                    </span>
                  </div>
                ) : (
                  /* State B: BDE User or Sales Person -> Dropdown strictly populated */
                  <select
                    id="role_assignment_reporting_to_select"
                    value={selectedReportingToId}
                    onChange={handleReportingToChange}
                    disabled={disabled || !selectedRole}
                    className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 shadow-2xs ${
                      validationErrors.reportingToId || propErrors.reportingToId
                        ? "border-red-500 ring-1 ring-red-500/20"
                        : "border-gray-300"
                    } ${
                      !selectedRole || disabled
                        ? "opacity-60 bg-gray-100 cursor-not-allowed text-gray-400"
                        : "cursor-pointer"
                    }`}
                  >
                    <option value="">
                      {!selectedRole
                        ? "-- Select Role first --"
                        : selectedRole === "BDE User"
                        ? "Select Director"
                        : "Select BDE User"}
                    </option>
                    {eligibleReportingEmployees.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.code}) {sup.levelName ? `• ${sup.levelName}` : ""}
                      </option>
                    ))}
                  </select>
                )}

                {validationErrors.reportingToId && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.reportingToId}
                  </p>
                )}

                {/* Helper notice explaining eligible role constraint */}
                {selectedRole === "BDE User" && (
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    &bull; Displaying ONLY employees whose role is <strong>Director</strong>.
                  </p>
                )}
                {selectedRole === "Sales Person" && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    &bull; Displaying ONLY employees whose role is <strong>BDE User</strong>.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Dynamic Assignment Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-[#154068]" />
                  Live Assignment Preview
                </span>
                <span className="text-[11px] text-slate-500">Real-time dynamic representation</span>
              </div>

              {currentEmployee && selectedRole ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] uppercase font-bold text-gray-400">Employee Name</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {currentEmployee.name}
                      </p>
                      <p className="text-xs text-gray-500">{currentEmployee.code}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] uppercase font-bold text-gray-400">Assigned Role</p>
                      <div className="mt-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-block ${getRoleBadge(
                            selectedRole
                          )}`}
                        >
                          {selectedRole}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] uppercase font-bold text-gray-400">Reporting To</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {selectedRole === "System Admin" || selectedRole === "Director"
                          ? "None (Top Level Leadership)"
                          : currentReportingTo
                          ? `${currentReportingTo.name} (${currentReportingTo.code})`
                          : "Not Selected Yet"}
                      </p>
                      {currentReportingTo && (
                        <p className="text-xs text-blue-600 font-medium">
                          Role: {currentReportingTo.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Visual Hierarchy Chain Flow */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                      Reporting Hierarchy:
                    </span>
                    {selectedRole === "Director" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Executive Level &rarr; {currentEmployee.name} (Director)
                      </span>
                    )}

                    {selectedRole === "System Admin" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                        <CheckCircle2 size={13} className="text-purple-600" />
                        System Level &rarr; {currentEmployee.name} (System Admin)
                      </span>
                    )}

                    {selectedRole === "BDE User" && currentReportingTo && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {currentReportingTo.name} (Director)
                        </span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                          {currentEmployee.name} (BDE User)
                        </span>
                      </div>
                    )}

                    {selectedRole === "Sales Person" && currentReportingTo && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                          Executive Director
                        </span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                          {currentReportingTo.name} (BDE User)
                        </span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="px-2.5 py-1 rounded bg-amber-50 text-[#b45309] font-bold border border-amber-200">
                          {currentEmployee.name} (Sales Person)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Please select an employee and role to see the preview.
                </div>
              )}
            </div>

            {/* Action Bar (Reset Selection button + note that all data saves on form submit) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>
                  Sales assignment is linked automatically and will be saved when submitting the complete customer form.
                </span>
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Clear sales assignment fields"
                >
                  <RotateCcw size={13} />
                  <span>Reset Selection</span>
                </button>

                {standalone && (
                  <button
                    type="button"
                    onClick={handleSaveAssignment}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Save Assignment</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Active Assignments Table (RENDERED ONLY ON STANDALONE PAGE, NEVER IN CUSTOMER MODAL) */}
          {standalone && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Users size={15} className="text-[#154068]" />
                    Current Static Employee Assignments ({filteredAssignments.length})
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click on an employee to load into the form and test re-assignment rules.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={assignmentSearchText}
                      onChange={(e) => setAssignmentSearchText(e.target.value)}
                      placeholder="Search employee / code..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 bg-white w-48"
                    />
                  </div>

                  <select
                    value={assignmentRoleFilter}
                    onChange={(e) => setAssignmentRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Sr. No.</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Reporting To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No assignments matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAssignments.map((asg, idx) => (
                        <tr
                          key={asg.id}
                          className={`hover:bg-blue-50/40 transition cursor-pointer ${
                            selectedEmployeeId === asg.employeeId ? "bg-blue-50/70" : ""
                          }`}
                          onClick={() => handleSelectAssignment(asg)}
                        >
                          <td className="py-3 px-4 font-medium text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900">{asg.employeeName}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{asg.employeeCode}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block uppercase ${getRoleBadge(
                                asg.role
                              )}`}
                            >
                              {asg.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {asg.reportingToName ? (
                              <div>
                                <p className="font-semibold text-gray-800">{asg.reportingToName}</p>
                                {asg.reportingToRole && (
                                  <span className="text-[10px] text-blue-600">
                                    ({asg.reportingToRole})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">None (Top Level)</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              {asg.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div
                              className="inline-flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectAssignment(asg)}
                                className="p-1.5 rounded hover:bg-blue-100 text-[#154068] transition"
                                title="Edit in form"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAssignment(asg.id, asg.employeeName)}
                                className="p-1.5 rounded hover:bg-red-100 text-rose-600 transition"
                                title="Delete Assignment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: LEVELS (Matching Screenshot 1) */}
      {activeSubTab === "levels" && (
        <div className={standalone ? "p-5 md:p-6 space-y-6" : "space-y-6"}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 font-serif tracking-tight border-b-2 border-[#154068] pb-1 inline-block">
                Listing of Levels
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddLevel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2c4d] hover:bg-[#154068] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Add Level</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Search:</span>
                  <input
                    type="text"
                    value={levelSearchText}
                    onChange={(e) => setLevelSearchText(e.target.value)}
                    placeholder=""
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white w-40 sm:w-48"
                  />
                </div>
              </div>
            </div>

            {/* Levels Table matching Screenshot 1 */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f2c4d] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 border-r border-[#154068]/40">Sr. No.</th>
                    <th className="py-3 px-4 border-r border-[#154068]/40">Level Name</th>
                    <th className="py-3 px-4 border-r border-[#154068]/40">Level Order</th>
                    <th className="py-3 px-4 border-r border-[#154068]/40">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                  {filteredLevels.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No levels found.
                      </td>
                    </tr>
                  ) : (
                    filteredLevels.map((lvl, index) => (
                      <tr key={lvl.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-semibold text-gray-700">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-800">{lvl.levelName}</td>
                        <td className="py-3.5 px-4 text-gray-600">{lvl.levelOrder}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold text-xs ${
                              lvl.isActive ? "text-[#16a34a]" : "text-[#dc2626]"
                            }`}
                          >
                            {lvl.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLevel(lvl)}
                              className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                              title="Edit Level"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLevel(lvl.id, lvl.levelName)}
                              className="text-rose-600 hover:text-rose-800 transition cursor-pointer"
                              title="Delete Level"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Add / Edit Level (Matching Screenshot 1) */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 font-serif">
                {editingLevelId ? "Edit Level" : "Add Level"}
              </h3>
              <button
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLevel} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Level Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={levelFormData.levelName}
                  onChange={(e) =>
                    setLevelFormData((prev) => ({ ...prev, levelName: e.target.value }))
                  }
                  placeholder="e.g. DIRECTOR, General Manager"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Level Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={levelFormData.levelOrder}
                  onChange={(e) =>
                    setLevelFormData((prev) => ({
                      ...prev,
                      levelOrder: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="level_active_checkbox"
                  checked={levelFormData.isActive}
                  onChange={(e) =>
                    setLevelFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="level_active_checkbox"
                  className="text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Active
                </label>
              </div>

              {/* Action Buttons: Cancel and Save Level */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-[#5c6978] hover:bg-[#4b5563] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesAssignmentSection;
