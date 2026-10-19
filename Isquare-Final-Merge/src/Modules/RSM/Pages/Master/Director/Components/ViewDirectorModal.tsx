import React from "react";
import { X, User, Hash, CheckCircle2, XCircle } from "lucide-react";
import type { Director } from "../Types/DirectorTypes";

interface ViewDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  director: Director | null;
}

const ViewDirectorModal: React.FC<ViewDirectorModalProps> = ({
  isOpen,
  onClose,
  director,
}) => {
  if (!isOpen || !director) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Director Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Overview of director profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                Director ID
              </div>
              <p className="text-base font-bold text-gray-900">
                #{director.directorId}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                Director Code
              </div>
              <p className="text-base font-bold text-[#FF7900]">
                {director.directorCode || "-"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Director Name
            </div>
            <p className="text-lg font-bold text-gray-900">
              {director.directorName}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                director.isActive
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {director.isActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  Inactive
                </>
              )}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 pt-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDirectorModal;
