import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import QuotationForm from "../components/QuotationForm";
import type { Quotation, Product } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";
import {
  quotationService,
  quotationItemService,
  quotationChargeService,
  quotationApprovalService,
  productService,
  masterDataService,
} from "../services/quotationService";

export const CreateQuotation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [initialQuotation, setInitialQuotation] = useState<Quotation | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecentLoading, setIsRecentLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPrerequisites = async () => {
      setIsLoading(true);
      try {
        const [custs, prods, terms] = await Promise.all([
          masterDataService.getCustomers(),
          productService.getAll(),
          masterDataService.getPaymentTerms(),
        ]);

        setCustomers(custs);
        setAvailableProducts(prods);
        setPaymentTerms(terms);

        if (id) {
          const qId = parseInt(id, 10);
          const [quote, items, charges] = await Promise.all([
            quotationService.getById(qId),
            quotationItemService.getByQuotation(qId),
            quotationChargeService.getByQuotation(qId),
          ]);

          // Assemble parent-accessory relationships
          const parentItems = items.filter((i) => !i.isAccessory);
          const accessories = items.filter((i) => i.isAccessory);

          parentItems.forEach((p) => {
            p.accessories = accessories.filter(
              (a) => a.parentQuotationItemId === p.quotationItemId
            );
          });

          quote.items = parentItems;
          quote.charges = charges;
          setInitialQuotation(quote);
        }
      } catch (err) {
        console.error("Failed to load quotation form dependencies:", err);
        toast.error("Error loading master data from server");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrerequisites();
  }, [id]);

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    quotationService
      .getAll()
      .then(setRecentQuotations)
      .catch((err) => {
        console.error("Failed to load recent quotations:", err);
        toast.error("Failed to load recent quotations");
      })
      .finally(() => setIsRecentLoading(false));

    // Listen for product catalog updates (e.g. specification or detail edits in Product Master)
    const handleProductUpdated = () => {
      productService
        .getAll()
        .then((prods) => {
          setAvailableProducts(prods);
        })
        .catch((err) => {
          console.error("Failed to refresh product catalog:", err);
        });
    };

    window.addEventListener("isquare_product_updated", handleProductUpdated);
    return () => {
      window.removeEventListener("isquare_product_updated", handleProductUpdated);
    };
  }, []);

  const handleSave = async (quotationData: Quotation) => {
    try {
      if (isEditMode && id) {
        const qId = parseInt(id, 10);
        await quotationService.update(qId, quotationData);

        // Save items
        if (quotationData.items) {
          for (const item of quotationData.items) {
            let savedParentId = item.quotationItemId;
            if (item.quotationItemId && item.quotationItemId > 0) {
              await quotationItemService.update(item.quotationItemId, item);
            } else {
              const created = await quotationItemService.create({
                ...item,
                quotationId: qId,
              });
              savedParentId = created.quotationItemId;
            }

            // Save accessories linked to parent
            if (item.accessories) {
              for (const acc of item.accessories) {
                if (acc.quotationItemId && acc.quotationItemId > 0) {
                  await quotationItemService.update(acc.quotationItemId, {
                    ...acc,
                    parentQuotationItemId: savedParentId,
                    isAccessory: true,
                  });
                } else {
                  await quotationItemService.create({
                    ...acc,
                    quotationId: qId,
                    parentQuotationItemId: savedParentId,
                    isAccessory: true,
                  });
                }
              }
            }
          }
        }

        toast.success(`Quotation ${quotationData.quotationNumber || `#${qId}`} updated successfully`);
        navigate(`/rsm/quotations/${qId}`);
      } else {
        // Create new quotation header
        const createdQuote = await quotationService.create(quotationData);
        const newQuotationId = createdQuote.quotationId;

        // Save line items
        if (quotationData.items) {
          for (let i = 0; i < quotationData.items.length; i++) {
            const item = quotationData.items[i];
            const createdItem = await quotationItemService.create({
              ...item,
              quotationId: newQuotationId,
              isAccessory: false,
              displayOrder: i + 1,
            });

            // Save child accessories
            if (item.accessories && item.accessories.length > 0) {
              for (let j = 0; j < item.accessories.length; j++) {
                const acc = item.accessories[j];
                await quotationItemService.create({
                  ...acc,
                  quotationId: newQuotationId,
                  parentQuotationItemId: createdItem.quotationItemId,
                  isAccessory: true,
                  displayOrder: j + 1,
                });
              }
            }
          }
        }

        // Save any custom charges
        if (quotationData.charges && quotationData.charges.length > 0) {
          for (const ch of quotationData.charges) {
            await quotationChargeService.create({
              quotationId: newQuotationId,
              chargeName: ch.chargeName,
              description: ch.description,
              chargeType: ch.chargeType,
              chargeAmount: ch.chargeAmount,
              taxRate: ch.taxRate,
              isTaxable: ch.isTaxable,
            });
          }
        }

        // If quotation discount policy is exceeded (>15%), log pending approval request
        const hasHighDiscount =
          (quotationData.items || []).some(
            (i) =>
              (Number(i.discountPercentage) || 0) > 15 ||
              (i.accessories || []).some((a) => (Number(a.discountPercentage) || 0) > 15)
          ) ||
          (Number(quotationData.discountAmount) > 0 &&
            Number(quotationData.subtotal) > 0 &&
            Number(quotationData.discountAmount) / Number(quotationData.subtotal) > 0.15);

        if (hasHighDiscount) {
          try {
            await quotationApprovalService.requestApproval({
              quotationId: newQuotationId,
              approvalReason: "High commercial discount exceeding 15% threshold requires manager approval.",
            });
          } catch (apprErr) {
            console.warn("Auto approval request notice:", apprErr);
          }
        }

        toast.success(`Quotation created successfully! Quotation #${newQuotationId}`);
        navigate(`/rsm/quotations/${newQuotationId}`);
      }
    } catch (err) {
      console.error("Save failure:", err);
      const errorData = axios.isAxiosError(err) ? err.response?.data : null;
      const errorMsg =
        errorData && typeof errorData === "object" && "message" in errorData && typeof errorData.message === "string"
          ? errorData.message
          : err instanceof Error
          ? err.message
          : "Failed to persist quotation to database";
      toast.error(errorMsg);
      throw err;
    }
  };

  const handleRequestApproval = async (quotationId: number, reason: string) => {
    try {
      await quotationApprovalService.requestApproval({
        quotationId,
        approvalReason: reason,
      });
      toast.success("Manager approval requested for this quotation");
    } catch (e) {
      toast.error("Failed to submit approval request");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-[#00234a] border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Loading quotation workspace &amp; masters...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      <QuotationForm
        initialQuotation={initialQuotation}
        customers={customers}
        availableProducts={availableProducts}
        paymentTerms={paymentTerms}
        onSave={handleSave}
        onCancel={() => navigate("/rsm/quotations")}
        onRefreshCustomers={async () => {
          try {
            const custs = await masterDataService.getCustomers();
            setCustomers(custs);
          } catch (e) {
            console.warn("Failed to refresh customers:", e);
          }
        }}
        {...(isEditMode ? { onRequestApproval: handleRequestApproval } : {})}
        isEditMode={isEditMode}
      />

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#00234a] text-base">Recent Quotations</h2>
            <p className="text-xs text-gray-500">Latest active commercial quotations</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/rsm/quotations")}
            className="text-xs font-semibold text-[#FF7900] hover:text-[#e06800] flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All Quotations</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white font-bold uppercase text-[12px] tracking-wider">
                <th className="p-3.5 border-r border-[#e06800]">Quotation #</th>
                <th className="p-3.5 border-r border-[#e06800]">Customer</th>
                <th className="p-3.5 border-r border-[#e06800]">Enquiry Ref</th>
                <th className="p-3.5 border-r border-[#e06800]">Date</th>
                <th className="p-3.5 text-right border-r border-[#e06800]">Total Value</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Status</th>
                <th className="p-3.5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isRecentLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    Loading recent quotations...
                  </td>
                </tr>
              ) : recentQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                recentQuotations.slice(0, 6).map((quotation) => (
                  <tr key={quotation.quotationId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[52px]">
                    <td className="p-3.5 font-bold text-gray-900 font-mono border-r border-gray-100">
                      {quotation.quotationNumber || `QT-${quotation.quotationId}`}
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 text-[10px] font-bold">
                        R{quotation.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800 border-r border-gray-100">
                      {quotation.customerName ||
                        customers.find(
                          (c) =>
                            Number(c.customerId || (c as any).companyId) ===
                            Number(quotation.customerId)
                        )?.companyName ||
                        customers.find(
                          (c) =>
                            Number(c.customerId || (c as any).companyId) ===
                            Number(quotation.customerId)
                        )?.customerName ||
                        `Customer #${quotation.customerId}`}
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono border-r border-gray-100">
                      {quotation.enquiryRef
                        ? quotation.enquiryRef.match(/(ENQ-[A-Za-z0-9-]+)/i)?.[1] ||
                          quotation.enquiryRef.split(" - ")[0].trim()
                        : quotation.enquiryId
                        ? `ENQ-${String(quotation.enquiryId).padStart(3, "0")}`
                        : "—"}
                    </td>
                    <td className="p-3.5 text-gray-500 border-r border-gray-100">
                      {quotation.quotationDate
                        ? new Date(quotation.quotationDate).toLocaleDateString("en-CA")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono border-r border-gray-100">
                      {formatINR(quotation.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center border-r border-gray-100">
                      <QuotationStatusBadge status={quotation.status} />
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/rsm/quotations/${quotation.quotationId}`)}
                        className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                        title="View quotation"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/rsm/quotations/${quotation.quotationId}/edit`)}
                        className="p-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition shadow-xs inline-flex items-center justify-center cursor-pointer"
                        title="Edit quotation"
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
      </section>
    </div>
  );
};

export default CreateQuotation;
