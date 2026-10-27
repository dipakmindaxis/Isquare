import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Calendar,
  PhoneForwarded,
  Filter,
  X,
  Loader2,
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
  getCalls,
  updateCallRecord,
  deleteCallRecord,
  getSalesModuleCounts,
  getCallTypes,
  getActivityOutcomes,
} from "../../SalesActivities/Services/SalesActivityService";
import type {
  CallRecord,
  CallTypeItem,
  ActivityOutcomeItem,
} from "../../SalesActivities/Services/SalesActivityService";

export interface CallsMasterProps {
  isTab?: boolean;
}

export const CallsMaster: React.FC<CallsMasterProps> = ({ isTab = false }) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [callTypes, setCallTypes] = useState<CallTypeItem[]>([]);
  const [outcomes, setOutcomes] = useState<ActivityOutcomeItem[]>([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Form State
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formCallType, setFormCallType] = useState<string>("Follow-up");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formCallDate, setFormCallDate] = useState(new Date().toISOString().split("T")[0]);
  const [formCallTime, setFormCallTime] = useState("10:30 AM");
  const [formDuration, setFormDuration] = useState(15);
  const [formStatus, setFormStatus] = useState<CallRecord["status"]>("Done");
  const [formCallOutcome, setFormCallOutcome] = useState<string>("Connected - Interested");
  const [formNextFollowUp, setFormNextFollowUp] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadMeta = async () => {
      const [c, e, storedCalls, cTypes, actOutcomes] = await Promise.all([
        getCustomerOptions(),
        getEmployeeOptions(),
        getCalls(),
        getCallTypes(),
        getActivityOutcomes(),
      ]);
      setCustomers(c);
      setEmployees(e);
      setCallTypes(cTypes.filter((ct) => ct.isActive));
      setOutcomes(
        actOutcomes.filter(
          (o) => o.isActive && (o.category === "Call" || o.category === "General")
        )
      );
      setCalls(storedCalls || []);
    };
    loadMeta();
  }, []);

  const filteredCalls = calls.filter((c) => {
    const matchSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.callCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.remarks.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "All" || c.callType === selectedType;
    const matchStatus = selectedStatus === "All" || c.status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
      setFormCustomerName(customers[0].name);
      setFormContactPerson(customers[0].contactPerson);
      setFormContactPhone(customers[0].phone);
    } else {
      setFormCustomerId("");
      setFormCustomerName("");
      setFormContactPerson("");
      setFormContactPhone("");
    }
    if (employees.length > 0) setFormAssignedTo(employees[0].name);
    setFormCallType("Follow-up");
    setFormCallDate(new Date().toISOString().split("T")[0]);
    setFormCallTime("10:30 AM");
    setFormDuration(15);
    setFormStatus("Done");
    setFormCallOutcome("Connected - Interested");
    setFormNextFollowUp("");
    setFormRemarks("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (call: CallRecord) => {
    setSelectedCall(call);
    setFormCustomerId(call.customerId);
    setFormCustomerName(call.customerName);
    setFormContactPerson(call.contactPerson);
    setFormContactPhone(call.phone);
    setFormCallType(call.callType);
    setFormAssignedTo(call.assignedTo);
    setFormCallDate(call.callDate);
    setFormCallTime(call.callTime);
    setFormDuration(call.durationMinutes);
    setFormStatus(call.status);
    setFormCallOutcome(call.callOutcome);
    setFormNextFollowUp(call.nextFollowUpDate || "");
    setFormRemarks(call.remarks);
    setIsEditOpen(true);
  };

  const handleOpenView = (call: CallRecord) => {
    setSelectedCall(call);
    setIsViewOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCall) return;
    if (!formRemarks.trim()) {
      toast.error("Please enter discussion remarks.");
      return;
    }
    setIsSaving(true);
    try {
      const updatedCall: CallRecord = {
        ...selectedCall,
        customerId: formCustomerId || selectedCall.customerId,
        customerName: formCustomerName.trim() || selectedCall.customerName,
        contactPerson: formContactPerson.trim() || selectedCall.contactPerson,
        phone: formContactPhone.trim() || selectedCall.phone,
        callType: formCallType,
        assignedTo: formAssignedTo.trim() || selectedCall.assignedTo,
        callDate: formCallDate,
        callTime: formCallTime,
        durationMinutes: formDuration,
        status: formStatus,
        callOutcome: formCallOutcome,
        nextFollowUpDate: formNextFollowUp || undefined,
        remarks: formRemarks.trim(),
      };
      await updateCallRecord(updatedCall);
      const updated = await getCalls();
      setCalls(updated);
      setIsEditOpen(false);
      toast.success(`Call ${selectedCall.callCode} updated.`);
    } catch {
      toast.error("Failed to update call.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCall) return;
    try {
      await deleteCallRecord(selectedCall.id);
      const updated = await getCalls();
      setCalls(updated);
      setIsDeleteOpen(false);
      toast.success(`Call ${selectedCall.callCode} deleted.`);
    } catch {
      toast.error("Failed to delete call.");
    }
  };

  return (
    <div className={isTab ? "space-y-6" : "p-4 md:p-6 bg-gray-50 min-h-full"}>
      {/* Shared Navigation Tabs */}
      {!isTab && <SalesNavTabs counts={getSalesModuleCounts()} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-blue-50 text-[#00234a] rounded-xl flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Calls Master</h1>
              <span className="text-[11px] font-semibold bg-blue-50 text-[#00234a] border border-blue-200 px-2.5 py-0.5 rounded-full">
                {calls.length} Logged Calls
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-xs">
              Manage client calls, telephony logs, tele-sales discussions, and scheduled callbacks.
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
            <span>+ New Call</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, code, remarks..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Filter size={14} />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="All">All Call Types</option>
            <option value="Fresh">Fresh</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Technical">Technical</option>
            <option value="Enquiry Clarification">Enquiry Clarification</option>
            <option value="Commercial Review">Commercial Review</option>
          </select>

          <span className="text-gray-400">|</span>

          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#00234a] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">Call ID</th>
                <th className="px-5 py-3.5 text-left">Company & Contact</th>
                <th className="px-4 py-3.5 text-left">Call Type</th>
                <th className="px-4 py-3.5 text-left">Assigned Rep</th>
                <th className="px-4 py-3.5 text-left">Date & Time</th>
                <th className="px-4 py-3.5 text-center">Duration</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-left">Next Follow-Up</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedCalls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    No calls found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900">
                      {call.callCode}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-gray-900 text-xs truncate">
                        {call.customerName}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <User size={11} className="text-gray-400" />
                        <span>{call.contactPerson}</span>
                        <span className="text-gray-400">•</span>
                        <span>{call.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {call.callType}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">
                      {call.assignedTo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{call.callDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <span>{call.callTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-medium text-gray-700">
                      {call.durationMinutes} min
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          call.status === "Done"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {call.nextFollowUpDate ? (
                        <div className="flex items-center gap-1 text-indigo-700 font-medium">
                          <PhoneForwarded size={12} />
                          <span>{call.nextFollowUpDate}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenView(call)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View"
                        >
                          <FaEye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(call)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCall(call);
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

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <span>
              Showing {filteredCalls.length} calls
            </span>
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
          defaultActivityType="Phone Call"
          onClose={() => setIsAddOpen(false)}
          onSuccess={async () => {
            setIsAddOpen(false);
            const updated = await getCalls();
            setCalls(updated);
          }}
        />
      )}

      {/* Edit Call Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#00234a] flex items-center justify-center font-bold">
                    <PhoneCall size={18} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    Edit Call ({selectedCall?.callCode})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Customer / Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="calls-customer-options"
                    value={formCustomerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCustomerName(val);
                      const found = customers.find(
                        (c) => c.name.toLowerCase() === val.toLowerCase()
                      );
                      if (found) {
                        setFormCustomerId(found.id);
                        if (!formContactPerson) setFormContactPerson(found.contactPerson);
                        if (!formContactPhone) setFormContactPhone(found.phone);
                      }
                    }}
                    placeholder="Type or select customer name..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <datalist id="calls-customer-options">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      placeholder="e.g. +91 98201 44521"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Call Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formCallType}
                      onChange={(e) => setFormCallType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      {callTypes.map((ct) => (
                        <option key={ct.id} value={ct.value}>
                          {ct.value} ({ct.code})
                        </option>
                      ))}
                      {callTypes.length === 0 && (
                        <>
                          <option value="Fresh">Fresh</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Technical">Technical</option>
                          <option value="Enquiry Clarification">Enquiry Clarification</option>
                          <option value="Commercial Review">Commercial Review</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Assigned Representative
                    </label>
                    <input
                      type="text"
                      list="calls-rep-options"
                      value={formAssignedTo}
                      onChange={(e) => setFormAssignedTo(e.target.value)}
                      placeholder="Type or select representative (e.g. Vishal Patil)"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id="calls-rep-options">
                      {employees.map((e) => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Call Date
                    </label>
                    <input
                      type="date"
                      value={formCallDate}
                      onChange={(e) => setFormCallDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Call Time
                    </label>
                    <input
                      type="text"
                      value={formCallTime}
                      onChange={(e) => setFormCallTime(e.target.value)}
                      placeholder="10:30 AM"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Call Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as CallRecord["status"])}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      <option value="Done">Done</option>
                      <option value="Pending">Pending</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Call Outcome
                    </label>
                    <select
                      value={formCallOutcome}
                      onChange={(e) => setFormCallOutcome(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      {outcomes.map((o) => (
                        <option key={o.id} value={o.value}>
                          {o.value} ({o.code})
                        </option>
                      ))}
                      {outcomes.length === 0 && (
                        <>
                          <option value="Connected - Interested">Connected - Interested</option>
                          <option value="Connected - Follow-up Required">Connected - Follow-up Required</option>
                          <option value="Connected - Closed">Connected - Closed</option>
                          <option value="Busy / Left Message">Busy / Left Message</option>
                          <option value="No Response">No Response</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={formNextFollowUp}
                    onChange={(e) => setFormNextFollowUp(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Remarks / Discussion Minutes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Enter call notes and points discussed..."
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
                  <span>{isAddOpen ? "Save Call" : "Update Call"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Call Modal */}
      {isViewOpen && selectedCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-base">
                  {selectedCall.callCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedCall.callType}
                </span>
              </div>
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
                  {selectedCall.customerName}
                </div>
                <div className="text-gray-600 mt-1">
                  Contact: {selectedCall.contactPerson} ({selectedCall.phone})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-gray-700">
                <div>
                  <span className="text-gray-400 block">Assigned Representative:</span>
                  <span className="font-semibold text-gray-900">{selectedCall.assignedTo}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date & Time:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCall.callDate} at {selectedCall.callTime} ({selectedCall.durationMinutes} min)
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status:</span>
                  <span className="font-semibold text-gray-900">{selectedCall.status}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Call Outcome:</span>
                  <span className="font-semibold text-gray-900">{selectedCall.callOutcome}</span>
                </div>
              </div>

              {selectedCall.nextFollowUpDate && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                  <span className="font-bold block">Next Follow-Up Date:</span>
                  <span>{selectedCall.nextFollowUpDate}</span>
                </div>
              )}

              <div>
                <span className="font-semibold text-gray-900 block mb-1">Remarks:</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                  {selectedCall.remarks}
                </p>
              </div>
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
        title="Delete Call Record"
        message={`Are you sure you want to delete call "${selectedCall?.callCode}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CallsMaster;
