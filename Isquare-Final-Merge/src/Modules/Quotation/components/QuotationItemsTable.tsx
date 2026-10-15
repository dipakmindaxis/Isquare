import React from "react";
import { Plus, PackagePlus } from "lucide-react";
import type { QuotationItem, Product } from "../models/quotationModels";
import QuotationItemRow from "./QuotationItemRow";

interface QuotationItemsTableProps {
  items: QuotationItem[];
  availableProducts: Product[];
  onAddItem: () => void;
  onUpdateItem: (index: number, updated: QuotationItem) => void;
  onRemoveItem: (index: number) => void;
  disabled?: boolean;
}

export const QuotationItemsTable: React.FC<QuotationItemsTableProps> = ({
  items,
  availableProducts,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div>
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
            Line Items &amp; Products
          </h4>
          <p className="text-xs text-gray-500">
            Add equipment, sensors, machines, and attach related accessories
          </p>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00234a] hover:bg-[#003366] text-white shadow-sm transition"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#154068] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3">Select / Code / Brand</th>
                <th className="p-3">Technical Specification</th>
                <th className="p-3 w-24">Qty / Unit</th>
                <th className="p-3 w-28 text-right">Rate (₹)</th>
                <th className="p-3 w-20 text-center">Disc (%)</th>
                <th className="p-3 w-20 text-center">GST (%)</th>
                <th className="p-3 w-32 text-right">Total (₹)</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackagePlus size={32} className="text-gray-300" />
                      <p className="text-xs font-medium">No products added to this quotation yet.</p>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={onAddItem}
                          className="mt-1 px-3 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          + Add First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <QuotationItemRow
                    key={`item-${idx}`}
                    item={item}
                    itemIndex={idx}
                    availableProducts={availableProducts}
                    onUpdate={(updated) => onUpdateItem(idx, updated)}
                    onRemove={() => onRemoveItem(idx)}
                    disabled={disabled}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationItemsTable;
