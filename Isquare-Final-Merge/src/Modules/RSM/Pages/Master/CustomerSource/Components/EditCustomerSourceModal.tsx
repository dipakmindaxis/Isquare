import React, { useState, useEffect } from "react";
import { X, Hash, Share2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getCustomerSourceById,
  updateCustomerSource,
} from "../Services/CustomerSourceService";
import type { CustomerSource } from "../Types/CustomerSourceTypes";

interface EditCustomerSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerSource: CustomerSource;
}

const EditCustomerSourceModal: React.FC<EditCustomerSourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerSource,
}) => {
  const [sourceCode, setSourceCode] = useState<string>("");
  const [sourceName, setSourceName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && customerSource) {
      const fetchDetails = async (): Promise<void> => {
        setIsLoading(true);
        try {
          const data = await getCustomerSourceById(customerSource.customerSourceId);
          setSourceCode(data.sourceCode || "");
          setSourceName(data.sourceName || "");
          setIsActive(data.isActive ?? true);
        } catch {
          setSourceCode(customerSource.sourceCode || "");
          setSourceName(customerSource.sourceName || "");
          setIsActive(customerSource.isActive ?? true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [isOpen, customerSource]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      toast.error("Source code cannot be empty.");
      return;
    }
    if (!sourceName.trim()) {
      toast.error("Source name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await updateCustomerSource(customerSource.customerSourceId, {
        customerSourceId: customerSource.customerSourceId,
        sourceCode: sourceCode.trim(),
        sourceName: sourceName.trim(),
        isActive,
      });
      toast.success("Customer source updated successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update customer source.");
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
              <div className="w-11 h-11 bg-slate-100 text-[#00234a] rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Customer Source
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update customer source details and active status
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
              <Loader2 className="animate-spin text-[#00234a]" size={24} />
              <span>Loading details...</span>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Source Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    placeholder="e.g., WEB, REF"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Source Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Share2 size={16} />
                  </span>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g., Website, Referral"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00234a] focus:border-[#00234a] transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="editCustomerSourceIsActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#00234a] rounded border-gray-300 focus:ring-[#00234a] cursor-pointer"
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
              className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#00234a] hover:bg-[#001833] text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

export default EditCustomerSourceModal;
