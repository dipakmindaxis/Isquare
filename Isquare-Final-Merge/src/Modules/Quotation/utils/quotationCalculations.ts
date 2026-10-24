import type {
  Quotation,
  QuotationItem,
  QuotationCharge,
  QuotationApproval,
} from "../models/quotationModels";

export interface ItemCalculationResult {
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export function calculateItemTotals(
  quantity: number,
  rate: number,
  discountPercentage: number = 0,
  gstRate: number = 0
): ItemCalculationResult {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  const safeDisc = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
  const safeGst = Math.max(0, Number(gstRate) || 0);

  const baseAmount = Number((safeQty * safeRate).toFixed(2));
  const discountAmount = Number((baseAmount * (safeDisc / 100)).toFixed(2));
  const taxableAmount = Number((baseAmount - discountAmount).toFixed(2));
  const taxAmount = Number((taxableAmount * (safeGst / 100)).toFixed(2));
  const lineTotal = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    baseAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    lineTotal,
  };
}

/**
 * Computes Profit % using: ((Taxable Amount / Qty - Purchase Rate) / Purchase Rate) * 100
 * Safely returns null if Qty <= 0, Purchase Rate <= 0, or either value is missing/invalid.
 */
export function calculateProfitPercentage(
  taxableAmount: number,
  quantity: number,
  purchaseRate: number | null | undefined
): number | null {
  const safeQty = Number(quantity);
  const pRate = Number(purchaseRate);

  if (!Number.isFinite(safeQty) || safeQty <= 0) return null;
  if (!Number.isFinite(pRate) || pRate <= 0) return null;
  if (!Number.isFinite(taxableAmount)) return null;

  const unitSellingPrice = taxableAmount / safeQty;
  const rawProfit = ((unitSellingPrice - pRate) / pRate) * 100;

  if (!Number.isFinite(rawProfit)) return null;
  return Number(rawProfit.toFixed(2));
}

export interface QuotationTotalsResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  freightCharges: number;
  installationCharges: number;
  otherCharges: number;
  additionalChargesTotal: number;
  grandTotal: number;
}

export function calculateQuotationTotals(
  items: QuotationItem[],
  freightCharges: number = 0,
  installationCharges: number = 0,
  otherCharges: number = 0,
  additionalCharges: QuotationCharge[] = []
): QuotationTotalsResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalTax = 0;

  const processItem = (item: QuotationItem) => {
    const calc = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );
    subtotal += calc.baseAmount;
    totalDiscount += calc.discountAmount;
    totalTaxable += calc.taxableAmount;
    totalTax += calc.taxAmount;

    if (item.accessories && item.accessories.length > 0) {
      item.accessories.forEach(processItem);
    }
  };

  (items || []).forEach(processItem);

  const safeFreight = Math.max(0, Number(freightCharges) || 0);
  const safeInstall = Math.max(0, Number(installationCharges) || 0);
  const safeOther = Math.max(0, Number(otherCharges) || 0);

  let additionalChargesTotal = 0;
  (additionalCharges || []).forEach((ch) => {
    if (ch.isActive !== false) {
      const amt = Number(ch.chargeAmount) || 0;
      const taxRate = ch.isTaxable ? Number(ch.taxRate) || 0 : 0;
      const chargeTax = amt * (taxRate / 100);
      additionalChargesTotal += amt + chargeTax;
    }
  });

  const grandTotal = Number(
    (totalTaxable + totalTax + safeFreight + safeInstall + safeOther + additionalChargesTotal).toFixed(2)
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(totalTaxable.toFixed(2)),
    taxAmount: Number(totalTax.toFixed(2)),
    freightCharges: safeFreight,
    installationCharges: safeInstall,
    otherCharges: safeOther,
    additionalChargesTotal: Number(additionalChargesTotal.toFixed(2)),
    grandTotal,
  };
}

export function formatINR(val: number | string | null | undefined): string {
  const num = Number(val) || 0;
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Pre-configured accessory suggestions catalog based on the Vercel reference
export const ACCESSORIES_CATALOG: Record<
  string,
  Array<{
    code: string;
    name: string;
    spec: string;
    unit: string;
    unitOfMeasurementId: number;
    rate: number;
    gst: number;
  }>
> = {
  spindle: [
    { code: "ACC-SP-01", name: "Collet Set ER20 (13 Pcs)", spec: "Precision 0.008mm, 1mm-13mm range", unit: "Set", unitOfMeasurementId: 2, rate: 3500, gst: 18 },
    { code: "ACC-SP-02", name: "Spindle Mounting Bracket 80mm", spec: "Cast aluminum heavy-duty bracket", unit: "Pcs", unitOfMeasurementId: 3, rate: 2200, gst: 18 },
    { code: "ACC-SP-03", name: "Water Cooling Pump & Tube Kit", spec: "Submersible 3500 L/H with 5m pipe", unit: "Set", unitOfMeasurementId: 2, rate: 4800, gst: 18 },
    { code: "ACC-SP-04", name: "Shielded Spindle Cable 5m", spec: "4-Core 2.5 sq mm drag chain flex", unit: "Nos", unitOfMeasurementId: 1, rate: 1800, gst: 18 },
    { code: "ACC-SP-05", name: "Spindle Tool Touch Probe", spec: "High precision Z-axis tool setter", unit: "Nos", unitOfMeasurementId: 1, rate: 2900, gst: 18 },
  ],
  laptop: [
    { code: "ACC-IT-01", name: "Wireless Optical Mouse", spec: "Ergonomic 2.4GHz with nano receiver", unit: "Nos", unitOfMeasurementId: 1, rate: 800, gst: 18 },
    { code: "ACC-IT-02", name: "Noise Cancelling Headset", spec: "Over-ear USB with noise cancelling mic", unit: "Nos", unitOfMeasurementId: 1, rate: 1500, gst: 18 },
    { code: "ACC-IT-03", name: "Padded Laptop Backpack", spec: "Water-resistant 15.6 inch shoulder bag", unit: "Nos", unitOfMeasurementId: 1, rate: 1200, gst: 18 },
    { code: "ACC-IT-04", name: "Mechanical USB Keyboard", spec: "Tactile backlit keys with numpad", unit: "Nos", unitOfMeasurementId: 1, rate: 2200, gst: 18 },
    { code: "ACC-IT-05", name: "Adjustable Laptop Stand", spec: "Aluminum ventilation riser", unit: "Nos", unitOfMeasurementId: 1, rate: 1100, gst: 18 },
  ],
  vfd: [
    { code: "ACC-VF-01", name: "Dynamic Braking Resistor 1000W", spec: "Ceramic wirewound braking resistor", unit: "Nos", unitOfMeasurementId: 1, rate: 2400, gst: 18 },
    { code: "ACC-VF-02", name: "EMI Line Filter 3-Phase", spec: "415V 25A noise suppression filter", unit: "Nos", unitOfMeasurementId: 1, rate: 3200, gst: 18 },
    { code: "ACC-VF-03", name: "Remote Keypad Extension Cable 3m", spec: "3m cable with panel mount bezel", unit: "Nos", unitOfMeasurementId: 1, rate: 1100, gst: 18 },
  ],
  plc: [
    { code: "ACC-PL-01", name: "Digital I/O Expansion Module", spec: "8 Input / 8 Transistor Output module", unit: "Nos", unitOfMeasurementId: 1, rate: 6500, gst: 18 },
    { code: "ACC-PL-02", name: "DIN Rail Power Supply 24V 5A", spec: "Industrial regulated SMPS 24V DC", unit: "Nos", unitOfMeasurementId: 1, rate: 3800, gst: 18 },
    { code: "ACC-PL-03", name: "Isolated USB Programming Cable", spec: "Optically isolated USB to PLC", unit: "Nos", unitOfMeasurementId: 1, rate: 1500, gst: 18 },
  ],
  common: [
    { code: "ACC-GEN-01", name: "Hardware & Connector Fastener Kit", spec: "Standard mounting fasteners and plugs", unit: "Set", unitOfMeasurementId: 2, rate: 1800, gst: 18 },
    { code: "ACC-GEN-02", name: "Heavy-Duty Power Cable 5m", spec: "Industrial copper insulated 3-core", unit: "Nos", unitOfMeasurementId: 1, rate: 1400, gst: 18 },
  ],
};

export function getSuggestedAccessories(productNameOrCode?: string) {
  const text = (productNameOrCode || "").toLowerCase();
  if (text.includes("spindle") || text.includes("motor")) return ACCESSORIES_CATALOG.spindle;
  if (text.includes("laptop") || text.includes("computer") || text.includes("workstation")) return ACCESSORIES_CATALOG.laptop;
  if (text.includes("vfd") || text.includes("drive") || text.includes("inverter")) return ACCESSORIES_CATALOG.vfd;
  if (text.includes("plc") || text.includes("controller")) return ACCESSORIES_CATALOG.plc;
  return ACCESSORIES_CATALOG.common;
}

// Units of measurement list
export const STANDARD_UOMS = [
  { id: 1, name: "Nos", code: "NOS" },
  { id: 2, name: "Set", code: "SET" },
  { id: 3, name: "Pcs", code: "PCS" },
  { id: 4, name: "Mtr", code: "MTR" },
  { id: 5, name: "Kg", code: "KG" },
  { id: 6, name: "Pair", code: "PAIR" },
  { id: 7, name: "Box", code: "BOX" },
  { id: 8, name: "Ltr", code: "LTR" },
];

/**
 * Resolves the effective approval status for a quotation based on:
 * 1. Linked approval records (Pending, Approved, Rejected)
 * 2. Recorded quotation.approvalStatus
 * 3. Commercial policy / business rules (e.g. discount > 15% requires approval)
 */
export function getEffectiveApprovalStatus(
  quotation?: Partial<Quotation> | null,
  approvals?: QuotationApproval[] | null
): string {
  if (!quotation) return "NotRequired";

  const qId = quotation.quotationId || (quotation as any).id;

  // 1. If approval records exist for this quotation, evaluate actual approval decision workflow
  if (approvals && approvals.length > 0 && qId) {
    const quoteApprovals = approvals.filter((a) => a.quotationId === qId);

    if (quoteApprovals.length > 0) {
      // If any active approval request is Pending, the effective status is Pending
      const hasPending = quoteApprovals.some(
        (a) => (a.approvalStatus || "").trim().toLowerCase() === "pending"
      );
      if (hasPending) {
        return "Pending";
      }

      // Otherwise, sort by requestedAt / quotationApprovalId descending to get the latest decision
      const sorted = [...quoteApprovals].sort((a, b) => {
        const timeA = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
        const timeB = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.quotationApprovalId || 0) - (a.quotationApprovalId || 0);
      });

      const latestDecision = (sorted[0].approvalStatus || "").trim().toLowerCase();
      if (latestDecision === "approved") return "Approved";
      if (latestDecision === "rejected") return "Rejected";
    }
  }

  // 2. Check quotation's recorded approval status from database/API
  const recorded = (quotation.approvalStatus || "").trim().toLowerCase();
  if (recorded === "approved") return "Approved";
  if (recorded === "rejected") return "Rejected";
  if (recorded === "pending") return "Pending";

  // 3. If no approval record exists, verify against business rules:
  // Quotations exceeding 15% discount threshold require internal Manager Approval
  const items = quotation.items || [];
  const hasHighDiscount =
    items.some(
      (i) =>
        (Number(i.discountPercentage) || 0) > 15 ||
        (i.accessories || []).some((a) => (Number(a.discountPercentage) || 0) > 15)
    ) ||
    (Number(quotation.discountAmount) > 0 &&
      Number(quotation.subtotal) > 0 &&
      Number(quotation.discountAmount) / Number(quotation.subtotal) > 0.15);

  if (hasHighDiscount) {
    return "Pending";
  }

  return "NotRequired";
}

