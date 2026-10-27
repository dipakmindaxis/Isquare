import React, { useState, useEffect } from "react";
import { X, Loader2, Bell, CheckSquare, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../../hooks/useAuth";
import { getAllCustomers } from "../../Customer/Services/CustomerService";
import { getAllDirectors } from "../../Master/Director/Services/DirectorService";
import { getDirectorEmployees } from "../../Master/BdeUsers/Services/BdeUserService";
import {
  createTask,
  getAllTaskStatuses,
} from "../Services/TaskService";
import {
  getPrioritiesWithFallback,
  type PriorityOptionItem,
  type AssigneeOption,
} from "../Services/SalesActivityService";
import type { TaskCreatePayload, TaskStatusItem } from "../Types/TaskTypes";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerId?: string;
  initialCustomerName?: string;
  isModal?: boolean;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId,
  initialCustomerName: _initialCustomerName,
  isModal = false,
}) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Master Data
  const [customers, setCustomers] = useState<any[]>([]);
  const [directors, setDirectors] = useState<AssigneeOption[]>([]);
  const [priorities, setPriorities] = useState<PriorityOptionItem[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusItem[]>([]);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [companyId, setCompanyId] = useState<number | string>(initialCustomerId || "");
  const [assignedDirectorId, setAssignedDirectorId] = useState<number | string>("");
  const [priorityId, setPriorityId] = useState<number>(2); // Default High / Medium
  const [taskStatusId, setTaskStatusId] = useState<number>(1); // Default Pending
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState<string>("");

  // Reminder Fields
  const [enableReminder, setEnableReminder] = useState<boolean>(false);
  const [reminderDate, setReminderDate] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("10:00");
  const [reminderRemarks, setReminderRemarks] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setTaskTitle("");
      setDescription("");
      setCompanyId(initialCustomerId || "");
      setStartDate(new Date().toISOString().split("T")[0]);
      setDueDate(
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      );
      setRemarks("");
      setEnableReminder(false);
      setReminderDate("");
      setReminderTime("10:00");
      setReminderRemarks("");

      const loadDropdowns = async () => {
        try {
          const [custList, directorEmp, directMaster, prioList, statusList] =
            await Promise.all([
              getAllCustomers().catch(() => []),
              getDirectorEmployees().catch(() => []),
              getAllDirectors().catch(() => []),
              getPrioritiesWithFallback(),
              getAllTaskStatuses(),
            ]);

          setCustomers(custList);
          setPriorities(prioList);
          setStatuses(statusList);

          // Build clean directors list
          const seen = new Set<string>();
          const dList: AssigneeOption[] = [];

          directorEmp.forEach((d) => {
            if (d && d.id && !seen.has(String(d.id))) {
              seen.add(String(d.id));
              dList.push({
                id: String(d.id),
                name: `${d.name} (Director)`,
                role: "Director",
                type: "Employee",
              });
            }
          });

          directMaster.forEach((d) => {
            if (d && d.directorId && !seen.has(String(d.directorId))) {
              seen.add(String(d.directorId));
              dList.push({
                id: String(d.directorId),
                name: `${d.directorName} (Director Master)`,
                role: "Director",
                type: "Employee",
              });
            }
          });

          setDirectors(dList);

          if (dList.length > 0) {
            setAssignedDirectorId(dList[0].id);
          }

          if (prioList.length > 0) {
            const highOrMed = prioList.find((p) => p.name.toLowerCase() === "high") || prioList[0];
            setPriorityId(Number(highOrMed.id));
          }

          if (statusList.length > 0) {
            const foundStatusId = statusList[0].taskStatusId || statusList[0].id || 1;
            setTaskStatusId(Number(foundStatusId));
          }
        } catch {
          toast.error("Failed to load task masters.");
        }
      };

      loadDropdowns();
    }
  }, [isOpen, initialCustomerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!taskTitle.trim()) {
      toast.error("Please enter a Task Title / Subject.");
      return;
    }

    if (!assignedDirectorId) {
      toast.error("Please select a Director to assign this task / approval request.");
      return;
    }

    if (!dueDate) {
      toast.error("Please select a Due Date.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: TaskCreatePayload = {
        companyId: companyId ? Number(companyId) : 0,
        taskTitle: taskTitle.trim(),
        description: description.trim(),
        assignedTo: Number(assignedDirectorId),
        assignedBy: Number(user?.employeeId || 1),
        priorityId: Number(priorityId),
        taskStatusId: Number(taskStatusId),
        startDate: startDate || new Date().toISOString().split("T")[0],
        dueDate: dueDate,
        remarks: remarks.trim() || undefined,
        createdBy: Number(user?.employeeId || 1),
        reminderDate: enableReminder && reminderDate ? reminderDate : undefined,
        reminderTime: enableReminder && reminderTime ? reminderTime : undefined,
        reminderRemarks: enableReminder && reminderRemarks ? reminderRemarks.trim() : undefined,
      };

      await createTask(payload);
      toast.success("Task / Approval Request submitted to Director successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;
  const baseInputStyle =
    "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-gray-800 placeholder-gray-400 min-h-[42px]";

  const formElement = (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
      {/* Top Header Bar matching Customer Module */}
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5">
          <CheckSquare size={20} className="text-white" />
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Create New Task / Assignment Request
            </h2>
            <p className="text-xs text-white/85">
              Submit and assign operational tasks, client commitments or managerial approvals
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
          title="Back to Tasks List"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form matching Customer Module Sections & Spacing */}
      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-6 sm:p-8 space-y-6">
          {/* SECTION 1: TASK & ASSIGNMENT DETAILS */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-200 pb-2.5">
              <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={16} /> Section 1 - Task & Assignment Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Task Title */}
              <div className="md:col-span-2">
                <label className={labelStyle}>
                  Task Title / Approval Subject <RequiredAst />
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Special Discount Approval for Tech Corp / Plant Audit Checklist"
                  className={`${baseInputStyle} ${
                    isSubmitted && !taskTitle ? "border-red-500" : ""
                  }`}
                  required
                />
              </div>

              {/* Assigned Director */}
              <div>
                <label className={labelStyle}>
                  Assigned Director <RequiredAst />
                </label>
                <select
                  value={assignedDirectorId}
                  onChange={(e) => setAssignedDirectorId(e.target.value)}
                  className={`${baseInputStyle} ${
                    isSubmitted && !assignedDirectorId ? "border-red-500" : ""
                  }`}
                  required
                >
                  <option value="">Select Director...</option>
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Tasks / approval requests must be assigned to a designated Director
                </p>
              </div>

              {/* Customer / Company Account */}
              <div>
                <label className={labelStyle}>Customer / Company Account</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className={baseInputStyle}
                >
                  <option value="">Select Customer (Optional)...</option>
                  {customers.map((c: any) => {
                    const id = c.customerId || c.id;
                    const name = c.companyName || c.customerName;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Description / Approval Context</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed description, requirements or financial metrics for this approval request..."
                  className={`${baseInputStyle} resize-y min-h-[90px]`}
                />
              </div>

              {/* General Remarks */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Remarks / Notes for Director</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Urgent review requested before customer PO issuance"
                  className={baseInputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TIMELINE & PRIORITY */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-200 pb-2.5">
              <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} /> Section 2 - Timeline & Priority
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Priority Level */}
              <div>
                <label className={labelStyle}>
                  Priority Level <RequiredAst />
                </label>
                <select
                  value={priorityId}
                  onChange={(e) => setPriorityId(Number(e.target.value))}
                  className={baseInputStyle}
                >
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Status */}
              <div>
                <label className={labelStyle}>Initial Task Status</label>
                <select
                  value={taskStatusId}
                  onChange={(e) => setTaskStatusId(Number(e.target.value))}
                  className={baseInputStyle}
                >
                  {statuses.map((s) => (
                    <option key={s.taskStatusId || s.id} value={s.taskStatusId || s.id}>
                      {s.statusName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={baseInputStyle}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className={labelStyle}>
                  Due Date <RequiredAst />
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`${baseInputStyle} ${
                    isSubmitted && !dueDate ? "border-red-500" : ""
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: AUTOMATED REMINDER & NOTIFICATION */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-200 pb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                <Bell size={16} /> Section 3 - Automated Reminder & Notification
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] w-4 h-4 cursor-pointer"
                />
                <span>Schedule Reminder</span>
              </label>
            </div>

            {enableReminder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                <div>
                  <label className={labelStyle}>Reminder Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelStyle}>Reminder Notification Message</label>
                  <input
                    type="text"
                    value={reminderRemarks}
                    onChange={(e) => setReminderRemarks(e.target.value)}
                    placeholder="e.g. Follow up on Director approval decision"
                    className={baseInputStyle}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions Footer matching Customer Module */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-2.5 rounded-lg bg-[#FF7900] hover:bg-[#e06800] text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CheckSquare size={16} />
            )}
            <span>Submit Task / Request</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-200">
          {formElement}
        </div>
      </div>
    );
  }

  return formElement;
};

export default AddTaskModal;
