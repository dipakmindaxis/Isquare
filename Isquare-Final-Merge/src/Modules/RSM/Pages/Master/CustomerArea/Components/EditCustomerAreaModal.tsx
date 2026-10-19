import React, { useState, useEffect } from "react";
import { X, Hash, MapPin, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getCustomerAreaById,
  updateCustomerArea,
} from "../Services/CustomerAreaService";
import type { CustomerArea } from "../Types/CustomerAreaTypes";

interface EditCustomerAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerArea: CustomerArea;
}

const EditCustomerAreaModal: React.FC<EditCustomerAreaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerArea,
}) => {
  const [areaCode, setAreaCode] = useState<string>("");
  const [areaName, setAreaName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && customerArea) {
      const fetchDetails = async (): Promise<void> => {
        setIsLoading(true);
        try {
          const data = await getCustomerAreaById(customerArea.customerAreaId);
          setAreaCode(data.areaCode || "");
          setAreaName(data.areaName || "");
          setIsActive(data.isActive ?? true);
        } catch {
          setAreaCode(customerArea.areaCode || "");
          setAreaName(customerArea.areaName || "");
          setIsActive(customerArea.isActive ?? true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [isOpen, customerArea]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!areaCode.trim()) {
      toast.error("Area code cannot be empty.");
      return;
    }
    if (!areaName.trim()) {
      toast.error("Area name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await updateCustomerArea(customerArea.customerAreaId, {
        customerAreaId: customerArea.customerAreaId,
        areaCode: areaCode.trim(),
        areaName: areaName.trim(),
        isActive,
      });
      toast.success("Customer area updated successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update customer area");
    } finally {
      setIsSaving(false);
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
                <MapPin className="w-5 h-5 text-[#FF7900]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Customer Area
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update customer area details and active status
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          {isLoading ? (
            <div className="p-12 flex justify-center items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin text-[#FF7900]" size={24} />
              <span>Loading details...</span>
            </div>
          ) : (
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
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    placeholder="e.g., MUM-NORTH"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
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
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g., North Mumbai"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="editCustomerAreaIsActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Status
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF7900] hover:bg-[#E66D00] text-white rounded-lg text-sm font-semibold transition shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerAreaModal;
