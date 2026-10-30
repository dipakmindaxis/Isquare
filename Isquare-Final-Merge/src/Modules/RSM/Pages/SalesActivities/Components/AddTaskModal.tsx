import React, { useState, useEffect } from "react";
import { X, Loader2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../../hooks/useAuth";
import { getAllCustomers } from "../../Customer/Services/CustomerService";
import {
  createTask,
  getAllTaskStatuses,
  addTaskActivity,
} from "../Services/TaskService";
import {
  getPrioritiesWithFallback,
  getEmployeeOptions,
  type PriorityOptionItem,
} from "../Services/SalesActivityService";
import {
  getAllEmployees,
  type Employee,
} from "../../../../HRMS/Pages/Employee/Services/EmployeeSerivce";
import {
  getDirectorEmployees,
  getAllBdeUsers,
} from "../../Master/BdeUsers/Services/BdeUserService";
import type { TaskCreatePayload, TaskStatusItem } from "../Types/TaskTypes";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerId?: string;
  initialCustomerName?: string;
  isModal?: boolean;
}

export interface EmployeeAssignee {
  id: number;
  name: string;
  designation: string;
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
  const [assignors, setAssignors] = useState<EmployeeAssignee[]>([]);
  const [assignees, setAssignees] = useState<EmployeeAssignee[]>([]);
  const [priorities, setPriorities] = useState<PriorityOptionItem[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusItem[]>([]);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [assignedBy, setAssignedBy] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [companyId, setCompanyId] = useState<number | string>(initialCustomerId || "");
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [reminderDateTime, setReminderDateTime] = useState<string>("");
  const [priorityId, setPriorityId] = useState<number>(2);
  const [taskStatusId, setTaskStatusId] = useState<number>(1);
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setTaskTitle("");
      setCompanyId(initialCustomerId || "");
      setDueDate(
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      );
      setReminderDateTime("");
      setDetails("");

      const isDirectorOrBde = (name: string, designation: string): boolean => {
        const d = (designation || "").toLowerCase().trim();
        const n = (name || "").toLowerCase().trim();
        return (
          d.includes("director") ||
          d.includes("bde") ||
          d.includes("business development") ||
          n.includes("(director)") ||
          n.includes("(bde")
        );
      };

      const loadDropdowns = async () => {
        try {
          const [custList, empList, dirEmpList, bdeUsersList, empOpts, prioList, statusList] =
            await Promise.all([
              getAllCustomers().catch(() => []),
              getAllEmployees().catch(() => []),
              getDirectorEmployees().catch(() => []),
              getAllBdeUsers().catch(() => []),
              getEmployeeOptions().catch(() => []),
              getPrioritiesWithFallback(),
              getAllTaskStatuses(),
            ]);

          setCustomers(custList);
          setPriorities(prioList);
          setStatuses(statusList);

          // 1. Build Assignor List (Director & BDE User ONLY)
          const assignorMap = new Map<string, EmployeeAssignee>();

          empList.forEach((emp: Employee) => {
            const desg = emp.designationName || "";
            const fullName = `${emp.firstName} ${emp.lastName || ""}`.trim();
            if (isDirectorOrBde(fullName, desg)) {
              const key = fullName.toLowerCase();
              if (!assignorMap.has(key)) {
                assignorMap.set(key, {
                  id: emp.id,
                  name: fullName,
                  designation: desg.toLowerCase().includes("director")
                    ? "Director"
                    : "BDE User",
                });
              }
            }
          });

          dirEmpList.forEach((dir) => {
            const key = dir.name.toLowerCase();
            if (!assignorMap.has(key)) {
              assignorMap.set(key, {
                id: dir.id,
                name: dir.name,
                designation: "Director",
              });
            }
          });

          bdeUsersList.forEach((bde) => {
            if (bde.isActive) {
              const key = bde.value.toLowerCase();
              if (!assignorMap.has(key)) {
                assignorMap.set(key, {
                  id: bde.id,
                  name: bde.value,
                  designation: "BDE User",
                });
              }
            }
          });

          const assignorArr = Array.from(assignorMap.values());
          setAssignors(assignorArr);

          // 2. Build Assignee List (All employees BELOW Director & BDE)
          const assigneeMap = new Map<string, EmployeeAssignee>();

          empList.forEach((emp: Employee) => {
            const desg = emp.designationName || "";
            const fullName = `${emp.firstName} ${emp.lastName || ""}`.trim();
            if (!isDirectorOrBde(fullName, desg)) {
              const key = fullName.toLowerCase();
              if (!assigneeMap.has(key)) {
                assigneeMap.set(key, {
                  id: emp.id,
                  name: fullName,
                  designation: desg || emp.departmentName || "Staff",
                });
              }
            }
          });

          empOpts.forEach((opt) => {
            const key = opt.name.toLowerCase();
            if (!isDirectorOrBde(opt.name, opt.role || "") && !assigneeMap.has(key)) {
              assigneeMap.set(key, {
                id: Number(opt.id || 0),
                name: opt.name,
                designation: opt.role || "Sales Coordinator",
              });
            }
          });

          const assigneeArr = Array.from(assigneeMap.values());
          setAssignees(assigneeArr);

          // Default Assigned By (Current user if Director/BDE, or first assignor)
          if (assignorArr.length > 0) {
            setAssignedBy(`${assignorArr[0].name} (${assignorArr[0].designation})`);
          }

          // Default Assigned To (First subordinate employee)
          if (assigneeArr.length > 0) {
            setAssignedTo(`${assigneeArr[0].name} (${assigneeArr[0].designation})`);
          }

          if (prioList.length > 0) {
            const highOrMed =
              prioList.find((p) => p.name.toLowerCase() === "high") || prioList[0];
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
  }, [isOpen, initialCustomerId, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!taskTitle.trim()) {
      toast.error("Please enter Task Title.");
      return;
    }

    if (!assignedBy) {
      toast.error("Please select Assigned By.");
      return;
    }

    if (!assignedTo) {
      toast.error("Please select Assigned To.");
      return;
    }

    if (!dueDate) {
      toast.error("Please select a Due Date.");
      return;
    }

    setIsLoading(true);

    // Resolve assignedTo ID from assignees list
    let resolvedAssignedToId = 1;
    const matchedAssignee = assignees.find((a) => {
      const full = `${a.name} (${a.designation})`.toLowerCase();
      return full === assignedTo.toLowerCase() || a.name.toLowerCase() === assignedTo.toLowerCase();
    });
    if (matchedAssignee && matchedAssignee.id > 0) {
      resolvedAssignedToId = matchedAssignee.id;
    }

    // Resolve assignedBy ID from assignors list
    let resolvedAssignedById = Number(user?.employeeId || 1);
    const matchedAssignor = assignors.find((a) => {
      const full = `${a.name} (${a.designation})`.toLowerCase();
      return full === assignedBy.toLowerCase() || a.name.toLowerCase() === assignedBy.toLowerCase();
    });
    if (matchedAssignor && matchedAssignor.id > 0) {
      resolvedAssignedById = matchedAssignor.id;
    }

    // Resolve customer name
    const matchedCust = customers.find(
      (c: any) => String(c.customerId || c.id) === String(companyId)
    );
    const customerDisplayName = matchedCust
      ? matchedCust.customerName || matchedCust.companyName
      : "";

    // Parse reminder
    let remDate: string | undefined = undefined;
    let remTime: string | undefined = undefined;
    if (reminderDateTime) {
      const parts = reminderDateTime.split("T");
      remDate = parts[0];
      remTime = parts[1] || "10:00";
    }

    try {
      const payload: TaskCreatePayload = {
        companyId: companyId ? Number(companyId) : 0,
        taskTitle: taskTitle.trim(),
        description: details.trim(),
        assignedTo: resolvedAssignedToId,
        assignedToName: matchedAssignee ? matchedAssignee.name : assignedTo.replace(/\s*\(.*?\)\s*$/, "").trim() || assignedTo,
        assignedBy: resolvedAssignedById,
        assignedByName: matchedAssignor ? matchedAssignor.name : assignedBy.replace(/\s*\(.*?\)\s*$/, "").trim() || assignedBy,
        priorityId: Number(priorityId),
        taskStatusId: Number(taskStatusId),
        startDate: new Date().toISOString().split("T")[0],
        dueDate: dueDate,
        remarks: details.trim() || undefined,
        createdBy: Number(user?.employeeId || 1),
        reminderDate: remDate,
        reminderTime: remTime,
        reminderRemarks: details.trim() || taskTitle.trim(),
      };

      await createTask(payload);

      addTaskActivity({
        by: assignedBy,
        text: `Created task: ${taskTitle.trim()}`,
        customer: customerDisplayName || "General",
      });

      toast.success("Task assigned successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to assign task. Please try again.");
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
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5">
          <CheckSquare size={20} className="text-white" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
            Add New Task
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
          title="Back to Tasks"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Content - Clean & Aligned 2-Column Grid */}
      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Task Title - Full Row */}
            <div className="md:col-span-2">
              <label className={labelStyle}>
                Task Title <RequiredAst />
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title / subject"
                className={`${baseInputStyle} ${
                  isSubmitted && !taskTitle ? "border-red-500" : ""
                }`}
                required
              />
            </div>

            {/* Assigned By (Director & BDE User Employees Only) */}
            <div>
              <label className={labelStyle}>
                Assigned By <RequiredAst />
              </label>
              <select
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                className={`${baseInputStyle} ${
                  isSubmitted && !assignedBy ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select Assignor (Director / BDE User)...</option>
                {assignors.map((opt) => {
                  const val = `${opt.name} (${opt.designation})`;
                  return (
                    <option key={`by-${opt.id}-${opt.name}`} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Assigned To (Employees Below Director & BDE) */}
            <div>
              <label className={labelStyle}>
                Assigned To <RequiredAst />
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={`${baseInputStyle} ${
                  isSubmitted && !assignedTo ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select Assignee (Team / Staff)...</option>
                {assignees.map((opt) => {
                  const val = `${opt.name} (${opt.designation})`;
                  return (
                    <option key={`to-${opt.id}-${opt.name}`} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Related Customer */}
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

            {/* Reminder Date & Time */}
            <div>
              <label className={labelStyle}>Reminder Date & Time</label>
              <input
                type="datetime-local"
                value={reminderDateTime}
                onChange={(e) => setReminderDateTime(e.target.value)}
                className={baseInputStyle}
              />
            </div>

            {/* Priority */}
            <div>
              <label className={labelStyle}>
                Priority <RequiredAst />
              </label>
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(Number(e.target.value))}
                className={baseInputStyle}
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} Priority
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelStyle}>Status</label>
              <select
                value={taskStatusId}
                onChange={(e) => setTaskStatusId(Number(e.target.value))}
                className={baseInputStyle}
              >
                {statuses.map((s) => (
                  <option
                    key={s.taskStatusId || s.id}
                    value={s.taskStatusId || s.id}
                  >
                    {s.statusName}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Details / Instructions */}
            <div className="md:col-span-2">
              <label className={labelStyle}>Task Details / Instructions</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter task details, instructions or approval notes..."
                className={`${baseInputStyle} resize-y min-h-[80px]`}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            <span>Save Task</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-200">
          {formElement}
        </div>
      </div>
    );
  }

  return formElement;
};

export default AddTaskModal;
