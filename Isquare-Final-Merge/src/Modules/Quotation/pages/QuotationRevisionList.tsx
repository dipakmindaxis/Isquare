import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, RefreshCw, History, X } from "lucide-react";
import { toast } from "sonner";
import { quotationRevisionService } from "../services/quotationService";
import type { QuotationRevision } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";

export const QuotationRevisionList: React.FC = () => {
  const [revisions, setRevisions] = useState<QuotationRevision[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRevision, setSelectedRevision] = useState<QuotationRevision | null>(null);

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const data = await quotationRevisionService.getAll();
      setRevisions(data);
    } catch (e) {
      console.error("Failed to load revisions:", e);
      toast.error("Failed to fetch revision history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <History size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Quotation Revisions
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                Audit Trail
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Complete audit trail of all quotation versions (R0, R1, R2...) and historical snapshot values.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Revision History
        </h2>

        <button
          type="button"
          onClick={fetchRevisions}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
          title="Refresh revisions list"
        >
          <RefreshCw size={14} className="text-[#FF7900]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white font-bold uppercase text-[12px] tracking-wider">
                <th className="p-3.5 border-r border-[#e06800]">Revision #</th>
                <th className="p-3.5 border-r border-[#e06800]">Quotation Ref</th>
                <th className="p-3.5 border-r border-[#e06800]">Revision Reason</th>
                <th className="p-3.5 border-r border-[#e06800]">Revised Date</th>
                <th className="p-3.5 border-r border-[#e06800]">Revised By</th>
                <th className="p-3.5 text-right border-r border-[#e06800]">Snapshot Grand Total</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    Loading revision history from API...
                  </td>
                </tr>
              ) : revisions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    No revision snapshots recorded yet. Revisions are generated when quotations are amended.
                  </td>
                </tr>
              ) : (
                revisions.map((rev) => (
                  <tr key={rev.quotationRevisionId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[52px]">
                    <td className="p-3.5 font-bold font-mono">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                        R{rev.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-[#00234a]">
                      <Link
                        to={`/rsm/quotations/${rev.quotationId}`}
                        className="hover:text-[#FF7900] transition"
                      >
                        {rev.quotationNumber || `QT-${rev.quotationId}`}
                      </Link>
                    </td>
                    <td className="p-3.5 font-medium text-gray-700 max-w-xs truncate">
                      {rev.revisionReason || "Proposal updated"}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {rev.revisionDate ? new Date(rev.revisionDate).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="p-3.5 text-gray-600 font-medium">
                      {rev.revisedBy || "Administrator"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                      {rev.grandTotal ? formatINR(rev.grandTotal) : "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge status={rev.quotationStatus || "Revised"} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedRevision(rev)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition cursor-pointer shadow-2xs"
                        title="View Snapshot"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot View Modal matching Customer Master style */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-[#FF7900] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Revision Snapshot Details — R{selectedRevision.revisionNumber}</span>
              </h3>
              <button
                onClick={() => setSelectedRevision(null)}
                className="text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Quotation Reference:</span>
                <span className="font-bold font-mono text-[#00234a]">{selectedRevision.quotationNumber || `QT-${selectedRevision.quotationId}`}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Revision Reason:</span>
                <span className="font-semibold text-gray-800">{selectedRevision.revisionReason}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Revision Date:</span>
                <span className="text-gray-700">{selectedRevision.revisionDate ? new Date(selectedRevision.revisionDate).toLocaleString("en-IN") : "—"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Taxable Amount:</span>
                <span className="font-mono font-medium text-gray-800">{formatINR(selectedRevision.taxableAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">GST Amount:</span>
                <span className="font-mono font-medium text-gray-800">{formatINR(selectedRevision.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Freight &amp; Charges:</span>
                <span className="font-mono font-medium text-gray-800">
                  {formatINR(
                    (selectedRevision.freightCharges || 0) +
                      (selectedRevision.installationCharges || 0) +
                      (selectedRevision.otherCharges || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 text-sm font-bold border-t border-gray-200">
                <span className="text-gray-700">Grand Total:</span>
                <span className="text-xl font-extrabold text-[#00234a] font-mono">{formatINR(selectedRevision.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end p-4 bg-gray-50/80 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedRevision(null)}
                className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationRevisionList;

