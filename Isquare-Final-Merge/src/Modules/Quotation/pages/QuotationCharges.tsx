import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw, Receipt, X } from "lucide-react";
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
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Receipt size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Quotation Charges
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                Rate Masters
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure incidental fees, packaging, calibration, testing and inspection rate lists.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Named Charges
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCharges}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
            title="Refresh charges list"
          >
            <RefreshCw size={14} className="text-[#FF7900]" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Add Named Charge</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white font-bold uppercase text-[12px] tracking-wider">
                <th className="p-3.5 border-r border-[#e06800]">Charge Name</th>
                <th className="p-3.5 border-r border-[#e06800]">Description</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Type</th>
                <th className="p-3.5 text-right border-r border-[#e06800]">Amount</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">Taxable</th>
                <th className="p-3.5 text-center border-r border-[#e06800]">GST %</th>
                <th className="p-3.5 text-right border-r border-[#e06800]">Computed Total (₹)</th>
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
                    <tr key={ch.quotationChargeId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[52px]">
                      <td className="p-3.5 font-bold text-gray-900">{ch.chargeName}</td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">
                        {ch.description || "—"}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800">
                          {ch.chargeType}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-medium text-gray-800">
                        {ch.chargeType === "Percentage" ? `${ch.chargeAmount}%` : formatINR(ch.chargeAmount)}
                      </td>
                      <td className="p-3.5 text-center">
                        {ch.isTaxable ? (
                          <span className="text-emerald-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-medium">{ch.isTaxable ? `${ch.taxRate}%` : "0%"}</td>
                      <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                        {formatINR(total)}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(ch)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition cursor-pointer shadow-2xs"
                          title="Edit Charge"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setChargeToDelete(ch);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition cursor-pointer shadow-2xs"
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

      {/* Add / Edit Modal matching Customer Master style */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-[#FF7900] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-bold text-white">
                {editingCharge ? "Edit Quotation Charge" : "Add Named Quotation Charge"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Charge Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calibration & Certification"
                  value={chargeName}
                  onChange={(e) => setChargeName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Charge Type
                  </label>
                  <select
                    value={chargeType}
                    onChange={(e) => setChargeType(e.target.value as "Fixed" | "Percentage")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs cursor-pointer"
                  >
                    <option value="Fixed">Fixed Amount (₹)</option>
                    <option value="Percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Amount {chargeType === "Percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-right text-xs font-semibold text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTaxable}
                    onChange={(e) => setIsTaxable(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer"
                  />
                  <span>Subject to GST Tax</span>
                </label>

                {isTaxable && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-700">GST %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs p-1.5 border border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:border-[#FF7900]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
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

