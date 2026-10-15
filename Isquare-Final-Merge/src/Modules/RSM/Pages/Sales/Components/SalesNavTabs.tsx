import React from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  Layers,
  PhoneCall,
  Video,
  Clock,
  Paperclip,
} from "lucide-react";

interface SalesNavTabsProps {
  counts?: {
    customers?: number;
    activities?: number;
    calls?: number;
    meetings?: number;
    followUps?: number;
    attachments?: number;
  };
}

export const SalesNavTabs: React.FC<SalesNavTabsProps> = ({ counts }) => {
  const tabs = [
    {
      to: "/rsm/customers",
      label: "Customers",
      icon: <Users size={15} />,
      count: counts?.customers,
    },
    {
      to: "/rsm/sales-activities",
      label: "All Activities",
      icon: <Layers size={15} />,
      count: counts?.activities,
    },
    {
      to: "/rsm/sales/calls",
      label: "Calls Master",
      icon: <PhoneCall size={15} />,
      count: counts?.calls,
    },
    {
      to: "/rsm/sales/meetings",
      label: "Meetings Master",
      icon: <Video size={15} />,
      count: counts?.meetings,
    },
    {
      to: "/rsm/sales/follow-ups",
      label: "Follow-Up Tracker",
      icon: <Clock size={15} />,
      count: counts?.followUps,
    },
    {
      to: "/rsm/sales/attachments",
      label: "Sales Attachments",
      icon: <Paperclip size={15} />,
      count: counts?.attachments,
    },
    {
      to: "/rsm/sales/call-types",
      label: "Call Types",
      icon: <PhoneCall size={15} />,
    },
    {
      to: "/rsm/sales/meeting-types",
      label: "Meeting Types",
      icon: <Video size={15} />,
    },
    {
      to: "/rsm/sales/follow-up-intervals",
      label: "Intervals",
      icon: <Clock size={15} />,
    },
    {
      to: "/rsm/sales/document-types",
      label: "Doc Types",
      icon: <Paperclip size={15} />,
    },
    {
      to: "/rsm/sales/activity-outcomes",
      label: "Outcomes",
      icon: <Layers size={15} />,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 border-b border-gray-200">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap cursor-pointer ${
              isActive
                ? "border-[#00234a] text-[#00234a] bg-white shadow-xs font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`
          }
        >
          {tab.icon}
          <span>{tab.label}</span>
          {typeof tab.count === "number" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {tab.count}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default SalesNavTabs;
