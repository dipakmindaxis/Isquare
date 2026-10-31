import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Building,
  Clock,
  Paperclip,
  Trash2,
  Download,
  UserPlus,
  Mail,
  Phone,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ActivityAttachment,
  ActivityStatus,
  ActivityType,
  CustomerOption,
  EmployeeOption,
  SalesActivity,
  SalesActivityUpdatePayload,
  RelatedRecordOption,
} from "../Types/SalesActivityTypes";
import {
  updateSalesActivity,
  getCustomerOptions,
  getEmployeeOptions,
  getActivityOutcomes,
  getFollowUpIntervals,
  getDocumentTypes,
  getAllActivityTypes,
  getAllCustomerStatuses,
  getContactsForCustomer,
  getUserRoleCategory,
  getRoleBasedAssignees,
  getAssigneeTeams,
  getPrioritiesWithFallback,
  getRelatedRecordOptions,
  type Contact,
  type AssigneeOption,
  type PriorityOptionItem,
} from "../Services/SalesActivityService";
import type {
  ActivityOutcomeItem,
  FollowUpIntervalItem,
  DocumentTypeItem,
  MasterActivityType,
  CustomerStatus,
} from "../Services/SalesActivityService";
import { uploadSalesAttachment } from "../../Master/SalesAttachments/Services/SalesAttachmentService";
import { updateActivityType } from "../../Master/ActivityType/Services/ActivityTypeService";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { createReminder } from "../../Master/Reminder/Services/ReminderService";
import { createFollowUp } from "../../Master/FollowUp/Services/FollowUpService";
import { AddActivityContactModal } from "./AddActivityContactModal";
import { useAuth } from "../../../../../hooks/useAuth";
import { getCustomerById } from "../../Customer/Services/CustomerService";

interface CompanySalesRep {
  id: string;
  name: string;
  role: string;
  rawName: string;
}

interface EditSalesActivityModalProps {
  isOpen: boolean;
  activity: SalesActivity | null;
  onClose: () => void;
  onSuccess: () => void;
  isModal?: boolean;
}

const getRelativeDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

export const EditSalesActivityModal: React.FC<EditSalesActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSuccess,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const userRoleCategory = getUserRoleCategory(user?.role);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanName = (val?: string | null) => {
    if (!val) return "";
    return val.replace(/\s*\((Director|BDE|Sales Rep|Sales Representative|Coordinator|Sales Coordinator)\)/gi, "").trim();
  };

  // Dropdown Master Data
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [roleAssignees, setRoleAssignees] = useState<AssigneeOption[]>([]);
  const [companySalesReps, setCompanySalesReps] = useState<CompanySalesRep[]>([]);
  const [teams, setTeams] = useState<AssigneeOption[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<PriorityOptionItem[]>([]);
  const [, setOutcomes] = useState<ActivityOutcomeItem[]>([]);
  const [intervals, setIntervals] = useState<FollowUpIntervalItem[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentTypeItem[]>([]);
  const [masterActivityTypes, setMasterActivityTypes] = useState<MasterActivityType[]>([]);
  const [customerStatuses, setCustomerStatuses] = useState<CustomerStatus[]>([]);
  const [statusDescription, setStatusDescription] = useState<string>("");

  // Tab 0: Activity Details
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [companyContacts, setCompanyContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState<boolean>(false);
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>("");
  const [assignedEmployeeName, setAssignedEmployeeName] = useState<string>("");
  const [assignedType, setAssignedType] = useState<"Employee" | "Team">("Employee");
  const [assignedTeamId, setAssignedTeamId] = useState<string>("");
  const [assignedTeamName, setAssignedTeamName] = useState<string>("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [activityDate, setActivityDate] = useState<string>("");
  const [activityTime, setActivityTime] = useState<string>("");
  const [status, setStatus] = useState<ActivityStatus | "">("");
  const [subType, setSubType] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Tab 1: Discussion & Notes
  const [subject, setSubject] = useState<string>("");
  const [discussionNotes, setDiscussionNotes] = useState<string>("");

  // Tab 2: Sales Attachments (Beside Discussion & Notes)
  const [documentType, setDocumentType] = useState<string>("");
  const [enquiryRef, setEnquiryRef] = useState<string>("");
  const [relatedOptions, setRelatedOptions] = useState<RelatedRecordOption[]>([]);
  const [attachmentRemarks, setAttachmentRemarks] = useState<string>("");
  const [attachments, setAttachments] = useState<ActivityAttachment[]>([]);

  // Tab 3: Follow-Up & Reminders
  const [nextActionDate, setNextActionDate] = useState<string>("");
  const [priority, setPriority] = useState<"Urgent" | "High" | "Medium" | "Low" | string>("Medium");
  const [nextActionDetails, setNextActionDetails] = useState<string>("");
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

  // Populate from existing activity
  useEffect(() => {
    if (isOpen && activity) {
      setActiveTab(0);
      setIsSubmitted(false);
      setActivityType(activity.activityType || "");
      setSubject(activity.subject || "");
      setCustomerId(activity.customerId || "");
      setCustomerName(activity.customerName || "");
      setContactPerson(activity.contactPerson || "");
      setContactPhone(activity.contactPhone || "");
      setContactEmail(activity.contactEmail || "");
      if (activity.customerId) {
        setIsLoadingContacts(true);
        getContactsForCustomer(activity.customerId)
          .then((list) => {
            setCompanyContacts(list);
          })
          .catch(() => {})
          .finally(() => {
            setIsLoadingContacts(false);
          });
      } else {
        setCompanyContacts([]);
      }
      if (activity.assignedType === "Team" || activity.assignedTeamName) {
        setAssignedType("Team");
        setAssignedTeamId(String(activity.assignedTeamId || ""));
        setAssignedTeamName(activity.assignedTeamName || "");
      } else {
        setAssignedType("Employee");
        setAssignedEmployeeId(activity.assignedEmployeeId || "");
        setAssignedEmployeeName(activity.assignedEmployeeName || "");
      }
      setActivityDate(activity.activityDate || "");
      setActivityTime(activity.activityTime || "");
      setStatus(activity.status || "");
      setStatusDescription(activity.statusDescription || "");
      setDiscussionNotes(activity.discussionNotes || "");
      setOutcome(activity.outcome || activity.callOutcome || "");
      setSubType(activity.activitySubType || activity.callType || activity.meetingType || "");
      setLocation(activity.location || "");
      setPriority(activity.priority || "Medium");
      setNextActionDetails(activity.nextActionDetails || "");
      setFollowUpDate(activity.followUpDate || activity.activityDate || "");
      setFollowUpStatus(activity.followUpStatus || "");
      setFollowUpPriorityId(activity.followUpPriorityId || "");
      setFollowUpStatusId(activity.followUpStatusId || "");
      setReminderTitle(`Reminder: ${activity.customerName || activity.subject || "Sales Activity"}`);
      setReminderDate(activity.nextActionDate || activity.activityDate || "");
      setReminderTime(activity.activityTime || "10:00");
      setReminderAssignedTo(activity.assignedEmployeeId || "");
      setReminderPriorityId(activity.followUpPriorityId || "");
      setReminderStatusId(activity.followUpStatusId || "");
      setReminderRemarks(activity.nextActionDetails || "");
      setDocumentType(activity.documentCategory || "");
      setEnquiryRef(activity.relatedRecordCode || "");
      setAttachmentRemarks("");

      const existingFiles: ActivityAttachment[] = [
        ...(activity.photographs || []),
        ...(activity.documents || []),
      ];
      setAttachments(existingFiles);

      const loadOptions = async () => {
        try {
          const [
            cData,
            eData,
            actOutcomes,
            invs,
            actTypes,
            custStatuses,
            dTypes,
            roleList,
            teamList,
            prioWithFb,
            enqList,
          ] = await Promise.all([
            getCustomerOptions(),
            getEmployeeOptions(),
            getActivityOutcomes(),
            getFollowUpIntervals(),
            getAllActivityTypes(),
            getAllCustomerStatuses(),
            getDocumentTypes(),
            getRoleBasedAssignees(userRoleCategory),
            getAssigneeTeams(),
            getPrioritiesWithFallback(),
            getRelatedRecordOptions(activity.customerId),
          ]);

          setCustomers(cData);
          setEmployees(eData);
          setRoleAssignees(roleList);
          setTeams(teamList);
          setPriorityOptions(prioWithFb);
          setOutcomes(actOutcomes.filter((o: any) => o.isActive));
          setIntervals(invs.filter((i: any) => i.isActive));
          setMasterActivityTypes(actTypes.filter((a: any) => a.isActive));
          setCustomerStatuses(custStatuses.filter((s: any) => s.isActive));
          setDocTypes(dTypes.filter((d: any) => d.isActive));
          setRelatedOptions(enqList);

          if (activity.customerId) {
            const matchedCust = cData.find((c) => String(c.id) === String(activity.customerId));
            let custData: any = matchedCust;
            if (matchedCust && !custData.directorName && !custData.bdeUserName) {
              try {
                const fullCust = await getCustomerById(Number(activity.customerId));
                if (fullCust) {
                  custData = {
                    ...matchedCust,
                    ...fullCust,
                    directorId: fullCust.directorId ?? (fullCust as any).DirectorId,
                    directorName: fullCust.directorName ?? (fullCust as any).DirectorName,
                    bdeUserId: fullCust.bdeUserId ?? (fullCust as any).BDEUserId,
                    bdeUserName: fullCust.bdeUserName ?? (fullCust as any).BDEUserName,
                    salesCoordinatorId: fullCust.salesCoordinatorId ?? (fullCust as any).SalesCoordinatorId,
                    salesCoordinatorName: fullCust.salesCoordinatorName ?? (fullCust as any).SalesCoordinatorName,
                  };
                }
              } catch {}
            }
            if (custData) {
              const reps: CompanySalesRep[] = [];
              const seen = new Set<string>();

              const bdeName = cleanName(custData.bdeUserName || custData.BDEUserName);
              const bdeId = custData.bdeUserId || custData.BDEUserId;
              if (bdeName || bdeId) {
                const idStr = String(bdeId || `bde-${bdeName}`);
                if (!seen.has(idStr)) {
                  seen.add(idStr);
                  reps.push({
                    id: idStr,
                    name: `${bdeName || "BDE User"} (BDE)`,
                    role: "BDE",
                    rawName: bdeName || "BDE User",
                  });
                }
              }

              const dirName = cleanName(custData.directorName || custData.DirectorName);
              const dirId = custData.directorId || custData.DirectorId;
              if (dirName || dirId) {
                const idStr = String(dirId || `dir-${dirName}`);
                if (!seen.has(idStr)) {
                  seen.add(idStr);
                  reps.push({
                    id: idStr,
                    name: `${dirName || "Director"} (Director)`,
                    role: "Director",
                    rawName: dirName || "Director",
                  });
                }
              }

              const scName = cleanName(custData.salesCoordinatorName || custData.SalesCoordinatorName);
              const scId = custData.salesCoordinatorId || custData.SalesCoordinatorId;
              if (scName || scId) {
                const idStr = String(scId || `sc-${scName}`);
                if (!seen.has(idStr)) {
                  seen.add(idStr);
                  reps.push({
                    id: idStr,
                    name: `${scName || "Coordinator"} (Sales Coordinator)`,
                    role: "Coordinator",
                    rawName: scName || "Coordinator",
                  });
                }
              }

              setCompanySalesReps(reps);
            }
          }

          // Auto-match priorityId and statusId if existing
          if (activity.priority) {
            const matchedPrio = prioWithFb.find(
              (p: any) => p.name.toLowerCase() === activity.priority?.toLowerCase()
            );
            if (matchedPrio) {
              setFollowUpPriorityId(matchedPrio.id);
              setReminderPriorityId(matchedPrio.id);
            }
          }
          if (activity.followUpStatus) {
            const matchedStatus = custStatuses.find(
              (s: any) => s.statusName.toLowerCase() === activity.followUpStatus?.toLowerCase()
            );
            if (matchedStatus) {
              setFollowUpStatusId(matchedStatus.customerStatusId);
              setReminderStatusId(matchedStatus.customerStatusId);
            }
          }
        } catch {
          toast.error("Failed to load options.");
        }
      };
      loadOptions();
    }
  }, [isOpen, activity, userRoleCategory]);

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

  if (!isOpen || !activity) return null;

  const handleCustomerChange = async (selectedCustomerId: string) => {
    setCustomerId(selectedCustomerId);
    getRelatedRecordOptions(selectedCustomerId).then(setRelatedOptions).catch(() => {});
    const matched = customers.find((c) => String(c.id) === String(selectedCustomerId));
    if (matched) {
      const cName = matched.companyName || matched.name;
      setCustomerName(cName);

      // Fetch complete customer details to guarantee Director & BDE User are loaded
      let custData: any = matched;
      if (!custData.directorName && !custData.bdeUserName) {
        try {
          const fullCust = await getCustomerById(Number(selectedCustomerId));
          if (fullCust) {
            custData = {
              ...matched,
              ...fullCust,
              directorId: fullCust.directorId ?? (fullCust as any).DirectorId,
              directorName: fullCust.directorName ?? (fullCust as any).DirectorName,
              bdeUserId: fullCust.bdeUserId ?? (fullCust as any).BDEUserId,
              bdeUserName: fullCust.bdeUserName ?? (fullCust as any).BDEUserName,
              salesCoordinatorId: fullCust.salesCoordinatorId ?? (fullCust as any).SalesCoordinatorId,
              salesCoordinatorName: fullCust.salesCoordinatorName ?? (fullCust as any).SalesCoordinatorName,
            };
          }
        } catch {
          // fallback to matched
        }
      }

      // Build customer-specific Sales Reps (Director & BDE selected during customer creation)
      const reps: CompanySalesRep[] = [];
      const seen = new Set<string>();

      const bdeName = cleanName(custData.bdeUserName || custData.BDEUserName);
      const bdeId = custData.bdeUserId || custData.BDEUserId;
      if (bdeName || bdeId) {
        const idStr = String(bdeId || `bde-${bdeName}`);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          reps.push({
            id: idStr,
            name: `${bdeName || "BDE User"} (BDE)`,
            role: "BDE",
            rawName: bdeName || "BDE User",
          });
        }
      }

      const dirName = cleanName(custData.directorName || custData.DirectorName);
      const dirId = custData.directorId || custData.DirectorId;
      if (dirName || dirId) {
        const idStr = String(dirId || `dir-${dirName}`);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          reps.push({
            id: idStr,
            name: `${dirName || "Director"} (Director)`,
            role: "Director",
            rawName: dirName || "Director",
          });
        }
      }

      const scName = cleanName(custData.salesCoordinatorName || custData.SalesCoordinatorName);
      const scId = custData.salesCoordinatorId || custData.SalesCoordinatorId;
      if (scName || scId) {
        const idStr = String(scId || `sc-${scName}`);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          reps.push({
            id: idStr,
            name: `${scName || "Coordinator"} (Sales Coordinator)`,
            role: "Coordinator",
            rawName: scName || "Coordinator",
          });
        }
      }

      setCompanySalesReps(reps);

      // Automatic selection of Sales Rep for this Company
      if (reps.length > 0) {
        const defaultRep = reps.find((r) => r.role === "BDE") || reps.find((r) => r.role === "Director") || reps[0];
        setAssignedEmployeeId(defaultRep.id);
        setAssignedEmployeeName(defaultRep.rawName);
      } else {
        setAssignedEmployeeId("");
        setAssignedEmployeeName("");
      }
      setIsLoadingContacts(true);
      try {
        const contactList = await getContactsForCustomer(selectedCustomerId);
        setCompanyContacts(contactList);
        if (contactList && contactList.length > 0) {
          const first = contactList[0];
          setContactPerson(first.fullName);
          setContactPhone(first.mobileNo || first.altMobileNo || "");
          setContactEmail(first.emailAddress || first.altEmailAddress || "");
        } else if (matched.contactPerson) {
          setContactPerson(matched.contactPerson);
          setContactPhone(matched.phone || "");
          setContactEmail(matched.email || "");
        } else {
          setContactPerson("");
          setContactPhone(matched.phone || "");
          setContactEmail(matched.email || "");
        }
      } catch (err) {
        console.error("Failed to load contacts for company:", err);
      } finally {
        setIsLoadingContacts(false);
      }
    } else {
      setCustomerName("");
      setCompanyContacts([]);
      setContactPerson("");
      setContactPhone("");
      setContactEmail("");
    }
  };

  const handleContactPersonChange = (selectedVal: string) => {
    if (selectedVal === "__add_new__") {
      if (!customerId) {
        toast.error("Please select a company first.");
        return;
      }
      setIsAddContactModalOpen(true);
      return;
    }
    setContactPerson(selectedVal);
    const matched = companyContacts.find((c) => c.fullName === selectedVal);
    if (matched) {
      setContactPhone(matched.mobileNo || matched.altMobileNo || "");
      setContactEmail(matched.emailAddress || matched.altEmailAddress || "");
    }
  };

  const handleEmployeeChange = (selectedEmpId: string) => {
    setAssignedEmployeeId(selectedEmpId);
    const matchedRep = companySalesReps.find((r) => r.id === selectedEmpId);
    if (matchedRep) {
      setAssignedEmployeeName(matchedRep.rawName);
      return;
    }
    const matchedRole = roleAssignees.find((r) => r.id === selectedEmpId);
    if (matchedRole) {
      setAssignedEmployeeName(cleanName(matchedRole.name));
      return;
    }
    const matched = employees.find((e) => e.id === selectedEmpId);
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
      setActiveTab(0);
      return;
    }

    const finalSubject =
      subject.trim() || `${activityType}: ${customerName.trim()}`;
    const finalNotes =
      discussionNotes.trim() ||
      `Updated ${activityType.toLowerCase()} discussion with client.`;

    const payload: SalesActivityUpdatePayload = {
      id: activity.id,
      activityType: activityType as ActivityType,
      subject: finalSubject,
      customerId: customerId || activity.customerId,
      customerName: customerName.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      assignedEmployeeId: assignedEmployeeId || activity.assignedEmployeeId,
      assignedEmployeeName:
        assignedEmployeeName.trim() || activity.assignedEmployeeName,
      activityDate,
      activityTime,
      status: status as ActivityStatus,
      statusDescription: statusDescription.trim() || undefined,
      discussionNotes: finalNotes,
      outcome: outcome.trim() || undefined,

      callType: activityType === "Phone Call" ? subType : undefined,
      meetingType:
        activityType.includes("Meeting") || activityType.includes("Visit")
          ? subType
          : undefined,
      activitySubType: subType.trim() || undefined,
      location: location.trim() || undefined,

      // Follow-Up & Reminder Tracker
      followUpDate: followUpDate || undefined,
      nextActionDate: nextActionDate || undefined,
      dueTime: reminderTime || "10:30 AM",
      priority: priority || "Medium",
      followUpPriorityId: followUpPriorityId ? Number(followUpPriorityId) : undefined,
      followUpStatusId: followUpStatusId ? Number(followUpStatusId) : undefined,
      followUpStatus: followUpStatus || undefined,
      nextActionDetails: nextActionDetails.trim() || undefined,
      assignedType: assignedType,
      assignedTeamId: assignedType === "Team" ? assignedTeamId : undefined,
      assignedTeamName: assignedType === "Team" ? assignedTeamName : undefined,
      reminderTitle: reminderTitle.trim() || undefined,
      reminderDate: reminderDate || nextActionDate || undefined,
      reminderTime: reminderTime || undefined,
      reminderPriorityId: reminderPriorityId ? Number(reminderPriorityId) : undefined,
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
      await updateSalesActivity(payload);
      // Upload any new raw files via uploadSalesAttachment
      const actId = Number(activity.id) || null;
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

      // Sync Subject / Purpose & Discussion Notes to ActivityType in backend
      const matchedAct = masterActivityTypes.find(
        (a) => a.activityName.toLowerCase() === (activityType || "").toLowerCase()
      );
      if (matchedAct && matchedAct.id) {
        try {
          await updateActivityType(matchedAct.id, {
            id: matchedAct.id,
            activityName: matchedAct.activityName,
            activitySubType: subType.trim() || matchedAct.activitySubType || "",
            subjectPurpose: finalSubject,
            discussionNotesMOM: finalNotes,
            isActive: true,
            isDeleted: false,
          });
        } catch (actErr) {
          console.warn("Syncing ActivityType subjectPurpose/discussionNotesMOM error:", actErr);
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

      toast.success("Sales activity updated successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update sales activity.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrorsInTab = (tabIdx: number): boolean => {
    if (tabIdx === 0 && isSubmitted) {
      if (userRoleCategory === "Director") {
        return !customerId || !activityType || !activityDate || !activityTime || !status;
      }
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
        {/* Customer & Activity Form Header */}
        <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Edit Sales Activity
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
          <div className="p-5 sm:p-6">
            {/* TAB 0: ACTIVITY DETAILS */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-200">
                {/* Company Name */}
                <div className="relative">
                  <label className={labelStyle}>
                    Company Name <RequiredAst />
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={`${baseInputStyle} ${
                      isSubmitted && !customerId ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Company / Customer Account...</option>
                    {customers.map((c) => {
                      const displayTitle =
                        c.companyName && c.companyName !== c.name
                          ? `${c.companyName} (${c.name})`
                          : c.name || c.companyName;
                      return (
                        <option key={c.id} value={c.id}>
                          {displayTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Assigned Sales Rep / Director - Role Based Visibility */}
                {userRoleCategory !== "Director" ? (
                  <div className="relative">
                    <label className={labelStyle}>
                      {userRoleCategory === "BDE"
                        ? "Assigned Director"
                        : userRoleCategory === "SalesPerson"
                        ? "Assigned BDE User"
                        : "Assigned Sales Rep"} <RequiredAst />
                    </label>
                    <select
                      value={assignedEmployeeId}
                      onChange={(e) => handleEmployeeChange(e.target.value)}
                      disabled={!customerId}
                      className={`${baseInputStyle} ${
                        isSubmitted && !assignedEmployeeId ? "border-red-500" : ""
                      }`}
                      required
                    >
                      <option value="">
                        {!customerId ? "Select a company first..." : "Select Sales Representative..."}




                      </option>
                      {companySalesReps.length > 0
                        ? companySalesReps.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name}
                            </option>
                          ))
                        : roleAssignees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {cleanName(e.name)} {e.role ? `(${e.role})` : ""}
                        </option>
                      ))}
                      {false && roleAssignees.length === 0 &&
                        employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="relative">
                    <label className={labelStyle}>Activity Creator / Owner</label>
                    <div className="w-full rounded-lg px-4 py-2.5 border border-slate-200 bg-slate-50 text-sm text-slate-700 font-semibold flex items-center justify-between min-h-[42px]">
                      <span>{assignedEmployeeName || user?.name || "Director"}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Director (Self)
                      </span>
                    </div>
                  </div>
                )}

                {/* Contact Person */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block">
                      Contact Person
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customerId) {
                          toast.error("Please select a company first.");
                          return;
                        }
                        setIsAddContactModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7900] hover:text-[#e06800] hover:underline cursor-pointer transition"
                    >
                      <UserPlus size={12} />
                      <span>+ Add Contact</span>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={contactPerson}
                      onChange={(e) => handleContactPersonChange(e.target.value)}
                      className={baseInputStyle}
                      disabled={isLoadingContacts || !customerId}
                    >
                      <option value="">
                        {!customerId
                          ? "Select a company first..."
                          : isLoadingContacts
                          ? "Loading contact persons..."
                          : companyContacts.length === 0
                          ? "No contacts found - click + Add Contact"
                          : "Select Contact Person..."}
                      </option>
                      {companyContacts.map((c) => (
                        <option key={c.contactId || c.fullName} value={c.fullName}>
                          {c.fullName} {c.designation ? `(${c.designation})` : ""}
                        </option>
                      ))}
                      {contactPerson &&
                        !companyContacts.some((c) => c.fullName === contactPerson) && (
                          <option value={contactPerson}>{contactPerson}</option>
                        )}
                      {customerId && (
                        <option value="__add_new__" className="font-semibold text-[#FF7900]">
                          + Add New Contact...
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="relative">
                  <label className={labelStyle}>Contact Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter Contact Phone"
                      className={baseInputStyle}
                    />
                    <Phone size={15} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="relative">
                  <label className={labelStyle}>Contact Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Enter Contact Email ID"
                      className={baseInputStyle}
                    />
                    <Mail size={15} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Activity Type */}
                <div className="relative">
                  <label className={labelStyle}>
                    Activity Type <RequiredAst />
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => {
                      const newType = e.target.value as ActivityType;
                      setActivityType(newType);
                      const matchedAct = masterActivityTypes.find(
                        (a) => a.activityName === newType
                      );
                      if (matchedAct) {
                        if (matchedAct.activitySubType) {
                          setSubType(matchedAct.activitySubType);
                        }
                        if (matchedAct.subjectPurpose) {
                          setSubject(matchedAct.subjectPurpose);
                        }
                        if (matchedAct.discussionNotesMOM) {
                          setDiscussionNotes(matchedAct.discussionNotesMOM);
                        }
                      }
                    }}
                    className={`${baseInputStyle} ${
                      isSubmitted && !activityType ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Activity Type...</option>
                    {masterActivityTypes.map((act) => (
                      <option key={act.id} value={act.activityName}>
                        {act.activityName}
                      </option>
                    ))}
                    {activityType &&
                      !masterActivityTypes.some(
                        (a) => a.activityName === activityType
                      ) && <option value={activityType}>{activityType}</option>}
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
                    {customerStatuses.map((cs) => (
                      <option key={cs.customerStatusId} value={cs.statusName}>
                        {cs.statusName}
                      </option>
                    ))}
                    {status &&
                      !customerStatuses.some(
                        (cs) => cs.statusName.toLowerCase() === status.toLowerCase()
                      ) && <option value={status}>{status}</option>}
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

                {/* Sub-Type */}
                <div className="relative">
                  <label className={labelStyle}>
                    {activityType === "Phone Call" || activityType.toLowerCase().includes("call")
                      ? "Call Sub-Type / Details"
                      : "Meeting / Activity Sub-Type"}
                  </label>
                  <input
                    type="text"
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    placeholder={
                      activityType === "Phone Call" || activityType.toLowerCase().includes("call")
                        ? "Enter call sub-type (e.g. Discovery, Cold Call, Follow-up)..."
                        : "Enter meeting / activity sub-type (e.g. Demo, Site Audit, Tech Review)..."
                    }
                    className={baseInputStyle}
                  />
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
                <div className="relative">
                  <label className={labelStyle}>Location / Mode</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location / Mode (e.g. Client Office, On-site, Zoom, Plant)"
                    className={baseInputStyle}
                  />
                </div>

                {/* Subject / Purpose */}
                <div className="relative">
                  <label className={labelStyle}>Subject / Purpose</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter Subject / Purpose"
                    className={baseInputStyle}
                  />
                </div>

                {/* Discussion Notes & MOM */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Discussion Notes & MOM</label>
                  <textarea
                    rows={4}
                    value={discussionNotes}
                    onChange={(e) => setDiscussionNotes(e.target.value)}
                    placeholder="Enter Discussion Notes..."
                    className={`${baseInputStyle} resize-y min-h-[110px]`}
                  />
                </div>
              </div>
            )}

            {/* ══════════════ TAB 1: SALES ATTACHMENTS ══════════════ */}
            {activeTab === 1 && (
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

                  {/* Docs Attachments Browse */}
                  <div className="relative">
                    <label className={labelStyle}>
                      Docs Attachments
                    </label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white min-h-[42px]">
                      <div
                        className="grow px-4 py-2.5 text-gray-500 text-xs italic truncate"
                        title={attachments.map((f) => f.name).join(", ")}
                      >
                        {attachments.length > 0
                          ? `${attachments.length} file(s) attached`
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
                        className="bg-[#154068] text-white px-5 font-bold text-xs hover:bg-[#0d3357] transition-colors cursor-pointer flex items-center gap-2 shrink-0"
                      >
                        <Paperclip size={14} />
                        Browse
                      </button>
                    </div>
                  </div>

                  {/* Master Linked Enquiry ID */}
                  <div className="relative">
                    <label className={labelStyle}>Enquiry ID</label>
                    <select
                      value={enquiryRef}
                      onChange={(e) => setEnquiryRef(e.target.value)}
                      className={baseInputStyle}
                    >
                      <option value="">Select Enquiry ID...</option>
                      {relatedOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.title || opt.code}
                        </option>
                      ))}
                      {enquiryRef &&
                        !relatedOptions.some((opt) => opt.code === enquiryRef) && (
                          <option value={enquiryRef}>{enquiryRef}</option>
                        )}
                    </select>
                  </div>

                  {/* Supported File Formats */}
                  <div className="relative">
                    <label className={labelStyle}>Supported File Types</label>
                    <div className="w-full rounded-lg px-4 py-2.5 border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-600 flex items-center justify-between min-h-[42px]">
                      <span>PDF, Word, Excel, Images (Max 10MB)</span>
                      <span className="text-[10px] text-gray-400 font-medium">Multiple files allowed</span>
                    </div>
                  </div>
                </div>

                {/* Attached Files List */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                        <div className="flex items-center gap-1 shrink-0">
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-[#154068] p-1 rounded-md hover:bg-white transition cursor-pointer"
                              title="Download / View"
                            >
                              <Download size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FOLLOW-UP & REMINDERS */}
            {activeTab === 2 && (
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

                {/* Priority Level with Urgent, High, Medium, Low */}
                <div className="relative">
                  <label className={labelStyle}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => {
                      const selVal = e.target.value;
                      setPriority(selVal);
                      const matched = priorityOptions.find(
                        (p) => p.name.toLowerCase() === selVal.toLowerCase()
                      );
                      if (matched) {
                        setFollowUpPriorityId(matched.id);
                        setReminderPriorityId(matched.id);
                      }
                    }}
                    className={baseInputStyle}
                  >
                    <option value="">Select Priority Level</option>
                    {priorityOptions.map((prio) => (
                      <option key={prio.id} value={prio.name}>
                        {prio.name}
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
                    <option value="">Select Follow-Up Status</option>
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
                    placeholder="Enter follow-up remarks or next action details..."
                    className={`${baseInputStyle} resize-y`}
                  />
                </div>

                {/* REMINDER SECTION */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#154068]/10 text-[#154068] flex items-center justify-center">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#154068] uppercase tracking-wider">
                        Reminder Configuration
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Reminder Title & Priority (2 columns) */}
                <div className="relative">
                  <label className={labelStyle}>Reminder Title / Subject</label>
                  <input
                    type="text"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="Enter reminder title or subject..."
                    className={baseInputStyle}
                  />
                </div>

                <div className="relative">
                  <label className={labelStyle}>Reminder Priority</label>
                  <select
                    value={reminderPriorityId}
                    onChange={(e) => setReminderPriorityId(e.target.value)}
                    className={baseInputStyle}
                  >
                    <option value="">Select Priority</option>
                    {priorityOptions.map((prio) => (
                      <option key={prio.id} value={prio.id}>
                        {prio.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reminder Date & Time (2 columns) */}
                <div className="relative">
                  <label className={labelStyle}>Reminder Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>

                <div className="relative">
                  <label className={labelStyle}>Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={baseInputStyle}
                  />
                </div>

                {/* Work Assignment removed - managed in Task Assignment module */}
                {false && (
                <div className="relative md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <label className="text-xs font-bold text-[#154068] uppercase tracking-wider block">
                      Work Assignment
                    </label>
                    {/* Toggle between Employee and Team */}
                    <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignedType("Employee");
                          setAssignedTeamId("");
                          setAssignedTeamName("");
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                          assignedType === "Employee"
                            ? "bg-[#154068] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAssignedType("Team");
                          setReminderAssignedTo("");
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                          assignedType === "Team"
                            ? "bg-[#FF7900] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Team (Coordinator / Accounts / Service / Store)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedType === "Employee" ? (
                      <div>
                        <label className={labelStyle}>Assigned Employee</label>
                        <select
                          value={reminderAssignedTo}
                          onChange={(e) => {
                            setReminderAssignedTo(e.target.value);
                            setAssignedTeamId("");
                            setAssignedTeamName("");
                          }}
                          className={baseInputStyle}
                        >
                          <option value="">Select Employee</option>
                          {roleAssignees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} {emp.role ? `(${emp.role})` : ""}
                            </option>
                          ))}
                          {employees.map((emp) => (
                            <option key={`emp-${emp.id}`} value={emp.id}>
                              {emp.name} (Sales Rep)
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={labelStyle}>Assigned Team</label>
                        <select
                          value={assignedTeamId}
                          onChange={(e) => {
                            const selId = e.target.value;
                            setAssignedTeamId(selId);
                            const matchedTeam = teams.find((t) => t.id === selId);
                            if (matchedTeam) {
                              setAssignedTeamName(matchedTeam.name);
                            } else {
                              setAssignedTeamName("");
                            }
                            setReminderAssignedTo("");
                          }}
                          className={baseInputStyle}
                        >
                          <option value="">Select Team</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        {assignedTeamName && (
                          <p className="text-[11px] text-green-700 font-medium mt-1">
                            ✓ Assigned to: <span className="font-bold">{assignedTeamName}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reminder Status */}
                    <div>
                      <label className={labelStyle}>Reminder Status</label>
                      <select
                        value={reminderStatusId}
                        onChange={(e) => setReminderStatusId(e.target.value)}
                        className={baseInputStyle}
                      >
                        <option value="">Select Reminder Status</option>
                        {customerStatuses.map((cs) => (
                          <option key={cs.customerStatusId} value={cs.customerStatusId}>
                            {cs.statusName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                )}
                {/* Reminder Remarks */}
                <div className="relative md:col-span-2">
                  <label className={labelStyle}>Reminder Remarks / Details</label>
                  <textarea
                    rows={2}
                    value={reminderRemarks}
                    onChange={(e) => setReminderRemarks(e.target.value)}
                    placeholder="Enter reminder instructions or specific notes..."
                    className={`${baseInputStyle} resize-y`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
                  <Loader2 className="animate-spin" size={16} /> Updating...
                </span>
              ) : (
                "Update Activity"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add New Contact Person Modal linked to Customer Master */}
      <AddActivityContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSuccess={(newContact) => {
          setCompanyContacts((prev) => [newContact, ...prev]);
          setContactPerson(newContact.fullName);
          setContactPhone(newContact.mobileNo || "");
          setContactEmail(newContact.emailAddress || "");
        }}
        companyId={customerId}
        companyName={customerName}
      />
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
