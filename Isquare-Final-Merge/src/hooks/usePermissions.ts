import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { type RootState } from "../store";

type Action = "CanView" | "CanAdd" | "CanEdit" | "CanDelete";

export const usePermissions = () => {
  const { permissions, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const systemName = location.pathname.startsWith("/crm")
    ? "CRM"
    : location.pathname.startsWith("/rsm")
    ? "RSM"
    : location.pathname.startsWith("/vms")
    ? "VMS"
    : "HRMS";

  const hasPermission = (formName: string, action: Action): boolean => {
    // Admin bypass: case-insensitive check for Admin / Administrator / SuperAdmin / System Admin
    const roleNormalized = (user?.role || "").trim().toLowerCase();
    if (
      roleNormalized === "admin" ||
      roleNormalized === "administrator" ||
      roleNormalized === "superadmin" ||
      roleNormalized.includes("system admin")
    ) {
      return true;
    }

    // "Dashboard" is always viewable by any authenticated user
    if (formName.toLowerCase() === "dashboard" && action === "CanView") {
      return true;
    }

    // If permissions list is null/empty or not configured for this user/role,
    // default to allowing access so navigation menus, create button, and action buttons are visible.
    if (!permissions || permissions.length === 0) {
      return true;
    }

    // Find permission record (support both camelCase and PascalCase properties safely)
    const permission = permissions.find((p: any) => {
      const pForm = (p?.formName || p?.FormName || "").toString().toLowerCase();
      const pSys = (p?.systemName || p?.SystemName || "").toString().toLowerCase();
      return pForm === formName.toLowerCase() && pSys === systemName.toLowerCase();
    });

    // If no permission record exists for this specific form in the configured permissions,
    // default to allowing access if it's not explicitly restricted.
    if (!permission) {
      return true;
    }

    const camelKey = (action.charAt(0).toLowerCase() + action.slice(1)) as keyof typeof permission;
    const pascalKey = action as keyof typeof permission;

    return Boolean(permission[camelKey] ?? permission[pascalKey]);
  };

  return { hasPermission };
};
