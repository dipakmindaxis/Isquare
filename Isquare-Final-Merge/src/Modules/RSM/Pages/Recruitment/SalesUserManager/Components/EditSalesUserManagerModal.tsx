import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { updateSalesUserManager } from "../Services/SalesUserManagerService";
import type { SalesUserManager } from "../Types/SalesUserManager";

interface EditSalesUserManagerModalProps {
  isOpen: boolean;
  salesUserManager: SalesUserManager | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditSalesUserManagerModal: React.FC<EditSalesUserManagerModalProps> = ({
  isOpen,
  salesUserManager,
  onClose,
  onSuccess,
}) => {
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (salesUserManager) {
      setUserName(salesUserManager.userName);
      setCode(salesUserManager.code);
      setIsActive(salesUserManager.isActive);
    }
  }, [salesUserManager]);

  if (!isOpen || !salesUserManager) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast.error("User name is required.");
      return;
    }

    if (!code.trim()) {
      toast.error("Code is required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateSalesUserManager(salesUserManager.id, {
        id: salesUserManager.id,
        userName: userName.trim(),
        code: code.trim().toUpperCase(),
        isActive,
        isDeleted: salesUserManager.isDeleted,
      });

      toast.success("Sales user manager updated successfully.");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating sales user manager:", error);
      toast.error("Failed to update sales user manager.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Sales User Manager
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label
                htmlFor="editSalesUserName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                User Name
              </label>

              <input
                id="editSalesUserName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="editSalesUserCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Code
              </label>

              <input
                id="editSalesUserCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="editSalesUserActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4"
              />

              <label
                htmlFor="editSalesUserActive"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg bg-gray-500 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#154068] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d3357] disabled:bg-gray-400"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalesUserManagerModal;
