import React from "react";
import { X, History, Calendar, User, FileText, CheckCircle2 } from "lucide-react";
import type { TaskHistoryItem } from "../Types/TaskHistoryTypes";

interface ViewTaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TaskHistoryItem | null;
}

export const ViewTaskHistoryModal: React.FC<ViewTaskHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  if (!isOpen || !history) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#FF7900] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Task History Details</h2>
              <p className="text-xs text-orange-100">Log #{history.historyId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs text-gray-700">
          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-[#FF7900] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">
                Activity
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{history.activity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <FileText size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Task</span>
              </div>
              <p className="font-semibold text-gray-800 break-words">{history.taskTitle || `Task #${history.taskId}`}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <User size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Performed By</span>
              </div>
              <p className="font-semibold text-gray-800">{history.performedByName || `Employee #${history.performedBy}`}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Calendar size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Date & Time</span>
            </div>
            <p className="font-semibold text-gray-800">
              {history.performedDate ? new Date(history.performedDate).toLocaleString() : "-"}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
              Remarks / Discussion
            </p>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {history.remarks || "No remarks provided."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
