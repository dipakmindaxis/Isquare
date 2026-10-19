import React from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { FaEye, FaEdit, FaTrash, FaTasks } from "react-icons/fa";
import type { SalesActivity } from "../Types/SalesActivityTypes";
import {
  ActivityTypeBadge,
  ActivityStatusBadge,
} from "./ActivityTypeBadge";

const actionButtonStyles = {
  base: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow cursor-pointer",
  view: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
  edit: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
  delete: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
};

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[850px]">
          <table className="w-full text-sm">
            <thead className="bg-[#FF7900] text-white border-b border-[#e06800]">
              <tr>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Sr.
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Activity / Code
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Subject & Notes
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Customer & Contact
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Assigned Rep
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Date & Time
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Related Link
                </th>
                <th className="px-4 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.5px]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px]">
                  Next Action
                </th>
                <th className="px-4 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.5px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-gray-500">
                        Loading sales activities...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
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
                    className="hover:bg-[#f0f7ff] transition-all duration-200"
                  >
                    {/* Sr No */}
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-medium">
                      {startIndex + idx + 1}
                    </td>

                    {/* Activity Type & Code */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="space-y-1">
                        <ActivityTypeBadge type={item.activityType} />
                        <div className="text-[11px] font-mono text-gray-400">
                          {item.activityCode}
                        </div>
                      </div>
                    </td>

                    {/* Subject & Notes */}
                    <td className="px-4 py-3.5 align-middle max-w-xs">
                      <div>
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className="text-left font-semibold text-gray-900 hover:text-[#154068] hover:underline cursor-pointer line-clamp-1 text-xs"
                        >
                          {item.subject}
                        </button>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {item.discussionNotes || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Customer & Contact */}
                    <td className="px-4 py-3.5 align-middle max-w-[200px]">
                      <div>
                        <div className="font-semibold text-gray-900 text-xs truncate">
                          {item.customerName}
                        </div>
                        {item.contactPerson && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            ({item.contactPerson})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Assigned Sales Representative */}
                    <td className="px-4 py-3.5 align-middle text-xs text-gray-700">
                      {item.assignedEmployeeName || "-"}
                    </td>

                    {/* Activity Date & Time */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap text-xs text-gray-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{item.activityDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mt-0.5">
                        <Clock size={12} className="text-gray-400" />
                        <span>{item.activityTime}</span>
                      </div>
                    </td>

                    {/* Related Enquiry / Quotation */}
                    <td className="px-4 py-3.5 align-middle">
                      {item.relatedRecordType !== "None" &&
                      item.relatedRecordCode ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            item.relatedRecordType === "Enquiry"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-teal-50 text-teal-700 border-teal-200"
                          }`}
                          title={item.relatedRecordTitle}
                        >
                          <ExternalLink size={11} />
                          <span>{item.relatedRecordCode}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <ActivityStatusBadge status={item.status} />
                    </td>

                    {/* Next Action Date & Alert */}
                    <td className="px-4 py-3.5 align-middle">
                      {item.nextActionDate ? (
                        <div>
                          <div
                            className={`flex items-center gap-1 text-xs font-medium ${
                              overdue
                                ? "text-rose-600 font-semibold"
                                : dueToday
                                ? "text-amber-600 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {(overdue || dueToday) && (
                              <AlertCircle size={13} className="shrink-0" />
                            )}
                            <span>{item.nextActionDate}</span>
                          </div>
                          {item.nextActionDetails && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-[140px] mt-0.5">
                              {item.nextActionDetails}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions matching CustomerMaster exactly */}
                    <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <FaEye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit Activity"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete Activity"
                        >
                          <FaTrash size={14} />
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
      </div>

      {/* Pagination Controls matching CustomerMaster */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#154068]"
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
            className="p-1.5 border border-gray-200 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="p-1.5 border border-gray-200 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
