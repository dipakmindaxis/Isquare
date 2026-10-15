import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { productService } from "../services/quotationService";
import type { Product } from "../models/quotationModels";
import { formatINR, STANDARD_UOMS } from "../utils/quotationCalculations";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";

export const ProductMaster: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [itemCode, setItemCode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");
  const [standardRate, setStandardRate] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18);
  const [unitOfMeasurementId, setUnitOfMeasurementId] = useState<number>(1);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      toast.error("Failed to load products from API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.productName || "").toLowerCase();
      const code = (p.itemCode || "").toLowerCase();
      const b = (p.brand || "").toLowerCase();
      return (
        name.includes(searchText.toLowerCase()) ||
        code.includes(searchText.toLowerCase()) ||
        b.includes(searchText.toLowerCase())
      );
    });
  }, [products, searchText]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setItemCode(`PRD-${String(products.length + 1).padStart(2, "0")}`);
    setProductName("");
    setBrand("ISQUARE");
    setSpecification("");
    setStandardRate(25000);
    setGstRate(18);
    setUnitOfMeasurementId(1);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setItemCode(prod.itemCode || "");
    setProductName(prod.productName || "");
    setBrand(prod.brand || "");
    setSpecification(prod.specification || "");
    setStandardRate(prod.standardRate || 0);
    setGstRate(prod.gstRate ?? 18);
    setUnitOfMeasurementId(prod.unitOfMeasurementId || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
        itemCode,
        productName,
        brand,
        specification,
        standardRate,
        gstRate,
        unitOfMeasurementId,
        isActive: true,
        isDeleted: false,
      };

      if (editingProduct) {
        await productService.update(editingProduct.productId, {
          ...payload,
          productId: editingProduct.productId,
        });
        toast.success(`Product '${productName}' updated`);
      } else {
        await productService.create(payload);
        toast.success(`Product '${productName}' created`);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to save product to database");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await productService.delete(productToDelete.productId);
      toast.success(`Product '${productToDelete.productName}' deleted`);
      setProducts(products.filter((p) => p.productId !== productToDelete.productId));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00234a] tracking-tight">
            Product Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enterprise product catalog with standardized rate lists, GST taxation, and brands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="p-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-xl shadow-md transition"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search products by code, name, or brand..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#154068] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5 w-24">Item Code</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Brand / Make</th>
                <th className="p-3.5">Specification</th>
                <th className="p-3.5 text-right">Standard Rate (₹)</th>
                <th className="p-3.5 text-center">GST Rate %</th>
                <th className="p-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 font-medium">
                    Loading products from API...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 font-medium">
                    No products found. Click "Add Product" to create items.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-blue-700">
                      {p.itemCode || `PRD-${p.productId}`}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{p.productName}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{p.brand || "ISQUARE"}</td>
                    <td className="p-3.5 text-gray-500 max-w-xs truncate">
                      {p.specification || "—"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                      {formatINR(p.standardRate)}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-gray-700">
                      {p.gstRate}%
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? "Edit Product Master" : "Add New Product"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Item Code
                  </label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="e.g. PRD-01"
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Siemens"
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. CNC Spindle Motor 5kW"
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Technical Specification
                </label>
                <textarea
                  rows={2}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Detailed parameters, voltage, RPM, mounting details"
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Standard Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={standardRate}
                    onChange={(e) => setStandardRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-right focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg text-center focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Default UOM
                  </label>
                  <select
                    value={unitOfMeasurementId}
                    onChange={(e) => setUnitOfMeasurementId(parseInt(e.target.value, 10))}
                    className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                  >
                    {STANDARD_UOMS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete product '${productToDelete?.productName}'?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default ProductMaster;
