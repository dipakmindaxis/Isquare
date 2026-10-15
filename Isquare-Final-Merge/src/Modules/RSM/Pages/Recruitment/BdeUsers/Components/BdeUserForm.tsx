import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createBdeUser } from "../Services/BdeUserService";

interface BdeUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BdeUserForm: React.FC<BdeUserFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleResetAndClose = () => {
    setValue("");
    setCode("");
    setIsActive(true);
    onClose();
  };

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
      await createBdeUser({
        id: 0,
        value: value.trim(),
        code: code.trim().toUpperCase(),
        isActive,
        isDeleted: false,
      });

      toast.success("BDE user created successfully.");

      setValue("");
      setCode("");
      setIsActive(true);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating BDE user:", error);
      toast.error("Failed to create BDE user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Add BDE User
          </h2>

          <button
            type="button"
            onClick={handleResetAndClose}
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
                htmlFor="bdeUserValue"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Value
              </label>

              <input
                id="bdeUserValue"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. Rohan Deshmukh"
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="bdeUserCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Code
              </label>

              <input
                id="bdeUserCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BDE_001"
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bdeUserActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4"
              />

              <label
                htmlFor="bdeUserActive"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={handleResetAndClose}
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
              {isSaving ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BdeUserForm;
