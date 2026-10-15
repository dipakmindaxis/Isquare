import React from "react";
import { Plus, Trash2, IndianRupee } from "lucide-react";
import type { QuotationCharge } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";

interface QuotationPricingProps {
  freightCharges: number;
  installationCharges: number;
  otherCharges: number;
  charges: QuotationCharge[];
  onChange: (fields: {
    freightCharges?: number;
    installationCharges?: number;
    otherCharges?: number;
    charges?: QuotationCharge[];
  }) => void;
  disabled?: boolean;
}

export const QuotationPricing: React.FC<QuotationPricingProps> = ({
  freightCharges = 0,
  installationCharges = 0,
  otherCharges = 0,
  charges = [],
  onChange,
  disabled = false,
}) => {
  const handleAddCharge = () => {
    const newCharge: QuotationCharge = {
      quotationChargeId: 0,
      quotationId: 0,
      chargeName: "Packaging & Handling",
      description: "Standard packaging and safe dispatch handling",
      chargeType: "Fixed",
      chargeAmount: 1000,
      taxRate: 18,
      taxAmount: 180,
      totalAmount: 1180,
      isTaxable: true,
      isActive: true,
    };
    onChange({ charges: [...charges, newCharge] });
  };

  const handleUpdateCharge = (index: number, updated: QuotationCharge) => {
    const next = [...charges];
    const amt = Number(updated.chargeAmount) || 0;
    const taxRate = updated.isTaxable ? Number(updated.taxRate) || 0 : 0;
    const taxAmt = amt * (taxRate / 100);
    updated.taxAmount = Number(taxAmt.toFixed(2));
    updated.totalAmount = Number((amt + taxAmt).toFixed(2));
    next[index] = updated;
    onChange({ charges: next });
  };

  const handleRemoveCharge = (index: number) => {
    onChange({ charges: charges.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Standard Commercial Charges */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 tracking-tight mb-1">
          Standard Logistics &amp; Service Charges
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Freight, transit insurance, site installation and commissioning
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Freight Charges (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IndianRupee size={14} />
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={freightCharges}
                onChange={(e) =>
                  onChange({
                    freightCharges: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-8 pr-3 text-sm font-semibold text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Installation &amp; Commissioning (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IndianRupee size={14} />
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={installationCharges}
                onChange={(e) =>
                  onChange({
                    installationCharges: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-8 pr-3 text-sm font-semibold text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Other Incidental Charges (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IndianRupee size={14} />
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={otherCharges}
                onChange={(e) =>
                  onChange({
                    otherCharges: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-8 pr-3 text-sm font-semibold text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Named Quotation Charges (QuotationCharge API) */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">
              Additional Named Charges
            </h4>
            <p className="text-xs text-gray-500">
              Configured via QuotationCharge contract (Packaging, Calibration, Inspection fees)
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleAddCharge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition"
            >
              <Plus size={13} />
              <span>Add Named Charge</span>
            </button>
          )}
        </div>

        {charges.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
            No additional named charges specified. Standard freight and installation will be applied.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-2.5">Charge Name</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 w-28">Type</th>
                  <th className="p-2.5 w-28 text-right">Amount (₹)</th>
                  <th className="p-2.5 w-24 text-center">Taxable?</th>
                  <th className="p-2.5 w-24 text-center">Tax %</th>
                  <th className="p-2.5 w-28 text-right">Total (₹)</th>
                  <th className="p-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charges.map((ch, idx) => {
                  const amt = Number(ch.chargeAmount) || 0;
                  const taxRate = ch.isTaxable ? Number(ch.taxRate) || 0 : 0;
                  const tax = amt * (taxRate / 100);
                  const total = amt + tax;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={ch.chargeName}
                          onChange={(e) =>
                            handleUpdateCharge(idx, { ...ch, chargeName: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="Charge Name"
                          className="w-full text-xs py-1 px-2 border border-gray-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={ch.description || ""}
                          onChange={(e) =>
                            handleUpdateCharge(idx, { ...ch, description: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="Optional description"
                          className="w-full text-xs py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={ch.chargeType}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              chargeType: e.target.value as "Fixed" | "Percentage",
                            })
                          }
                          disabled={disabled}
                          className="w-full text-xs py-1 px-2 border border-gray-300 rounded focus:outline-none"
                        >
                          <option value="Fixed">Fixed (₹)</option>
                          <option value="Percentage">Percentage (%)</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ch.chargeAmount}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              chargeAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={disabled}
                          className="w-full text-xs py-1 px-2 border border-gray-300 rounded text-right font-semibold focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={ch.isTaxable}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              isTaxable: e.target.checked,
                            })
                          }
                          disabled={disabled}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={ch.taxRate}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              taxRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={disabled || !ch.isTaxable}
                          className="w-full text-xs py-1 px-2 border border-gray-300 rounded text-center focus:outline-none disabled:bg-gray-100"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-gray-900">
                        {formatINR(total)}
                      </td>
                      <td className="p-2.5 text-center">
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCharge(idx)}
                            className="text-gray-400 hover:text-rose-600 transition p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationPricing;
