import React from "react";
import { FaPlus, FaFileExcel, FaTasks } from "react-icons/fa";

interface SalesActivityHeaderProps {
  onAddNew: () => void;
  onExport?: () => void;
}

export const SalesActivityHeader: React.FC<SalesActivityHeaderProps> = ({
  onAddNew,
  onExport,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="w-full md:w-auto">
        <div className="flex items-center gap-3">
          <div className="bg-[#154068] text-white p-2.5 rounded-xl shadow-md shrink-0">
            <FaTasks size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Sales Activities
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage customer visits, calls, meetings, and sales activities
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95 min-h-[38px] cursor-pointer"
          >
            <FaFileExcel className="text-emerald-600 text-sm" />
            <span>Export</span>
          </button>
        )}
        <button
          type="button"
          onClick={onAddNew}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#154068] hover:bg-[#103050] text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 min-h-[38px] cursor-pointer"
        >
          <FaPlus size={12} />
          <span>Record Activity</span>
        </button>
      </div>
    </div>
  );
};

export default SalesActivityHeader;

