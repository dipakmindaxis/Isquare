import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { quotationChargeService } from "../services/quotationService";
import type { QuotationCharge, CreateQuotationChargeDto } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";

export const QuotationCharges: React.FC = () => {
  const [charges, setCharges] = useState<QuotationCharge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCharge, setEditingCharge] = useState<QuotationCharge | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [chargeToDelete, setChargeToDelete] = useState<QuotationCharge | null>(null);

  // Form fields
  const [quotationId, setQuotationId] = useState<number>(1);
  const [chargeName, setChargeName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [chargeType, setChargeType] = useState<"Fixed" | "Percentage">("Fixed");
  const [chargeAmount, setChargeAmount] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [isTaxable, setIsTaxable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCharges = async () => {
    setIsLoading(true);
    try {
      const data = await quotationChargeService.getAll();
      setCharges(data);
    } catch (e) {
      console.error("Failed to load charges:", e);
      toast.error("Failed to fetch charges from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleOpenAdd = () => {
    setEditingCharge(null);
    setQuotationId(1);
    setChargeName("Calibration & Certification");
    setDescription("Factory calibration with ISO traceability certificate");
    setChargeType("Fixed");
    setChargeAmount(2500);
    setTaxRate(18);
    setIsTaxable(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (ch: QuotationCharge) => {
    setEditingCharge(ch);
    setQuotationId(ch.quotationId || 1);
    setChargeName(ch.chargeName);
    setDescription(ch.description || "");
    setChargeType(ch.chargeType);
    setChargeAmount(ch.chargeAmount);
    setTaxRate(ch.taxRate);
    setIsTaxable(ch.isTaxable);
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeName.trim()) {
      toast.error("Charge name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateQuotationChargeDto = {
        quotationId,
        chargeName,
        description,
        chargeType,
        chargeAmount,
        taxRate,
        isTaxable,
      };

      if (editingCharge) {
        await quotationChargeService.update(editingCharge.quotationChargeId, payload);
        toast.success(`Charge '${chargeName}' updated successfully`);
      } else {
        await quotationChargeService.create(payload);
        toast.success(`Charge '${chargeName}' created successfully`);
      }
      setModalOpen(false);
      fetchCharges();
    } catch (err) {
      toast.error("Failed to save charge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!chargeToDelete) return;
    try {
      await quotationChargeService.delete(chargeToDelete.quotationChargeId);
      toast.success(`Charge '${chargeToDelete.chargeName}' deleted`);
      setCharges(charges.filter((c) => c.quotationChargeId !== chargeToDelete.quotationChargeId));
      setDeleteModalOpen(false);
      setChargeToDelete(null);
    } catch (e) {
      toast.error("Failed to delete charge");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Quotation Charges Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure incidental fees, packaging, calibration, testing and inspection rate lists
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCharges}
            className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition"
          >
            <Plus size={15} />
            <span>Add Named Charge</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Charge Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-center">Type</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Taxable</th>
                <th className="p-3.5 text-center">GST %</th>
                <th className="p-3.5 text-right">Computed Total (₹)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    Loading commercial charges from API...
                  </td>
                </tr>
              ) : charges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    No custom commercial charges configured yet. Click "Add Named Charge" to configure.
                  </td>
                </tr>
              ) : (
                charges.map((ch) => {
                  const amt = Number(ch.chargeAmount) || 0;
                  const gst = ch.isTaxable ? Number(ch.taxRate) || 0 : 0;
                  const total = amt + amt * (gst / 100);

                  return (
                    <tr key={ch.quotationChargeId} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-gray-900">{ch.chargeName}</td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">
                        {ch.description || "—"}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                          {ch.chargeType}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-medium">
                        {ch.chargeType === "Percentage" ? `${ch.chargeAmount}%` : formatINR(ch.chargeAmount)}
                      </td>
                      <td className="p-3.5 text-center">
                        {ch.isTaxable ? (
                          <span className="text-emerald-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">{ch.isTaxable ? `${ch.taxRate}%` : "0%"}</td>
                      <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                        {formatINR(total)}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(ch)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition"
                          title="Edit Charge"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setChargeToDelete(ch);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition"
                          title="Delete Charge"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingCharge ? "Edit Quotation Charge" : "Add Named Quotation Charge"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Charge Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calibration & Certification"
                  value={chargeName}
                  onChange={(e) => setChargeName(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Charge Type
                  </label>
                  <select
                    value={chargeType}
                    onChange={(e) => setChargeType(e.target.value as "Fixed" | "Percentage")}
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
                  >
                    <option value="Fixed">Fixed Amount (₹)</option>
                    <option value="Percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Amount {chargeType === "Percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-right text-sm font-semibold focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTaxable}
                    onChange={(e) => setIsTaxable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Subject to GST Tax</span>
                </label>

                {isTaxable && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-700">GST %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCharge ? "Update Charge" : "Create Charge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Quotation Charge"
        message={`Are you sure you want to delete '${chargeToDelete?.chargeName}'?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteModalOpen(false);
          setChargeToDelete(null);
        }}
      />
    </div>
  );
};

export default QuotationCharges;
