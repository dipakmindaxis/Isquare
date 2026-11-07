import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Upload, X, Package, Image as ImageIcon, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  productService,
  getApiErrorMessage,
  resolveImageUrl,
  saveProductImageCache,
  saveProductUom,
  saveProductMeta,
  getProductUom,
  resolveUomId,
} from "../services/quotationService";
import type { Product } from "../models/quotationModels";
import { formatINR, STANDARD_UOMS } from "../utils/quotationCalculations";
import { ProductExcelImportModal } from "../components/ProductExcelImportModal";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ProductThumbnail: React.FC<{ src?: string | null; alt: string; itemCode?: string | null }> = ({ src, alt, itemCode }) => {
  const [hasError, setHasError] = useState(false);
  const cleanCode = itemCode ? itemCode.trim() : null;
  const namePrefix = alt ? alt.split(/\s+/)[0]?.trim() : null;
  const resolved =
    resolveImageUrl(src) ||
    (cleanCode ? resolveImageUrl(cleanCode) : null) ||
    (cleanCode ? resolveImageUrl(cleanCode.replace(/\s+/g, "-")) : null) ||
    (cleanCode ? resolveImageUrl(cleanCode.replace(/-/g, " ")) : null) ||
    (namePrefix ? resolveImageUrl(namePrefix) : null) ||
    (namePrefix ? resolveImageUrl(namePrefix.replace(/\s+/g, "-")) : null) ||
    (alt ? resolveImageUrl(alt) : null) ||
    (itemCode ? resolveImageUrl(`/images/products/${itemCode.trim().replace(/\s+/g, "-")}.png`) : null) ||
    (itemCode ? resolveImageUrl(`/images/products/${itemCode.trim().replace(/-/g, " ")}.png`) : null) ||
    src;

  useEffect(() => {
    setHasError(false);
  }, [src, resolved, itemCode, alt]);

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
  const [isDeletingProduct, setIsDeletingProduct] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  // Bulk Delete State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
      const newIdSet = new Set(data.map((p) => p.productId));
      setSelectedIds((prev) => prev.filter((id) => newIdSet.has(id)));
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

  const isAllSelected = useMemo(() => {
    return (
      filteredProducts.length > 0 &&
      filteredProducts.every((p) => selectedIds.includes(p.productId))
    );
  }, [filteredProducts, selectedIds]);

  const isSomeSelected = useMemo(() => {
    return (
      filteredProducts.some((p) => selectedIds.includes(p.productId)) && !isAllSelected
    );
  }, [filteredProducts, selectedIds, isAllSelected]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const displayedIds = filteredProducts.map((p) => p.productId);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
    } else {
      const displayedSet = new Set(filteredProducts.map((p) => p.productId));
      setSelectedIds((prev) => prev.filter((id) => !displayedSet.has(id)));
    }
  };

  const handleSelectRow = (productId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0 || isBulkDeleting) return;

    setIsBulkDeleting(true);
    let deletedCount = 0;
    let failedCount = 0;

    try {
      for (const id of selectedIds) {
        try {
          await productService.delete(id);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete product ID ${id}:`, err);
          failedCount++;
        }
      }

      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} ${deletedCount === 1 ? "product" : "products"}.`);
        setSelectedIds([]);
        setBulkDeleteModalOpen(false);
        fetchProducts();
      }

      if (failedCount > 0) {
        toast.error(`Failed to delete ${failedCount} product(s). Please try again.`);
      }
    } catch (err: any) {
      console.error("Bulk delete error:", err);
      toast.error("An error occurred during bulk deletion.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

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

        const metaToSave = {
          uom: enteredUom,
          purchaseRate: payload.purchaseRate,
          profitPercentage: payload.profitPercentage,
          stock: payload.stock,
        };
        saveProductMeta(editingProduct.productId, metaToSave);
        if (payload.itemCode) saveProductMeta(payload.itemCode, metaToSave);
        saveProductMeta(payload.productName || editingProduct.productName, metaToSave);

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
              purchaseRate: payload.purchaseRate,
              profitPercentage: payload.profitPercentage,
              stock: payload.stock,
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
        const createdId = created?.productId;
        const metaToSave = {
          uom: enteredUom,
          purchaseRate: payload.purchaseRate,
          profitPercentage: payload.profitPercentage,
          stock: payload.stock,
        };
        if (createdId) {
          saveProductUom(createdId, enteredUom);
          saveProductMeta(createdId, metaToSave);
        }
        if (payload.itemCode) {
          saveProductUom(payload.itemCode, enteredUom);
          saveProductMeta(payload.itemCode, metaToSave);
        }
        if (payload.productName) {
          saveProductUom(payload.productName, enteredUom);
          saveProductMeta(payload.productName, metaToSave);
        }

        window.dispatchEvent(
          new CustomEvent("isquare_product_updated", {
            detail: {
              productId: createdId,
              itemCode: payload.itemCode,
              productName: payload.productName,
              specification: payload.specification || "",
              unitName: enteredUom,
              uom: enteredUom,
              unitOfMeasurementId: uomId,
              purchaseRate: payload.purchaseRate,
              profitPercentage: payload.profitPercentage,
              stock: payload.stock,
            },
          })
        );

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
    setIsDeletingProduct(true);
    try {
      await productService.delete(productToDelete.productId);
      toast.success(`Product '${productToDelete.productName}' deleted`);
      setProducts(products.filter((p) => p.productId !== productToDelete.productId));
      setSelectedIds((prev) => prev.filter((id) => id !== productToDelete.productId));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      const msg =
        getApiErrorMessage(err?.response?.data) ||
        err?.message ||
        "Failed to delete product";
      toast.error(msg);
    } finally {
      setIsDeletingProduct(false);
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
        <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
          Products
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-[#FF7900]" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#00234a] hover:text-emerald-800 shadow-xs transition cursor-pointer"
            title="Import Excel"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
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
            className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-slate-700 placeholder:text-sm focus:bg-white focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 focus:outline-none transition shadow-2xs"
          />
        </div>

        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="font-bold text-[#00234a]">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Bulk Action Buttons Section */}
      {selectedIds.length > 0 && (
        <div className="bg-orange-50/80 border border-[#FF7900]/30 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
            <span className="text-sm font-semibold text-[#00234a]">
              Selected Products: <span className="font-bold text-[#FF7900] ml-1">{selectedIds.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <X size={13} />
              <span>Clear Selection</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FF7900] text-white font-semibold uppercase text-[13px] tracking-wider">
                <th className="p-3.5 w-10 text-center border-r border-[#e06800]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer accent-[#FF7900]"
                    title={isAllSelected ? "Deselect All" : "Select All Displayed"}
                  />
                </th>
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
                  <td colSpan={10} className="p-10 text-center text-gray-400 font-medium">
                    Loading products from API...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-gray-400 font-medium">
                    No products found. Click "Add Product" to create items.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.productId);
                  return (
                    <tr
                      key={p.productId}
                      className={`transition duration-150 min-h-[52px] ${
                        isSelected ? "bg-orange-50/50 hover:bg-orange-50/80" : "hover:bg-[#f0f7ff]"
                      }`}
                    >
                      <td className="p-3.5 text-center w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(p.productId, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] cursor-pointer accent-[#FF7900]"
                        />
                      </td>
                    <td className="p-3.5 text-center w-14">
                      <ProductThumbnail
                        src={p.productImage || p.productImagePath || p.imageUrl}
                        alt={p.productName}
                        itemCode={p.itemCode}
                      />
                    </td>
                    <td className="p-3.5 font-semibold text-[#00234a]">
                      {p.itemCode || `PRD-${p.productId}`}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{p.productName}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{p.brand || "ISQUARE"}</td>
                    <td className="p-3.5 text-center text-gray-700 font-medium">
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
                    <td className="p-3.5 text-right font-semibold text-gray-900">
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
                );
              })
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-medium"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                      className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 transition focus:border-[#FF7900] focus:outline-none focus:ring-1 focus:ring-[#FF7900]"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 text-right font-medium transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 text-center font-medium transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>

              {/* Row: Commercial & Stock fields (Purchase Rate, Profit %, Stock Quantity) */}
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 text-right font-medium transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 text-center font-medium transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 text-center font-medium transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal – Modern Gradient Premium */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] rounded-[24px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden bg-white animate-in zoom-in-95 duration-200">
            {/* Premium Header with Deep Red Gradient and Ambient Wave */}
            <div className="relative bg-gradient-to-br from-[#E60033] via-[#C4002B] to-[#A90024] pt-7 pb-10 px-6 text-center overflow-hidden">
              {/* Subtle ambient lighting */}
              <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute top-2 right-4 w-36 h-36 rounded-full bg-black/15 blur-2xl pointer-events-none" />

              {/* Close (X) Icon Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingProduct) {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                  }
                }}
                disabled={isDeletingProduct}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer disabled:opacity-40"
                title="Close"
              >
                <X size={18} />
              </button>

              {/* Centered Glowing Red Circular Badge with Trash Icon */}
              <div className="relative inline-flex items-center justify-center mb-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FF2E55] to-[#B30026] flex items-center justify-center text-white shadow-[0_0_26px_rgba(255,46,85,0.75),0_4px_14px_rgba(0,0,0,0.25)] border border-white/25">
                  <Trash2 size={24} className="text-white drop-shadow-xs" />
                </div>
              </div>

              {/* Modal Title */}
              <h3 className="text-xl font-bold text-white tracking-tight mt-2.5">
                Delete Product
              </h3>

              {/* Ambient Layered Bottom Waves matching Option 1 reference */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none">
                {/* Secondary subtle shadow wave */}
                <svg
                  className="relative block w-full h-8 text-black/10 fill-current"
                  viewBox="0 0 420 50"
                  preserveAspectRatio="none"
                >
                  <path d="M0,15 C150,45 270,-5 420,18 L420,50 L0,50 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none">
                {/* Primary white wave flowing into body */}
                <svg
                  className="relative block w-full h-7 text-white fill-current"
                  viewBox="0 0 420 50"
                  preserveAspectRatio="none"
                >
                  <path d="M0,25 C130,50 280,2 420,24 L420,50 L0,50 Z" />
                </svg>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 sm:px-8 pt-4 pb-7 text-center">
              <p className="text-[13.5px] font-semibold text-[#082B50]">
                Are you sure you want to delete this product?
              </p>
              <p className="text-[12px] text-gray-500 mt-1">
                This action cannot be undone.
              </p>

              {/* Product Information Pill */}
              <div className="my-5 mx-auto max-w-[340px] bg-[#FFF0F2] border border-[#FFE0E5] rounded-full px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Package size={17} className="text-[#E60033] shrink-0" />
                  <span
                    className="text-xs font-bold text-[#082B50] truncate"
                    title={productToDelete?.productName}
                  >
                    {productToDelete?.productName}
                  </span>
                </div>
                {productToDelete?.itemCode && (
                  <span className="text-[11px] font-mono font-bold text-[#E60033] bg-white border border-[#FFE0E5] px-2 py-0.5 rounded-md shrink-0">
                    {productToDelete.itemCode}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  disabled={isDeletingProduct}
                  className="min-w-[110px] px-6 py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-[#082B50] font-bold text-xs rounded-xl border border-[#E5E7EB] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingProduct}
                  className="min-w-[140px] px-6 py-2.5 bg-gradient-to-r from-[#E60033] to-[#A90024] hover:from-[#d1002e] hover:to-[#940020] text-white font-bold text-xs rounded-xl shadow-[0_4px_14px_rgba(230,0,51,0.35)] hover:shadow-[0_6px_20px_rgba(230,0,51,0.45)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeletingProduct ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} className="text-white" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Excel Import Modal */}
      <ProductExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={fetchProducts}
        existingProducts={products}
      />

      {/* Bulk Delete Confirmation Modal – Modern Gradient Premium (Option 1) */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] rounded-[24px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden bg-white animate-in zoom-in-95 duration-200">
            {/* Premium Header with Deep Red Gradient and Ambient Wave */}
            <div className="relative bg-gradient-to-br from-[#E60033] via-[#C4002B] to-[#A90024] pt-7 pb-10 px-6 text-center overflow-hidden">
              {/* Subtle ambient lighting */}
              <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute top-2 right-4 w-36 h-36 rounded-full bg-black/15 blur-2xl pointer-events-none" />

              {/* Close (X) Icon Button */}
              <button
                type="button"
                onClick={() => !isBulkDeleting && setBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer disabled:opacity-40"
                title="Close"
              >
                <X size={18} />
              </button>

              {/* Centered Glowing Red Circular Badge with Trash Icon */}
              <div className="relative inline-flex items-center justify-center mb-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FF2E55] to-[#B30026] flex items-center justify-center text-white shadow-[0_0_26px_rgba(255,46,85,0.75),0_4px_14px_rgba(0,0,0,0.25)] border border-white/25">
                  <Trash2 size={24} className="text-white drop-shadow-xs" />
                </div>
              </div>

              {/* Modal Title */}
              <h3 className="text-xl font-bold text-white tracking-tight mt-2.5">
                Confirm Bulk Delete
              </h3>

              {/* Ambient Layered Bottom Waves matching Option 1 reference */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none">
                {/* Secondary subtle shadow wave */}
                <svg
                  className="relative block w-full h-8 text-black/10 fill-current"
                  viewBox="0 0 420 50"
                  preserveAspectRatio="none"
                >
                  <path d="M0,15 C150,45 270,-5 420,18 L420,50 L0,50 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none">
                {/* Primary white wave flowing into body */}
                <svg
                  className="relative block w-full h-7 text-white fill-current"
                  viewBox="0 0 420 50"
                  preserveAspectRatio="none"
                >
                  <path d="M0,25 C130,50 280,2 420,24 L420,50 L0,50 Z" />
                </svg>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 sm:px-8 pt-4 pb-7 text-center">
              <p className="text-[13.5px] font-semibold text-[#082B50]">
                Are you sure you want to delete the selected products?
              </p>
              <p className="text-[12px] text-gray-500 mt-1">
                This action cannot be undone.
              </p>

              {/* Selected Products Information Pill */}
              <div className="my-5 mx-auto max-w-[280px] bg-[#FFF0F2] border border-[#FFE0E5] rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-[#E60033]" />
                  <span className="text-xs font-bold text-[#082B50]">
                    Selected Products:
                  </span>
                </div>
                <span className="text-base font-extrabold text-[#E60033]">
                  {selectedIds.length}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => setBulkDeleteModalOpen(false)}
                  disabled={isBulkDeleting}
                  className="min-w-[110px] px-6 py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-[#082B50] font-bold text-xs rounded-xl border border-[#E5E7EB] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeleteConfirm}
                  disabled={isBulkDeleting}
                  className="min-w-[140px] px-6 py-2.5 bg-gradient-to-r from-[#E60033] to-[#A90024] hover:from-[#d1002e] hover:to-[#940020] text-white font-bold text-xs rounded-xl shadow-[0_4px_14px_rgba(230,0,51,0.35)] hover:shadow-[0_6px_20px_rgba(230,0,51,0.45)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBulkDeleting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} className="text-white" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaster;
