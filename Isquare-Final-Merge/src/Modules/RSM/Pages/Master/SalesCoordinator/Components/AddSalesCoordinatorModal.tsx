import React, { useState } from "react";
import { X, Hash, UserCheck, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createSalesCoordinator } from "../Services/SalesCoordinatorService";
import type { SalesCoordinatorCreatePayload } from "../Types/SalesCoordinatorTypes";

interface AddSalesCoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSalesCoordinatorModal: React.FC<AddSalesCoordinatorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SalesCoordinatorCreatePayload>({
    salesCoordinatorCode: "",
    salesCoordinatorName: "",
    isActive: true,
    isDeleted: false,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      salesCoordinatorCode: "",
      salesCoordinatorName: "",
      isActive: true,
      isDeleted: false,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.salesCoordinatorCode.trim()) {
      toast.error("Sales coordinator code is required.");
      return;
    }
    if (!formData.salesCoordinatorName.trim()) {
      toast.error("Sales coordinator name is required.");
      return;
    }

    setIsLoading(true);
    try {
      await createSalesCoordinator({
        salesCoordinatorCode: formData.salesCoordinatorCode.trim(),
        salesCoordinatorName: formData.salesCoordinatorName.trim(),
        isActive: formData.isActive,
        isDeleted: false,
      });
      toast.success("Sales Coordinator created successfully");
      onSuccess();
      handleClose();
    } catch {
      toast.error("Failed to create sales coordinator");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#FF7900]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Sales Coordinator
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register new sales coordinator details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="salesCoordinatorCode"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Coordinator Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="salesCoordinatorCode"
                  name="salesCoordinatorCode"
                  type="text"
                  required
                  placeholder="e.g. SC001"
                  value={formData.salesCoordinatorCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900] transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="salesCoordinatorName"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Coordinator Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="salesCoordinatorName"
                  name="salesCoordinatorName"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.salesCoordinatorName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900] transition"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF7900] bg-gray-100 border-gray-300 rounded focus:ring-[#FF7900]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Set as Active
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#FF7900] hover:bg-[#e06800] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Coordinator</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalesCoordinatorModal;
