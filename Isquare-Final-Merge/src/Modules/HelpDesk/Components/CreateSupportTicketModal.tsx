import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  getTicketPriorities,
  getTicketCategories,
  createSupportTicket,
  formatFileSize,
} from "../Services/HelpDeskService";
import type {
  TicketCategoryItem,
  TicketPriorityItem,
  TicketAttachment,
  TicketFormValidationErrors,
} from "../Types/HelpDeskTypes";

interface CreateSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

export const CreateSupportTicketModal: React.FC<CreateSupportTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [priorityId, setPriorityId] = useState<string | number>("");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);

  // UI State
  const [categories, setCategories] = useState<TicketCategoryItem[]>([]);
  const [priorities, setPriorities] = useState<TicketPriorityItem[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<TicketFormValidationErrors>({});
  const [apiUnavailableNotice, setApiUnavailableNotice] = useState<string | null>(null);

  // Reset form helper
  const resetForm = useCallback(() => {
    setCategoryId("");
    setPriorityId("");
    setSubject("");
    setDescription("");
    setAttachments([]);
    setErrors({});
    setIsDragging(false);
    setApiUnavailableNotice(null);
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
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

  // Load dynamic data from real backend APIs on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingMasters(true);
    setErrors({});

    const loadMasters = async () => {
      try {
        const [prios, cats] = await Promise.all([
          getTicketPriorities().catch(() => []),
          getTicketCategories().catch(() => []),
        ]);

        if (!isMounted) return;

        setPriorities(prios);
        setCategories(cats);

        // Pre-select priority if Medium or first active exists
        if (prios.length > 0) {
          const medium = prios.find((p) => p.name.toLowerCase().includes("medium")) || prios[0];
          setPriorityId(medium.id);
        }

        // Pre-select category if categories exist from backend
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        } else {
          setApiUnavailableNotice(
            "Note: Backend categories endpoint is not yet connected. Priority is loaded dynamically from Priority Master."
          );
        }
      } catch (err) {
        console.warn("Failed to load ticket dropdown data:", err);
      } finally {
        if (isMounted) setIsLoadingMasters(false);
      }
    };

    loadMasters();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // File validation and handling
  const handleFiles = (incomingFiles: FileList | File[]) => {
    const fileArray = Array.from(incomingFiles);
    if (fileArray.length === 0) return;

    const newAttachments: TicketAttachment[] = [...attachments];
    let hasTypeError = false;
    let hasSizeError = false;
    let hasCountWarning = false;

    for (const file of fileArray) {
      // Check total file count limit
      if (newAttachments.length >= MAX_FILES) {
        hasCountWarning = true;
        break;
      }

      // Check file extension and mime type
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isTypeAllowed =
        ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
        ALLOWED_EXTENSIONS.includes(ext);

      if (!isTypeAllowed) {
        hasTypeError = true;
        continue;
      }

      // Check max file size (5 MB)
      if (file.size > MAX_FILE_SIZE) {
        hasSizeError = true;
        continue;
      }

      // Avoid duplicate file names of same size
      const isDuplicate = newAttachments.some(
        (a) => a.name === file.name && a.size === file.size
      );
      if (!isDuplicate) {
        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          formattedSize: formatFileSize(file.size),
          type: file.type || ext,
        });
      }
    }

    if (hasTypeError) {
      toast.error("Only JPG, JPEG, PNG, and PDF files are allowed.");
    }
    if (hasSizeError) {
      toast.error("Files exceeding 5 MB were skipped.");
    }
    if (hasCountWarning) {
      toast.warning("Maximum 5 attachments allowed. Remaining files were ignored.");
    }

    setAttachments(newAttachments);
    if (newAttachments.length > 0 && errors.attachments) {
      setErrors((prev) => ({ ...prev, attachments: undefined }));
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: TicketFormValidationErrors = {};

    if (!categoryId && categories.length > 0) {
      newErrors.category = "Please select a category.";
    }
    if (!priorityId) {
      newErrors.priority = "Please select a priority.";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters long.";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.trim().length < 5) {
      newErrors.description = "Description must provide sufficient detail (at least 5 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // If categories are required but backend has none yet
    if (categories.length === 0 && !categoryId) {
      toast.warning(
        "Help Desk category service is not yet deployed on backend. Cannot submit without dynamic categories."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));
      const selectedPriority = priorities.find((p) => String(p.id) === String(priorityId));

      const payload = {
        categoryId,
        categoryName: selectedCategory?.name,
        priorityId,
        priorityName: selectedPriority?.name,
        subject: subject.trim(),
        description: description.trim(),
        attachments: attachments.map((a) => a.file),
        createdById: Number(user?.employeeId || 1),
        createdByName: user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        createdByEmail: user?.email,
      };

      const result = await createSupportTicket(payload);

      if (result.success) {
        toast.success(result.message || "Support ticket created successfully!");
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        if (!result.isEndpointConfigured) {
          toast.error(result.message, {
            duration: 6000,
          });
        } else {
          toast.error(result.message || "Failed to create support ticket.");
        }
      }
    } catch (err: any) {
      console.error("Ticket submission error:", err);
      toast.error("An error occurred while creating the ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="helpdesk-modal-title"
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================== */}
        {/* Modal Header                               */}
        {/* ========================================== */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
              <Headphones size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="helpdesk-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight"
              >
                Create Support Ticket
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Log a new internal or customer-related support request
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate("/rsm/support-tickets");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title="View your existing tickets"
            >
              My Tickets →
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Backend Endpoint Notice if not connected */}
        {apiUnavailableNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{apiUnavailableNotice}</p>
          </div>
        )}

        {/* ========================================== */}
        {/* Modal Body / Form                          */}
        {/* ========================================== */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 sm:space-y-5">
          {/* Row 1: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              {categories.length > 0 ? (
                <SearchableSelect
                  value={categoryId}
                  onChange={(val) => {
                    setCategoryId(val);
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }
                  }}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select Category..."
                  isLoading={isLoadingMasters}
                  hasError={Boolean(errors.category)}
                  minHeight="42px"
                />
              ) : (
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                    disabled={isLoadingMasters}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white outline-none transition appearance-none cursor-pointer ${
                      errors.category
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    } text-gray-800`}
                  >
                    <option value="">
                      {isLoadingMasters ? "Loading categories..." : "No categories configured on server"}
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              )}
              {errors.category && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.category}</p>
              )}
            </div>

            {/* Priority Dropdown (Loaded from /api/priority) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={priorityId}
                  onChange={(e) => {
                    setPriorityId(e.target.value);
                    if (errors.priority) {
                      setErrors((prev) => ({ ...prev, priority: undefined }));
                    }
                  }}
                  disabled={isLoadingMasters}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white outline-none transition appearance-none cursor-pointer ${
                    errors.priority
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  } text-gray-800`}
                >
                  <option value="">
                    {isLoadingMasters ? "Loading priorities..." : "Select Priority..."}
                  </option>
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {errors.priority && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Row 2: Subject */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) {
                  setErrors((prev) => ({ ...prev, subject: undefined }));
                }
              }}
              placeholder="Brief summary of the issue or request"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition ${
                errors.subject
                  ? "border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
              maxLength={200}
            />
            {errors.subject && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.subject}</p>
            )}
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="Provide detailed information regarding the support request..."
              rows={4}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition resize-y min-h-[96px] ${
                errors.description
                  ? "border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Row 4: Attachments */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Attachments (JPG, JPEG, PNG, PDF ONLY • MAX 5 FILES • 5 MB EACH)
              </label>
              <span className="text-[11px] font-semibold text-gray-500">
                {attachments.length} / {MAX_FILES} selected
              </span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-gray-300 hover:border-blue-400 bg-gray-50/40 hover:bg-blue-50/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-200/80 flex items-center justify-center text-gray-500 mb-2">
                <Upload size={18} className="text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Click to browse or drop files here
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Images (JPG, PNG) or documents (PDF) up to 5 MB
              </p>
            </div>

            {/* Selected Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
                {attachments.map((item) => {
                  const isPdf = item.type.includes("pdf") || item.name.toLowerCase().endsWith(".pdf");
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {isPdf ? (
                          <FileText size={16} className="text-red-500 shrink-0" />
                        ) : (
                          <ImageIcon size={16} className="text-blue-500 shrink-0" />
                        )}
                        <span className="font-medium text-gray-800 truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-gray-400 shrink-0 font-normal">
                          ({item.formattedSize})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition cursor-pointer shrink-0"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* Modal Footer                               */}
          {/* ========================================== */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (categories.length === 0 && !categoryId)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-blue-300 disabled:cursor-not-allowed rounded-xl shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Create Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
