import { SearchableSelect } from "../../../../../Components/Common/SearchableSelect";
import React, { useState, useEffect } from "react";
import { X, Loader2, CheckSquare, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../../hooks/useAuth";
import { getAllCustomers } from "../../Customer/Services/CustomerService";
import {
  createTask,
  updateTask,
  getAllTaskStatuses,
  addTaskActivity,
} from "../Services/TaskService";
import { createTaskAttachment } from "../../Master/TaskAttachment/Services/TaskAttachmentService";
import {
  getPrioritiesWithFallback,
  getEmployeeOptions,
  type PriorityOptionItem,
} from "../Services/SalesActivityService";
import {
  getAllEmployees,
  type Employee,
} from "../../../../HRMS/Pages/Employee/Services/EmployeeSerivce";
import { getDirectors as getDirectorEmployees, getBdeUsers as getAllBdeUsers } from "../../Customer/Services/CustomerMasterDataService";
import type { TaskCreatePayload, TaskStatusItem, TaskItem } from "../Types/TaskTypes";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerId?: string;
  initialCustomerName?: string;
  isModal?: boolean;
  taskToEdit?: TaskItem | null;
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
  taskToEdit,
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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedDocName, setAttachedDocName] = useState<string>("");

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
      setAttachedFile(null);
      setAttachedDocName("");

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
          if (prioList && prioList.length > 0) {
            setPriorityId((prev) => (prioList.some((p) => Number(p.id) === prev) ? prev : Number(prioList[0].id)));
          }

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

          dirEmpList.forEach((dir: any) => {
            const dirName = dir.name || dir.directorName || "";
            const dirId = Number(dir.id || dir.directorId || 0);
            const key = dirName.toLowerCase();
            if (dirId > 0 && key && !assignorMap.has(key)) {
              assignorMap.set(key, {
                id: dirId,
                name: dirName,
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

          if (custList.length > 0) {
            setCompanyId((prev) => prev || initialCustomerId || custList[0].customerId || (custList[0] as any).id || 1);
          }

          if (prioList.length > 0) {
            const highOrMed =
              prioList.find((p) => p.name.toLowerCase() === "high") || prioList[0];
            setPriorityId(Number(highOrMed.id));
          }

          if (statusList.length > 0 && !taskToEdit) {
            const pendingStatus =
              statusList.find((s) =>
                (s.statusName || "").toLowerCase().includes("pending")
              ) ||
              statusList.find(
                (s) =>
                  !(s.statusName || "").toLowerCase().includes("complet") &&
                  !(s.statusName || "").toLowerCase().includes("complat")
              ) ||
              statusList[0];
            setTaskStatusId(Number(pendingStatus.taskStatusId || pendingStatus.id || 1));
          }

          // Pre-populate if editing an existing task
          if (taskToEdit) {
            setTaskTitle(taskToEdit.taskTitle || "");
            if (taskToEdit.assignedByName) {
              const foundBy = assignorArr.find((a) => a.name.toLowerCase() === (taskToEdit.assignedByName || "").toLowerCase());
              if (foundBy) {
                setAssignedBy(`${foundBy.name} (${foundBy.designation})`);
              } else {
                setAssignedBy(taskToEdit.assignedByName);
              }
            }
            if (taskToEdit.assignedToName) {
              const foundTo = assigneeArr.find((a) => a.name.toLowerCase() === (taskToEdit.assignedToName || "").toLowerCase());
              if (foundTo) {
                setAssignedTo(`${foundTo.name} (${foundTo.designation})`);
              } else {
                setAssignedTo(taskToEdit.assignedToName);
              }
            }
            if (taskToEdit.companyId) {
              setCompanyId(taskToEdit.companyId);
            }
            if (taskToEdit.priorityId) {
              setPriorityId(Number(taskToEdit.priorityId));
            }
            if (taskToEdit.taskStatusId) {
              setTaskStatusId(Number(taskToEdit.taskStatusId));
            }
            if (taskToEdit.dueDate) {
              setDueDate(taskToEdit.dueDate);
            }
            setDetails(taskToEdit.description || taskToEdit.remarks || "");
            if (taskToEdit.reminderDate) {
              setReminderDateTime(`${taskToEdit.reminderDate}T${taskToEdit.reminderTime || "10:00"}`);
            } else {
              setReminderDateTime("");
            }
          }
        } catch {
          toast.error("Failed to load task masters.");
        }
      };

      loadDropdowns();
    }
  }, [isOpen, initialCustomerId, user, taskToEdit]);

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
      const resolvedCompanyId = companyId
        ? Number(companyId)
        : customers.length > 0
        ? Number(customers[0].customerId || (customers[0] as any).id || 1)
        : 1;

      const matchedStatusObj = statuses.find(
        (s) => Number(s.taskStatusId || s.id) === Number(taskStatusId)
      );
      const resolvedStatusName = matchedStatusObj?.statusName || "Pending";

      const payload: TaskCreatePayload = {
        companyId: resolvedCompanyId,
        taskTitle: taskTitle.trim(),
        description: details.trim(),
        assignedTo: resolvedAssignedToId,
        assignedToName: matchedAssignee ? matchedAssignee.name : assignedTo.replace(/\s*\(.*?\)\s*$/, "").trim() || assignedTo,
        assignedBy: resolvedAssignedById,
        assignedByName: matchedAssignor ? matchedAssignor.name : assignedBy.replace(/\s*\(.*?\)\s*$/, "").trim() || assignedBy,
        priorityId: Number(priorityId),
        taskStatusId: Number(taskStatusId),
        taskStatusName: resolvedStatusName,
        startDate: new Date().toISOString().split("T")[0],
        dueDate: dueDate,
        remarks: details.trim() || undefined,
        createdBy: Number(user?.employeeId || 1),
        reminderDate: remDate,
        reminderTime: remTime,
        reminderRemarks: details.trim() || taskTitle.trim(),
      };

      let savedTaskId: number | undefined;

      if (taskToEdit) {
        await updateTask(taskToEdit.taskId, payload);
        savedTaskId = taskToEdit.taskId;
        toast.success("Task updated successfully!");
      } else {
        const createdTask = await createTask(payload);
        savedTaskId = createdTask?.taskId;
        addTaskActivity({
          by: assignedBy,
          text: `Created task: ${taskTitle.trim()}`,
          customer: customerDisplayName || "General",
        });
        toast.success("Task assigned successfully!");
      }

      if (attachedFile && savedTaskId) {
        try {
          await createTaskAttachment({
            taskId: savedTaskId,
            documentName: attachedDocName.trim() || attachedFile.name,
            file: attachedFile,
            uploadedBy: Number(user?.employeeId || 1),
            isActive: true,
          });
          toast.success("Task attachment uploaded successfully!");
        } catch (attErr) {
          console.warn("Failed to upload attachment with task:", attErr);
          toast.info("Task saved, but attachment upload failed. You can re-upload in Attachments.");
        }
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(taskToEdit ? "Failed to update task. Please try again." : "Failed to assign task. Please try again.");
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
            {taskToEdit ? "Update Task" : "Add New Task"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
          title={taskToEdit ? "Close" : "Back to Tasks"}
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
              <SearchableSelect
                value={assignedBy}
                onChange={(val) => setAssignedBy(String(val))}
                options={assignors.map((opt) => ({
                  value: `${opt.name} (${opt.designation})`,
                  label: `${opt.name} (${opt.designation})`,
                }))}
                placeholder="Select Assignor (Director / BDE User)..."
                hasError={Boolean(isSubmitted && !assignedBy)}
              />
            </div>

            {/* Assigned To (Employees Below Director & BDE) */}
            <div>
              <label className={labelStyle}>
                Assigned To <RequiredAst />
              </label>
              <SearchableSelect
                value={assignedTo}
                onChange={(val) => setAssignedTo(String(val))}
                options={assignees.map((opt) => ({
                  value: `${opt.name} (${opt.designation})`,
                  label: `${opt.name} (${opt.designation})`,
                }))}
                placeholder="Select Assignee (Team / Staff)..."
                hasError={Boolean(isSubmitted && !assignedTo)}
              />
            </div>

            {/* Related Customer */}
            <div>
              <label className={labelStyle}>Customer / Company Account</label>
              <SearchableSelect
                value={companyId}
                onChange={(val) => setCompanyId(val)}
                options={customers.map((c: any) => ({
                  value: c.customerId || c.id,
                  label: c.companyName || c.customerName,
                }))}
                placeholder="Select Customer (Optional)..."
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

            {/* Priority */}
            <div>
              <label className={labelStyle}>
                Priority <RequiredAst />
              </label>
              <SearchableSelect
                value={priorityId}
                onChange={(val) => setPriorityId(Number(val))}
                options={priorities.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                placeholder="Select Priority..."
                isClearable={false}
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelStyle}>Status</label>
              <SearchableSelect
                value={taskStatusId}
                onChange={(val) => setTaskStatusId(Number(val))}
                options={statuses.map((s) => ({
                  value: Number(s.taskStatusId || s.id || 0),
                  label: s.statusName,
                }))}
                placeholder="Select Status..."
                isClearable={false}
              />
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

            {/* Task Attachment (Optional) */}
            <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Paperclip size={14} className="text-[#FF7900]" />
                <span>Attach Document / File (Optional)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Document Name</label>
                  <input
                    type="text"
                    value={attachedDocName}
                    onChange={(e) => setAttachedDocName(e.target.value)}
                    placeholder="e.g. Specification Sheet, Invoice"
                    className={baseInputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Select File</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setAttachedFile(f);
                        if (!attachedDocName.trim()) {
                          const base =
                            f.name.substring(0, f.name.lastIndexOf(".")) || f.name;
                          setAttachedDocName(base);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#FF7900] hover:file:bg-orange-100 cursor-pointer pt-1"
                  />
                </div>
              </div>
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
            <span>{taskToEdit ? "Update Task" : "Save Task"}</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal || !!taskToEdit) {
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
