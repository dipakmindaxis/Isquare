import React, { useState } from "react";
import { X, Hash, MapPin, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCustomerArea } from "../Services/CustomerAreaService";
import type { CustomerAreaCreatePayload } from "../Types/CustomerAreaTypes";

interface AddCustomerAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerAreaModal: React.FC<AddCustomerAreaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerAreaCreatePayload>({
    areaCode: "",
    areaName: "",
    isActive: true,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      areaCode: "",
      areaName: "",
      isActive: true,
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
    if (!formData.areaCode.trim()) {
      toast.error("Area code is required.");
      return;
    }
    if (!formData.areaName.trim()) {
      toast.error("Area name is required.");
      return;
    }

    setIsLoading(true);
    try {
      await createCustomerArea({
        areaCode: formData.areaCode.trim(),
        areaName: formData.areaName.trim(),
        isActive: formData.isActive,
      });
      toast.success("Customer area created successfully");
      onSuccess();
      handleClose();
    } catch {
      toast.error("Failed to create customer area");
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
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Customer Area
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register customer territory, zone, or geographical area
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Area Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Hash size={16} />
                </span>
                <input
                  type="text"
                  name="areaCode"
                  value={formData.areaCode}
                  onChange={handleChange}
                  placeholder="e.g., NORTH, MUM-EAST, ZONE-1"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Area Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                  placeholder="e.g., North Region, Mumbai East, Industrial Zone"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                  required
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
              className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#00234a] hover:bg-[#001833] text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isLoading ? "Saving..." : "Add Customer Area"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerAreaModal;
