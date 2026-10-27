import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  Search,
  User,
  Clock,
  Calendar,
  MapPin,
  Filter,
  X,
  Loader2,
  Users,
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
  getMeetings,
  updateMeetingRecord,
  deleteMeetingRecord,
  getSalesModuleCounts,
  getMeetingTypes,
  getActivityOutcomes,
} from "../../SalesActivities/Services/SalesActivityService";
import type {
  MeetingRecord,
  MeetingTypeItem,
  ActivityOutcomeItem,
} from "../../SalesActivities/Services/SalesActivityService";

export interface MeetingsMasterProps {
  isTab?: boolean;
}

export const MeetingsMaster: React.FC<MeetingsMasterProps> = ({ isTab = false }) => {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeItem[]>([]);
  const [, setOutcomes] = useState<ActivityOutcomeItem[]>([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);

  // Form
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formMeetingType, setFormMeetingType] = useState<string>("Follow-up");
  const [formAssignedUser, setFormAssignedUser] = useState("");
  const [formMeetingStatus, setFormMeetingStatus] = useState<MeetingRecord["meetingStatus"]>("Scheduled");
  const [formMeetingDate, setFormMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMeetingTime, setFormMeetingTime] = useState("11:00 AM");
  const [formDuration, setFormDuration] = useState(60);
  const [formLocation, setFormLocation] = useState("Conference Room / Zoom");
  const [formAgenda, setFormAgenda] = useState("");
  const [formOutcome, setFormOutcome] = useState("");
  const [formNextFollowUp, setFormNextFollowUp] = useState("");
  const [formAttendees, setFormAttendees] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadMeta = async () => {
      const [c, e, storedMeetings, mTypes, actOutcomes] = await Promise.all([
        getCustomerOptions(),
        getEmployeeOptions(),
        getMeetings(),
        getMeetingTypes(),
        getActivityOutcomes(),
      ]);
      setCustomers(c);
      setEmployees(e);
      setMeetingTypes(mTypes.filter((m) => m.isActive));
      setOutcomes(
        actOutcomes.filter(
          (o) => o.isActive && (o.category === "Meeting" || o.category === "General")
        )
      );
      setMeetings(storedMeetings || []);
    };
    loadMeta();
  }, []);

  const filteredMeetings = meetings.filter((m) => {
    const matchSearch =
      m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meetingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "All" || m.meetingType === selectedType;
    const matchStatus = selectedStatus === "All" || m.meetingStatus === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  const paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormCustomerId("");
    setFormCustomerName("");
    setFormAssignedUser("");
    setFormMeetingType(meetingTypes.length > 0 ? meetingTypes[0].value : "Follow-up");
    setFormMeetingStatus("Scheduled");
    setFormMeetingDate(new Date().toISOString().split("T")[0]);
    setFormMeetingTime("11:00 AM");
    setFormDuration(60);
    setFormLocation("");
    setFormAgenda("");
    setFormOutcome("");
    setFormNextFollowUp("");
    setFormAttendees("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m: MeetingRecord) => {
    setSelectedMeeting(m);
    setFormCustomerId(m.customerId);
    setFormCustomerName(m.customerName);
    setFormMeetingType(m.meetingType);
    setFormAssignedUser(m.assignedUser);
    setFormMeetingStatus(m.meetingStatus);
    setFormMeetingDate(m.meetingDate);
    setFormMeetingTime(m.meetingTime);
    setFormDuration(m.durationMinutes);
    setFormLocation(m.location);
    setFormAgenda(m.agenda);
    setFormOutcome(m.outcome || "");
    setFormNextFollowUp(m.nextFollowUpDate || "");
    setFormAttendees(m.attendees);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    if (!formAgenda.trim()) {
      toast.error("Agenda is required.");
      return;
    }
    setIsSaving(true);
    try {
      const updatedMtg: MeetingRecord = {
        ...selectedMeeting,
        customerId: formCustomerId || selectedMeeting.customerId,
        customerName: formCustomerName.trim() || selectedMeeting.customerName,
        meetingType: formMeetingType,
        assignedUser: formAssignedUser.trim() || selectedMeeting.assignedUser,
        meetingStatus: formMeetingStatus,
        meetingDate: formMeetingDate,
        meetingTime: formMeetingTime,
        durationMinutes: formDuration,
        location: formLocation,
        agenda: formAgenda.trim(),
        outcome: formOutcome.trim() || undefined,
        nextFollowUpDate: formNextFollowUp || undefined,
        attendees: formAttendees.trim() || selectedMeeting.attendees,
      };
      await updateMeetingRecord(updatedMtg);
      const updated = await getMeetings();
      setMeetings(updated);
      setIsEditOpen(false);
      toast.success(`Meeting ${selectedMeeting.meetingCode} updated.`);
    } catch {
      toast.error("Failed to update meeting.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMeeting) return;
    try {
      await deleteMeetingRecord(selectedMeeting.id);
      const updated = await getMeetings();
      setMeetings(updated);
      setIsDeleteOpen(false);
      toast.success(`Meeting ${selectedMeeting.meetingCode} deleted.`);
    } catch {
      toast.error("Failed to delete meeting.");
    }
  };

  return (
    <div className={isTab ? "space-y-6" : "p-4 md:p-6 bg-gray-50 min-h-full"}>
      {/* Shared Nav Tabs */}
      {!isTab && <SalesNavTabs counts={getSalesModuleCounts()} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-purple-50 text-[#00234a] rounded-xl flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Meeting Master</h1>
              <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                {meetings.length} Meetings
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-xs">
              Manage client meetings, agendas, attendees, room / Teams locations, and follow-up outcomes.
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
            <span>+ Schedule Meeting</span>
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
            placeholder="Search by company, agenda, location..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00234a] transition"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Filter size={14} />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Fresh">Fresh</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Technical Review">Technical Review</option>
            <option value="Commercial Negotiation">Commercial Negotiation</option>
            <option value="Site Audit">Site Audit</option>
          </select>

          <span className="text-gray-400">|</span>

          <span className="text-gray-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Meeting Cards List (Card format matching MindAxis Meeting Master) */}
      <div className="space-y-3.5">
        {paginatedMeetings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500 text-sm">
            No meetings found matching search criteria.
          </div>
        ) : (
          paginatedMeetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-[#00234a]/30 transition group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {mtg.meetingCode}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">
                    {mtg.customerName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {mtg.meetingType}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${mtg.meetingStatus === "Completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                  >
                    {mtg.meetingStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={13} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{mtg.meetingDate}</span>
                    <Clock size={13} className="text-gray-400 ml-1" />
                    <span>{mtg.meetingTime} ({mtg.durationMinutes} min)</span>
                  </div>

                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMeeting(mtg);
                        setIsViewOpen(true);
                      }}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                      title="View Details"
                    >
                      <FaEye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(mtg)}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                      title="Edit Meeting"
                    >
                      <FaEdit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMeeting(mtg);
                        setIsDeleteOpen(true);
                      }}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                      title="Delete Meeting"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Agenda & Outcome */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-800">AGENDA: </span>
                  <span className="text-gray-600">{mtg.agenda}</span>
                </div>
                {mtg.outcome && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                    <span className="font-semibold text-gray-900">OUTCOME: </span>
                    <span>{mtg.outcome}</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-gray-400" />
                    <span>Owner: <strong>{mtg.assignedUser}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span>Location: <strong>{mtg.location}</strong></span>
                  </div>
                  {mtg.attendees && (
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-gray-400" />
                      <span>Attendees: {mtg.attendees}</span>
                    </div>
                  )}
                  {mtg.nextFollowUpDate && (
                    <div className="text-indigo-700 font-medium ml-auto">
                      Next Follow-up: {mtg.nextFollowUpDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
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
            const updated = await getMeetings();
            setMeetings(updated);
          }}
        />
      )}

      {/* Edit Meeting Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Video size={18} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    Edit Meeting ({selectedMeeting?.meetingCode})
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
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Customer / Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="meetings-customer-options"
                    value={formCustomerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCustomerName(val);
                      const found = customers.find(
                        (c) => c.name.toLowerCase() === val.toLowerCase()
                      );
                      if (found) {
                        setFormCustomerId(found.id);
                      }
                    }}
                    placeholder="Type or select customer name..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <datalist id="meetings-customer-options">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Meeting Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formMeetingType}
                      onChange={(e) => setFormMeetingType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      {meetingTypes.map((mt) => (
                        <option key={mt.id} value={mt.value}>
                          {mt.value} ({mt.code})
                        </option>
                      ))}
                      {meetingTypes.length === 0 && (
                        <>
                          <option value="Fresh">Fresh</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Technical Review">Technical Review</option>
                          <option value="Commercial Negotiation">Commercial Negotiation</option>
                          <option value="Site Audit">Site Audit</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Meeting Status
                    </label>
                    <select
                      value={formMeetingStatus}
                      onChange={(e) => setFormMeetingStatus(e.target.value as MeetingRecord["meetingStatus"])}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Assigned Representative
                    </label>
                    <input
                      type="text"
                      list="meetings-rep-options"
                      value={formAssignedUser}
                      onChange={(e) => setFormAssignedUser(e.target.value)}
                      placeholder="Type or select representative (e.g. Vishal Patil)"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id="meetings-rep-options">
                      {employees.map((e) => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Location / Platform
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Teams Link / Conference Room"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formMeetingDate}
                      onChange={(e) => setFormMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={formMeetingTime}
                      onChange={(e) => setFormMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Attendees
                  </label>
                  <input
                    type="text"
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="e.g. Rameshwar A, Rajesh Sharma, Sunil K"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Agenda <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formAgenda}
                    onChange={(e) => setFormAgenda(e.target.value)}
                    placeholder="Enter meeting agenda..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Outcome / Minutes
                  </label>
                  <textarea
                    rows={2}
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    placeholder="Key decisions, actions taken..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formNextFollowUp}
                    onChange={(e) => setFormNextFollowUp(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
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
                  <span>{isAddOpen ? "Schedule Meeting" : "Update Meeting"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-base">
                  {selectedMeeting.meetingCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  {selectedMeeting.meetingType}
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
                  {selectedMeeting.customerName}
                </div>
                <div className="text-gray-500 mt-1">
                  Location: {selectedMeeting.location}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-gray-700">
                <div>
                  <span className="text-gray-400 block">Assigned Owner:</span>
                  <span className="font-semibold text-gray-900">{selectedMeeting.assignedUser}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date & Time:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedMeeting.meetingDate} at {selectedMeeting.meetingTime}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-900 block mb-1">Agenda:</span>
                <p className="p-2.5 bg-gray-50 rounded-lg text-gray-800 border border-gray-100">
                  {selectedMeeting.agenda}
                </p>
              </div>
              {selectedMeeting.outcome && (
                <div>
                  <span className="font-semibold text-gray-900 block mb-1">Outcome:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-100">
                    {selectedMeeting.outcome}
                  </p>
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
        title="Delete Meeting"
        message={`Are you sure you want to delete meeting "${selectedMeeting?.meetingCode}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default MeetingsMaster;
