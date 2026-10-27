import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Users,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import SalesNavTabs from "../Components/SalesNavTabs";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { AddSalesActivityModal } from "../../SalesActivities/Components/AddSalesActivityModal";
import type { CustomerOption, EmployeeOption } from "../../SalesActivities/Types/SalesActivityTypes";
import {
  getCustomerOptions,
  getEmployeeOptions,
  getFollowUps,
  updateFollowUpRecord,
  deleteFollowUpRecord,
  getSalesModuleCounts,
  getFollowUpIntervals,
  getUserRoleCategory,
  getRoleBasedAssignees,
  getAssigneeTeams,
  getPrioritiesWithFallback,
} from "../../SalesActivities/Services/SalesActivityService";
import type {
  FollowUpItem,
  FollowUpIntervalItem,
  AssigneeOption,
  PriorityOptionItem,
} from "../../SalesActivities/Services/SalesActivityService";
import { useAuth } from "../../../../../hooks/useAuth";

const getRelativeDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

export interface FollowUpsMasterProps {
  isTab?: boolean;
}

export const FollowUpsMaster: React.FC<FollowUpsMasterProps> = ({ isTab = false }) => {
  const { user } = useAuth();
  const userRoleCategory = getUserRoleCategory(user?.role);

  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<"All" | "Overdue" | "Due Today" | "Upcoming" | "Completed">("All");
  const [selectedRep] = useState("All");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [roleAssignees, setRoleAssignees] = useState<AssigneeOption[]>([]);
  const [teams, setTeams] = useState<AssigneeOption[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<PriorityOptionItem[]>([]);
  const [intervals, setIntervals] = useState<FollowUpIntervalItem[]>([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);

  // Form State (Freely Typable)
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formType, setFormType] = useState<FollowUpItem["followUpType"]>("Call Follow-up");
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueTime, setFormDueTime] = useState("10:30 AM");
  const [formAssignedRep, setFormAssignedRep] = useState("");
  const [formAssignedType, setFormAssignedType] = useState<"Employee" | "Team">("Employee");
  const [formAssignedTeamId, setFormAssignedTeamId] = useState("");
  const [formAssignedTeamName, setFormAssignedTeamName] = useState("");
  const [formPriority, setFormPriority] = useState<string>("High");
  const [formPriorityId, setFormPriorityId] = useState("");
  const [formStatus, setFormStatus] = useState<FollowUpItem["status"]>("Due Today");
  const [formRelatedCode, setFormRelatedCode] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadMeta = async () => {
      const [c, e, storedFollowUps, storedIntervals, pList, rAssignees, teamList] = await Promise.all([
        getCustomerOptions(),
        getEmployeeOptions(),
        getFollowUps(),
        getFollowUpIntervals(),
        getPrioritiesWithFallback(),
        getRoleBasedAssignees(userRoleCategory),
        getAssigneeTeams(),
      ]);
      setCustomers(c);
      setEmployees(e);
      setIntervals(storedIntervals.filter((i) => i.isActive));
      setFollowUps(storedFollowUps || []);
      setPriorityOptions(pList);
      if (pList.length > 0) {
        setFormPriority(pList[0].name);
        setFormPriorityId(String(pList[0].id));
      }
      setRoleAssignees(rAssignees);
      setTeams(teamList);
    };
    loadMeta();
  }, [userRoleCategory]);

  const stats = {
    total: followUps.length,
    overdue: followUps.filter((f) => f.status === "Overdue").length,
    dueToday: followUps.filter((f) => f.status === "Due Today").length,
    upcoming: followUps.filter((f) => f.status === "Upcoming").length,
    completed: followUps.filter((f) => f.status === "Completed").length,
  };

  const handleCustomerNameChange = (name: string) => {
    setFormCustomerName(name);
    const matched = customers.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (matched) {
      setFormCustomerId(matched.id);
      if (matched.contactPerson) setFormContactPerson(matched.contactPerson);
      if (matched.phone) setFormContactPhone(matched.phone);
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
    setFormDueDate(getRelativeDate(days));
  };

  const filteredItems = followUps.filter((item) => {
    const matchSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.followUpCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actionDetails.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab =
      selectedStatusTab === "All" || item.status === selectedStatusTab;
    const matchRep = selectedRep === "All" || item.assignedRep === selectedRep;
    return matchSearch && matchTab && matchRep;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormCustomerId("");
    setFormCustomerName("");
    setFormContactPerson("");
    setFormContactPhone("");
    setFormAssignedRep("");
    setFormType("Call Follow-up");
    setFormDueDate(new Date().toISOString().split("T")[0]);
    setFormDueTime("10:30 AM");
    setFormPriority(priorityOptions[0]?.name || "");
    setFormPriorityId(priorityOptions[0]?.id ? String(priorityOptions[0].id) : "");
    setFormStatus("Due Today");
    setFormRelatedCode("");
    setFormDetails("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (f: FollowUpItem) => {
    setSelectedItem(f);
    setFormCustomerId(f.customerId);
    setFormCustomerName(f.customerName);
    setFormContactPerson(f.contactPerson || "");
    setFormContactPhone(f.phone || "");
    setFormType(f.followUpType);
    setFormDueDate(f.dueDate);
    setFormDueTime(f.dueTime);
    setFormAssignedRep(f.assignedRep || "");
    setFormAssignedType(f.assignedType || "Employee");
    setFormAssignedTeamId(f.assignedTeamId || "");
    setFormAssignedTeamName(f.assignedTeamName || "");
    const initialPrio = f.priority || (priorityOptions[0]?.name || "");
    setFormPriority(initialPrio);
    const matchedPrio = priorityOptions.find((p) => p.name.toLowerCase() === initialPrio.toLowerCase());
    setFormPriorityId(f.priorityId || (matchedPrio ? String(matchedPrio.id) : ""));
    setFormStatus(f.status);
    setFormRelatedCode(f.relatedRecordCode || "");
    setFormDetails(f.actionDetails);
    setIsEditOpen(true);
  };

  const handleMarkComplete = async (f: FollowUpItem) => {
    try {
      const updatedItem: FollowUpItem = {
        ...f,
        status: "Completed",
        completionNotes: "Completed on " + new Date().toLocaleDateString(),
      };
      await updateFollowUpRecord(updatedItem);
      const updated = await getFollowUps();
      setFollowUps(updated);
      toast.success(`Follow-up ${f.followUpCode} marked as Completed & synced!`);
    } catch {
      toast.error("Failed to complete follow-up.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!formCustomerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }
    setIsSaving(true);
    try {
      const repName =
        formAssignedType === "Team"
          ? formAssignedTeamName || selectedItem.assignedRep
          : formAssignedRep.trim() || selectedItem.assignedRep;

      const updatedItem: FollowUpItem = {
        ...selectedItem,
        customerId: formCustomerId || selectedItem.customerId,
        customerName: formCustomerName.trim(),
        contactPerson: formContactPerson.trim(),
        phone: formContactPhone.trim(),
        followUpType: formType,
        dueDate: formDueDate,
        dueTime: formDueTime,
        assignedRep: repName,
        assignedType: formAssignedType,
        assignedTeamId: formAssignedType === "Team" ? formAssignedTeamId : undefined,
        assignedTeamName: formAssignedType === "Team" ? formAssignedTeamName : undefined,
        priority: formPriority,
        priorityId: formPriorityId || undefined,
        status: formStatus,
        relatedRecordCode: formRelatedCode.trim() || undefined,
        actionDetails: formDetails.trim(),
      };
      await updateFollowUpRecord(updatedItem);
      const updated = await getFollowUps();
      setFollowUps(updated);
      setIsEditOpen(false);
      toast.success(`Follow-up ${selectedItem.followUpCode} updated.`);
    } catch {
      toast.error("Failed to update follow-up.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteFollowUpRecord(selectedItem.id);
      const updated = await getFollowUps();
      setFollowUps(updated);
      setIsDeleteOpen(false);
      toast.success(`Follow-up ${selectedItem.followUpCode} deleted.`);
    } catch {
      toast.error("Failed to delete follow-up.");
    }
  };

  return (
    <div className={isTab ? "space-y-6" : "p-4 md:p-6 bg-gray-50 min-h-full"}>
      {/* Shared Nav Tabs */}
      {!isTab && <SalesNavTabs counts={getSalesModuleCounts()} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber-50 text-[#00234a] rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Follow-Up Tracker</h1>
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-0.5 rounded-full">
                {stats.overdue} Overdue • {stats.dueToday} Today
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-xs">
              Never miss a client follow-up: track overdue actions, due dates, quotes & callback commitments.
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#00234a] hover:bg-[#001833] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>+ Add Follow-Up</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <button
          type="button"
          onClick={() => setSelectedStatusTab("Overdue")}
          className={`p-4 bg-white rounded-xl border text-left cursor-pointer transition ${
            selectedStatusTab === "Overdue" ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Overdue</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-bold text-red-600">{stats.overdue}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">Needs immediate action</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab("Due Today")}
          className={`p-4 bg-white rounded-xl border text-left cursor-pointer transition ${
            selectedStatusTab === "Due Today" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-amber-600">{stats.dueToday}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">Action scheduled today</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab("Upcoming")}
          className={`p-4 bg-white rounded-xl border text-left cursor-pointer transition ${
            selectedStatusTab === "Upcoming" ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Upcoming</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-bold text-indigo-600">{stats.upcoming}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">Upcoming commitments</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab("Completed")}
          className={`p-4 bg-white rounded-xl border text-left cursor-pointer transition ${
            selectedStatusTab === "Completed" ? "border-green-500 ring-2 ring-green-500/20" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Completed</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">Resolved follow-ups</p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, action details, code..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00234a] transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Overdue", "Due Today", "Upcoming", "Completed"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatusTab(tab as typeof selectedStatusTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedStatusTab === tab
                  ? "bg-[#00234a] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#00234a] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">Code</th>
                <th className="px-5 py-3.5 text-left">Customer & Contact</th>
                <th className="px-4 py-3.5 text-left">Follow-Up Action</th>
                <th className="px-4 py-3.5 text-left">Due Date & Time</th>
                <th className="px-4 py-3.5 text-left">Assigned Rep</th>
                <th className="px-4 py-3.5 text-center">Priority</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No follow-ups found in this view.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-gray-900">
                      {item.followUpCode}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-gray-900 text-xs">
                        {item.customerName}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <User size={11} className="text-gray-400" />
                        <span>{item.contactPerson} ({item.phone})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-sm">
                      <div className="font-medium text-gray-800 text-xs line-clamp-1">
                        {item.actionDetails}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {item.followUpType}
                        </span>
                        {item.relatedRecordCode && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                            {item.relatedRecordCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs">
                      <div
                        className={`font-semibold ${
                          item.status === "Overdue"
                            ? "text-red-600"
                            : item.status === "Due Today"
                            ? "text-amber-600"
                            : "text-gray-800"
                        }`}
                      >
                        {item.dueDate}
                      </div>
                      <div className="text-[11px] text-gray-400">{item.dueTime}</div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">
                      {item.assignedType === "Team" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium">
                          <Users size={11} />
                          <span>{item.assignedTeamName || item.assignedRep}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-800">
                          <User size={12} className="text-gray-400" />
                          <span>{item.assignedRep || "Unassigned"}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {(() => {
                        const matched = priorityOptions.find(
                          (p) => p.name.toLowerCase() === item.priority?.toLowerCase()
                        );
                        const c = matched?.colorCode || (
                          item.priority?.toLowerCase() === "urgent" ? "#ef4444" :
                          item.priority?.toLowerCase() === "high" ? "#f97316" :
                          item.priority?.toLowerCase() === "medium" ? "#3b82f6" : "#64748b"
                        );
                        return (
                          <span
                            className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border"
                            style={{
                              backgroundColor: `${c}15`,
                              color: c,
                              borderColor: `${c}40`,
                            }}
                          >
                            {item.priority || "Normal"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.status === "Overdue"
                            ? "bg-red-50 text-red-700 border-red-300"
                            : item.status === "Due Today"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : item.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        {item.status !== "Completed" && (
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(item)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                            title="Mark as Completed"
                          >
                            Done ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsViewOpen(true);
                          }}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View"
                        >
                          <FaEye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteOpen(true);
                          }}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <span>Showing {filteredItems.length} follow-ups</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded bg-white disabled:text-gray-300"
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded bg-white disabled:text-gray-300"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Sales Activity Entry Modal */}
      {isAddOpen && (
        <AddSalesActivityModal
          isOpen={isAddOpen}
          isModal={true}
          defaultActivityType="Customer Visit"
          onClose={() => setIsAddOpen(false)}
          onSuccess={async () => {
            setIsAddOpen(false);
            const updated = await getFollowUps();
            setFollowUps(updated);
          }}
        />
      )}

      {/* Edit Follow-up Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Clock size={18} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    Edit Follow-Up ({selectedItem?.followUpCode})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Datalists for autocomplete while allowing free typing */}
                <datalist id="fu-customer-list">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                <datalist id="fu-employee-list">
                  {employees.map((e) => (
                    <option key={e.id} value={e.name} />
                  ))}
                </datalist>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Customer / Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="fu-customer-list"
                    value={formCustomerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    placeholder="Type or select company name..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Select an existing customer or type any new customer name.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      placeholder="e.g. +91 98201 44521"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as FollowUpItem["followUpType"])}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  >
                    <option value="Call Follow-up">Call Follow-up</option>
                    <option value="Meeting Follow-up">Meeting Follow-up</option>
                    <option value="Quotation Revision">Quotation Revision</option>
                    <option value="Technical Demo">Technical Demo</option>
                    <option value="Sample Trial Review">Sample Trial Review</option>
                  </select>
                </div>

                {/* Work Assignment: Employee vs Functional Team */}
                <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-gray-700 text-xs">
                      Work Assignment <span className="text-gray-400 font-normal">({userRoleCategory || "User"})</span>
                    </label>
                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-gray-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFormAssignedType("Employee")}
                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                          formAssignedType === "Employee"
                            ? "bg-[#00234a] text-white shadow-2xs"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAssignedType("Team")}
                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                          formAssignedType === "Team"
                            ? "bg-[#00234a] text-white shadow-2xs font-semibold"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Functional Team
                      </button>
                    </div>
                  </div>

                  {formAssignedType === "Team" ? (
                    <div>
                      <select
                        value={formAssignedTeamId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setFormAssignedTeamId(selectedId);
                          const t = teams.find((item) => item.id === selectedId);
                          if (t) {
                            setFormAssignedTeamName(t.name);
                            setFormAssignedRep(t.name);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                      >
                        <option value="">-- Select Functional Team --</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Supported teams: Sales Coordinator, Accounts Team, Service Team, Store Team.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {userRoleCategory === "Director" ? (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
                          <span>Director Follow-Up (Self Assigned)</span>
                          <span className="text-[10px] bg-blue-100 font-bold px-2 py-0.5 rounded text-blue-800">
                            Director
                          </span>
                        </div>
                      ) : (
                        <select
                          value={
                            roleAssignees.find((a) => a.name === formAssignedRep)?.id ||
                            employees.find((e) => e.name === formAssignedRep)?.id ||
                            ""
                          }
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const match =
                              roleAssignees.find((a) => a.id === selectedId) ||
                              employees.find((emp) => emp.id === selectedId);
                            if (match) {
                              setFormAssignedRep(match.name);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                        >
                          <option value="">-- Select Assignee --</option>
                          {(roleAssignees.length > 0 ? roleAssignees : employees).map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} {emp.role ? `(${emp.role})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-[10px] text-gray-500 mt-1">
                        {userRoleCategory === "BDE"
                          ? "BDE users can assign to Directors."
                          : userRoleCategory === "SalesPerson"
                          ? "Sales representatives can assign to BDE users."
                          : "Role-based assignee list."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Interval Preset from Follow-up Interval Master */}
                {intervals.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                    <label className="block font-semibold text-amber-900 mb-1.5 text-[11px]">
                      Follow-up Interval Presets (Quick Calculate Due Date)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {intervals.map((inv) => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => applyIntervalPreset(inv.value)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md transition cursor-pointer shadow-2xs"
                        >
                          ⚡ {inv.value} ({inv.code})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Due Time
                    </label>
                    <input
                      type="text"
                      value={formDueTime}
                      onChange={(e) => setFormDueTime(e.target.value)}
                      placeholder="10:30 AM"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormPriority(val);
                        const match = priorityOptions.find((p) => p.name.toLowerCase() === val.toLowerCase());
                        if (match) setFormPriorityId(String(match.id));
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      {priorityOptions.length > 0 ? (
                        priorityOptions.map((opt) => (
                          <option key={opt.id} value={opt.name}>
                            {opt.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No priorities configured in Priority Master</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as FollowUpItem["status"])}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      <option value="Due Today">Due Today</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Related Enquiry / Quotation Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formRelatedCode}
                    onChange={(e) => setFormRelatedCode(e.target.value)}
                    placeholder="e.g. ENQ-2026-0042 or QUO-2026-0108"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Follow-Up Action Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="Describe what needs to be delivered or discussed..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-5 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 text-sm bg-[#00234a] hover:bg-[#001833] text-white rounded-lg font-medium"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAddOpen ? "Create Reminder" : "Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <span className="font-bold text-gray-900 text-base">
                {selectedItem.followUpCode}
              </span>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="font-bold text-gray-900 text-sm">
                  {selectedItem.customerName}
                </div>
                <div className="text-gray-600 mt-1">
                  Contact: {selectedItem.contactPerson} ({selectedItem.phone})
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 block">Due Date:</span>
                  <span className="font-semibold text-gray-900">{selectedItem.dueDate} at {selectedItem.dueTime}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Assigned To:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedItem.assignedType === "Team"
                      ? `👥 Team: ${selectedItem.assignedTeamName || selectedItem.assignedRep}`
                      : selectedItem.assignedRep || "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status:</span>
                  <span className="font-semibold text-gray-900">{selectedItem.status}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Priority:</span>
                  <span className="font-semibold text-gray-900">
                    {(() => {
                      const matched = priorityOptions.find(
                        (p) => p.name.toLowerCase() === selectedItem.priority?.toLowerCase()
                      );
                      const c = matched?.colorCode || (
                        selectedItem.priority?.toLowerCase() === "urgent" ? "#ef4444" :
                        selectedItem.priority?.toLowerCase() === "high" ? "#f97316" :
                        selectedItem.priority?.toLowerCase() === "medium" ? "#3b82f6" : "#64748b"
                      );
                      return (
                        <span
                          className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${c}15`,
                            color: c,
                            borderColor: `${c}40`,
                          }}
                        >
                          {selectedItem.priority}
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-900 block mb-1">Action Description:</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 whitespace-pre-wrap">
                  {selectedItem.actionDetails}
                </p>
              </div>
              {selectedItem.completionNotes && (
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-900">
                  <span className="font-bold block">Resolution Notes:</span>
                  <span>{selectedItem.completionNotes}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-6 py-2 bg-[#00234a] text-white rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Follow-Up Reminder"
        message={`Are you sure you want to delete follow-up "${selectedItem?.followUpCode}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default FollowUpsMaster;
