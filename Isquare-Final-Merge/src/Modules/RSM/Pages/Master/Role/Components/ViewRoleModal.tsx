import React from "react";
import { X, ShieldCheck, Hash } from "lucide-react";
import type { Role } from "../Types/RoleTypes";

interface ViewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

const ViewRoleModal: React.FC<ViewRoleModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Role Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Overview of role configuration
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
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              Role Identifier / ID
            </div>
            <p className="text-sm font-bold text-gray-800 break-all">
              {role.id || "-"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              Role Name
            </div>
            <p className="text-lg font-bold text-gray-900">{role.name}</p>
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

export default ViewRoleModal;
