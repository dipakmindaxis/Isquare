import React, { useState, useMemo, useRef, useEffect } from "react";
import { Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import type { QuotationItem, Product } from "../models/quotationModels";
import QuotationAccessoryRow from "./QuotationAccessoryRow";
import {
  calculateItemTotals,
  calculateProfitPercentage,
  formatINR,
  STANDARD_UOMS,
} from "../utils/quotationCalculations";
import {
  productService,
  resolveImageUrl,
  getProductUom,
  resolveUomId,
} from "../services/quotationService";

interface QuotationItemRowProps {
  item: QuotationItem;
  itemIndex: number;
  availableProducts: Product[];
  onUpdate: (updated: QuotationItem) => void;
  onRemove: () => void;
  disabled?: boolean;
}

function parseSafeNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "").trim();
    if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function getProductPurchaseRate(src: any): number | null {
  if (!src) return null;
  const val =
    src.purchaseRate ??
    src.PurchaseRate ??
    src.purchaserate ??
    src.PURCHASERATE ??
    src.purchase_rate ??
    src.Purchase_Rate ??
    src.purchasePrice ??
    src.PurchasePrice ??
    src.costPrice ??
    src.CostPrice ??
    src.cost ??
    src.Cost ??
    src.buyingPrice ??
    src.BuyingPrice;
  const parsed = parseSafeNumeric(val);
  if (parsed != null && Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return null;
}

function getProductProfit(src: any): number | null {
  if (!src) return null;
  const val =
    src.profitPercentage ??
    src.ProfitPercentage ??
    src.profit_percentage ??
    src.Profit_Percentage ??
    src.profitpercentage ??
    src.PROFITPERCENTAGE ??
    src.profitPercent ??
    src.ProfitPercent ??
    src.profit ??
    src.Profit ??
    src.profitMargin ??
    src.ProfitMargin ??
    src.margin ??
    src.Margin;
  const num = parseSafeNumeric(val);
  return num != null && Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

function getProductStock(src: any): number | null {
  if (!src) return null;
  const val =
    src.stock ??
    src.Stock ??
    src.STOCK ??
    src.stockQty ??
    src.StockQty ??
    src.stockQuantity ??
    src.StockQuantity ??
    src.availableStock ??
    src.AvailableStock;
  const num = parseSafeNumeric(val);
  return num != null && Number.isFinite(num) && num >= 0 ? Math.round(num) : null;
}

function findProductInAvailable(
  products: Product[],
  prodId?: any,
  code?: string | null,
  name?: string | null
): Product | undefined {
  if (!products || products.length === 0) return undefined;

  if (prodId != null) {
    const numId = Number(prodId);
    if (!isNaN(numId) && numId > 0) {
      const match = products.find((p: any) => {
        const pId = Number(p.productId ?? p.ProductId ?? p.id ?? p.Id);
        return !isNaN(pId) && pId === numId;
      });
      if (match) return match;
    }
  }

  const cleanCode = code ? String(code).trim().toLowerCase() : "";
  if (cleanCode) {
    const matchByCode = products.find((p: any) => {
      const pCode = String(p.itemCode ?? p.ItemCode ?? p.code ?? p.Code ?? "")
        .trim()
        .toLowerCase();
      return (
        pCode &&
        (pCode === cleanCode ||
          pCode.replace(/[-_0]/g, "") === cleanCode.replace(/[-_0]/g, ""))
      );
    });
    if (matchByCode) return matchByCode;
  }

  const cleanName = name ? String(name).trim().toLowerCase() : "";
  if (cleanName && cleanName !== "custom equipment") {
    const matchByName = products.find((p: any) => {
      const pName = String(p.productName ?? p.ProductName ?? p.name ?? p.Name ?? "")
        .trim()
        .toLowerCase();
      return (
        pName &&
        (pName === cleanName ||
          pName.includes(cleanName) ||
          cleanName.includes(pName))
      );
    });
    if (matchByName) return matchByName;
  }

  return undefined;
}

export const QuotationItemRow: React.FC<QuotationItemRowProps> = ({
  item,
  availableProducts,
  onUpdate,
  onRemove,
  disabled = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [refreshedProduct, setRefreshedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productSelectionRequest = useRef(0);

  // Match selected product from availableProducts robustly
  const selectedProduct = useMemo(() => {
    return findProductInAvailable(
      availableProducts,
      item.productId ?? (item as any).ProductId,
      item.itemCode ?? (item as any).ItemCode,
      item.itemName ?? (item as any).productName
    );
  }, [availableProducts, item.productId, item.itemCode, item.itemName]);

  const targetProduct = useMemo(() => {
    const itemId = item.productId ?? (item as any).ProductId;
    if (
      refreshedProduct &&
      Number(refreshedProduct.productId ?? (refreshedProduct as any).ProductId) === Number(itemId)
    ) {
      return refreshedProduct;
    }
    if (selectedProduct) return selectedProduct;
    const match = findProductInAvailable(
      availableProducts,
      itemId,
      item.itemCode ?? (item as any).ItemCode,
      item.itemName ?? (item as any).productName
    );
    if (match) return match;
    if (refreshedProduct) return refreshedProduct;
    return undefined;
  }, [refreshedProduct, selectedProduct, availableProducts, item.productId, item.itemCode, item.itemName]);

  const defaultProductImage = useMemo(() => {
    const raw =
      selectedProduct?.imageUrl ||
      selectedProduct?.productImage ||
      selectedProduct?.productImagePath ||
      (selectedProduct as any)?.image ||
      (selectedProduct as any)?.imagePath ||
      null;
    return resolveImageUrl(raw) || raw;
  }, [selectedProduct]);

  // Quotation-line-specific image override is stored in customImageUrl / hasCustomImage
  const hasCustomOverride = Boolean(
    item.hasCustomImage || (item.customImageUrl && item.customImageUrl !== defaultProductImage)
  );

  const productImageUrl = useMemo(() => {
    if (hasCustomOverride && item.customImageUrl) {
      return resolveImageUrl(item.customImageUrl) || item.customImageUrl;
    }
    const raw =
      defaultProductImage ||
      item.imageUrl ||
      item.productImage ||
      item.productImagePath ||
      (item as any)?.image ||
      null;
    return resolveImageUrl(raw) || raw;
  }, [
    hasCustomOverride,
    item.customImageUrl,
    defaultProductImage,
    item.imageUrl,
    item.productImage,
    item.productImagePath,
    (item as any)?.image,
  ]);

  useEffect(() => {
    setImageError(false);
  }, [productImageUrl]);

  const placeholderText = useMemo(() => {
    const name = item.itemName || selectedProduct?.productName || "";
    if (!name) return "Product";

    if (/iphone/i.test(name)) return "iPhone";
    if (/controller/i.test(name)) return "Controller";
    if (/spindle/i.test(name)) return "Spindle";
    if (/sensor/i.test(name)) return "Sensor";
    if (/motor/i.test(name)) return "Motor";
    if (/cable/i.test(name)) return "Cable";

    const words = name.trim().split(/\s+/);
    if (words.length > 0 && words[0].length <= 10) {
      return words[0];
    }
    return item.brand || "Product";
  }, [item.itemName, item.brand, selectedProduct]);

  const calc = calculateItemTotals(
    item.quantity,
    item.rate,
    item.discountPercentage,
    item.gstRate
  );

  // Compute total for this parent and its accessories (if any exist)
  let accessoriesTotal = 0;
  (item.accessories || []).forEach((acc) => {
    const accCalc = calculateItemTotals(
      acc.quantity,
      acc.rate,
      acc.discountPercentage,
      acc.gstRate
    );
    accessoriesTotal += accCalc.lineTotal;
  });

  const combinedTotal = calc.lineTotal + accessoriesTotal;

  // 4. HSN Code lookup
  const hsnCodeValue =
    (item as any).hsnCode ||
    (item as any).hsn ||
    (selectedProduct as any)?.hsnCode ||
    (selectedProduct as any)?.hsn ||
    "—";

  // 6. UOM resolution
  const displayUom = useMemo(() => {
    const prod = targetProduct || selectedProduct;
    const masterUom =
      prod?.unitName?.trim() ||
      (prod as any)?.uom?.trim() ||
      (prod ? getProductUom(prod.productId, prod) : null);
    if (masterUom) return masterUom;

    if (item.unitName && item.unitName.trim() !== "") {
      return item.unitName.trim();
    }
    const itemCached = getProductUom(item.productId, item);
    if (itemCached) return itemCached;

    const stdMatch = STANDARD_UOMS.find((u) => u.id === item.unitOfMeasurementId);
    if (stdMatch) return stdMatch.name;

    return "Nos";
  }, [
    item.unitName,
    item.unitOfMeasurementId,
    item.productId,
    item.itemCode,
    item.itemName,
    targetProduct,
    selectedProduct,
  ]);

  // Synchronize item fields with selected/target master product
  useEffect(() => {
    const prod = targetProduct || selectedProduct;
    if (!prod) return;

    let needsUpdate = false;
    const updates: Partial<QuotationItem> = {};

    const prodUom =
      prod.unitName?.trim() ||
      (prod as any).uom?.trim() ||
      getProductUom(prod.productId, prod) ||
      STANDARD_UOMS.find((u) => u.id === prod.unitOfMeasurementId)?.name ||
      "Nos";
    if (!item.unitName || (item.unitName === "Nos" && prodUom !== "Nos")) {
      updates.unitName = prodUom;
      updates.unitOfMeasurementId = prod.unitOfMeasurementId || resolveUomId(prodUom);
      needsUpdate = true;
    }

    const pRate = getProductPurchaseRate(prod);
    if (item.purchaseRate === undefined && pRate != null) {
      updates.purchaseRate = pRate;
      needsUpdate = true;
    }

    const pStock = getProductStock(prod);
    if (item.stock === undefined && pStock != null) {
      updates.stock = pStock;
      needsUpdate = true;
    }

    const masterProfit = getProductProfit(prod);
    if (item.profitPercentage === undefined && masterProfit != null) {
      updates.profitPercentage = masterProfit;
      updates.profit = masterProfit;
      needsUpdate = true;
    }

    if (needsUpdate) {
      onUpdate({
        ...item,
        ...updates,
      });
    }
  }, [targetProduct, selectedProduct]);

  // Handlers for editable fields in Section 2
  const handlePurchaseRateChange = (rawValue: string) => {
    if (rawValue.trim() === "") {
      onUpdate({
        ...item,
        purchaseRate: null,
        basePurchaseRate: null,
        profitPercentage: null,
        profit: null,
      } as any);
      return;
    }
    const parsed = parseFloat(rawValue);
    const pRate = isNaN(parsed) ? null : parsed;
    const currentQty = Math.max(0, Number(item.quantity) || 1);
    const grossBase = Number(((Number(item.rate) || 0) * currentQty).toFixed(2));
    const grossGst = Number((grossBase * ((Number(item.gstRate) || 0) / 100)).toFixed(2));
    const grossTotal = Number((grossBase + grossGst).toFixed(2));
    const profitPct = calculateProfitPercentage(grossTotal, currentQty, pRate);

    onUpdate({
      ...item,
      purchaseRate: pRate,
      basePurchaseRate: pRate,
      profitPercentage: profitPct,
      profit: profitPct,
    } as any);
  };

  const handleProfitPercentageChange = (rawValue: string) => {
    if (rawValue.trim() === "") {
      onUpdate({
        ...item,
        profitPercentage: null,
        profit: null,
      });
      return;
    }
    const parsed = parseFloat(rawValue);
    const profitPct = isNaN(parsed) ? null : parsed;
    onUpdate({
      ...item,
      profitPercentage: profitPct,
      profit: profitPct,
    });
  };

  const handleStockChange = (rawValue: string) => {
    if (rawValue.trim() === "") {
      onUpdate({
        ...item,
        stock: null,
      });
      return;
    }
    const parsed = parseFloat(rawValue);
    const stockQty = isNaN(parsed) ? null : Math.round(parsed);
    onUpdate({
      ...item,
      stock: stockQty,
    });
  };

  // Unified calculation and field change handler for product row inputs
  const handleFieldChange = (
    field: "quantity" | "rate" | "discountPercentage" | "gstRate",
    rawValue: string | number
  ) => {
    let parsed: number;
    if (typeof rawValue === "number") {
      parsed = isNaN(rawValue) ? 0 : rawValue;
    } else {
      const cleaned = String(rawValue).replace(/[^0-9.-]/g, "").trim();
      parsed = cleaned === "" || cleaned === "-" || cleaned === "." ? 0 : parseFloat(cleaned);
      if (isNaN(parsed)) parsed = 0;
    }

    const currentQty =
      field === "quantity" ? Math.max(0, parsed) : Math.max(0, Number(item.quantity) || 0);
    const currentRate =
      field === "rate" ? Math.max(0, parsed) : Math.max(0, Number(item.rate) || 0);
    const currentDisc =
      field === "discountPercentage"
        ? Math.min(100, Math.max(0, parsed))
        : Math.min(100, Math.max(0, Number(item.discountPercentage) || 0));
    const currentGst =
      field === "gstRate" ? Math.max(0, parsed) : Math.max(0, Number(item.gstRate) || 0);

    // 1. Gross Total before discount (e.g., Total 206.50 for Rate=175, Qty=1, GST=18%)
    const grossBase = Number((currentRate * currentQty).toFixed(2));
    const grossGst = Number((grossBase * (currentGst / 100)).toFixed(2));
    const grossTotal = Number((grossBase + grossGst).toFixed(2));

    // 2. Base Amount & Taxable Amount after discount:
    // taxableAmount = baseAmount - (baseAmount * discountPercent / 100)
    const discountAmount = Number((grossBase * (currentDisc / 100)).toFixed(2));
    const taxableAmount = Number((grossBase - discountAmount).toFixed(2));

    // 3. GST Amount: gstAmount = taxableAmount * gstPercent / 100
    const gstAmount = Number((taxableAmount * (currentGst / 100)).toFixed(2));

    // 4. Total Including GST: total = taxableAmount + gstAmount
    const lineTotal = Number((taxableAmount + gstAmount).toFixed(2));

    // 5. Dynamic Purchase Rate and Profit % based on user-entered discount:
    // Requirement 1: When a discount percentage (e.g., 4%) is applied, calculate the discount amount dynamically
    // (e.g., Total 206.50 * 4 / 100 = 8.26).
    // Requirement 2: Subtract this discount from the total to derive the Purchase Rate dynamically
    // (e.g., 206.50 - 8.26 = 198.24).
    // Requirement 3: Compute the Profit % dynamically based on this actual calculated value rather than using static values.
    let dynamicPurchaseRate: number | null = null;
    let dynamicProfit: number | null = null;

    if (currentDisc > 0) {
      const discountOnTotal = Number((grossTotal * (currentDisc / 100)).toFixed(2));
      const discountedTotal = Number((grossTotal - discountOnTotal).toFixed(2));
      dynamicPurchaseRate =
        currentQty > 0
          ? Number((discountedTotal / currentQty).toFixed(2))
          : discountedTotal;
      dynamicProfit = calculateProfitPercentage(grossTotal, currentQty, dynamicPurchaseRate);
    } else {
      dynamicPurchaseRate =
        item.purchaseRate != null && !isNaN(Number(item.purchaseRate))
          ? Number(item.purchaseRate)
          : null;
      dynamicProfit =
        item.profitPercentage != null && !isNaN(Number(item.profitPercentage))
          ? Number(item.profitPercentage)
          : null;
    }

    // 6. Stock preservation (clean null if not available)
    const currentStock =
      item.stock != null && !isNaN(Number(item.stock))
        ? Math.round(Number(item.stock))
        : (getProductStock(targetProduct) ??
          getProductStock(refreshedProduct) ??
          getProductStock(selectedProduct) ??
          null);

    onUpdate({
      ...item,
      [field]:
        field === "quantity"
          ? currentQty
          : field === "rate"
          ? currentRate
          : field === "discountPercentage"
          ? currentDisc
          : currentGst,
      quantity: currentQty,
      rate: currentRate,
      discountPercentage: currentDisc,
      discountAmount,
      gstRate: currentGst,
      taxableAmount,
      taxAmount: gstAmount,
      lineTotal,
      purchaseRate: dynamicPurchaseRate,
      basePurchaseRate: dynamicPurchaseRate,
      profitPercentage: dynamicProfit,
      profit: dynamicProfit,
      stock: currentStock,
    } as any);
  };

  const handleProductSelect = async (selectedId: string) => {
    const requestId = ++productSelectionRequest.current;
    if (!selectedId) {
      setRefreshedProduct(null);
      onUpdate({
        ...item,
        productId: null,
        hsnCode: null,
        purchaseRate: null,
        profitPercentage: null,
        profit: null,
        stock: null,
      });
      return;
    }
    const prod = findProductInAvailable(availableProducts, selectedId);
    if (prod) {
      const pRate = getProductPurchaseRate(prod);
      const sRate =
        prod.standardRate != null && !isNaN(Number(prod.standardRate))
          ? Number(prod.standardRate)
          : 0;

      const currentDisc = Math.min(100, Math.max(0, Number(item.discountPercentage) || 0));
      const currentQty = Math.max(0, Number(item.quantity) || 1);
      const currentGst = prod.gstRate ?? 18;

      const grossBase = Number((sRate * currentQty).toFixed(2));
      const grossGst = Number((grossBase * (currentGst / 100)).toFixed(2));
      const grossTotal = Number((grossBase + grossGst).toFixed(2));

      const discountAmount = Number((grossBase * (currentDisc / 100)).toFixed(2));
      const taxableAmount = Number((grossBase - discountAmount).toFixed(2));
      const gstAmount = Number((taxableAmount * (currentGst / 100)).toFixed(2));
      const lineTotal = Number((taxableAmount + gstAmount).toFixed(2));

      let dynamicPurchaseRate: number | null = null;
      let profitPct: number | null = null;

      if (currentDisc > 0) {
        const discountOnTotal = Number((grossTotal * (currentDisc / 100)).toFixed(2));
        const discountedTotal = Number((grossTotal - discountOnTotal).toFixed(2));
        dynamicPurchaseRate = currentQty > 0
          ? Number((discountedTotal / currentQty).toFixed(2))
          : discountedTotal;
        profitPct = calculateProfitPercentage(grossTotal, currentQty, dynamicPurchaseRate);
      } else {
        dynamicPurchaseRate = pRate ?? null;
        profitPct = getProductProfit(prod) ?? null;
      }

      const stockQty = getProductStock(prod);
      const hasRetainedOverride = Boolean(hasCustomOverride && item.customImageUrl);

      const productUom =
        prod.unitName?.trim() ||
        (prod as any).uom?.trim() ||
        getProductUom(prod.productId, prod) ||
        STANDARD_UOMS.find((u) => u.id === prod.unitOfMeasurementId)?.name ||
        "Nos";

      const immediateItem: any = {
        ...item,
        productId: prod.productId,
        itemCode: prod.itemCode || "",
        itemName: prod.productName,
        brand: prod.brand || "",
        specification: prod.specification || "",
        hasCustomSpecification: false,
        hsnCode: prod.hsnCode || null,
        purchaseRate: dynamicPurchaseRate,
        basePurchaseRate: dynamicPurchaseRate,
        profitPercentage: profitPct,
        profit: profitPct,
        stock: stockQty,
        quantity: currentQty,
        rate: sRate,
        discountPercentage: currentDisc,
        discountAmount,
        taxableAmount,
        taxAmount: gstAmount,
        lineTotal,
        gstRate: currentGst,
        unitOfMeasurementId: prod.unitOfMeasurementId || resolveUomId(productUom),
        unitName: productUom,
        productImage: prod.productImage || prod.productImagePath || null,
        productImagePath: prod.productImagePath || prod.productImage || null,
        ...(hasRetainedOverride
          ? {
              customImageUrl: item.customImageUrl,
              hasCustomImage: true,
              imageUrl: item.customImageUrl,
            }
          : {
              customImageUrl: undefined,
              hasCustomImage: false,
              imageUrl: resolveImageUrl(
                prod.productImage ||
                  prod.productImagePath ||
                  prod.imageUrl
              ) || undefined,
            }),
      };

      setRefreshedProduct(prod);
      setImageError(false);
      onUpdate(immediateItem);

      try {
        const fetched = await productService.getById(Number(selectedId));
        if (productSelectionRequest.current !== requestId) return;
        if (
          fetched &&
          Number(fetched.productId ?? (fetched as any).ProductId ?? (fetched as any).id) ===
            Number(selectedId)
        ) {
          setRefreshedProduct(fetched);
        }
      } catch (error) {
        if (productSelectionRequest.current === requestId) {
          console.warn("Using available product details:", error);
        }
      }
    }
  };

  const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];
  const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isValidFormat =
      ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (!isValidFormat) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, or WEBP)");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image file size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageError(false);
      onUpdate({
        ...item,
        customImageUrl: result,
        hasCustomImage: true,
        imageUrl: result,
      });
      toast.success("Product image updated for this quotation item");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetImage = () => {
    setImageError(false);
    const updated: QuotationItem = {
      ...item,
      hasCustomImage: false,
      customImageUrl: undefined,
      imageUrl: defaultProductImage || undefined,
      productImage: selectedProduct?.productImage || selectedProduct?.productImagePath || undefined,
      productImagePath: selectedProduct?.productImagePath || selectedProduct?.productImage || undefined,
    };
    delete (updated as any).customImageUrl;
    if (!defaultProductImage) {
      delete (updated as any).imageUrl;
      delete (updated as any).image;
    }
    onUpdate(updated);
    toast.info("Reverted to original product image");
  };

  const handleUpdateAccessory = (index: number, updatedAcc: QuotationItem) => {
    const nextAccessories = [...(item.accessories || [])];
    nextAccessories[index] = updatedAcc;
    onUpdate({
      ...item,
      accessories: nextAccessories,
    });
  };

  const handleRemoveAccessory = (index: number) => {
    const nextAccessories = (item.accessories || []).filter((_, i) => i !== index);
    onUpdate({
      ...item,
      accessories: nextAccessories,
    });
  };

  return (
    <>
      <tr className="hover:bg-[#f0f7ff] border-b border-gray-100 transition text-xs min-h-[52px]">
        {/* 1. Select / Code / Brand */}
        <td className="p-3 align-top min-w-[280px] border-r border-gray-100">
          <div className="space-y-2">
            {/* Predefined product select dropdown */}
            <select
              value={item.productId ? String(item.productId) : ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={disabled}
              className="w-full text-xs h-9 py-1.5 px-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none cursor-pointer truncate shadow-2xs"
            >
              <option value="">-- Choose Existing Product or Custom --</option>
              {availableProducts.map((p: any) => {
                const pId = p.productId ?? p.ProductId ?? p.id ?? p.Id;
                const pCode = p.itemCode ?? p.ItemCode ?? p.code ?? p.Code;
                const pName = p.productName ?? p.ProductName ?? p.name ?? p.Name;
                return (
                  <option key={pId} value={pId}>
                    {pCode ? `[${pCode}] ` : ""}{pName}
                  </option>
                );
              })}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Code (e.g. PRD-01)"
                value={item.itemCode || ""}
                onChange={(e) =>
                  onUpdate({ ...item, itemCode: e.target.value })
                }
                disabled={disabled}
                className="w-full text-xs h-8 py-1.5 px-2.5 bg-white border border-gray-200 rounded-lg font-mono text-gray-800 placeholder:text-gray-400 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs truncate"
              />
              <input
                type="text"
                placeholder="Brand / Make"
                value={item.brand || ""}
                onChange={(e) =>
                  onUpdate({ ...item, brand: e.target.value })
                }
                disabled={disabled}
                className="w-full text-xs h-8 py-1.5 px-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs truncate"
              />
            </div>

            <input
              type="text"
              placeholder="Item Name *"
              value={item.itemName || ""}
              onChange={(e) =>
                onUpdate({ ...item, itemName: e.target.value })
              }
              disabled={disabled}
              required
              className="w-full text-xs h-8 py-1.5 px-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs truncate"
            />
          </div>
        </td>

        {/* 2. Technical Specification */}
        <td className="p-3 align-top min-w-[340px] border-r border-gray-100">
          <textarea
            placeholder="Technical Specification..."
            rows={5}
            value={item.specification || ""}
            onChange={(e) =>
              onUpdate({
                ...item,
                specification: e.target.value,
                hasCustomSpecification: true,
              })
            }
            disabled={disabled}
            className="w-full h-[114px] text-xs leading-relaxed py-2 px-2.5 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none resize-none transition shadow-2xs overflow-y-auto"
          />
        </td>

        {/* 3. Image with Quotation-Specific Change Control */}
        <td className="p-3 align-top text-center w-20 min-w-[80px] border-r border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-center p-1 text-center shadow-xs overflow-hidden mx-auto mt-1 relative group">
            {productImageUrl && !imageError ? (
              <img
                src={productImageUrl}
                alt={item.itemName || "Product"}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-[11px] font-semibold text-slate-800 tracking-tight select-none">
                {placeholderText}
              </span>
            )}
          </div>

          {!disabled && (
            <div className="mt-1 flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-[#FF7900] hover:text-[#e06800] transition inline-flex items-center gap-0.5 cursor-pointer"
                title="Change image for this quotation row only"
              >
                <Camera size={11} />
                <span>Change</span>
              </button>
              {hasCustomOverride && (
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="text-[9px] text-gray-400 hover:text-rose-600 transition mt-0.5 cursor-pointer"
                  title="Revert to master product image"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </td>

        {/* 4. HSN Code */}
        <td className="p-3 align-top text-center w-24 min-w-[90px] border-r border-gray-100">
          <div className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-mono text-xs font-semibold text-gray-800">
            {hsnCodeValue}
          </div>
        </td>

        {/* 5. Qty */}
        <td className="p-3 align-top w-20 min-w-[70px] border-r border-gray-100">
          <input
            type="number"
            min="0.001"
            step="any"
            value={item.quantity ?? 1}
            onChange={(e) => handleFieldChange("quantity", e.target.value)}
            disabled={disabled}
            className="w-full text-xs h-9 py-1.5 px-2 text-center bg-white border border-gray-200 rounded-lg font-bold text-gray-900 focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs"
          />
        </td>

        {/* 6. UOM */}
        <td className="p-3 align-top text-center w-24 min-w-[80px] border-r border-gray-100">
          <div className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs font-semibold text-gray-800">
            {displayUom}
          </div>
        </td>

        {/* 7. Rate (₹) */}
        <td className="p-3 align-top w-28 min-w-[100px] border-r border-gray-100">
          <input
            type="number"
            min="0"
            step="any"
            value={item.rate ?? 0}
            onChange={(e) => handleFieldChange("rate", e.target.value)}
            disabled={disabled}
            className="w-full text-xs h-9 py-1.5 px-2 bg-white border border-gray-200 rounded-lg font-semibold text-right focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none font-mono shadow-2xs"
          />
        </td>

        {/* 8. Disc (%) */}
        <td className="p-3 align-top w-20 min-w-[75px] border-r border-gray-100">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.discountPercentage ?? 0}
            onChange={(e) => handleFieldChange("discountPercentage", e.target.value)}
            disabled={disabled}
            className="w-full text-xs h-9 py-1.5 px-2 text-center bg-white border border-gray-200 rounded-lg focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none font-mono shadow-2xs"
          />
          {item.discountPercentage > 15 && (
            <div className="text-[9px] text-amber-600 font-bold mt-0.5 text-center" title="Requires Approval">
              &gt;15% Disc
            </div>
          )}
        </td>

        {/* 9. GST (%) */}
        <td className="p-3 align-top w-20 min-w-[75px] border-r border-gray-100">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.gstRate ?? 18}
            onChange={(e) => handleFieldChange("gstRate", e.target.value)}
            disabled={disabled}
            className="w-full text-xs h-9 py-1.5 px-2 text-center bg-white border border-gray-200 rounded-lg focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none font-mono shadow-2xs"
          />
        </td>

        {/* 10. Total (₹) */}
        <td className="p-3 align-top w-28 min-w-[110px] text-right border-r border-gray-100">
          <div className="text-xs font-bold text-gray-900 font-mono py-1">
            {formatINR(combinedTotal)}
          </div>
          {item.accessories && item.accessories.length > 0 ? (
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              <div>Base: {formatINR(calc.lineTotal)}</div>
              <div>Acc: {formatINR(accessoriesTotal)}</div>
              <div>Taxable: {formatINR(calc.taxableAmount)}</div>
              <div>GST: {formatINR(calc.taxAmount)}</div>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              <div>Taxable: {formatINR(calc.taxableAmount)}</div>
              <div>GST: {formatINR(calc.taxAmount)}</div>
            </div>
          )}
        </td>

        {/* 11. Purchase Rate */}
        <td className="p-3 align-top w-28 min-w-[110px] border-r border-gray-100">
          <input
            type="number"
            min="0"
            step="any"
            value={item.purchaseRate != null ? item.purchaseRate : ""}
            onChange={(e) => handlePurchaseRateChange(e.target.value)}
            disabled={disabled}
            placeholder=""
            className="w-full text-xs h-9 py-1.5 px-2 bg-white border border-gray-200 rounded-lg font-medium text-right font-mono focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs"
          />
        </td>

        {/* 12. Profit % */}
        <td className="p-3 align-top w-20 min-w-[80px] border-r border-gray-100">
          <input
            type="number"
            step="any"
            value={item.profitPercentage != null ? item.profitPercentage : ""}
            onChange={(e) => handleProfitPercentageChange(e.target.value)}
            disabled={disabled}
            placeholder=""
            className="w-full text-xs h-9 py-1.5 px-2 text-center bg-white border border-gray-200 rounded-lg font-medium font-mono focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs"
          />
        </td>

        {/* 13. Stock */}
        <td className="p-3 align-top w-20 min-w-[75px] border-r border-gray-100">
          <input
            type="number"
            min="0"
            step="1"
            value={item.stock != null ? item.stock : ""}
            onChange={(e) => handleStockChange(e.target.value)}
            disabled={disabled}
            placeholder=""
            className="w-full text-xs h-9 py-1.5 px-2 text-center bg-white border border-gray-200 rounded-lg font-medium font-mono focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none shadow-2xs"
          />
        </td>

        {/* Actions (Delete Row) */}
        <td className="p-3 align-top w-12 min-w-[48px] text-center">
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition shadow-xs inline-flex items-center justify-center cursor-pointer mt-0.5"
              title="Remove product"
            >
              <Trash2 size={15} />
            </button>
          )}
        </td>
      </tr>

      {/* Render Linked Accessories (Preserved for existing data) */}
      {item.accessories &&
        item.accessories.map((acc, aIdx) => (
          <QuotationAccessoryRow
            key={`acc-${aIdx}`}
            accessory={acc}
            parentName={item.itemName}
            onUpdate={(updated) => handleUpdateAccessory(aIdx, updated)}
            onRemove={() => handleRemoveAccessory(aIdx)}
            disabled={disabled}
          />
        ))}
    </>
  );
};

export default QuotationItemRow;
