import React, { useState, useMemo } from "react";
import { Trash2, Plus, Sparkles } from "lucide-react";
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

  // Compute total for this parent and its accessories
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

  const handleAddAccessory = () => {
    const newAcc: QuotationItem = {
      quotationItemId: 0,
      quotationId: item.quotationId || 0,
      productId: null,
      parentQuotationItemId: item.quotationItemId || null,
      isAccessory: true,
      itemCode: "ACC-01",
      itemName: "Accessory Item",
      brand: item.brand || "ISQUARE",
      specification: "Standard industrial mounting & cable accessory",
      quantity: 1,
      unitOfMeasurementId: 1,
      unitName: "Nos",
      rate: 1500,
      discountPercentage: 0,
      discountAmount: 0,
      gstRate: 18,
      taxableAmount: 1500,
      taxAmount: 270,
      lineTotal: 1770,
      displayOrder: (item.accessories?.length || 0) + 1,
      isActive: true,
      isDeleted: false,
    };
    onUpdate({
      ...item,
      accessories: [...(item.accessories || []), newAcc],
    });
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
        {/* Product / Code / Brand */}
        <td className="p-3 align-top min-w-[240px]">
          <div className="space-y-1.5">
            {/* Predefined product select dropdown */}
            <select
              value={item.productId ? String(item.productId) : ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={disabled}
              className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded font-semibold text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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

            {/* Accessory trigger button */}
            {!disabled && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAccessory}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <Plus size={12} />
                  <span>Add Accessory</span>
                </button>
                {item.accessories && item.accessories.length > 0 && (
                  <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                    <Sparkles size={11} />
                    {item.accessories.length}{" "}
                    {item.accessories.length === 1 ? "accessory" : "accessories"}
                  </span>
                )}
              </div>
            )}
          </div>
        </td>

        {/* Technical Specification */}
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

        {/* Product Image Thumbnail matching Screenshot 2 & 3 */}
        <td className="p-3 align-top text-center w-20">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/90 flex items-center justify-center p-1 text-center shadow-2xs overflow-hidden mx-auto mt-1">
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
        </td>

        {/* Quantity & Unit */}
        <td className="p-3 align-top w-24">
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
            className="w-full text-[11px] mt-1 py-0.5 px-1 bg-white border border-gray-200 rounded text-gray-600 focus:outline-none"
          >
            {STANDARD_UOMS.map((uom) => (
              <option key={uom.id} value={uom.id}>
                {uom.name}
              </option>
            ))}
          </select>
        </td>

        {/* Rate (INR) */}
        <td className="p-3 align-top w-28">
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

        {/* Discount % */}
        <td className="p-3 align-top w-20">
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

        {/* GST % */}
        <td className="p-3 align-top w-20">
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

        {/* Line Total */}
        <td className="p-3 align-top w-32 text-right">
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

        {/* Actions */}
        <td className="p-3 align-top w-12 text-center">
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          )}
        </td>
      </tr>

      {/* Render Linked Accessories */}
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
