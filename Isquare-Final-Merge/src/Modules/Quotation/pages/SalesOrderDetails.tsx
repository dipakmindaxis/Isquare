import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Truck,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import {
  salesOrderService,
  salesOrderItemService,
  masterDataService,
} from "../services/quotationService";
import type { SalesOrder, SalesOrderItem } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR } from "../utils/quotationCalculations";
import QuotationStatusBadge from "../components/QuotationStatusBadge";

interface ExtendedCustomer extends Customer {
  contactPerson?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export const SalesOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [customer, setCustomer] = useState<ExtendedCustomer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status Update State
  const [newStatus, setNewStatus] = useState<string>("In Production");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    const orderId = parseInt(id, 10);
    setIsLoading(true);
    try {
      const [orderRes, itemsRes] = await Promise.all([
        salesOrderService.getById(orderId),
        salesOrderItemService.getBySalesOrder(orderId),
      ]);

      setOrder(orderRes);
      setNewStatus(orderRes.orderStatus || "In Production");

      // Nest accessories
      const parents = itemsRes.filter((i) => !i.isAccessory);
      const accessories = itemsRes.filter((i) => i.isAccessory);
      parents.forEach((p) => {
        p.accessories = accessories.filter(
          (a) => a.parentSalesOrderItemId === p.salesOrderItemId
        );
      });
      setItems(parents);

      if (orderRes.customerId) {
        masterDataService.getCustomers().then((custs) => {
          const match = custs.find((c) => c.customerId === orderRes.customerId);
          if (match) setCustomer(match as ExtendedCustomer);
        });
      }
    } catch (e) {
      console.error("Error loading sales order details:", e);
      toast.error("Failed to load sales order details from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      await salesOrderService.update(order.salesOrderId, {
        customerId: order.customerId,
        quotationId: order.quotationId,
        expectedDeliveryDate: order.expectedDeliveryDate,
        paymentTerms: order.paymentTerms,
        deliveryAddress: order.deliveryAddress,
        remarks: `Status updated to ${newStatus}`,
      });
      toast.success(`Sales Order status updated to '${newStatus}'`);
      setOrder({ ...order, orderStatus: newStatus });
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-[#00234a] border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Loading sales order details from API...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
        <p className="text-sm font-bold text-gray-700">Sales Order not found</p>
        <Link
          to="/rsm/sales-orders"
          className="mt-3 inline-block px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl"
        >
          Back to Orders List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/rsm/sales-orders")}
            className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl transition"
            title="Back to Sales Orders"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#00234a] tracking-tight font-mono">
                {order.salesOrderNumber || `SO-${order.salesOrderId}`}
              </h1>
              <QuotationStatusBadge status={order.orderStatus || "Pending"} type="order" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer:{" "}
              <span className="font-bold text-gray-800">
                {order.customerName || customer?.customerName || `Customer #${order.customerId}`}
              </span>
              {order.quotationId && (
                <span className="ml-2">
                  · Generated from Quotation:{" "}
                  <Link
                    to={`/rsm/quotations/${order.quotationId}`}
                    className="font-mono text-blue-600 font-bold hover:underline"
                  >
                    {order.quotationNumber || `QT-${order.quotationId}`}
                  </Link>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl transition shadow-sm print:hidden"
          >
            <Printer size={14} />
            <span>Print Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Sales Order Line Items ({items.length})
              </h3>
              {order.grandTotal && (
                <span className="text-xs font-bold text-purple-700 font-mono">
                  Order Total: {formatINR(order.grandTotal)}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#154068] text-white font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Item Name &amp; Specification</th>
                    <th className="p-3 w-20 text-center">Qty / UOM</th>
                    <th className="p-3 w-24 text-right">Rate (₹)</th>
                    <th className="p-3 w-16 text-center">Disc %</th>
                    <th className="p-3 w-16 text-center">GST %</th>
                    <th className="p-3 w-28 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No individual line items registered for this order.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const base = item.quantity * item.rate * (1 - (item.discountPercentage || 0) / 100);
                      const tax = base * ((item.gstRate || 0) / 100);
                      const total = base + tax;

                      return (
                        <React.Fragment key={idx}>
                          <tr className="hover:bg-slate-50/50 transition">
                            <td className="p-3 align-top font-bold text-gray-400">{idx + 1}</td>
                            <td className="p-3 align-top">
                              <div className="font-bold text-gray-900">
                                {item.itemName} {item.brand ? `· ${item.brand}` : ""}
                              </div>
                              {item.itemCode && (
                                <div className="text-[10px] font-mono text-purple-600">
                                  Code: {item.itemCode}
                                </div>
                              )}
                              {item.specification && (
                                <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                  {item.specification}
                                </div>
                              )}
                            </td>
                            <td className="p-3 align-top text-center font-bold">
                              {item.quantity} {item.unitOfMeasurement || "Nos"}
                            </td>
                            <td className="p-3 align-top text-right font-medium">
                              {formatINR(item.rate)}
                            </td>
                            <td className="p-3 align-top text-center text-gray-600">
                              {item.discountPercentage}%
                            </td>
                            <td className="p-3 align-top text-center text-gray-600">
                              {item.gstRate}%
                            </td>
                            <td className="p-3 align-top text-right font-bold text-gray-900 font-mono">
                              {item.lineTotal ? formatINR(item.lineTotal) : formatINR(total)}
                            </td>
                          </tr>

                          {/* Child Accessories */}
                          {item.accessories &&
                            item.accessories.map((acc, aIdx) => {
                              const aBase = acc.quantity * acc.rate * (1 - (acc.discountPercentage || 0) / 100);
                              const aTax = aBase * ((acc.gstRate || 0) / 100);
                              const aTotal = aBase + aTax;

                              return (
                                <tr key={`acc-${aIdx}`} className="bg-purple-50/30 text-[11px]">
                                  <td className="p-2.5 text-right text-purple-500">↳</td>
                                  <td className="p-2.5">
                                    <span className="font-semibold text-gray-800">
                                      [Accessory] {acc.itemName}
                                    </span>
                                    {acc.specification && (
                                      <span className="text-gray-500 ml-1">
                                        — {acc.specification}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center font-medium">
                                    {acc.quantity} {acc.unitOfMeasurement || "Nos"}
                                  </td>
                                  <td className="p-2.5 text-right font-medium">
                                    {formatINR(acc.rate)}
                                  </td>
                                  <td className="p-2.5 text-center">{acc.discountPercentage}%</td>
                                  <td className="p-2.5 text-center">{acc.gstRate}%</td>
                                  <td className="p-2.5 text-right font-bold text-gray-800 font-mono">
                                    {acc.lineTotal ? formatINR(acc.lineTotal) : formatINR(aTotal)}
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery & Remarks */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Delivery Logistics &amp; Remarks
            </h3>
            <div className="text-xs text-gray-700 space-y-1.5">
              <p>
                <span className="font-bold text-gray-900">Delivery Address:</span>{" "}
                {order.deliveryAddress || "Standard client registered address"}
              </p>
              <p>
                <span className="font-bold text-gray-900">Commercial Terms:</span>{" "}
                {order.paymentTerms || "As per signed quotation"}
              </p>
              {order.remarks && (
                <p>
                  <span className="font-bold text-gray-900">Order Remarks:</span> {order.remarks}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Fulfilment Status Update & Meta */}
        <div className="space-y-6">
          {/* Fulfilment Status Updater */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-purple-700 font-bold uppercase text-[10px] tracking-wider">
              <Truck size={14} />
              <span>Fulfilment &amp; Production Status</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Order Status
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

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition disabled:opacity-50"
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
              <Building size={14} className="text-blue-600" />
              <span>Client Information</span>
            </div>
            <p className="font-bold text-sm text-gray-900">
              {order.customerName || customer?.customerName || `Customer #${order.customerId}`}
            </p>
            {customer?.contactPerson && (
              <p className="text-gray-600">Contact: {customer.contactPerson}</p>
            )}
            {customer?.email && <p className="text-gray-500">{customer.email}</p>}
            {customer?.phone && <p className="text-gray-500">{customer.phone}</p>}
            {customer?.city && <p className="text-gray-500">{customer.city}, India</p>}
          </div>

          {/* Order Financials */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Order Value Summary
            </h3>
            {order.taxableAmount && (
              <div className="flex justify-between text-gray-600">
                <span>Taxable Base:</span>
                <span className="font-mono">{formatINR(order.taxableAmount)}</span>
              </div>
            )}
            {order.taxAmount && (
              <div className="flex justify-between text-gray-600">
                <span>GST Amount:</span>
                <span className="font-mono">{formatINR(order.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 font-bold text-sm">
              <span>Grand Total:</span>
              <span className="text-purple-800 font-mono">
                {order.grandTotal ? formatINR(order.grandTotal) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;
