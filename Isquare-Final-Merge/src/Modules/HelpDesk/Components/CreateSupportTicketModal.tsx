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

      toast.success(`Support ticket #${response.ticketNumber} created successfully!`);
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
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Clean with no description line */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#00234a] text-white border-b border-[#001833] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-orange-400">
              <Headphones size={18} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Create Support Ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Priority
              </label>
              <SearchableSelect
                value={priority}
                onChange={(val) => setPriority(String(val || "Medium"))}
                options={PRIORITY_OPTIONS}
                placeholder="Select Priority"
                isClearable={false}
                minHeight="38px"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
                Category
              </label>
              <SearchableSelect
                value={categoryId ? String(categoryId) : ""}
                onChange={(val) => setCategoryId(val ? String(val) : "")}
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Category"
                isClearable={true}
                minHeight="38px"
              />
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
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
              placeholder="Enter subject"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs font-medium"
            />
            {errors.subject && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.subject}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
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
              placeholder="Enter description"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 shadow-xs"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.description}
              </p>
            )}
          </div>

          {/* Attachments Section */}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
              Attachments
            </label>

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
              className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? "border-[#FF7900] bg-orange-50/50"
                  : "border-slate-300 hover:border-[#FF7900] bg-slate-50/50 hover:bg-orange-50/20"
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
              <Upload size={22} className="text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">
                Choose files or drag & drop
              </p>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, JPEG, PDF (Max 5MB)
              </p>
            </div>

            {errors.attachments && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.attachments}
              </p>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => {
                  const isImg = att.type.includes("image");
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                          {isImg ? <ImageIcon size={16} /> : <FileText size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{att.formattedSize}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(att.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                        title="Remove file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
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
