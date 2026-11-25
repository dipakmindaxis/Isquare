import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { toast } from "sonner";
import {
  User,
  Landmark,
  FileUp,
  Loader2,
  MapPin,
  GraduationCap,
  Camera,
  Building,
  Briefcase,
  Check,
  Paperclip,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";
import axios from "axios";

// Service Imports
import { getEmployeeFullDetails } from "../Employee/Services/EmployeeSerivce";
import { updateStatutoryDetails } from "./Services/EmployeeStatutoryService";
import { upsertPFDetails } from "./Services/EmployeePFSerivce";
import {
  getDesignationsList,
  getRoles,
  getWorkLocations,
  getCountries,
  getStates,
  getCompanies,
  getDepartmentsList,
  type MasterDataItem,
  type Role,
  type CountryItem,
  type StateItem,
  type CompanyItem,
  type DepartmentItem,
  type DesignationItem,
} from "../../../HRMS/Services/MasterDataService";



import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import type { EmployeeFormData } from "./EmployeeWizard";
import type { EmployeeDocument } from "./Services/EmployeeDocumentService";
import Select from "react-select";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number | null;
}

// 5 Tabs (Unified Addresses + Payroll)
type TabIndex = 0 | 1 | 2 | 3 | 4 | 5;

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId,
}) => {
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Optional Change Password state
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [reportingManagers, setReportingManagers] = useState<{ value: number; label: string }[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  const [master, setMaster] = useState({
    locations: [] as MasterDataItem[],
    departments: [] as DepartmentItem[],
    designations: [] as DesignationItem[],
    roles: [] as Role[],
    countries: [] as CountryItem[],
    states: [] as StateItem[],
    companies: [] as CompanyItem[],
  
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    role: "",
    firstName: "",
    lastName: "",
    googleCalendarId: "",
    employeeCode: "",
    companyId: "",
    designationID: "",
    designationName: "",
    departmentID: "",
    levelID: "",
    panNumber: "",
    aadhaarNumber: "",
    passportNumber: "",
    email: "",
    password: "",
    curFlatNo: "",
    curPremisesName: "",
    curRoadName: "",
    curLocality: "",
    curTownDistrict: "",
    curPinNo: "",
    curCountryId: "",
    curStateId: "",
    curMobileNo: "",
    curAltMobileNo: "",
    curEmail: "",
    curAltEmail: "",
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
    qualifications: [],
    experiences: [],
    pfDeductionPercentage: 12,
    isCappedAt15k: false,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  const formatDateForInput = (dateVal?: any): string => {
    if (!dateVal) return "";
    const str = String(dateVal).trim();
    if (!str || str.startsWith("0001-01-01") || str.startsWith("1900-01-01")) return "";

    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.substring(0, 10);
    }

    // Handle DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Parse Date object
    const d = new Date(str);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 1920) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  const fetchAllData = useCallback(async () => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }
    setChangePassword(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setPasswordTouched(false);
    setIsLoading(true);
    try {
      const [
        full,
        locs,
        depts,
        desigs,
        roles,
        countries,
        states,
        companies,
      ] = await Promise.all([
        getEmployeeFullDetails(employeeId),
        getWorkLocations().catch(() => []),
        getDepartmentsList().catch(() => []),
        getDesignationsList().catch(() => []),
        getRoles().catch(() => []),
        getCountries().catch(() => []),
        getStates().catch(() => []),
        getCompanies().catch(() => [
          { companyId: 1, companyName: "I-Square Safety Equipments Pvt. Ltd." },
        ]),
      ]);

      setMaster({
        locations: locs,
        departments: depts,
        designations: desigs,
        roles,
        countries,
        states,
        companies,
      });

      const fullName = [full.firstName, full.middleName, full.lastName]
        .filter((part) => part && part !== "null" && part.trim() !== "")
        .join(" ");

      // 1. Resolve Company
      const rawCompanyId = (full as any).companyId || (full as any).CompanyId;
      let resolvedCompanyId = rawCompanyId;
      let resolvedCompanyName = full.companyName || (full as any).CompanyName || "";
      if (!resolvedCompanyId && resolvedCompanyName) {
        const match = companies.find(
          (c) => c.companyName?.trim().toLowerCase() === resolvedCompanyName.trim().toLowerCase()
        );
        if (match) resolvedCompanyId = match.companyId;
      }
      if (!resolvedCompanyId && companies.length > 0) {
        resolvedCompanyId = companies[0].companyId;
        if (!resolvedCompanyName) resolvedCompanyName = companies[0].companyName;
      }

      // 2. Resolve Department
      const rawDeptId = (full as any).departmentID || (full as any).DepartmentID;
      let resolvedDeptId = rawDeptId;
      let resolvedDeptName = full.departmentName || (full as any).DepartmentName || "";
      if (!resolvedDeptId && resolvedDeptName) {
        const match = depts.find(
          (d: any) =>
            (d.departmentName || d.name || "").trim().toLowerCase() ===
            resolvedDeptName.trim().toLowerCase()
        );
        if (match) resolvedDeptId = match.id || (match as any).departmentID;
      }

      // 3. Resolve Designation
      const rawDesigId = (full as any).designationID || (full as any).DesignationID;
      let resolvedDesigId = rawDesigId;
      let resolvedDesigName = full.designationName || (full as any).DesignationName || "";
      if (!resolvedDesigId && resolvedDesigName) {
        const match = desigs.find(
          (d: any) =>
            (d.designationName || d.name || "").trim().toLowerCase() ===
            resolvedDesigName.trim().toLowerCase()
        );
        if (match) resolvedDesigId = match.id || (match as any).designationID;
      }

      // 4. Resolve Role
      let resolvedRole = full.role || (full as any).Role || (full as any).roleName || "";
      let resolvedRoleId = (full as any).roleId || (full as any).RoleId || "";
      if (!resolvedRole && !resolvedRoleId) {
        const desigLower = (resolvedDesigName || "").toLowerCase();
        const matchedRole = roles.find((r) => {
          const rLower = (r.name || "").toLowerCase();
          return (
            rLower === desigLower ||
            (desigLower.includes("bde") && rLower.includes("bde")) ||
            (desigLower.includes("director") && rLower.includes("director"))
          );
        });
        if (matchedRole) {
          resolvedRole = matchedRole.name;
          resolvedRoleId = String(matchedRole.id);
        } else if (roles.length > 0) {
          resolvedRole = roles[0].name;
          resolvedRoleId = String(roles[0].id);
        }
      }

      // 5. Resolve Gender
      const rawGender = full.gender || (full as any).Gender || "";
      let resolvedGender = String(rawGender).trim();
      const gLower = resolvedGender.toLowerCase();
      if (gLower === "male" || gLower === "m") resolvedGender = "Male";
      else if (gLower === "female" || gLower === "f") resolvedGender = "Female";
      else if (gLower === "other" || gLower === "o") resolvedGender = "Other";

      // 6. Resolve Dates (Formatted YYYY-MM-DD for input)
      const resolvedDob = formatDateForInput(
        full.dateOfBirth || (full as any).DateOfBirth || (full as any).dob
      );
      const resolvedDoj = formatDateForInput(
        full.dateOfJoining || (full as any).DateOfJoining || (full as any).doj
      );

      // 7. Resolve Statutory Details
      const pan =
        full.statutoryDetails?.panNumber ||
        full.panNumber ||
        (full as any).PANNumber ||
        (full as any).panNo ||
        (full as any).PANNo ||
        "";
      const aadhaar =
        full.statutoryDetails?.aadhaarNumber ||
        full.aadhaarNumber ||
        (full as any).AadhaarNumber ||
        (full as any).aadharNumber ||
        (full as any).AadharNumber ||
        (full as any).aadhaarNo ||
        (full as any).AadhaarNo ||
        "";
      const passport =
        full.statutoryDetails?.passportNumber ||
        full.passportNumber ||
        (full as any).PassportNumber ||
        "";

      setFormData({
        ...full,
        firstName: fullName,
        middleName: full.middleName || "",
        lastName: full.lastName || "",
        companyId: resolvedCompanyId || "",
        companyName: resolvedCompanyName || "",
        departmentID: resolvedDeptId || "",
        departmentName: resolvedDeptName || "",
        designationID: resolvedDesigId || "",
        designationName: resolvedDesigName || "",
        role: resolvedRole,
        roleId: resolvedRoleId ? String(resolvedRoleId) : "",
        gender: resolvedGender,
        dateOfBirth: resolvedDob,
        dateOfJoining: resolvedDoj,
        googleCalendarId:
          full.googleCalendarId || (full as any).GoogleCalendarId || "",

        // Flatten Mobile and Email
        curMobileNo: full.curMobileNo || full.mobileNumber || "",
        curEmail: full.curEmail || full.emailAddress || "",
        mobileNumber: full.mobileNumber || full.curMobileNo || "",
        emailAddress: full.emailAddress || full.curEmail || "",

        // Statutory Details
        panNumber: pan,
        aadhaarNumber: aadhaar,
        passportNumber: passport,

        // Bank Details
        bankName: full.bankDetails?.bankName || "",
        accountNumber: full.bankDetails?.accountNumber || "",
        ifscCode: full.bankDetails?.ifscCode || "",
        accountHolderName: full.bankDetails?.accountHolderName || "",
        swiftCode: full.bankDetails?.swiftCode || "",
        ibanNo: full.bankDetails?.ibanNo || "",
        bankAddress: full.bankDetails?.bankAddress || "",
        sortCode: full.bankDetails?.sortCode || "",

        // Qualifications and Experiences
        qualifications: full.qualifications || [],
        experiences: (full.experiences || []).map((ex) => ({
          ...ex,
          fromDate: formatDateForInput(ex.fromDate),
          toDate: formatDateForInput(ex.toDate),
        })),

        pfDeductionPercentage: full.pfDetails?.pfDeductionPercentage ?? 12,
        isCappedAt15k: full.pfDetails?.isCappedAt15k ?? false,
      } as unknown as EmployeeFormData);

      setDocuments(
        (full.documents || []).map((doc) => ({
          ...doc,
          employeeID: employeeId,
        }))
      );
      if (full.photoPath) {
        setPhotoPreview(`${FILE_BASE_URL}${full.photoPath}`);
      } else {
        setPhotoPreview(null);
      }
    } catch {
      toast.error("Failed to load employee data.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, onClose, FILE_BASE_URL]);

  useEffect(() => {
    if (isOpen && employeeId) fetchAllData();
  }, [isOpen, employeeId, fetchAllData]);

  useEffect(() => {
    if (!formData.designationID) {
      setReportingManagers([]);
      return;
    }
    const selectedDesig = master.designations.find(
      (d: any) => String(d.id || d.designationID) === String(formData.designationID)
    );
    const desigName = ((selectedDesig as any)?.designationName || (selectedDesig as any)?.name || (selectedDesig as any)?.designationName || "").toLowerCase();

    if (desigName.includes("director")) {
      setReportingManagers([]);
      return;
    }

    let isMounted = true;
    setIsLoadingManagers(true);

    const fetchManagers = async () => {
      try {
        let filterDesig = "";
        if (desigName.includes("bde")) {
          filterDesig = "Director";
        } else if (desigName.includes("coordinator")) {
          filterDesig = "BDE";
        }

        const res = await apiClient.get<any[]>(
          `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/active`,
          filterDesig ? { params: { designation: filterDesig } } : undefined
        );

        if (!isMounted) return;
        const list = (Array.isArray(res.data) ? res.data : [])
          .filter((e: any) => Number(e.id || e.ID) !== Number(employeeId))
          .map((e: any) => ({
            value: Number(e.id || e.ID),
            label: `${e.fullName || e.FullName || `${e.firstName || ""} ${e.lastName || ""}`.trim() || `Employee #${e.id || e.ID}`} (${e.employeeCode || e.EmployeeCode || ""})`,
          }));
        setReportingManagers(list);
      } catch (err) {
        console.error("Failed to fetch reporting managers:", err);
        setReportingManagers([]);
      } finally {
        if (isMounted) setIsLoadingManagers(false);
      }
    };

    fetchManagers();
    return () => {
      isMounted = false;
    };
  }, [formData.designationID, master.designations, employeeId]);

  const handleGlobalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSaveAll = async () => {
    if (!employeeId) return;

    if (changePassword) {
      setPasswordTouched(true);
      if (!newPassword.trim()) {
        toast.error("Please enter a new password");
        setActiveTab(0);
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        setActiveTab(0);
        return;
      }
      if (!confirmNewPassword.trim()) {
        toast.error("Please confirm your new password");
        setActiveTab(0);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error("Passwords do not match");
        setActiveTab(0);
        return;
      }
    }

    setIsSaving(true);

    const nameStr = (formData.firstName || "").trim();
    const nameParts = nameStr.split(/\s+/).filter(Boolean);
    let firstName = "Employee";
    let middleName: string | undefined = undefined;
    let lastName = ".";

    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = formData.lastName ? String(formData.lastName).trim() : ".";
    } else if (nameParts.length === 2) {
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else if (nameParts.length >= 3) {
      firstName = nameParts[0];
      middleName = nameParts.slice(1, -1).join(" ");
      lastName = nameParts[nameParts.length - 1];
    }

    if (photoFile) {
      console.log("Photo file selected:", photoFile.name);
    }

    const emailAddress = String(
      formData.emailAddress ||
      formData.email ||
      formData.curEmail ||
      (formData as any).EmailAddress ||
      ""
    ).trim();

    const emailToSend =
      emailAddress ||
      `${(formData.employeeCode || `emp${employeeId}`).toLowerCase().replace(/[^a-z0-9]/g, "")}@isquare.com`;

    const mobileNumber = String(
      formData.mobileNumber ||
      formData.curMobileNo ||
      ""
    ).trim();

    const addressParts = [
      formData.curFlatNo,
      formData.curPremisesName,
      formData.curRoadName,
      formData.curLocality,
      formData.curTownDistrict,
    ].filter(Boolean);

    const presentAddress = String(
      formData.presentAddress || (addressParts.length > 0 ? addressParts.join(", ") : "")
    ).trim();

    const parseDate = (d?: any) => {
      if (!d) return undefined;
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;
    };

    const parseNum = (val: any) => {
      const n = Number(val);
      return !isNaN(n) && n > 0 ? n : undefined;
    };

    const updatePayload = {
      employeeCode: formData.employeeCode
        ? String(formData.employeeCode).trim()
        : undefined,
      firstName,
      middleName: middleName || (formData.middleName ? String(formData.middleName).trim() : undefined),
      lastName,
      dateOfBirth: parseDate(formData.dateOfBirth),
      gender: formData.gender ? String(formData.gender) : undefined,
      mobileNumber: mobileNumber || undefined,
      emailAddress: emailToSend,
      presentAddress: presentAddress || undefined,
      dateOfJoining: parseDate(formData.dateOfJoining),
      workLocationID: parseNum(formData.workLocationID),
      departmentID: parseNum(formData.departmentID),
      designationID: parseNum(formData.designationID),
      reportingTo: parseNum(formData.reportingTo),
      levelID: parseNum(formData.levelID),
      photoPath: formData.photoPath ? String(formData.photoPath) : undefined,
      googleCalendarId: formData.googleCalendarId
        ? String(formData.googleCalendarId)
        : undefined,
      userId: formData.userId ? String(formData.userId) : undefined,
      dateOfLeaving: parseDate(formData.dateOfLeaving),
      isActive:
        formData.isActive !== undefined ? Boolean(formData.isActive) : true,
      ...(changePassword && newPassword.trim()
        ? {
            password: newPassword,
            confirmPassword: confirmNewPassword,
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
          }
        : {}),
    };

    try {
      const token = sessionStorage.getItem("token");
      const url = `${API_ENDPOINTS.CRMEmployee || `${API_ENDPOINTS.BaseUrl}/employee`}/${employeeId}`;
      const response = await axios.put(url, updatePayload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Update Statutory Details (PAN, Aadhaar, Passport)
      const pan = String(formData.panNumber || "").trim();
      const aadhaar = String(formData.aadhaarNumber || "").trim();
      if (pan || aadhaar) {
        try {
          await updateStatutoryDetails(employeeId, {
            panNumber: pan,
            aadhaarNumber: aadhaar,
          });
        } catch (statErr: any) {
          // If not found (404), create it
          try {
            await apiClient.post(API_ENDPOINTS.EmployeeStatutoryDetails, {
              employeeID: employeeId,
              panNumber: pan,
              aadhaarNumber: aadhaar,
            });
          } catch (createErr) {
            console.warn("Could not upsert statutory details:", createErr);
          }
        }
      }

      // Update PF Details if available
      if (formData.pfDeductionPercentage !== undefined) {
        try {
          await upsertPFDetails({
            employeeID: employeeId,
            pfDeductionPercentage: Number(formData.pfDeductionPercentage) || 12,
            isCappedAt15k: Boolean(formData.isCappedAt15k),
          });
        } catch (pfErr) {
          console.warn("Could not save PF details:", pfErr);
        }
      }

      toast.success(response.data?.message || "Employee updated successfully");
      setChangePassword(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordTouched(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Employee update error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Update failed";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocumentFile || !newDocumentName)
      return toast.warning("Provide name and file");
    const data = new FormData();
    data.append("employeeID", String(employeeId));
    data.append("documentName", newDocumentName);
    data.append("file", newDocumentFile);
    try {
      setIsSaving(true);
      await axios.post(
        `${API_ENDPOINTS.BaseUrl}/employee-documents/upload`,
        data,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Document uploaded");
      setNewDocumentName("");
      setNewDocumentFile(null);
      fetchAllData();
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm("Delete document?")) return;
    try {
      await axios.delete(`${API_ENDPOINTS.BaseUrl}/employee-documents/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      toast.success("Deleted");
      fetchAllData();
    } catch {
      toast.error("Failed");
    }
  };

  const tabs = [
    { label: "Employee Details", icon: <Building size={16} /> },
    { label: "Addresses", icon: <MapPin size={16} /> },
    { label: "Bank Details", icon: <Landmark size={16} /> },
    { label: "Exp / Qual", icon: <GraduationCap size={16} /> },
    { label: "Documents", icon: <FileUp size={16} /> },
    { label: "Payroll", icon: <Check size={16} /> },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }, // optional
  ];

  const companyOptions = useMemo(
    () =>
      master.companies.map((c) => ({
        value: c.companyId,
        label: c.companyName,
      })),
    [master.companies],
  );

  const departmentOptions = useMemo(
    () =>
      master.departments.map((d: any) => ({
        value: d.id,
        label: d.departmentName,
      })),
    [master.departments],
  );

  const designationOptions = useMemo(
    () =>
      master.designations.map((d: any) => ({
        value: d.id,
        label: d.designationName,
      })),
    [master.designations],
  );

  const countryOptions = useMemo(
    () =>
      master.countries.map((c) => ({
        value: c.id,
        label: c.countryName,
      })),
    [master.countries],
  );

  const roleOptions = useMemo(
    () =>
      master.roles.map((r) => ({
        value: r.name,
        label: r.name,
        id: r.id,
      })),
    [master.roles],
  );


  if (!isOpen) return null;

  const getStateOptions = (type: "cur" | "perm") => {
    return master.states
      .filter(
        (s) =>
          String(s.countryId) ===
          String(formData[`${type}CountryId` as keyof EmployeeFormData]),
      )
      .map((s) => ({
        value: s.id,
        label: s.stateName,
      }));
  };

  const selectedCompanyValue = useMemo(() => {
    return (
      companyOptions.find(
        (c) =>
          String(c.value) === String(formData.companyId) ||
          (formData.companyName &&
            c.label?.trim().toLowerCase() === String(formData.companyName).trim().toLowerCase())
      ) || (companyOptions.length > 0 ? companyOptions[0] : null)
    );
  }, [companyOptions, formData.companyId, formData.companyName]);

  const selectedDepartmentValue = useMemo(() => {
    return (
      departmentOptions.find(
        (d: any) =>
          String(d.value) === String(formData.departmentID) ||
          (formData.departmentName &&
            (d.label || "").trim().toLowerCase() === String(formData.departmentName).trim().toLowerCase())
      ) || null
    );
  }, [departmentOptions, formData.departmentID, formData.departmentName]);

  const selectedDesignationValue = useMemo(() => {
    return (
      designationOptions.find(
        (d: any) =>
          String(d.value) === String(formData.designationID) ||
          (formData.designationName &&
            (d.label || "").trim().toLowerCase() === String(formData.designationName).trim().toLowerCase())
      ) || null
    );
  }, [designationOptions, formData.designationID, formData.designationName]);

  const selectedRoleValue = useMemo(() => {
    const rVal = String(formData.role || "").trim().toLowerCase();
    const rId = String(formData.roleId || "").trim();
    return (
      roleOptions.find(
        (r) =>
          (rVal && r.value.toLowerCase() === rVal) ||
          (rVal && r.label.toLowerCase() === rVal) ||
          (rId && String(r.id) === rId)
      ) || null
    );
  }, [roleOptions, formData.role, formData.roleId]);

  const selectedGenderValue = useMemo(() => {
    const gVal = String(formData.gender || "").trim().toLowerCase();
    if (!gVal) return null;
    return (
      genderOptions.find(
        (g) =>
          g.value.toLowerCase() === gVal ||
          (gVal === "m" && g.value === "Male") ||
          (gVal === "f" && g.value === "Female")
      ) || null
    );
  }, [genderOptions, formData.gender]);

 

  const getSelectedCountryValue = (type: "cur" | "perm") =>
    countryOptions.find(
      (c) =>
        String(c.value) ===
        String(formData[`${type}CountryId` as keyof EmployeeFormData]),
    ) || null;

  const getSelectedStateValue = (type: "cur" | "perm") => {
    const options = getStateOptions(type);
    return (
      options.find(
        (s) =>
          String(s.value) ===
          String(formData[`${type}StateId` as keyof EmployeeFormData]),
      ) || null
    );
  };

  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-orange-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const renderTabContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-[#FF7900]" size={48} />
        </div>
      );

    switch (activeTab) {
      case 0: // PERSONAL + STATUTORY
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-4xl border-2 border-dashed border-[#FF7900] flex items-center justify-center overflow-hidden bg-gray-50 shadow-inner">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Employee Photo"
                      className="w-full h-full object-cover"
                      onError={() => setPhotoPreview(null)}
                    />
                  ) : (
                    <User size={48} className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-[#FF7900] text-white p-2.5 rounded-2xl shadow-lg hover:bg-[#e66d00] hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoFile(f);
                      setPhotoPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>
              <div className="grow grid grid-cols-2 gap-6">
                <div className="relative">
                  <label className={labelStyle}>Employee Code</label>
                  <input
                    className={inputStyle}
                    value={formData.employeeCode}
                    disabled
                  />
                </div>
                <div className="relative">
                  <label className={labelStyle}>Employee Name</label>
                  <input
                    name="firstName"
                    className={inputStyle}
                    value={formData.firstName}
                    onChange={handleGlobalChange}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Select Company</label>
                  <Select
                    options={companyOptions}
                    value={selectedCompanyValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyId: opt?.value || "",
                        companyName: opt?.label || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Company..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Department</label>
                  <Select
                    options={departmentOptions}
                    value={selectedDepartmentValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        departmentID: opt?.value || "",
                        departmentName: opt?.label || "",
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Department..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Role</label>

                  <Select
                    options={roleOptions}
                    value={selectedRoleValue}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: opt?.value || "",
                        roleId: (opt as any)?.id ? String((opt as any).id) : (opt?.value || ""),
                      }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Select Role..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 46,
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

             
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Designation</label>
                <Select
                  options={designationOptions}
                  value={selectedDesignationValue}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      designationID: opt?.value || "",
                      designationName: opt?.label || "",
                    }))
                  }
                  isClearable
                  isSearchable
                  placeholder="Select Designation..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 46,
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>
                  Reporting To
                  {(() => {
                    const selectedDesig = master.designations.find(
                      (d: any) => String(d.id) === String(formData.designationID)
                    );
                    const desigName = ((selectedDesig as any)?.designationName || (selectedDesig as any)?.name || (selectedDesig as any)?.designationName || "").toLowerCase();
                    if (desigName.includes("bde") || desigName.includes("coordinator")) {
                      return <span className="text-red-500"> *</span>;
                    }
                    return null;
                  })()}
                </label>
                <Select
                  options={reportingManagers}
                  value={
                    reportingManagers.find(
                      (m: any) => String(m.value) === String(formData.reportingTo)
                    ) || null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      reportingTo: opt?.value || "",
                    }))
                  }
                  isDisabled={(() => {
                    const selectedDesig = master.designations.find(
                      (d: any) => String(d.id) === String(formData.designationID)
                    );
                    const desigName = ((selectedDesig as any)?.designationName || (selectedDesig as any)?.name || (selectedDesig as any)?.designationName || "").toLowerCase();
                    return desigName.includes("director") || !formData.designationID;
                  })()}
                  isClearable
                  isSearchable
                  placeholder={
                    (() => {
                      const selectedDesig = master.designations.find(
                        (d: any) => String(d.id) === String(formData.designationID)
                      );
                      const desigName = ((selectedDesig as any)?.designationName || (selectedDesig as any)?.name || (selectedDesig as any)?.designationName || "").toLowerCase();
                      if (desigName.includes("director")) {
                        return "No Reporting Manager (Director)";
                      }
                      if (isLoadingManagers) {
                        return "Loading managers...";
                      }
                      if (!formData.designationID) {
                        return "Select Designation First";
                      }
                      if (desigName.includes("bde")) {
                        return "Select Director...";
                      }
                      if (desigName.includes("coordinator")) {
                        return "Select BDE User...";
                      }
                      return "Select Reporting Manager...";
                    })()
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 46,
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>PAN Number</label>
                <input
                  name="panNumber"
                  className={inputStyle}
                  value={String(formData.panNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>Aadhaar Number</label>
                <input
                  name="aadhaarNumber"
                  className={inputStyle}
                  value={String(formData.aadhaarNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
               {/* ADD THIS NEW FIELD BELOW */}
  <div className="relative">
    <label className={labelStyle}>Google Calendar ID</label>
    <input
      name="googleCalendarId"
      className={inputStyle}
      placeholder="e.g. email@gmail.com"
      value={String(formData.googleCalendarId ?? "")}
      onChange={handleGlobalChange}
    />
    <p className="text-[10px] text-gray-400 mt-1 italic">
      Must be the same email used in Google Calendar settings.
    </p>
  </div>
  
              <div className="relative">
                <label className={labelStyle}>Passport No.</label>
                <input
                  name="passportNumber"
                  className={inputStyle}
                  value={String(formData.passportNumber ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>DOB</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  className={inputStyle}
                  value={String(formData.dateOfBirth ?? "")}
                  onChange={handleGlobalChange}
                />
              </div>
              <div>
                <label className={labelStyle}>Gender</label>
                <Select
                  options={genderOptions}
                  value={selectedGenderValue}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: opt?.value || "",
                    }))
                  }
                  isClearable
                  isSearchable={false}
                  placeholder="Select Gender..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 46,
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>
            </div>

            {/* Optional Change Password Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2.5 mb-4">
                <input
                  type="checkbox"
                  id="changePasswordCheckbox"
                  checked={changePassword}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChangePassword(checked);
                    if (!checked) {
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setPasswordTouched(false);
                      setShowNewPassword(false);
                      setShowConfirmNewPassword(false);
                    }
                  }}
                  className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] accent-[#FF7900] cursor-pointer"
                />
                <label
                  htmlFor="changePasswordCheckbox"
                  className="text-sm font-bold text-gray-700 cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Lock size={15} className="text-[#FF7900]" />
                  Change Password
                </label>
              </div>

              {changePassword && (
                <div className="grid grid-cols-2 gap-6 p-5 bg-orange-50/40 rounded-xl border border-orange-200/60 animate-in fade-in duration-200">
                  <div className="relative">
                    <label className={labelStyle}>
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter New Password (min. 6 characters)"
                        className={`${inputStyle} pr-10 ${
                          passwordTouched && (!newPassword || newPassword.length < 6)
                            ? "border-red-500 ring-1 ring-red-200"
                            : ""
                        }`}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordTouched(true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#FF7900] transition cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordTouched && !newPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        New password is required.
                      </p>
                    )}
                    {passwordTouched && newPassword && newPassword.length < 6 && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Password must be at least 6 characters.
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className={labelStyle}>
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm New Password"
                        className={`${inputStyle} pr-10 ${
                          passwordTouched &&
                          (!confirmNewPassword ||
                            (confirmNewPassword && newPassword !== confirmNewPassword))
                            ? "border-red-500 ring-1 ring-red-200"
                            : ""
                        }`}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setPasswordTouched(true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        aria-label={
                          showConfirmNewPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#FF7900] transition cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordTouched && !confirmNewPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Confirm password is required.
                      </p>
                    )}
                    {confirmNewPassword && newPassword !== confirmNewPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 1: // COMBINED ADDRESSES
        return (
          <div className="p-8 space-y-10 overflow-y-auto max-h-[550px] animate-in fade-in duration-300">
            {(["cur", "perm"] as const).map((type) => (
              <div key={type} className="space-y-6">
                <h3 className="text-sm font-black text-[#FF7900] uppercase border-b pb-2 flex items-center gap-2">
                  <MapPin size={16} />{" "}
                  {type === "cur" ? "Current Address" : "Permanent Address"}
                </h3>
                <div className="grid grid-cols-3 gap-6 pt-2">
                  {[
                    "FlatNo",
                    "PremisesName",
                    "RoadName",
                    "Locality",
                    "TownDistrict",
                    "PinNo",
                    "MobileNo",
                    "Email",
                  ].map((field) => (
                    <div key={field} className="relative">
                      <label className={labelStyle}>
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        name={`${type}${field}`}
                        value={String(formData[`${type}${field}`] || "")}
                        onChange={handleGlobalChange}
                        className={inputStyle}
                      />
                    </div>
                  ))}
                  <div>
                    <label className={labelStyle}>Country</label>
                    <Select
                      options={countryOptions}
                      value={getSelectedCountryValue(type)}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`${type}CountryId`]: opt?.value || "",
                          [`${type}StateId`]: "", // reset state when country changes
                        }))
                      }
                      isClearable
                      isSearchable
                      placeholder="Select Country..."
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>State</label>
                    <Select
                      options={getStateOptions(type)}
                      value={getSelectedStateValue(type)}
                      onChange={(opt) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`${type}StateId`]: opt?.value || "",
                        }))
                      }
                      isClearable
                      isSearchable
                      isDisabled={!formData[`${type}CountryId`]}
                      placeholder="Select State..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2: // BANK DETAILS
        return (
          <div className="p-8 grid grid-cols-3 gap-6 animate-in fade-in duration-300">
            {[
              "bankName",
              "accountNumber",
              "ifscCode",
              "accountHolderName",
              "swiftCode",
              "ibanNo",
              "bankAddress",
              "sortCode",
            ].map((f) => (
              <div key={f} className="relative">
                <label className={labelStyle}>
                  {f.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  name={f}
                  value={String(formData[f] || "")}
                  onChange={handleGlobalChange}
                  className={inputStyle}
                />
              </div>
            ))}
          </div>
        );

      case 3: // EXP / QUAL + DOCUMENTS
        return (
          <div className="p-8 space-y-10 overflow-y-auto max-h-[550px] animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-[#FF7900]">
                  <GraduationCap size={18} /> Qualifications
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      qualifications: [
                        ...formData.qualifications,
                        {
                          degree: "",
                          university: "",
                          passingYear: "",
                          percentage: "",
                        },
                      ],
                    })
                  }
                  className="text-[#FF7900] text-xs font-bold underline"
                >
                  + Add More
                </button>
              </div>
              {formData.qualifications.map((q, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border relative"
                >
                  <input
                    className={inputStyle}
                    value={q.degree}
                    placeholder="Degree"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].degree = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={q.university}
                    placeholder="University"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].university = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={q.passingYear}
                    placeholder="Year"
                    onChange={(e) => {
                      const updated = [...formData.qualifications];
                      updated[i].passingYear = e.target.value;
                      setFormData({ ...formData, qualifications: updated });
                    }}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputStyle}
                      value={q.percentage}
                      placeholder="%"
                      onChange={(e) => {
                        const updated = [...formData.qualifications];
                        updated[i].percentage = e.target.value;
                        setFormData({ ...formData, qualifications: updated });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          qualifications: formData.qualifications.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-[#FF7900]">
                  <Briefcase size={18} /> Experience
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      experiences: [
                        ...formData.experiences,
                        {
                          companyName: "",
                          designation: "",
                          fromDate: "",
                          toDate: "",
                          location: "",
                        },
                      ],
                    })
                  }
                  className="text-[#FF7900] text-xs font-bold underline"
                >
                  + Add More
                </button>
              </div>
              {formData.experiences.map((ex, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-2xl border relative"
                >
                  <input
                    className={inputStyle}
                    value={ex.companyName}
                    placeholder="Company"
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].companyName = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    className={inputStyle}
                    value={ex.designation}
                    placeholder="Role"
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].designation = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    type="date"
                    className={inputStyle}
                    value={ex.fromDate}
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].fromDate = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <input
                    type="date"
                    className={inputStyle}
                    value={ex.toDate}
                    onChange={(e) => {
                      const updated = [...formData.experiences];
                      updated[i].toDate = e.target.value;
                      setFormData({ ...formData, experiences: updated });
                    }}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputStyle}
                      value={ex.location}
                      placeholder="Loc"
                      onChange={(e) => {
                        const updated = [...formData.experiences];
                        updated[i].location = e.target.value;
                        setFormData({ ...formData, experiences: updated });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          experiences: formData.experiences.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // DOCUMENTS TAB
        return (
          <div className="p-8 animate-in zoom-in duration-300">
            <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-black text-[#FF7900] uppercase mb-6 flex items-center gap-2">
                <FileUp size={18} /> HR DOCUMENTS
              </h3>
              <div className="flex items-center gap-4 mb-8">
                <input
                  className="grow h-[42px] border border-gray-200 rounded-2xl px-5 outline-none focus:border-[#FF7900] text-sm italic"
                  placeholder="Doc Name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="h-[42px] bg-white border border-gray-900 px-8 rounded-2xl text-sm font-bold hover:bg-gray-50"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  ref={docInputRef}
                  className="hidden"
                  onChange={(e) =>
                    setNewDocumentFile(e.target.files?.[0] || null)
                  }
                />
                <button
                  type="button"
                  onClick={handleUploadDocument}
                  disabled={isSaving}
                  className="px-10 py-2.5 bg-[#FF7900] text-white rounded-lg font-semibold text-sm hover:bg-[#e66d00] transition flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>

              {/* LIST OF UPLOADED DOCUMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between h-[42px] px-4 border border-black rounded-2xl bg-white group hover:border-[#FF7900] transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Paperclip size={16} className="text-[#FF7900] shrink-0" />
                      <span className="text-[13px] font-black text-black truncate">
                        {doc.documentName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // PAYROLL
        return (
          <div className="p-8 animate-in zoom-in duration-300">
            <div className="p-10 bg-orange-50 rounded-4xl border border-orange-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#FF7900] text-lg">
                  Payroll PF Settings
                </h3>
                <p className="text-sm text-[#FF7900]">
                  Manage deduction percentages and wage ceilings
                </p>
              </div>
              <div className="flex items-center gap-12">
                <div className="relative w-40">
                  <label className={labelStyle}>PF Deduction %</label>
                  <input
                    name="pfDeductionPercentage"
                    type="number"
                    className={inputStyle}
                    value={formData.pfDeductionPercentage ?? ""}
                    onChange={handleGlobalChange}
                  />
                </div>
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 cursor-pointer">
                  <input
                    name="isCappedAt15k"
                    type="checkbox"
                    checked={Boolean(formData.isCappedAt15k)}
                    onChange={handleGlobalChange}
                    className="w-6 h-6 rounded border-gray-300"
                  />
                  Limit to ₹15,000 ceiling
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      {/* --- TOP ORANGE HEADER BANNER (Create/Edit Separation) --- */}
      <div className="flex items-center justify-between bg-[#FF7900] px-6 py-4 rounded-t-xl shadow-md text-white">
        <div className="flex items-center gap-2.5">
          <Building className="w-5 h-5 text-white" />
          <h2 className="text-sm sm:text-base font-extrabold tracking-widest uppercase text-white">
            Edit Employee {formData.employeeCode ? `(${formData.employeeCode})` : ""}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white hover:text-gray-200 transition p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* --- TAB HEADER BAR --- */}
      <div className="flex bg-[#e86a00] p-1.5 gap-1 border-t border-orange-400">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i as TabIndex)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === i
                ? "bg-white text-[#FF7900] shadow-md scale-[1.02]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="p-8 bg-white min-h-[450px]">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Loader2 className="animate-spin text-[#FF7900] mb-2" size={48} />
              <p className="text-gray-400 font-bold">Loading Data...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="p-5 bg-gray-50 flex items-center justify-between border-t border-gray-200">
        <button type="button" onClick={onClose} className={buttonStyles.cancel}>
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {activeTab > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab((prev) => (prev - 1) as TabIndex)}
              className={buttonStyles.back}
            >
              Back
            </button>
          )}

          {activeTab < tabs.length - 1 && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 0 && changePassword) {
                  setPasswordTouched(true);
                  if (!newPassword.trim()) {
                    toast.error("Please enter a new password");
                    return;
                  }
                  if (newPassword.length < 6) {
                    toast.error("New password must be at least 6 characters long");
                    return;
                  }
                  if (!confirmNewPassword.trim()) {
                    toast.error("Please confirm your new password");
                    return;
                  }
                  if (newPassword !== confirmNewPassword) {
                    toast.error("Passwords do not match");
                    return;
                  }
                }
                setActiveTab((prev) => (prev + 1) as TabIndex);
              }}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition"
            >
              Next
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-lg bg-[#FF7900] hover:bg-[#e06800] text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Updating...
              </>
            ) : (
              "Update Employee"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
