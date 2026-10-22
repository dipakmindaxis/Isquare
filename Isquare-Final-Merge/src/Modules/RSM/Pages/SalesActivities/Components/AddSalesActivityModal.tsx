import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Building,
  FileText,
  Clock,
  Paperclip,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ActivityAttachment,
  ActivityStatus,
  ActivityType,
  CustomerOption,
  EmployeeOption,
  SalesActivityCreatePayload,
} from "../Types/SalesActivityTypes";
import {
  createSalesActivity,
  getCustomerOptions,
  getEmployeeOptions,
  getCallTypes,
  getMeetingTypes,
  getActivityOutcomes,
  getFollowUpIntervals,
  getDocumentTypes,
  getAllActivityTypes,
  getAllCustomerStatuses,
} from "../Services/SalesActivityService";
import type {
  CallTypeItem,
  MeetingTypeItem,
  ActivityOutcomeItem,
  FollowUpIntervalItem,
  DocumentTypeItem,
  MasterActivityType,
  CustomerStatus,
} from "../Services/SalesActivityService";
import { uploadSalesAttachment } from "../../Master/SalesAttachments/Services/SalesAttachmentService";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { getAllPriorities, type Priority } from "../../Master/Priority/Services/PriorityService";
import { getAllBdeUsers, type BdeUser } from "../../Master/BdeUsers/Services/BdeUserService";
import { createReminder } from "../../Master/Reminder/Services/ReminderService";
import { createFollowUp } from "../../Master/FollowUp/Services/FollowUpService";
import { Bell } from "lucide-react";

interface AddSalesActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultActivityType?: ActivityType;
  isModal?: boolean;
}

const getRelativeDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

export const AddSalesActivityModal: React.FC<AddSalesActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultActivityType,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown Master Data
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [callTypes, setCallTypes] = useState<CallTypeItem[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeItem[]>([]);
  const [, setOutcomes] = useState<ActivityOutcomeItem[]>([]);
  const [intervals, setIntervals] = useState<FollowUpIntervalItem[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentTypeItem[]>([]);
  const [masterActivityTypes, setMasterActivityTypes] = useState<MasterActivityType[]>([]);
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatus[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [bdeUsers, setBdeUsers] = useState<BdeUser[]>([]);
  const [statusDescription, setStatusDescription] = useState<string>("");

  // Tab 0: Activity Details Fields (Empty by default - no static pre-fills)
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>("");
  const [assignedEmployeeName, setAssignedEmployeeName] = useState<string>("");
  const [activityType, setActivityType] = useState<ActivityType | "">(
    defaultActivityType || ""
  );
  const [activityDate, setActivityDate] = useState<string>("");
  const [activityTime, setActivityTime] = useState<string>("");
  const [status, setStatus] = useState<ActivityStatus | "">("");
  const [subType, setSubType] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Tab 1: Discussion & Notes Fields
  const [subject, setSubject] = useState<string>("");
  const [discussionNotes, setDiscussionNotes] = useState<string>("");

  // Tab 2: Sales Attachments Fields (Beside Discussion & Notes)
  const [documentType, setDocumentType] = useState<string>("");
  const [enquiryRef, setEnquiryRef] = useState<string>("");
  const [attachmentRemarks, setAttachmentRemarks] = useState<string>("");
  const [attachments, setAttachments] = useState<ActivityAttachment[]>([]);

  // Tab 3: Follow-Up & Reminders Fields
  const [nextActionDate, setNextActionDate] = useState<string>("");
  const [nextActionDetails, setNextActionDetails] = useState<string>("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low" | "">("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [followUpStatus, setFollowUpStatus] = useState<string>("");
  const [followUpPriorityId, setFollowUpPriorityId] = useState<number | string>("");
  const [followUpStatusId, setFollowUpStatusId] = useState<number | string>("");

  // Reminder Fields
  const [reminderTitle, setReminderTitle] = useState<string>("");
  const [reminderDate, setReminderDate] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("");
  const [reminderAssignedTo, setReminderAssignedTo] = useState<number | string>("");
  const [reminderPriorityId, setReminderPriorityId] = useState<number | string>("");
  const [reminderStatusId, setReminderStatusId] = useState<number | string>("");
  const [reminderRemarks, setReminderRemarks] = useState<string>("");

  // Reset form when opened or closed
  useEffect(() => {
    if (isOpen) {
      setActiveTab(0);
      setIsSubmitted(false);
      setCustomerId("");
      setCustomerName("");
      setContactPerson("");
      setContactPhone("");
      setAssignedEmployeeId("");
      setAssignedEmployeeName("");
      setActivityType(defaultActivityType || "");
      setActivityDate("");
      setActivityTime("");
      setStatus("");
      setSubType("");
      setOutcome("");
      setLocation("");
      setSubject("");
      setDiscussionNotes("");
      setDocumentType("");
      setEnquiryRef("");
      setAttachmentRemarks("");
      setAttachments([]);
      setNextActionDate("");
      setNextActionDetails("");
      setPriority("");
      setFollowUpDate("");
      setFollowUpStatus("");
      setFollowUpPriorityId("");
      setFollowUpStatusId("");
      setReminderTitle("");
      setReminderDate("");
      setReminderTime("");
      setReminderAssignedTo("");
      setReminderPriorityId("");
      setReminderStatusId("");
      setReminderRemarks("");
      setStatusDescription("");

      const loadOptions = async () => {
        try {
          const [cData, eData, cTypes, mTypes, actOutcomes, invs, actTypes, custStatuses, dTypes, prioList, bdeList] =
            await Promise.all([
              getCustomerOptions(),
              getEmployeeOptions(),
              getCallTypes(),
              getMeetingTypes(),
              getActivityOutcomes(),
              getFollowUpIntervals(),
              getAllActivityTypes(),
              getAllCustomerStatuses(),
              getDocumentTypes(),
              getAllPriorities(),
              getAllBdeUsers(),
            ]);

          setCustomers(cData);
          setEmployees(eData);
          setCallTypes(cTypes.filter((c) => c.isActive));
          setMeetingTypes(mTypes.filter((m) => m.isActive));
          setOutcomes(actOutcomes.filter((o) => o.isActive));
          setIntervals(invs.filter((i) => i.isActive));
          setMasterActivityTypes(actTypes.filter((a) => a.isActive));
          setCustomerStatuses(custStatuses.filter((s) => s.isActive));
          setDocTypes(dTypes.filter((d) => d.isActive));
          setPriorities(prioList.filter((p) => p.isActive));
          setBdeUsers(bdeList.filter((b) => b.isActive));
        } catch {
          toast.error("Failed to load options.");
        }
      };
      loadOptions();
    }
  }, [isOpen, defaultActivityType]);

  // Support ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleCustomerChange = (selectedId: string) => {
    setCustomerId(selectedId);
    const matched = customers.find((c) => c.id === selectedId);
    if (matched) {
      setCustomerName(matched.name);
      setContactPerson(matched.contactPerson || "");
      setContactPhone(matched.phone || "");
    } else {
      setCustomerName("");
      setContactPerson("");
      setContactPhone("");
    }
  };

  const handleEmployeeChange = (selectedId: string) => {
    setAssignedEmployeeId(selectedId);
    const matched = employees.find((e) => e.id === selectedId);
    if (matched) {
      setAssignedEmployeeName(matched.name);
    } else {
      setAssignedEmployeeName("");
    }
  };

  const applyIntervalPreset = (intervalValue: string) => {
    const v = intervalValue.toLowerCase();
    let days = 1;
    if (v.includes("same day")) days = 0;
    else if (v.includes("next day") || v.includes("1 day")) days = 1;
    else if (v.includes("3 day")) days = 3;
    else if (v.includes("1 week") || v.includes("7 day")) days = 7;
    else if (v.includes("15 day")) days = 15;
    else if (v.includes("1 month") || v.includes("30 day")) days = 30;
    else {
      const m = v.match(/\d+/);
      if (m) days = parseInt(m[0], 10);
    }
    setNextActionDate(getRelativeDate(days));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: ActivityAttachment[] = Array.from(files).map((file) => ({
      id: `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      isImage: file.type.startsWith("image/"),
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      documentType: documentType || "Document",
      remarks: attachmentRemarks,
      file,
    }));

    setAttachments((prev) => [...prev, ...newDocs]);
    toast.success(`${newDocs.length} attachment(s) added.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((d) => d.id !== id));
  };

  const validateTab0 = (): boolean => {
    if (!customerId && !customerName.trim()) {
      toast.error("Please select a Customer Account.");
      setActiveTab(0);
      return false;
    }
    return true;
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateTab0()) {
      return;
    }

    const effectiveType = (activityType || "Phone Call") as ActivityType;
    const effectiveDate = activityDate || followUpDate || reminderDate || new Date().toISOString().split("T")[0];
    const effectiveTime = activityTime.trim() || reminderTime || "10:00 AM";
    const effectiveStatus = (status || followUpStatus || "Scheduled") as ActivityStatus;
    const effectiveEmpId = assignedEmployeeId || (reminderAssignedTo ? String(reminderAssignedTo) : "") || (employees[0]?.id ? String(employees[0].id) : "EMP-001");
    const matchedEmp = employees.find((e) => String(e.id) === String(effectiveEmpId));
    const effectiveEmpName = assignedEmployeeName.trim() || (matchedEmp ? matchedEmp.name : "Sales Representative");
    const matchedCust = customers.find((c) => String(c.id) === String(customerId));
    const effectiveCustName = customerName.trim() || (matchedCust ? matchedCust.name : "Client");

    const finalSubject =
      subject.trim() || reminderTitle.trim() || `${effectiveType}: ${effectiveCustName}`;
    const finalNotes =
      discussionNotes.trim() ||
      reminderRemarks.trim() ||
      nextActionDetails.trim() ||
      `Recorded ${effectiveType.toLowerCase()} discussion with client.`;

    const payload: SalesActivityCreatePayload = {
      activityType: effectiveType,
      subject: finalSubject,
      customerId: customerId || `CUST-MANUAL-${Date.now().toString().slice(-4)}`,
      customerName: effectiveCustName,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim() || undefined,
      assignedEmployeeId: String(effectiveEmpId),
      assignedEmployeeName: effectiveEmpName,
      activityDate: effectiveDate,
      activityTime: effectiveTime,
      durationMinutes: 30,
      status: effectiveStatus,
      statusDescription: statusDescription.trim() || undefined,
      discussionNotes: finalNotes,
      outcome: outcome.trim() || undefined,

      // Classification Specifics
      callType: effectiveType === "Phone Call" ? (subType || "General") : undefined,
      meetingType:
        effectiveType.includes("Meeting") || effectiveType.includes("Visit")
          ? (subType || "Discussion")
          : undefined,
      location: location.trim() || undefined,

      // Follow-Up & Reminder Tracker
      followUpDate: followUpDate || undefined,
      nextActionDate: nextActionDate || undefined,
      dueTime: reminderTime || "10:30 AM",
      priority: priority || undefined,
      followUpStatus: followUpStatus || undefined,
      nextActionDetails: nextActionDetails.trim() || undefined,
      reminderTitle: reminderTitle.trim() || undefined,
      reminderDate: reminderDate || nextActionDate || undefined,
      reminderTime: reminderTime || undefined,
      reminderRemarks: reminderRemarks.trim() || nextActionDetails.trim() || undefined,

      // Association
      relatedRecordType: (enquiryRef.trim() ? "Enquiry" : "None"),
      relatedRecordCode: enquiryRef.trim() || undefined,

      // Document Category & Files
      documentCategory: documentType || undefined,
      photographs: attachments.filter((a) => a.isImage),
      documents: attachments.filter((a) => !a.isImage),
    };

    setIsLoading(true);
    try {
      const created = await createSalesActivity(payload);
      // Sync raw files to backend SalesAttachments service if any
      const actId = (created as any)?.id ? Number((created as any).id) : null;
      const cId = customerId ? Number(customerId) : null;
      for (const att of attachments) {
        if (att.file) {
          try {
            await uploadSalesAttachment({
              file: att.file,
              documentType: att.documentType || documentType || "General",
              customerId: cId,
              salesActivityId: actId,
              enquiryId: enquiryRef.trim() || undefined,
              remarks: att.remarks || attachmentRemarks || undefined,
            });
          } catch (uploadErr) {
            console.warn("Attachment upload fallback handled", uploadErr);
          }
        }
      }

      // Sync Reminder to backend /api/Reminder
      if (reminderDate || reminderTitle) {
        try {
          await createReminder({
            companyId: Number(customerId) || 0,
            assignedTo: Number(reminderAssignedTo) || (assignedEmployeeId ? Number(assignedEmployeeId) : undefined),
            reminderStatusId: reminderStatusId ? Number(reminderStatusId) : undefined,
            title: reminderTitle.trim() || `Reminder: ${customerName.trim() || finalSubject}`,
            reminderDate: reminderDate || activityDate || new Date().toISOString(),
            reminderTime: reminderTime || "10:00:00",
            remarks: reminderRemarks.trim() || nextActionDetails.trim() || finalSubject,
            priorityId: reminderPriorityId ? Number(reminderPriorityId) : undefined,
            createdBy: 1,
            isActive: true,
            isDeleted: false,
          });
        } catch (remErr) {
          console.warn("createReminder backend API call error:", remErr);
        }
      }

      // Sync FollowUp to backend /api/FollowUp
      if (followUpDate || nextActionDate) {
        try {
          await createFollowUp({
            companyId: Number(customerId) || 0,
            userId: assignedEmployeeId ? Number(assignedEmployeeId) : undefined,
            followUpDate: followUpDate || new Date().toISOString().split("T")[0],
            nextFollowUpDate: nextActionDate || undefined,
            statusId: followUpStatusId ? Number(followUpStatusId) : undefined,
            priorityId: followUpPriorityId ? Number(followUpPriorityId) : undefined,
            remarks: nextActionDetails.trim() || finalSubject,
            isActive: true,
            isDeleted: false,
          });
        } catch (fuErr) {
          console.warn("createFollowUp backend API call error:", fuErr);
        }
      }

      toast.success("Sales activity recorded successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to record sales activity.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrorsInTab = (tabIdx: number): boolean => {
    if (tabIdx === 0 && isSubmitted) {
      return (
        !customerId ||
        !assignedEmployeeId ||
        !activityType ||
        !activityDate ||
        !activityTime ||
        !status
      );
    }
    return false;
  };

  const tabs = [
    { label: "Activity Details", icon: <Building size={16} /> },
    { label: "Discussion & Notes", icon: <FileText size={16} /> },
    { label: "Sales Attachments", icon: <Paperclip size={16} /> },
    { label: "Follow-Up & Reminders", icon: <Clock size={16} /> },
  ];

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";
  const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;
  const baseInputStyle =
    "w-full rounded-lg px-4 py-2.5 outline-none border border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-gray-800 placeholder-gray-400 min-h-[42px]";

  const content = (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col overflow-hidden">
        {/* Customer & Activity Form Header Matching Customer Module */}
        <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Add New Sales Activity
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex bg-[#e06800] p-1.5 gap-1 items-center shrink-0 border-b border-[#c85c00]">
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleTabChange(index)}
                className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 relative cursor-pointer ${
                  activeTab === index
                    ? "bg-white text-[#FF7900] shadow-lg scale-[1.02]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {tab.icon} {tab.label}
                {hasErrorsInTab(index) && activeTab !== index && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body matching Customer Module spacing & dimensions */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="p-6 sm:p-8 min-h-[460px]">
            {/* TAB 0: ACTIVITY DETAILS */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-200">
                {/* Customer Name */}
                <div className="relative">
                  <label className={labelStyle}>
                    Customer Name <RequiredAst />
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={`${baseInputStyle} ${
                      isSubmitted && !customerId ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Customer Account...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Sales Rep */}
                <div className="relative">
                  <label className={labelStyle}>
                    Assigned Sales Rep <RequiredAst />
                  </label>
                  <select
                    value={assignedEmployeeId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className={`${baseInputStyle} ${
                      isSubmitted && !assignedEmployeeId ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Sales Representative...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Person */}
                <div className="relative">
                  <label className={labelStyle}>Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Enter Contact Person"
                    className={baseInputStyle}
                  />
                </div>

                {/* Contact Phone */}
                <div className="relative">
                  <label className={labelStyle}>Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter Contact Phone"
                    className={baseInputStyle}
                  />
                </div>

                {/* Activity Type */}
                <div className="relative">
                  <label className={labelStyle}>
                    Activity Type <RequiredAst />
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as ActivityType)
                    }
                    className={`${baseInputStyle} ${
                      isSubmitted && !activityType ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Activity Type...</option>
                    {masterActivityTypes.length > 0 ? (
                      <>
                        {masterActivityTypes.map((act) => (
                          <option key={act.id} value={act.activityName}>
                            {act.activityName}
                          </option>
                        ))}
                        {activityType &&
                          !masterActivityTypes.some(
                            (a) => a.activityName === activityType
                          ) && <option value={activityType}>{activityType}</option>}
                      </>
                    ) : (
                      <>
                        <option value="Customer Visit">Customer Visit (On-site)</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Online Meeting">
                          Online Meeting (Teams / Zoom)
                        </option>
                        <option value="WhatsApp Follow-up">WhatsApp Follow-up</option>
                        <option value="Site Survey">Site Survey & Technical Audit</option>
                        <option value="Product Demonstration">
                          Product Demonstration
                        </option>
                        <option value="Sample Submitted">Sample Submission</option>
                        <option value="Email">Email Communication</option>
                        <option value="Discussion Notes">Discussion Notes</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Status */}
                <div className="relative">
                  <label className={labelStyle}>
                    Status <RequiredAst />
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setStatus(newStatus as ActivityStatus);
                      const matched = customerStatuses.find(
                        (cs) => cs.statusName.toLowerCase() === newStatus.toLowerCase()
                      );
                      if (matched && matched.description) {
                        setStatusDescription(matched.description);
                      }
                    }}
                    className={`${baseInputStyle} ${
                      isSubmitted && !status ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Status...</option>
                    {customerStatuses.length > 0 ? (
                      <>
                        {customerStatuses.map((cs) => (
                          <option key={cs.customerStatusId} value={cs.statusName}>
                            {cs.statusName}
                          </option>
                        ))}
                        {status &&
                          !customerStatuses.some(
                            (cs) => cs.statusName.toLowerCase() === status.toLowerCase()
                          ) && <option value={status}>{status}</option>}
                      </>
                    ) : (
                      <>
                        <option value="complete">complete</option>
                        <option value="processing">processing</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Due Today">Due Today</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Activity Date */}
                <div className="relative">
                  <label className={labelStyle}>
                    Activity Date <RequiredAst />
                  </label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className={`${baseInputStyle} ${
                      isSubmitted && !activityDate ? "border-red-500" : ""
                    }`}
                    required
                  />
                </div>

                {/* Activity Time */}
                <div className="relative">
                  <label className={labelStyle}>
                    Activity Time <RequiredAst />
                  </label>
                  <input
                    type="text"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    placeholder="Enter Activity Time (e.g. 10:30 AM)"
                    className={`${baseInputStyle} ${
                      isSubmitted && !activityTime ? "border-red-500" : ""
                    }`}
                    required
                  />
                </div>

                {/* Sub-Type (Call or Meeting) */}
                <div className="relative">
                  <label className={labelStyle}>
                    {activityType === "Phone Call" || activityType.toLowerCase().includes("call")
                      ? "Call Type"
                      : "Meeting / Activity Sub-Type"}
                  </label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className={baseInputStyle}
                  >
                    <option value="">Select Type...</option>
                    {activityType === "Phone Call" || activityType.toLowerCase().includes("call")
                      ? callTypes.map((c) => {
                          const val = (c as any).callTypeName || c.value || c.label;
                          return (
                            <option key={c.id} value={val}>
                              {val}
                            </option>
                          );
                        })
                      : meetingTypes.map((m) => {
                          const val = (m as any).meetingTypeName || m.value || m.label;
                          return (
                            <option key={m.id} value={val}>
                              {val}
                            </option>
                          );
                        })}
                    {subType &&
                      !(activityType === "Phone Call" || activityType.toLowerCase().includes("call")
                        ? callTypes
                        : meetingTypes
                      ).some(
                        (item) =>
                          ((item as any).meetingTypeName ||
                            (item as any).callTypeName ||
                            item.value) === subType
                      ) && <option value={subType}>{subType}</option>}
                  </select>
                </div>

                {/* Status Description */}
                <div className="relative">
                  <label className={labelStyle}>Status Description</label>
                  <input
                    type="text"
                    value={statusDescription}
                    onChange={(e) => setStatusDescription(e.target.value)}
                    placeholder="Status description or notes"
                    className={baseInputStyle}
                  />
                </div>


                {/* Location / Mode */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Location / Mode</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location / Mode"
                    className={baseInputStyle}
                  />
                </div>
              </div>
            )}

            {/* TAB 1: DISCUSSION & NOTES */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-200">
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Subject / Purpose</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter Subject / Purpose"
                    className={baseInputStyle}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Discussion Notes & MOM</label>
                  <textarea
                    rows={8}
                    value={discussionNotes}
                    onChange={(e) => setDiscussionNotes(e.target.value)}
                    placeholder="Enter Discussion Notes..."
                    className={`${baseInputStyle} resize-y min-h-[180px]`}
                  />
                </div>
              </div>
            )}

            {/* ══════════════ TAB 2: SALES ATTACHMENTS ══════════════ */}
            {activeTab === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Document Type from Master */}
                  <div className="relative">
                    <label className={labelStyle}>
                      Document Type
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className={baseInputStyle}
                    >
                      <option value="">Select Document Type...</option>
                      {docTypes.map((d) => (
                        <option key={d.id} value={d.value}>
                          {d.label || d.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Linked Enquiry / Reference No. */}
                  <div className="relative">
                    <label className={labelStyle}>Enquiry ID / Quotation Ref</label>
                    <input
                      type="text"
                      value={enquiryRef}
                      onChange={(e) => setEnquiryRef(e.target.value)}
                      placeholder="e.g. ENQ-2026-089 or QUO-102"
                      className={baseInputStyle}
                    />
                  </div>

                  {/* Remarks / Purpose */}
                  <div className="relative md:col-span-2">
                    <label className={labelStyle}>Attachment Remarks / Description</label>
                    <input
                      type="text"
                      value={attachmentRemarks}
                      onChange={(e) => setAttachmentRemarks(e.target.value)}
                      placeholder="Enter details, description or purpose of this sales attachment..."
                      className={baseInputStyle}
                    />
                  </div>

                  {/* Docs Attachments Browse Row */}
                  <div className="relative md:col-span-2">
                    <label className={labelStyle}>
                      Docs Attachments
                    </label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <div
                        className="grow px-4 py-2.5 text-gray-500 text-xs italic truncate"
                        title={attachments.map((f) => f.name).join(", ")}
                      >
                        {attachments.length > 0
                          ? `${attachments.length} file(s) selected: ${attachments.map((f) => f.name).join(", ")}`
                          : "Choose files..."}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#154068] text-white px-6 font-bold text-sm hover:bg-[#0d3357] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Paperclip size={14} />
                        Browse
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Upload supporting documents, quotations, proposals or site photos
                    </p>

                    {/* Selected / Attached Files List */}
                    {attachments.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3 border border-gray-200 rounded-xl bg-slate-50 flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 text-[#154068]">
                                {att.isImage ? "🖼️" : "📄"}
                              </div>
                              <div className="truncate text-left">
                                <p className="text-xs font-semibold text-gray-800 truncate" title={att.name}>
                                  {att.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {(att.size / 1024).toFixed(0)} KB • {att.documentType || documentType || "Document"}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition cursor-pointer shrink-0"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FOLLOW-UP & REMINDERS */}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-200">
                {/* Follow-Up Date */}
                <div className="relative">
                  <label className={labelStyle}>Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>

                {/* Next Follow-Up Date */}
                <div className="relative">
                  <label className={labelStyle}>Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className={baseInputStyle}
                  />
                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {intervals.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => applyIntervalPreset(item.value)}
                        className="text-[11px] font-bold px-2.5 py-1 bg-[#154068]/5 text-[#154068] border border-[#154068]/20 rounded-md hover:bg-[#154068]/10 transition cursor-pointer"
                      >
                        +{item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Level */}
                <div className="relative">
                  <label className={labelStyle}>Priority Level</label>
                  <select
                    value={followUpPriorityId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setFollowUpPriorityId(selId);
                      const matched = priorities.find((p) => String(p.id) === selId);
                      if (matched) {
                        setPriority(matched.priorityName as any);
                      } else {
                        setPriority("");
                      }
                    }}
                    className={baseInputStyle}
                  >
                    <option value="">Select Priority Level...</option>
                    {priorities.map((prio) => (
                      <option key={prio.id} value={prio.id}>
                        {prio.priorityName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Follow-Up Status */}
                <div className="relative">
                  <label className={labelStyle}>Follow-Up Status</label>
                  <select
                    value={followUpStatusId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setFollowUpStatusId(selId);
                      const matched = customerStatuses.find(
                        (cs) => String(cs.customerStatusId) === selId
                      );
                      if (matched) {
                        setFollowUpStatus(matched.statusName);
                      } else {
                        setFollowUpStatus("");
                      }
                    }}
                    className={baseInputStyle}
                  >
                    <option value="">Select Follow-Up Status...</option>
                    {customerStatuses.map((cs) => (
                      <option key={cs.customerStatusId} value={cs.customerStatusId}>
                        {cs.statusName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remarks / Next Action Details */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Remarks / Next Action Details</label>
                  <textarea
                    rows={3}
                    value={nextActionDetails}
                    onChange={(e) => setNextActionDetails(e.target.value)}
                    placeholder="Enter follow-up details, agenda or discussion outcome..."
                    className={`${baseInputStyle} resize-y`}
                  />
                </div>

                {/* REMINDER SECTION */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#154068]/10 text-[#154068] flex items-center justify-center">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#154068] uppercase tracking-wider">
                        Reminder Configuration
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Schedule automated alerts and notifications for this sales activity
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reminder Title */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Reminder Title / Subject</label>
                  <input
                    type="text"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="e.g. Follow-up call regarding technical quotation..."
                    className={baseInputStyle}
                  />
                </div>

                {/* Reminder Date */}
                <div className="relative">
                  <label className={labelStyle}>Reminder Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>

                {/* Reminder Time */}
                <div className="relative">
                  <label className={labelStyle}>Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>

                {/* Assigned To */}
                <div className="relative">
                  <label className={labelStyle}>Assigned To</label>
                  <select
                    value={reminderAssignedTo}
                    onChange={(e) => setReminderAssignedTo(e.target.value)}
                    className={baseInputStyle}
                  >
                    <option value="">Select Assignee...</option>
                    {bdeUsers.map((bde) => (
                      <option key={bde.id} value={bde.id}>
                        {bde.value || bde.code || `User #${bde.id}`}
                      </option>
                    ))}
                    {bdeUsers.length === 0 &&
                      employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Reminder Priority */}
                <div className="relative">
                  <label className={labelStyle}>Reminder Priority</label>
                  <select
                    value={reminderPriorityId}
                    onChange={(e) => setReminderPriorityId(e.target.value)}
                    className={baseInputStyle}
                  >
                    <option value="">Select Priority...</option>
                    {priorities.map((prio) => (
                      <option key={prio.id} value={prio.id}>
                        {prio.priorityName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reminder Status */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Reminder Status</label>
                  <select
                    value={reminderStatusId}
                    onChange={(e) => setReminderStatusId(e.target.value)}
                    className={baseInputStyle}
                  >
                    <option value="">Select Reminder Status...</option>
                    {customerStatuses.map((cs) => (
                      <option key={cs.customerStatusId} value={cs.customerStatusId}>
                        {cs.statusName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reminder Remarks */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Reminder Remarks / Details</label>
                  <textarea
                    rows={2}
                    value={reminderRemarks}
                    onChange={(e) => setReminderRemarks(e.target.value)}
                    placeholder="Enter reminder instructions or specific notes for assignee..."
                    className={`${baseInputStyle} resize-y`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions Matching Employee / Customer Module */}
          <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={buttonStyles.cancel}
            >
              Cancel
            </button>

            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab - 1)}
                className={buttonStyles.back}
              >
                Back
              </button>
            )}

            {activeTab < tabs.length - 1 && (
              <button
                type="button"
                onClick={() => handleTabChange(activeTab + 1)}
                className={buttonStyles.next}
              >
                Next
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={buttonStyles.save}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Saving...
                </span>
              ) : (
                "Save Activity"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <div className="w-full max-w-7xl overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
