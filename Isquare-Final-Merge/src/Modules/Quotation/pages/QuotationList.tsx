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
  UploadCloud,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  quotationService,
  quotationApprovalService,
  quotationRevisionService,
  salesOrderService,
  masterDataService,
  getApiErrorMessage,
} from "../services/quotationService";
import type { Quotation, QuotationApproval, SalesOrder } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR, getEffectiveApprovalStatus } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../Utils/exportToExcel";
import UploadCustomerQuotationModal from "../components/UploadCustomerQuotationModal";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "../utils/customerQuotationStorage";

export const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resolveCustomerName = (q: Quotation): string => {
    if (q.customerName && !q.customerName.startsWith("Customer #")) {
      return q.customerName;
    }
    const match = customers.find(
      (c) => Number(c.customerId || (c as any).companyId) === Number(q.customerId)
    );
    return (
      match?.companyName ||
      match?.customerName ||
      (match as any)?.clientName ||
      q.customerName ||
      `Customer #${q.customerId}`
    );
  };

  const resolveEnquiryRef = (q: Quotation): string => {
    if (q.enquiryRef && q.enquiryRef.trim()) {
      const match = q.enquiryRef.match(/(ENQ-[A-Za-z0-9-]+)/i);
      if (match) return match[1];
      return q.enquiryRef.split(" - ")[0].trim();
    }
    if (q.enquiryId && Number(q.enquiryId) > 0) {
      return `ENQ-${String(q.enquiryId).padStart(3, "0")}`;
    }
    return "—";
  };

  // Filters & Search
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);
  const [convertingQuotationId, setConvertingQuotationId] = useState<number | null>(null);
  const convertingQuotationIds = useRef(new Set<number>());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quotes, allApprovals, custs] = await Promise.all([
        quotationService.getAll(),
        quotationApprovalService.getAll(),
        masterDataService.getCustomers(),
      ]);
      setQuotations(quotes);
      setApprovals(allApprovals);
      setCustomers(custs);
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
      const custName = resolveCustomerName(q).toLowerCase();
      const enq = resolveEnquiryRef(q).toLowerCase();
      const matchesSearch =
        qNum.includes(searchText.toLowerCase()) ||
        custName.includes(searchText.toLowerCase()) ||
        enq.includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (q.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, customers, searchText, statusFilter]);

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
      Customer: resolveCustomerName(q),
      "Enquiry Reference": resolveEnquiryRef(q),
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
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Unified Header Card matching Customer Master */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  Commercial Quotations
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                  Quotation Management
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Manage proposal documents, customer pricing, revisions, and approval cycles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Header & Actions matching Customer Master */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
            All Quotations
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
            title="Upload customer-formatted Excel quotation"
          >
            <UploadCloud size={15} className="text-blue-600" />
            <span>Upload Quotation</span>
          </button>
          <Link
            to="/rsm/quotations/create"
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar matching Customer Master */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Quotation #, Customer or Enquiry..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] text-gray-800"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap flex items-center gap-1">
              <Filter size={13} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500] cursor-pointer"
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

          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredQuotations.length}</span> records
          </div>
        </div>
      </div>

      {/* Main Table with Customer Master Orange Header */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white text-[12px] font-bold uppercase tracking-wider">
                <th className="p-3.5 border-r border-[#e06800]">Quotation #</th>
                <th className="p-3.5 w-20 text-center border-r border-[#e06800]">Rev</th>
                <th className="p-3.5 border-r border-[#e06800]">Customer Name</th>
                <th className="p-3.5 border-r border-[#e06800]">Enquiry Ref</th>
                <th className="p-3.5 border-r border-[#e06800]">Date</th>
                <th className="p-3.5 text-right border-r border-[#e06800]">Grand Total (₹)</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Status</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Approval</th>
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
                  <tr key={q.quotationId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[54px]">
                    <td className="p-3.5 font-bold font-mono text-gray-900 border-r border-gray-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/rsm/quotations/${q.quotationId}`}
                          className="hover:text-[#FF7900] transition"
                        >
                          {q.quotationNumber || `QT-${q.quotationId}`}
                        </Link>
                        {isCustomerFormatQuotation(q.quotationId, q) && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                            title="Preserved customer Excel quotation"
                          >
                            <FileSpreadsheet size={10} className="text-amber-700" />
                            <span>Customer Excel</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center border-r border-gray-100">
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 font-mono font-bold text-[11px]">
                        R{q.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800 border-r border-gray-100">
                      {resolveCustomerName(q)}
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono border-r border-gray-100">
                      {resolveEnquiryRef(q)}
                    </td>
                    <td className="p-3.5 text-gray-500 border-r border-gray-100">
                      {q.quotationDate
                        ? new Date(q.quotationDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono border-r border-gray-100">
                      {formatINR(q.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center border-r border-gray-100">
                      <QuotationStatusBadge status={q.status} />
                    </td>
                    <td className="p-3.5 text-center border-r border-gray-100">
                      <QuotationStatusBadge
                        status={getEffectiveApprovalStatus(q, approvals)}
                        type="approval"
                      />
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/rsm/quotations/${q.quotationId}`)}
                        className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {isCustomerFormatQuotation(q.quotationId, q) && (
                        <button
                          onClick={() => {
                            const ok = downloadOriginalCustomerQuotation(q.quotationId);
                            if (ok) {
                              toast.success("Downloaded original customer quotation file");
                            } else {
                              toast.error("Original customer file not found");
                            }
                          }}
                          className="p-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                          title="Download Original Customer Excel File"
                        >
                          <Download size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/rsm/quotations/${q.quotationId}/edit`)}
                        className="p-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                        title="Edit Quotation"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuotation(q);
                          setRevisionModalOpen(true);
                        }}
                        className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                        title="Create Revision (+R)"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => handleConvertToSalesOrder(q)}
                        disabled={convertingQuotationId === q.quotationId}
                        className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-lg transition shadow-xs inline-flex items-center justify-center disabled:cursor-wait disabled:opacity-50 cursor-pointer"
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
                        className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
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
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between bg-[#FF7900] text-white px-6 py-4">
              <h3 className="text-base font-bold text-white">
                Create Revision Snapshot
              </h3>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600">
                Creating a revision will archive the current snapshot of{" "}
                <span className="font-bold font-mono text-[#00234a]">
                  {selectedQuotation.quotationNumber || `QT-${selectedQuotation.quotationId}`} (R{selectedQuotation.revisionNumber})
                </span>{" "}
                into the revision history table.
              </p>

              <form onSubmit={handleCreateRevisionSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Revision Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Scope adjustment as per client request, rate discount applied."
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setRevisionModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 bg-gray-50 border border-gray-200 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevision}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#00234a] hover:bg-[#FF7900] rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRevision ? "Creating..." : "Confirm Revision"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Customer Quotation Modal */}
      <UploadCustomerQuotationModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default QuotationList;
