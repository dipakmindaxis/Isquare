import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Headphones,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import { SearchableSelect } from "../../../Components/Common/SearchableSelect";
import { buttonStyles } from "../../../Components/Common/buttonStyles";
import {
  createExternalSupportTicket,
  getTicketCategories,
  formatFileSize,
} from "../Services/HelpDeskService";
import type {
  TicketCategoryItem,
  TicketAttachment,
  TicketFormValidationErrors,
} from "../Types/HelpDeskTypes";

interface CreateSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticketNumber?: string) => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

export const CreateSupportTicketModal: React.FC<CreateSupportTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("Medium");
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);

  // UI State
  const [categories, setCategories] = useState<TicketCategoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<TicketFormValidationErrors>({});

  const resetForm = useCallback(() => {
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setCategoryId("");
    setAttachments([]);
    setErrors({});
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      getTicketCategories().then((cats) => setCategories(cats)).catch(() => {});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
        resetForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose, resetForm]);

  const validateFiles = (incomingFiles: File[]): { valid: TicketAttachment[]; error?: string } => {
    if (attachments.length + incomingFiles.length > MAX_FILES) {
      return {
        valid: [],
        error: `Maximum ${MAX_FILES} attachments allowed.`,
      };
    }

    const validItems: TicketAttachment[] = [];
    for (const file of incomingFiles) {
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
          valid: [],
          error: `Unsupported format: "${file.name}". Allowed: .jpg, .jpeg, .png, .pdf`,
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          valid: [],
          error: `"${file.name}" exceeds 5 MB limit.`,
        };
      }

      validItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        type: file.type || "application/octet-stream",
      });
    }

    return { valid: validItems };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = Array.from(e.target.files);
    const { valid, error } = validateFiles(selected);

    if (error) {
      setErrors((prev) => ({ ...prev, attachments: error }));
      toast.error(error);
    } else {
      setAttachments((prev) => [...prev, ...valid]);
      setErrors((prev) => ({ ...prev, attachments: undefined }));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setErrors((prev) => ({ ...prev, attachments: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: TicketFormValidationErrors = {};
    if (!subject.trim()) {
      errs.subject = "Subject is required.";
    } else if (subject.trim().length < 5) {
      errs.subject = "Subject must be at least 5 characters.";
    }

    if (!description.trim()) {
      errs.description = "Description is required.";
    } else if (description.trim().length < 10) {
      errs.description = "Description must be at least 10 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await createExternalSupportTicket(
        {
          subject: subject.trim(),
          description: description.trim(),
          priority: priority || "Medium",
          categoryId: categoryId || undefined,
          attachments: attachments.map((a) => a.file),
        },
        user
      );

      if (response.isOptimistic) {
        toast.success("Support ticket submitted successfully to MindAxis!");
      } else {
        toast.success(`Support ticket #${response.ticketNumber} created successfully!`);
      }
      resetForm();
      onClose();
      if (onSuccess) onSuccess(response.ticketNumber);
    } catch (err: any) {
      toast.error(err.message || "Failed to create support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Top Bar (matching AddCustomerModal top bar) */}
        <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
          <div className="flex items-center gap-2.5">
            <Headphones size={20} className="text-white" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Create Support Ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Single Unified Form matching Customer design */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-6 sm:p-8 bg-gray-50/60 space-y-6 overflow-y-auto">
            {/* SECTION 1: TICKET INFORMATION */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
                <div className="bg-[#FF7900] p-1.5 rounded text-white">
                  <Headphones size={14} />
                </div>
                <span>Section 1 - Ticket Information</span>
              </div>

              {/* Priority & Category in 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1">
                    Priority
                  </label>
                  <SearchableSelect
                    value={priority}
                    onChange={(val) => setPriority(String(val || "Medium"))}
                    options={PRIORITY_OPTIONS}
                    placeholder="Select Priority"
                    isClearable={false}
                    minHeight="44px"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1">
                    Category
                  </label>
                  <SearchableSelect
                    value={categoryId ? String(categoryId) : ""}
                    onChange={(val) => setCategoryId(val ? String(val) : "")}
                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                    placeholder="Select Category"
                    isClearable={true}
                    minHeight="44px"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  placeholder="Enter ticket subject"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 min-h-[44px]"
                />
                {errors.subject && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.subject}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="Describe your issue or query in detail"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm text-gray-700 min-h-[100px]"
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: ATTACHMENTS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
                <div className="bg-[#FF7900] p-1.5 rounded text-white">
                  <Upload size={14} />
                </div>
                <span>Section 2 - Attachments</span>
              </div>

              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const dropped = Array.from(e.dataTransfer.files);
                      const { valid, error } = validateFiles(dropped);
                      if (error) {
                        setErrors((prev) => ({ ...prev, attachments: error }));
                        toast.error(error);
                      } else {
                        setAttachments((prev) => [...prev, ...valid]);
                        setErrors((prev) => ({ ...prev, attachments: undefined }));
                      }
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-[#FF7900] bg-orange-50/50"
                      : "border-gray-300 hover:border-[#FF7900] bg-gray-50/50 hover:bg-orange-50/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF7900] flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Choose files or drag & drop here
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Supported formats: PNG, JPG, JPEG, PDF (Up to 5 files, Max 5MB each)
                    </p>
                  </div>
                </div>

                {errors.attachments && (
                  <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.attachments}
                  </p>
                )}

                {/* Attachments List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((att) => {
                      const isImg = att.type.includes("image");
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-blue-600 flex items-center justify-center shrink-0">
                              {isImg ? <ImageIcon size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate" title={att.name}>
                                {att.name}
                              </p>
                              <p className="text-[11px] text-gray-400">{att.formattedSize}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAttachment(att.id);
                            }}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer"
                            title="Remove file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions matching AddCustomerModal style */}
          <div className="p-4 sm:p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={buttonStyles.cancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupportTicketModal;
