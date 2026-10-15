import React, { useState } from "react";
import { X, Hash, UserCheck, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCustomerStatus } from "../Services/CustomerStatusService";
import type { CustomerStatusCreatePayload } from "../Types/CustomerStatusTypes";

interface AddCustomerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerStatusModal: React.FC<AddCustomerStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerStatusCreatePayload>({
    statusCode: "",
    statusName: "",
    description: "",
    isActive: true,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      statusCode: "",
      statusName: "",
      description: "",
      isActive: true,
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.statusCode.trim()) {
      toast.error("Status code is required.");
      return;
    }
    if (!formData.statusName.trim()) {
      toast.error("Status name is required.");
      return;
    }

    setIsLoading(true);
    try {
      await createCustomerStatus({
        statusCode: formData.statusCode.trim(),
        statusName: formData.statusName.trim(),
        description: formData.description?.trim() || "",
        isActive: formData.isActive,
      });
      toast.success("Customer status created successfully");
      onSuccess();
      handleClose();
    } catch {
      toast.error("Failed to create customer status");
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
              <div className="w-11 h-11 bg-slate-100 text-[#00234a] rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Customer Status
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define customer status code, title, and description
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Status Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Hash size={16} />
                </span>
                <input
                  type="text"
                  name="statusCode"
                  value={formData.statusCode}
                  onChange={handleChange}
                  placeholder="e.g., ACT, INACT, PEND"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Status Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <UserCheck size={16} />
                </span>
                <input
                  type="text"
                  name="statusName"
                  value={formData.statusName}
                  onChange={handleChange}
                  placeholder="e.g., Active, Onboarding, Suspended"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <div className="relative">
                <span className="absolute top-3 left-0 flex items-start pl-3.5 text-gray-400">
                  <FileText size={16} />
                </span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the customer status..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition resize-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00234a] rounded border-gray-300 focus:ring-[#00234a] cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Status
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#00234a] hover:bg-[#001833] text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isLoading ? "Saving..." : "Add Customer Status"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerStatusModal;
