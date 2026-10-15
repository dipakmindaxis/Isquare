import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, RefreshCw } from "lucide-react";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Quotation Revision History
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete audit trail of all quotation versions (R0, R1, R2...) and snapshot values
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRevisions}
          className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Revision #</th>
                <th className="p-3.5">Quotation Ref</th>
                <th className="p-3.5">Revision Reason</th>
                <th className="p-3.5">Revised Date</th>
                <th className="p-3.5">Revised By</th>
                <th className="p-3.5 text-right">Snapshot Grand Total</th>
                <th className="p-3.5 text-center">Status</th>
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
                  <tr key={rev.quotationRevisionId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-indigo-700">
                      R{rev.revisionNumber}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-gray-900">
                      <Link
                        to={`/rsm/quotations/${rev.quotationId}`}
                        className="hover:text-blue-600 transition"
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
                    <td className="p-3.5 text-gray-600">
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
                        className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition"
                        title="View Snapshot"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot View Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Revision Snapshot Details — R{selectedRevision.revisionNumber}
              </h3>
              <button
                onClick={() => setSelectedRevision(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Quotation Reference:</span>
                <span className="font-bold font-mono">{selectedRevision.quotationNumber || `QT-${selectedRevision.quotationId}`}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Revision Reason:</span>
                <span className="font-semibold text-gray-800">{selectedRevision.revisionReason}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Revision Date:</span>
                <span>{selectedRevision.revisionDate ? new Date(selectedRevision.revisionDate).toLocaleString("en-IN") : "—"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Taxable Amount:</span>
                <span className="font-mono">{formatINR(selectedRevision.taxableAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">GST Amount:</span>
                <span className="font-mono">{formatINR(selectedRevision.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Freight &amp; Charges:</span>
                <span className="font-mono">
                  {formatINR(
                    (selectedRevision.freightCharges || 0) +
                      (selectedRevision.installationCharges || 0) +
                      (selectedRevision.otherCharges || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span>Grand Total:</span>
                <span className="text-blue-700 font-mono">{formatINR(selectedRevision.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedRevision(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
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
