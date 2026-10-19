import React, { useState, useEffect } from "react";
import {
  Paperclip,
  Search,
  Upload,
  Download,
  Trash2,
  FileText,
  Image,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import SalesNavTabs from "../Components/SalesNavTabs";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import type { CustomerOption } from "../../SalesActivities/Types/SalesActivityTypes";
import {
  getCustomerOptions,
  getAttachments,
  createAttachmentRecord,
  deleteAttachmentRecord,
  getSalesModuleCounts,
  getDocumentTypes,
} from "../../SalesActivities/Services/SalesActivityService";
import type {
  SalesAttachmentItem,
  DocumentTypeItem,
} from "../../SalesActivities/Services/SalesActivityService";

const initialAttachments: SalesAttachmentItem[] = [
  {
    id: "ATT-001",
    name: "sensor_mounting_location.jpg",
    category: "Visit Photograph",
    customerId: "CUST-001",
    customerName: "Tata Steel Ltd",
    relatedActivityCode: "ACT-2026-001",
    fileSizeKB: 650,
    fileType: "image/jpeg",
    isImage: true,
    uploadedBy: "Vishal Patil",
    uploadedDate: "2026-10-07",
  },
  {
    id: "ATT-002",
    name: "flame_detector_proposal_copy.pdf",
    category: "Site Survey Report",
    customerId: "CUST-002",
    customerName: "Reliance Industries Ltd",
    relatedActivityCode: "ACT-2026-002",
    fileSizeKB: 980,
    fileType: "application/pdf",
    isImage: false,
    uploadedBy: "Samadhan Shinde",
    uploadedDate: "2026-10-08",
  },
];

export const AttachmentsMaster: React.FC = () => {
  const [attachments, setAttachments] =
    useState<SalesAttachmentItem[]>(initialAttachments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentTypeItem[]>([]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SalesAttachmentItem | null>(null);

  // Form State
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCategory, setFormCategory] =
    useState<string>("Visit Photograph");
  const [formActivityCode, setFormActivityCode] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadData = async () => {
      const [c, storedAtts, storedDocTypes] = await Promise.all([
        getCustomerOptions(),
        getAttachments(),
        getDocumentTypes(),
      ]);
      setCustomers(c);
      setDocTypes(storedDocTypes.filter((d) => d.isActive));
      if (storedAtts && storedAtts.length > 0) {
        setAttachments(storedAtts);
      }
      if (c.length > 0 && !formCustomerName) {
        setFormCustomerId(c[0].id);
        setFormCustomerName(c[0].name);
      }
      if (storedDocTypes.length > 0) {
        setFormCategory(storedDocTypes[0].value);
      }
    };
    loadData();
  }, []);

  const handleCustomerNameChange = (name: string) => {
    setFormCustomerName(name);
    const matched = customers.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (matched) {
      setFormCustomerId(matched.id);
    }
  };

  const filteredItems = attachments.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.relatedActivityCode &&
        item.relatedActivityCode
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    const matchCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenUpload = () => {
    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
      setFormCustomerName(customers[0].name);
    } else {
      setFormCustomerId("");
      setFormCustomerName("");
    }
    if (docTypes.length > 0) {
      setFormCategory(docTypes[0].value);
    } else {
      setFormCategory("Visit Photograph");
    }
    setFormActivityCode("");
    setUploadedFiles([]);
    setIsUploadOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }
    if (uploadedFiles.length === 0) {
      toast.error("Please choose at least one file to upload.");
      return;
    }
    setIsSaving(true);
    try {
      const newItems: SalesAttachmentItem[] = uploadedFiles.map((file, idx) => ({
        id: `ATT-${Date.now()}-${idx}`,
        name: file.name,
        category: formCategory as SalesAttachmentItem["category"],
        customerId: formCustomerId || `CUST-MANUAL-${Date.now().toString().slice(-4)}`,
        customerName: formCustomerName.trim(),
        relatedActivityCode: formActivityCode.trim() || undefined,
        fileSizeKB: Math.round(file.size / 1024),
        fileType: file.type || "application/octet-stream",
        isImage: file.type.startsWith("image/"),
        uploadedBy: "System Admin",
        uploadedDate: new Date().toISOString().split("T")[0],
      }));
      await Promise.all(newItems.map((item) => createAttachmentRecord(item)));
      const updated = await getAttachments();
      setAttachments(updated);
      setIsUploadOpen(false);
      toast.success(`${newItems.length} document(s) uploaded & synced with All Activities!`);
    } catch {
      toast.error("Failed to upload document(s).");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteAttachmentRecord(selectedItem.id);
      const updated = await getAttachments();
      setAttachments(updated);
      setIsDeleteOpen(false);
      toast.success(`Attachment "${selectedItem.name}" deleted.`);
    } catch {
      toast.error("Failed to delete attachment.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      {/* Shared Nav Tabs */}
      <SalesNavTabs counts={getSalesModuleCounts()} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center font-bold shadow-xs">
            <Paperclip className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Sales Attachments Master
              </h1>
              <span className="text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 px-2.5 py-0.5 rounded-full">
                {attachments.length} Stored Documents
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-xs">
              Repository of site photographs, signed handover challans, calibration test certificates, and compliance reports.
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenUpload}
            className="flex items-center gap-2 bg-[#FF7900] hover:bg-[#E66D00] text-white font-medium px-5 py-2.5 rounded-lg transition shadow-md shadow-orange-500/25 cursor-pointer text-sm"
          >
            <Upload size={18} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document name, company, code..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Visit Photograph">Visit Photographs</option>
            <option value="Site Survey Report">Site Survey Reports</option>
            <option value="Test Certificate">Test Certificates</option>
            <option value="Signed Challan">Signed Challans</option>
            <option value="Product Datasheet">Product Datasheets</option>
          </select>
        </div>
      </div>

      {/* Grid Card View for Attachments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    item.isImage
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.isImage ? <Image size={20} /> : <FileText size={20} />}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 truncate max-w-[140px]">
                  {item.category}
                </span>
              </div>

              <h4
                className="font-bold text-gray-900 text-xs truncate mt-2"
                title={item.name}
              >
                {item.name}
              </h4>
              <p
                className="text-[11px] text-gray-500 truncate mt-0.5"
                title={item.customerName}
              >
                {item.customerName}
              </p>

              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                <span>{item.fileSizeKB} KB</span>
                <span>•</span>
                <span>{item.uploadedDate}</span>
                {item.relatedActivityCode && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-semibold font-mono">
                      {item.relatedActivityCode}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                By {item.uploadedBy}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    alert(`Simulating document preview for: ${item.name}`)
                  }
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                  title="Preview / Download"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDeleteOpen(true);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 text-xs text-gray-600">
          <span>Showing {filteredItems.length} attachments</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 rounded bg-white disabled:text-gray-300"
            >
              <ChevronLeft size={14} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 rounded bg-white disabled:text-gray-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <form onSubmit={handleSaveUpload}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Upload size={18} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    Upload Sales Attachment
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <datalist id="att-customer-list">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Customer / Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="att-customer-list"
                    value={formCustomerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    placeholder="Type or select company name..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Select an existing company or type any custom company name.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Document Category (Master)
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >
                      {docTypes.length > 0 ? (
                        docTypes.map((dt) => (
                          <option key={dt.id} value={dt.value}>
                            {dt.value} ({dt.code})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Visit Photograph">Visit Photograph</option>
                          <option value="Site Survey Report">Site Survey Report</option>
                          <option value="Customer PO">Customer PO</option>
                          <option value="Technical Datasheet">Technical Datasheet</option>
                          <option value="MOM Document">MOM Document</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Related Activity Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formActivityCode}
                      onChange={(e) => setFormActivityCode(e.target.value)}
                      placeholder="e.g. ACT-2026-001"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Select File(s) <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-[#FF7900] rounded-xl cursor-pointer bg-gray-50 hover:bg-orange-50/20 transition">
                    <Upload size={22} className="text-[#FF7900] mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      Click to choose documents or photos
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      JPG, PNG, PDF, DOCX, XLSX
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((f, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-gray-600 bg-gray-100 p-1.5 rounded flex justify-between"
                        >
                          <span className="truncate">{f.name}</span>
                          <span className="text-gray-400">
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 text-sm bg-[#FF7900] hover:bg-[#E66D00] text-white rounded-lg font-medium cursor-pointer transition shadow-sm"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSaving ? "Uploading..." : "Save Upload"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Attachment"
        message={`Are you sure you want to delete "${selectedItem?.name}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AttachmentsMaster;
