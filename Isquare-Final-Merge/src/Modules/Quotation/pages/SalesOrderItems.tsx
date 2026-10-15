import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { salesOrderItemService } from "../services/quotationService";
import type { SalesOrderItem } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";

export const SalesOrderItems: React.FC = () => {
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await salesOrderItemService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Failed to load sales order items:", e);
      toast.error("Failed to fetch sales order items from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const name = (i.itemName || "").toLowerCase();
      const code = (i.itemCode || "").toLowerCase();
      const brand = (i.brand || "").toLowerCase();
      return (
        name.includes(searchText.toLowerCase()) ||
        code.includes(searchText.toLowerCase()) ||
        brand.includes(searchText.toLowerCase())
      );
    });
  }, [items, searchText]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Sales Order Items Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Global catalog of itemized equipment and accessories ordered across active sales orders
          </p>
        </div>

        <button
          type="button"
          onClick={fetchItems}
          className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search items by code, name, or brand..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-800">{filtered.length}</span> items
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5">Code / Brand</th>
                <th className="p-3.5 text-center">Type</th>
                <th className="p-3.5 text-center">Quantity</th>
                <th className="p-3.5 text-right">Rate (₹)</th>
                <th className="p-3.5 text-center">Disc %</th>
                <th className="p-3.5 text-center">GST %</th>
                <th className="p-3.5 text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    Loading sales order items from API...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    No sales order items recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const base = item.quantity * item.rate * (1 - (item.discountPercentage || 0) / 100);
                  const tax = base * ((item.gstRate || 0) / 100);
                  const total = base + tax;

                  return (
                    <tr key={item.salesOrderItemId} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold font-mono text-purple-700">
                        <Link to={`/rsm/sales-orders/${item.salesOrderId}`} className="hover:underline">
                          SO-{item.salesOrderId}
                        </Link>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {item.itemName}
                        {item.specification && (
                          <span className="block text-[11px] text-gray-400 font-normal truncate max-w-xs">
                            {item.specification}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-gray-700 font-semibold">{item.itemCode || "—"}</span>
                        {item.brand && <span className="text-gray-400 ml-1">({item.brand})</span>}
                      </td>
                      <td className="p-3.5 text-center">
                        {item.isAccessory ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Accessory
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                            Main Product
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        {item.quantity} {item.unitOfMeasurement || "Nos"}
                      </td>
                      <td className="p-3.5 text-right font-medium">
                        {formatINR(item.rate)}
                      </td>
                      <td className="p-3.5 text-center text-gray-600">{item.discountPercentage}%</td>
                      <td className="p-3.5 text-center text-gray-600">{item.gstRate}%</td>
                      <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                        {item.lineTotal ? formatINR(item.lineTotal) : formatINR(total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderItems;
