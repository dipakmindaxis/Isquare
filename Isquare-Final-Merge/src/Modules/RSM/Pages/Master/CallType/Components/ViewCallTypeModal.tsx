import React, { useState, useEffect } from "react";
import { X, Hash, PhoneCall, Loader2, CheckCircle, XCircle } from "lucide-react";
import { getCallTypeById } from "../Services/CallTypeService";
import type { CallType } from "../Types/CallTypeTypes";

interface ViewCallTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: CallType | null;
}

const ViewCallTypeModal: React.FC<ViewCallTypeModalProps> = ({
  isOpen,
  onClose,
  callType,
}) => {
  const [data, setData] = useState<CallType | null>(callType);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && callType) {
      const fetchDetails = async (): Promise<void> => {
        setIsLoading(true);
        try {
          const detail = await getCallTypeById(callType.id);
          setData(detail);
        } catch {
          setData(callType);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, callType]);

  if (!isOpen || !callType) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-slate-100 text-[#00234a] rounded-xl flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Call Type Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View call type information and status
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
            <Loader2 className="animate-spin text-[#00234a]" size={24} />
            <span>Loading details...</span>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Hash size={14} className="text-[#00234a]" />
                  <span>ID</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {data?.id ?? "—"}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <PhoneCall size={14} className="text-[#00234a]" />
                  <span>Call Type Name</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {data?.callTypeName || "—"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
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
            className="px-6 py-2 bg-[#00234a] hover:bg-[#001833] text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCallTypeModal;
