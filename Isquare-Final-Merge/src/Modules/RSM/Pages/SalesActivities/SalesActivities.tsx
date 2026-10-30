import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Layers,
  CheckSquare,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  PieChart,
  Flag,
  Paperclip,
} from "lucide-react";
import { FaPlus, FaFileExcel } from "react-icons/fa";
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
} from "./Services/SalesActivityService";
import { SalesActivityStatsCards } from "./Components/SalesActivityStatsCards";
import { SalesActivityFilterBar } from "./Components/SalesActivityFilterBar";
import { SalesActivityTable } from "./Components/SalesActivityTable";
import { AddSalesActivityModal } from "./Components/AddSalesActivityModal";
import { EditSalesActivityModal } from "./Components/EditSalesActivityModal";
import { ViewSalesActivityModal } from "./Components/ViewSalesActivityModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { FollowUpsMaster } from "../Sales/FollowUps/FollowUpsMaster";
import { TasksMaster } from "./Components/TasksMaster";
import { exportToExcel } from "../../../../Utils/exportToExcel";
import ActivityTypeMaster from "../Master/ActivityType/ActivityTypeMaster";
import BdeUsers from "../Master/BdeUsers/Pages/BdeUsers";
import CustomerStatus from "../Master/CustomerStatus/CustomerStatus";
import PriorityMaster from "../Master/Priority/PriorityMaster";
import DocumentTypeMaster from "../Master/DocumentType/DocumentTypeMaster";

export type SalesActivityMasterTab =
  | "all"
  | "followups"
  | "tasks"
  | "activity-types"
  | "customer-status"
  | "bde-users"
  | "priority"
  | "document-types";

export interface SalesActivitiesProps {
  defaultTab?: SalesActivityMasterTab;
}

export const SalesActivities: React.FC<SalesActivitiesProps> = ({ defaultTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as SalesActivityMasterTab | null;

  const validTabs: SalesActivityMasterTab[] = useMemo(
    () => [
      "all",
      "followups",
      "tasks",
      "activity-types",
      "customer-status",
      "bde-users",
      "priority",
      "document-types",
    ],
    []
  );

  const resolveTab = useCallback(
    (tabParam: string | null): SalesActivityMasterTab => {
      if (!tabParam) return "all";
      const lower = tabParam.toLowerCase().trim();
      if (lower === "all" || lower === "activities") return "all";
      if (
        lower === "followups" ||
        lower === "follow-up" ||
        lower === "follow-ups" ||
        lower === "followup"
      )
        return "followups";
      if (
        lower === "tasks" ||
        lower === "approvals" ||
        lower === "task" ||
        lower === "task-assignment" ||
        lower === "taskassignment" ||
        lower === "task-assignments" ||
        lower === "tasks-assignment" ||
        lower === "task_assignment" ||
        lower === "assignment"
      )
        return "tasks";
      if (
        lower === "activity-types" ||
        lower === "activity-type" ||
        lower === "activitytype" ||
        lower === "activity"
      )
        return "activity-types";
      if (
        lower === "customer-status" ||
        lower === "customerstatus" ||
        lower === "status"
      )
        return "customer-status";
      if (
        lower === "bde-users" ||
        lower === "bde-user" ||
        lower === "bde" ||
        lower === "sales-rep" ||
        lower === "assigned-sales-rep"
      )
        return "bde-users";
      if (lower === "priority" || lower === "priorities")
        return "priority";
      if (
        lower === "document-types" ||
        lower === "document-type" ||
        lower === "documenttype" ||
        lower === "doc-type" ||
        lower === "attachments"
      )
        return "document-types";
      return "all";
    },
    []
  );

  const [mainView, setMainView] = useState<SalesActivityMasterTab>(() => {
    if (urlTab) return resolveTab(urlTab);
    if (defaultTab && validTabs.includes(defaultTab)) return defaultTab;
    return "all";
  });

  useEffect(() => {
    if (urlTab) {
      setMainView(resolveTab(urlTab));
    }
  }, [urlTab, resolveTab]);

  const handleSwitchMainView = (tab: SalesActivityMasterTab) => {
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
  const [taskAddRequested, setTaskAddRequested] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<SalesActivity | null>(null);

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

  const handleTabChange = (
    tab: "all" | "today" | "upcoming" | "overdue" | "completed"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedStatus("All");
    setSelectedCustomerId("All");
    setSelectedEmployeeId("All");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const handleView = (activity: SalesActivity) => {
    setSelectedActivity(activity);
    setIsViewOpen(true);
  };

  const handleEdit = (activity: SalesActivity) => {
    setSelectedActivity(activity);
    setIsEditOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          `Activity ${selectedActivity.activityCode} deleted successfully.`
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
      Subject: a.subject,
      Customer: a.customerName,
      "Contact Person": a.contactPerson,
      "Contact Phone": a.contactPhone || "-",
      "Email ID": a.contactEmail || "-",
      "Assigned Rep": a.assignedEmployeeName,
      Date: a.activityDate,
      Time: a.activityTime,
      Status: a.status,
      "Next Action Date": a.nextActionDate || "-",
      "Next Action Details": a.nextActionDetails || "-",
    }));
    exportToExcel(exportData, "Sales_Activities", "Activities");
    toast.success("Sales activities exported to Excel.");
  };

  const SALES_TABS = [
    {
      id: "all" as const,
      label: "All Activities",
      icon: <Layers size={16} />,
      count: stats.total,
    },
    {
      id: "tasks" as const,
      label: "Task Assignment",
      icon: <CheckSquare size={16} />,
    },
    {
      id: "activity-types" as const,
      label: "Activity Type",
      icon: <CheckCircle2 size={16} />,
    },
    {
      id: "customer-status" as const,
      label: "Customer Status",
      icon: <PieChart size={16} />,
    },
    {
      id: "bde-users" as const,
      label: "Assigned Sales Rep / BDE User",
      icon: <UserCheck size={16} />,
    },
    {
      id: "priority" as const,
      label: "Priority Master",
      icon: <Flag size={16} />,
    },
    {
      id: "document-types" as const,
      label: "Document Types",
      icon: <Paperclip size={16} />,
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card matching CustomerMaster */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Sales Activities
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Unified master management for sales activities, follow-ups, tasks, activity types, customer statuses, BDE users, priorities, and document types.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Only Operational Sales Activities Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2">
          {SALES_TABS.map((tab) => {
            const isActive = mainView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchMainView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-[#FF7900] text-[#FF7900] font-semibold bg-orange-50/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <span className={isActive ? "text-[#FF7900]" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isActive
                        ? "bg-[#FF7900] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Display */}
      {mainView === "all" && (
        <div>
          {isAddOpen ? (
            <AddSalesActivityModal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              onSuccess={() => {
                setIsAddOpen(false);
                loadData();
              }}
            />
          ) : isEditOpen && selectedActivity ? (
            <EditSalesActivityModal
              isOpen={isEditOpen}
              isModal={false}
              activity={selectedActivity}
              onClose={() => {
                setIsEditOpen(false);
                setSelectedActivity(null);
              }}
              onSuccess={() => {
                setIsEditOpen(false);
                setSelectedActivity(null);
                loadData();
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Listing Action Header matching CustomerMaster */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
                    All Activities
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={loadData}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportClick}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                  >
                    <FaFileExcel className="text-emerald-600" />
                    <span>Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchMainView("tasks");
                      setTaskAddRequested(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00234a] hover:bg-[#003366] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
                  >
                    <FaPlus size={12} />
                    <span>Add Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 transition cursor-pointer"
                  >
                    <FaPlus size={12} />
                    <span>Record Activity</span>
                  </button>
                </div>
              </div>

              {/* KPI / Summary Cards */}
              <SalesActivityStatsCards
                stats={stats}
                activeTab={activeTab}
                onSelectTab={handleTabChange}
              />

              {/* Filters & Quick Status Tabs */}
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

              {/* Sales Activities Data Table without Related Link */}
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
                onAddNew={() => {
                  setIsAddOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
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
              window.scrollTo({ top: 0, behavior: "smooth" });
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
        </div>
      )}

      {/* Operations & Master Views matching EnquiryMaster layout */}
      {mainView === "followups" && <FollowUpsMaster isTab={true} />}
      {mainView === "tasks" && (
        <TasksMaster
          initialAddOpen={taskAddRequested}
          onAddClosed={() => setTaskAddRequested(false)}
        />
      )}
      {mainView === "activity-types" && <ActivityTypeMaster isTab={true} />}
      {mainView === "customer-status" && <CustomerStatus isTab={true} />}
      {mainView === "bde-users" && <BdeUsers isTab={true} />}
      {mainView === "priority" && <PriorityMaster isTab={true} />}
      {mainView === "document-types" && <DocumentTypeMaster isTab={true} />}
    </div>
  );
};

export default SalesActivities;
