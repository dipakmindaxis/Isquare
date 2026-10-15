import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Trophy,
  IndianRupee,
  ShoppingCart,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
  Edit,
  CheckCircle,
} from "lucide-react";
import {
  quotationService,
  salesOrderService,
  quotationApprovalService,
} from "../services/quotationService";
import type { Quotation, SalesOrder, QuotationApproval } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";

export const QuotationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [quotesRes, ordersRes, approvalsRes] = await Promise.allSettled([
        quotationService.getAll(),
        salesOrderService.getAll(),
        quotationApprovalService.getAll(),
      ]);

      if (quotesRes.status === "fulfilled") {
        setQuotations(quotesRes.value);
      }
      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value);
      }
      if (approvalsRes.status === "fulfilled") {
        setApprovals(approvalsRes.value);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregated KPI Stats calculated from actual API data
  const totalQuotations = quotations.length;
  const draftCount = quotations.filter((q) => (q.status || "").toLowerCase() === "draft").length;
  const sentCount = quotations.filter((q) => (q.status || "").toLowerCase() === "sent").length;
  const approvedCount = quotations.filter((q) => (q.status || "").toLowerCase() === "approved").length;
  const wonCount = quotations.filter((q) => (q.status || "").toLowerCase() === "won").length;
  const lostCount = quotations.filter((q) => (q.status || "").toLowerCase() === "lost").length;
  const pendingApprovalsCount = approvals.filter(
    (a) => (a.approvalStatus || "").toLowerCase() === "pending"
  ).length;

  const totalQuotationValue = quotations.reduce(
    (acc, q) => acc + (Number(q.grandTotal) || 0),
    0
  );
  const salesOrdersGenerated = orders.length;

  // Pipeline distribution calculation
  const pipelineStages = [
    { label: "Draft", count: draftCount, color: "bg-slate-400" },
    { label: "Sent", count: sentCount, color: "bg-blue-500" },
    { label: "Pending Approval", count: pendingApprovalsCount, color: "bg-amber-500" },
    { label: "Approved", count: approvedCount, color: "bg-emerald-500" },
    { label: "Won", count: wonCount, color: "bg-purple-500" },
    { label: "Lost", count: lostCount, color: "bg-rose-500" },
  ];

  const recentQuotations = quotations.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header with Title and Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Quotation Management Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time commercial proposals, approvals, pipeline stages and revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/rsm/quotations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition shadow-sm"
          >
            <FileText size={14} />
            <span>All Quotations</span>
          </Link>
          <Link
            to="/rsm/quotations/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition"
          >
            <Plus size={15} />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Quotations
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
            {isLoading ? "..." : totalQuotations}
          </h3>
          <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp size={13} />
            <span>Active Proposal Pipeline</span>
          </p>
        </div>

        {/* Won & Approved */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Approved &amp; Won
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trophy size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {isLoading ? "..." : wonCount + approvedCount}
          </h3>
          <p className="text-xs text-emerald-700 font-medium mt-2">
            Won: {wonCount} · Approved: {approvedCount}
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            {isLoading ? "..." : pendingApprovalsCount}
          </h3>
          <p className="text-xs text-amber-700 font-medium mt-2">
            High discounts (&gt;15%) &amp; management review
          </p>
        </div>

        {/* Total Quotation Value */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Pipeline Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <IndianRupee size={18} />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mt-2 truncate">
            {isLoading ? "..." : formatINR(totalQuotationValue)}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-2">
            Orders Generated: <span className="font-bold text-gray-800">{salesOrdersGenerated}</span>
          </p>
        </div>
      </div>

      {/* Secondary Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Draft</p>
            <p className="text-lg font-bold text-gray-800">{draftCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-slate-400" />
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Sent</p>
            <p className="text-lg font-bold text-blue-600">{sentCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-blue-500" />
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Lost</p>
            <p className="text-lg font-bold text-rose-600">{lostCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-rose-500" />
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Sales Orders</p>
            <p className="text-lg font-bold text-purple-600">{salesOrdersGenerated}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-purple-500" />
        </div>
      </div>

      {/* Middle Grid: Pipeline Breakdown & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Quotation Pipeline Stages
            </h3>
            <span className="text-xs text-gray-400 font-medium">Stage Distribution</span>
          </div>

          <div className="space-y-3.5">
            {pipelineStages.map((stage) => {
              const pct =
                totalQuotations > 0
                  ? Math.round((stage.count / totalQuotations) * 100)
                  : 0;
              return (
                <div key={stage.label}>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-gray-600">{stage.label}</span>
                    <span className="text-gray-900 font-bold">
                      {stage.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${stage.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, stage.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Quick Actions &amp; Workflows
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/rsm/quotations/create"
              className="p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/40 transition group block"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Plus size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-xs">Create Quotation</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Configure itemized quotation with GST, freight &amp; legal terms.
              </p>
            </Link>

            <Link
              to="/rsm/quotations/approvals"
              className="p-4 rounded-xl border border-gray-100 hover:border-amber-500 hover:bg-amber-50/40 transition group block"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-xs">Approval Workflow</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Track pending manager approvals and decision logs.
              </p>
            </Link>

            <Link
              to="/rsm/sales-orders"
              className="p-4 rounded-xl border border-gray-100 hover:border-purple-500 hover:bg-purple-50/40 transition group block"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <ShoppingCart size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-xs">Sales Orders</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                View orders converted from approved and won proposals.
              </p>
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00234a] text-white flex items-center justify-center text-xs font-bold">
                iS
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Commercial Rule Enforced</p>
                <p className="text-[11px] text-gray-500">
                  Quotations with discount &gt;15% automatically flag manager approval requirements.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg shrink-0">
              Active Rule
            </span>
          </div>
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Recent Commercial Quotations</h3>
            <p className="text-xs text-gray-500">Latest proposals created in the system</p>
          </div>
          <Link
            to="/rsm/quotations"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Quotations</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Revision</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Enquiry Ref</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Grand Total (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                    Loading quotation metrics from API...
                  </td>
                </tr>
              ) : recentQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                    No quotations found in the database. Click "Create Quotation" to start.
                  </td>
                </tr>
              ) : (
                recentQuotations.map((q) => (
                  <tr key={q.quotationId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-gray-900 font-mono">
                      {q.quotationNumber || `QT-${q.quotationId}`}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[11px]">
                        R{q.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">
                      {q.customerName || `Customer #${q.customerId}`}
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono">
                      {q.enquiryRef || q.enquiryId ? `ENQ-${q.enquiryId}` : "—"}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {q.quotationDate
                        ? new Date(q.quotationDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900">
                      {formatINR(q.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge status={q.status} />
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/rsm/quotations/${q.quotationId}`)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/rsm/quotations/${q.quotationId}/edit`)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition"
                        title="Edit Quotation"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationDashboard;
