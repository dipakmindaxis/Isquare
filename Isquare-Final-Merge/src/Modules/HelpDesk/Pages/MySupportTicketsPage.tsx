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

  // Load Tickets from API 2
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

  // When search or status filter changes, reset to page 1
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

  // Optional client-side priority filter if API 2 does not filter priority on server
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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadTickets}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Tickets"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Support Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => handleStatusFilterChange("All")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === "All"
              ? "bg-white border-[#00234a] shadow-xs ring-1 ring-[#00234a]"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Tickets
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div
          onClick={() => handleStatusFilterChange("Open")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === "Open"
              ? "bg-white border-amber-500 shadow-xs ring-1 ring-amber-500"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Open
          </p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.open}</p>
        </div>

        <div
          onClick={() => handleStatusFilterChange("In Progress")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === "In Progress"
              ? "bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.inProgress}</p>
        </div>

        <div
          onClick={() => handleStatusFilterChange("Resolved")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === "Resolved"
              ? "bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Resolved
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</p>
        </div>

        <div
          onClick={() => handleStatusFilterChange("Closed")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === "Closed"
              ? "bg-white border-rose-500 shadow-xs ring-1 ring-rose-500"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Closed
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-1">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              Search Tickets
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search ticket # or subject..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 min-h-[34px]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              Filter by Status
            </label>
            <SearchableSelect
              value={statusFilter}
              onChange={(val) => handleStatusFilterChange(String(val || "All"))}
              options={[
                { value: "All", label: "All Statuses" },
                { value: "Open", label: "Open" },
                { value: "In Progress", label: "In Progress" },
                { value: "Resolved", label: "Resolved" },
                { value: "Closed", label: "Closed" },
              ]}
              placeholder="All Statuses"
              isClearable={false}
              minHeight="34px"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              Filter by Priority
            </label>
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
              minHeight="34px"
            />
          </div>
        </div>
      </div>

      {/* Tickets Table: Strictly 7 columns as required */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5">Ticket Number</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 text-center">Reply Count</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-slate-300" />
                    Loading support tickets...
                  </td>
                </tr>
              ) : displayedTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Inbox size={40} className="mx-auto text-slate-300 mb-3 stroke-[1.5]" />
                    <h3 className="text-sm font-bold text-slate-700">No support tickets found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      You haven't logged any support tickets yet. Click "Create Support Ticket" to raise a new request with MindAxis Support.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#00234a] hover:bg-[#003366] text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Create Ticket</span>
                    </button>
                  </td>
                </tr>
              ) : (
                displayedTickets.map((t) => (
                  <tr key={t.ticketNumber} className="hover:bg-slate-50/70 transition">
                    {/* 1. Ticket Number */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewOpen(true);
                        }}
                        className="font-mono text-xs font-bold text-[#00234a] hover:text-[#FF7900] bg-slate-100 px-2 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                      >
                        {t.ticketNumber}
                      </button>
                    </td>

                    {/* 2. Subject */}
                    <td className="px-4 py-3.5 max-w-md">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewOpen(true);
                        }}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left transition cursor-pointer line-clamp-1 block"
                      >
                        {t.subject}
                      </button>
                    </td>

                    {/* 3. Priority */}
                    <td className="px-4 py-3.5">
                      {renderPriorityBadge(t.priority)}
                    </td>

                    {/* 4. Status */}
                    <td className="px-4 py-3.5 text-center">
                      {renderStatusBadge(t.status)}
                    </td>

                    {/* 5. Created Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(t.createdDate)}
                      </span>
                    </td>

                    {/* 6. Reply Count */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <MessageSquare size={11} className="text-slate-400" />
                        {t.replyCount ?? 0}
                      </span>
                    </td>

                    {/* 7. Action */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#00234a] hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                        title="View Details"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500">
            <div>
              Showing{" "}
              <strong className="text-slate-800">
                {Math.min(totalCount, (currentPage - 1) * itemsPerPage + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800">
                {Math.min(totalCount, currentPage * itemsPerPage)}
              </strong>{" "}
              of <strong className="text-slate-800">{totalCount}</strong> tickets
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
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 outline-none cursor-pointer"
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
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-slate-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition cursor-pointer"
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
