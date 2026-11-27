import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import { getCustomerById } from "../../RSM/Pages/Customer/Services/CustomerService";
import { getContactById, getContactsByCompanyId } from "../../RSM/Pages/Master/Contact/Services/ContactService";
import {
  quotationService,
  quotationItemService,
  quotationChargeService,
  companyProfileService,
  productService,
} from "../services/quotationService";
import { calculateItemTotals, hasQuotationDiscount } from "./quotationCalculations";
import { loadImageAsDataUrl } from "./quotationExportPdf";
import { ISQUARE_SEAL_BASE64 } from "./isquareSealBase64";
import { findProductFromMaster, getItemImageSource } from "../components/QuotationPreviewModal";

const escapeHtml = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatCurrencyINR = (amount: number): string => {
  const num = Number(amount || 0);
  return `&#8377;${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatProposalDate = (dateString?: string | null): string => {
  if (!dateString) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseSpecificationBullets = (spec?: string | null): string[] => {
  if (!spec || !spec.trim()) return [];
  return spec
    .split(/\r?\n|•/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "-");
};

export interface BuildQuotationEmailOptions {
  companyProfile?: CompanyProfile | null;
  customer?: Customer | null;
  masterProducts?: Product[];
  customMessage?: string;
}

export async function buildQuotationEmailHtml(
  inputQuotation: Quotation,
  options: BuildQuotationEmailOptions = {}
): Promise<string> {
  // 1. Ensure full quotation with items and charges is loaded
  let quotation = inputQuotation;
  if (!quotation.items || quotation.items.length === 0) {
    try {
      const [full, items, charges] = await Promise.all([
        quotationService.getById(quotation.quotationId).catch(() => null),
        quotationItemService.getByQuotation(quotation.quotationId).catch(() => []),
        quotationChargeService.getByQuotation(quotation.quotationId).catch(() => []),
      ]);
      quotation = {
        ...(full || quotation),
        items:
          items.length > 0
            ? items
            : full?.items && full.items.length > 0
              ? full.items
              : quotation.items || [],
        charges:
          charges.length > 0
            ? charges
            : full?.charges && full.charges.length > 0
              ? full.charges
              : quotation.charges || [],
      };
    } catch {
      // use inputQuotation as fallback
    }
  }

  // 2. Load CompanyProfile, Customer, Master Products in parallel when not passed
  const [companyProfile, customer, masterProducts] = await Promise.all([
    options.companyProfile !== undefined
      ? Promise.resolve(options.companyProfile)
      : companyProfileService.getDefaultProfile().catch(() => null),
    options.customer !== undefined
      ? Promise.resolve(options.customer)
      : quotation.customerId
        ? getCustomerById(quotation.customerId).catch(() => null)
        : Promise.resolve(null),
    options.masterProducts && options.masterProducts.length > 0
      ? Promise.resolve(options.masterProducts)
      : productService.getAll().catch(() => [] as Product[]),
  ]);

  // 3. Resolve Contact Record (same logic as QuotationPreviewModal)
  let contactRecord: Contact | null = null;
  const contactId = (quotation as any).contactPersonId || (quotation as any).contactId;
  const compId = quotation.customerId || customer?.companyId || (customer as any)?.customerId;

  if (contactId && Number(contactId) > 0) {
    contactRecord = await getContactById(Number(contactId)).catch(() => null);
  }
  if (!contactRecord && compId && Number(compId) > 0) {
    try {
      const contacts = await getContactsByCompanyId(Number(compId));
      if (contacts.length > 0) {
        const targetName = (quotation as any).contactPerson || "";
        contactRecord = targetName
          ? contacts.find(
              (c) => (c.fullName || "").trim().toLowerCase() === targetName.trim().toLowerCase()
            ) || contacts[0]
          : contacts[0];
      }
    } catch {
      // ignore
    }
  }

  // 4. Resolve Logo & Item/Accessory Images to Data URLs (for reliable CID embedding in email)
  const basePath = (import.meta.env.BASE_URL || "/frontend/").replace(/\/+$/, "");
  const logoCandidates = [
    companyProfile?.logoPath,
    `${basePath}/isquare-logo.png`,
    "/frontend/isquare-logo.png",
    "/isquare-logo.png",
  ].filter(Boolean) as string[];

  let logoDataUrl: string | null = null;
  for (const src of logoCandidates) {
    try {
      const dataUrl = await loadImageAsDataUrl(src);
      if (dataUrl) {
        logoDataUrl = dataUrl;
        break;
      }
    } catch {
      // try next candidate
    }
  }

  const resolvedImages: Record<string, string> = {};
  for (const item of quotation.items || []) {
    const imgSource = getItemImageSource(item, masterProducts);
    if (imgSource && !resolvedImages[imgSource]) {
      try {
        const dataUrl = await loadImageAsDataUrl(imgSource);
        if (dataUrl) resolvedImages[imgSource] = dataUrl;
      } catch {
        // ignore
      }
    }
    for (const acc of item.accessories || []) {
      const accImgSource = getItemImageSource(acc, masterProducts);
      if (accImgSource && !resolvedImages[accImgSource]) {
        try {
          const dataUrl = await loadImageAsDataUrl(accImgSource);
          if (dataUrl) resolvedImages[accImgSource] = dataUrl;
        } catch {
          // ignore
        }
      }
    }
  }

  // 5. Resolve Header, Customer, Terms & Totals (matching QuotationPreviewModal 1:1)
  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;

  const rawCompanyName = companyProfile?.companyName || "iSQUARE Safety Equipments Pvt. Ltd.";
  const companyName =
    rawCompanyName.trim().toLowerCase() === "isquare"
      ? "iSQUARE Safety Equipments Pvt. Ltd."
      : rawCompanyName;
  const companyAddress =
    "GOYAL RESIDENCY B, SR NO. 434/4A, OFFICE, B1/13, Kasarwadi, Maharashtra 411034";
  const companyPhone = companyProfile?.phone || "+91 9028815632";
  const companyEmail = companyProfile?.email || "sales@isquaresafety.com";
  const companyGstin = companyProfile?.gstin || "27AARCP3435C1ZD";
  const companyPan = companyProfile?.pan || "AARCP3435C";

  const customerName =
    customer?.companyName ||
    (customer as any)?.company ||
    quotation.customerName ||
    customer?.customerName ||
    "Valued Client";

  const customerAddress = (() => {
    if ((quotation as any).customerAddress) {
      return String((quotation as any).customerAddress).replace(/Mumbai/gi, "Pune");
    }
    if (customer?.addresses && customer.addresses.length > 0) {
      const primary = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
      const parts = [
        primary.address,
        primary.cityName,
        primary.stateName ? `${primary.stateName} - ${primary.pincode || ""}` : primary.pincode,
        "India",
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(", ").replace(/Mumbai/gi, "Pune");
    }
    if ((customer as any)?.address) {
      return String((customer as any).address).replace(/Mumbai/gi, "Pune");
    }
    return "";
  })();

  const contactPerson =
    (quotation as any).contactPerson ||
    contactRecord?.fullName ||
    customer?.contactPerson ||
    (customer as any)?.contactPersonName ||
    (customer as any)?.contactName ||
    "";

  const contactPhone =
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    contactRecord?.mobileNo ||
    contactRecord?.altMobileNo ||
    customer?.phone ||
    customer?.mobile ||
    "";

  const contactEmail =
    (quotation as any).contactEmail ||
    contactRecord?.emailAddress ||
    contactRecord?.altEmailAddress ||
    customer?.email ||
    customer?.emailAddress ||
    "";

  const showDiscount = hasQuotationDiscount(quotation);

  const termsList: string[] =
    quotation.termsAndConditions && quotation.termsAndConditions.trim()
      ? quotation.termsAndConditions
          .split(/\r?\n/)
          .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/Mumbai/gi, "Pune").trim())
          .filter(Boolean)
      : [
          "Taxes extra as applicable.",
          "Prices firm for validity period.",
          "Goods once sold will not be taken back.",
          "Subject to Pune Jurisdiction.",
        ];

  const calculatedSubTotal = (() => {
    const itemsSum = (quotation.items || []).reduce((acc, item) => {
      const itemTot = calculateItemTotals(
        item.quantity,
        item.rate,
        item.discountPercentage,
        item.gstRate
      ).lineTotal;
      const accTot = (item.accessories || []).reduce((aAcc, accItem) => {
        return (
          aAcc +
          calculateItemTotals(
            accItem.quantity,
            accItem.rate,
            accItem.discountPercentage,
            accItem.gstRate
          ).lineTotal
        );
      }, 0);
      return acc + itemTot + accTot;
    }, 0);
    return itemsSum > 0 ? itemsSum : quotation.grandTotal || quotation.taxableAmount || 0;
  })();

  // 6. Build Items & Accessories Rows
  const items = quotation.items || [];
  const colCount = showDiscount ? 10 : 9;
  let itemRowsHtml = "";

  if (items.length === 0) {
    itemRowsHtml = `<tr><td colspan="${colCount}" style="padding:24px 12px;text-align:center;color:#94a3b8;font-size:12px;">No products added to this quotation.</td></tr>`;
  } else {
    items.forEach((item, idx) => {
      const calc = calculateItemTotals(
        item.quantity,
        item.rate,
        item.discountPercentage,
        item.gstRate
      );
      const matchedProd = findProductFromMaster(item, masterProducts);
      const itemImg = getItemImageSource(item, masterProducts);
      const resolvedDataUrl = itemImg ? resolvedImages[itemImg] || itemImg : null;

      const hsnCode =
        item.hsnCode ||
        (item as any).hsn ||
        matchedProd?.hsnCode ||
        (matchedProd as any)?.hsn ||
        "—";

      const specBullets = parseSpecificationBullets(
        item.specification || matchedProd?.specification
      );

      const bulletsHtml = specBullets
        .map(
          (b) =>
            `<div style="font-size:10px;color:#475569;margin-top:2px;line-height:1.35;word-break:break-word;"><span style="color:#FF7900;font-weight:700;">&#8226;</span>&nbsp;${escapeHtml(b)}</div>`
        )
        .join("");

      const imageHtml = resolvedDataUrl
        ? `<img src="${escapeHtml(resolvedDataUrl)}" alt="${escapeHtml(item.itemName)}" style="max-height:64px;max-width:64px;display:block;margin:0 auto;object-fit:contain;" />`
        : `<div style="width:52px;height:52px;margin:0 auto;border:1px solid #e2e8f0;background-color:#f8fafc;border-radius:6px;line-height:52px;font-size:9px;color:#94a3b8;text-align:center;">No Image</div>`;

      itemRowsHtml += `
        <tr style="background-color:#ffffff;">
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#334155;vertical-align:middle;">${idx + 1}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;vertical-align:middle;word-break:break-word;">
            <div style="font-size:12px;font-weight:800;color:#00234a;line-height:1.3;">${escapeHtml(item.itemName)}${item.brand ? ` (${escapeHtml(item.brand)})` : ""}</div>
            ${bulletsHtml}
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;vertical-align:middle;">${imageHtml}</td>
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#334155;vertical-align:middle;">${escapeHtml(hsnCode)}</td>
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#2563eb;vertical-align:middle;">${item.gstRate}%</td>
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#1e293b;vertical-align:middle;">${item.quantity}</td>
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#475569;vertical-align:middle;">${escapeHtml(item.unitName || "Nos")}</td>
          <td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#1e293b;vertical-align:middle;white-space:nowrap;">${formatCurrencyINR(item.rate)}</td>
          ${
            showDiscount
              ? `<td style="padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#334155;vertical-align:middle;">${item.discountPercentage}%</td>`
              : ""
          }
          <td style="padding:10px 10px;border-bottom:1px solid #cbd5e1;text-align:right;font-size:12px;font-weight:700;color:#0f172a;vertical-align:middle;white-space:nowrap;">${formatCurrencyINR(calc.lineTotal)}</td>
        </tr>`;

      for (const acc of item.accessories || []) {
        const aCalc = calculateItemTotals(
          acc.quantity,
          acc.rate,
          acc.discountPercentage,
          acc.gstRate
        );
        const accMatched = findProductFromMaster(acc, masterProducts);
        const accImg = getItemImageSource(acc, masterProducts);
        const resolvedAccDataUrl = accImg ? resolvedImages[accImg] || accImg : null;
        const accHsn =
          acc.hsnCode ||
          (acc as any).hsn ||
          accMatched?.hsnCode ||
          (accMatched as any)?.hsn ||
          "—";
        const accImageHtml = resolvedAccDataUrl
          ? `<img src="${escapeHtml(resolvedAccDataUrl)}" alt="${escapeHtml(acc.itemName)}" style="max-height:48px;max-width:48px;display:block;margin:0 auto;object-fit:contain;" />`
          : `<span style="font-size:9px;color:#94a3b8;">—</span>`;

        itemRowsHtml += `
          <tr style="background-color:#f8fafc;">
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#94a3b8;vertical-align:middle;">&#8627;</td>
            <td style="padding:8px 8px 8px 14px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;vertical-align:middle;word-break:break-word;">
              <div style="font-size:11px;font-weight:600;color:#1e293b;">[Accessory] ${escapeHtml(acc.itemName)}</div>
              ${acc.specification ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">${escapeHtml(acc.specification)}</div>` : ""}
            </td>
            <td style="padding:6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;vertical-align:middle;">${accImageHtml}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:10px;color:#475569;vertical-align:middle;">${escapeHtml(accHsn)}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:700;color:#2563eb;vertical-align:middle;">${acc.gstRate}%</td>
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#1e293b;vertical-align:middle;">${acc.quantity}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#475569;vertical-align:middle;">${escapeHtml(acc.unitName || "Nos")}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#1e293b;vertical-align:middle;white-space:nowrap;">${formatCurrencyINR(acc.rate)}</td>
            ${
              showDiscount
                ? `<td style="padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#475569;vertical-align:middle;">${acc.discountPercentage}%</td>`
                : ""
            }
            <td style="padding:8px 10px;border-bottom:1px solid #cbd5e1;text-align:right;font-size:11px;font-weight:700;color:#1e293b;vertical-align:middle;white-space:nowrap;">${formatCurrencyINR(aCalc.lineTotal)}</td>
          </tr>`;
      }
    });
  }

  const subTotalRowHtml =
    items.length > 0
      ? `
      <tr style="background-color:#F5F8FC;border-top:2px solid #D6E0EC;">
        <td colspan="${colCount - 1}" style="padding:9px 10px;text-align:right;font-size:12px;font-weight:800;color:#002B55;border-right:1px solid #D6E0EC;text-transform:uppercase;letter-spacing:0.04em;">SUB TOTAL</td>
        <td style="padding:9px 10px;text-align:right;font-size:13px;font-weight:800;color:#FF7900;white-space:nowrap;">${formatCurrencyINR(calculatedSubTotal)}</td>
      </tr>`
      : "";

  const termsRowsHtml = termsList
    .map(
      (term, tIdx) => `
      <tr>
        <td width="26" style="padding:3px 8px 3px 0;vertical-align:middle;">
          <div style="width:18px;height:18px;line-height:18px;border-radius:50%;border:2px solid #FF7900;color:#FF7900;font-size:10px;font-weight:700;text-align:center;">${tIdx + 1}</div>
        </td>
        <td style="padding:3px 0;font-size:11px;color:#102A50;vertical-align:middle;line-height:1.4;word-break:break-word;">${escapeHtml(term)}</td>
      </tr>`
    )
    .join("");

  const logoHtml = logoDataUrl
    ? `<img src="${escapeHtml(logoDataUrl)}" alt="${escapeHtml(companyName)}" style="max-height:54px;max-width:210px;display:block;" />`
    : `<div>
         <div style="font-size:24px;font-weight:900;color:#00234a;letter-spacing:-0.02em;line-height:1;">
           <span style="color:#FF5500;">i</span>SQUARE<sup style="font-size:11px;color:#FF5500;">&reg;</sup>
         </div>
         <div style="font-size:9px;font-weight:800;letter-spacing:0.06em;color:#00234a;text-transform:uppercase;margin-top:2px;">SAFETY EQUIPMENTS PVT. LTD.</div>
         <div style="font-size:10px;color:#FF5500;font-style:italic;font-family:Georgia,serif;margin-top:1px;">The complete safety solution</div>
       </div>`;

  const customNoteHtml =
    options.customMessage &&
    options.customMessage.trim() &&
    !options.customMessage.toLowerCase().includes("using the link below")
      ? `<div style="margin:0 0 14px;padding:10px 14px;background-color:#ffffff;border:1px solid #D6E0EC;border-radius:8px;color:#102A50;font-size:12px;line-height:1.5;">${escapeHtml(options.customMessage.trim()).replace(/\n/g, "<br/>")}</div>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#102A50;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="840" cellpadding="0" cellspacing="0" style="max-width:840px;width:100%;">
          <tr>
            <td>
              ${customNoteHtml}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background-color:#ffffff;border:1px solid #D6E0EC;border-radius:10px;padding:22px 24px;">
                <tr>
                  <td>
                    <!-- 1. Corporate Letterhead Header -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #FF7900;padding-bottom:12px;margin-bottom:14px;">
                      <tr>
                        <td style="vertical-align:middle;">${logoHtml}</td>
                        <td style="vertical-align:middle;text-align:right;font-size:10px;color:#64748B;line-height:1.45;">
                          <div style="font-size:11px;font-weight:700;color:#102A50;">${escapeHtml(companyAddress)}</div>
                          <div style="margin-top:2px;">
                            <span style="font-weight:600;color:#102A50;">Contact:</span> ${escapeHtml(companyPhone)} &nbsp;|&nbsp;
                            <span style="font-weight:600;color:#102A50;">Email:</span> ${escapeHtml(companyEmail)}
                          </div>
                          <div style="font-family:'Courier New',monospace;margin-top:2px;">
                            <span style="font-weight:600;color:#102A50;">GSTIN:</span> ${escapeHtml(companyGstin)} &nbsp;|&nbsp;
                            <span style="font-weight:600;color:#102A50;">PAN:</span> ${escapeHtml(companyPan)}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- 2. Ref & Date Strip -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F8FC;border:1px solid #D6E0EC;border-radius:8px;margin-bottom:12px;">
                      <tr>
                        <td style="padding:8px 14px;font-size:12px;">
                          <span style="font-weight:700;color:#002B55;">Ref.:</span>&nbsp;
                          <span style="font-weight:800;color:#FF7900;font-size:13px;">${escapeHtml(quotationNumber)}</span>
                        </td>
                        <td style="padding:8px 14px;text-align:right;font-size:12px;">
                          <span style="color:#64748B;">Date:</span>&nbsp;
                          <span style="font-weight:700;color:#002B55;">${escapeHtml(formatProposalDate(quotation.quotationDate))}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- 3. To Customer Block -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F8FC;border:1px solid #D6E0EC;border-radius:10px;margin-bottom:14px;">
                      <tr>
                        <td style="padding:14px 16px;font-size:11px;color:#102A50;line-height:1.5;word-break:break-word;">
                          <div style="font-weight:700;color:#64748B;font-size:11px;">To,</div>
                          <div style="font-size:13px;font-weight:800;color:#002B55;text-transform:uppercase;margin-top:2px;">${escapeHtml(customerName)}</div>
                          ${customerAddress ? `<div style="color:#64748B;margin-top:2px;">${escapeHtml(customerAddress)}</div>` : ""}
                          <div style="margin-top:4px;">
                            ${contactPerson ? `<div><span style="font-weight:700;color:#002B55;">Kind Attn:</span>&nbsp;&nbsp;${escapeHtml(contactPerson)}</div>` : ""}
                            ${contactPhone ? `<div><span style="font-weight:700;color:#002B55;">Mob. No.:</span>&nbsp;&nbsp;${escapeHtml(contactPhone)}</div>` : ""}
                            ${contactEmail ? `<div><span style="font-weight:700;color:#002B55;">Email id:</span>&nbsp;&nbsp;${escapeHtml(contactEmail)}</div>` : ""}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- 4. Subject Pill & Salutation -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #fed7aa;border-radius:6px;overflow:hidden;border-collapse:separate;">
                      <tr>
                        <td style="background-color:#002B55;color:#ffffff;font-size:11px;font-weight:800;padding:5px 12px;letter-spacing:0.04em;">SUB:</td>
                        <td style="background-color:#fff7ed;color:#002B55;font-size:12px;font-weight:700;padding:5px 16px;">Offer for PPP</td>
                      </tr>
                    </table>

                    <div style="font-size:12px;font-weight:700;color:#002B55;margin-bottom:3px;">Dear Sir/Madam,</div>
                    <div style="font-size:11px;color:#64748B;padding-left:14px;margin-bottom:14px;">We take pleasure in submitting our competitive offer for your requirement.</div>

                    <!-- 5. Orange-Header Product Table -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #D6E0EC;border-collapse:collapse;margin-bottom:16px;">
                      <thead>
                        <tr style="background-color:#FF7900;color:#ffffff;">
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:34px;">SR.<br/>NO.</th>
                          <th style="padding:8px 8px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:left;">DESCRIPTION</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:68px;">IMAGE</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:60px;">HSN CODE</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:44px;">GST<br/>(%)</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:36px;">QTY</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:40px;">UOM</th>
                          <th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:78px;">UNIT RATE<br/>(INR)</th>
                          ${
                            showDiscount
                              ? `<th style="padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:58px;">DISCOUNT<br/>(%)</th>`
                              : ""
                          }
                          <th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;text-align:right;width:96px;">TOTAL AMOUNT (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemRowsHtml}
                        ${subTotalRowHtml}
                      </tbody>
                    </table>

                    <!-- 6. Commercial Terms -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="padding-bottom:6px;">
                          <span style="display:inline-block;width:16px;height:16px;line-height:16px;background-color:#FF7900;color:#ffffff;border-radius:4px;text-align:center;font-size:10px;font-weight:700;vertical-align:middle;">&#9776;</span>
                          <span style="font-size:11px;font-weight:800;color:#002B55;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;margin-left:6px;">COMMERCIAL TERMS</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            ${termsRowsHtml}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- 7. Closing & Stamp -->
                    <div style="font-size:11px;color:#102A50;line-height:1.55;margin-bottom:12px;">
                      <div style="font-weight:600;">Thanking you,</div>
                      <div style="font-weight:600;">Yours faithfully,</div>
                      <div style="font-weight:700;color:#002B55;">For ${escapeHtml(companyName)}</div>
                      <div style="margin-top:10px;margin-bottom:8px;">
                        <img src="${ISQUARE_SEAL_BASE64}" alt="iSQUARE Company Stamp" style="width:86px;height:86px;display:block;object-fit:contain;" />
                      </div>
                    </div>

                    <!-- 8. Contact Note & Page Counter -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #D6E0EC;padding-top:10px;">
                      <tr>
                        <td align="center" style="font-size:10px;color:#64748B;">
                          Note: If you need any clarification or further assistance please feel free to contact
                          <div style="font-size:11px;font-weight:700;color:#002B55;margin-top:2px;">Mr. Irfan Attar</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="right" style="font-size:10px;color:#64748B;padding-top:6px;">Page 1 of 1</td>
                      </tr>
                    </table>

                    <!-- 9. Accept / Reject Action Buttons -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px solid #D6E0EC;padding-top:18px;">
                      <tr>
                        <td align="center">
                          <a href="{{ACCEPT_URL}}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px;margin:4px 6px;">
                            &#10003;&nbsp; Accept Quotation
                          </a>
                          <a href="{{REJECT_URL}}" style="display:inline-block;background-color:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px;margin:4px 6px;">
                            &#10005;&nbsp; Reject Quotation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
