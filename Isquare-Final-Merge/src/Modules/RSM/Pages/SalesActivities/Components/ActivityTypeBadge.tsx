import React from "react";
import {
  PhoneCall,
  Mail,
  MessageCircle,
  Building,
  Video,
  ClipboardCheck,
  Presentation,
  Package,
  FileText,
} from "lucide-react";
import type { ActivityType, ActivityStatus } from "../Types/SalesActivityTypes";

interface ActivityTypeBadgeProps {
  type: ActivityType;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export const ActivityTypeBadge: React.FC<ActivityTypeBadgeProps> = ({
  type,
  showIcon = true,
  size = "sm",
}) => {
  const getBadgeConfig = (t: ActivityType) => {
    switch (t) {
      case "Phone Call":
        return {
          icon: <PhoneCall size={size === "sm" ? 13 : 15} />,
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "Email":
        return {
          icon: <Mail size={size === "sm" ? 13 : 15} />,
          className: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "WhatsApp Follow-up":
        return {
          icon: <MessageCircle size={size === "sm" ? 13 : 15} />,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "Customer Visit":
        return {
          icon: <Building size={size === "sm" ? 13 : 15} />,
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "Online Meeting":
        return {
          icon: <Video size={size === "sm" ? 13 : 15} />,
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "Site Survey":
        return {
          icon: <ClipboardCheck size={size === "sm" ? 13 : 15} />,
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "Product Demonstration":
        return {
          icon: <Presentation size={size === "sm" ? 13 : 15} />,
          className: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "Sample Submitted":
        return {
          icon: <Package size={size === "sm" ? 13 : 15} />,
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "Discussion Notes":
      default:
        return {
          icon: <FileText size={size === "sm" ? 13 : 15} />,
          className: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const config = getBadgeConfig(type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}
    >
      {showIcon && <span className="shrink-0">{config.icon}</span>}
      <span>{type}</span>
    </span>
  );
};

export const ActivityStatusBadge: React.FC<{
  status: ActivityStatus;
  size?: "sm" | "md";
}> = ({ status }) => {
  const getStatusConfig = (s: ActivityStatus) => {
    const norm = (s || "").toLowerCase();
    if (norm === "completed" || norm === "complete") {
      return {
        dot: "bg-green-500",
        className: "bg-green-50 text-green-700 border-green-200",
        label: s,
      };
    }
    if (norm === "due today") {
      return {
        dot: "bg-amber-500 animate-pulse",
        className: "bg-amber-50 text-amber-700 border-amber-300 font-semibold",
        label: s,
      };
    }
    if (norm === "overdue") {
      return {
        dot: "bg-red-500 animate-ping",
        className: "bg-red-50 text-red-700 border-red-300 font-semibold",
        label: s,
      };
    }
    if (norm === "in progress" || norm === "processing") {
      return {
        dot: "bg-blue-500",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        label: s,
      };
    }
    if (norm === "scheduled") {
      return {
        dot: "bg-indigo-400",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: s,
      };
    }
    if (norm === "cancelled" || norm === "canceled") {
      return {
        dot: "bg-gray-400",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        label: s,
      };
    }
    return {
      dot: "bg-cyan-500",
      className: "bg-cyan-50 text-cyan-800 border-cyan-200",
      label: s,
    };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
