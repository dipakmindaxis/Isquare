import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Truck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { salesOrderService } from "../services/quotationService";
import type { SalesOrder } from "../models/quotationModels";
import { formatINR } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";
import { exportToExcel } from "../../../Utils/exportToExcel";

export const SalesOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>("In Production");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await salesOrderService.getAll();
      setOrders(ordersData);
    } catch (e) {
      console.error("Failed to load sales orders:", e);
      toast.error("Failed to fetch sales orders from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const oNum = (o.salesOrderNumber || `SO-${o.salesOrderId}`).toLowerCase();
      const qNum = (o.quotationNumber || `QT-${o.quotationId}`).toLowerCase();
      const custName = (o.customerName || "").toLowerCase();
      const matchesSearch =
        oNum.includes(searchText.toLowerCase()) ||
        qNum.includes(searchText.toLowerCase()) ||
        custName.includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (o.orderStatus || "Pending").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      await salesOrderService.update(selectedOrder.salesOrderId, {
        customerId: selectedOrder.customerId,
        quotationId: selectedOrder.quotationId,
        expectedDeliveryDate: selectedOrder.expectedDeliveryDate,
        paymentTerms: selectedOrder.paymentTerms,
        deliveryAddress: selectedOrder.deliveryAddress,
        remarks: `Status updated to ${newStatus}`,
      });
      toast.success(`Sales Order #${selectedOrder.salesOrderId} status updated to '${newStatus}'`);
      setStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update sales order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredOrders.map((o) => ({
      "Order Number": o.salesOrderNumber || `SO-${o.salesOrderId}`,
      "Quotation Reference": o.quotationNumber || (o.quotationId ? `QT-${o.quotationId}` : "—"),
      Customer: o.customerName || `Customer #${o.customerId}`,
      "Order Date": o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-IN") : "—",
      "Expected Delivery Date": o.expectedDeliveryDate
        ? new Date(o.expectedDeliveryDate).toLocaleDateString("en-IN")
        : "—",
      "Grand Total": o.grandTotal ?? 0,
      Status: o.orderStatus || "Pending",
      "Payment Terms": o.paymentTerms || "—",
    }));

    exportToExcel(dataToExport, "Sales_Orders", "SalesOrders");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Sales Order Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Confirmed commercial orders converted from approved and won customer quotations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel</span>
          </button>
          <Link
            to="/rsm/quotations"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition"
          >
            <Plus size={15} />
            <span>Generate from Quotation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by Order #, Quotation #, or Customer..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <Filter size={13} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-2 px-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Production">In Production</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Total: <span className="font-bold text-gray-800">{filteredOrders.length}</span> orders
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Sales Order #</th>
                <th className="p-3.5">Quotation Ref</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Order Date</th>
                <th className="p-3.5">Expected Delivery</th>
                <th className="p-3.5 text-right">Order Value (₹)</th>
                <th className="p-3.5 text-center">Fulfilment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    Loading sales orders from API...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    No sales orders found. Convert approved quotations to generate sales orders.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.salesOrderId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-purple-800">
                      <Link to={`/rsm/sales-orders/${o.salesOrderId}`} className="hover:underline">
                        {o.salesOrderNumber || `SO-${o.salesOrderId}`}
                      </Link>
                    </td>
                    <td className="p-3.5 font-mono text-blue-700">
                      {o.quotationId ? (
                        <Link to={`/rsm/quotations/${o.quotationId}`} className="hover:underline">
                          {o.quotationNumber || `QT-${o.quotationId}`}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">
                      {o.customerName || `Customer #${o.customerId}`}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {o.expectedDeliveryDate
                        ? new Date(o.expectedDeliveryDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                      {o.grandTotal ? formatINR(o.grandTotal) : "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <QuotationStatusBadge status={o.orderStatus || "Pending"} type="order" />
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/rsm/sales-orders/${o.salesOrderId}`)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setNewStatus(o.orderStatus || "In Production");
                          setStatusModalOpen(true);
                        }}
                        className="p-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 rounded-lg transition"
                        title="Update Status"
                      >
                        <Truck size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-gray-900">
                Update Order Fulfilment Status
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Updating status for Sales Order{" "}
              <span className="font-bold font-mono">
                {selectedOrder.salesOrderNumber || `SO-${selectedOrder.salesOrderId}`}
              </span>
            </p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Fulfilment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Production">In Production</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderList;
