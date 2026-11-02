import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Save, ChevronDown, ShieldCheck } from "lucide-react";
import { getRoles, type Role } from "../../../Services/MasterDataService";
import {
  getPermissionsByRole,
  updatePermissions,
  type Permission,
} from "./AccessControlService";

const AccessControlManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await getRoles();
        setRoles(allRoles.filter((role) => role.name !== "Admin"));
      } catch {
        toast.error("Failed to fetch roles.");
      }
    };
    fetchRoles();
  }, []);

  const fetchPermissions = useCallback(
    async (roleId: string, systemName: string) => {
      if (!roleId || !systemName) {
        setPermissions([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getPermissionsByRole(roleId, systemName);
        setPermissions(data);
      } catch {
        toast.error("Failed to fetch permissions.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPermissions(selectedRole, selectedSystem);
  }, [selectedRole, selectedSystem, fetchPermissions]);

  const handlePermissionChange = (
    formName: string,
    permissionType: keyof Permission,
    value: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.formName === formName ? { ...p, [permissionType]: value } : p,
      ),
    );
  };

  const handleSelectAll = (formName: string, isChecked: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.formName === formName
          ? {
              ...p,
              canView: isChecked,
              canAdd: isChecked,
              canEdit: isChecked,
              canDelete: isChecked,
            }
          : p,
      ),
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) {
      toast.warning("Please select a role first.");
      return;
    }

    const payloadPermissions = permissions.map((p) => ({
      ...p,
      roleId: selectedRole,
      systemName: selectedSystem,
    }));

    setIsSaving(true);
    try {
      await updatePermissions(selectedRole, selectedSystem, payloadPermissions);
      toast.success("Permissions updated successfully!");
    } catch {
      toast.error("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#e4e8e1] p-4 md:p-6">
      {/* Page Heading */}
      <div className="mb-6">
        <h2 className="border-b-2 border-[#153E63] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#172B4D] inline-block">
          Access Control Management
        </h2>
        <p className="text-slate-600 mt-2 text-sm font-medium">
          Set module-wise permissions for different user roles.
        </p>
      </div>

      {/* Role & System Selection Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            {/* Select Role */}
            <div className="w-full sm:w-72">
              <label
                htmlFor="role-select"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Select Role to Manage
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#153E63] focus:bg-white cursor-pointer shadow-xs"
                >
                  <option value="">-- Select a Role --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            {/* Select System */}
            <div className="w-full sm:w-72">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select System
              </label>
              <div className="relative">
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-[#153E63] focus:bg-white cursor-pointer shadow-xs"
                >
                  <option value="">-- Select System --</option>
                  <option value="RSM">RSM</option>
                  <option value="HRMS">HRMS</option>
                  <option value="VMS">VMS</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || !selectedRole}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#153E63] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(21,62,99,0.18)] transition hover:bg-[#103454] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-[42px]"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-left text-white">
              <tr>
                <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider border-r border-[#e06800]">
                  Form Name
                </th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-center border-r border-[#e06800]">
                  Can View
                </th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-center border-r border-[#e06800]">
                  Can Add
                </th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-center border-r border-[#e06800]">
                  Can Edit
                </th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-center border-r border-[#e06800]">
                  Can Delete
                </th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-center">
                  All
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin inline-block text-[#153E63]" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Loading permissions...
                    </p>
                  </td>
                </tr>
              ) : permissions.length > 0 ? (
                permissions.map((p) => {
                  const allChecked =
                    p.canView && p.canAdd && p.canEdit && p.canDelete;
                  return (
                    <tr
                      key={p.formName}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-semibold text-[#172B4D] border-r border-slate-100">
                        {p.formName}
                      </td>
                      <td className="px-4 py-3.5 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#153E63] cursor-pointer"
                          checked={p.canView}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canView",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#153E63] cursor-pointer"
                          checked={p.canAdd}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canAdd",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#153E63] cursor-pointer"
                          checked={p.canEdit}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canEdit",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#153E63] cursor-pointer"
                          checked={p.canDelete}
                          onChange={(e) =>
                            handlePermissionChange(
                              p.formName,
                              "canDelete",
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#153E63] cursor-pointer"
                          checked={allChecked}
                          onChange={(e) =>
                            handleSelectAll(p.formName, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#172B4D]">
                      {selectedRole
                        ? "No permissions found."
                        : "Please select a Role to view permissions."}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {selectedRole
                        ? "No configured module permissions match this criteria."
                        : "Choose a role and system above to manage view, add, edit, and delete permissions."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessControlManagement;
