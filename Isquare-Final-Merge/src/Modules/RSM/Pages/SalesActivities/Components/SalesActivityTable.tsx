import React from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Mail,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash, FaTasks } from "react-icons/fa";
import type { SalesActivity } from "../Types/SalesActivityTypes";
import {
  ActivityTypeBadge,
  ActivityStatusBadge,
} from "./ActivityTypeBadge";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

interface SalesActivityTableProps {
  activities: SalesActivity[];
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (activity: SalesActivity) => void;
  onEdit: (activity: SalesActivity) => void;
  onDelete: (activity: SalesActivity) => void;
  onAddNew: () => void;
}

export const SalesActivityTable: React.FC<SalesActivityTableProps> = ({
  activities,
  isLoading,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = activities.slice(startIndex, startIndex + itemsPerPage);

  const isDateOverdue = (dateString?: string, status?: string) => {
    const norm = (status || "").toLowerCase();
    if (!dateString || norm === "completed" || norm === "complete" || norm === "cancelled")
      return false;
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  };

  const isDateToday = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] p-5 md:p-6">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FF7900] text-white">
            <tr className="h-[50px] min-h-[50px]">
              <th className="px-3 py-0 h-[50px] text-center text-[13px] font-semibold text-white border-r border-[#e06800] w-[60px] tracking-normal align-middle">
                Sr.
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[130px] align-middle">
                Activity / Code
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[200px] align-middle">
                Subject & Notes
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[170px] align-middle">
                Customer & Contact
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[150px] align-middle">
                Email ID
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[120px] align-middle">
                Assigned Rep
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[115px] align-middle">
                Date & Time
              </th>
              <th className="px-3 py-0 h-[50px] text-center text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[100px] align-middle">
                Status
              </th>
              <th className="px-3 py-0 h-[50px] text-left text-[13px] font-semibold text-white border-r border-[#e06800] tracking-normal min-w-[115px] align-middle">
                Next Action
              </th>
              <th className="px-3 py-0 h-[50px] text-center text-[13px] font-semibold text-white tracking-normal min-w-[120px] align-middle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-500">
                      Loading sales activities...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <FaTasks size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No sales activities found</p>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => {
                const overdue = isDateOverdue(item.nextActionDate, item.status);
                const dueToday = isDateToday(item.nextActionDate);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#d9dde5] hover:bg-slate-50 transition-colors duration-150 min-h-[52px]"
                  >
                    {/* Sr No */}
                    <td className="px-3 py-2.5 text-center text-[13px] text-slate-500 font-medium border-r border-[#d9dde5]">
                      {startIndex + idx + 1}
                    </td>

                    {/* Activity Type & Code */}
                    <td className="px-3 py-2.5 align-middle border-r border-[#d9dde5]">
                      <div className="space-y-1">
                        <ActivityTypeBadge type={item.activityType} />
                        <div className="text-[11px] font-mono text-slate-400">
                          {item.activityCode}
                        </div>
                      </div>
                    </td>

                    {/* Subject & Notes */}
                    <td className="px-3 py-2.5 align-middle border-r border-[#d9dde5]">
                      <div className="w-full min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onView(item)}
                            className="text-left font-semibold text-[#172B4D] hover:text-[#153E63] text-[13px] leading-snug break-words line-clamp-1 transition cursor-pointer"
                          >
                            {item.subject}
                          </button>
                          {item.priority && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                                item.priority.toLowerCase() === "urgent"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : item.priority.toLowerCase() === "high"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : item.priority.toLowerCase() === "medium"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 break-words">
                          {item.discussionNotes || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Customer & Contact */}
                    <td className="px-3 py-2.5 align-middle border-r border-[#d9dde5]">
                      <div className="w-full min-w-0 pr-1">
                        <div className="font-semibold text-[#172B4D] text-[13px] truncate">
                          {item.customerName}
                        </div>
                        {item.contactPerson && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            ({item.contactPerson})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Email / Email ID */}
                    <td className="px-3 py-2.5 align-middle border-r border-[#d9dde5]">
                      {item.contactEmail ? (
                        <a
                          href={`mailto:${item.contactEmail}`}
                          className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-800 hover:underline max-w-[170px] truncate"
                          title={item.contactEmail}
                        >
                          <Mail size={12} className="shrink-0 text-slate-400" />
                          <span className="truncate">{item.contactEmail}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[12px]">—</span>
                      )}
                    </td>

                    {/* Assigned Sales Representative / Functional Team */}
                    <td className="px-3 py-2.5 align-middle text-[13px] text-slate-600 font-medium border-r border-[#d9dde5]">
                      {item.assignedType === "Team" && item.assignedTeamName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.assignedTeamName}
                        </span>
                      ) : (
                        <span>{item.assignedEmployeeName || "-"}</span>
                      )}
                    </td>

                    {/* Activity Date & Time */}
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[12.5px] text-slate-600 font-medium border-r border-[#d9dde5]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{item.activityDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>{item.activityTime}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap border-r border-[#d9dde5]">
                      <ActivityStatusBadge status={item.status} />
                    </td>

                    {/* Next Action Date & Alert */}
                    <td className="px-3 py-2.5 align-middle border-r border-[#d9dde5]">
                      {item.nextActionDate ? (
                        <div>
                          <div
                            className={`flex items-center gap-1 text-[12.5px] font-medium ${
                              overdue
                                ? "text-rose-600 font-semibold"
                                : dueToday
                                ? "text-amber-600 font-semibold"
                                : "text-slate-600"
                            }`}
                          >
                            {(overdue || dueToday) && (
                              <AlertCircle size={13} className="shrink-0" />
                            )}
                            <span>{item.nextActionDate}</span>
                          </div>
                          {item.nextActionDetails && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[140px] mt-0.5">
                              {item.nextActionDetails}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[12px]">—</span>
                      )}
                    </td>

                    {/* Actions matching EmployeeMaster exactly */}
                    <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit Activity"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete Activity"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls matching Employee Master */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-[#d9dde5] text-xs text-slate-600 bg-white">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:outline-none focus:border-[#153E63]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <span>
          {activities.length === 0
            ? "0-0 of 0"
            : `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, activities.length)} of ${activities.length}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="p-1.5 border border-slate-200 rounded bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
