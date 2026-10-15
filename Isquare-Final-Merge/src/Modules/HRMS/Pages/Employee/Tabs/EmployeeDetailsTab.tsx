import React, {
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Camera, UploadCloud, X } from "lucide-react";
import type { EmployeeFormData } from "../EmployeeWizard";
import type {
  CompanyItem,
  DepartmentItem,
  DesignationItem,
  Role,
} from "../../../../HRMS/Services/MasterDataService";
import Select from "react-select";

export interface Level {
  id: number;
  levelName: string;
  levelOrder: number;
}

interface EmployeeDetailsTabProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  companies: CompanyItem[];
  departments: DepartmentItem[];
  designations: DesignationItem[];
  roles: Role[];
  levels: Level[];
  errors?: { [key: string]: string[] };
}

export interface EmployeeDetailsTabRef {
  validate: () => boolean;
}

const EmployeeDetailsTab = forwardRef<
  EmployeeDetailsTabRef,
  EmployeeDetailsTabProps
>(
  (
    {
      formData,
      setFormData,
      photoFile,
      setPhotoFile,
      companies,
      departments,
      designations,
      roles,
      levels,
      errors = {},
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const validate = (): boolean => {
      return true;
    };

    useImperativeHandle(ref, () => ({ validate }));

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhotoFile(file);
        setPreview(URL.createObjectURL(file));
      }
    };

    const clearPhoto = () => {
      setPhotoFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, attachments: filesArray }));
      }
    };

    const companyOptions = useMemo(
      () =>
        companies.map((c) => ({ value: c.companyId, label: c.companyName })),
      [companies],
    );
    const departmentOptions = useMemo(
      () => departments.map((c) => ({ value: c.id, label: c.departmentName })),
      [departments],
    );
    const designationOptions = useMemo(
      () =>
        designations.map((c) => ({ value: c.id, label: c.designationName })),
      [designations],
    );

    const levelOptions = useMemo(
      () =>
        levels.map((l) => ({
          value: l.id,
          label: `${l.levelOrder} (${l.levelName})`,
        })),
      [levels],
    );

    const selectedCompanyValue =
      companyOptions.find(
        (c) => String(c.value) === String(formData.companyId),
      ) || null;
    const selectedDepartmentValue =
      departmentOptions.find(
        (c) => String(c.value) === String(formData.departmentID),
      ) || null;
    const selectedDesignationValue =
      designationOptions.find(
        (c) => String(c.value) === String(formData.designationID),
      ) || null;
    const selectedLevelValue =
      levelOptions.find((l) => String(l.value) === String(formData.levelID)) ||
      null;

    const getInputBorderClass = (field: string) =>
      errors[field]
        ? "border-red-500 shadow-sm shadow-red-200"
        : "border-gray-300";
    const baseInputStyle =
      "w-full rounded-lg px-4 py-2.5 outline-none border bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition";
    const labelStyle =
      "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
    const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;
    const selectStyles = (hasError: boolean) => ({
      control: (base: any) => ({
        ...base,
        minHeight: 46,
        borderRadius: "0.5rem",
        borderColor: hasError ? "#ef4444" : "#d1d5db",
        boxShadow: hasError ? "0 1px 2px 0 rgb(255 192 203 / 0.5)" : "none",
      }),
    });

    const photoUrl = preview || (photoFile ? URL.createObjectURL(photoFile) : null);

    return (
      <div className="flex flex-col gap-8">
        <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <div className="relative">
              <label className={labelStyle}>
                Employee Code
                <RequiredAst />
              </label>
              <input
                placeholder="Enter Employee Code"
                className={`${baseInputStyle} ${getInputBorderClass("employeeCode")}`}
                value={String(formData.employeeCode ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeCode: e.target.value,
                  }))
                }
              />
              {errors.employeeCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.employeeCode[0]}
                </p>
              )}
            </div>

            <div className="relative xl:col-span-1">
              <label className={labelStyle}>
                Employee Name
                <RequiredAst />
              </label>
              <input
                placeholder="Enter Employee Name"
                className={`${baseInputStyle} ${getInputBorderClass("firstName")}`}
                value={String(formData.firstName ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName[0]}</p>
              )}
            </div>

            <div>
              <label className={labelStyle}>
                Designation
                <RequiredAst />
              </label>
              <Select
                options={designationOptions}
                value={selectedDesignationValue}
                onChange={(opt) =>
                  setFormData((prev) => ({
                    ...prev,
                    designationID: opt?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Select Designation..."
                styles={selectStyles(!!errors.designationID)}
              />
              {errors.designationID && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.designationID[0]}
                </p>
              )}
            </div>

            <div>
              <label className={labelStyle}>
                Select Company
                <RequiredAst />
              </label>
              <Select
                options={companyOptions}
                value={selectedCompanyValue}
                onChange={(opt) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyId: opt?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Select Company..."
                styles={selectStyles(!!errors.companyId)}
              />
              {errors.companyId && (
                <p className="text-xs text-red-500 mt-1">{errors.companyId[0]}</p>
              )}
            </div>

            <div>
              <label className={labelStyle}>
                Department
                <RequiredAst />
              </label>
              <Select
                options={departmentOptions}
                value={selectedDepartmentValue}
                onChange={(opt) =>
                  setFormData((prev) => ({
                    ...prev,
                    departmentID: opt?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Select Department..."
                styles={selectStyles(!!errors.departmentID)}
              />
              {errors.departmentID && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.departmentID[0]}
                </p>
              )}
            </div>

            <div>
              <label className={labelStyle}>
                Role
                <RequiredAst />
              </label>
              <Select
                options={roles.map((r) => ({ value: r.name, label: r.name }))}
                value={
                  roles
                    .map((r) => ({ value: r.name, label: r.name }))
                    .find((r) => r.value === formData.roleId) || null
                }
                onChange={(opt) =>
                  setFormData((prev) => ({ ...prev, roleId: opt?.value || "" }))
                }
                isClearable
                isSearchable
                placeholder="Select Role..."
                styles={selectStyles(!!errors.roleId)}
              />
              {errors.roleId && (
                <p className="text-xs text-red-500 mt-1">{errors.roleId[0]}</p>
              )}
            </div>

            <div>
              <label className={labelStyle}>
                Level
                <RequiredAst />
              </label>
              <Select
                options={levelOptions}
                value={selectedLevelValue}
                onChange={(opt) =>
                  setFormData((prev) => ({
                    ...prev,
                    levelID: opt?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Select Level..."
                styles={selectStyles(!!errors.levelID)}
              />
              {errors.levelID && (
                <p className="text-xs text-red-500 mt-1">{errors.levelID[0]}</p>
              )}
            </div>

            <div className="relative">
              <label className={labelStyle}>
                PAN No.
                <RequiredAst />
              </label>
              <input
                placeholder="Enter PAN Number"
                className={`${baseInputStyle} ${getInputBorderClass("panNumber")}`}
                value={String(formData.panNumber ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, panNumber: e.target.value }))
                }
              />
              {errors.panNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.panNumber[0]}</p>
              )}
            </div>

            <div className="relative">
              <label className={labelStyle}>
                Aadhar No.
                <RequiredAst />
              </label>
              <input
                placeholder="Enter Aadhaar Number"
                className={`${baseInputStyle} ${getInputBorderClass("aadhaarNumber")}`}
                value={String(formData.aadhaarNumber ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    aadhaarNumber: e.target.value,
                  }))
                }
              />
              {errors.aadhaarNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.aadhaarNumber[0]}
                </p>
              )}
            </div>

            <div className="relative">
              <label className={labelStyle}>Passport No.</label>
              <input
                placeholder="Enter Passport Number"
                className={`${baseInputStyle} ${getInputBorderClass("passportNumber")}`}
                value={String(formData.passportNumber ?? "")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    passportNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="relative md:col-span-2">
              <label className={labelStyle}>
                Docs Attachments
                <RequiredAst />
              </label>
              <div className="flex border border-gray-300 rounded-2xl overflow-hidden bg-white">
                <div
                  className="grow px-4 py-2.5 text-gray-700 text-xs italic truncate"
                  title={
                    Array.isArray(formData.attachments)
                      ? formData.attachments.map((f: File) => f.name).join(", ")
                      : ""
                  }
                >
                  {Array.isArray(formData.attachments) &&
                  formData.attachments.length > 0
                    ? formData.attachments.map((f: File) => f.name).join(", ")
                    : "Choose files..."}
                </div>
                <input
                  type="file"
                  ref={docInputRef}
                  multiple
                  className="hidden"
                  onChange={handleAttachments}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="bg-[#154068] text-white px-6 font-bold text-sm hover:bg-[#0d3357] transition-colors"
                >
                  Browse
                </button>
              </div>
              {errors.attachments && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.attachments[0]}
                </p>
              )}
            </div>
          </div>

          <aside className="xl:pt-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-label="Employee photo uploader">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Employee Photo
                </h3>
                {errors.photoFile && (
                  <span className="text-[10px] font-semibold text-red-500">
                    Required
                  </span>
                )}
              </div>

              <div className="mx-auto flex h-48 w-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Employee preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <Camera className="h-7 w-7" />
                    </div>
                    <span className="text-center text-[11px] font-medium uppercase tracking-[0.2em]">
                      Upload
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#154068] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#0d3357]"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload
                </button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-red-200 hover:text-red-500"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
                JPG / PNG up to 5MB
              </p>
              {errors.photoFile && (
                <p className="mt-2 text-center text-xs text-red-500">
                  {errors.photoFile[0]}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  },
);

export default EmployeeDetailsTab;
