import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  IndianRupee,
  Calculator,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { QuotationCharge } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";

interface QuotationPricingProps {
  freightCharges: number;
  installationCharges: number;
  otherCharges: number;
  charges: QuotationCharge[];
  freightType?: string;
  installationType?: string;
  otherChargesDescription?: string;
  onChange: (fields: {
    freightCharges?: number;
    installationCharges?: number;
    otherCharges?: number;
    charges?: QuotationCharge[];
    freightType?: string;
    installationType?: string;
    otherChargesDescription?: string;
  }) => void;
  disabled?: boolean;
}

export const QuotationPricing: React.FC<QuotationPricingProps> = ({
  freightCharges = 0,
  installationCharges = 0,
  otherCharges = 0,
  charges = [],
  freightType = "Custom value",
  installationType = "Custom value",
  otherChargesDescription = "Standard Packaging & Handling",
  onChange,
  disabled = false,
}) => {
  // Local state to preserve custom numeric values when toggling between dropdown options
  const [selectedFreightType, setSelectedFreightType] = useState<string>(
    freightType || (freightCharges > 0 ? "Custom value" : "Inclusive")
  );
  const [lastCustomFreight, setLastCustomFreight] = useState<number>(
    freightCharges > 0 ? freightCharges : 1500
  );

  const [selectedInstallationType, setSelectedInstallationType] = useState<string>(
    installationType || (installationCharges > 0 ? "Custom value" : "At your scope")
  );
  const [lastCustomInstallation, setLastCustomInstallation] = useState<number>(
    installationCharges > 0 ? installationCharges : 2500
  );

  const [otherDesc, setOtherDesc] = useState<string>(
    otherChargesDescription || "Standard Packaging & Handling"
  );

  // Synchronize when external props change
  useEffect(() => {
    if (freightType) {
      setSelectedFreightType(freightType);
    }
    if (freightCharges > 0) {
      setLastCustomFreight(freightCharges);
    }
  }, [freightType, freightCharges]);

  useEffect(() => {
    if (installationType) {
      setSelectedInstallationType(installationType);
    }
    if (installationCharges > 0) {
      setLastCustomInstallation(installationCharges);
    }
  }, [installationType, installationCharges]);

  useEffect(() => {
    if (otherChargesDescription) {
      setOtherDesc(otherChargesDescription);
    }
  }, [otherChargesDescription]);

  // Handle Freight dropdown change
  const handleFreightTypeChange = (newType: string) => {
    setSelectedFreightType(newType);
    if (newType === "Custom value") {
      onChange({
        freightType: newType,
        freightCharges: lastCustomFreight,
      });
    } else {
      onChange({
        freightType: newType,
        freightCharges: 0,
      });
    }
  };

  // Handle custom freight amount input
  const handleFreightAmountChange = (valStr: string) => {
    const val = Math.max(0, parseFloat(valStr) || 0);
    setLastCustomFreight(val);
    onChange({
      freightCharges: val,
      freightType: "Custom value",
    });
  };

  // Handle Installation dropdown change
  const handleInstallationTypeChange = (newType: string) => {
    setSelectedInstallationType(newType);
    if (newType === "Custom value") {
      onChange({
        installationType: newType,
        installationCharges: lastCustomInstallation,
      });
    } else {
      onChange({
        installationType: newType,
        installationCharges: 0,
      });
    }
  };

  // Handle custom installation amount input
  const handleInstallationAmountChange = (valStr: string) => {
    const val = Math.max(0, parseFloat(valStr) || 0);
    setLastCustomInstallation(val);
    onChange({
      installationCharges: val,
      installationType: "Custom value",
    });
  };

  // Handle Other Charges description input
  const handleOtherDescChange = (newDesc: string) => {
    setOtherDesc(newDesc);
    onChange({ otherChargesDescription: newDesc });
  };

  // Handle Other Charges amount input
  const handleOtherAmountChange = (valStr: string) => {
    const val = Math.max(0, parseFloat(valStr) || 0);
    onChange({ otherCharges: val });
  };

  // Named charges management
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
      {/* Header matching Customer Master reference */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-orange-50 border border-[#FF7900]/30 flex items-center justify-center text-[#FF7900] shrink-0 shadow-xs">
          <Calculator size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
            Pricing &amp; Charges
          </h4>
          <p className="text-xs text-gray-500">
            Configure freight, installation and custom charges
          </p>
        </div>
      </div>

      {/* 3-Column Responsive Grid matching Reference Customer Master */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. FREIGHT CHARGES CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5 space-y-3.5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              FREIGHT CHARGES
            </label>
            <select
              value={selectedFreightType}
              onChange={(e) => handleFreightTypeChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-pointer shadow-xs"
            >
              <option value="Custom value">Custom value</option>
              <option value="Extra at actual">Extra at actual</option>
              <option value="Inclusive">Inclusive</option>
              <option value="To-pay basis">To-pay basis</option>
            </select>

            {selectedFreightType === "Custom value" ? (
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Freight Amount (₹)
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
                    onChange={(e) => handleFreightAmountChange(e.target.value)}
                    disabled={disabled}
                    placeholder="1500"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-lg text-xs text-orange-950 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#FF7900]">
                  <Info size={14} className="text-[#FF7900] shrink-0" />
                  <span>Freight Terms: {selectedFreightType}</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  {selectedFreightType === "Extra at actual" &&
                    "Freight charges billed extra at actual receipt upon dispatch."}
                  {selectedFreightType === "Inclusive" &&
                    "Freight included within the quoted item unit rates."}
                  {selectedFreightType === "To-pay basis" &&
                    "Freight payable by customer directly to carrier on delivery."}
                </p>
                <div className="pt-0.5 text-right font-mono font-bold text-xs text-[#00234a]">
                  ₹0 added to quotation
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100 pt-2.5">
            <span>Effective Freight:</span>
            <span className="font-mono font-bold text-gray-800">
              {formatINR(freightCharges)}
            </span>
          </div>
        </div>

        {/* 2. INSTALLATION CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5 space-y-3.5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              INSTALLATION
            </label>
            <select
              value={selectedInstallationType}
              onChange={(e) => handleInstallationTypeChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-pointer shadow-xs"
            >
              <option value="Custom value">Custom value</option>
              <option value="At your scope">At your scope</option>
            </select>

            {selectedInstallationType === "Custom value" ? (
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Installation Charges (₹)
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
                      handleInstallationAmountChange(e.target.value)
                    }
                    disabled={disabled}
                    placeholder="2500"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Installation: Customer Scope</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Installation and commissioning handled under buyer/site scope.
                </p>
                <div className="pt-0.5 text-right font-mono font-bold text-xs text-[#00234a]">
                  ₹0 added to quotation
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100 pt-2.5">
            <span>Effective Installation:</span>
            <span className="font-mono font-bold text-gray-800">
              {formatINR(installationCharges)}
            </span>
          </div>
        </div>

        {/* 3. OTHER CHARGES (DESC & AMOUNT) CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5 space-y-3.5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              OTHER CHARGES (DESC &amp; AMOUNT)
            </label>
            <input
              type="text"
              value={otherDesc}
              onChange={(e) => handleOtherDescChange(e.target.value)}
              disabled={disabled}
              placeholder="Standard Packaging & Handling"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
            />

            <div className="pt-1">
              <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                Charge Amount (₹)
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
                  onChange={(e) => handleOtherAmountChange(e.target.value)}
                  disabled={disabled}
                  placeholder="800"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100 pt-2.5">
            <span>Effective Other Charge:</span>
            <span className="font-mono font-bold text-gray-800">
              {formatINR(otherCharges)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Named Quotation Charges (Contract & Line-Item charges) */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">
              Additional Named Charges
            </h4>
            <p className="text-xs text-gray-500">
              Optional itemized charges with custom tax rates (Packaging, Calibration, Inspection fees)
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleAddCharge}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#00234a] hover:bg-[#FF7900] text-white transition cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Named Charge</span>
            </button>
          )}
        </div>

        {charges.length === 0 ? (
          <div className="p-4 bg-gray-50/80 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-500">
            No additional named charges specified. Standard freight, installation, and other charges will be applied.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FF7900] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 border-r border-[#e06800]">Charge Name</th>
                  <th className="p-3 border-r border-[#e06800]">Description</th>
                  <th className="p-3 w-28 border-r border-[#e06800]">Type</th>
                  <th className="p-3 w-28 text-right border-r border-[#e06800]">Amount (₹)</th>
                  <th className="p-3 w-24 text-center border-r border-[#e06800]">Taxable?</th>
                  <th className="p-3 w-24 text-center border-r border-[#e06800]">Tax %</th>
                  <th className="p-3 w-28 text-right border-r border-[#e06800]">Total (₹)</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charges.map((ch, idx) => {
                  const amt = Number(ch.chargeAmount) || 0;
                  const taxRate = ch.isTaxable ? Number(ch.taxRate) || 0 : 0;
                  const tax = amt * (taxRate / 100);
                  const total = amt + tax;

                  return (
                    <tr key={idx} className="hover:bg-[#f0f7ff] transition">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={ch.chargeName}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              chargeName: e.target.value,
                            })
                          }
                          disabled={disabled}
                          placeholder="Charge Name"
                          className="w-full text-xs py-1.5 px-2.5 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={ch.description || ""}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              description: e.target.value,
                            })
                          }
                          disabled={disabled}
                          placeholder="Optional description"
                          className="w-full text-xs py-1.5 px-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={ch.chargeType}
                          onChange={(e) =>
                            handleUpdateCharge(idx, {
                              ...ch,
                              chargeType: e.target.value as
                                | "Fixed"
                                | "Percentage",
                            })
                          }
                          disabled={disabled}
                          className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF7900]"
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
                          className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg text-right font-semibold focus:outline-none focus:border-[#FF7900]"
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
                          className="h-4 w-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
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
                          className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:border-[#FF7900] disabled:bg-gray-100"
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
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Remove charge"
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
