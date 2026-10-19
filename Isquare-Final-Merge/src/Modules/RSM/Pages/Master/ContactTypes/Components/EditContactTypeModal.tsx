// Handles editing an existing contact type.

import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  updateContactType,
} from "../Services/ContactTypeService";

import type { ContactType } from "../Types/ContactType";

interface EditContactTypeModalProps {
  isOpen: boolean;
  contactType: ContactType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditContactTypeModal: React.FC<
  EditContactTypeModalProps
> = ({
  isOpen,
  contactType,
  onClose,
  onSuccess,
}) => {
    const [value, setValue] = useState("");
    const [code, setCode] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if (contactType) {
        setValue(contactType.value);
        setCode(contactType.code);
        setIsActive(contactType.isActive);
      }
    }, [contactType]);

    if (!isOpen || !contactType) {
      return null;
    }

    const handleSubmit = async (
      e: React.FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();

      if (!value.trim()) {
        toast.error("Contact type value is required.");
        return;
      }

      if (!code.trim()) {
        toast.error("Contact type code is required.");
        return;
      }

      setIsSaving(true);

      try {
        await updateContactType(
          contactType.contactTypeId,
          {
            contactTypeId: contactType.contactTypeId,
            value: value.trim(),
            code: code.trim().toUpperCase(),
            isActive,
            isDeleted: contactType.isDeleted,
          }
        );

        toast.success(
          "Contact type updated successfully."
        );

        onSuccess();
        onClose();
      } catch (error) {
        console.error(
          "Error updating contact type:",
          error
        );

        toast.error(
          "Failed to update contact type."
        );
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

          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">

            <h2 className="text-lg font-semibold text-gray-800">
              Edit Contact Type
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

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="space-y-4 px-6 py-5">

              {/* Value */}
              <div>
                <label
                  htmlFor="editContactTypeValue"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Value
                </label>

                <input
                  id="editContactTypeValue"
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setValue(e.target.value)
                  }
                  disabled={isSaving}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Code */}
              <div>
                <label
                  htmlFor="editContactTypeCode"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Code
                </label>

                <input
                  id="editContactTypeCode"
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  disabled={isSaving}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">

                <input
                  id="editContactTypeActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(e.target.checked)
                  }
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer"
                />

                <label
                  htmlFor="editContactTypeActive"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Active
                </label>

              </div>

            </div>

            {/* Footer */}
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
                {isSaving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        </div>
      </div>
    );
  };

export default EditContactTypeModal;