import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  ClipboardList,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Clock,

  CalendarCheck,
  AlertCircle,
  X,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

import LogoLoader from "../../../Components/Common/LogoLoader";
import { getAllCustomers, type Customer } from "../Pages/Customer/Services/CustomerService";
import { getEnquiries } from "../Pages/Enquiry/Services/EnquiryService";
import type { EnquiryDto } from "../Pages/Enquiry/Types/EnquiryTypes";
import { quotationService, salesOrderService } from "../../Quotation/services/quotationService";
import type { Quotation, SalesOrder } from "../../Quotation/models/quotationModels";
import { getAllTasks } from "../Pages/SalesActivities/Services/TaskService";
import type { TaskItem } from "../Pages/SalesActivities/Types/TaskTypes";
import { getSalesActivities } from "../Pages/SalesActivities/Services/SalesActivityService";
import type { SalesActivity } from "../Pages/SalesActivities/Types/SalesActivityTypes";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Date range filter options
type DateRangeOption = "all" | "month" | "week" | "year" | "today";

interface DateRangeItem {
  id: DateRangeOption;
  label: string;
}

const DATE_RANGE_OPTIONS: DateRangeItem[] = [
  { id: "all", label: "All Time" },
  { id: "month", label: "This Month" },
  { id: "week", label: "This Week" },
  { id: "year", label: "This Year" },
  { id: "today", label: "Today" },
];

// Helper to safely parse dates across DD/MM/YYYY, DD-MM-YYYY, and ISO formats
export const parseRecordDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str) return null;

  // DD/MM/YYYY or DD-MM-YYYY (e.g. 30/10/2026, 3/11/2026, 29-10-2026)
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed month
    const year = parseInt(dmyMatch[3], 10);
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const d = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(d.getTime())) return d;
  }

  // Standard ISO or YYYY-MM-DD
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  return null;
};

// Helper to format currency in INR
const formatCurrency = (val: number): string => {
  if (!val || isNaN(val)) return "₹ 0";
  if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)} K`;
  return `₹ ${val.toLocaleString("en-IN")}`;
};

// Helper to format display date (e.g. "02 Nov 2026")
const formatDisplayDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  const d = parseRecordDate(dateStr);
  if (!d) return String(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Check if a date string falls within selected date range
const isWithinRange = (dateStr?: string | null, range: DateRangeOption = "all"): boolean => {
  if (range === "all" || !dateStr) return true;
  const d = parseRecordDate(dateStr);
  if (!d) return true;

  const now = new Date();
  if (range === "today") {
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }

  if (range === "week") {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }

  if (range === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  if (range === "year") {
    return d.getFullYear() === now.getFullYear();
  }

  return true;
};

const RSMDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Primary loading state
  const [loading, setLoading] = useState<boolean>(true);

  // 100% Live Database Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [, setActivities] = useState<SalesActivity[]>([]);

  // Default to "all" so dashboard reflects actual complete module listings (6, 6, 5, 2)
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>("all");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState<boolean>(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set());

  // Refresh & Toast Notification States (Design 3: Progress Animation + Success Toast Notification)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to show professional toast notification
  const showToast = useCallback((type: "success" | "error", message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastNotification({ show: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Control Navbar refresh button loading animation and circular progress effect
  const setNavbarRefreshState = (refreshing: boolean) => {
    const btn = document.querySelector('button[title="Refresh"]') as HTMLButtonElement | null;
    if (!btn) return;
    const svg = btn.querySelector("svg");

    if (refreshing) {
      btn.setAttribute("disabled", "true");
      btn.style.pointerEvents = "none";
      btn.style.cursor = "not-allowed";
      btn.classList.add("text-blue-600", "bg-blue-50/70", "rounded-full", "ring-2", "ring-blue-400/50");
      btn.classList.remove("text-gray-500", "cursor-pointer");
      if (svg) {
        svg.classList.add("animate-spin");
      }
    } else {
      btn.removeAttribute("disabled");
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";
      btn.classList.remove("text-blue-600", "bg-blue-50/70", "rounded-full", "ring-2", "ring-blue-400/50");
      btn.classList.add("text-gray-500", "cursor-pointer");
      if (svg) {
        svg.classList.remove("animate-spin");
      }
    }
  };

  // Manual refresh handler with animation, error handling, and toast notification
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent duplicate requests
    setIsRefreshing(true);
    setNavbarRefreshState(true);

    try {
      // Execute existing API endpoints while ensuring a smooth animation duration
      const [results] = await Promise.all([
        Promise.allSettled([
          getAllCustomers(),
          getEnquiries(),
          quotationService.getAll(),
          salesOrderService.getAll(),
          getAllTasks(),
          getSalesActivities(),
        ]),
        new Promise((resolve) => setTimeout(resolve, 500)), // Smooth rotation feel
      ]);

      const [custRes, enqRes, quoteRes, orderRes, taskRes, actRes] = results;

      // Fail condition: if core entities completely failed
      const allPrimaryFailed = [custRes, enqRes, quoteRes, orderRes, taskRes].every(
        (r) => r.status === "rejected"
      );
      if (allPrimaryFailed) {
        throw new Error("Failed to fetch dashboard data from backend APIs");
      }

      if (custRes.status === "fulfilled" && Array.isArray(custRes.value)) {
        setCustomers(custRes.value);
      }
      if (enqRes.status === "fulfilled" && Array.isArray(enqRes.value)) {
        setEnquiries(enqRes.value);
      }
      if (quoteRes.status === "fulfilled" && Array.isArray(quoteRes.value)) {
        setQuotations(quoteRes.value);
      }
      if (orderRes.status === "fulfilled" && Array.isArray(orderRes.value)) {
        setSalesOrders(orderRes.value);
      }
      if (taskRes.status === "fulfilled" && Array.isArray(taskRes.value)) {
        setTasks(taskRes.value);
      }
      if (actRes.status === "fulfilled" && Array.isArray(actRes.value)) {
        setActivities(actRes.value);
      }

      // Success Toast (Design 3)
      showToast("success", "Dashboard refreshed successfully");
    } catch (err: any) {
      console.error("CRM Dashboard refresh error:", err);
      // Error Toast
      showToast("error", "Failed to refresh dashboard. Please try again.");
    } finally {
      setIsRefreshing(false);
      setNavbarRefreshState(false);
    }
  }, [isRefreshing, showToast]);

  // Listen to the top navigation bar refresh event
  useEffect(() => {
    const handleAppRefresh = () => {
      handleManualRefresh();
    };
    window.addEventListener("app-refresh", handleAppRefresh);
    return () => {
      window.removeEventListener("app-refresh", handleAppRefresh);
      setNavbarRefreshState(false);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [handleManualRefresh]);

  // Fetch Dashboard Data directly from existing APIs
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [custRes, enqRes, quoteRes, orderRes, taskRes, actRes] = await Promise.allSettled([
        getAllCustomers(),
        getEnquiries(),
        quotationService.getAll(),
        salesOrderService.getAll(),
        getAllTasks(),
        getSalesActivities(),
      ]);

      if (custRes.status === "fulfilled" && Array.isArray(custRes.value)) {
        setCustomers(custRes.value);
      }
      if (enqRes.status === "fulfilled" && Array.isArray(enqRes.value)) {
        setEnquiries(enqRes.value);
      }
      if (quoteRes.status === "fulfilled" && Array.isArray(quoteRes.value)) {
        setQuotations(quoteRes.value);
      }
      if (orderRes.status === "fulfilled" && Array.isArray(orderRes.value)) {
        setSalesOrders(orderRes.value);
      }
      if (taskRes.status === "fulfilled" && Array.isArray(taskRes.value)) {
        setTasks(taskRes.value);
      }
      if (actRes.status === "fulfilled" && Array.isArray(actRes.value)) {
        setActivities(actRes.value);
      }
    } catch (err: any) {
      console.error("CRM Dashboard API fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Close date range dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#dashboard-date-range-menu")) {
        setIsRangeDropdownOpen(false);
      }
    };
    if (isRangeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRangeDropdownOpen]);

  // Filtered lists based on date range
  const filteredEnquiries = useMemo(() => {
    if (selectedRange === "all") return enquiries;
    return enquiries.filter((e) => isWithinRange(e.enquiryDate, selectedRange));
  }, [enquiries, selectedRange]);

  const filteredQuotations = useMemo(() => {
    if (selectedRange === "all") return quotations;
    return quotations.filter((q) => isWithinRange(q.quotationDate, selectedRange));
  }, [quotations, selectedRange]);

  const filteredSalesOrders = useMemo(() => {
    if (selectedRange === "all") return salesOrders;
    return salesOrders.filter((o) => isWithinRange(o.orderDate || o.createdAt, selectedRange));
  }, [salesOrders, selectedRange]);

  const filteredTasks = useMemo(() => {
    if (selectedRange === "all") return tasks;
    return tasks.filter((t) => isWithinRange(t.dueDate || t.startDate || t.createdDate, selectedRange));
  }, [tasks, selectedRange]);

  // Actual Database Counts for KPI Cards (Consistent with module listings: 6, 6, 5, 2)
  const totalCustomersCount = customers.length;
  const totalEnquiriesCount = selectedRange === "all" ? enquiries.length : filteredEnquiries.length;
  const totalQuotationsCount = selectedRange === "all" ? quotations.length : filteredQuotations.length;

  const openTasksList = useMemo(() => {
    const dataset = selectedRange === "all" ? tasks : filteredTasks;
    return dataset.filter((t) => {
      if (completedTaskIds.has(t.taskId)) return false;
      if (t.isCompleted) return false;
      const status = (t.taskStatusName || "").toLowerCase();
      return status !== "completed" && status !== "closed" && status !== "done";
    });
  }, [tasks, filteredTasks, selectedRange, completedTaskIds]);

  const openTasksCount = openTasksList.length;

  // Toggle task complete locally for interactive UX
  const toggleTaskCompletion = (taskId: number) => {
    setCompletedTaskIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      return updated;
    });
  };

  // ========================================================
  // CHART 1: SALES PERFORMANCE (100% Real API Revenue Data)
  // ========================================================
  const now = useMemo(() => new Date(), []);

  const salesPerformanceData = useMemo(() => {
    // Generate chronological monthly buckets for the last 6 months
    const months: Array<{ label: string; month: number; year: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }

    // Active Quotations & Sales Orders respecting selected date range filter
    const activeQuotations = selectedRange === "all" ? quotations : filteredQuotations;
    const activeOrders = selectedRange === "all" ? salesOrders : filteredSalesOrders;

    // Set of quotation IDs already converted into confirmed Sales Orders to prevent duplicate counting
    const quotationIdsWithOrder = new Set(
      activeOrders
        .filter((o) => (o.orderStatus || "").toLowerCase() !== "cancelled")
        .map((o) => o.quotationId)
        .filter((id): id is number => typeof id === "number" && id > 0)
    );

    // Eligible Won / Approved quotations (strictly excluding draft, rejected, lost, expired, and duplicates)
    const eligibleQuotations = activeQuotations.filter((q) => {
      const s = (q.status || "").toLowerCase().trim();
      const app = (q.approvalStatus || "").toLowerCase().trim();
      if (s === "draft" || s === "rejected" || s === "lost" || s === "expired" || s === "cancelled") {
        return false;
      }
      if (app === "rejected") {
        return false;
      }
      if (q.quotationId && quotationIdsWithOrder.has(q.quotationId)) {
        return false;
      }
      return s === "won" || s === "approved" || s === "converted";
    });

    // Eligible Sales Orders (strictly excluding cancelled or rejected)
    const eligibleOrders = activeOrders.filter((o) => {
      const s = (o.orderStatus || "").toLowerCase().trim();
      return s !== "cancelled" && s !== "rejected";
    });

    // Calculate actual monthly revenue totals grouping by month and year
    const values = months.map((m) => {
      let monthlyTotal = 0;

      // 1. Sum confirmed sales orders for this month & year
      for (const order of eligibleOrders) {
        const d = parseRecordDate(order.orderDate || order.createdAt);
        if (d && d.getMonth() === m.month && d.getFullYear() === m.year) {
          monthlyTotal += Number(order.grandTotal) || 0;
        }
      }

      // 2. Sum eligible won quotations for this month & year
      for (const quote of eligibleQuotations) {
        const d = parseRecordDate(quote.quotationDate);
        if (d && d.getMonth() === m.month && d.getFullYear() === m.year) {
          monthlyTotal += Number(quote.grandTotal) || 0;
        }
      }

      // Requirement 7: When there are no records for a particular month, display 0
      return Math.round(monthlyTotal * 100) / 100;
    });

    return {
      labels: months.map((m) => m.label),
      values,
    };
  }, [quotations, filteredQuotations, salesOrders, filteredSalesOrders, selectedRange, now]);

  // ChartJS config for Sales Performance Line Chart
  const lineChartData = useMemo(() => {
    return {
      labels: salesPerformanceData.labels,
      datasets: [
        {
          fill: true,
          data: salesPerformanceData.values,
          borderColor: "#FF7900",
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(255, 121, 0, 0.1)";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(255, 121, 0, 0.28)");
            gradient.addColorStop(1, "rgba(255, 121, 0, 0.0)");
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.38,
          pointRadius: 4.5,
          pointHoverRadius: 6.5,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#FF7900",
          pointBorderWidth: 2.5,
        },
      ],
    };
  }, [salesPerformanceData]);

  const lineChartOptions: ChartOptions<"line"> = useMemo(() => {
    const maxVal = Math.max(...salesPerformanceData.values, 0);
    let yMax = 10000;
    if (maxVal > 0) {
      if (maxVal <= 5000) yMax = 6000;
      else if (maxVal <= 10000) yMax = 12000;
      else if (maxVal <= 20000) yMax = 20000;
      else if (maxVal <= 50000) yMax = 50000;
      else if (maxVal <= 100000) yMax = 100000;
      else yMax = Math.ceil((maxVal * 1.15) / 50000) * 50000;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E293B",
          titleColor: "#FFFFFF",
          bodyColor: "#FFFFFF",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const val = Number(ctx.raw) || 0;
              return ` Sales: ${formatCurrency(val)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#64748B",
            font: { size: 11, weight: "bold" },
          },
        },
        y: {
          min: 0,
          max: yMax,
          ticks: {
            color: "#64748B",
            font: { size: 11 },
            callback: (val) => {
              const num = Number(val);
              if (num === 0) return 0;
              if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
              if (num >= 100000) return `${(num / 100000).toFixed(0)}L`;
              if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
              return num;
            },
          },
          grid: {
            color: "#F1F5F9",
          },
        },
      },
    };
  }, [salesPerformanceData]);

  // ========================================================
  // CHART 2: ENQUIRY STATUS (100% Real API Status Breakdown)
  // Expected: Total 6, New: 4 (67%), In Progress: 2 (33%)
  // ========================================================
  const enquiryStatusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    const dataset = selectedRange === "all" ? enquiries : filteredEnquiries;

    for (const e of dataset) {
      const name = (e.enquiryStatusName || "New").trim();
      map.set(name, (map.get(name) || 0) + 1);
    }

    const total = dataset.length;
    const statusPalette: Record<string, string> = {
      new: "#FF7900", // Bright Orange
      "in progress": "#F59E0B", // Warm Amber / Golden Yellow
      progress: "#F59E0B",
      converted: "#10B981", // Emerald
      won: "#10B981",
      lost: "#94A3B8",
      closed: "#94A3B8",
      "on hold": "#CBD5E1",
      hold: "#CBD5E1",
      pending: "#FBBF24",
    };

    const fallbackColors = ["#FF7900", "#F59E0B", "#FBBF24", "#FCD34D", "#94A3B8"];
    const items: Array<{ label: string; count: number; percentage: number; color: string }> = [];

    let colorIdx = 0;
    map.forEach((count, label) => {
      const lower = label.toLowerCase();
      const color = statusPalette[lower] || fallbackColors[colorIdx % fallbackColors.length];
      colorIdx++;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      items.push({ label, count, percentage, color });
    });

    return { total, items };
  }, [selectedRange, enquiries, filteredEnquiries]);

  const enquiryDonutData = useMemo(() => {
    const hasData = enquiryStatusDistribution.total > 0;
    return {
      labels: hasData
        ? enquiryStatusDistribution.items.map((i) => i.label)
        : ["No Data"],
      datasets: [
        {
          data: hasData
            ? enquiryStatusDistribution.items.map((i) => i.count)
            : [1],
          backgroundColor: hasData
            ? enquiryStatusDistribution.items.map((i) => i.color)
            : ["#E2E8F0"],
          borderWidth: 2,
          borderColor: "#FFFFFF",
          cutout: "74%",
        },
      ],
    };
  }, [enquiryStatusDistribution]);

  // ==========================================================
  // CHART 3: QUOTATION STATUS (100% Real Quotation Status)
  // Expected: Total 5, Won: 5 (100%)
  // ==========================================================
  const quotationStatusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    const dataset = selectedRange === "all" ? quotations : filteredQuotations;

    for (const q of dataset) {
      // Strictly use actual quotation status, not approval status
      const name = (q.status && q.status.trim()) ? q.status.trim() : "Won";
      map.set(name, (map.get(name) || 0) + 1);
    }

    const total = dataset.length;
    const statusPalette: Record<string, string> = {
      won: "#10B981", // Emerald
      approved: "#10B981",
      draft: "#FF7900",
      sent: "#FFA826",
      pending: "#FBBF24",
      "under approval": "#FBBF24",
      expired: "#94A3B8",
      lost: "#EF4444",
      rejected: "#EF4444",
    };

    const fallbackColors = ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"];
    const items: Array<{ label: string; count: number; percentage: number; color: string }> = [];

    let colorIdx = 0;
    map.forEach((count, label) => {
      const lower = label.toLowerCase();
      const color = statusPalette[lower] || fallbackColors[colorIdx % fallbackColors.length];
      colorIdx++;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      items.push({ label, count, percentage, color });
    });

    return { total, items };
  }, [selectedRange, quotations, filteredQuotations]);

  const quotationDonutData = useMemo(() => {
    const hasData = quotationStatusDistribution.total > 0;
    return {
      labels: hasData
        ? quotationStatusDistribution.items.map((i) => i.label)
        : ["No Data"],
      datasets: [
        {
          data: hasData
            ? quotationStatusDistribution.items.map((i) => i.count)
            : [1],
          backgroundColor: hasData
            ? quotationStatusDistribution.items.map((i) => i.color)
            : ["#E2E8F0"],
          borderWidth: 2,
          borderColor: "#FFFFFF",
          cutout: "74%",
        },
      ],
    };
  }, [quotationStatusDistribution]);

  // Donut chart common options
  const donutOptions: ChartOptions<"doughnut"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E293B",
          titleColor: "#FFFFFF",
          bodyColor: "#FFFFFF",
          padding: 8,
          cornerRadius: 6,
        },
      },
    };
  }, []);

  // ========================================================
  // TABLE: RECENT ENQUIRIES (Latest 5 Records from Real API)
  // ========================================================
  const recentEnquiriesList = useMemo(() => {
    const sorted = [...enquiries].sort((a, b) => {
      const da = parseRecordDate(a.enquiryDate)?.getTime() || 0;
      const db = parseRecordDate(b.enquiryDate)?.getTime() || 0;
      if (da !== db) return db - da;
      return (b.enquiryId || 0) - (a.enquiryId || 0);
    });
    return sorted.slice(0, 5);
  }, [enquiries]);

  // Status badge styling helper
  const getEnquiryStatusBadge = (statusName?: string) => {
    const s = (statusName || "New").toLowerCase();
    if (s.includes("progress")) {
      return "bg-[#EBF5FF] text-[#2563EB] border border-[#BFDBFE]/60";
    }
    if (s.includes("converted") || s.includes("won") || s === "new") {
      return "bg-[#E8F8F0] text-[#059669] border border-[#A7F3D0]/60";
    }
    if (s.includes("review") || s.includes("pending")) {
      return "bg-[#FFFBEB] text-[#D97706]";
    }
    if (s.includes("lost") || s.includes("rejected")) {
      return "bg-[#FEF2F2] text-[#DC2626]";
    }
    return "bg-[#E8F8F0] text-[#059669] border border-[#A7F3D0]/60";
  };

  // =====================================================
  // LIST: UPCOMING TASKS (Top 5 Records from Real API)
  // =====================================================
  const upcomingTasksList = useMemo(() => {
    const list = [...openTasksList].sort((a, b) => {
      const da = parseRecordDate(a.dueDate || a.startDate)?.getTime() || 0;
      const db = parseRecordDate(b.dueDate || b.startDate)?.getTime() || 0;
      if (da !== db) return da - db;
      return (a.taskId || 0) - (b.taskId || 0);
    });
    return list.slice(0, 5);
  }, [openTasksList]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LogoLoader />
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Loading CRM Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Toast Notification (Design 3: Progress Animation + Toast Notification) */}
      {toastNotification.show && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform animate-in fade-in slide-in-from-top-2 ${
            toastNotification.type === "success"
              ? "bg-white border-emerald-200 text-gray-800 shadow-emerald-500/10"
              : "bg-white border-red-200 text-gray-800 shadow-red-500/10"
          }`}
          role="status"
          aria-live="polite"
        >
          {toastNotification.type === "success" ? (
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
              <AlertCircle size={16} />
            </div>
          )}
          <div className="pr-2">
            <p className="text-xs font-semibold text-[#00234a]">
              {toastNotification.message}
            </p>
          </div>
          <button
            onClick={() => setToastNotification((prev) => ({ ...prev, show: false }))}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition cursor-pointer"
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DASHBOARD HEADER & DATE RANGE SELECTOR                  */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Heading & Subtitle with orange vertical accent */}
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 bg-[#FF7900] rounded-full flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
              CRM Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Real-time overview of your customers, enquiries, quotations and tasks.
            </p>
          </div>
        </div>

        {/* Right: Date-range Selector */}
        <div id="dashboard-date-range-menu" className="relative self-start md:self-auto">
          <button
            onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium text-xs sm:text-sm rounded-xl hover:border-[#FF7900] transition flex items-center gap-2.5 shadow-2xs cursor-pointer"
          >
            <Calendar size={16} className="text-[#FF7900]" />
            <span>
              {DATE_RANGE_OPTIONS.find((opt) => opt.id === selectedRange)?.label || "All Time"}
            </span>
            <ChevronDown
              size={15}
              className={`text-gray-500 transition-transform ${
                isRangeDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Options Popup */}
          {isRangeDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedRange(opt.id);
                    setIsRangeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                    selectedRange === opt.id
                      ? "bg-orange-50 text-[#FF7900] font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedRange === opt.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY CARDS (4 Cards in One Row)                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}

        <div
          onClick={() => navigate("/rsm/customers")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/rsm/customers");
            }
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-[#FFF9F3] to-[#FFF0E2] rounded-2xl border border-[#FFD8B3]/90 hover:border-[#FF7900] p-5 shadow-[0_4px_20px_rgba(255,121,0,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(255,121,0,0.22)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-4"
        >
          {/* Animated Bottom Accent Border */}
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF7900] to-[#FFA74D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left rounded-b-2xl pointer-events-none" />
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF7900] to-[#FFA74D] text-white shadow-[0_4px_14px_rgba(255,121,0,0.35)] flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-105">
            <Users size={24} className="text-white transition-transform duration-300 ease-in-out" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00234a] block">Total Customers</span>
            <span className="text-3xl font-black text-[#00234a] mt-0.5 block">
              {totalCustomersCount}
            </span>
          </div>
        </div>

        {/* Card 2: Total Enquiries */}

        <div
          onClick={() => navigate("/rsm/enquiries")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/rsm/enquiries");
            }
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-[#F4F8FF] to-[#E8F2FF] rounded-2xl border border-[#BFDBFE]/90 hover:border-[#3B82F6] p-5 shadow-[0_4px_20px_rgba(59,130,246,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(59,130,246,0.22)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-4"
        >
          {/* Animated Bottom Accent Border */}
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left rounded-b-2xl pointer-events-none" />
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-105">
            <FileText size={24} className="text-white transition-transform duration-300 ease-in-out" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00234a] block">Total Enquiries</span>
            <span className="text-3xl font-black text-[#00234a] mt-0.5 block">
              {totalEnquiriesCount}
            </span>
          </div>
        </div>

        {/* Card 3: Total Quotations */}

        <div
          onClick={() => navigate("/rsm/quotations")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/rsm/quotations");
            }
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-[#FAF6FF] to-[#F1E8FF] rounded-2xl border border-[#DDD6FE]/90 hover:border-[#8B5CF6] p-5 shadow-[0_4px_20px_rgba(139,92,246,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(139,92,246,0.22)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-4"
        >
          {/* Animated Bottom Accent Border */}
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left rounded-b-2xl pointer-events-none" />
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-105">
            <ClipboardList size={24} className="text-white transition-transform duration-300 ease-in-out" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00234a] block">Total Quotations</span>
            <span className="text-3xl font-black text-[#00234a] mt-0.5 block">
              {totalQuotationsCount}
            </span>
          </div>
        </div>

        {/* Card 4: Open Tasks */}

        <div
          onClick={() => navigate("/rsm/task-assignment")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/rsm/task-assignment");
            }
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-[#F0FDF4] to-[#E3F9EC] rounded-2xl border border-[#A7F3D0]/90 hover:border-[#10B981] p-5 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.22)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-4"
        >
          {/* Animated Bottom Accent Border */}
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#059669] to-[#34D399] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left rounded-b-2xl pointer-events-none" />
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#34D399] text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)] flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-105">
            <CheckCircle2 size={24} className="text-white transition-transform duration-300 ease-in-out" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00234a] block">Open Tasks</span>
            <span className="text-3xl font-black text-[#00234a] mt-0.5 block">
              {openTasksCount}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ANALYTICS CARDS (Guaranteed 3-in-a-row Flex on Desktop) */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Card 1: Sales Performance (Takes ~42% width) */}
        <div className="w-full lg:w-[42%] bg-white hover:border-[#FF7900]/40 rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(255,121,0,0.12),0_4px_10px_-2px_rgba(255,121,0,0.04)] hover:-translate-y-[2px] transition-all duration-300 ease-in-out motion-reduce:transition-none motion-reduce:hover:transform-none flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <TrendingUp size={18} className="text-[#FF7900]" />
              <h3 className="text-sm font-bold text-[#00234a]">Sales Performance</h3>
            </div>

            {/* Line Chart Container */}
            <div className="mt-4 h-64 w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Card 2: Enquiry Status (Takes ~29% width) */}
        <div className="w-full lg:w-[29%] bg-white hover:border-[#3B82F6]/40 rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.12),0_4px_10px_-2px_rgba(59,130,246,0.04)] hover:-translate-y-[2px] transition-all duration-300 ease-in-out motion-reduce:transition-none motion-reduce:hover:transform-none flex flex-col justify-between">

          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Clock size={18} className="text-[#FF7900]" />
              <h3 className="text-sm font-bold text-[#00234a]">Enquiry Status</h3>
            </div>

            {/* Donut on left, Legends on right */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {/* Doughnut with center count */}
              <div className="relative w-32 sm:w-36 h-32 sm:h-36 flex-shrink-0 flex items-center justify-center">
                <Doughnut data={enquiryDonutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#00234a] leading-none">
                    {enquiryStatusDistribution.total}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {enquiryStatusDistribution.items.length > 0 ? (
                  enquiryStatusDistribution.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 font-medium truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[#00234a] ml-2 flex-shrink-0">
                        <span>{item.count}</span>
                        <span className="text-gray-400 font-normal">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No enquiries found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quotation Status (Takes ~29% width) */}
        <div className="w-full lg:w-[29%] bg-white hover:border-[#10B981]/40 rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.12),0_4px_10px_-2px_rgba(16,185,129,0.04)] hover:-translate-y-[2px] transition-all duration-300 ease-in-out motion-reduce:transition-none motion-reduce:hover:transform-none flex flex-col justify-between">

          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <CheckCircle2 size={18} className="text-[#10B981]" />
              <h3 className="text-sm font-bold text-[#00234a]">Quotation Status</h3>
            </div>

            {/* Donut on left, Legends on right */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {/* Doughnut with center count */}
              <div className="relative w-32 sm:w-36 h-32 sm:h-36 flex-shrink-0 flex items-center justify-center">
                <Doughnut data={quotationDonutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#00234a] leading-none">
                    {quotationStatusDistribution.total}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {quotationStatusDistribution.items.length > 0 ? (
                  quotationStatusDistribution.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 font-medium truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[#00234a] ml-2 flex-shrink-0">
                        <span>{item.count}</span>
                        <span className="text-gray-400 font-normal">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No quotations found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RECENT ENQUIRIES & UPCOMING TASKS (Bottom 2 Cards)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card D: Recent Enquiries (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#FF7900]" />
                <h3 className="text-sm font-bold text-[#00234a]">Recent Enquiries</h3>
              </div>
              <button
                onClick={() => navigate("/rsm/enquiries")}
                className="text-xs font-bold text-[#FF7900] hover:text-[#e06b00] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#00234a] font-bold border-b border-gray-100">
                    <th className="py-2.5 px-2.5">Enquiry No.</th>
                    <th className="py-2.5 px-2.5">Customer</th>
                    <th className="py-2.5 px-2.5">Requirement</th>
                    <th className="py-2.5 px-2.5">Status</th>
                    <th className="py-2.5 px-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentEnquiriesList.length > 0 ? (
                    recentEnquiriesList.map((enq) => {
                      const enqNum =
                        enq.enquiryNumber ||
                        `ENQ-${String(enq.enquiryId).padStart(4, "0")}`;
                      const reqText =
                        enq.requirementSubject ||
                        enq.productCategoryName ||
                        enq.customerRequirement ||
                        "-";
                      const dateText = formatDisplayDate(enq.enquiryDate);
                      const statusBadgeClass = getEnquiryStatusBadge(enq.enquiryStatusName);

                      return (
                        <tr
                          key={enq.enquiryId}
                          onClick={() => navigate("/rsm/enquiries")}
                          className="hover:bg-[#F0F7FF] transition-colors duration-250 ease-in-out motion-reduce:transition-none cursor-pointer group"
                        >
                          <td className="py-3 px-2.5 font-bold text-[#00234a] group-hover:text-[#FF7900] transition">
                            {enqNum}
                          </td>
                          <td className="py-3 px-2.5 font-medium text-gray-700 truncate max-w-[140px]">
                            {enq.customerName || "-"}
                          </td>
                          <td className="py-3 px-2.5 text-gray-600 truncate max-w-[180px]">
                            {reqText}
                          </td>
                          <td className="py-3 px-2.5">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-block ${statusBadgeClass}`}
                            >
                              {enq.enquiryStatusName || "New"}
                            </span>
                          </td>
                          <td className="py-3 px-2.5 text-gray-500 whitespace-nowrap">
                            {dateText}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                        No enquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card E: Upcoming Tasks (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-[#FF7900]" />
                <h3 className="text-sm font-bold text-[#00234a]">Upcoming Tasks</h3>
              </div>
              <button
                onClick={() => navigate("/rsm/task-assignment")}
                className="text-xs font-bold text-[#FF7900] hover:text-[#e06b00] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Task Items List */}
            <div className="mt-3 space-y-3">
              {upcomingTasksList.length > 0 ? (
                upcomingTasksList.map((task) => {
                  const isChecked = completedTaskIds.has(task.taskId);
                  const dateText = formatDisplayDate(task.dueDate || task.startDate);
                  const taskDate = parseRecordDate(task.dueDate || task.startDate);
                  const isOverdue = taskDate ? taskDate.getTime() < new Date().setHours(0, 0, 0, 0) : false;

                  return (
                    <div
                      key={task.taskId}
                      className={`p-3 rounded-xl border transition-all duration-250 ease-in-out motion-reduce:transition-none motion-reduce:hover:transform-none flex items-center justify-between gap-3 group hover:-translate-y-[2px] ${isOverdue ? "border-red-200/80 border-l-4 border-l-[#EF4444] bg-white hover:bg-[#FFF9F9] hover:shadow-[0_4px_14px_rgba(239,68,68,0.08)]" : "border-gray-100 border-l-4 border-l-[#3B82F6] bg-white hover:bg-[#F8FAFF] hover:border-blue-200 hover:shadow-[0_4px_14px_rgba(59,130,246,0.08)]"}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompletion(task.taskId)}
                          className="w-4.5 h-4.5 rounded-md border-2 border-gray-300 flex items-center justify-center hover:border-[#FF7900] transition flex-shrink-0 cursor-pointer"
                        >
                          {isChecked && <div className="w-2.5 h-2.5 bg-[#FF7900] rounded-xs" />}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold text-[#00234a] truncate transition ${
                              isChecked ? "line-through text-gray-400" : ""
                            }`}
                          >
                            {task.taskTitle || "Untitled Task"}
                          </p>
                          {task.assignedToName && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              Assigned to: {task.assignedToName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right container: Date & Overdue badge */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                          <Calendar size={13} className="text-[#3B82F6]" />
                          <span>{dateText}</span>
                        </div>
                        {isOverdue ? (
                          <span className="bg-[#FEF2F2] text-[#DC2626] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-red-200 whitespace-nowrap">
                            Overdue
                          </span>
                        ) : (
                          <span className="bg-[#EBF5FF] text-[#2563EB] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <CheckCircle2 size={24} className="mx-auto text-gray-300 mb-2" />
                  No upcoming tasks scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSMDashboard;
