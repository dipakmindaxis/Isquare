import React from "react";
import { Trash2, CornerDownRight, Package } from "lucide-react";
import type { QuotationItem } from "../models/quotationModels";
import {
  calculateItemTotals,
  formatINR,
  getSuggestedAccessories,
  STANDARD_UOMS,
} from "../utils/quotationCalculations";
import { resolveImageUrl } from "../services/quotationService";

interface QuotationAccessoryRowProps {
  accessory: QuotationItem;
  parentName?: string;
  onUpdate: (updated: QuotationItem) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const QuotationAccessoryRow: React.FC<QuotationAccessoryRowProps> = ({
  accessory,
  parentName,
  onUpdate,
  onRemove,
  disabled = false,
}) => {
  const suggested = getSuggestedAccessories(parentName);
  const calc = calculateItemTotals(
    accessory.quantity,
    accessory.rate,
    accessory.discountPercentage,
    accessory.gstRate
  );

  const handleSelectPredefined = (code: string) => {
    if (!code) return;
    const match = suggested.find((a) => a.code === code);
    if (match) {
      onUpdate({
        ...accessory,
        itemCode: match.code,
        itemName: match.name,
        specification: match.spec,
        rate: match.rate,
        gstRate: match.gst,
        unitOfMeasurementId: match.unitOfMeasurementId,
        unitName: match.unit,
      });
    }
  };

  return (
    <tr className="bg-orange-50/20 hover:bg-orange-50/40 border-b border-gray-100 transition text-xs">
      {/* Code, Name, Suggestion & Link */}
      <td className="p-3 pl-6 align-top border-r border-gray-100">
        <div className="flex items-start gap-2">
          <CornerDownRight size={16} className="text-[#FF7900] shrink-0 mt-1" />
          <div className="flex-1 space-y-1.5 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 tracking-wide">
                Accessory
              </span>
              <span className="text-[11px] text-gray-400 truncate">
                Linked to parent item
              </span>
            </div>

            {/* Catalog Selector */}
            <select
              value={accessory.itemCode || ""}
              onChange={(e) => handleSelectPredefined(e.target.value)}
              disabled={disabled}
              className="w-full text-xs py-1 px-2 bg-white border border-gray-200 rounded-lg focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none"
            >
              <option value="">Custom Accessory...</option>
              <optgroup label="Suggested for This Product">
                {suggested.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}) - ₹{s.rate.toLocaleString("en-IN")}
                  </option>
                ))}
              </optgroup>
            </select>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Item Code"
                value={accessory.itemCode || ""}
                onChange={(e) =>
                  onUpdate({ ...accessory, itemCode: e.target.value })
                }
                disabled={disabled}
                className="w-full text-xs py-1 px-2 bg-white border border-gray-200 rounded-lg font-mono focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Accessory Name *"
                value={accessory.itemName || ""}
                onChange={(e) =>
                  onUpdate({ ...accessory, itemName: e.target.value })
                }
                disabled={disabled}
                required
                className="w-full text-xs py-1 px-2 bg-white border border-gray-200 rounded-lg font-semibold focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </td>

      {/* Specification */}
      <td className="p-3 align-top min-w-[180px] border-r border-gray-100">
        <textarea
          placeholder="Accessory technical specification..."
          rows={2}
          value={accessory.specification || ""}
          onChange={(e) =>
            onUpdate({ ...accessory, specification: e.target.value })
          }
          disabled={disabled}
          className="w-full text-xs py-1 px-2 bg-white border border-gray-200 rounded-lg focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]/20 focus:outline-none resize-none"
        />
      </td>

      {/* 3. Accessory Image / Icon */}
      <td className="p-3 align-top text-center w-24 min-w-[80px]">
        {(() => {
          const rawAccImg =
            (accessory as any).customImageUrl ||
            accessory.imageUrl ||
            (accessory as any).productImage ||
            (accessory as any).productImagePath ||
            (accessory as any).image;
          const accessoryImg = resolveImageUrl(rawAccImg) || rawAccImg;
          return (
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mt-1 overflow-hidden">
              {accessoryImg ? (
                <img
                  src={accessoryImg}
                  alt={accessory.itemName || "Accessory"}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <Package size={14} className="text-slate-400" />
              )}
            </div>
          );
        })()}
      </td>

      {/* 4. HSN Code */}
      <td className="p-3 align-top text-center w-24 min-w-[85px]">
        <div className="py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs text-gray-500">
          —
        </div>
      </td>

      {/* 5. Quantity */}
      <td className="p-3 align-top w-20 min-w-[70px]">
        <input
          type="number"
          min="0.001"
          step="any"
          value={accessory.quantity ?? 1}
          onChange={(e) =>
            onUpdate({
              ...accessory,
              quantity: Math.max(0, parseFloat(e.target.value) || 0),
            })
          }
          disabled={disabled}
          className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* 6. UOM */}
      <td className="p-3 align-top w-24 min-w-[80px]">
        <select
          value={accessory.unitOfMeasurementId || 1}
          onChange={(e) => {
            const uId = parseInt(e.target.value, 10);
            const uMatch = STANDARD_UOMS.find((u) => u.id === uId);
            onUpdate({
              ...accessory,
              unitOfMeasurementId: uId,
              unitName: uMatch?.name || "Nos",
            });
          }}
          disabled={disabled}
          className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded text-gray-700 font-medium focus:outline-none"
        >
          {STANDARD_UOMS.map((uom) => (
            <option key={uom.id} value={uom.id}>
              {uom.name}
            </option>
          ))}
        </select>
      </td>

      {/* 7. Rate */}
      <td className="p-3 align-top w-28 min-w-[100px]">
        <input
          type="number"
          min="0"
          step="any"
          value={accessory.rate ?? 0}
          onChange={(e) =>
            onUpdate({
              ...accessory,
              rate: Math.max(0, parseFloat(e.target.value) || 0),
            })
          }
          disabled={disabled}
          className="w-full text-xs py-1.5 px-2 bg-white border border-gray-300 rounded font-semibold text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* 8. Discount % */}
      <td className="p-3 align-top w-20 min-w-[70px]">
        <input
          type="number"
          min="0"
          max="100"
          step="any"
          value={accessory.discountPercentage ?? 0}
          onChange={(e) =>
            onUpdate({
              ...accessory,
              discountPercentage: Math.min(
                100,
                Math.max(0, parseFloat(e.target.value) || 0)
              ),
            })
          }
          disabled={disabled}
          className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* 9. GST % */}
      <td className="p-3 align-top w-20 min-w-[70px]">
        <input
          type="number"
          min="0"
          max="100"
          step="any"
          value={accessory.gstRate ?? 18}
          onChange={(e) =>
            onUpdate({
              ...accessory,
              gstRate: Math.max(0, parseFloat(e.target.value) || 0),
            })
          }
          disabled={disabled}
          className="w-full text-xs py-1.5 px-2 text-center bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </td>

      {/* 10. Line Total */}
      <td className="p-3 align-top w-28 min-w-[110px] text-right">
        <div className="text-xs font-bold text-gray-900">
          {formatINR(calc.lineTotal)}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          Taxable: {formatINR(calc.taxableAmount)}
        </div>
      </td>

      {/* 11. Purchase Rate */}
      <td className="p-3 align-top w-28 min-w-[100px] text-right border-r border-gray-100">
        <div className="py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-right font-medium text-xs text-gray-400">
          —
        </div>
      </td>

      {/* 12. Profit % */}
      <td className="p-3 align-top w-20 min-w-[75px] text-center border-r border-gray-100">
        <div className="py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-center font-medium text-xs text-gray-400">
          —
        </div>
      </td>

      {/* 13. Stock */}
      <td className="p-3 align-top w-20 min-w-[70px] text-center border-r border-gray-100">
        <div className="py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-center font-medium text-xs text-gray-400">
          —
        </div>
      </td>

      {/* 14. Actions */}
      <td className="p-3 align-top w-12 min-w-[48px] text-center">
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
            title="Remove accessory"
          >
            <Trash2 size={15} />
          </button>
        )}
      </td>
    </tr>
  );
};

export default QuotationAccessoryRow;
