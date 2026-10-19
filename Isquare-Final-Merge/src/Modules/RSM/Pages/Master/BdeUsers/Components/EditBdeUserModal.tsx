import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { updateBdeUser } from "../Services/BdeUserService";
import type { BdeUser } from "../Types/BdeUser";

interface EditBdeUserModalProps {
  isOpen: boolean;
  bdeUser: BdeUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBdeUserModal: React.FC<EditBdeUserModalProps> = ({
  isOpen,
  bdeUser,
  onClose,
  onSuccess,
}) => {
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bdeUser) {
      setValue(bdeUser.value);
      setCode(bdeUser.code);
      setIsActive(bdeUser.isActive);
    }
  }, [bdeUser]);

  if (!isOpen || !bdeUser) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value.trim()) {
      toast.error("Value is required.");
      return;
    }

    if (!code.trim()) {
      toast.error("Code is required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateBdeUser(bdeUser.id, {
        id: bdeUser.id,
        value: value.trim(),
        code: code.trim().toUpperCase(),
        isActive,
        isDeleted: bdeUser.isDeleted,
      });

      toast.success("BDE user updated successfully.");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating BDE user:", error);
      toast.error("Failed to update BDE user.");
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
            Edit BDE User
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
                htmlFor="editBdeUserValue"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Value
              </label>

              <input
                id="editBdeUserValue"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="editBdeUserCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Code
              </label>

              <input
                id="editBdeUserCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="editBdeUserActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer"
              />

              <label
                htmlFor="editBdeUserActive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
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
              className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#FF7900] px-5 py-2 text-sm font-semibold text-white hover:bg-[#E66D00] disabled:bg-gray-400 shadow-sm transition cursor-pointer"
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

export default EditBdeUserModal;
