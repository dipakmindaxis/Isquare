import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createTaskStatus,
  updateTaskStatus,
} from "../Services/TaskStatusService";
import type { TaskStatus } from "../Types/TaskStatusTypes";

interface AddEditTaskStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  statusToEdit?: TaskStatus | null;
}

export const AddEditTaskStatusModal: React.FC<AddEditTaskStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  statusToEdit,
}) => {
  const [statusName, setStatusName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (statusToEdit) {
        setStatusName(statusToEdit.statusName || "");
        setIsActive(!statusToEdit.isDeleted);
      } else {
        setStatusName("");
        setIsActive(true);
      }
    }
  }, [isOpen, statusToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) {
      toast.error("Status Name is required.");
      return;
    }

    setIsLoading(true);
    try {
      if (statusToEdit) {
        await updateTaskStatus(statusToEdit.id, {
          id: statusToEdit.id,
          statusName: statusName.trim(),
          isDeleted: !isActive,
        });
        toast.success("Task status updated successfully!");
      } else {
        await createTaskStatus({
          statusName: statusName.trim(),
          isDeleted: !isActive,
        });
        toast.success("Task status created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Task status error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (statusToEdit
          ? "Failed to update task status."
          : "Failed to create task status.");
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusToEdit ? "Edit Task Status" : "Add Task Status"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Status Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={statusName}
              onChange={(e) => setStatusName(e.target.value)}
              placeholder="e.g. In Progress, Review, Completed"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="taskStatusActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#FF7900] border-gray-300 rounded focus:ring-[#FF7900]"
            />
            <label
              htmlFor="taskStatusActive"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Active
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white text-sm font-semibold shadow-sm transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{statusToEdit ? "Update Status" : "Save Status"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditTaskStatusModal;
