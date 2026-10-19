import React, { useState, useEffect } from "react";
import { X, Hash, Share2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getCustomerSourceById } from "../Services/CustomerSourceService";
import type { CustomerSource } from "../Types/CustomerSourceTypes";

interface ViewCustomerSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerSource: CustomerSource | null;
}

const ViewCustomerSourceModal: React.FC<ViewCustomerSourceModalProps> = ({
  isOpen,
  onClose,
  customerSource,
}) => {
  const [data, setData] = useState<CustomerSource | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && customerSource) {
      const fetchDetails = async (): Promise<void> => {
        setIsLoading(true);
        try {
          const detail = await getCustomerSourceById(customerSource.customerSourceId);
          setData(detail);
        } catch {
          setData(customerSource);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, customerSource]);

  if (!isOpen || !customerSource) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Customer Source Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View customer source information
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

        {/* Content */}
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin text-[#FF7900]" size={24} />
            <span>Loading details...</span>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Hash size={14} className="text-[#FF7900]" />
                  <span>Source Code</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {data?.sourceCode || "—"}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Share2 size={14} className="text-[#FF7900]" />
                  <span>Source Name</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {data?.sourceName || "—"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  data?.isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {data?.isActive ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    <span>Inactive</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerSourceModal;
