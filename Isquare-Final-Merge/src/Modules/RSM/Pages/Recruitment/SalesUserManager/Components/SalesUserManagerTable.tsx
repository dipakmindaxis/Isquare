import React from "react";
import { Loader2 } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

import type { SalesUserManager } from "../Types/SalesUserManager";

interface SalesUserManagerTableProps {
  salesUserManagers: SalesUserManager[];
  isLoading: boolean;
  onEdit: (item: SalesUserManager) => void;
  onDelete: (item: SalesUserManager) => void;
}

const SalesUserManagerTable: React.FC<SalesUserManagerTableProps> = ({
  salesUserManagers,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#154068] text-white">
            <tr>
              <th className="px-6 py-3 font-semibold text-left">
                SR NO
              </th>
              <th className="px-6 py-3 font-semibold text-left">
                VALUE
              </th>
              <th className="px-6 py-3 font-semibold text-left">
                CODE / KEY
              </th>
              <th className="px-6 py-3 font-semibold text-left">
                STATUS
              </th>
              <th className="px-6 py-3 font-semibold text-right">
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
                    <span>Loading sales user managers...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && salesUserManagers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  No sales user managers found.
                </td>
              </tr>
            )}

            {!isLoading &&
              salesUserManagers.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.userName}
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
                        title="Edit Sales User Manager"
                      >
                        <FaEdit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Sales User Manager"
                      >
                        <FaTrash size={16} />
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

export default SalesUserManagerTable;
