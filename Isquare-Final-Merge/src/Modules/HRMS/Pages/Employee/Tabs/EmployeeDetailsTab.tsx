import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Camera, UploadCloud } from "lucide-react";
import type { EmployeeFormData } from "../EmployeeWizard";
import type {
  CompanyItem,
  DepartmentItem,
  DesignationItem,
  Role,
} from "../../../../HRMS/Services/MasterDataService";
import Select from "react-select";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

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

    const [reportingManagers, setReportingManagers] = useState<
      Array<{ value: number; label: string }>
    >([]);
    const [isLoadingManagers, setIsLoadingManagers] = useState(false);

    useEffect(() => {
      let isMounted = true;
      const loadManagers = async () => {
        const selectedDesig = designations.find(
          (d) => String(d.id) === String(formData.designationID)
        );
        const desigName = (selectedDesig?.designationName || "").toLowerCase();

        // Director: no reporting manager required
        if (desigName.includes("director")) {
          if (isMounted) {
            setReportingManagers([]);
            if (formData.reportingTo) {
              setFormData((prev) => ({ ...prev, reportingTo: "" }));
            }
          }
          return;
        }

        setIsLoadingManagers(true);
        try {
          let params: { designation?: string; role?: string } = {};
          if (desigName.includes("bde")) {
            params = { designation: "Director" };
          } else if (
            desigName.includes("sales coordinator") ||
            desigName.includes("coordinator")
          ) {
            params = { designation: "BDE" };
          }

          const activeUrl = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`;
          const res = await apiClient.get<any[]>(activeUrl, { params });
          const list = Array.isArray(res.data) ? res.data : [];
          if (isMounted) {
            const opts = list.map((e: any) => {
              const name =
                e.fullName ||
                e.FullName ||
                `${e.firstName || ""} ${e.lastName || ""}`.trim() ||
                `Employee #${e.id || e.ID}`;
              const code = e.employeeCode || e.EmployeeCode ? ` (${e.employeeCode || e.EmployeeCode})` : "";
              const desig = e.designationName || e.DesignationName ? ` - ${e.designationName || e.DesignationName}` : "";
              return {
                value: Number(e.id || e.ID),
                label: `${name}${code}${desig}`,
              };
            });
            setReportingManagers(opts);

            if (formData.reportingTo && !opts.some((o) => String(o.value) === String(formData.reportingTo))) {
              setFormData((prev) => ({ ...prev, reportingTo: "" }));
            }
          }
        } catch (err) {
          console.error("Failed to load reporting managers:", err);
        } finally {
          if (isMounted) setIsLoadingManagers(false);
        }
      };

      loadManagers();
      return () => {
        isMounted = false;
      };
    }, [formData.designationID, designations]);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhotoFile(file);
        setPreview(URL.createObjectURL(file));
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

    const roleOptions = useMemo(
      () => roles.map((r) => ({ value: r.id, label: r.name })),
      [roles]
    );
    const selectedRoleValue =
      roleOptions.find((r) => String(r.value) === String(formData.roleId)) || null;

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
      "w-full rounded-lg px-4 py-2.5 outline-none border bg-white text-sm focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition";
    const labelStyle =
      "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
    const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;
    const selectStyles = (hasError: boolean) => ({
      control: (base: any, state: any) => ({
        ...base,
        minHeight: 44,
        borderRadius: "0.5rem",
        borderColor: hasError ? "#ef4444" : state.isFocused ? "#FF7900" : "#d1d5db",
        boxShadow: state.isFocused
          ? hasError
            ? "0 0 0 1px #ef4444"
            : "0 0 0 1px #FF7900"
          : "none",
        "&:hover": {
          borderColor: hasError ? "#ef4444" : "#FF7900",
        },
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#FF7900"
          : state.isFocused
          ? "#fff7ed"
          : "transparent",
        color: state.isSelected ? "#ffffff" : "#1f2937",
        cursor: "pointer",
        "&:active": {
          backgroundColor: "#FF7900",
          color: "#ffffff",
        },
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
                Reporting To
                {(() => {
                  const selectedDesig = designations.find(
                    (d) => String(d.id) === String(formData.designationID)
                  );
                  const desigName = (selectedDesig?.designationName || "").toLowerCase();
                  if (desigName.includes("bde") || desigName.includes("coordinator")) {
                    return <RequiredAst />;
                  }
                  return null;
                })()}
              </label>
              <Select
                options={reportingManagers}
                value={
                  reportingManagers.find(
                    (m) => String(m.value) === String(formData.reportingTo)
                  ) || null
                }
                onChange={(opt) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportingTo: opt?.value || "",
                  }))
                }
                isDisabled={(() => {
                  const selectedDesig = designations.find(
                    (d) => String(d.id) === String(formData.designationID)
                  );
                  const desigName = (selectedDesig?.designationName || "").toLowerCase();
                  return desigName.includes("director") || !formData.designationID;
                })()}
                isClearable
                isSearchable
                placeholder={
                  (() => {
                    const selectedDesig = designations.find(
                      (d) => String(d.id) === String(formData.designationID)
                    );
                    const desigName = (selectedDesig?.designationName || "").toLowerCase();
                    if (desigName.includes("director")) {
                      return "No Reporting Manager (Director)";
                    }
                    if (isLoadingManagers) {
                      return "Loading managers...";
                    }
                    if (!formData.designationID) {
                      return "Select Designation First";
                    }
                    return "Select Reporting Manager...";
                  })()
                }
                styles={selectStyles(false)}
              />
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
                options={roleOptions}
                value={selectedRoleValue}
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
                  setFormData((prev) => ({ ...prev, levelID: opt?.value || "" }))
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
          </div>

          <aside className="xl:pt-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-label="Employee photo uploader">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Employee Photo
                </h3>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  Required
                </span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white transition hover:border-[#FF7900] hover:bg-orange-50/20"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Employee preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#FF7900]">
                    <Camera size={32} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Upload
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhoto}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF7900] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/20 transition hover:bg-[#e06800] cursor-pointer"
              >
                <UploadCloud size={16} />
                <span>Upload</span>
              </button>
              <p className="mt-2 text-center text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                JPG / PNG UP TO 5MB
              </p>
              {errors.photoFile && (
                <p className="text-xs text-red-500 mt-2 text-center font-medium">
                  {errors.photoFile[0]}
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* BELOW PHOTO: 1 LINE ME 3 ATTRIBUTES (COLUMNS) SAME ALIGNMENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-2">
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
                setFormData((prev) => ({ ...prev, panNumber: e.target.value.toUpperCase() }))
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
        </div>

        {/* Docs Attachments */}
        <div className="relative pt-1">
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
              className="bg-[#FF7900] text-white px-6 font-bold text-sm hover:bg-[#e06800] transition-colors cursor-pointer"
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
    );
  },
);

export default EmployeeDetailsTab;
