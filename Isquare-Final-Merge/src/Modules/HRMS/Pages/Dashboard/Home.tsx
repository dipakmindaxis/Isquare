import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Coins,
  ClipboardCheck,
  Factory,
  Clock,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  MapPin,
  Building2,
  UserPlus,
} from "lucide-react";
import LogoLoader from "../../../../Components/Common/LogoLoader";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  getAllEmployees,
  type Employee,
} from "../Employee/Services/EmployeeSerivce";
import {
  getAllLocations,
  type WorkLocation,
} from "../Location/WorkLocationService";
import { getNotifications } from "../../Services/notificationService";

interface DashboardStats {
  totalEmployees: number | null;
  activeEmployees: number | null;
  presentToday: number | null;
  attendanceRate: number | null;
  monthlyPayroll: string | null;
  payrollGrowth: string | null;
  pendingApprovals: number | null;
}

interface PlantOverviewItem {
  id: number;
  name: string;
  city: string;
  state: string;
  employeeCount: number;
  isActive: boolean;
}

interface ActivityItemData {
  id: string | number;
  text: string;
  time: string;
  category: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: null,
    activeEmployees: null,
    presentToday: null,
    attendanceRate: null,
    monthlyPayroll: null,
    payrollGrowth: null,
    pendingApprovals: null,
  });

  const [plants, setPlants] = useState<PlantOverviewItem[]>([]);
  const [activities, setActivities] = useState<ActivityItemData[]>([]);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch real employees and locations in parallel
      const [employeesResult, locationsResult] = await Promise.allSettled([
        getAllEmployees(),
        getAllLocations(),
      ]);

      const employees: Employee[] =
        employeesResult.status === "fulfilled" && Array.isArray(employeesResult.value)
          ? employeesResult.value
          : [];

      const locations: WorkLocation[] =
        locationsResult.status === "fulfilled" && Array.isArray(locationsResult.value)
          ? locationsResult.value
          : [];

      // Calculate Employee Stats strictly from real API data
      let totalEmp: number | null = null;
      let activeEmp: number | null = null;

      if (employeesResult.status === "fulfilled") {
        totalEmp = employees.length;
        activeEmp = employees.filter((e) => e.isActive !== false).length;
      }

      // Calculate Plant Overview using actual work locations and staff assignments
      let plantList: PlantOverviewItem[] = [];
      if (locationsResult.status === "fulfilled" && locations.length > 0) {
        plantList = locations
          .filter((loc) => !loc.isDeleted)
          .map((loc) => {
            const locName = (loc.locationName || "").trim().toLowerCase();
            const count = employees.filter((e) => {
              const empLoc = (e.workLocationName || "").trim().toLowerCase();
              return empLoc === locName || (e as any).workLocationID === loc.id;
            }).length;

            return {
              id: loc.id,
              name: loc.locationName || "Unnamed Plant",
              city: loc.city || "",
              state: loc.state || "",
              employeeCount: count,
              isActive: loc.isActive !== false,
            };
          });
      }

      // 2. Fetch Recent Activities from existing APIs (ActivityLog or Notifications)
      let realActivities: ActivityItemData[] = [];
      try {
        const actRes = await apiClient.get<any[]>(`${API_ENDPOINTS.BaseUrl}/activitylog`);
        const actData = Array.isArray(actRes.data)
          ? actRes.data
          : (actRes.data as any)?.data || (actRes.data as any)?.result || [];
        if (Array.isArray(actData) && actData.length > 0) {
          realActivities = actData
            .filter((a: any) => !a.isDeleted)
            .slice(0, 5)
            .map((a: any, idx: number) => {
              const dateStr = a.activityDate || a.createdDate || a.createdAt;
              const type = (a.activityType || "").toLowerCase();
              let badgeBg = "bg-[#EDF5FF]";
              let badgeText = "text-[#0866E8]";
              let dotColor = "bg-[#0866E8]";

              if (type.includes("payroll")) {
                badgeBg = "bg-[#E8F8F5]";
                badgeText = "text-[#00A995]";
                dotColor = "bg-[#00A995]";
              } else if (type.includes("attendance") || type.includes("time")) {
                badgeBg = "bg-[#FFF5EB]";
                badgeText = "text-[#FF7900]";
                dotColor = "bg-[#FF7900]";
              } else if (type.includes("leave")) {
                badgeBg = "bg-[#E8F8F5]";
                badgeText = "text-[#00A995]";
                dotColor = "bg-[#00A995]";
              }

              return {
                id: a.activityLogId || a.id || idx,
                text: a.description || a.activityType || "System Event",
                time: dateStr
                  ? new Date(dateStr).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent",
                category: a.activityType || "System",
                dotColor,
                badgeBg,
                badgeText,
              };
            });
        }
      } catch {
        // Fallback to notifications if activitylog is not accessible
      }

      if (realActivities.length === 0) {
        try {
          const notifs = await getNotifications();
          if (Array.isArray(notifs) && notifs.length > 0) {
            realActivities = notifs.slice(0, 5).map((n) => ({
              id: n.id,
              text: n.message,
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent",
              category: "Notification",
              dotColor: "bg-[#00A995]",
              badgeBg: "bg-[#E8F8F5]",
              badgeText: "text-[#00A995]",
            }));
          }
        } catch {
          // No notifications available
        }
      }

      setStats({
        totalEmployees: totalEmp,
        activeEmployees: activeEmp,
        presentToday: null,
        attendanceRate: null,
        monthlyPayroll: null,
        payrollGrowth: null,
        pendingApprovals: null,
      });

      setPlants(plantList);
      setActivities(realActivities);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="bg-[#EDF3FF] min-h-screen -m-6 flex items-center justify-center">
        <LogoLoader />
      </div>
    );
  }

  return (
    <div className="relative bg-[#EDF3FF] min-h-full -m-6 p-6 lg:p-8 space-y-6 overflow-hidden">
      {/* High-End Ambient Gradient Ribbon Waves in Header Background */}
      <div className="absolute top-0 right-0 w-[720px] h-[260px] pointer-events-none overflow-hidden select-none z-0 opacity-60">
        <svg
          viewBox="0 0 720 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <defs>
            <linearGradient id="header-orange-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA726" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#FF7900" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FF7900" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="header-orange-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFB74D" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FFA726" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="header-blue-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M40 0 C 220 160, 480 30, 720 110 L 720 0 L 40 0 Z"
            fill="url(#header-orange-grad-1)"
          />
          <path
            d="M140 0 C 300 140, 520 40, 720 90"
            stroke="#FF7900"
            strokeWidth="1.8"
            strokeOpacity="0.5"
          />
          <path
            d="M200 0 C 360 130, 560 50, 720 80"
            stroke="#FFA726"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M280 0 C 420 110, 600 45, 720 65"
            stroke="url(#header-blue-accent)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Dashboard Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1E6] border border-[#FFE0CC] shadow-xs flex items-center justify-center text-[#FF7900] shrink-0">
            <LayoutGrid size={24} className="text-[#FF7900]" />
          </div>
          <div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight leading-tight">
                Dashboard
              </h1>
              <div className="w-12 h-1 bg-[#FF7900] rounded-full mt-1 mb-1"></div>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Real-time payroll and attendance overview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#FF7900] hover:border-[#FF7900]/40 transition shadow-xs cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#FF7900]" : "text-[#FF7900]"} />
            <span>Refresh</span>
          </button>

          {/* Month / Year Selector Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#17365D] shadow-xs cursor-pointer hover:border-[#FF7900]/40 transition">
            <Calendar size={14} className="text-[#64748B]" />
            <span>
              {new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {/* Live Data Badge */}
          <span className="inline-flex items-center gap-2 text-xs font-bold bg-[#E8F8F5] text-[#00A995] px-3.5 py-2 rounded-full border border-[#B9EBE1] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#00A995] animate-pulse"></span>
            Live Data
          </span>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="relative z-10 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="font-bold underline hover:text-red-900 cursor-pointer ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 4 KPI Dashboard Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Employees */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_8px_24px_rgba(23,54,93,0.05)] hover:shadow-[0_12px_32px_rgba(23,54,93,0.09)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D6] border border-[#FFD9BE] flex items-center justify-center text-[#FF7900] shadow-xs group-hover:scale-105 transition-transform duration-300">
              <Users size={20} className="text-[#FF7900]" />
            </div>
            <span className="text-xs font-bold text-[#17365D] tracking-wide">
              Total Employees
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight leading-none">
              {stats.totalEmployees !== null ? stats.totalEmployees.toLocaleString() : "—"}
            </div>
            {stats.totalEmployees !== null ? (
              <div className="text-xs text-[#00A995] font-semibold mt-2 flex items-center gap-1.5">
                <span className="font-bold">↗</span>
                <span>{stats.activeEmployees !== null ? stats.activeEmployees : 0} Active in system</span>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] font-medium mt-2">
                No data available
              </div>
            )}
          </div>
          {/* Subtle Watermark Icon */}
          <Users
            size={74}
            className="absolute right-3 bottom-1 text-slate-200/40 pointer-events-none select-none transition-transform group-hover:scale-105 duration-300"
          />
          {/* Multi-layered Soft Gradient Wave Corner */}
          <svg
            viewBox="0 0 85 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 right-0 w-20 h-10 pointer-events-none select-none"
          >
            <defs>
              <linearGradient id="kpi-corner-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA726" />
                <stop offset="100%" stopColor="#FF7900" />
              </linearGradient>
            </defs>
            <path
              d="M0 45 C 30 45, 55 32, 85 8 L 85 45 Z"
              fill="#FF7900"
              fillOpacity="0.18"
            />
            <path
              d="M12 45 C 40 45, 65 30, 85 0 L 85 45 Z"
              fill="url(#kpi-corner-1)"
            />
          </svg>
        </div>

        {/* Card 2: Present Today */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_8px_24px_rgba(23,54,93,0.05)] hover:shadow-[0_12px_32px_rgba(23,54,93,0.09)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D6] border border-[#FFD9BE] flex items-center justify-center text-[#FF7900] shadow-xs group-hover:scale-105 transition-transform duration-300">
              <CalendarCheck size={20} className="text-[#FF7900]" />
            </div>
            <span className="text-xs font-bold text-[#17365D] tracking-wide">
              Present Today
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight leading-none">
              {stats.presentToday !== null ? stats.presentToday.toLocaleString() : "—"}
            </div>
            <div className="text-xs text-[#64748B] font-medium mt-2">
              {stats.presentToday !== null
                ? `${stats.attendanceRate ?? 0}% attendance rate`
                : "No data available"}
            </div>
          </div>
          {/* Subtle Watermark Icon */}
          <CalendarDays
            size={74}
            className="absolute right-3 bottom-1 text-slate-200/40 pointer-events-none select-none transition-transform group-hover:scale-105 duration-300"
          />
          {/* Multi-layered Soft Gradient Wave Corner */}
          <svg
            viewBox="0 0 85 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 right-0 w-20 h-10 pointer-events-none select-none"
          >
            <path
              d="M0 45 C 30 45, 55 32, 85 8 L 85 45 Z"
              fill="#FF7900"
              fillOpacity="0.18"
            />
            <path
              d="M12 45 C 40 45, 65 30, 85 0 L 85 45 Z"
              fill="url(#kpi-corner-1)"
            />
          </svg>
        </div>

        {/* Card 3: Monthly Payroll */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_8px_24px_rgba(23,54,93,0.05)] hover:shadow-[0_12px_32px_rgba(23,54,93,0.09)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D6] border border-[#FFD9BE] flex items-center justify-center text-[#FF7900] shadow-xs group-hover:scale-105 transition-transform duration-300">
              <Coins size={20} className="text-[#FF7900]" />
            </div>
            <span className="text-xs font-bold text-[#17365D] tracking-wide">
              Monthly Payroll
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight leading-none">
              {stats.monthlyPayroll !== null ? stats.monthlyPayroll : "—"}
            </div>
            <div className="text-xs text-[#64748B] font-medium mt-2">
              {stats.monthlyPayroll !== null ? (
                <span className="text-[#00A995] font-semibold flex items-center gap-1">
                  <span>↗</span>
                  <span>{stats.payrollGrowth ?? "+8.2%"} from last month</span>
                </span>
              ) : (
                "No data available"
              )}
            </div>
          </div>
          {/* Subtle Rupee Sign Watermark */}
          <span className="absolute right-4 bottom-1 text-6xl font-light text-slate-200/40 pointer-events-none select-none leading-none">
            ₹
          </span>
          {/* Multi-layered Soft Gradient Wave Corner */}
          <svg
            viewBox="0 0 85 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 right-0 w-20 h-10 pointer-events-none select-none"
          >
            <path
              d="M0 45 C 30 45, 55 32, 85 8 L 85 45 Z"
              fill="#FF7900"
              fillOpacity="0.18"
            />
            <path
              d="M12 45 C 40 45, 65 30, 85 0 L 85 45 Z"
              fill="url(#kpi-corner-1)"
            />
          </svg>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_8px_24px_rgba(23,54,93,0.05)] hover:shadow-[0_12px_32px_rgba(23,54,93,0.09)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D6] border border-[#FFD9BE] flex items-center justify-center text-[#FF7900] shadow-xs group-hover:scale-105 transition-transform duration-300">
              <ClipboardCheck size={20} className="text-[#FF7900]" />
            </div>
            <span className="text-xs font-bold text-[#17365D] tracking-wide">
              Pending Approvals
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight leading-none">
              {stats.pendingApprovals !== null ? stats.pendingApprovals.toLocaleString() : "—"}
            </div>
            <div className="text-xs text-[#64748B] font-medium mt-2">
              {stats.pendingApprovals !== null ? "Leave requests" : "No data available"}
            </div>
          </div>
          {/* Subtle Watermark Icon */}
          <ClipboardCheck
            size={74}
            className="absolute right-3 bottom-1 text-slate-200/40 pointer-events-none select-none transition-transform group-hover:scale-105 duration-300"
          />
          {/* Multi-layered Soft Gradient Wave Corner */}
          <svg
            viewBox="0 0 85 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 right-0 w-20 h-10 pointer-events-none select-none"
          >
            <path
              d="M0 45 C 30 45, 55 32, 85 8 L 85 45 Z"
              fill="#FF7900"
              fillOpacity="0.18"
            />
            <path
              d="M12 45 C 40 45, 65 30, 85 0 L 85 45 Z"
              fill="url(#kpi-corner-1)"
            />
          </svg>
        </div>
      </div>

      {/* Middle Row: Plant Overview (Left) & Recent Activities (Right) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Overview Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-[0_8px_24px_rgba(23,54,93,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] border border-[#FFE0CC] text-[#FF7900] flex items-center justify-center shadow-2xs">
                  <Factory size={20} className="text-[#FF7900]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#17365D]">
                    Plant Overview
                  </h2>
                  <div className="w-10 h-0.5 bg-[#FF7900] rounded-full mt-1"></div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-3.5 py-1 rounded-lg shadow-2xs">
                {plants.length} {plants.length === 1 ? "Plant" : "Plants"}
              </span>
            </div>

            {plants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="space-y-3.5">
                  {plants.map((plant) => (
                    <div
                      key={plant.id}
                      className="p-4 rounded-xl border border-[#FFE2CC]/60 bg-gradient-to-br from-white to-[#FFFBF8] hover:border-[#FF7900]/40 hover:shadow-xs transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                          <p className="font-bold text-sm text-[#17365D]">
                            {plant.name}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${
                            plant.isActive
                              ? "bg-[#E8F8F5] text-[#00A995] border border-[#B9EBE1]"
                              : "bg-slate-100 text-[#64748B]"
                          }`}
                        >
                          {plant.isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00A995] animate-pulse"></span>
                          )}
                          {plant.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {(plant.city || plant.state) && (
                        <p className="text-xs text-[#64748B] mt-2.5 flex items-center gap-1.5 pl-10">
                          <MapPin size={13} className="text-slate-400" />
                          {[plant.city, plant.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-[#E2E8F0]/80 flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-medium">Registered Staff:</span>
                        <span className="font-bold text-[#17365D] bg-white px-3 py-0.5 rounded-md border border-[#E2E8F0] shadow-2xs">
                          {plant.employeeCount} {plant.employeeCount === 1 ? "Employee" : "Employees"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* High-Fidelity Vector Corporate Campus Illustration matching reference */}
                <div className="hidden md:flex items-center justify-center p-2">
                  <svg
                    viewBox="0 0 240 140"
                    className="w-64 h-40 select-none drop-shadow-xs"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="sun-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF1E6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#FFE0CC" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="bldg-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFF7ED" />
                        <stop offset="100%" stopColor="#FFEDD5" />
                      </linearGradient>
                      <linearGradient id="bldg-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFF1E6" />
                        <stop offset="100%" stopColor="#FFE4D1" />
                      </linearGradient>
                    </defs>

                    {/* Ground line */}
                    <path d="M10 125 H230" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

                    {/* Sun Glow */}
                    <circle cx="65" cy="45" r="24" fill="url(#sun-glow)" />

                    {/* Soft Clouds */}
                    <path d="M160 30 Q170 24, 185 28 Q195 24, 205 30 Q212 36, 195 38 H165 Q155 35, 160 30 Z" fill="#F1F5F9" opacity="0.6" />

                    {/* Left Trees */}
                    <circle cx="34" cy="98" r="13" fill="#FFA726" opacity="0.85" />
                    <rect x="32" y="108" width="4" height="17" fill="#D97706" rx="1.5" />
                    <circle cx="50" cy="104" r="9" fill="#FFB74D" opacity="0.8" />
                    <rect x="48.5" y="112" width="3" height="13" fill="#D97706" rx="1" />

                    {/* Main Headquarters Center Building */}
                    <rect x="70" y="65" width="68" height="60" rx="4" fill="url(#bldg-grad-2)" stroke="#FFD0AE" strokeWidth="1.2" />
                    <path d="M85 65 L104 50 L123 65 Z" fill="#FFD0AE" />
                    <rect x="97" y="98" width="14" height="27" rx="1.5" fill="#FFB74D" opacity="0.75" />
                    <rect x="79" y="75" width="11" height="12" rx="1.5" fill="#FFFFFF" />
                    <rect x="118" y="75" width="11" height="12" rx="1.5" fill="#FFFFFF" />
                    <rect x="79" y="94" width="11" height="12" rx="1.5" fill="#FFFFFF" />
                    <rect x="118" y="94" width="11" height="12" rx="1.5" fill="#FFFFFF" />

                    {/* Right Corporate High-Rise Wing */}
                    <rect x="144" y="42" width="46" height="83" rx="4" fill="url(#bldg-grad-1)" stroke="#FFD0AE" strokeWidth="1.2" />
                    <rect x="152" y="52" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="170" y="52" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="152" y="68" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="170" y="68" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="152" y="84" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="170" y="84" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="152" y="100" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />
                    <rect x="170" y="100" width="10" height="9" rx="1" fill="#FFEDD5" stroke="#FFE4D1" strokeWidth="0.8" />

                    {/* Right Trees */}
                    <circle cx="206" cy="98" r="11" fill="#FFA726" opacity="0.85" />
                    <rect x="204" y="107" width="4" height="18" fill="#D97706" rx="1.5" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
                <p className="text-xs text-[#64748B] font-medium">
                  No plant data available for this period.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-[0_8px_24px_rgba(23,54,93,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] border border-[#FFE0CC] text-[#FF7900] flex items-center justify-center shadow-2xs">
                  <Clock size={20} className="text-[#FF7900]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#17365D]">
                    Recent Activities
                  </h2>
                  <div className="w-10 h-0.5 bg-[#FF7900] rounded-full mt-1"></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms")}
                className="text-xs font-bold text-[#FF7900] hover:text-[#E06900] transition flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full ${item.dotColor} mt-1.5 shrink-0 group-hover:scale-125 transition-transform`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#17365D] leading-snug line-clamp-2">
                          {item.text}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {item.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${item.badgeBg} ${item.badgeText}`}
                    >
                      {item.category}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 px-4 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                  <Clock size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-[#17365D]">No recent activities</p>
                <p className="text-xs text-[#64748B] mt-1 max-w-xs text-center">
                  System events and activity logs will appear here as they occur.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Compliance Status & Quick Actions */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Status Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-[0_8px_24px_rgba(23,54,93,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] border border-[#FFE0CC] text-[#FF7900] flex items-center justify-center shadow-2xs">
                  <ShieldCheck size={20} className="text-[#FF7900]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#17365D]">
                    Compliance Status
                  </h2>
                  <div className="w-10 h-0.5 bg-[#FF7900] rounded-full mt-1"></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms")}
                className="text-xs font-bold text-[#FF7900] hover:text-[#E06900] transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <span>→</span>
              </button>
            </div>

            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                <ShieldCheck size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-[#17365D]">No compliance data available</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-xs text-center">
                Statutory compliance and filing updates will appear here once processed.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-[0_8px_24px_rgba(23,54,93,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]/80 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] border border-[#FFE0CC] text-[#FF7900] flex items-center justify-center shadow-2xs">
                <Zap size={20} className="text-[#FF7900]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#17365D]">
                  Quick Actions
                </h2>
                <div className="w-10 h-0.5 bg-[#FF7900] rounded-full mt-1"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Add Employee */}
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms/employees")}
                className="group p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FFF5EC] hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                  <UserPlus size={18} />
                </div>
                <span className="text-xs font-bold text-[#17365D] group-hover:text-[#FF7900] transition">
                  Add Employee
                </span>
              </button>

              {/* Employee Directory */}
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms/employees")}
                className="group p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FFF5EC] hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                  <Users size={18} />
                </div>
                <span className="text-xs font-bold text-[#17365D] group-hover:text-[#FF7900] transition">
                  Employee Directory
                </span>
              </button>

              {/* Process Payroll */}
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms")}
                className="group p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FFF5EC] hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                  <Coins size={18} />
                </div>
                <span className="text-xs font-bold text-[#17365D] group-hover:text-[#FF7900] transition">
                  Process Payroll
                </span>
              </button>

              {/* Leave Approvals */}
              <button
                type="button"
                onClick={() => navigate("/frontend/hrms")}
                className="group p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FFF5EC] hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#FF7900] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                  <CalendarCheck size={18} />
                </div>
                <span className="text-xs font-bold text-[#17365D] group-hover:text-[#FF7900] transition">
                  Leave Approvals
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
