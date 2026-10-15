import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Quotation Approvals
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Commercial approval requests, discount concession reviews, and management decision logs
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApprovals}
          className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Request #</th>
                <th className="p-3.5">Quotation Ref</th>
                <th className="p-3.5">Approval Reason</th>
                <th className="p-3.5">Requested Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Approved By</th>
                <th className="p-3.5">Approver Comments</th>
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
                  <tr key={app.quotationApprovalId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-gray-900">
                      #{app.quotationApprovalId}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-blue-700">
                      <Link to={`/rsm/quotations/${app.quotationId}`} className="hover:underline">
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
                    <td className="p-3.5 text-gray-600">
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
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 rounded-lg transition"
                        >
                          Review &amp; Decide
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Quotation Approval Decision
              </h3>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Deciding approval for Quotation{" "}
              <span className="font-bold font-mono">
                {selectedApproval.quotationNumber || `QT-${selectedApproval.quotationId}`}
              </span>
              . Reason: {selectedApproval.approvalReason}
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Manager Decision <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("Approved")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      decision === "Approved"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle size={15} />
                    <span>Approve Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("Rejected")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      decision === "Rejected"
                        ? "bg-rose-600 text-white border-rose-600 shadow"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <XCircle size={15} />
                    <span>Reject Proposal</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Approver Remarks / Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Approved as a strategic pricing exception for key client."
                  value={approverComments}
                  onChange={(e) => setApproverComments(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition ${
                    decision === "Approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : `Confirm ${decision}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationApprovalList;
