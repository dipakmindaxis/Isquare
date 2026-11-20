import React from "react";
import { Loader2 } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

import type { BdeUser } from "../Types/BdeUser";

interface BdeUserTableProps {
  bdeUsers: BdeUser[];
  isLoading: boolean;
  onEdit: (item: BdeUser) => void;
  onDelete: (item: BdeUser) => void;
}

const BdeUserTable: React.FC<BdeUserTableProps> = ({
  bdeUsers,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#FF7900] text-white text-[13px] font-semibold uppercase tracking-wider">
            <tr className="h-[50px] min-h-[50px]">
              <th className="px-4 py-3.5 font-bold text-left border-r border-[#e06800]">
                SR NO
              </th>
              <th className="px-4 py-3.5 font-semibold text-left border-r border-[#e06800]">
                VALUE
              </th>
              <th className="px-4 py-3.5 font-semibold text-left border-r border-[#e06800]">
                CODE / KEY
              </th>
              <th className="px-4 py-3.5 font-semibold text-center w-32 border-r border-[#e06800]">
                STATUS
              </th>
              <th className="px-4 py-3.5 font-semibold text-right w-36">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2
                      size={20}
                      className="animate-spin text-[#154068]"
                    />
                    <span>Loading BDE users...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && bdeUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  No BDE users found.
                </td>
              </tr>
            )}

            {!isLoading &&
              bdeUsers.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.value}
                  </td>

                  <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                    {item.code}
                  </td>

                  <td className="px-6 py-4">
                    {item.isActive ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit BDE User"
                      >
                        <FaEdit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete BDE User"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BdeUserTable;
