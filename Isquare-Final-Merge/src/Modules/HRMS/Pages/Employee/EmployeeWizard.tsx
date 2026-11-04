import { useState, useEffect, useRef } from "react";
import {
  Building,
  MapPin,
  Globe,
  CreditCard,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import EmployeeDetailsTab from "./Tabs/EmployeeDetailsTab";
import type { EmployeeDetailsTabRef, Level } from "./Tabs/EmployeeDetailsTab";
import { getLevels } from "../../../RSM/Pages/Customer/Services/HierarchyLevelService";
import BankDetailsTab from "./Tabs/BankDetailsTab";
import EmployeeAddressTab from "./Tabs/EmployeeAddressTab";
// import { type Employee } from "../../HRMS/Pages/Employee/Services/EmployeeService";
import { type Employee } from "./Services/EmployeeSerivce";
import {
  getCompanies,
  getCountries,
  getDepartmentsList,
  getDesignationsList,
  getRoles,
  getStates,
  type CompanyItem,
  type CountryItem,
  type DepartmentItem,
  type DesignationItem,
  type Role,
  type StateItem,
} from "../../../HRMS/Services/MasterDataService";

import { API_ENDPOINTS } from "../../../../API/apiConfig";
import axios, { AxiosError } from "axios";
import ExpQualTab from "./Tabs/ExpQualTab";

type FormValue =
  | string
  | number
  | boolean
  | File[]
  | Qualification[]
  | Experience[]
  | null
  | undefined;
interface ApiErrorResponse {
  message?: string;
}

export interface Qualification {
  degree: string;
  university: string;
  passingYear: string;
  percentage: string;
}
export interface Experience {
  companyName: string;
  designation: string;
  fromDate: string;
  toDate: string;
  location: string;
}

export interface EmployeeFormData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  companyId: string | number;
  designationID: string | number;
  designationName: string;
  departmentID: string | number;
  levelID: string | number;
  reportingTo?: string | number;
  panNumber: string;
  aadhaarNumber: string;
  passportNumber: string;
  email: string;
  password: string;
  roleId?: string;
  // Address Fields
  curFlatNo: string;
  curPremisesName: string;
  curRoadName: string;
  curLocality: string;
  curTownDistrict: string;
  curPinNo: string;
  curCountryId: string | number;
  curStateId: string | number;
  curMobileNo: string;
  curAltMobileNo: string;
  curEmail: string;
  curAltEmail: string;
  permFlatNo: string;
  permPremisesName: string;
  permRoadName: string;
  permLocality: string;
  permTownDistrict: string;
  permPinNo: string;
  permCountryId: string | number;
  permStateId: string | number;
  permMobileNo: string;
  permAltMobileNo: string;
  permEmail: string;
  permAltEmail: string;
  // Bank Fields
  bankName: string;
  bankAddress: string;
  sortCode: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  swiftCode: string;
  ibanNo: string;
  attachments?: File[];
  qualifications: Qualification[];
  experiences: Experience[];
  [key: string]:
    | string
    | number
    | boolean
    | File[]
    | Qualification[]
    | Experience[]
    | null
    | undefined;

  pfDeductionPercentage?: number;
  isCappedAt15k?: boolean;
}

interface EmployeeWizardProps {
  editData?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const EmployeeWizard: React.FC<EmployeeWizardProps> = ({
  editData = null,
  onSuccess,
  onCancel,
}) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const initialFormState: EmployeeFormData = {
    employeeCode: "",
    firstName: "",
    lastName: "",
    companyId: "",
    designationID: "",
    designationName: "",
    departmentID: "",
    levelID: "",
  reportingTo: "",
    panNumber: "",
    aadhaarNumber: "",
    passportNumber: "",
    email: "",
    password: "Password@123",
    curFlatNo: "",
    curPremisesName: "",
    curRoadName: "",
    curLocality: "",
    curTownDistrict: "",
    curPinNo: "",
    curMobileNo: "",
    curCountryId: "",
    curStateId: "",
    curAltMobileNo: "",
    curAltEmail: "",
    curEmail: "",
    permFlatNo: "",
    permPremisesName: "",
    permRoadName: "",
    permLocality: "",
    permTownDistrict: "",
    permPinNo: "",
    permCountryId: "",
    permStateId: "",
    permMobileNo: "",
    permAltMobileNo: "",
    permEmail: "",
    permAltEmail: "",
    bankName: "",
    bankAddress: "",
    sortCode: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    swiftCode: "",
    ibanNo: "",
    attachments: [],
    qualifications: [
      { degree: "", university: "", passingYear: "", percentage: "" },
    ],
    experiences: [
      {
        companyName: "",
        designation: "",
        fromDate: "",
        toDate: "",
        location: "",
      },
    ],
  };

  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
  const employeeDetailsRef = useRef<EmployeeDetailsTabRef>(null);

  useEffect(() => {
    if (editData)
      setFormData((prev) => ({ ...prev, ...editData }) as EmployeeFormData);
  }, [editData]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          countryRes,
          stateRes,
          compRes,
          deptRes,
          designationRes,
          roleRes,
          levelRes,
        ] = await Promise.all([
          getCountries().catch(() => []),
          getStates().catch(() => []),
          getCompanies().catch(() => [
            { companyId: 1, companyName: "I-Square Safety Equipments Pvt. Ltd." },
          ]),
          getDepartmentsList().catch(() => []),
          getDesignationsList().catch(() => []),
          getRoles().catch(() => []),
          getLevels().catch(() => []),
        ]);
        if (Array.isArray(countryRes)) setCountries(countryRes);
        if (Array.isArray(stateRes)) setStates(stateRes);
        if (Array.isArray(compRes)) setCompanies(compRes);
        if (Array.isArray(deptRes)) setDepartments(deptRes);
        if (Array.isArray(designationRes)) setDesignations(designationRes);
        if (Array.isArray(roleRes)) setRoles(roleRes);
        if (Array.isArray(levelRes)) setLevels(levelRes as Level[]);
      } catch (err) {
        console.warn("Failed to load some master data:", err);
      }
    };
    fetchMasterData();
  }, []);

  // --- Validation functions for each tab ---
  const validateEmployeeDetails = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;

    if (!formData.employeeCode?.trim()) {
      newErrors.employeeCode = ["Employee Code is required"];
      hasErrors = true;
    } else delete newErrors.employeeCode;
    if (!formData.firstName?.trim()) {
      newErrors.firstName = ["Employee Name is required"];
      hasErrors = true;
    } else delete newErrors.firstName;
    if (!formData.designationID) {
      newErrors.designationID = ["Designation is required"];
      hasErrors = true;
    } else delete newErrors.designationID;
    if (!formData.companyId) {
      newErrors.companyId = ["Company is required"];
      hasErrors = true;
    } else delete newErrors.companyId;
    if (!formData.departmentID) {
      newErrors.departmentID = ["Department is required"];
      hasErrors = true;
    } else delete newErrors.departmentID;
    if (!formData.levelID) {
      newErrors.levelID = ["Level is required"];
      hasErrors = true;
    } else delete newErrors.levelID;
    if (!formData.roleId) {
      newErrors.roleId = ["Role is required"];
      hasErrors = true;
    } else delete newErrors.roleId;
    if (!formData.panNumber?.trim()) {
      newErrors.panNumber = ["PAN Number is required"];
      hasErrors = true;
    } else delete newErrors.panNumber;
    if (!formData.aadhaarNumber?.trim()) {
      newErrors.aadhaarNumber = ["Aadhaar Number is required"];
      hasErrors = true;
    } else delete newErrors.aadhaarNumber;
    if (!photoFile) {
      newErrors.photoFile = ["Photo is required"];
      hasErrors = true;
    } else delete newErrors.photoFile;
    if (!formData.attachments || formData.attachments.length === 0) {
      newErrors.attachments = ["At least one document is required"];
      hasErrors = true;
    } else delete newErrors.attachments;

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateCurrentAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    if (!formData.curEmail?.trim()) {
      newErrors.curEmail = ["Email Address is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.curEmail)) {
      newErrors.curEmail = ["Invalid email format"];
      hasErrors = true;
    } else delete newErrors.curEmail;
    setErrors(newErrors);
    return !hasErrors;
  };

  const validatePermanentAddress = (): boolean => {
    const newErrors: ValidationErrors = { ...errors };
    let hasErrors = false;
    if (!formData.permEmail?.trim()) {
      newErrors.permEmail = ["Email Address is required"];
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.permEmail)) {
      newErrors.permEmail = ["Invalid email format"];
      hasErrors = true;
    } else delete newErrors.permEmail;
    setErrors(newErrors);
    return !hasErrors;
  };

  const validateBankDetails = (): boolean => {
    return true;
  };

  const handleSave = async () => {
    // Validate all tabs before saving
    const isValid =
      validateEmployeeDetails() &&
      validateCurrentAddress() &&
      validatePermanentAddress() &&
      validateBankDetails();
    if (!isValid) {
      if (!validateEmployeeDetails()) scrollToSection("emp-section-0");
      else if (!validateCurrentAddress()) scrollToSection("emp-section-1");
      else if (!validatePermanentAddress()) scrollToSection("emp-section-2");
      else if (!validateBankDetails()) scrollToSection("emp-section-3");
      toast.error("Please fill all required fields");
      return;
    }

    const data = new FormData();
    const nameParts = formData.firstName.trim().split(/\s+/);
    const fName = nameParts[0] || "";
    const lName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";
    data.append("EmployeeCode", String(formData.employeeCode ?? ""));
    data.append("FirstName", fName);
    data.append("LastName", lName);
    data.append("Email", formData.curEmail);
    data.append("Password", formData.password);

    const appendIfValid = (key: string, value: FormValue): void => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== "0" &&
        value !== 0 &&
        typeof value !== "object"
      ) {
        data.append(key, String(value));
      }
    };
    appendIfValid("CompanyId", formData.companyId);
    data.append("Role", String(formData.roleId ?? ""));
    appendIfValid("DepartmentID", formData.departmentID);
    appendIfValid("DesignationID", formData.designationID);
    appendIfValid("LevelID", formData.levelID);
    appendIfValid("ReportingTo", formData.reportingTo);
    data.append("PANNumber", formData.panNumber);
    data.append("AadhaarNumber", formData.aadhaarNumber);
    data.append("PassportNumber", formData.passportNumber);

    data.append("CurFlatNo", formData.curFlatNo);
    data.append("CurPremisesName", formData.curPremisesName);
    data.append("CurRoadName", formData.curRoadName);
    data.append("CurLocality", formData.curLocality);
    data.append("CurTownDistrict", formData.curTownDistrict);
    data.append("CurPinNo", formData.curPinNo);
    data.append("CurMobileNo", formData.curMobileNo);
    data.append("CurEmail", formData.curEmail);
    appendIfValid("CurCountryId", formData.curCountryId);
    appendIfValid("CurStateId", formData.curStateId);

    data.append("PermFlatNo", formData.permFlatNo);
    data.append("PermPremisesName", formData.permPremisesName);
    data.append("PermRoadName", formData.permRoadName);
    data.append("PermLocality", formData.permLocality);
    data.append("PermTownDistrict", formData.permTownDistrict);
    data.append("PermPinNo", formData.permPinNo);
    data.append("PermMobileNo", formData.permMobileNo);
    data.append("PermEmail", formData.permEmail);
    appendIfValid("PermCountryId", formData.permCountryId);
    appendIfValid("PermStateId", formData.permStateId);

    data.append("BankName", formData.bankName);
    data.append("BankAddress", formData.bankAddress || "");
    data.append("SortCode", formData.sortCode || "");
    data.append("AccountNumber", formData.accountNumber);
    data.append("IFSCCode", formData.ifscCode);
    data.append("AccountHolderName", formData.accountHolderName);
    data.append("SwiftCode", formData.swiftCode || "");
    data.append("IBANNo", formData.ibanNo || "");

    if (photoFile) data.append("Photo", photoFile);
    if (Array.isArray(formData.attachments))
      formData.attachments.forEach((file) => data.append("Attachments", file));
    data.append("QualificationsJson", JSON.stringify(formData.qualifications));
    data.append("ExperiencesJson", JSON.stringify(formData.experiences));

    const token = sessionStorage.getItem("token");
    setIsSaving(true);
    try {
      toast.loading("Registering employee...", { id: "save-emp" });
      await axios.post(API_ENDPOINTS.Register, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee saved successfully!", { id: "save-emp" });
      onSuccess();
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Error saving employee", {
        id: "save-emp",
      });
    } finally {
      setIsSaving(false);
    }
  };

    const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSamePermanent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        permFlatNo: prev.curFlatNo,
        permPremisesName: prev.curPremisesName,
        permRoadName: prev.curRoadName,
        permLocality: prev.curLocality,
        permTownDistrict: prev.curTownDistrict,
        permPinNo: prev.curPinNo,
        permCountryId: prev.curCountryId,
        permStateId: prev.curStateId,
        permMobileNo: prev.curMobileNo,
        permAltMobileNo: prev.curAltMobileNo,
        permEmail: prev.curEmail,
        permAltEmail: prev.curAltEmail,
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
      {/* Orange Header - Only Employee Details */}
      <div className="flex items-center justify-between bg-[#FF7900] px-6 py-4 rounded-t-2xl shadow-md text-white">
        <div className="flex items-center gap-2.5">
          <Building className="w-5 h-5 text-white" />
          <h2 className="text-sm sm:text-base font-extrabold tracking-widest uppercase text-white">
            Employee Details
          </h2>
        </div>
      </div>

      {/* Single Page Section-Wise Content */}
      <div className="p-6 sm:p-8 bg-gray-50/60 space-y-8">
        {/* SECTION 1: EMPLOYEE DETAILS */}
        <div id="emp-section-0" className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 scroll-mt-16">
          <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
            <Building size={20} className="text-[#FF7900]" />
            <span>Section 1 - Employee Details</span>
          </div>
          <EmployeeDetailsTab
            ref={employeeDetailsRef}
            formData={formData}
            setFormData={setFormData}
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            companies={companies}
            departments={departments}
            designations={designations}
            roles={roles}
            levels={levels}
            errors={errors}
          />
        </div>

        {/* SECTION 2: CURRENT ADDRESS */}
        <div id="emp-section-1" className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 scroll-mt-16">
          <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
            <MapPin size={20} className="text-[#FF7900]" />
            <span>Section 2 - Current Address</span>
          </div>
          <EmployeeAddressTab
            type="cur"
            formData={formData}
            setFormData={setFormData}
            countries={countries}
            states={states}
            errors={errors}
          />
        </div>

        {/* SECTION 3: PERMANENT ADDRESS */}
        <div id="emp-section-2" className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 scroll-mt-16">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base">
              <Globe size={20} className="text-[#FF7900]" />
              <span>Section 3 - Permanent Address</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="samePermAddress"
                className="h-4 w-4 text-[#FF7900] rounded focus:ring-[#FF7900] cursor-pointer"
                onChange={handleSamePermanent}
              />
              <label htmlFor="samePermAddress" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Same as Current Address
              </label>
            </div>
          </div>
          <EmployeeAddressTab
            type="perm"
            formData={formData}
            setFormData={setFormData}
            countries={countries}
            states={states}
            errors={errors}
          />
        </div>

        {/* SECTION 4: BANK DETAILS */}
        <div id="emp-section-3" className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 scroll-mt-16">
          <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
            <CreditCard size={20} className="text-[#FF7900]" />
            <span>Section 4 - Bank Details</span>
          </div>
          <BankDetailsTab formData={formData} setFormData={setFormData} />
        </div>

        {/* SECTION 5: EXPERIENCE & QUALIFICATIONS */}
        <div id="emp-section-4" className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5 scroll-mt-16">
          <div className="flex items-center gap-2.5 text-[#FF7900] font-bold text-base border-b border-orange-100 pb-3">
            <GraduationCap size={20} className="text-[#FF7900]" />
            <span>Section 5 - Experience & Qualifications</span>
          </div>
          <ExpQualTab formData={formData} setFormData={setFormData} />
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="p-5 bg-white flex justify-end gap-3 border-t border-gray-200 sticky bottom-0 z-20 shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-[#FF7900] hover:bg-[#e06800] text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Saving Employee...
            </>
          ) : (
            "Save Employee"
          )}
        </button>
      </div>
    </div>
  );
};

export default EmployeeWizard;
