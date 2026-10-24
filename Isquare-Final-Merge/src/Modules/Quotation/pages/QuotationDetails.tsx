import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Edit,
  Printer,
  RotateCcw,
  CheckCircle,
  ShoppingCart,
  Trash2,
  Building,
  CreditCard,
  History,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { exportQuotationToPdf } from "../utils/quotationExportPdf";
import { exportQuotationToCustomerExcel } from "../utils/quotationExportExcel";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "../utils/customerQuotationStorage";
import {
  quotationService,
  quotationItemService,
  quotationApprovalService,
  quotationRevisionService,
  quotationChargeService,
  salesOrderService,
  companyProfileService,
  masterDataService,
  getApiErrorMessage,
} from "../services/quotationService";
import type {
  Quotation,
  QuotationItem,
  QuotationApproval,
  QuotationRevision,
  QuotationCharge,
  CompanyProfile,
  SalesOrder,
} from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import {
  formatINR,
  calculateItemTotals,
  getEffectiveApprovalStatus,
} from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";
import QuotationPreviewModal from "../components/QuotationPreviewModal";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";

interface ExtendedCustomer extends Customer {
  contactPerson?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export const QuotationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [charges, setCharges] = useState<QuotationCharge[]>([]);
  const [approvals, setApprovals] = useState<QuotationApproval[]>([]);
  const [revisions, setRevisions] = useState<QuotationRevision[]>([]);
  const [customer, setCustomer] = useState<ExtendedCustomer | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);

  const [approvalModalOpen, setApprovalModalOpen] = useState<boolean>(false);
  const [approvalDecision, setApprovalDecision] = useState<"Approved" | "Rejected">("Approved");
  const [approverComments, setApproverComments] = useState<string>("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  const [requestApprovalModalOpen, setRequestApprovalModalOpen] = useState<boolean>(false);
  const [approvalReason, setApprovalReason] = useState<string>("");
  const [isSubmittingApprovalRequest, setIsSubmittingApprovalRequest] = useState<boolean>(false);
  const [isMarkingWon, setIsMarkingWon] = useState(false);
  const [isConvertingToOrder, setIsConvertingToOrder] = useState(false);
  const isConvertingToOrderRef = useRef(false);

  const loadQuotationData = async () => {
    if (!id) return;
    const qId = parseInt(id, 10);
    setIsLoading(true);
    try {
      const [quoteRes, itemsRes, chargesRes, approvalsRes, revisionsRes, profileRes] =
        await Promise.allSettled([
          quotationService.getById(qId),
          quotationItemService.getByQuotation(qId),
          quotationChargeService.getByQuotation(qId),
          quotationApprovalService.getByQuotation(qId),
          quotationRevisionService.getByQuotation(qId),
          companyProfileService.getDefaultProfile(),
        ]);

      if (quoteRes.status === "fulfilled") {
        const q = quoteRes.value;
        setQuotation(q);

        // Fetch customer details if available
        if (q.customerId) {
          masterDataService.getCustomers().then((custs) => {
            const match = custs.find((c) => c.customerId === q.customerId);
            if (match) setCustomer(match);
          });
        }
      }

      if (itemsRes.status === "fulfilled") {
        // Nest accessories under parent products
        const allItems = itemsRes.value;
        const parents = allItems.filter((i) => !i.isAccessory);
        const accessories = allItems.filter((i) => i.isAccessory);
        parents.forEach((p) => {
          p.accessories = accessories.filter(
            (a) => a.parentQuotationItemId === p.quotationItemId
          );
        });
        setItems(parents);
      }

      if (chargesRes.status === "fulfilled") {
        setCharges(chargesRes.value);
      }
      if (approvalsRes.status === "fulfilled") {
        setApprovals(approvalsRes.value);
      }
      if (revisionsRes.status === "fulfilled") {
        setRevisions(revisionsRes.value);
      }
      if (profileRes.status === "fulfilled") {
        setCompanyProfile(profileRes.value);
      }
    } catch (err) {
      console.error("Error loading quotation details:", err);
      toast.error("Failed to load quotation details from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotationData();
  }, [id]);

  const handleDelete = async () => {
    if (!quotation) return;
    try {
      await quotationService.delete(quotation.quotationId);
      toast.success("Quotation deleted successfully");
      navigate("/rsm/quotations");
    } catch (e) {
      toast.error("Failed to delete quotation");
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    setIsSubmittingRevision(true);
    try {
      await quotationRevisionService.create({
        quotationId: quotation.quotationId,
        revisionReason,
      });
      toast.success("Revision snapshot recorded successfully");
      setRevisionModalOpen(false);
      setRevisionReason("");
      loadQuotationData();
    } catch (e) {
      toast.error("Failed to record revision");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleApprovalDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    const pending = approvals.find(
      (approval) => (approval.approvalStatus || "").trim().toLowerCase() === "pending",
    );
    if (!pending) {
      toast.error("No pending approval request is available to update.");
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await quotationApprovalService.decideApproval(pending.quotationApprovalId, {
        decision: approvalDecision,
        approverComments,
      });
      toast.success(`Approval decision recorded: ${approvalDecision}`);
      setApprovalModalOpen(false);
      setApproverComments("");
      loadQuotationData();
    } catch (e) {
      console.error("Failed to record quotation approval decision:", e);
      toast.error("Failed to record approval decision");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    setIsSubmittingApprovalRequest(true);
    try {
      await quotationApprovalService.requestApproval({
        quotationId: quotation.quotationId,
        approvalReason: approvalReason.trim() || "Commercial discount / terms require management approval.",
      });
      toast.success("Approval request submitted successfully");
      setRequestApprovalModalOpen(false);
      setApprovalReason("");
      await loadQuotationData();
    } catch (e) {
      console.error("Failed to submit quotation approval request:", e);
      const errorData = axios.isAxiosError(e) ? e.response?.data : null;
      toast.error(
        getApiErrorMessage(errorData) ||
          "Failed to submit approval request"
      );
    } finally {
      setIsSubmittingApprovalRequest(false);
    }
  };

  const handleMarkAsWon = async () => {
    if (!quotation || isMarkingWon) return;

    setIsMarkingWon(true);
    try {
      await quotationService.update(quotation.quotationId, {
        quotationId: quotation.quotationId,
        quotationNumber: quotation.quotationNumber,
        customerId: quotation.customerId,
        enquiryId: quotation.enquiryId,
        quotationDate: quotation.quotationDate,
        revisionNumber: quotation.revisionNumber,
        status: "Won",
        approvalStatus: quotation.approvalStatus,
        subtotal: quotation.subtotal,
        discountAmount: quotation.discountAmount,
        taxableAmount: quotation.taxableAmount,
        taxAmount: quotation.taxAmount,
        freightCharges: quotation.freightCharges,
        installationCharges: quotation.installationCharges,
        otherCharges: quotation.otherCharges,
        grandTotal: quotation.grandTotal,
        deliveryPeriod: quotation.deliveryPeriod,
        paymentTermId: quotation.paymentTermId,
        warranty: quotation.warranty,
        validUntil: quotation.validUntil,
        termsAndConditions: quotation.termsAndConditions,
        isActive: quotation.isActive,
        isDeleted: quotation.isDeleted,
      });
    } catch (error) {
      console.error("Failed to mark quotation as won:", error);
      const errorData = axios.isAxiosError(error) ? error.response?.data : null;
      toast.error(
        getApiErrorMessage(errorData) ||
          "Failed to update quotation status.",
      );
      setIsMarkingWon(false);
      return;
    }

    setQuotation((current) => (current ? { ...current, status: "Won" } : current));
    try {
      const updatedQuotation = await quotationService.getById(
        quotation.quotationId,
      );
      setQuotation(updatedQuotation);
      toast.success("Quotation status updated to Won.");
    } catch (error) {
      console.error("Failed to reload quotation after status update:", error);
      toast.error("Quotation was marked Won, but its updated details could not be reloaded.");
    } finally {
      setIsMarkingWon(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!quotation || isConvertingToOrderRef.current) return;
    isConvertingToOrderRef.current = true;
    setIsConvertingToOrder(true);
    const expectedDeliveryDate = quotation.validUntil
      ? new Date(quotation.validUntil)
      : null;
    if (expectedDeliveryDate && Number.isNaN(expectedDeliveryDate.getTime())) {
      toast.error("The quotation validity date is invalid.");
      isConvertingToOrderRef.current = false;
      setIsConvertingToOrder(false);
      return;
    }

    try {
      const existingOrder = await salesOrderService.getByQuotation(
        quotation.quotationId,
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

      const created = await salesOrderService.create({
        quotationId: quotation.quotationId,
        customerId: quotation.customerId,
        expectedDeliveryDate: expectedDeliveryDate?.toISOString(),
        paymentTerms: quotation.paymentTermsName || "",
        deliveryAddress: "Standard Client Delivery Address",
        remarks: `Auto-generated from Quotation ${quotation.quotationNumber || `#${quotation.quotationId}`}`,
      });
      let order: SalesOrder | null = created ?? null;
      if (!order?.salesOrderId) {
        try {
          order =
            (await salesOrderService.getByQuotation(quotation.quotationId)) ||
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
        `Sales Order ${
          order.salesOrderNumber || `#${order.salesOrderId}`
        } generated successfully`,
      );
      navigate(`/rsm/sales-orders/${order.salesOrderId}`);
    } catch (e) {
      console.error("Failed to convert quotation to sales order:", e);
      const errorData = axios.isAxiosError(e) ? e.response?.data : null;
      const errorStatus = axios.isAxiosError(e) ? e.response?.status : null;
      toast.error(
        getApiErrorMessage(errorData) ||
          (errorStatus === 409
            ? "The quotation conflicts with an existing Sales Order or is not eligible for conversion."
            : "Failed to convert quotation to order."),
      );
    } finally {
      isConvertingToOrderRef.current = false;
      setIsConvertingToOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-[#00234a] border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Loading proposal details from API...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
        <p className="text-sm font-bold text-gray-700">Quotation not found</p>
        <Link
          to="/rsm/quotations"
          className="mt-3 inline-block px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl"
        >
          Back to Quotations List
        </Link>
      </div>
    );
  }

  const fullQuoteForPreview: Quotation = {
    ...quotation,
    items,
    charges,
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/rsm/quotations")}
            className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl transition"
            title="Back to Quotations"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#00234a] tracking-tight font-mono">
                {quotation.quotationNumber || `QT-${quotation.quotationId}`}
              </h1>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                R{quotation.revisionNumber}
              </span>
              <QuotationStatusBadge status={quotation.status} />
              <QuotationStatusBadge
                status={getEffectiveApprovalStatus(quotation, approvals)}
                type="approval"
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target Customer:{" "}
              <span className="font-bold text-gray-800">
                {quotation.customerName || customer?.customerName || `Customer #${quotation.customerId}`}
              </span>{" "}
              {quotation.enquiryRef && `· Enquiry: ${quotation.enquiryRef}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(quotation.status || "").trim().toLowerCase() !== "won" && (
            <button
              type="button"
              onClick={handleMarkAsWon}
              disabled={isMarkingWon}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow transition hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60"
            >
              <CheckCircle size={14} />
              <span>{isMarkingWon ? "Updating..." : "Mark as Won"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl transition shadow-xs cursor-pointer"
            title="Preview customer-facing quotation"
          >
            <Printer size={14} />
            <span>Preview / Print</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
                const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
                if (ok) {
                  toast.success("Downloaded original customer quotation file");
                  return;
                }
              }
              exportQuotationToCustomerExcel(fullQuoteForPreview, true);
              toast.success("Excel exported successfully");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition shadow-xs cursor-pointer"
            title="Export Quotation to Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
                const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
                if (ok) {
                  toast.success("Downloaded original customer quotation file");
                  return;
                }
              }
              try {
                await exportQuotationToPdf(fullQuoteForPreview, companyProfile, customer, true);
                toast.success("PDF exported successfully");
              } catch (error) {
                console.error("PDF export failed:", error);
                toast.error("Failed to generate PDF");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl transition shadow-xs cursor-pointer"
            title="Export Quotation to PDF (.pdf)"
          >
            <Download size={14} />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setRevisionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition"
          >
            <RotateCcw size={14} />
            <span>Create Revision (+R)</span>
          </button>

          {approvals.some(
            (approval) => (approval.approvalStatus || "").trim().toLowerCase() === "pending",
          ) && (
            <button
              type="button"
              onClick={() => setApprovalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition"
            >
              <CheckCircle size={14} />
              <span>Record Approval Decision</span>
            </button>
          )}

          {!approvals.some(
            (approval) => (approval.approvalStatus || "").trim().toLowerCase() === "pending"
          ) &&
            (quotation.approvalStatus || "").trim().toLowerCase() !== "approved" && (
            <button
              type="button"
              onClick={() => setRequestApprovalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition"
              title="Submit for management approval"
            >
              <ShieldAlert size={14} />
              <span>Request Approval</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleConvertToOrder}
            disabled={isConvertingToOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition"
          >
            <ShoppingCart size={14} />
            <span>{isConvertingToOrder ? "Converting..." : "Convert to Sales Order"}</span>
          </button>

          <Link
            to={`/rsm/quotations/${quotation.quotationId}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#00234a] hover:bg-[#003366] text-white rounded-xl shadow transition"
          >
            <Edit size={14} />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Uploaded Customer-Formatted Quotation Banner */}
      {isCustomerFormatQuotation(quotation.quotationId, quotation) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Uploaded Customer-Formatted Quotation</h4>
              <p className="text-xs text-amber-700">
                This quotation was uploaded in the customer's original Excel format. All original columns, formatting, and values are preserved.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
              if (ok) toast.success("Downloaded original customer file");
              else toast.error("Could not download original file");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
          >
            <Download size={14} />
            <span>Download Original Excel File</span>
          </button>
        </div>
      )}

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items, Specifications & Accessories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Itemized Products &amp; Accessories ({items.length})
              </h3>
              <span className="text-xs font-semibold text-blue-600">
                Total Taxable: {formatINR(quotation.taxableAmount)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#154068] text-white font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Product Name &amp; Spec</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-24 text-right">Rate (₹)</th>
                    <th className="p-3 w-16 text-center">Disc %</th>
                    <th className="p-3 w-16 text-center">GST %</th>
                    <th className="p-3 w-28 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No product items recorded for this quotation.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const calc = calculateItemTotals(
                        item.quantity,
                        item.rate,
                        item.discountPercentage,
                        item.gstRate
                      );
                      return (
                        <React.Fragment key={idx}>
                          <tr className="hover:bg-slate-50/50 transition">
                            <td className="p-3 align-top font-bold text-gray-400">{idx + 1}</td>
                            <td className="p-3 align-top">
                              <div className="font-bold text-gray-900">
                                {item.itemName} {item.brand ? `· ${item.brand}` : ""}
                              </div>
                              {item.itemCode && (
                                <div className="text-[10px] font-mono text-blue-600">
                                  Code: {item.itemCode}
                                </div>
                              )}
                              {item.specification && (
                                <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                  {item.specification}
                                </div>
                              )}
                            </td>
                            <td className="p-3 align-top text-center font-bold">
                              {item.quantity} {item.unitName || "Nos"}
                            </td>
                            <td className="p-3 align-top text-right font-medium">
                              {formatINR(item.rate)}
                            </td>
                            <td className="p-3 align-top text-center text-gray-600">
                              {item.discountPercentage}%
                            </td>
                            <td className="p-3 align-top text-center text-gray-600">
                              {item.gstRate}%
                            </td>
                            <td className="p-3 align-top text-right font-bold text-gray-900 font-mono">
                              {formatINR(calc.lineTotal)}
                            </td>
                          </tr>

                          {/* Accessories */}
                          {item.accessories &&
                            item.accessories.map((acc, aIdx) => {
                              const aCalc = calculateItemTotals(
                                acc.quantity,
                                acc.rate,
                                acc.discountPercentage,
                                acc.gstRate
                              );
                              return (
                                <tr key={`acc-${aIdx}`} className="bg-blue-50/40 text-[11px]">
                                  <td className="p-2.5 text-right text-blue-500">↳</td>
                                  <td className="p-2.5">
                                    <span className="font-semibold text-gray-800">
                                      [Accessory] {acc.itemName}
                                    </span>
                                    {acc.specification && (
                                      <span className="text-gray-500 ml-1">
                                        — {acc.specification}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center font-medium">
                                    {acc.quantity} {acc.unitName || "Nos"}
                                  </td>
                                  <td className="p-2.5 text-right font-medium">
                                    {formatINR(acc.rate)}
                                  </td>
                                  <td className="p-2.5 text-center">{acc.discountPercentage}%</td>
                                  <td className="p-2.5 text-center">{acc.gstRate}%</td>
                                  <td className="p-2.5 text-right font-bold text-gray-800 font-mono">
                                    {formatINR(aCalc.lineTotal)}
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial Terms & Conditions */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Commercial Terms &amp; Legal Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Delivery Period
                </span>
                <span className="font-bold text-gray-800">{quotation.deliveryPeriod || "2-3 Weeks"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Payment Terms
                </span>
                <span className="font-bold text-gray-800">{quotation.paymentTermsName || "Standard as agreed"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Valid Until
                </span>
                <span className="font-bold text-gray-800">
                  {quotation.validUntil
                    ? new Date(quotation.validUntil).toLocaleDateString("en-IN")
                    : "30 Days"}
                </span>
              </div>
            </div>

            {quotation.termsAndConditions && (
              <div className="pt-2 text-xs text-gray-600 whitespace-pre-line font-mono bg-white p-3 rounded-xl border border-gray-100">
                {quotation.termsAndConditions}
              </div>
            )}
          </div>

          {/* Revisions History Log */}
          {revisions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Revision History ({revisions.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-100 text-xs">
                {revisions.map((rev) => (
                  <div key={rev.quotationRevisionId} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-indigo-700 mr-2">
                        R{rev.revisionNumber}
                      </span>
                      <span className="text-gray-700">{rev.revisionReason || "Proposal Revised"}</span>
                      {rev.revisionDate && (
                        <span className="text-gray-400 text-[11px] block mt-0.5">
                          {new Date(rev.revisionDate).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {rev.grandTotal && (
                      <span className="font-bold font-mono text-gray-900">
                        {formatINR(rev.grandTotal)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Summary, Approvals & Bank Details */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Commercial Totals
            </h3>

            <div className="space-y-2 text-xs border-b border-gray-100 pb-3">
              <div className="flex justify-between text-gray-600">
                <span>Gross Subtotal:</span>
                <span className="font-mono">{formatINR(quotation.subtotal)}</span>
              </div>
              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Total Discount:</span>
                  <span className="font-mono">- {formatINR(quotation.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Taxable Amount:</span>
                <span className="font-mono font-medium">{formatINR(quotation.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total GST:</span>
                <span className="font-mono font-medium">{formatINR(quotation.taxAmount)}</span>
              </div>
              {quotation.freightCharges > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Freight Charges:</span>
                  <span className="font-mono">{formatINR(quotation.freightCharges)}</span>
                </div>
              )}
              {quotation.installationCharges > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Installation Charges:</span>
                  <span className="font-mono">{formatINR(quotation.installationCharges)}</span>
                </div>
              )}
              {quotation.otherCharges > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Other Charges:</span>
                  <span className="font-mono">{formatINR(quotation.otherCharges)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-bold uppercase text-gray-500">Grand Total:</span>
              <span className="text-2xl font-extrabold text-[#00234a] font-mono">
                {formatINR(quotation.grandTotal)}
              </span>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
              <Building size={14} className="text-blue-600" />
              <span>Customer Information</span>
            </div>
            <p className="font-bold text-sm text-gray-900">
              {quotation.customerName || customer?.customerName || customer?.companyName || `Customer #${quotation.customerId}`}
            </p>
            {customer?.contactPerson && (
              <p className="text-gray-600">Contact: {customer.contactPerson}</p>
            )}
            {customer?.email && <p className="text-gray-500">{customer.email}</p>}
            {customer?.phone && <p className="text-gray-500">{customer.phone}</p>}
            {customer?.city && <p className="text-gray-500">{customer.city}, India</p>}
            {customer?.gstin && (
              <p className="font-mono text-gray-600 text-[11px]">GSTIN: {customer.gstin}</p>
            )}
          </div>

          {/* Bank Remittance Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
              <CreditCard size={14} className="text-[#00234a]" />
              <span>Bank Remittance Details</span>
            </div>
            <p className="font-bold text-slate-900">{companyProfile?.bankName || "HDFC Bank Ltd"}</p>
            <p>
              Account Number:{" "}
              <span className="font-mono font-semibold text-slate-900">
                {companyProfile?.accountNumber || "50200012345678"}
              </span>
            </p>
            <p>
              IFSC Code:{" "}
              <span className="font-mono font-semibold text-slate-900">
                {companyProfile?.ifscCode || "HDFC0000123"}
              </span>
            </p>
            {companyProfile?.branchName && (
              <p>Branch: {companyProfile.branchName}</p>
            )}
          </div>

          {/* Approval Log Card */}
          {approvals.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Approval Logs ({approvals.length})
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {approvals.map((app) => (
                  <div key={app.quotationApprovalId} className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        Request #{app.quotationApprovalId}
                      </span>
                      <QuotationStatusBadge status={app.approvalStatus} type="approval" />
                    </div>
                    {app.approvalReason && (
                      <p className="text-gray-500 text-[11px]">Reason: {app.approvalReason}</p>
                    )}
                    {app.approverComments && (
                      <p className="text-gray-700 text-[11px] font-medium">
                        Comments: {app.approverComments}
                      </p>
                    )}
                    {app.requestedAt && (
                      <p className="text-gray-400 text-[10px]">
                        {new Date(app.requestedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Document Preview Modal */}
      <QuotationPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        quotation={fullQuoteForPreview}
        companyProfile={companyProfile}
        customer={customer}
        onCreateRevision={() => setRevisionModalOpen(true)}
        onConvertToOrder={handleConvertToOrder}
        isConvertingToOrder={isConvertingToOrder}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${quotation.quotationNumber || `#${quotation.quotationId}`}?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Create Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Create New Revision Snapshot
            </h3>
            <p className="text-xs text-gray-600">
              This will record a snapshot of current quotation terms (Revision R{quotation.revisionNumber}) before applying further modifications.
            </p>
            <form onSubmit={handleCreateRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Revision Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Scope adjustment or discount revision requested by client"
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {isSubmittingRevision ? "Saving..." : "Confirm Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Decision Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Record Approval Decision
            </h3>
            <form onSubmit={handleApprovalDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Manager Decision
                </label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value as "Approved" | "Rejected")}
                  className="w-full text-xs py-2 px-3 border border-gray-300 rounded-lg font-bold"
                >
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Approver Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Approved within commercial discretion limits."
                  value={approverComments}
                  onChange={(e) => setApproverComments(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  {isSubmittingDecision ? "Submitting..." : "Save Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Approval Modal */}
      {requestApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Request Quotation Approval
            </h3>
            <form onSubmit={handleRequestApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Approval Reason / Justification
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Special customer concession, discount >15%, or payment term variance."
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestApprovalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApprovalRequest}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-lg"
                >
                  {isSubmittingApprovalRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetails;
