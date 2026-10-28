import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Camera, FileText, UploadCloud, X, Check } from "lucide-react";
import Select from "react-select";
import type {
  CustomerOption,
  ActivityOption,
  DocumentTypeOption,
} from "../Types/SalesAttachmentTypes";

interface FormData {
  documentType: string;
  customerId: number | null;
  enquiryId: string;
  salesActivityId: number | null;
  remarks: string;
  file: File | null;
}

interface SalesAttachmentDetailsTabProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  customers: CustomerOption[];
  docTypes: DocumentTypeOption[];
  activities: ActivityOption[];
  enquiries?: { code: string; title?: string }[];
  errors?: { [key: string]: string[] };
}

export interface SalesAttachmentDetailsTabRef {
  validate: () => boolean;
}

const SalesAttachmentDetailsTab = forwardRef<
  SalesAttachmentDetailsTabRef,
  SalesAttachmentDetailsTabProps
>(({ formData, setFormData, customers, docTypes, activities, enquiries = [], errors = {} }, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const validate = (): boolean => {
    return true;
  };

  useImperativeHandle(ref, () => ({ validate }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFormData((prev) => ({ ...prev, file: selectedFile }));
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const selectedDocTypeValue =
    docTypes.find((d) => d.value === formData.documentType) || null;
  const selectedCustomerValue =
    customers.find((c) => c.value === formData.customerId) || null;
  const selectedActivityValue =
    activities.find((a) => a.value === formData.salesActivityId) || null;

  const getInputBorderClass = (field: string) =>
    errors[field]
      ? "border-red-500 shadow-sm shadow-red-200"
      : "border-gray-300 focus:border-[#F37021] focus:ring-1 focus:ring-orange-200";

  const baseInputStyle =
    "w-full rounded-lg px-4 py-2.5 outline-none border bg-white text-sm transition";

  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block";

  const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;

  const selectStyles = (hasError: boolean) => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 46,
      borderRadius: "0.5rem",
      borderColor: hasError ? "#ef4444" : state.isFocused ? "#F37021" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #F37021" : "none",
      "&:hover": {
        borderColor: hasError ? "#ef4444" : "#F37021",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#00234a"
        : state.isFocused
        ? "#fff5ed"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#172b4d",
      fontSize: "13px",
      cursor: "pointer",
    }),
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
        {/* Left Form Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {/* Document Type */}
          <div>
            <label className={labelStyle}>
              DOCUMENT TYPE
              <RequiredAst />
            </label>
            <Select
              options={docTypes}
              value={selectedDocTypeValue}
              onChange={(opt) =>
                setFormData((prev) => ({
                  ...prev,
                  documentType: opt?.value || "",
                }))
              }
              isClearable
              isSearchable
              placeholder="Select Document Type..."
              styles={selectStyles(!!errors.documentType)}
            />
            {errors.documentType && (
              <p className="text-xs text-red-500 mt-1">{errors.documentType[0]}</p>
            )}
          </div>

          {/* Select Customer */}
          <div>
            <label className={labelStyle}>
              SELECT CUSTOMER
              <RequiredAst />
            </label>
            <Select
              options={customers}
              value={selectedCustomerValue}
              onChange={(opt) =>
                setFormData((prev) => ({
                  ...prev,
                  customerId: opt?.value || null,
                }))
              }
              isClearable
              isSearchable
              placeholder="Select Customer..."
              styles={selectStyles(!!errors.customerId)}
            />
            {errors.customerId && (
              <p className="text-xs text-red-500 mt-1">{errors.customerId[0]}</p>
            )}
          </div>

          {/* Enquiry ID */}
          <div className="relative">
            <label className={labelStyle}>ENQUIRY ID / NO.</label>
            <input
              type="text"
              list="enquiry-id-datalist"
              placeholder="e.g. ENQ-2026-089"
              className={`${baseInputStyle} ${getInputBorderClass("enquiryId")}`}
              value={formData.enquiryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, enquiryId: e.target.value }))
              }
            />
            {enquiries && enquiries.length > 0 && (
              <datalist id="enquiry-id-datalist">
                {enquiries.map((enq) => (
                  <option key={enq.code} value={enq.code}>
                    {enq.title || enq.code}
                  </option>
                ))}
              </datalist>
            )}
            {errors.enquiryId && (
              <p className="text-xs text-red-500 mt-1">{errors.enquiryId[0]}</p>
            )}
          </div>

          {/* Sales Activity */}
          <div>
            <label className={labelStyle}>SALES ACTIVITY</label>
            <Select
              options={activities}
              value={selectedActivityValue}
              onChange={(opt) =>
                setFormData((prev) => ({
                  ...prev,
                  salesActivityId: opt?.value || null,
                }))
              }
              isClearable
              isSearchable
              placeholder="Select Related Sales Activity..."
              styles={selectStyles(!!errors.salesActivityId)}
            />
            {errors.salesActivityId && (
              <p className="text-xs text-red-500 mt-1">{errors.salesActivityId[0]}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="relative md:col-span-2">
            <label className={labelStyle}>REMARKS / DESCRIPTION</label>
            <textarea
              rows={2}
              placeholder="Enter details, description or purpose of this sales attachment..."
              className={`${baseInputStyle} ${getInputBorderClass("remarks")} resize-none`}
              value={formData.remarks}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remarks: e.target.value }))
              }
            />
          </div>

          {/* Docs Attachments Browse Row */}
          <div className="relative md:col-span-2">
            <label className={labelStyle}>
              DOCS ATTACHMENTS
              <RequiredAst />
            </label>
            <div className="flex border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-[#F37021] transition">
              <div
                className="grow px-4 py-2.5 text-gray-700 text-xs italic truncate flex items-center gap-2"
                title={formData.file ? formData.file.name : ""}
              >
                {formData.file ? (
                  <span className="font-medium text-[#00234a] not-italic flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" />
                    {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <span className="text-gray-400">Choose file...</span>
                )}
              </div>
              <input
                type="file"
                ref={docInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="bg-[#00234a] hover:bg-[#F37021] text-white px-7 font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                Browse
              </button>
            </div>
            {errors.file && (
              <p className="text-xs text-red-500 mt-1">{errors.file[0]}</p>
            )}
          </div>
        </div>

        {/* Right Preview & Uploader Card (Identical to Employee module UI) */}
        <aside className="xl:pt-2">
          <div
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
            aria-label="Attachment photo uploader"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                ATTACHMENT PREVIEW
              </h3>
              {formData.file ? (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X size={13} /> Remove
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-red-500">
                  Required
                </span>
              )}
            </div>

            <div className="mx-auto flex h-48 w-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-inner">
              {preview ? (
                <img
                  src={preview}
                  alt="Attachment preview"
                  className="h-full w-full object-cover"
                />
              ) : formData.file ? (
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#F37021] mb-2">
                    <FileText size={26} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 line-clamp-2 max-w-[130px] break-all">
                    {formData.file.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    {(formData.file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Camera className="h-7 w-7 text-slate-400" />
                  </div>
                  <span className="text-center text-[11px] font-medium uppercase tracking-[0.2em]">
                    Upload
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full rounded-xl bg-[#00234a] hover:bg-[#F37021] py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud size={15} /> UPLOAD
            </button>

            <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
              JPG / PNG / PDF UP TO 10MB
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
});

export default SalesAttachmentDetailsTab;
