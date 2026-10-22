import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createBdeUser,
  getDirectorEmployees,
  type DirectorEmployeeOption,
} from "../Services/BdeUserService";

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
  const [directors, setDirectors] = useState<DirectorEmployeeOption[]>([]);
  const [isLoadingDirectors, setIsLoadingDirectors] = useState(false);
  const [directorError, setDirectorError] = useState<string | null>(null);
  const [directorEmployeeId, setDirectorEmployeeId] = useState<string>("");

  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchDirectors = async () => {
      setIsLoadingDirectors(true);
      setDirectorError(null);
      try {
        const data = await getDirectorEmployees();
        if (isMounted) {
          setDirectors(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load directors:", err);
          setDirectorError("Failed to load directors list.");
          toast.error("Failed to load directors.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDirectors(false);
        }
      }
    };
    fetchDirectors();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleResetAndClose = () => {
    setDirectorEmployeeId("");
    setValue("");
    setCode("");
    setIsActive(true);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!directorEmployeeId) {
      toast.error("Please select a Director.");
      return;
    }

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
        directorEmployeeId: Number(directorEmployeeId),
        isActive,
        isDeleted: false,
      });

      toast.success("BDE user created successfully.");

      handleResetAndClose();
      onSuccess();
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
            {/* Director Dropdown */}
            <div>
              <label
                htmlFor="bdeUserDirector"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Director <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="bdeUserDirector"
                  value={directorEmployeeId}
                  onChange={(e) => setDirectorEmployeeId(e.target.value)}
                  disabled={isSaving || isLoadingDirectors}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingDirectors
                      ? "Loading directors..."
                      : "-- Select Director --"}
                  </option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name} {director.code ? `(${director.code})` : ""}
                    </option>
                  ))}
                </select>

                {isLoadingDirectors && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF7900]" />
                  </div>
                )}
              </div>

              {directorError && (
                <p className="mt-1 text-xs text-red-500">{directorError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bdeUserValue"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Value / Name <span className="text-red-500">*</span>
              </label>

              <input
                id="bdeUserValue"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. Rohan Deshmukh"
                disabled={isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              />
            </div>

            <div>
              <label
                htmlFor="bdeUserCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Code <span className="text-red-500">*</span>
              </label>

              <input
                id="bdeUserCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BDE_001"
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bdeUserActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer"
              />

              <label
                htmlFor="bdeUserActive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
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
              className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoadingDirectors}
              className="flex items-center gap-2 rounded-lg bg-[#FF7900] px-5 py-2 text-sm font-semibold text-white hover:bg-[#E66D00] disabled:bg-gray-400 shadow-sm transition cursor-pointer"
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
