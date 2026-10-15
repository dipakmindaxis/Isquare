import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  RotateCcw,
  RefreshCw,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  quotationService,
  quotationApprovalService,
  quotationRevisionService,
  salesOrderService,
  getApiErrorMessage,
} from "../services/quotationService";
import type { Quotation, QuotationApproval, SalesOrder } from "../models/quotationModels";
import { formatINR, getEffectiveApprovalStatus } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../Utils/exportToExcel";

export const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);
  const [convertingQuotationId, setConvertingQuotationId] = useState<number | null>(null);
  const convertingQuotationIds = useRef(new Set<number>());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quotes, allApprovals] = await Promise.all([
        quotationService.getAll(),
        quotationApprovalService.getAll(),
      ]);
      setQuotations(quotes);
      setApprovals(allApprovals);
    } catch (e) {
      console.error("Failed to load quotations:", e);
      toast.error("Failed to fetch quotations from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered List
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const qNum = (q.quotationNumber || `QT-${q.quotationId}`).toLowerCase();
      const custName = (q.customerName || "").toLowerCase();
      const enq = (q.enquiryRef || "").toLowerCase();
      const matchesSearch =
        qNum.includes(searchText.toLowerCase()) ||
        custName.includes(searchText.toLowerCase()) ||
        enq.includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (q.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchText, statusFilter]);

  // Paginated List
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotations.slice(start, start + itemsPerPage);
  }, [filteredQuotations, currentPage, itemsPerPage]);

  const handleDeleteConfirm = async () => {
    if (!selectedQuotation) return;
    try {
      await quotationService.delete(selectedQuotation.quotationId);
      toast.success(`Quotation ${selectedQuotation.quotationNumber || `#${selectedQuotation.quotationId}`} deleted`);
      setQuotations((prev) =>
        prev.filter((q) => q.quotationId !== selectedQuotation.quotationId)
      );
      setDeleteModalOpen(false);
      setSelectedQuotation(null);
    } catch (e) {
      toast.error("Failed to delete quotation");
    }
  };

  const handleCreateRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    if (!revisionReason.trim()) {
      toast.error("Please enter a revision reason");
      return;
    }

    setIsSubmittingRevision(true);
    try {
      await quotationRevisionService.create({
        quotationId: selectedQuotation.quotationId,
        revisionReason: revisionReason,
      });
      toast.success(`Revision snapshot created for ${selectedQuotation.quotationNumber || `#${selectedQuotation.quotationId}`}`);
      setRevisionModalOpen(false);
      setRevisionReason("");
      setSelectedQuotation(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to create revision snapshot");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleConvertToSalesOrder = async (quote: Quotation) => {
    if (convertingQuotationIds.current.has(quote.quotationId)) return;
    convertingQuotationIds.current.add(quote.quotationId);
    setConvertingQuotationId(quote.quotationId);

    try {
      const existingOrder = await salesOrderService.getByQuotation(
        quote.quotationId,
      );
      if (existingOrder) {
        toast.info(
          `This quotation is already linked to Sales Order ${
            existingOrder.salesOrderNumber || `#${existingOrder.salesOrderId}`
          }.`,
        );
        navigate(`/rsm/sales-orders/${existingOrder.salesOrderId}`);
        return;
      }

      const newOrder = await salesOrderService.create({
        quotationId: quote.quotationId,
        customerId: quote.customerId,
        expectedDeliveryDate: quote.validUntil
          ? new Date(quote.validUntil).toISOString()
          : "",
        paymentTerms: quote.paymentTermsName || "",
        deliveryAddress: "Standard Customer Address",
        remarks: `Converted from Quotation ${quote.quotationNumber || `#${quote.quotationId}`}`,
      });
      let order: SalesOrder | null = newOrder ?? null;
      if (!order?.salesOrderId) {
        try {
          order =
            (await salesOrderService.getByQuotation(quote.quotationId)) ||
            null;
        } catch (lookupError) {
          console.error("Created Sales Order but could not retrieve it:", lookupError);
          toast.error(
            "Sales Order creation succeeded, but its ID could not be confirmed. Check Sales Orders before retrying.",
          );
          navigate("/rsm/sales-orders");
          return;
        }
      }
      if (!order?.salesOrderId) {
        toast.error(
          "Sales Order creation succeeded, but the API did not return its ID and the order could not be found. Check Sales Orders before retrying.",
        );
        navigate("/rsm/sales-orders");
        return;
      }
      toast.success(
        `Converted to Sales Order ${
          order.salesOrderNumber || `#${order.salesOrderId}`
        }`,
      );
      navigate(`/rsm/sales-orders/${order.salesOrderId}`);
    } catch (err) {
      console.error("Failed to convert quotation to sales order:", err);
      const errorData = axios.isAxiosError(err) ? err.response?.data : null;
      const errorStatus = axios.isAxiosError(err) ? err.response?.status : null;
      toast.error(
        getApiErrorMessage(errorData) ||
          (errorStatus === 409
            ? "The quotation conflicts with an existing Sales Order or is not eligible for conversion."
            : "Failed to convert quotation to sales order."),
      );
    } finally {
      convertingQuotationIds.current.delete(quote.quotationId);
      setConvertingQuotationId(null);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredQuotations.map((q) => ({
      "Quotation Number": q.quotationNumber || `QT-${q.quotationId}`,
      Revision: `R${q.revisionNumber}`,
      Customer: q.customerName || `Customer #${q.customerId}`,
      "Enquiry Reference": q.enquiryRef || "—",
      Date: q.quotationDate ? new Date(q.quotationDate).toLocaleDateString("en-IN") : "—",
      "Taxable Amount": q.taxableAmount,
      "GST Amount": q.taxAmount,
      "Grand Total": q.grandTotal,
      Status: q.status || "Draft",
      "Approval Status": getEffectiveApprovalStatus(q, approvals),
    }));

    exportToExcel(dataToExport, "Quotations_List", "Quotations");
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Commercial Quotations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage proposal documents, customer pricing, revisions, and approval cycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel</span>
          </button>
          <Link
            to="/rsm/quotations/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition"
          >
            <Plus size={15} />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by Quotation #, Customer or Enquiry..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <Filter size={13} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Revised">Revised</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">{filteredQuotations.length}</span> records
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#154068] text-[11px] font-bold uppercase tracking-wider text-white">
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5 w-20 text-center">Rev</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Enquiry Ref</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Grand Total (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Approval</th>
                <th className="p-3.5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    Loading quotations from server...
                  </td>
                </tr>
              ) : paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    No quotations match the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => (
                  <tr key={q.quotationId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-gray-900">
                      <Link
                        to={`/rsm/quotations/${q.quotationId}`}
                        className="hover:text-blue-600 transition"
                      >
                        {q.quotationNumber || `QT-${q.quotationId}`}
                      </Link>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[11px]">
                        R{q.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">
                      {q.customerName || `Customer #${q.customerId}`}
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono">
                      {q.enquiryRef || "—"}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {q.quotationDate
                        ? new Date(q.quotationDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                      {formatINR(q.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge status={q.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge
                        status={getEffectiveApprovalStatus(q, approvals)}
                        type="approval"
                      />
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
                      <button
                        onClick={() => {
                          setSelectedQuotation(q);
                          setRevisionModalOpen(true);
                        }}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition"
                        title="Create Revision (+R)"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => handleConvertToSalesOrder(q)}
                        disabled={convertingQuotationId === q.quotationId}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-lg transition disabled:cursor-wait disabled:opacity-50"
                        title="Convert to Sales Order"
                      >
                        <ShoppingCart
                          size={14}
                          className={
                            convertingQuotationId === q.quotationId
                              ? "animate-pulse"
                              : ""
                          }
                        />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuotation(q);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition"
                        title="Delete Quotation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${
          selectedQuotation?.quotationNumber || `#${selectedQuotation?.quotationId}`
        }? This operation is permanent.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedQuotation(null);
        }}
      />

      {/* Create Revision Modal */}
      {revisionModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Create Revision Snapshot
              </h3>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Creating a revision will archive the current snapshot of{" "}
              <span className="font-bold font-mono">
                {selectedQuotation.quotationNumber || `QT-${selectedQuotation.quotationId}`} (R{selectedQuotation.revisionNumber})
              </span>{" "}
              into the revision history table.
            </p>

            <form onSubmit={handleCreateRevisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Revision Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Scope adjustment as per client request, rate discount applied."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmittingRevision ? "Creating..." : "Confirm Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
