import React, { useState, useMemo, useRef } from "react";
import { Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import type { QuotationItem, Product } from "../models/quotationModels";
import QuotationAccessoryRow from "./QuotationAccessoryRow";
import {
  calculateItemTotals,
  formatINR,
  STANDARD_UOMS,
} from "../utils/quotationCalculations";

interface QuotationItemRowProps {
  item: QuotationItem;
  itemIndex: number;
  availableProducts: Product[];
  onUpdate: (updated: QuotationItem) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const QuotationItemRow: React.FC<QuotationItemRowProps> = ({
  item,
  availableProducts,
  onUpdate,
  onRemove,
  disabled = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Match selected product from availableProducts
  const selectedProduct = useMemo(() => {
    return availableProducts.find(
      (p) =>
        (item.productId && p.productId === item.productId) ||
        (item.itemCode && p.itemCode && p.itemCode === item.itemCode) ||
        (item.itemName &&
          p.productName &&
          p.productName.toLowerCase() === item.itemName.toLowerCase())
    );
  }, [availableProducts, item.productId, item.itemCode, item.itemName]);

  const productImageUrl =
    (item as any).imageUrl ||
    (item as any).image ||
    (selectedProduct as any)?.imageUrl ||
    (selectedProduct as any)?.image ||
    (selectedProduct as any)?.productImage ||
    null;

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

  // 11. Purchase Rate lookup
  const rawPurchaseRate =
    (item as any).purchaseRate ??
    (item as any).purchasePrice ??
    (item as any).costPrice ??
    (selectedProduct as any)?.purchaseRate ??
    (selectedProduct as any)?.purchasePrice ??
    (selectedProduct as any)?.costPrice ??
    null;
  const purchaseRateDisplay =
    rawPurchaseRate != null && !isNaN(Number(rawPurchaseRate))
      ? formatINR(Number(rawPurchaseRate))
      : "—";

  // 12. Profit % lookup / calculation
  const rawProfit =
    (item as any).profitPercentage ??
    (item as any).profitPercent ??
    (item as any).profit ??
    (selectedProduct as any)?.profitPercentage ??
    (selectedProduct as any)?.profitPercent ??
    (selectedProduct as any)?.profit ??
    null;

  let profitDisplay = "—";
  if (rawProfit != null && !isNaN(Number(rawProfit))) {
    profitDisplay = `${Number(rawProfit).toFixed(1)}%`;
  } else if (
    rawPurchaseRate != null &&
    Number(rawPurchaseRate) > 0 &&
    item.rate > 0
  ) {
    const margin = (((item.rate - Number(rawPurchaseRate)) / Number(rawPurchaseRate)) * 100).toFixed(1);
    profitDisplay = `${margin}%`;
  }

  // 13. Stock lookup
  const rawStock =
    (item as any).stockQuantity ??
    (item as any).stock ??
    (item as any).availableStock ??
    (selectedProduct as any)?.stockQuantity ??
    (selectedProduct as any)?.stock ??
    (selectedProduct as any)?.availableStock ??
    null;
  const stockDisplay =
    rawStock != null && !isNaN(Number(rawStock))
      ? String(rawStock)
      : "—";

  const handleProductSelect = (selectedId: string) => {
    if (!selectedId) return;
    const prod = availableProducts.find((p) => String(p.productId) === selectedId);
    if (prod) {
      const uomMatch = STANDARD_UOMS.find((u) => u.id === prod.unitOfMeasurementId);
      const prodImg =
        (prod as any).imageUrl ||
        (prod as any).image ||
        (prod as any).productImage ||
        null;
      setImageError(false);
      onUpdate({
        ...item,
        productId: prod.productId,
        itemCode: prod.itemCode || "",
        itemName: prod.productName,
        brand: prod.brand || "",
        specification: prod.specification || "",
        rate: prod.standardRate || 0,
        gstRate: prod.gstRate ?? 18,
        unitOfMeasurementId: prod.unitOfMeasurementId || 1,
        unitName: uomMatch?.name || "Nos",
        ...(prodImg ? { imageUrl: prodImg } : {}),
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageError(false);
      onUpdate({
        ...item,
        imageUrl: result,
      } as QuotationItem);
      toast.success("Product image updated for this quotation item");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetImage = () => {
    setImageError(false);
    const updated = { ...item };
    delete (updated as any).imageUrl;
    delete (updated as any).image;
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
      <tr className="hover:bg-slate-50/70 border-b border-gray-200 transition text-xs">
        {/* 1. Select / Code / Brand */}
        <td className="p-3 align-top min-w-[240px]">
          <div className="space-y-1.5">
            {/* Predefined product select dropdown */}
            <select
              value={item.productId ? String(item.productId) : ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={disabled}
              className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded font-semibold text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- Choose Existing Product or Custom --</option>
              {availableProducts.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.itemCode ? `[${p.itemCode}] ` : ""}{p.productName}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Code (e.g. PRD-01)"
                value={item.itemCode || ""}
                onChange={(e) =>
                  onUpdate({ ...item, itemCode: e.target.value })
                }
                disabled={disabled}
                className="w-full text-xs py-1 px-2 bg-white border border-gray-300 rounded font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Brand / Make"
                value={item.brand || ""}
                onChange={(e) =>
                  onUpdate({ ...item, brand: e.target.value })
                }
                disabled={disabled}
                className="w-full text-xs py-1 px-2 bg-white border border-gray-300 rounded text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              className="w-full text-xs py-1 px-2 bg-white border border-gray-300 rounded font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </td>

        {/* 2. Technical Specification */}
        <td className="p-3 align-top min-w-[200px]">
          <textarea
            placeholder="Technical Specification..."
            rows={3}
            value={item.specification || ""}
            onChange={(e) =>
              onUpdate({ ...item, specification: e.target.value })
            }
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </td>

        {/* 3. Image with Quotation-Specific Change Control */}
        <td className="p-3 align-top text-center w-24 min-w-[80px]">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/90 flex items-center justify-center p-1 text-center shadow-2xs overflow-hidden mx-auto mt-1 relative group">
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
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-0.5 cursor-pointer"
                title="Change image for this quotation row only"
              >
                <Camera size={11} />
                <span>Change</span>
              </button>
              {(item as any).imageUrl && (
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
        <td className="p-3 align-top text-center w-24 min-w-[85px]">
          <div className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs font-semibold text-gray-800">
            {hsnCodeValue}
          </div>
        </td>

        {/* 5. Qty */}
        <td className="p-3 align-top w-20 min-w-[70px]">
          <input
            type="number"
            min="0.001"
            step="any"
            value={item.quantity ?? 1}
            onChange={(e) =>
              onUpdate({
                ...item,
                quantity: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded font-bold text-gray-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </td>

        {/* 6. UOM */}
        <td className="p-3 align-top w-24 min-w-[80px]">
          <select
            value={item.unitOfMeasurementId || 1}
            onChange={(e) => {
              const uId = parseInt(e.target.value, 10);
              const uMatch = STANDARD_UOMS.find((u) => u.id === uId);
              onUpdate({
                ...item,
                unitOfMeasurementId: uId,
                unitName: uMatch?.name || "Nos",
              });
            }}
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded text-gray-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            {STANDARD_UOMS.map((uom) => (
              <option key={uom.id} value={uom.id}>
                {uom.name}
              </option>
            ))}
          </select>
        </td>

        {/* 7. Rate (₹) */}
        <td className="p-3 align-top w-28 min-w-[100px]">
          <input
            type="number"
            min="0"
            step="any"
            value={item.rate ?? 0}
            onChange={(e) =>
              onUpdate({
                ...item,
                rate: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded font-semibold text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </td>

        {/* 8. Disc (%) */}
        <td className="p-3 align-top w-20 min-w-[70px]">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.discountPercentage ?? 0}
            onChange={(e) =>
              onUpdate({
                ...item,
                discountPercentage: Math.min(
                  100,
                  Math.max(0, parseFloat(e.target.value) || 0)
                ),
              })
            }
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {item.discountPercentage > 15 && (
            <div className="text-[9px] text-amber-600 font-bold mt-0.5 text-center" title="Requires Approval">
              &gt;15% Disc
            </div>
          )}
        </td>

        {/* 9. GST (%) */}
        <td className="p-3 align-top w-20 min-w-[70px]">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.gstRate ?? 18}
            onChange={(e) =>
              onUpdate({
                ...item,
                gstRate: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            disabled={disabled}
            className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </td>

        {/* 10. Total (₹) */}
        <td className="p-3 align-top w-28 min-w-[110px] text-right">
          <div className="text-xs font-bold text-gray-900">
            {formatINR(combinedTotal)}
          </div>
          {item.accessories && item.accessories.length > 0 ? (
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              Base: {formatINR(calc.lineTotal)}
              <br />
              Acc: {formatINR(accessoriesTotal)}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 mt-0.5">
              Taxable: {formatINR(calc.taxableAmount)}
            </div>
          )}
        </td>

        {/* 11. Purchase Rate */}
        <td className="p-3 align-top w-28 min-w-[100px] text-right">
          <div className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-right font-medium text-xs text-gray-800">
            {purchaseRateDisplay}
          </div>
        </td>

        {/* 12. Profit % */}
        <td className="p-3 align-top w-20 min-w-[75px] text-center">
          <div className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-center font-medium text-xs text-gray-800">
            {profitDisplay}
          </div>
        </td>

        {/* 13. Stock */}
        <td className="p-3 align-top w-20 min-w-[70px] text-center">
          <div className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-center font-medium text-xs text-gray-800">
            {stockDisplay}
          </div>
        </td>

        {/* Actions (Delete Row) */}
        <td className="p-3 align-top w-12 min-w-[48px] text-center">
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
              title="Remove product"
            >
              <Trash2 size={16} />
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
