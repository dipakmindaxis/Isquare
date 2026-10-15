import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Layers, PhoneCall, Video, Clock } from "lucide-react";
import { toast } from "sonner";
import type {
  ActivityStatus,
  ActivitySummaryStats,
  ActivityType,
  CustomerOption,
  EmployeeOption,
  SalesActivity,
} from "./Types/SalesActivityTypes";
import {
  getSalesActivities,
  getActivitySummaryStats,
  deleteSalesActivity,
  getCustomerOptions,
  getEmployeeOptions,
  getSalesModuleCounts,
} from "./Services/SalesActivityService";
import { SalesActivityHeader } from "./Components/SalesActivityHeader";
import { SalesActivityStatsCards } from "./Components/SalesActivityStatsCards";
import { SalesActivityFilterBar } from "./Components/SalesActivityFilterBar";
import { SalesActivityTable } from "./Components/SalesActivityTable";
import { AddSalesActivityModal } from "./Components/AddSalesActivityModal";
import { EditSalesActivityModal } from "./Components/EditSalesActivityModal";
import { ViewSalesActivityModal } from "./Components/ViewSalesActivityModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import SalesNavTabs from "../Sales/Components/SalesNavTabs";
import { CallsMaster } from "../Sales/Calls/CallsMaster";
import { MeetingsMaster } from "../Sales/Meetings/MeetingsMaster";
import { FollowUpsMaster } from "../Sales/FollowUps/FollowUpsMaster";
import { exportToExcel } from "../../../../Utils/exportToExcel";

interface SalesActivitiesProps {
  defaultTab?: "all" | "calls" | "meetings" | "followups";
}

export const SalesActivities: React.FC<SalesActivitiesProps> = ({ defaultTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as
    | "all"
    | "calls"
    | "meetings"
    | "followups"
    | null;

  const [mainView, setMainView] = useState<
    "all" | "calls" | "meetings" | "followups"
  >(urlTab || defaultTab || "all");

  useEffect(() => {
    if (urlTab && ["all", "calls", "meetings", "followups"].includes(urlTab)) {
      setMainView(urlTab);
    }
  }, [urlTab]);

  const handleSwitchMainView = (tab: "all" | "calls" | "meetings" | "followups") => {
    setMainView(tab);
    setSearchParams(tab === "all" ? {} : { tab });
  };

  // Data states
  const [activities, setActivities] = useState<SalesActivity[]>([]);
  const [stats, setStats] = useState<ActivitySummaryStats>({
    total: 0,
    dueToday: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
  });
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ActivityType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | "All">("All");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | "All">("All");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | "All">("All");
  const [activeTab, setActiveTab] = useState<
    "all" | "today" | "upcoming" | "overdue" | "completed"
  >("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<SalesActivity | null>(
    null
  );

  // Fetch activities and summary stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [actData, statData, custData, empData] = await Promise.all([
        getSalesActivities({
          search: searchQuery,
          activityType: selectedType,
          status: selectedStatus,
          customerId: selectedCustomerId,
          assignedEmployeeId: selectedEmployeeId,
          tabFilter: activeTab,
        }),
        getActivitySummaryStats(),
        getCustomerOptions(),
        getEmployeeOptions(),
      ]);

      setActivities(actData);
      setStats(statData);
      setCustomers(custData);
      setEmployees(empData);
    } catch {
      toast.error("Failed to load sales activities.");
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedType,
    selectedStatus,
    selectedCustomerId,
    selectedEmployeeId,
    activeTab,
  ]);

  useEffect(() => {
    if (mainView === "all") {
      loadData();
    }
  }, [mainView, loadData]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedType,
    selectedStatus,
    selectedCustomerId,
    selectedEmployeeId,
    activeTab,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedStatus("All");
    setSelectedCustomerId("All");
    setSelectedEmployeeId("All");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const handleTabChange = (
    tab: "all" | "today" | "upcoming" | "overdue" | "completed"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleView = (activity: SalesActivity) => {
    setSelectedActivity(activity);
    setIsViewOpen(true);
  };

  const handleEdit = (activity: SalesActivity) => {
    setSelectedActivity(activity);
    setIsEditOpen(true);
  };

  const handleDeleteRequest = (activity: SalesActivity) => {
    setSelectedActivity(activity);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    try {
      const success = await deleteSalesActivity(selectedActivity.id);
      if (success) {
        toast.success(
          `Activity "${selectedActivity.subject}" deleted successfully.`
        );
        loadData();
      } else {
        toast.error("Failed to delete sales activity.");
      }
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleteOpen(false);
      setSelectedActivity(null);
    }
  };

  const handleExportClick = () => {
    if (!activities || activities.length === 0) {
      toast.info("No activities available to export.");
      return;
    }
    const exportData = activities.map((a, idx) => ({
      "Sr No": idx + 1,
      "Activity Code": a.activityCode,
      "Activity Type": a.activityType,
      "Subject": a.subject,
      "Customer": a.customerName,
      "Contact Person": a.contactPerson,
      "Assigned Rep": a.assignedEmployeeName,
      "Date": a.activityDate,
      "Time": a.activityTime,
      "Status": a.status,
      "Next Action Date": a.nextActionDate || "-",
      "Next Action Details": a.nextActionDetails || "-",
    }));
    exportToExcel(exportData, "Sales_Activities", "Activities");
    toast.success("Sales activities exported to Excel.");
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      {/* Top Sales Nav Tabs */}
      <SalesNavTabs counts={getSalesModuleCounts()} />

      {/* Unified Module Views Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-xs mb-5">
        <button
          type="button"
          onClick={() => handleSwitchMainView("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mainView === "all"
              ? "bg-[#154068] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Layers size={15} />
          <span>ALL ACTIVITIES</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchMainView("calls")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mainView === "calls"
              ? "bg-[#154068] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <PhoneCall size={15} />
          <span>CALLS MASTER</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchMainView("meetings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mainView === "meetings"
              ? "bg-[#154068] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Video size={15} />
          <span>MEETINGS MASTER</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchMainView("followups")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mainView === "followups"
              ? "bg-[#154068] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Clock size={15} />
          <span>FOLLOW-UP TRACKER</span>
        </button>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVE VIEW */}
      {mainView === "calls" && <CallsMaster />}
      {mainView === "meetings" && <MeetingsMaster />}
      {mainView === "followups" && <FollowUpsMaster />}

      {mainView === "all" && (
        <>
          {/* 1. Header Card */}
          <SalesActivityHeader
            onAddNew={() => setIsAddOpen(true)}
            onExport={handleExportClick}
          />

          {/* 2. KPI / Summary Cards */}
          <SalesActivityStatsCards
            stats={stats}
            activeTab={activeTab}
            onSelectTab={handleTabChange}
          />

          {/* 3. Filters & Quick Status Tabs */}
          <SalesActivityFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onResetFilters={handleResetFilters}
            customers={customers}
            employees={employees}
          />

          {/* 4. Table with Pagination */}
          <SalesActivityTable
            activities={activities}
            isLoading={isLoading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onAddNew={() => setIsAddOpen(true)}
          />

          {/* 5. Modals */}
          {isAddOpen && (
            <AddSalesActivityModal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              onSuccess={loadData}
            />
          )}

          {isEditOpen && (
            <EditSalesActivityModal
              isOpen={isEditOpen}
              activity={selectedActivity}
              onClose={() => {
                setIsEditOpen(false);
                setSelectedActivity(null);
              }}
              onSuccess={loadData}
            />
          )}

          {/* View Details Modal */}
          <ViewSalesActivityModal
            isOpen={isViewOpen}
            activity={selectedActivity}
            onClose={() => {
              setIsViewOpen(false);
              setSelectedActivity(null);
            }}
            onEdit={(act) => {
              setIsViewOpen(false);
              setSelectedActivity(act);
              setIsEditOpen(true);
            }}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setSelectedActivity(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Delete Sales Activity"
            message={`Are you sure you want to delete "${selectedActivity?.subject}" (${selectedActivity?.activityCode})? This action cannot be undone.`}
            confirmButtonVariant="danger"
          />
        </>
      )}
    </div>
  );
};

export default SalesActivities;
