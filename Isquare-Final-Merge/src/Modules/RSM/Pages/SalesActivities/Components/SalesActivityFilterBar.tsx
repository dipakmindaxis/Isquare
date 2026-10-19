import React from "react";
import { FaSearch } from "react-icons/fa";
import type {
  ActivityType,
  ActivityStatus,
  CustomerOption,
  EmployeeOption,
} from "../Types/SalesActivityTypes";

interface SalesActivityFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: ActivityType | "All";
  onTypeChange: (value: ActivityType | "All") => void;
  selectedStatus: ActivityStatus | "All";
  onStatusChange: (value: ActivityStatus | "All") => void;
  selectedCustomerId: string | "All";
  onCustomerChange: (value: string | "All") => void;
  selectedEmployeeId: string | "All";
  onEmployeeChange: (value: string | "All") => void;
  activeTab: "all" | "today" | "upcoming" | "overdue" | "completed";
  onTabChange: (tab: "all" | "today" | "upcoming" | "overdue" | "completed") => void;
  onResetFilters: () => void;
  customers: CustomerOption[];
  employees: EmployeeOption[];
}

export const SalesActivityFilterBar: React.FC<SalesActivityFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCustomerId,
  onCustomerChange,
  activeTab,
  onTabChange,
  customers,
}) => {
  const activityTypes: ActivityType[] = [
    "Phone Call",
    "Email",
    "WhatsApp Follow-up",
    "Customer Visit",
    "Online Meeting",
    "Site Survey",
    "Product Demonstration",
    "Sample Submitted",
    "Discussion Notes",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
      {/* Search Input matching CustomerMaster */}
      <div className="relative w-full md:w-96">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by subject, customer, code, employee, notes..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]"
        />
      </div>

      {/* Filter Controls matching CustomerMaster */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full md:w-auto">
        {/* Activity Type Dropdown */}
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as ActivityType | "All")}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]"
        >
          <option value="All">All Activity Types</option>
          {activityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Customer Dropdown */}
        <select
          value={selectedCustomerId}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] max-w-[170px] truncate"
        >
          <option value="All">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status Pills matching CustomerMaster exactly */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Status:
          </span>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
              { id: "all", label: "All" },
              { id: "today", label: "Due Today" },
              { id: "overdue", label: "Overdue" },
              { id: "completed", label: "Completed" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onTabChange(st.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all text-center cursor-pointer ${
                  activeTab === st.id
                    ? "bg-white text-[#FF7900] shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesActivityFilterBar;

