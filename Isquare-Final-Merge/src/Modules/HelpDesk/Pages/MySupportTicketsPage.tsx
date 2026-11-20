import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Headphones,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "../../../Components/Common/SearchableSelect";
import { useAuth } from "../../../hooks/useAuth";
import {
  getExternalSupportTickets,
  computeTicketStats,
  getCachedTickets,
} from "../Services/HelpDeskService";
import type {
  ExternalTicketListItem,
  TicketSummaryStats,
} from "../Types/HelpDeskTypes";
import { CreateSupportTicketModal } from "../Components/CreateSupportTicketModal";
import { ViewTicketDetailsModal } from "../Components/ViewTicketDetailsModal";

const actionButtonStyles = {
  base: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-xs hover:shadow cursor-pointer",
  view: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
};

export const MySupportTicketsPage: React.FC = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<ExternalTicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<TicketSummaryStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Server-Side Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<ExternalTicketListItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);

  // Load Tickets from API
  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getExternalSupportTickets(
        {
          search,
          status: statusFilter !== "All" ? statusFilter : undefined,
          page: currentPage,
          pageSize: itemsPerPage,
        },
        user
      );

      setTickets(response.items);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);

      // Compute statistics from current cache or returned items
      const cached = getCachedTickets();
      const allForStats = cached.length > 0 ? cached : response.items;
      setStats(computeTicketStats(allForStats));
    } catch {
      toast.error("Failed to load support tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, currentPage, itemsPerPage, user]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handleTicketCreated = () => {
    loadTickets();
  };

  const handleTicketUpdated = () => {
    loadTickets();
  };

  const displayedTickets = useMemo(() => {
    if (!priorityFilter || priorityFilter === "All") return tickets;
    return tickets.filter(
      (t) => (t.priority || "").toLowerCase().trim() === priorityFilter.toLowerCase().trim()
    );
  }, [tickets, priorityFilter]);

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "open" || s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} /> {status || "Open"}
        </span>
      );
    }
    if (s === "received") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 size={11} /> Received
        </span>
      );
    }
    if (s.includes("progress")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock size={11} className="animate-pulse" /> In Progress
        </span>
      );
    }
    if (s === "resolved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} /> Resolved
        </span>
      );
    }
    if (s === "closed" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle size={11} /> {status || "Closed"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priorityName: string) => {
    const p = (priorityName || "").toLowerCase().trim();
    if (p.includes("urgent") || p.includes("critical")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Critical
        </span>
      );
    }
    if (p.includes("high")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
          High
        </span>
      );
    }
    if (p.includes("low")) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
          Low
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        Medium
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6 animate-in fade-in duration-200">
      {/* Listing Header matching Customer Master style */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
            My Support Tickets
          </h2>
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] flex items-center justify-center shadow-xs shrink-0">
            <Headphones size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              My Support Tickets
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadTickets}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Create Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Analytics / KPI Stats Cards (matching Customer Master horizontal card style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Tickets */}
        <div
          onClick={() => handleStatusFilterChange("All")}
          className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition cursor-pointer hover:border-slate-300 ${
            statusFilter === "All"
              ? "border-[#00234a] ring-2 ring-[#00234a]/20"
              : "border-gray-100"
          }`}
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Headphones size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Total Tickets
            </p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        {/* Open */}
        <div
          onClick={() => handleStatusFilterChange("Open")}
          className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition cursor-pointer hover:border-slate-300 ${
            statusFilter === "Open"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-gray-100"
          }`}
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Open
            </p>
            <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => handleStatusFilterChange("In Progress")}
          className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition cursor-pointer hover:border-slate-300 ${
            statusFilter === "In Progress"
              ? "border-indigo-500 ring-2 ring-indigo-500/20"
              : "border-gray-100"
          }`}
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              In Progress
            </p>
            <p className="text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => handleStatusFilterChange("Resolved")}
          className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition cursor-pointer hover:border-slate-300 ${
            statusFilter === "Resolved"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-gray-100"
          }`}
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Resolved
            </p>
            <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Closed */}
        <div
          onClick={() => handleStatusFilterChange("Closed")}
          className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4 transition cursor-pointer hover:border-slate-300 ${
            statusFilter === "Closed"
              ? "border-rose-500 ring-2 ring-rose-500/20"
              : "border-gray-100"
          }`}
        >
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
              Closed
            </p>
            <p className="text-2xl font-bold text-rose-600">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (matching Customer Master filter layout) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
        {/* Search input with left icon */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search ticket # or subject..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF7900] bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status segmented pills */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["All", "Open", "In Progress", "Resolved", "Closed"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusFilterChange(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-[#00234a] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="min-w-[150px]">
            <SearchableSelect
              value={priorityFilter}
              onChange={(val) => handlePriorityFilterChange(String(val || "All"))}
              options={[
                { value: "All", label: "All Priorities" },
                { value: "Critical", label: "Critical" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
              placeholder="All Priorities"
              isClearable={false}
              minHeight="36px"
            />
          </div>
        </div>
      </div>

      {/* Tickets Table: Exactly matching Customer Master / listingTableStyles theme with #FF7900 orange header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FF7900] text-white">
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800] min-w-[140px]">
                  Ticket Number
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800]">
                  Subject
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800] min-w-[110px]">
                  Priority
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800] text-center min-w-[120px]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800] min-w-[130px]">
                  Created Date
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase border-r border-[#e06800] text-center min-w-[110px]">
                  Reply Count
                </th>
                <th className="px-4 py-3.5 text-white font-semibold text-[13px] tracking-wider uppercase text-center min-w-[90px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500">
                    <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-[#FF7900]" />
                    <span className="font-semibold text-sm">Loading support tickets...</span>
                  </td>
                </tr>
              ) : displayedTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Inbox size={42} className="mx-auto text-gray-300 mb-3 stroke-[1.5]" />
                    <h3 className="text-base font-bold text-gray-700">No support tickets found</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      You haven't logged any support tickets yet. Click "Create Support Ticket" to raise a new request.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2 text-xs font-semibold text-white shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Create Support Ticket</span>
                    </button>
                  </td>
                </tr>
              ) : (
                displayedTickets.map((t) => (
                  <tr
                    key={t.ticketNumber}
                    className="border-b border-[#d9dde5] hover:bg-[#f0f7ff] transition-all duration-150 min-h-[52px]"
                  >
                    {/* 1. Ticket Number */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewOpen(true);
                        }}
                        className="font-mono text-xs font-bold text-[#00234a] hover:text-[#FF7900] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                      >
                        {t.ticketNumber}
                      </button>
                    </td>

                    {/* 2. Subject */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] max-w-md">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewOpen(true);
                        }}
                        className="font-bold text-gray-900 hover:text-[#FF7900] text-left transition cursor-pointer line-clamp-1 block"
                      >
                        {t.subject}
                      </button>
                    </td>

                    {/* 3. Priority */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] whitespace-nowrap">
                      {renderPriorityBadge(t.priority)}
                    </td>

                    {/* 4. Status */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] text-center whitespace-nowrap">
                      {renderStatusBadge(t.status)}
                    </td>

                    {/* 5. Created Date */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] text-xs text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-gray-400" />
                        {formatDate(t.createdDate)}
                      </span>
                    </td>

                    {/* 6. Reply Count */}
                    <td className="px-4 py-3 border-r border-[#d9dde5] text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <MessageSquare size={11} className="text-slate-400" />
                        {t.replyCount ?? 0}
                      </span>
                    </td>

                    {/* 7. Action */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(t);
                            setIsViewOpen(true);
                          }}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/80 border-t border-gray-200 text-xs text-gray-500">
            <div>
              Showing{" "}
              <strong className="text-gray-800 font-semibold">
                {Math.min(totalCount, (currentPage - 1) * itemsPerPage + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-800 font-semibold">
                {Math.min(totalCount, currentPage * itemsPerPage)}
              </strong>{" "}
              of <strong className="text-gray-800 font-semibold">{totalCount}</strong> tickets
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-gray-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Support Ticket Modal */}
      <CreateSupportTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleTicketCreated}
      />

      {/* View Ticket Details Modal */}
      <ViewTicketDetailsModal
        isOpen={isViewOpen}
        ticket={selectedTicket}
        ticketNumber={selectedTicket?.ticketNumber}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default MySupportTicketsPage;
