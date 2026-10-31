import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Layers,
  GitBranch,
  AlertCircle,
  RotateCcw,
  Save,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getEmployees,
  getDirectors,
  getBdeUsers,
  getSalesCoordinators,
} from "./Services/CustomerMasterDataService";
import {
  getBdeUsersByDirectorId,
  getSalesCoordinatorsByBdeId,
} from "./Services/SalesAssignmentService";
import type {
  BdeUserOption,
  SalesCoordinatorOption,
} from "./Services/SalesAssignmentService";
import type {
  SalesCoordinatorItem,
  DirectorItem,
  EmployeeSelectItem,
  BdeUserItem,
} from "./Types/CustomerTypes";
import {
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
} from "./Services/HierarchyLevelService";
import { setEmployeeReporting } from "../../../HRMS/Services/MasterDataService";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  type RoleType,
  type HierarchyLevel,
  type AssignmentRecord,
} from "./Services/RoleAssignmentStaticData";

export interface DynamicEmployee {
  id: number;
  name: string;
  code: string;
  role?: string;
  reportingTo?: number;
  reportingToName?: string;
}

export interface DynamicDirector {
  id: number;
  name: string;
  code: string;
}

export interface DynamicBdeUser {
  id: number;
  name: string;
  code: string;
  directorId?: number;
  directorName?: string;
}

export const ASSIGNMENT_ROLES: RoleType[] = [
];

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
 * Format employee display name cleanly without duplicating codes
 * e.g. "System Admin (SYS)" with code "SYS" remains "System Admin (SYS)"
 */
const formatEmployeeDisplay = (name: string, code?: string): string => {
  if (!name) return "";
  if (!code || !code.trim()) return name;
  const trimmed = code.trim();
  if (
    name.toLowerCase().includes(`(${trimmed.toLowerCase()})`) ||
    name.toLowerCase().endsWith(trimmed.toLowerCase())
  ) {
    return name;
  }
  return `${name} (${trimmed})`;
};


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

  // Dynamic API Master Data State
  const [employees, setEmployees] = useState<DynamicEmployee[]>([]);
  const [directors, setDirectors] = useState<DynamicDirector[]>([]);
  const [bdeUsers, setBdeUsers] = useState<DynamicBdeUser[]>([]);
  const [allSalesCoordinators, setAllSalesCoordinators] = useState<SalesCoordinatorItem[]>([]);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState<boolean>(true);
  const [isSavingLevel, setIsSavingLevel] = useState<boolean>(false);

  // Levels & Standalone Assignments State
  const [levels, setLevels] = useState<HierarchyLevel[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState<boolean>(true);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);

  // Cascading Selection State
  const [selectedDirectorId, setSelectedDirectorId] = useState<number | "">(() => {
    if (values.directorId) return Number(values.directorId);
    if (values.employeeId && values.role === "Director") return Number(values.employeeId);
    return "";
  });

  const [selectedBdeId, setSelectedBdeId] = useState<number | "">(() => {
    if (values.bdeUserId) return Number(values.bdeUserId);
    if (values.employeeId && values.role === "BDE User") return Number(values.employeeId);
    return "";
  });

  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<number | "">(() => {
    if (values.salesCoordinatorId) return Number(values.salesCoordinatorId);
    if (values.employeeId && values.role === "Sales Person") return Number(values.employeeId);
    return "";
  });

  const [selectedOwnerValue, setSelectedOwnerValue] = useState<string>(() => {
    if (values.customerOwnerValue) return values.customerOwnerValue;
    if (values.customerOwnerType && values.customerOwnerId) { return `${values.customerOwnerType}:${values.customerOwnerId}`;

    }
    if (values.customerOwnerId && values.bdeUserId && Number(values.customerOwnerId) === Number(values.bdeUserId)) {
      return `BDE:${values.bdeUserId}`;
    }
    if (values.customerOwnerId && values.directorId && Number(values.customerOwnerId) === Number(values.directorId)) {
      return `Director:${values.directorId}`;
    }
    if (values.customerOwnerName && values.bdeUserName && values.customerOwnerName.trim().toLowerCase() === values.bdeUserName.trim().toLowerCase()) {
      return `BDE:${values.bdeUserId || values.customerOwnerId}`;
    }
    if (values.customerOwnerName && values.directorName && values.customerOwnerName.trim().toLowerCase() === values.directorName.trim().toLowerCase()) {
      return `Director:${values.directorId || values.customerOwnerId}`; } if (false) { if (false) {
    }


    }
    return "";
  });

  const [filteredBdes, setFilteredBdes] = useState<BdeUserOption[]>([]);
  const [filteredSalesPersons, setFilteredSalesPersons] = useState<SalesCoordinatorOption[]>([]);
  const [isLoadingBdes, setIsLoadingBdes] = useState<boolean>(false);
  const [isLoadingSalesPersons, setIsLoadingSalesPersons] = useState<boolean>(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    directorId?: string;
    bdeUserId?: string;
    salesCoordinatorId?: string;
    customerOwnerId?: string;
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

  // Helper: Synchronize cascading selection fields to parent form
  const syncCascadingToParent = (
    dir: { id: number; name: string; code?: string } | null,
    bde: { id: number; name: string; code?: string } | null,
    sp: { id: number; name: string; code?: string } | null,
    owner?: { id: number; name: string; type: "Director" | "BDE"; value: string } | null
  ) => {
    const updates: Partial<SalesAssignmentFormValues> = {
      // 1. Director
      directorId: dir ? dir.id : "",
      directorName: dir ? dir.name : "",
      directorCode: dir ? dir.code || "" : "",

      // 2. BDE User
      bdeUserId: bde ? bde.id : "",
      bdeUserName: bde ? bde.name : "",

      // 3. Sales Person (Coordinator)
      salesCoordinatorId: sp ? sp.id : "",
      salesCoordinatorName: sp ? sp.name : "",

      // Backward compatibility fields
      employeeId: sp ? sp.id : bde ? bde.id : dir ? dir.id : "",
      employeeName: sp ? sp.name : bde ? bde.name : dir ? dir.name : "",
      employeeCode: sp ? sp.code || "" : bde ? bde.code || "" : dir ? dir.code || "" : "",
      role: sp ? "Sales Person" : bde ? "BDE User" : dir ? "Director" : "",
      reportingToId: sp && bde ? bde.id : bde && dir ? dir.id : "",
      reportingToName: sp && bde ? bde.name : bde && dir ? dir.name : "",

      // Customer Owner: selected from chosen Director or BDE User
      customerOwnerId: owner ? owner.id : "",
      customerOwnerName: owner ? owner.name : "",
      customerOwnerType: owner ? owner.type : "",
      customerOwnerValue: owner ? owner.value : "",
    };

    handleValuesUpdate(updates);
  };

  // Helper to load BDE Users strictly assigned to a given Director ID
  const loadBdesForDirector = async (
    dirId: number,
    currentBdes: DynamicBdeUser[],
    _currentEmps: DynamicEmployee[]
  ) => {
    if (!dirId) {
      setFilteredBdes([]);
      return;
    }
    setIsLoadingBdes(true);
    try {
      // 1. Fetch from real backend API (/api/bdeuser/by-director/{dirId})
      const apiBdes = await getBdeUsersByDirectorId(dirId);

      // 2. Filter local dynamic BDE users by directorId
      const localMatches = currentBdes.filter((b) => b.directorId === dirId);

      // Combine unique BDE users strictly mapped to this Director in the database
      const combined: BdeUserOption[] = [...apiBdes];
      localMatches.forEach((item) => {
        if (!combined.some((b) => b.id === item.id)) {
          combined.push({
            id: item.id,
            name: item.name,
            value: item.name,
            code: item.code || "",
            directorId: dirId,
            isActive: true,
          });
        }
      });

      // Strictly set only the database-mapped BDE users
      setFilteredBdes(combined);
    } catch {
      const localMatches = currentBdes.filter((b) => b.directorId === dirId);
      setFilteredBdes(
        localMatches.map((item) => ({
          id: item.id,
          name: item.name,
          value: item.name,
          code: item.code || "",
          directorId: dirId,
          isActive: true,
        }))
      );
    } finally {
      setIsLoadingBdes(false);
    }
  };

  // Helper to load Sales Persons strictly assigned to a given BDE ID
  const loadSalesPersonsForBde = async (
    bdeId: number,
    currentScs: SalesCoordinatorItem[],
    _currentEmps: DynamicEmployee[]
  ) => {
    if (!bdeId) {
      setFilteredSalesPersons([]);
      return;
    }
    setIsLoadingSalesPersons(true);
    try {
      // 1. Fetch from real backend API (/api/sales-coordinator/by-bde/{bdeId})
      const apiScs = await getSalesCoordinatorsByBdeId(bdeId);

      // 2. Filter local dynamic Sales Coordinators by bdeUserId
      const localMatches = currentScs.filter((s) => s.bdeUserId === bdeId);

      // Combine unique Sales Persons strictly mapped to this BDE User in the database
      const combined: SalesCoordinatorOption[] = [...apiScs];
      localMatches.forEach((item) => {
        if (!combined.some((s) => s.salesCoordinatorId === item.salesCoordinatorId)) {
          combined.push({
            salesCoordinatorId: item.salesCoordinatorId,
            salesCoordinatorName: item.salesCoordinatorName,
            salesCoordinatorCode: item.salesCoordinatorCode || "",
            bdeUserId: bdeId,
            isActive: item.isActive !== false,
          });
        }
      });

      // Strictly set only the database-mapped Sales Persons
      setFilteredSalesPersons(combined);
    } catch {
      const localMatches = currentScs.filter((s) => s.bdeUserId === bdeId);
      setFilteredSalesPersons(
        localMatches.map((item) => ({
          salesCoordinatorId: item.salesCoordinatorId,
          salesCoordinatorName: item.salesCoordinatorName,
          salesCoordinatorCode: item.salesCoordinatorCode || "",
          bdeUserId: bdeId,
          isActive: item.isActive !== false,
        }))
      );
    } finally {
      setIsLoadingSalesPersons(false);
    }
  };

  // Fetch real dynamic master data from APIs
  useEffect(() => {
    let isMounted = true;
    const loadDynamicData = async () => {
      setIsLoadingDynamicData(true);
      try {
        const [empData, dirData, bdeData, levelsData, scData] = await Promise.allSettled([
          getEmployees(),
          getDirectors(),
          getBdeUsers(),
          getLevels(),
          getSalesCoordinators(),
        ]);

        if (!isMounted) return;

        // Populate Levels from backend API
        if (
          levelsData.status === "fulfilled" &&
          Array.isArray(levelsData.value)
        ) {
          setLevels(levelsData.value);
        } else {
          setLevels([]);
        }

        let loadedEmps: DynamicEmployee[] = [];
        if (empData.status === "fulfilled" && Array.isArray(empData.value)) {
          loadedEmps = (empData.value as EmployeeSelectItem[]).map((e: EmployeeSelectItem) => ({
            id: Number(e.id || 0),
            name:
              e.fullName ||
              `${e.firstName || ""} ${e.lastName || ""}`.trim() ||
              (e.id ? `Employee #${e.id}` : ""),
            code: e.employeeCode || "",
            role: e.role || e.designation || e.levelName || "",
            reportingTo: Number(e.reportingTo || 0) || undefined,
            reportingToName: e.reportingToName || undefined,
          }));
          setEmployees(loadedEmps);
        }

        // 1. Process Directors: Exclusively from Employee table
        let loadedDirs: DynamicDirector[] = [];
        if (dirData.status === "fulfilled" && Array.isArray(dirData.value) && dirData.value.length > 0) {
          loadedDirs = (dirData.value as DirectorItem[]).map((d: DirectorItem) => ({
            id: Number(d.directorId || 0),
            name: d.directorName || `Director #${d.directorId}`,
            code: d.directorCode || "",
          }));
        } else {
          // Extract employees tagged with Director designation/role/LevelId=1 from Employee table
          loadedDirs = loadedEmps
            .filter((e: DynamicEmployee) => {
              const r = (e.role || "").toLowerCase();
              return r.includes("director");
            })
            .map((e: DynamicEmployee) => ({
              id: e.id,
              name: e.name,
              code: e.code,
            }));
        }
        setDirectors(loadedDirs);

        // 2. Process BDE Users
        let loadedBdes: DynamicBdeUser[] = [];
        if (bdeData.status === "fulfilled" && Array.isArray(bdeData.value)) {
          loadedBdes = (bdeData.value as BdeUserItem[]).map((b: BdeUserItem) => {
            const id = Number(b.id || 0);
            let rawName = b.value || "";
            const code = b.code || "";
            const directorId = Number(
              b.directorEmployeeId || b.directorId || 0
            );
            const directorName = b.directorName || "";

            if (!rawName) {
              const matchedEmp = loadedEmps.find(
                (e) => e.id === id || (code && e.code === code)
              );
              if (matchedEmp) {
                rawName = matchedEmp.name;
              } else {
                rawName = id ? `BDE User #${id}` : "BDE User";
              }
            }

            return {
              id,
              name: rawName,
              code,
              directorId,
              directorName,
            };
          });
        }
        loadedEmps.forEach((e) => {
          const r = (e.role || "").toLowerCase();
          const c = (e.code || "").toLowerCase();
          if (
            (r.includes("bde") || c.includes("bde")) &&
            !loadedBdes.some((b) => b.id === e.id)
          ) {
            loadedBdes.push({
              id: e.id,
              name: e.name,
              code: e.code,
              directorId: e.reportingTo || 0,
              directorName: e.reportingToName || "",
            });
          }
        });
        // Match any BDEs whose directorId is 0 against employee reporting
        loadedBdes = loadedBdes.map((b) => {
          if (!b.directorId) {
            const matchedEmp = loadedEmps.find((e) => e.id === b.id);
            if (matchedEmp && matchedEmp.reportingTo) {
              return {
                ...b,
                directorId: matchedEmp.reportingTo,
                directorName: b.directorName || matchedEmp.reportingToName || "",
              };
            }
          }
          return b;
        });
        setBdeUsers(loadedBdes);

        // 3. Process Sales Coordinators
        let loadedScs: SalesCoordinatorItem[] = [];
        if (scData.status === "fulfilled" && Array.isArray(scData.value)) {
          loadedScs = scData.value;
        }
        loadedEmps.forEach((e) => {
          const r = (e.role || "").toLowerCase();
          const c = (e.code || "").toLowerCase();
          if (
            (r.includes("sales") || r.includes("coord") || c.includes("sc")) &&
            !loadedScs.some((s) => s.salesCoordinatorId === e.id)
          ) {
            loadedScs.push({
              salesCoordinatorId: e.id,
              salesCoordinatorName: e.name,
              salesCoordinatorCode: e.code,
              bdeUserId: e.reportingTo || null,
              bdeUserName: e.reportingToName || null,
              isActive: true,
            });
          }
        });
        loadedScs = loadedScs.map((sc) => {
          if (!sc.bdeUserId) {
            const matchedEmp = loadedEmps.find((e) => e.id === sc.salesCoordinatorId);
            if (matchedEmp && matchedEmp.reportingTo) {
              return {
                ...sc,
                bdeUserId: matchedEmp.reportingTo,
                bdeUserName: sc.bdeUserName || matchedEmp.reportingToName || null,
              };
            }
          }
          return sc;
        });
        setAllSalesCoordinators(loadedScs);

        // Derive active database hierarchy assignments directly from loaded records
        const dbAssignments: AssignmentRecord[] = [];
        loadedScs.forEach((sc) => {
          if (sc.bdeUserId) {
            const bde = loadedBdes.find((b) => b.id === sc.bdeUserId);
            const dir = bde?.directorId ? loadedDirs.find((d) => d.id === bde.directorId) : null;
            dbAssignments.push({
              id: `sc-${sc.salesCoordinatorId}`,
              employeeId: sc.salesCoordinatorId,
              employeeName: sc.salesCoordinatorName,
              employeeCode: sc.salesCoordinatorCode || "",
              role: "Sales Person",
              reportingToId: sc.bdeUserId,
              reportingToName: bde?.name || `BDE #${sc.bdeUserId}`,
              reportingToRole: "BDE User",
              directorId: dir?.id || bde?.directorId || null,
              directorName: dir?.name || null,
              directorCode: dir?.code || null,
              bdeUserId: sc.bdeUserId,
              bdeUserName: bde?.name || null,
              salesCoordinatorId: sc.salesCoordinatorId,
              salesCoordinatorName: sc.salesCoordinatorName,
              assignedDate: new Date().toISOString().split("T")[0],
              status: "Active",
            });
          }
        });
        loadedBdes.forEach((bde) => {
          if (bde.directorId) {
            const dir = loadedDirs.find((d) => d.id === bde.directorId);
            dbAssignments.push({
              id: `bde-${bde.id}`,
              employeeId: bde.id,
              employeeName: bde.name,
              employeeCode: bde.code || "",
              role: "BDE User",
              reportingToId: bde.directorId,
              reportingToName: dir?.name || `Director #${bde.directorId}`,
              reportingToRole: "Director",
              directorId: bde.directorId,
              directorName: dir?.name || null,
              directorCode: dir?.code || null,
              bdeUserId: bde.id,
              bdeUserName: bde.name,
              salesCoordinatorId: null,
              salesCoordinatorName: null,
              assignedDate: new Date().toISOString().split("T")[0],
              status: "Active",
            });
          }
        });
        setAssignments(dbAssignments);
        const initialDirId = Number(values.directorId || (values.role === "Director" ? values.employeeId : 0) || 0);
        const initialBdeId = Number(values.bdeUserId || (values.role === "BDE User" ? values.employeeId : 0) || 0);
        if (initialDirId) {
          loadBdesForDirector(initialDirId, loadedBdes, loadedEmps);
        }
        if (initialBdeId) {
          loadSalesPersonsForBde(initialBdeId, loadedScs, loadedEmps);
        }
      } catch (err) {
        console.error("Error loading sales assignment master data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingDynamicData(false);
          setIsLoadingLevels(false);
        }
      }
    };

    loadDynamicData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state if external values change (e.g., editing customer)
  useEffect(() => {
    if (propValues) {
      if (propValues.directorId) {
        const dirId = Number(propValues.directorId);
        setSelectedDirectorId(dirId);
        if (bdeUsers.length > 0 || employees.length > 0) {
          loadBdesForDirector(dirId, bdeUsers, employees);
        }
      }
      if (propValues.bdeUserId) {
        const bdeId = Number(propValues.bdeUserId);
        setSelectedBdeId(bdeId);
        if (allSalesCoordinators.length > 0 || employees.length > 0) {
          loadSalesPersonsForBde(bdeId, allSalesCoordinators, employees);
        }
      }
      if (propValues.salesCoordinatorId) {
        setSelectedSalesPersonId(Number(propValues.salesCoordinatorId));
      }
      if (propValues.customerOwnerValue) {
        setSelectedOwnerValue(propValues.customerOwnerValue);
      } else if (propValues.customerOwnerType && propValues.customerOwnerId) {
        setSelectedOwnerValue(`${propValues?.customerOwnerType}:${propValues?.customerOwnerId}`);
      } else if (propValues.customerOwnerId && propValues.bdeUserId && Number(propValues.customerOwnerId) === Number(propValues.bdeUserId)) {
        setSelectedOwnerValue(`BDE:${propValues.bdeUserId}`);
      } else if (propValues.customerOwnerId && propValues.directorId && Number(propValues.customerOwnerId) === Number(propValues.directorId)) {
        setSelectedOwnerValue(`Director:${propValues.directorId}`);
      } else if (propValues.customerOwnerName && propValues.bdeUserName && propValues.customerOwnerName.trim().toLowerCase() === propValues.bdeUserName.trim().toLowerCase()) {
        setSelectedOwnerValue(`BDE:${propValues.bdeUserId || propValues.customerOwnerId}`);
      } else if (propValues.customerOwnerName && propValues.directorName && propValues.customerOwnerName.trim().toLowerCase() === propValues.directorName.trim().toLowerCase()) {
        setSelectedOwnerValue(`Director:${propValues.directorId || propValues.customerOwnerId}`);
      } if (false) {
        setSelectedOwnerValue(`${propValues?.customerOwnerType}:${propValues?.customerOwnerId}`);
      }
    }
  }, [
    propValues?.directorId,
    propValues?.bdeUserId,
    propValues?.salesCoordinatorId,
    propValues?.customerOwnerValue,
    propValues?.customerOwnerType,
    propValues?.customerOwnerId,
  ]);

  // Selected Director Object
  const selectedDirectorObj = useMemo(() => {
    if (!selectedDirectorId) return null;
    return (
      directors.find((d) => d.id === selectedDirectorId) ||
      employees.find((e) => e.id === selectedDirectorId) ||
      (values.directorId && Number(values.directorId) === selectedDirectorId ? { id: selectedDirectorId, name: values.directorName || "", code: values.directorCode || "" } : null) ||
      null
    );
  }, [selectedDirectorId, directors, employees, values.directorId, values.directorName, values.directorCode]);

  // Selected BDE Object
  const selectedBdeObj = useMemo(() => {
    if (!selectedBdeId) return null;
    return (
      filteredBdes.find((b) => b.id === selectedBdeId) ||
      bdeUsers.find((b) => b.id === selectedBdeId) ||
      employees.find((e) => e.id === selectedBdeId) ||
      (values.bdeUserId && Number(values.bdeUserId) === selectedBdeId ? { id: selectedBdeId, name: values.bdeUserName || "", code: (values as any).bdeUserCode || (values as any).bdeCode || "" } : null) ||
      null
    );
  }, [selectedBdeId, filteredBdes, bdeUsers, employees, values.bdeUserId, values.bdeUserName]);

  // Customer Owner dropdown options: Contains ONLY the selected Director and BDE User
  const customerOwnerOptions = useMemo(() => {
    if (!selectedSalesPersonId) return [];
    const list: Array<{
      value: string;
      label: string;
      id: number;
      name: string;
      type: "Director" | "BDE";
    }> = [];

    if (selectedDirectorObj) {
      list.push({
        value: `Director:${selectedDirectorObj.id}`,
        label: `${formatEmployeeDisplay(selectedDirectorObj.name, selectedDirectorObj.code)} (Director)`,
        id: selectedDirectorObj.id,
        name: selectedDirectorObj.name,
        type: "Director",
      });
    }

    if (selectedBdeObj) {
      list.push({
        value: `BDE:${selectedBdeObj.id}`,
        label: `${formatEmployeeDisplay(selectedBdeObj.name, selectedBdeObj.code)} (BDE User)`,
        id: selectedBdeObj.id,
        name: selectedBdeObj.name,
        type: "BDE",
      });
    }

    return list;
  }, [selectedSalesPersonId, selectedDirectorObj, selectedBdeObj]);

  // 1. Handle Director Change: populates BDE Users under this Director
  const handleDirectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dirId = e.target.value ? Number(e.target.value) : "";
    setSelectedDirectorId(dirId);
    setSelectedBdeId("");
    setSelectedSalesPersonId("");
    setSelectedOwnerValue("");
    setValidationErrors((prev) => ({
      ...prev,
      directorId: undefined,
      bdeUserId: undefined,
      salesCoordinatorId: undefined,
      customerOwnerId: undefined,
    }));

    const dir = dirId
      ? directors.find((d) => d.id === dirId) ||
      employees.find((e) => e.id === dirId) ||
      null
      : null;

    syncCascadingToParent(dir, null, null, null);

    if (dirId) {
      loadBdesForDirector(dirId, bdeUsers, employees);
    } else {
      setFilteredBdes([]);
      setFilteredSalesPersons([]);
    }
  };

  // 2. Handle BDE Change: populates Sales Persons under this BDE User
  const handleBdeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bdeId = e.target.value ? Number(e.target.value) : "";
    setSelectedBdeId(bdeId);
    setSelectedSalesPersonId("");
    setSelectedOwnerValue("");
    setValidationErrors((prev) => ({
      ...prev,
      bdeUserId: undefined,
      salesCoordinatorId: undefined,
      customerOwnerId: undefined,
    }));

    const dir = selectedDirectorObj;
    const bde = bdeId
      ? filteredBdes.find((b) => b.id === bdeId) ||
      bdeUsers.find((b) => b.id === bdeId) ||
      employees.find((e) => e.id === bdeId) ||
      null
      : null;

    syncCascadingToParent(dir, bde, null, null);

    if (bdeId) {
      loadSalesPersonsForBde(bdeId, allSalesCoordinators, employees);
    } else {
      setFilteredSalesPersons([]);
    }
  };

  // 3. Handle Sales Person Change: brings up Customer Owner column
  const handleSalesPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const spId = e.target.value ? Number(e.target.value) : "";
    setSelectedSalesPersonId(spId);
    setSelectedOwnerValue("");
    setValidationErrors((prev) => ({
      ...prev,
      salesCoordinatorId: undefined,
      customerOwnerId: undefined,
    }));

    const dir = selectedDirectorObj;
    const bde = selectedBdeObj;
    const sp = spId
      ? filteredSalesPersons.find((s) => s.salesCoordinatorId === spId) ||
      allSalesCoordinators.find((s) => s.salesCoordinatorId === spId) ||
      null
      : null;

    syncCascadingToParent(
      dir,
      bde,
      sp
        ? {
          id: sp.salesCoordinatorId,
          name: (sp as any).salesCoordinatorName || (sp as any).name,
          code: (sp as any).salesCoordinatorCode || (sp as any).code,
        }
        : null,
      null
    );
  };

  // 4. Handle Customer Owner Change: user selects Director or BDE as Customer Owner
  const handleCustomerOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedOwnerValue(val);
    setValidationErrors((prev) => ({ ...prev, customerOwnerId: undefined }));

    const dir = selectedDirectorObj;
    const bde = selectedBdeObj;
    const sp = selectedSalesPersonId
      ? filteredSalesPersons.find((s) => s.salesCoordinatorId === selectedSalesPersonId) ||
      allSalesCoordinators.find((s) => s.salesCoordinatorId === selectedSalesPersonId) ||
      null
      : null;

    if (!val) {
      syncCascadingToParent(
        dir,
        bde,
        sp
          ? {
            id: sp.salesCoordinatorId,
            name: (sp as any).salesCoordinatorName || (sp as any).name,
            code: (sp as any).salesCoordinatorCode || (sp as any).code,
          }
          : null,
        null
      );
      return;
    }

    const matchedOption = customerOwnerOptions.find((opt) => opt.value === val);
    syncCascadingToParent(
      dir,
      bde,
      sp
        ? {
          id: sp.salesCoordinatorId,
          name: (sp as any).salesCoordinatorName || (sp as any).name,
          code: (sp as any).salesCoordinatorCode || (sp as any).code,
        }
        : null,
      matchedOption
        ? {
          id: matchedOption.id,
          name: matchedOption.name,
          type: matchedOption.type,
          value: matchedOption.value,
        }
        : null
    );
  };

  // Reset Assignment Form
  const handleReset = () => {
    setSelectedDirectorId("");
    setSelectedBdeId("");
    setSelectedSalesPersonId("");
    setSelectedOwnerValue("");
    setFilteredBdes([]);
    setFilteredSalesPersons([]);
    setValidationErrors({});
    syncCascadingToParent(null, null, null, null);
  };

  // Standalone mode Save Assignment
  const handleSaveAssignment = async () => {
    const errors: { directorId?: string; bdeUserId?: string; salesCoordinatorId?: string } = {};

    if (!selectedDirectorId) {
      errors.directorId = "Please select a Director.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Please fill in all required fields.");
      return;
    }

    const dir =
      directors.find((d) => d.id === selectedDirectorId) ||
      employees.find((e) => e.id === selectedDirectorId);
    const bde =
      filteredBdes.find((b) => b.id === selectedBdeId) ||
      bdeUsers.find((b) => b.id === selectedBdeId);
    const sp =
      filteredSalesPersons.find((s) => s.salesCoordinatorId === selectedSalesPersonId) ||
      allSalesCoordinators.find((s) => s.salesCoordinatorId === selectedSalesPersonId);

    const chosenPerson = sp || bde || dir;
    if (!chosenPerson) return;

    const newAssignment: AssignmentRecord = {
      id: `asg-${Date.now()}`,
      employeeId:
        (chosenPerson as any).salesCoordinatorId ||
        (chosenPerson as any).id ||
        Number(selectedDirectorId),
      employeeName:
        (chosenPerson as any).salesCoordinatorName ||
        (chosenPerson as any).name ||
        dir?.name ||
        "",
      employeeCode:
        (chosenPerson as any).salesCoordinatorCode ||
        (chosenPerson as any).code ||
        dir?.code ||
        "",
      role: sp ? "Sales Person" : bde ? "BDE User" : "Director",
      reportingToId: sp && bde ? bde.id : bde && dir ? dir.id : null,
      reportingToName: sp && bde ? bde.name : bde && dir ? dir.name : null,
      reportingToRole: sp ? "BDE User" : bde ? "Director" : null,
      directorId: selectedDirectorId ? Number(selectedDirectorId) : null,
      directorName: dir ? dir.name : null,
      directorCode: dir ? dir.code || null : null,
      bdeUserId: selectedBdeId ? Number(selectedBdeId) : null,
      bdeUserName: bde ? bde.name : null,
      salesCoordinatorId: selectedSalesPersonId ? Number(selectedSalesPersonId) : null,
      salesCoordinatorName: sp ? (sp as any).salesCoordinatorName || (sp as any).name : null,
      assignedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setAssignments((prev) => {
      const filtered = prev.filter(
        (a) =>
          !(
            a.directorId === newAssignment.directorId &&
            a.bdeUserId === newAssignment.bdeUserId &&
            a.salesCoordinatorId === newAssignment.salesCoordinatorId
          )
      );
      const updated = [newAssignment, ...filtered];
      return updated;
    });

    try {
      if (selectedBdeId && selectedDirectorId) {
        await apiClient.put(`${API_ENDPOINTS.BdeUsers}/${selectedBdeId}`, {
          directorEmployeeId: Number(selectedDirectorId),
          value: bde?.name || "",
          code: bde?.code || "",
          isActive: true,
        });
        setEmployeeReporting(Number(selectedBdeId), Number(selectedDirectorId)).catch(() => { });
      }
      if (selectedSalesPersonId && selectedBdeId) {
        await apiClient.put(
          `${API_ENDPOINTS.SalesCoordinator || `${API_ENDPOINTS.BaseUrl}/sales-coordinator`}/${selectedSalesPersonId}`,
          {
            bdeUserId: Number(selectedBdeId),
            salesCoordinatorName: (sp as any)?.salesCoordinatorName || (sp as any)?.name || "",
            salesCoordinatorCode: (sp as any)?.salesCoordinatorCode || (sp as any)?.code || "",
            isActive: true,
          }
        );
        setEmployeeReporting(Number(selectedSalesPersonId), Number(selectedBdeId)).catch(() => { });
      }
      toast.success(`Hierarchy assignment saved to database successfully.`);
    } catch (saveErr) {
      console.warn("Hierarchy assignment saved locally, backend warning:", saveErr);
      toast.success(`Hierarchy assignment saved successfully.`);
    }

    syncCascadingToParent(
      dir || null,
      bde || null,
      sp
        ? {
          id: sp.salesCoordinatorId,
          name: (sp as any).salesCoordinatorName || (sp as any).name,
          code: (sp as any).salesCoordinatorCode || (sp as any).code,
        }
        : null
    );
  };

  // Standalone mode: Delete Assignment
  const handleDeleteAssignment = async (assignmentId: string, employeeName: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (asg) {
      try {
        if (asg.id.startsWith("bde-") || asg.role === "BDE User") {
          await apiClient.put(`${API_ENDPOINTS.BdeUsers}/${asg.employeeId}`, {
            directorEmployeeId: null,
            value: asg.employeeName,
            code: asg.employeeCode,
            isActive: true,
          });
        } else if (asg.id.startsWith("sc-") || asg.role === "Sales Person") {
          await apiClient.put(
            `${API_ENDPOINTS.SalesCoordinator || `${API_ENDPOINTS.BaseUrl}/sales-coordinator`}/${asg.employeeId}`,
            {
              bdeUserId: null,
              salesCoordinatorName: asg.employeeName,
              salesCoordinatorCode: asg.employeeCode,
              isActive: true,
            }
          );
        }
      } catch (err) {
        console.warn("Could not unmap assignment in database:", err);
      }
    }
    setAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== assignmentId);
      return updated;
    });
    toast.success(`Assignment for ${employeeName} removed.`);
  };

  // Standalone mode: Edit Assignment in Form
  const handleSelectAssignment = (asg: AssignmentRecord) => {
    const dirId = asg.directorId || (asg.role === "Director" ? asg.employeeId : "");
    const bdeId = asg.bdeUserId || (asg.role === "BDE User" ? asg.employeeId : "");
    const spId = asg.salesCoordinatorId || (asg.role === "Sales Person" ? asg.employeeId : "");

    setSelectedDirectorId(dirId);
    setSelectedBdeId(bdeId);
    setSelectedSalesPersonId(spId);
    setActiveSubTab("reporting");

    if (dirId) {
      loadBdesForDirector(Number(dirId), bdeUsers, employees);
    }
    if (bdeId) {
      loadSalesPersonsForBde(Number(bdeId), allSalesCoordinators, employees);
    }

    const dir = dirId ? directors.find((d) => d.id === Number(dirId)) || null : null;
    const bde = bdeId ? bdeUsers.find((b) => b.id === Number(bdeId)) || null : null;
    const sp = spId
      ? allSalesCoordinators.find((s) => s.salesCoordinatorId === Number(spId)) || null
      : null;

    syncCascadingToParent(
      dir,
      bde,
      sp
        ? {
          id: sp.salesCoordinatorId,
          name: sp.salesCoordinatorName,
          code: sp.salesCoordinatorCode,
        }
        : null
    );
    toast.info(`Loaded assignment details.`);
  };

  // Options for BDE dropdown:
  // Strictly filter by selected Director in customer form mode
  const bdeDisplayOptions = useMemo(() => {
    if (standalone) {
      if (selectedDirectorId) {
        if (filteredBdes.length > 0) return filteredBdes;
        const matched = bdeUsers.filter((b) => b.directorId === Number(selectedDirectorId));
        if (matched.length > 0) return matched;
      }
      return bdeUsers.length > 0 ? bdeUsers : filteredBdes;
    }

    // In Customer Form: strict cascade (only show BDEs belonging to selected Director)
    if (!selectedDirectorId) return [];
    if (filteredBdes.length > 0) return filteredBdes;
    return bdeUsers.filter((b) => b.directorId === Number(selectedDirectorId));
  }, [standalone, selectedDirectorId, filteredBdes, bdeUsers]);

  // Options for Sales Person dropdown:
  // Strictly filter by selected BDE User in customer form mode
  const salesPersonDisplayOptions = useMemo(() => {
    if (standalone) {
      if (selectedBdeId) {
        if (filteredSalesPersons.length > 0) {
          return filteredSalesPersons;
        }
        const matched = allSalesCoordinators.filter(
          (s) => s.bdeUserId === Number(selectedBdeId)
        );
        if (matched.length > 0) {
          return matched.map((s) => ({
            salesCoordinatorId: s.salesCoordinatorId,
            salesCoordinatorName: s.salesCoordinatorName,
            salesCoordinatorCode: s.salesCoordinatorCode || "",
            bdeUserId: s.bdeUserId || Number(selectedBdeId),
            isActive: s.isActive !== false,
          }));
        }
      }
      return allSalesCoordinators.map((s) => ({
        salesCoordinatorId: s.salesCoordinatorId,
        salesCoordinatorName: s.salesCoordinatorName,
        salesCoordinatorCode: s.salesCoordinatorCode || "",
        bdeUserId: s.bdeUserId || 0,
        isActive: s.isActive !== false,
      }));
    }

    // In Customer Form: strict cascade (only show Sales Persons belonging to selected BDE)
    if (!selectedBdeId) return [];
    if (filteredSalesPersons.length > 0) return filteredSalesPersons;
    const matched = allSalesCoordinators.filter(
      (s) => s.bdeUserId === Number(selectedBdeId)
    );
    return matched.map((s) => ({
      salesCoordinatorId: s.salesCoordinatorId,
      salesCoordinatorName: s.salesCoordinatorName,
      salesCoordinatorCode: s.salesCoordinatorCode || "",
      bdeUserId: s.bdeUserId || Number(selectedBdeId),
      isActive: s.isActive !== false,
    }));
  }, [standalone, selectedBdeId, filteredSalesPersons, allSalesCoordinators]);

  // Helper label for Sales Person option: shows BDE hint when not already filtered
  const getSalesPersonOptionLabel = (sp: {
    salesCoordinatorId: number;
    salesCoordinatorName: string;
    salesCoordinatorCode?: string;
    bdeUserId?: number | null;
  }) => {
    const base = formatEmployeeDisplay(sp.salesCoordinatorName, sp.salesCoordinatorCode);
    if (!selectedBdeId && sp.bdeUserId) {
      const bde = bdeUsers.find((b) => b.id === sp.bdeUserId) || employees.find((e) => e.id === sp.bdeUserId);
      if (bde) {
        return `${base} (BDE: ${bde.name})`;
      }
    }
    return base;
  };

  // Level Modal Handlers
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

  const handleDeleteLevel = async (id: number, levelName: string) => {
    try {
      await deleteLevel(id);
      setLevels((prev) => prev.filter((l) => l.id !== id));
      toast.success(`Level "${levelName}" deleted successfully.`);
    } catch (err) {
      console.error("Error deleting level:", err);
      toast.error(`Failed to delete level "${levelName}".`);
    }
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormData.levelName.trim()) {
      toast.error("Please enter a level name.");
      return;
    }

    const orderNum = Number(levelFormData.levelOrder) || levels.length + 1;
    setIsSavingLevel(true);

    try {
      if (editingLevelId) {
        await updateLevel(editingLevelId, {
          levelName: levelFormData.levelName.trim(),
          levelOrder: orderNum,
          isActive: levelFormData.isActive,
        });
        setLevels((prev) =>
          prev.map((lvl) =>
            lvl.id === editingLevelId
              ? {
                ...lvl,
                levelName: levelFormData.levelName.trim(),
                levelOrder: orderNum,
                isActive: levelFormData.isActive,
              }
              : lvl
          )
        );
        toast.success("Level updated successfully.");
      } else {
        const created = await createLevel({
          levelName: levelFormData.levelName.trim(),
          levelOrder: orderNum,
          isActive: levelFormData.isActive,
        });
        setLevels((prev) => [...prev, created]);
        toast.success("Level created successfully.");
      }
      setIsLevelModalOpen(false);
    } catch (err) {
      console.error("Error saving level:", err);
      toast.error("Failed to save level. Please try again.");
    } finally {
      setIsSavingLevel(false);
    }
  };

  // Filtered levels for search
  const filteredLevels = useMemo(() => {
    if (!levelSearchText.trim()) return levels;
    return levels.filter((lvl) =>
      lvl.levelName.toLowerCase().includes(levelSearchText.toLowerCase())
    );
  }, [levels, levelSearchText]);

  // Filtered assignments for search
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSearch =
        asg.employeeName.toLowerCase().includes(assignmentSearchText.toLowerCase()) ||
        asg.employeeCode.toLowerCase().includes(assignmentSearchText.toLowerCase());

      const matchesRole =
        assignmentRoleFilter === "All" || asg.role === assignmentRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [assignments, assignmentSearchText, assignmentRoleFilter]);

  return (
    <div
      className={
        standalone
          ? "bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          : "space-y-4"
      }
    >
      {/* 1. Header (Rendered on standalone page matching user reference images) */}
      {(!hideHeader || standalone) && (
        <div className="p-5 md:p-6 pb-0 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 bg-blue-50 border border-blue-200 text-[#154068] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight font-serif">
                  Hierarchy Management
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Manage organization hierarchy levels and reporting structure.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Levels | Reporting To */}
          <div className="flex items-center gap-2 pt-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSubTab("levels")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeSubTab === "levels"
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
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeSubTab === "reporting"
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

      {/* 2. TAB CONTENT: REPORTING TO */}
      {activeSubTab === "reporting" && (
        <div className={standalone ? "p-5 md:p-6 space-y-6" : "space-y-4"}>
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-xs space-y-6">
            {/* Dynamic Grid: 4 columns if Sales Person is selected, otherwise 3 columns */}
            <div
              className={`grid grid-cols-1 ${selectedSalesPersonId ? "md:grid-cols-4" : "md:grid-cols-3"
                } gap-5 transition-all duration-200`}
            >
              {/* FIELD 1: Select Director */}
              <div>
                <label
                  htmlFor="role_assignment_director_select"
                  className="text-xs font-semibold text-gray-700 block mb-1.5"
                >
                  Select Director <span className="text-red-500">*</span>
                </label>
                <select
                  id="role_assignment_director_select"
                  value={selectedDirectorId}
                  onChange={handleDirectorChange}
                  disabled={disabled || isLoadingDynamicData}
                  className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 cursor-pointer shadow-xs ${validationErrors.directorId || propErrors.directorId
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                    } ${disabled || isLoadingDynamicData ? "opacity-60 bg-gray-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {isLoadingDynamicData ? "Loading directors..." : "-- Select Director --"}
                  </option>
                  {(directors.length > 0
                    ? directors
                    : employees.filter((e) => (e.role || "").toLowerCase().includes("director"))
                  ).map((dir) => (
                    <option key={dir.id} value={dir.id}>
                      {formatEmployeeDisplay(dir.name, dir.code)}
                    </option>
                  ))}
                </select>
                {validationErrors.directorId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.directorId}
                  </p>
                )}
              </div>

              {/* FIELD 2: Select BDE User (Cascade from Director) */}
              <div>
                <label
                  htmlFor="role_assignment_bde_select"
                  className="text-xs font-semibold text-gray-700 block mb-1.5"
                >
                  Select BDE User <span className="text-red-500">*</span>
                </label>
                <select
                  id="role_assignment_bde_select"
                  value={selectedBdeId}
                  onChange={handleBdeChange}
                  disabled={disabled || isLoadingDynamicData || isLoadingBdes || (!standalone && !selectedDirectorId)}
                  className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 shadow-xs ${validationErrors.bdeUserId || propErrors.bdeUserId
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                    } ${disabled || isLoadingDynamicData || isLoadingBdes || (!standalone && !selectedDirectorId)
                      ? "opacity-60 bg-gray-100 cursor-not-allowed text-gray-400"
                      : "cursor-pointer"
                    }`}
                >
                  <option value="">
                    {isLoadingBdes
                      ? "Loading BDE users..."
                      : !selectedDirectorId && !standalone
                        ? "-- Select Director first --"
                        : standalone
                          ? "-- Select BDE User to Assign --"
                          : bdeDisplayOptions.length === 0
                            ? "-- No BDE users available --"
                            : "-- Select BDE User --"}
                  </option>
                  {bdeDisplayOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {formatEmployeeDisplay(b.name, b.code)}
                    </option>
                  ))}
                </select>
                {validationErrors.bdeUserId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.bdeUserId}
                  </p>
                )}
                {!standalone && selectedDirectorId && !isLoadingBdes && filteredBdes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    No BDE users assigned under this Director.
                  </p>
                )}
              </div>

              {/* FIELD 3: Select Sales Person (Cascade from BDE User) */}
              <div>
                <label
                  htmlFor="role_assignment_sales_person_select"
                  className="text-xs font-semibold text-gray-700 block mb-1.5"
                >
                  Select Sales Person
                </label>
                <select
                  id="role_assignment_sales_person_select"
                  value={selectedSalesPersonId}
                  onChange={handleSalesPersonChange}
                  disabled={disabled || isLoadingDynamicData || isLoadingSalesPersons || (!standalone && !selectedBdeId)}
                  className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 shadow-xs ${validationErrors.salesCoordinatorId || propErrors.salesCoordinatorId
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                    } ${disabled || isLoadingDynamicData || isLoadingSalesPersons || (!standalone && !selectedBdeId)
                      ? "opacity-60 bg-gray-100 cursor-not-allowed text-gray-400"
                      : "cursor-pointer"
                    }`}
                >
                  <option value="">
                    {isLoadingSalesPersons
                      ? "Loading sales persons..."
                      : !selectedBdeId && !standalone
                        ? "-- Select BDE User first --"
                        : standalone
                          ? "-- Select Sales Person to Assign --"
                          : salesPersonDisplayOptions.length === 0
                            ? "-- No Sales Persons available --"
                            : "-- Select Sales Person --"}
                  </option>
                  {salesPersonDisplayOptions.map((sp) => (
                    <option key={sp.salesCoordinatorId} value={sp.salesCoordinatorId}>
                      {getSalesPersonOptionLabel(sp)}
                    </option>
                  ))}
                </select>
                {validationErrors.salesCoordinatorId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {validationErrors.salesCoordinatorId}
                  </p>
                )}
                {!standalone && selectedBdeId && !isLoadingSalesPersons && filteredSalesPersons.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    No Sales Persons assigned under this BDE.
                  </p>
                )}
              </div>

              {/* FIELD 4: Select Customer Owner (Appears after Sales Person is selected) */}
              {selectedSalesPersonId && (
                <div className="animate-in fade-in duration-200">
                  <label
                    htmlFor="role_assignment_customer_owner_select"
                    className="text-xs font-semibold text-gray-700 block mb-1.5"
                  >
                    Select Customer Owner <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role_assignment_customer_owner_select"
                    value={selectedOwnerValue}
                    onChange={handleCustomerOwnerChange}
                    disabled={disabled}
                    className={`w-full rounded-lg px-3.5 py-2.5 outline-none border text-sm bg-white text-gray-800 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 shadow-xs ${validationErrors.customerOwnerId || propErrors.customerOwnerId
                        ? "border-red-500 ring-1 ring-red-500/20"
                        : "border-gray-300"
                      } ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <option value="">-- Select Customer Owner --</option>
                    {customerOwnerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.customerOwnerId && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {validationErrors.customerOwnerId}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                title="Clear selection"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              {standalone && (
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  disabled={disabled}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>Save Assignment</span>
                </button>
              )}
            </div>
          </div>

          {/* Standalone mode: Active Assignments Table */}
          {standalone && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Active Role Assignments
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search assignment..."
                      value={assignmentSearchText}
                      onChange={(e) => setAssignmentSearchText(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white w-48"
                    />
                  </div>

                  <select
                    value={assignmentRoleFilter}
                    onChange={(e) => setAssignmentRoleFilter(e.target.value)}
                    className="py-1.5 px-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    {ASSIGNMENT_ROLES.map((r) => (
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
                      <th className="py-3 px-4">Director Name</th>
                      <th className="py-3 px-4">BDE User</th>
                      <th className="py-3 px-4">Sales Person</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          {isLoadingDynamicData ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 size={16} className="animate-spin text-blue-600" />
                              <span>Loading assignments...</span>
                            </div>
                          ) : (
                            "No assignments saved yet."
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredAssignments.map((asg, idx) => (
                        <tr
                          key={asg.id}
                          className={`hover:bg-blue-50/40 transition cursor-pointer ${selectedDirectorId === asg.directorId || selectedSalesPersonId === asg.salesCoordinatorId ? "bg-blue-50/70" : ""
                            }`}
                          onClick={() => handleSelectAssignment(asg)}
                        >
                          <td className="py-3 px-4 font-medium text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900">{asg.directorName || (asg.role === "Director" ? asg.employeeName : asg.reportingToRole === "Director" ? asg.reportingToName : "-")}</p>
                            {(asg.directorCode || asg.employeeCode) && (
                              <p className="text-[11px] text-gray-500 font-mono">{asg.directorCode || asg.employeeCode}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-800">{asg.bdeUserName || (asg.role === "BDE User" ? asg.employeeName : asg.reportingToRole === "BDE User" ? asg.reportingToName : "-") || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-800">{asg.salesCoordinatorName || (asg.role === "Sales Person" ? asg.employeeName : "-") || "-"}</p>
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

      {/* 3. TAB CONTENT: LEVELS (Matching User Reference Image 1) */}
      {activeSubTab === "levels" && (
        <div className={standalone ? "p-5 md:p-6 space-y-6" : "space-y-4"}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 font-serif tracking-tight border-b-2 border-[#154068] pb-1 inline-block">
                Listing of Levels
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddLevel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2c4d] hover:bg-[#154068] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
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
                  {isLoadingLevels ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#154068]" />
                          <span className="text-sm font-medium">Loading levels from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLevels.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Layers className="w-8 h-8 text-gray-300" />
                          <p className="text-sm font-medium text-gray-600">No levels found in database.</p>
                          <p className="text-xs text-gray-400">Click &ldquo;+ Add Level&rdquo; above to create organization hierarchy levels.</p>
                        </div>
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
                            className={`font-bold text-xs ${lvl.isActive ? "text-[#16a34a]" : "text-[#dc2626]"
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

      {/* 4. MODAL: Add / Edit Level (Matching User Reference Image 1) */}
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
                  disabled={isSavingLevel}
                  className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSavingLevel ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Level"
                  )}
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
