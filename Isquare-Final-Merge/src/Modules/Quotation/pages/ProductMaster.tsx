import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Upload, X, Package, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  productService,
  getApiErrorMessage,
  resolveImageUrl,
  saveProductImageCache,
  saveProductUom,
  getProductUom,
  resolveUomId,
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
  const [defaultUom, setDefaultUom] = useState<string>("Nos");
  const [hsnCode, setHsnCode] = useState<string>("");
  const [purchaseRate, setPurchaseRate] = useState<number | string>("");
  const [profitPercentage, setProfitPercentage] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const modalSpecRef = useRef<HTMLTextAreaElement>(null);


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
      const hsn = (p.hsnCode || "").toLowerCase();
      return (
        name.includes(query) ||
        code.includes(query) ||
        b.includes(query) ||
        spec.includes(query) ||
        hsn.includes(query)
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
    setDefaultUom("Nos");
    setHsnCode("");
    setPurchaseRate("");
    setProfitPercentage("");
    setStock("");
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
    const existingUom =
      prod.unitName ||
      (prod as any).uom ||
      getProductUom(prod.productId, prod) ||
      STANDARD_UOMS.find((u) => u.id === prod.unitOfMeasurementId)?.name ||
      "Nos";
    setDefaultUom(existingUom);
    setHsnCode(prod.hsnCode || "");
    setPurchaseRate(
      prod.purchaseRate != null && !isNaN(Number(prod.purchaseRate))
        ? Number(prod.purchaseRate)
        : ""
    );
    setProfitPercentage(
      prod.profitPercentage != null && !isNaN(Number(prod.profitPercentage))
        ? Number(prod.profitPercentage)
        : prod.profit != null && !isNaN(Number(prod.profit))
        ? Number(prod.profit)
        : ""
    );
    setStock(
      prod.stock != null && !isNaN(Number(prod.stock))
        ? Number(prod.stock)
        : ""
    );
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const enteredUom = defaultUom.trim() || "Nos";
      const uomId = resolveUomId(enteredUom);

      const payload: Partial<Product> = {
        itemCode: itemCode.trim() || undefined,
        productName: productName.trim(),
        brand: brand.trim() || undefined,
        specification: specification.trim() || undefined,
        hsnCode: hsnCode.trim() || null,
        purchaseRate:
          purchaseRate !== "" && !isNaN(Number(purchaseRate))
            ? Number(purchaseRate)
            : null,
        profitPercentage:
          profitPercentage !== "" && !isNaN(Number(profitPercentage))
            ? Number(profitPercentage)
            : null,
        stock:
          stock !== "" && !isNaN(Number(stock))
            ? Math.round(Number(stock))
            : null,
        standardRate: Number(standardRate) || 0,
        gstRate: Number(gstRate) || 0,
        unitOfMeasurementId: uomId,
        unitName: enteredUom,
        uom: enteredUom,
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

        saveProductUom(editingProduct.productId, enteredUom);
        if (payload.itemCode) saveProductUom(payload.itemCode, enteredUom);
        saveProductUom(payload.productName || editingProduct.productName, enteredUom);

        window.dispatchEvent(
          new CustomEvent("isquare_product_updated", {
            detail: {
              productId: editingProduct.productId,
              itemCode: payload.itemCode,
              productName: payload.productName,
              specification: payload.specification || "",
              unitName: enteredUom,
              uom: enteredUom,
              unitOfMeasurementId: uomId,
            },
          })
        );

        toast.success(`Product '${productName}' updated`);
      } else {
        const imgToSend = productImage.trim() || undefined;
        const created = await productService.create({
          ...payload,
          productImage: imgToSend,
          productImagePath: imgToSend,
        });
        if (created?.productId) {
          saveProductUom(created.productId, enteredUom);
        }
        if (payload.itemCode) saveProductUom(payload.itemCode, enteredUom);
        if (payload.productName) saveProductUom(payload.productName, enteredUom);

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
    <div className="p-4 md:p-6 bg-[#F5F7F5] min-h-full space-y-6">
      {/* Top Header Card matching Customer Master */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Package size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#00234a] tracking-tight">
                Product Master
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/30">
                Unified Master
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Enterprise product catalog with standardized rate lists, GST taxation, and brands.
            </p>
          </div>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
          Products
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-[#FF7900]" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search products by code, name, or brand..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 focus:outline-none transition shadow-2xs"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-[#00234a]">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FF7900] text-white font-bold uppercase text-[12px] tracking-wider">
                <th className="p-3.5 w-14 text-center border-r border-[#e06800]">Image</th>
                <th className="p-3.5 w-24 border-r border-[#e06800]">Item Code</th>
                <th className="p-3.5 border-r border-[#e06800]">Product Name</th>
                <th className="p-3.5 border-r border-[#e06800]">Brand / Make</th>
                <th className="p-3.5 border-r border-[#e06800] text-center w-24">HSN Code</th>
                <th className="p-3.5 border-r border-[#e06800]">Specification</th>
                <th className="p-3.5 text-right border-r border-[#e06800] w-32">Standard Rate (₹)</th>
                <th className="p-3.5 text-center border-r border-[#e06800] w-24">GST Rate %</th>
                <th className="p-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    Loading products from API...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400 font-medium">
                    No products found. Click "Add Product" to create items.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-[#f0f7ff] transition duration-150 min-h-[52px]">
                    <td className="p-3.5 text-center w-14">
                      <ProductThumbnail
                        src={p.productImage || p.productImagePath || p.imageUrl}
                        alt={p.productName}
                      />
                    </td>
                    <td className="p-3.5 font-bold font-mono text-[#00234a]">
                      {p.itemCode || `PRD-${p.productId}`}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{p.productName}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{p.brand || "ISQUARE"}</td>
                    <td className="p-3.5 font-mono text-center text-gray-700 font-semibold">
                      {p.hsnCode || "—"}
                    </td>
                    <td className="p-3.5 text-gray-500 max-w-xs align-top">
                      <div
                        className="truncate"
                        title={p.specification || "No specification"}
                      >
                        {p.specification || "—"}
                      </div>
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
                        className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 rounded-lg transition cursor-pointer shadow-2xs"
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition cursor-pointer shadow-2xs"
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

      {/* Add / Edit Modal matching Customer Master style */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-[#FF7900] px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? "Edit Product Master" : "Add New Product"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Item Code
                  </label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="e.g. PRD-01"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Siemens"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. CNC Spindle Motor 5kW"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Technical Specification
                </label>
                <textarea
                  ref={modalSpecRef}
                  rows={3}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Detailed parameters, voltage, RPM, mounting details"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                />
              </div>

              {/* Product Image Field */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                  Product Image
                </label>
                <div className="flex items-start gap-3 p-3 bg-gray-50/80 border border-gray-200 rounded-xl">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00234a] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer shadow-2xs transition"
                      >
                        <Upload size={13} className="text-[#FF7900]" />
                        <span>{imagePreview ? "Replace Image" : "Choose Image"}</span>
                      </label>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
                      className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 font-mono transition focus:border-[#FF7900] focus:outline-none focus:ring-1 focus:ring-[#FF7900]"
                    />

                    <p className="text-[10px] text-gray-500">
                      Supports JPG, JPEG, PNG, WEBP (Max: 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Row: HSN Code & Default UOM (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 8466"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Default UOM
                  </label>
                  <input
                    type="text"
                    value={defaultUom}
                    onChange={(e) => setDefaultUom(e.target.value)}
                    placeholder="e.g. Nos, Pcs, Kg, Boxes"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-medium"
                  />
                </div>
              </div>

              {/* Row: Standard Rate & GST Rate (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Standard Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={standardRate}
                    onChange={(e) => {
                      const newStd = parseFloat(e.target.value) || 0;
                      setStandardRate(newStd);
                      const pRate = parseFloat(String(purchaseRate)) || 0;
                      if (pRate > 0 && newStd > 0) {
                        setProfitPercentage(parseFloat((((newStd - pRate) / pRate) * 100).toFixed(1)));
                      }
                    }}
                    placeholder="e.g. 25000"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 text-right font-semibold transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 18"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 text-center font-semibold transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>

              {/* Row: Edit-only fields (Purchase Rate, Profit %, Stock Quantity) */}
              {editingProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Purchase Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={purchaseRate}
                      onChange={(e) => {
                        const newP = e.target.value;
                        setPurchaseRate(newP);
                        const pRate = parseFloat(newP) || 0;
                        const sRate = parseFloat(String(standardRate)) || 0;
                        if (pRate > 0 && sRate > 0) {
                          setProfitPercentage(parseFloat((((sRate - pRate) / pRate) * 100).toFixed(1)));
                        }
                      }}
                      placeholder="e.g. 175"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 text-right font-semibold transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Profit %
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={profitPercentage}
                      onChange={(e) => setProfitPercentage(e.target.value)}
                      placeholder="e.g. 1.7"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 text-center font-semibold transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 text-center font-semibold transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
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
