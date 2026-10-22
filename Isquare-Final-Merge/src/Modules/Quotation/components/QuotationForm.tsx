import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Quotation,
  QuotationItem,
  QuotationCharge,
  Product,
  CompanyProfile,
} from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { PaymentTerm } from "../../RSM/Pages/Recruitment/PaymentTerm/Services/PaymentTermService";
import QuotationInformation from "./QuotationInformation";
import QuotationItemsTable from "./QuotationItemsTable";
import QuotationPricing from "./QuotationPricing";
import QuotationTerms from "./QuotationTerms";
import QuotationSummary from "./QuotationSummary";
import QuotationPreviewModal from "./QuotationPreviewModal";
import {
  calculateQuotationTotals,
  STANDARD_UOMS,
} from "../utils/quotationCalculations";
import {
  quotationDefaultService,
  companyProfileService,
  resolveImageUrl,
} from "../services/quotationService";

interface QuotationFormProps {
  initialQuotation?: Partial<Quotation> | null;
  customers: Customer[];
  availableProducts: Product[];
  paymentTerms: PaymentTerm[];
  onSave: (quotationData: Quotation) => Promise<void>;
  onCancel: () => void;
  onRequestApproval?: (quotationId: number, reason: string) => Promise<void>;
  onRefreshCustomers?: () => Promise<void>;
  isEditMode?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialQuotation,
  customers,
  availableProducts,
  paymentTerms,
  onSave,
  onCancel,
  onRequestApproval,
  onRefreshCustomers,
  isEditMode = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  // Form State
  const [quotationNumber] = useState<string>(
    initialQuotation?.quotationNumber || ""
  );
  const [customerId, setCustomerId] = useState<number>(() => {
    if (initialQuotation?.customerId) return initialQuotation.customerId;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qCompId = searchParams.get("companyId");
      if (qCompId && Number(qCompId) > 0) return Number(qCompId);
    } catch {
      // ignore
    }
    return customers[0]?.customerId ?? 0;
  });
  const [contactId, setContactId] = useState<number | null>(
    initialQuotation?.contactPersonId || null
  );
  const [contactPerson, setContactPerson] = useState<string>(
    initialQuotation?.contactPerson || ""
  );
  const [enquiryRef, setEnquiryRef] = useState<string>(
    initialQuotation?.enquiryRef || ""
  );
  const [quotationDate, setQuotationDate] = useState<string>(
    initialQuotation?.quotationDate || new Date().toISOString()
  );
  const [revisionNumber, setRevisionNumber] = useState<number>(
    initialQuotation?.revisionNumber ?? 0
  );
  const [status, setStatus] = useState<string>(
    initialQuotation?.status || "Draft"
  );
  const [approvalStatus] = useState<string | null>(
    initialQuotation?.approvalStatus || null
  );

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (initialQuotation?.items && initialQuotation.items.length > 0) {
      return initialQuotation.items;
    }

    const defaultProd =
      availableProducts.find((p) => p.productId === 1) ||
      availableProducts.find((p) => /spindle/i.test(p.productName)) ||
      availableProducts[0];

    if (defaultProd) {
      const uomMatch = STANDARD_UOMS.find(
        (u) => u.id === defaultProd.unitOfMeasurementId
      );
      const rawProdImg =
        defaultProd.imageUrl ||
        defaultProd.productImage ||
        defaultProd.productImagePath ||
        null;
      const prodImg = resolveImageUrl(rawProdImg) || rawProdImg;
      const rate = defaultProd.standardRate || 45000;
      const gst = defaultProd.gstRate ?? 18;
      const taxAmount = (rate * gst) / 100;

      return [
        {
          quotationItemId: 0,
          quotationId: 0,
          productId: defaultProd.productId,
          parentQuotationItemId: null,
          isAccessory: false,
          itemCode: defaultProd.itemCode || "PRD-001",
          itemName: defaultProd.productName,
          brand: defaultProd.brand || "Siemens",
          specification: defaultProd.specification || "",
          quantity: 1,
          unitOfMeasurementId: defaultProd.unitOfMeasurementId || 1,
          unitName: uomMatch?.name || "Nos",
          rate: rate,
          discountPercentage: 0,
          discountAmount: 0,
          gstRate: gst,
          taxableAmount: rate,
          taxAmount: taxAmount,
          lineTotal: rate + taxAmount,
          displayOrder: 1,
          isActive: true,
          isDeleted: false,
          accessories: [],
          productImage:
            defaultProd.productImage || defaultProd.productImagePath || null,
          productImagePath:
            defaultProd.productImagePath || defaultProd.productImage || null,
          imageUrl: prodImg || undefined,
        },
      ];
    }

    return [
      {
        quotationItemId: 0,
        quotationId: 0,
        productId: null,
        parentQuotationItemId: null,
        isAccessory: false,
        itemCode: "PRD-01",
        itemName: "CNC Spindle Motor 5kW",
        brand: "Siemens",
        specification: "3000 RPM, 380V Industrial Grade, IP55",
        quantity: 1,
        unitOfMeasurementId: 1,
        unitName: "Nos",
        rate: 45000,
        discountPercentage: 0,
        discountAmount: 0,
        gstRate: 18,
        taxableAmount: 45000,
        taxAmount: 8100,
        lineTotal: 53100,
        displayOrder: 1,
        isActive: true,
        isDeleted: false,
        accessories: [],
      },
    ];
  });

  // Synchronize line items with latest master specifications when availableProducts loads/updates
  useEffect(() => {
    if (!availableProducts || availableProducts.length === 0) return;

    setItems((prevItems) => {
      let hasChanges = false;
      const updated = prevItems.map((item) => {
        let prod: Product | undefined;
        if (item.productId) {
          prod = availableProducts.find((p) => p.productId === item.productId);
        } else if (!item.hasCustomSpecification) {
          // If unlinked (like initial template row), match by itemCode or itemName
          prod = availableProducts.find(
            (p) =>
              (item.itemCode &&
                p.itemCode &&
                (p.itemCode.toLowerCase() === item.itemCode.toLowerCase() ||
                  p.itemCode.replace(/[-_0]/g, "").toLowerCase() ===
                    item.itemCode.replace(/[-_0]/g, "").toLowerCase())) ||
              (item.itemName &&
                p.productName &&
                p.productName.toLowerCase() === item.itemName.toLowerCase())
          );
        }

        if (prod) {
          const latestSpec = prod.specification || "";
          const updates: Partial<QuotationItem> = {};

          if (!item.productId) {
            updates.productId = prod.productId;
            updates.itemCode = prod.itemCode || item.itemCode;
            hasChanges = true;
          }

          // If specification hasn't been manually customized in this quotation session,
          // keep it synchronized with the latest master specification
          if (!item.hasCustomSpecification && item.specification !== latestSpec) {
            updates.specification = latestSpec;
            hasChanges = true;
          }

          // Also keep master product image synchronized if no custom quotation override
          if (!item.customImageUrl) {
            const rawImg =
              prod.imageUrl ||
              prod.productImage ||
              prod.productImagePath ||
              null;
            if (rawImg && item.productImage !== rawImg) {
              updates.productImage = rawImg;
              updates.productImagePath = rawImg;
              updates.imageUrl = resolveImageUrl(rawImg) || rawImg;
              hasChanges = true;
            }
          }

          if (Object.keys(updates).length > 0) {
            return { ...item, ...updates };
          }
        }
        return item;
      });

      return hasChanges ? updated : prevItems;
    });
  }, [availableProducts]);

  // Real-time synchronization event listener for Product Master updates
  useEffect(() => {
    const handleProductUpdated = (e: any) => {
      const { productId, specification } = e.detail || {};
      if (!productId) return;

      setItems((prevItems) => {
        let changed = false;
        const updated = prevItems.map((item) => {
          if (item.productId === productId && !item.hasCustomSpecification) {
            changed = true;
            return { ...item, specification: specification || "" };
          }
          return item;
        });
        return changed ? updated : prevItems;
      });
    };

    window.addEventListener("isquare_product_updated", handleProductUpdated);
    return () => {
      window.removeEventListener("isquare_product_updated", handleProductUpdated);
    };
  }, []);

  // Pricing & charges state
  const [freightCharges, setFreightCharges] = useState<number>(
    initialQuotation?.freightCharges ?? 1500
  );
  const [installationCharges, setInstallationCharges] = useState<number>(
    initialQuotation?.installationCharges ?? 2500
  );
  const [otherCharges, setOtherCharges] = useState<number>(
    initialQuotation?.otherCharges ?? 0
  );
  const [charges, setCharges] = useState<QuotationCharge[]>(
    initialQuotation?.charges ?? []
  );
  const [freightType, setFreightType] = useState<string>(
    (initialQuotation as any)?.freightType ||
      (initialQuotation?.freightCharges === 0 && initialQuotation?.quotationId
        ? "Inclusive"
        : "Custom value")
  );
  const [installationType, setInstallationType] = useState<string>(
    (initialQuotation as any)?.installationType ||
      (initialQuotation?.installationCharges === 0 &&
      initialQuotation?.quotationId
        ? "At your scope"
        : "Custom value")
  );
  const [otherChargesDescription, setOtherChargesDescription] = useState<string>(
    (initialQuotation as any)?.otherChargesDescription ||
      "Standard Packaging & Handling"
  );

  // Commercial terms state
  const [deliveryPeriod, setDeliveryPeriod] = useState<string>(
    initialQuotation?.deliveryPeriod || "2-3 Weeks"
  );
  const [paymentTermId, setPaymentTermId] = useState<number | undefined>(
    initialQuotation?.paymentTermId ?? paymentTerms[0]?.paymentTermId
  );
  const [warranty, setWarranty] = useState<string>(
    initialQuotation?.warranty || "1 Year Standard"
  );
  const [validity, setValidity] = useState<string>("30 Days");
  const [validUntil, setValidUntil] = useState<string>(
    initialQuotation?.validUntil ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    initialQuotation?.termsAndConditions ||
      "1. Taxes extra as applicable.\n2. Prices firm for validity period.\n3. Goods once sold will not be taken back.\n4. Subject to Mumbai Jurisdiction."
  );

  // Fetch company profile & default terms on load
  useEffect(() => {
    companyProfileService.getDefaultProfile().then(setCompanyProfile).catch(() => {});
  }, []);

  const handleLoadDefaults = async () => {
    try {
      const def = await quotationDefaultService.getDefault();
      if (def) {
        if (def.defaultDeliveryPeriod) setDeliveryPeriod(def.defaultDeliveryPeriod);
        if (def.paymentTermId) setPaymentTermId(def.paymentTermId);
        if (def.standardWarranty) setWarranty(def.standardWarranty);
        if (def.quotationValidity) setValidity(def.quotationValidity);
        if (def.standardTermsAndConditions) setTermsAndConditions(def.standardTermsAndConditions);
        toast.success("Loaded company quotation defaults");
      } else {
        toast.info("No saved defaults found. Using system defaults.");
      }
    } catch (e) {
      toast.error("Failed to load quotation defaults");
    }
  };

  // Live Totals Calculation
  const totals = useMemo(
    () =>
      calculateQuotationTotals(
        items,
        freightCharges,
        installationCharges,
        otherCharges,
        charges
      ),
    [items, freightCharges, installationCharges, otherCharges, charges]
  );

  // Check if any product has discount > 15%
  const hasHighDiscount = useMemo(() => {
    return items.some(
      (item) =>
        item.discountPercentage > 15 ||
        (item.accessories || []).some((a) => a.discountPercentage > 15)
    );
  }, [items]);

  // Product Row handlers
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      quotationItemId: 0,
      quotationId: initialQuotation?.quotationId || 0,
      productId: null,
      parentQuotationItemId: null,
      isAccessory: false,
      itemCode: `PRD-${String(items.length + 1).padStart(2, "0")}`,
      itemName: "Custom Equipment",
      brand: "ISQUARE",
      specification: "Standard industrial specification",
      quantity: 1,
      unitOfMeasurementId: 1,
      unitName: "Nos",
      rate: 10000,
      discountPercentage: 0,
      discountAmount: 0,
      gstRate: 18,
      taxableAmount: 10000,
      taxAmount: 1800,
      lineTotal: 11800,
      displayOrder: items.length + 1,
      isActive: true,
      isDeleted: false,
      accessories: [],
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, updated: QuotationItem) => {
    const next = [...items];
    next[index] = updated;
    setItems(next);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const selectedCustomer = customers.find((c) => c.customerId === customerId);
  const selectedPaymentTerm = paymentTerms.find((p) => p.paymentTermId === paymentTermId);

  // Form submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer for this quotation");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one product item to the quotation");
      return;
    }

    for (const itm of items) {
      if (!itm.itemName || itm.itemName.trim() === "") {
        toast.error("Item name cannot be empty");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const fullQuotationData: Quotation = {
        quotationId: initialQuotation?.quotationId || 0,
        quotationNumber: quotationNumber || undefined,
        customerId: customerId,
        customerName: selectedCustomer?.customerName || selectedCustomer?.companyName,
        enquiryId: initialQuotation?.enquiryId || null,
        enquiryRef: enquiryRef,
        quotationDate: quotationDate,
        revisionNumber: revisionNumber,
        status: status,
        approvalStatus: approvalStatus,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        taxAmount: totals.taxAmount,
        freightCharges: freightCharges,
        installationCharges: installationCharges,
        otherCharges: otherCharges,
        grandTotal: totals.grandTotal,
        deliveryPeriod: deliveryPeriod,
        paymentTermId: paymentTermId || null,
        paymentTermsName: selectedPaymentTerm?.paymentTermName,
        warranty: warranty,
        validUntil: validUntil,
        termsAndConditions: termsAndConditions,
        isActive: true,
        isDeleted: false,
        items: items,
        charges: charges,
        contactPersonId: contactId,
        contactPerson: contactPerson || (selectedCustomer as any)?.contactPerson || null,
      };

      await onSave(fullQuotationData);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPreviewQuotation: Quotation = {
    quotationId: initialQuotation?.quotationId || 101,
    quotationNumber: quotationNumber || "QT-2026-DRAFT",
    customerId: customerId,
    customerName: selectedCustomer?.customerName || selectedCustomer?.companyName,
    enquiryId: initialQuotation?.enquiryId || null,
    enquiryRef: enquiryRef,
    quotationDate: quotationDate,
    revisionNumber: revisionNumber,
    status: status,
    approvalStatus: approvalStatus,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    taxAmount: totals.taxAmount,
    freightCharges: freightCharges,
    installationCharges: installationCharges,
    otherCharges: otherCharges,
    grandTotal: totals.grandTotal,
    deliveryPeriod: deliveryPeriod,
    paymentTermId: paymentTermId || null,
    paymentTermsName: selectedPaymentTerm?.paymentTermName,
    warranty: warranty,
    validUntil: validUntil,
    termsAndConditions: termsAndConditions,
    isActive: true,
    isDeleted: false,
    items: items,
    charges: charges,
    contactPersonId: contactId,
    contactPerson: contactPerson || (selectedCustomer as any)?.contactPerson || null,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-5 border-b border-gray-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00234a] text-white flex items-center justify-center font-bold shadow-sm">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              ISQUARE · Commercial Proposal Engine
            </p>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {isEditMode
                ? `Edit Quotation — ${quotationNumber || `QT-${initialQuotation?.quotationId}`}`
                : "Create Professional Quotation"}
            </h2>
            <p className="text-xs text-gray-500">
              Itemized equipment proposal with GST computation, accessories &amp; legal terms
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Update Quotation" : "Save Quotation"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#154068]">
                Section 1
              </span>
              <FileText size={16} className="text-[#154068]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#154068]">
                Quotation Info
              </h3>
            </div>
            <QuotationInformation
              quotationNumber={quotationNumber}
              customerId={customerId}
              contactId={contactId}
              enquiryRef={enquiryRef}
              quotationDate={quotationDate}
              revisionNumber={revisionNumber}
              status={status}
              customers={customers}
              onChange={(f) => {
                if (f.customerId !== undefined) setCustomerId(f.customerId);
                if (f.contactId !== undefined) setContactId(f.contactId);
                if (f.contactPerson !== undefined) setContactPerson(f.contactPerson || "");
                if (f.enquiryRef !== undefined) setEnquiryRef(f.enquiryRef);
                if (f.quotationDate !== undefined) setQuotationDate(f.quotationDate);
                if (f.status !== undefined) setStatus(f.status);
                if (f.revisionNumber !== undefined) setRevisionNumber(f.revisionNumber);
              }}
              onRefreshCustomers={onRefreshCustomers}
            />
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#154068]">
                Section 2
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#154068]">
                Product Details
              </h3>
            </div>
            <QuotationItemsTable
              items={items}
              availableProducts={availableProducts}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
            />
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#154068]">
                Section 3
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#154068]">
                Pricing &amp; Charges
              </h3>
            </div>
            <QuotationPricing
              freightCharges={freightCharges}
              installationCharges={installationCharges}
              otherCharges={otherCharges}
              charges={charges}
              freightType={freightType}
              installationType={installationType}
              otherChargesDescription={otherChargesDescription}
              onChange={(f) => {
                if (f.freightCharges !== undefined) setFreightCharges(f.freightCharges);
                if (f.installationCharges !== undefined) setInstallationCharges(f.installationCharges);
                if (f.otherCharges !== undefined) setOtherCharges(f.otherCharges);
                if (f.charges !== undefined) setCharges(f.charges);
                if (f.freightType !== undefined) setFreightType(f.freightType);
                if (f.installationType !== undefined) setInstallationType(f.installationType);
                if (f.otherChargesDescription !== undefined) setOtherChargesDescription(f.otherChargesDescription);
              }}
            />
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#154068]">
                Section 4
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#154068]">
                Terms &amp; Delivery
              </h3>
            </div>
            <QuotationTerms
              deliveryPeriod={deliveryPeriod}
              paymentTermId={paymentTermId}
              paymentTermsList={paymentTerms}
              warranty={warranty}
              validity={validity}
              validUntil={validUntil}
              termsAndConditions={termsAndConditions}
              onLoadDefaults={handleLoadDefaults}
              onChange={(f) => {
                if (f.deliveryPeriod !== undefined) setDeliveryPeriod(f.deliveryPeriod);
                if (f.paymentTermId !== undefined) setPaymentTermId(f.paymentTermId);
                if (f.warranty !== undefined) setWarranty(f.warranty);
                if (f.validity !== undefined) setValidity(f.validity);
                if (f.validUntil !== undefined) setValidUntil(f.validUntil);
                if (f.termsAndConditions !== undefined) setTermsAndConditions(f.termsAndConditions);
              }}
            />
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#154068]">
                Section 5
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#154068]">
                Proposal Summary
              </h3>
            </div>
            <QuotationSummary
              totals={totals}
              customerName={selectedCustomer?.customerName || selectedCustomer?.companyName}
              enquiryRef={enquiryRef}
              hasHighDiscount={hasHighDiscount}
              isSubmitting={isSubmitting}
              onSave={() => handleSubmit()}
              onCancel={onCancel}
              onPreview={() => setIsPreviewOpen(true)}
              saveButtonText={isEditMode ? "Update Quotation" : "Save Quotation"}
              onRequestApproval={
                onRequestApproval
                  ? () =>
                      onRequestApproval(
                        initialQuotation?.quotationId || 0,
                        "High commercial discount exceeding 15% requires manager approval."
                      )
                  : undefined
              }
            />
          </section>
        </form>
      </div>

      {/* Proposal Document Preview Modal */}
      <QuotationPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        quotation={currentPreviewQuotation}
        companyProfile={companyProfile}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default QuotationForm;
