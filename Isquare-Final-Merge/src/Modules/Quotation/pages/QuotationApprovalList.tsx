import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { quotationApprovalService, quotationService } from "../services/quotationService";
import type { QuotationApproval } from "../models/quotationModels";
import QuotationStatusBadge from "../components/QuotationStatusBadge";

export const QuotationApprovalList: React.FC = () => {
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision Modal
  const [selectedApproval, setSelectedApproval] = useState<QuotationApproval | null>(null);
  const [decision, setDecision] = useState<"Approved" | "Rejected">("Approved");
  const [approverComments, setApproverComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const [approvalData, quotesData] = await Promise.all([
        quotationApprovalService.getAll(),
        quotationService.getAll().catch(() => []),
      ]);
      const quoteMap = new Map<number, string>();
      quotesData.forEach((q) => {
        if (q.quotationId && q.quotationNumber) {
          quoteMap.set(q.quotationId, q.quotationNumber);
        }
      });
      const enriched = approvalData.map((a) => ({
        ...a,
        quotationNumber: a.quotationNumber || quoteMap.get(a.quotationId) || `QT-${a.quotationId}`,
      }));
      setApprovals(enriched);
    } catch (e) {
      console.error("Failed to fetch approvals:", e);
      toast.error("Failed to load quotation approvals from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    setIsSubmitting(true);
    try {
      await quotationApprovalService.decideApproval(selectedApproval.quotationApprovalId, {
        decision: decision,
        approverComments: approverComments,
      });
      toast.success(`Approval decision '${decision}' saved successfully`);
      setSelectedApproval(null);
      setApproverComments("");
      fetchApprovals();
    } catch (e) {
      toast.error("Failed to submit approval decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Quotation Approvals
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                Workflow Approvals
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Commercial approval requests, discount concession reviews, and management decision logs.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Approval Requests
        </h2>

        <button
          type="button"
          onClick={fetchApprovals}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
          title="Refresh approvals list"
        >
          <RefreshCw size={14} className="text-[#FF7900]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white font-bold uppercase text-[12px] tracking-wider">
                <th className="p-3.5 border-r border-[#e06800]">Request #</th>
                <th className="p-3.5 border-r border-[#e06800]">Quotation Ref</th>
                <th className="p-3.5 border-r border-[#e06800]">Approval Reason</th>
                <th className="p-3.5 border-r border-[#e06800]">Requested Date</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Status</th>
                <th className="p-3.5 border-r border-[#e06800]">Approved By</th>
                <th className="p-3.5 border-r border-[#e06800]">Approver Comments</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    Loading approval records from API...
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    No quotation approvals logged. Approvals are triggered when quotes have special terms or &gt;15% discount.
                  </td>
                </tr>
              ) : (
                approvals.map((app) => (
                  <tr key={app.quotationApprovalId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[52px]">
                    <td className="p-3.5 font-bold font-mono text-[#00234a]">
                      #{app.quotationApprovalId}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-[#00234a]">
                      <Link to={`/rsm/quotations/${app.quotationId}`} className="hover:text-[#FF7900] transition">
                        {app.quotationNumber || `QT-${app.quotationId}`}
                      </Link>
                    </td>
                    <td className="p-3.5 text-gray-700 font-medium max-w-xs truncate">
                      {app.approvalReason || "High discount threshold approval"}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {app.requestedAt ? new Date(app.requestedAt).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge status={app.approvalStatus} type="approval" />
                    </td>
                    <td className="p-3.5 text-gray-700 font-medium">
                      {app.approvedBy || "—"}
                    </td>
                    <td className="p-3.5 text-gray-500 max-w-xs truncate">
                      {app.approverComments || "—"}
                    </td>
                    <td className="p-3.5 text-right">
                      {(app.approvalStatus || "").trim().toLowerCase() === "pending" ? (
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setDecision("Approved");
                            setApproverComments("");
                          }}
                          className="px-3.5 py-1.5 bg-[#00234a] hover:bg-[#FF7900] text-white font-semibold rounded-xl transition cursor-pointer shadow-xs"
                        >
                          Review &amp; Decide
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal matching Customer Master style */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-[#FF7900] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-bold text-white">
                Quotation Approval Decision
              </h3>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 bg-orange-50/60 border border-orange-200/60 p-3 rounded-xl">
                Deciding approval for Quotation{" "}
                <span className="font-bold font-mono text-[#00234a]">
                  {selectedApproval.quotationNumber || `QT-${selectedApproval.quotationId}`}
                </span>
                . Reason: {selectedApproval.approvalReason}
              </p>

              <form onSubmit={handleDecisionSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Manager Decision <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision("Approved")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        decision === "Approved"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle size={15} />
                      <span>Approve Proposal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision("Rejected")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        decision === "Rejected"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <XCircle size={15} />
                      <span>Reject Proposal</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Approver Remarks / Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Approved as a strategic pricing exception for key client."
                    value={approverComments}
                    onChange={(e) => setApproverComments(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedApproval(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer ${
                      decision === "Approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : `Confirm ${decision}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationApprovalList;

