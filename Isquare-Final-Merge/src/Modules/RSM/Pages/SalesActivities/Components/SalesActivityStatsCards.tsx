import React from "react";
import {
  FaTasks,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import type { ActivitySummaryStats } from "../Types/SalesActivityTypes";

interface SalesActivityStatsCardsProps {
  stats: ActivitySummaryStats;
  activeTab: "all" | "today" | "upcoming" | "overdue" | "completed";
  onSelectTab: (tab: "all" | "today" | "upcoming" | "overdue" | "completed") => void;
}

export const SalesActivityStatsCards: React.FC<SalesActivityStatsCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: "all" as const,
      label: "Total Activities",
      count: stats.total,
      icon: <FaTasks size={20} />,
      iconBox: "bg-blue-50 text-blue-600",
      textColor: "text-gray-800",
    },
    {
      id: "today" as const,
      label: "Due Today",
      count: stats.dueToday,
      icon: <FaClock size={20} />,
      iconBox: "bg-amber-50 text-amber-600",
      textColor: "text-amber-600",
    },
    {
      id: "overdue" as const,
      label: "Overdue Reminders",
      count: stats.overdue,
      icon: <FaExclamationTriangle size={20} />,
      iconBox: "bg-rose-50 text-rose-600",
      textColor: "text-rose-600",
    },
    {
      id: "completed" as const,
      label: "Completed",
      count: stats.completed,
      icon: <FaCheckCircle size={20} />,
      iconBox: "bg-emerald-50 text-emerald-600",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const isActive = activeTab === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectTab(card.id)}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 cursor-pointer transition ${
              isActive
                ? "border-[#154068] ring-2 ring-[#154068]/20"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className={`p-3 ${card.iconBox} rounded-xl shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.count}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalesActivityStatsCards;

