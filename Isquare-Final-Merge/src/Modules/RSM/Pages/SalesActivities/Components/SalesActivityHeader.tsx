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
    <div className="bg-gradient-to-r from-[#FFF5EC] via-[#FFF9F4] to-[#FFF4EB] border border-[#FED7AA]/60 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div className="w-full md:w-auto relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="bg-[#FFE8D6] text-[#FF7900] p-3 rounded-2xl shadow-xs shrink-0 flex items-center justify-center w-14 h-14">
            <FaTasks size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] tracking-tight">
              Sales Activities
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
              Manage customer visits, calls, meetings, and sales activities
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto relative z-10">
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-[#082B50] bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[40px] cursor-pointer"
          >
            <FaFileExcel className="text-emerald-600 text-sm" />
            <span>Export</span>
          </button>
        )}
        <button
          type="button"
          onClick={onAddNew}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF7900] hover:bg-[#e06800] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-orange-500/25 active:scale-95 min-h-[40px] cursor-pointer"
        >
          <FaPlus size={12} />
          <span>Record Activity</span>
        </button>
      </div>
    </div>
  );
};

export default SalesActivityHeader;

