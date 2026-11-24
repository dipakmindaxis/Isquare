import React, { useState, useEffect } from "react";
import { X, History, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { TaskHistoryItem, CreateTaskHistoryPayload } from "../Types/TaskHistoryTypes";
import { createTaskHistory, updateTaskHistory } from "../Services/TaskHistoryService";
import { getAllTasks } from "../../../SalesActivities/Services/TaskService";
import { getEmployees } from "../../../Customer/Services/CustomerMasterDataService";
import type { TaskItem } from "../../../SalesActivities/Types/TaskTypes";
import { SearchableSelect } from "../../../../../../Components/Common/SearchableSelect";

interface AddEditTaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  historyToEdit?: TaskHistoryItem | null;
  defaultTaskId?: number;
}

const COMMON_ACTIVITIES = [
  "Task Assigned",
  "Status Changed: In Progress",
  "Work Completed",
  "Reviewed & Approved",
  "Clarification Requested",
  "Due Date Extended",
  "Remarks Added",
];

export const AddEditTaskHistoryModal: React.FC<AddEditTaskHistoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  historyToEdit,
  defaultTaskId,
}) => {
  const [taskId, setTaskId] = useState<number>(defaultTaskId || 0);
  const [activity, setActivity] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [performedBy, setPerformedBy] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Load tasks and employees
      getAllTasks().then(setTasks).catch(() => {});
      getEmployees().then((data: any[]) => {
        const mapped = data.map((e: any) => ({
          id: Number(e.id || e.employeeId || 0),
          name: e.name || e.fullName || `${e.firstName || ""} ${e.lastName || ""}`.trim() || `Employee #${e.id}`,
        })).filter((e) => e.id > 0);
        setEmployees(mapped);
      }).catch(() => {});

      if (historyToEdit) {
        setTaskId(historyToEdit.taskId);
        setActivity(historyToEdit.activity || "");
        setRemarks(historyToEdit.remarks || "");
        setPerformedBy(historyToEdit.performedBy || 1);
        setIsActive(historyToEdit.isActive !== false);
      } else {
        setTaskId(defaultTaskId || 0);
        setActivity("");
        setRemarks("");
        setPerformedBy(1);
        setIsActive(true);
      }
    }
  }, [isOpen, historyToEdit, defaultTaskId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) {
      toast.error("Please select a task.");
      return;
    }
    if (!activity.trim()) {
      toast.error("Please enter an activity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTaskHistoryPayload = {
        taskId: Number(taskId),
        activity: activity.trim(),
        remarks: remarks.trim() || undefined,
        performedBy: Number(performedBy || 1),
        isActive,
      };

      if (historyToEdit) {
        await updateTaskHistory(historyToEdit.historyId, payload);
        toast.success("Task history entry updated!");
      } else {
        await createTaskHistory(payload);
        toast.success("Task history entry added successfully!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save task history.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#FF7900] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {historyToEdit ? "Edit Task History" : "Add Task History Activity"}
              </h2>
              <p className="text-xs text-orange-100">
                Record milestone, approval, or execution status update
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Task Select */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 mb-1 block">
              Task <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={taskId}
              onChange={(val) => setTaskId(Number(val))}
              options={tasks.map((t) => ({
                value: t.taskId,
                label: `${t.taskTitle} (${t.assignedToName || "Unassigned"})`,
              }))}
              placeholder="Select Task..."
              isClearable={false}
            />
          </div>

          {/* Activity */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 mb-1 block">
              Activity / Event <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Work In Progress, Approved, Completed..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20"
            />
            {/* Quick Activity Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_ACTIVITIES.map((act) => (
                <button
                  type="button"
                  key={act}
                  onClick={() => setActivity(act)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 hover:bg-orange-50 hover:text-[#FF7900] text-gray-600 rounded-md border border-gray-200 transition"
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Performed By */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 mb-1 block">
              Performed By
            </label>
            <SearchableSelect
              value={performedBy}
              onChange={(val) => setPerformedBy(Number(val))}
              options={employees.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
              placeholder="Select Employee..."
              isClearable={false}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 mb-1 block">
              Remarks / Discussion Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks or approval notes..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#FF7900] hover:bg-[#e06800] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} />
                  {historyToEdit ? "Update Entry" : "Save Entry"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
