import React from "react";
import { X, CheckCircle2, Hash, CheckCircle, XCircle } from "lucide-react";
import type { TaskStatus } from "../Types/TaskStatusTypes";

interface ViewTaskStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus | null;
}

export const ViewTaskStatusModal: React.FC<ViewTaskStatusModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  if (!isOpen || !status) return null;

  const isActive = !status.isDeleted;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Task Status Details
              </h2>
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
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Hash size={13} className="text-[#FF7900]" />
                <span>Status ID</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{status.id}</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {isActive ? (
                  <CheckCircle size={13} className="text-emerald-600" />
                ) : (
                  <XCircle size={13} className="text-red-500" />
                )}
                <span>Status</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status Name
            </p>
            <p className="text-base font-bold text-gray-900">
              {status.statusName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ViewTaskStatusModal;
