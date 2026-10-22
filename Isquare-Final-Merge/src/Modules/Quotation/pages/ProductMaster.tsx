import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, Edit, Edit3, Trash2, RefreshCw, Upload, X, Package, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  productService,
  getApiErrorMessage,
  resolveImageUrl,
  saveProductImageCache,
} from "../services/quotationService";
import type { Product } from "../models/quotationModels";
import { formatINR, STANDARD_UOMS } from "../utils/quotationCalculations";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ProductThumbnail: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(src) || src;

  useEffect(() => {
    setHasError(false);
  }, [src, resolved]);

  return (
    <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200/90 flex items-center justify-center overflow-hidden mx-auto shadow-2xs">
      {resolved && !hasError ? (
        <img
          src={resolved}
          alt={alt}
          className="w-full h-full object-contain p-0.5"
          onError={() => setHasError(true)}
        />
      ) : (
        <Package size={16} className="text-gray-400" />
      )}
    </div>
  );
};

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
  const modalSpecRef = useRef<HTMLTextAreaElement>(null);

  // Inline Technical Specification Edit state
  const [editingSpecProductId, setEditingSpecProductId] = useState<number | null>(null);
  const [editingSpecValue, setEditingSpecValue] = useState<string>("");
  const [isSavingSpec, setIsSavingSpec] = useState<boolean>(false);

  // Image state
  const [productImage, setProductImage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (e: any) {
      console.error("Failed to fetch products:", e);
      const msg =
        getApiErrorMessage(e?.response?.data) ||
        e?.message ||
        "Failed to load products from API";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return products.filter((p) => {
      if (!query) return true;
      const name = (p.productName || "").toLowerCase();
      const code = (p.itemCode || "").toLowerCase();
      const b = (p.brand || "").toLowerCase();
      const spec = (p.specification || "").toLowerCase();
      return (
        name.includes(query) ||
        code.includes(query) ||
        b.includes(query) ||
        spec.includes(query)
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
    setProductImage("");
    setImagePreview(null);
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setItemCode(prod.itemCode || "");
    setProductName(prod.productName || "");
    setBrand(prod.brand || "");
    setSpecification(prod.specification || "");
    setStandardRate(
      prod.standardRate != null && !isNaN(Number(prod.standardRate))
        ? Number(prod.standardRate)
        : 0
    );
    setGstRate(
      prod.gstRate != null && !isNaN(Number(prod.gstRate))
        ? Number(prod.gstRate)
        : 18
    );
    setUnitOfMeasurementId(prod.unitOfMeasurementId || 1);
    const existingImg =
      prod.productImage || prod.productImagePath || prod.imageUrl || "";
    setProductImage(existingImg);
    setImagePreview(resolveImageUrl(existingImg) || existingImg || null);
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isValidFormat =
      ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (!isValidFormat) {
      toast.error("Please select a valid image file (JPG, JPEG, PNG, or WEBP)");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image file size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImagePreviewError(false);
    // Populate the supported image property with the image path/filename reference
    const imageRefPath = `/images/products/${file.name}`;
    setProductImage(imageRefPath);

    // Save image to cache for immediate cross-module access (e.g. Create Quotation)
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        saveProductImageCache(imageRefPath, reader.result);
        saveProductImageCache(file.name, reader.result);
      }
    };
    reader.readAsDataURL(file);

    toast.success("Image selected");
  };

  const handleImageUrlChange = (url: string) => {
    setProductImage(url);
    setImagePreview(url.trim() ? url.trim() : null);
    setImagePreviewError(false);
  };

  const handleRemoveImage = () => {
    setProductImage("");
    setImagePreview(null);
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartEditSpec = (prod: Product) => {
    setEditingSpecProductId(prod.productId);
    setEditingSpecValue(prod.specification || "");
  };

  const handleCancelEditSpec = () => {
    setEditingSpecProductId(null);
    setEditingSpecValue("");
  };

  const handleSaveInlineSpec = async (prod: Product) => {
    setIsSavingSpec(true);
    try {
      const trimmedSpec = editingSpecValue.trim();
      // Preserve all existing product properties while updating specification
      await productService.update(prod.productId, {
        productId: prod.productId,
        productName: prod.productName,
        itemCode: prod.itemCode,
        brand: prod.brand,
        specification: trimmedSpec,
        standardRate: prod.standardRate,
        gstRate: prod.gstRate,
        unitOfMeasurementId: prod.unitOfMeasurementId,
        productImage: prod.productImage || prod.productImagePath,
        productImagePath: prod.productImagePath || prod.productImage,
        isActive: prod.isActive ?? true,
        isDeleted: prod.isDeleted ?? false,
      });

      // 1. Immediately update displayed specification in the listing
      setProducts((prev) =>
        prev.map((item) =>
          item.productId === prod.productId
            ? { ...item, specification: trimmedSpec }
            : item
        )
      );

      // Broadcast product update event so Create Quotation synchronizes immediately
      window.dispatchEvent(
        new CustomEvent("isquare_product_updated", {
          detail: {
            productId: prod.productId,
            itemCode: prod.itemCode,
            productName: prod.productName,
            specification: trimmedSpec,
          },
        })
      );

      toast.success(
        trimmedSpec
          ? `Specification updated for '${prod.productName}'`
          : `Specification cleared for '${prod.productName}'`
      );

      // 2. Exit inline editing
      setEditingSpecProductId(null);
      setEditingSpecValue("");

      // 3. Re-sync with backend in background
      fetchProducts();
    } catch (err: any) {
      console.error("Failed to update specification:", err);
      const msg =
        getApiErrorMessage(err?.response?.data) ||
        err?.message ||
        "Failed to update specification";
      toast.error(msg);
    } finally {
      setIsSavingSpec(false);
    }
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
        itemCode: itemCode.trim() || undefined,
        productName: productName.trim(),
        brand: brand.trim() || undefined,
        specification: specification.trim() || undefined,
        standardRate: Number(standardRate) || 0,
        gstRate: Number(gstRate) || 0,
        unitOfMeasurementId: Number(unitOfMeasurementId) || 1,
        isActive: true,
        isDeleted: false,
      };

      if (editingProduct) {
        // If editing and user did not change or clear image, preserve existing
        const imgToSend =
          productImage.trim() !== ""
            ? productImage.trim()
            : undefined;

        await productService.update(editingProduct.productId, {
          ...payload,
          productId: editingProduct.productId,
          productImage: imgToSend,
          productImagePath: imgToSend,
        });

        window.dispatchEvent(
          new CustomEvent("isquare_product_updated", {
            detail: {
              productId: editingProduct.productId,
              itemCode: payload.itemCode,
              productName: payload.productName,
              specification: payload.specification || "",
            },
          })
        );

        toast.success(`Product '${productName}' updated`);
      } else {
        const imgToSend = productImage.trim() || undefined;
        await productService.create({
          ...payload,
          productImage: imgToSend,
          productImagePath: imgToSend,
        });
        toast.success(`Product '${productName}' created`);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const msg =
        getApiErrorMessage(err?.response?.data) ||
        err?.message ||
        "Failed to save product to database";
      toast.error(msg);
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
    } catch (err: any) {
      const msg =
        getApiErrorMessage(err?.response?.data) ||
        err?.message ||
        "Failed to delete product";
      toast.error(msg);
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
                <th className="p-3.5 w-14 text-center">Image</th>
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
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    Loading products from API...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">
                    No products found. Click "Add Product" to create items.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center w-14">
                      <ProductThumbnail
                        src={p.productImage || p.productImagePath || p.imageUrl}
                        alt={p.productName}
                      />
                    </td>
                    <td className="p-3.5 font-bold font-mono text-blue-700">
                      {p.itemCode || `PRD-${p.productId}`}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{p.productName}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{p.brand || "ISQUARE"}</td>
                    <td className="p-3.5 text-gray-500 max-w-xs align-top">
                      {editingSpecProductId === p.productId ? (
                        <div className="space-y-1.5 min-w-[240px] py-0.5">
                          <textarea
                            autoFocus
                            rows={2}
                            value={editingSpecValue}
                            onChange={(e) => setEditingSpecValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                e.preventDefault();
                                handleCancelEditSpec();
                              } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSaveInlineSpec(p);
                              }
                            }}
                            placeholder="Enter specification (or leave blank)..."
                            className="w-full text-xs p-2 bg-white border border-blue-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs resize-y"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEditSpec}
                              disabled={isSavingSpec}
                              className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineSpec(p)}
                              disabled={isSavingSpec}
                              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-[#00234a] hover:bg-[#003366] rounded-md transition disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              {isSavingSpec ? (
                                <span>Saving...</span>
                              ) : (
                                <>
                                  <Check size={12} />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 group">
                          <span
                            className="truncate flex-1"
                            title={p.specification || "No specification"}
                          >
                            {p.specification || "—"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditSpec(p)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition shrink-0 cursor-pointer"
                            title="Edit Technical Specification"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-gray-900 font-mono">
                      {formatINR(p.standardRate ?? 0)}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-gray-700">
                      {p.gstRate ?? 0}%
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
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Technical Specification
                  </label>
                  <button
                    type="button"
                    onClick={() => modalSpecRef.current?.focus()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    title="Click to edit technical specification"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                </div>
                <textarea
                  ref={modalSpecRef}
                  rows={3}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Detailed parameters, voltage, RPM, mounting details"
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              {/* Product Image Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Image Preview Box */}
                  <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {(() => {
                      const displayPreview = resolveImageUrl(imagePreview) || imagePreview;
                      return displayPreview && !imagePreviewError ? (
                        <img
                          src={displayPreview}
                          alt="Product Preview"
                          className="w-full h-full object-contain p-0.5"
                          onError={() => setImagePreviewError(true)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={22} />
                          <span className="text-[9px] mt-0.5">No image</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* File Selection and URL Controls */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="product-image-file-input"
                      />
                      <label
                        htmlFor="product-image-file-input"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs transition"
                      >
                        <Upload size={13} />
                        <span>{imagePreview ? "Replace Image" : "Choose Image"}</span>
                      </label>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Remove Image"
                        >
                          <X size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={productImage}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="Or enter image URL / path (e.g. /images/...)"
                      className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                    />

                    <p className="text-[10px] text-gray-500">
                      Supports JPG, JPEG, PNG, WEBP (Max: 5MB)
                    </p>
                  </div>
                </div>
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

