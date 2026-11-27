import React, { useEffect, useState } from "react";
import { X, Loader2, FileText, Phone, Building, IndianRupee, Layers, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getEnquiryById, updateEnquiry, } from "../Services/EnquiryService";
import {
  getEnquiryTypes, getEnquirySources, getProductCategories, getUOMs, getPlacesOfSupply,
  getCurrencies, getEnquiryStatuses, getEnquiryStages, getEnquiryPriorities, getTerritories,
  getLostReasons, getDepartments, getActivityTypes, getSalesManagers, getBdeUsers
} from "../Services/EnquiryMasterDataService";
import { getCustomers, getCustomerById } from "../../Customer/Services/CustomerService";
import { getIndustries, getCustomerAreas, getPaymentTerms, getDirectors, getBdeUsers as getCustomerBdeUsers, getEmployees } from "../../Customer/Services/CustomerMasterDataService";
import { getDepartments as getHrmsDepartments, getDesignations as getHrmsDesignations } from "../../../../HRMS/Services/MasterDataService";
import { getAllPaymentTerms } from "../../Master/PaymentTerm/Services/PaymentTermService";
import { getAllContacts, getContactsByCompanyId } from "../../Master/Contact/Services/ContactService";
import type { MasterItem } from "../Types/EnquiryTypes";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { SearchableSelect } from "../../../../../Components/Common/SearchableSelect";
//

interface EditEnquiryModalProps {
  isOpen: boolean;
  enquiryId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEnquiryModal: React.FC<EditEnquiryModalProps> = ({ isOpen, enquiryId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading,] = useState(false);

  const [formData, setFormData] = useState<any>({});

  // Master Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<any>(null);
  const [bdeUsersList, setBdeUsersList] = useState<MasterItem[]>([]);
  const [industriesList, setIndustriesList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);
  const [paymentTermsList, setPaymentTermsList] = useState<any[]>([]);
  const [directorsList, setDirectorsList] = useState<any[]>([]);
  const [contactDepartments, setContactDepartments] = useState<MasterItem[]>([]);
  const [contactDesignations, setContactDesignations] = useState<MasterItem[]>([]);

  const [masters, setMasters] = useState<{
    types: MasterItem[], sources: MasterItem[], categories: MasterItem[], uoms: MasterItem[],
    places: MasterItem[], currencies: MasterItem[], statuses: MasterItem[], stages: MasterItem[],
    priorities: MasterItem[], territories: MasterItem[], lostReasons: MasterItem[], departments: MasterItem[],
    activities: MasterItem[], paymentTerms: MasterItem[], salesManagers: MasterItem[]
  }>({
    types: [], sources: [], categories: [], uoms: [], places: [], currencies: [], statuses: [], stages: [],
    priorities: [], territories: [], lostReasons: [], departments: [], activities: [], paymentTerms: [],
    salesManagers: []
  });

  useEffect(() => {
    if (isOpen && enquiryId) {
      loadInitialData();
    }
  }, [isOpen, enquiryId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        enquiryRes, custRes, contRes, termsRes, customerPaymentTermsRes,
        types, sources, categories, uoms, places, currencies,
        statuses, stages, priorities, territories, lostReasons, departments, activities,
        salesManagersRes, bdeUsersRes, customerBdeRes, employeesRes, industriesRes, areasRes, directorsRes,
        hrmsDepartmentsRes, hrmsDesignationsRes
      ] = await Promise.all([
        getEnquiryById(enquiryId!),
        getCustomers().catch(() => []),
        getAllContacts().catch(() => []),
        getAllPaymentTerms().catch(() => []),
        getPaymentTerms().catch(() => []),
        getEnquiryTypes(), getEnquirySources(), getProductCategories(), getUOMs(), getPlacesOfSupply(), getCurrencies(),
        getEnquiryStatuses(), getEnquiryStages(), getEnquiryPriorities(), getTerritories(), getLostReasons(), getDepartments(), getActivityTypes().catch(() => []),
        getSalesManagers().catch(() => []),
        getBdeUsers().catch(() => []),
        getCustomerBdeUsers().catch(() => []),
        getEmployees().catch(() => []),
        getIndustries().catch(() => []),
        getCustomerAreas().catch(() => []),
        getDirectors().catch(() => []),
        getHrmsDepartments().catch(() => []),
        getHrmsDesignations().catch(() => [])
      ]);

      setCustomers(custRes);
      setContacts(contRes);

      // Consolidate BDE Users & Sales Executive Employees
      const combinedBdes: any[] = [];
      const seenBdeIds = new Set<number>();
      const addBde = (id: number, name: string, code?: string) => {
        if (id > 0 && name && !seenBdeIds.has(id)) {
          seenBdeIds.add(id);
          combinedBdes.push({ id, name, code: code || "" });
        }
      };

      (bdeUsersRes || []).forEach((b: any) => {
        const id = Number(b.id || b.bdeUserId || 0);
        const name = String(b.name || b.value || b.fullName || b.userName || "").trim();
        addBde(id, name, b.code);
      });

      (customerBdeRes || []).forEach((b: any) => {
        const id = Number(b.id || b.bdeUserId || 0);
        const name = String(b.name || b.value || b.fullName || b.userName || "").trim();
        addBde(id, name, b.code);
      });

      (employeesRes || []).forEach((e: any) => {
        const id = Number(e.id || 0);
        const name = String(e.fullName || e.name || `${e.firstName || ""} ${e.lastName || ""}`).trim();
        const designation = String(e.designation || e.role || "").toLowerCase();
        if (designation.includes("bde") || designation.includes("sales") || designation.includes("exec") || combinedBdes.length === 0) {
          addBde(id, name, e.employeeCode || e.code);
        }
      });

      setBdeUsersList(combinedBdes);
      setIndustriesList(industriesRes || []);
      setAreasList(areasRes || []);
      setDirectorsList(directorsRes || []);

      const combinedPaymentTerms = [
        ...(Array.isArray(termsRes) ? termsRes : []),
        ...(Array.isArray(customerPaymentTermsRes) ? customerPaymentTermsRes : [])
      ];
      setPaymentTermsList(combinedPaymentTerms);

      const ptMap = new Map<number, string>();
      combinedPaymentTerms.forEach((pt: any) => {
        const id = Number(pt.paymentTermId ?? pt.PaymentTermId ?? pt.id ?? 0);
        const name = String(pt.paymentTermName ?? pt.PaymentTermName ?? pt.name ?? "").trim();
        if (id && name && !ptMap.has(id)) {
          ptMap.set(id, name);
        }
      });
      const normalizedPaymentTerms = Array.from(ptMap.entries()).map(([id, name]) => ({ id, name }));

      setMasters({
        types, sources, categories, uoms, places, currencies, statuses, stages,
        priorities, territories, lostReasons, departments, activities,
        paymentTerms: normalizedPaymentTerms,
        salesManagers: salesManagersRes
      });

      // Consolidate HRMS & Enquiry Departments for Section 2 Contact
      const deptMap = new Map<string, { id: number; name: string }>();
      (departments || []).forEach((d: any) => {
        const name = String(d.name || d.departmentName || "").trim();
        if (name && !deptMap.has(name.toLowerCase())) {
          deptMap.set(name.toLowerCase(), { id: Number(d.id || d.departmentId || 0), name });
        }
      });
      (hrmsDepartmentsRes || []).forEach((d: any) => {
        const name = String(d.name || d.departmentName || "").trim();
        if (name && !deptMap.has(name.toLowerCase())) {
          deptMap.set(name.toLowerCase(), { id: Number(d.id || d.departmentId || 0), name });
        }
      });
      setContactDepartments(Array.from(deptMap.values()));

      // Consolidate HRMS Designations for Section 2 Contact
      const desigMap = new Map<string, { id: number; name: string }>();
      (hrmsDesignationsRes || []).forEach((d: any) => {
        const name = String(d.name || d.designationName || "").trim();
        if (name && !desigMap.has(name.toLowerCase())) {
          desigMap.set(name.toLowerCase(), { id: Number(d.id || d.designationId || 0), name });
        }
      });
      setContactDesignations(Array.from(desigMap.values()));

      // Format dates for inputs
      const preppedData = { ...enquiryRes };
      if (preppedData.enquiryDate) preppedData.enquiryDate = preppedData.enquiryDate.substring(0, 10);
      if (preppedData.expectedClosingDate) preppedData.expectedClosingDate = preppedData.expectedClosingDate.substring(0, 10);
      if (preppedData.nextFollowUpDate) preppedData.nextFollowUpDate = preppedData.nextFollowUpDate.substring(0, 10);

      setFormData(preppedData);

      // Load contacts and selected customer info
      if (preppedData.customerId) {
        let matchedCust = custRes.find((c: any) => c.customerId === preppedData.customerId);
        try {
          const fullCust = await getCustomerById(preppedData.customerId);
          if (fullCust) matchedCust = { ...matchedCust, ...fullCust };
        } catch { }

        // Resolve Industry Name
        const indId = Number(matchedCust?.industryId ?? (matchedCust as any)?.IndustryId ?? 0);
        const matchedInd = indId ? (industriesRes || []).find((i: any) => Number(i.industryId ?? i.IndustryId ?? i.id) === indId) : null;
        const industryName = matchedCust?.industryName || (matchedCust as any)?.IndustryName || matchedInd?.industryName || (matchedInd as any)?.name || "-";

        // Resolve Area Name
        const arId = Number(matchedCust?.customerAreaId ?? (matchedCust as any)?.CustomerAreaId ?? 0);
        const matchedAr = arId ? (areasRes || []).find((a: any) => Number(a.customerAreaId ?? a.CustomerAreaId ?? a.areaId ?? a.id) === arId) : null;
        const customerAreaName = matchedCust?.customerAreaName || (matchedCust as any)?.CustomerAreaName || matchedAr?.areaName || (matchedAr as any)?.name || "-";

        // Resolve Payment Term Name
        const ptId = Number(matchedCust?.paymentTermsId ?? (matchedCust as any)?.PaymentTermsId ?? matchedCust?.paymentTermId ?? (matchedCust as any)?.PaymentTermId ?? 0);
        const matchedPt = ptId ? combinedPaymentTerms.find((p: any) => Number(p.paymentTermId ?? p.PaymentTermId ?? p.id) === ptId) : null;
        const paymentTermName = matchedCust?.paymentTermName || (matchedCust as any)?.PaymentTermName || matchedPt?.paymentTermName || (matchedPt as any)?.name || "-";

        // Resolve Sales Manager / Director Name
        const smId = Number((matchedCust as any)?.salesManagerId ?? (matchedCust as any)?.SalesManagerId ?? matchedCust?.directorId ?? (matchedCust as any)?.DirectorId ?? 0);
        let smName = (matchedCust as any)?.salesManagerName || (matchedCust as any)?.SalesManagerName || matchedCust?.directorName || (matchedCust as any)?.DirectorName || "";
        if (!smName && smId) {
          const matchedDir = (directorsRes || []).find((d: any) => Number(d.directorId ?? d.DirectorId ?? d.id) === smId);
          if (matchedDir) {
            smName = matchedDir.directorName || (matchedDir as any)?.fullName || (matchedDir as any)?.name || "";
          }
        }
        if (!smName && smId) {
          const matchedSm = salesManagersRes.find((m: any) => Number(m.id ?? m.salesManagerId) === smId);
          if (matchedSm) {
            smName = matchedSm.name || (matchedSm as any)?.userName || "";
          }
        }

        // Resolve BDE
        const bdeId = Number(matchedCust?.bdeUserId ?? (matchedCust as any)?.BDEUserId ?? (matchedCust as any)?.bdeId ?? (matchedCust as any)?.BdeId ?? 0);
        let bdeName = matchedCust?.bdeUserName || (matchedCust as any)?.BDEUserName || (matchedCust as any)?.bdeName || "";
        if (!bdeName && bdeId) {
          const matchedBde = bdeUsersRes.find((b: any) => Number(b.id ?? b.bdeUserId) === bdeId);
          if (matchedBde) {
            bdeName = matchedBde.name || (matchedBde as any)?.value || (matchedBde as any)?.userName || "";
          }
        }

        const enrichedCust = {
          ...matchedCust,
          industryName: industryName !== "-" ? industryName : (matchedCust?.industryName || "-"),
          customerAreaName: customerAreaName !== "-" ? customerAreaName : (matchedCust?.customerAreaName || "-"),
          paymentTermName: paymentTermName !== "-" ? paymentTermName : (matchedCust?.paymentTermName || "-"),
          salesManagerName: smName || "-",
          salesManagerId: smId,
          bdeUserName: bdeName || "-",
          bdeUserId: bdeId
        };
        setSelectedCustomerInfo(enrichedCust);

        const custName = matchedCust?.customerName || matchedCust?.companyName || preppedData.customerName || "";
        const custMobile = matchedCust?.mobile || matchedCust?.phone || (matchedCust as any)?.mobileNumber || matchedCust?.alternateMobile || preppedData.contactMobile || "";
        const custEmail = matchedCust?.email || matchedCust?.emailAddress || matchedCust?.alternateEmail || preppedData.contactEmail || "";
        const custDept = (matchedCust as any)?.department || (matchedCust as any)?.departmentName || preppedData.departmentName || "";
        const custDesig = (matchedCust as any)?.designation || (matchedCust as any)?.designationName || preppedData.designation || "";

        const primaryContact: any = {
          contactId: 0,
          companyId: preppedData.customerId,
          fullName: custName,
          department: custDept,
          designation: custDesig || "Primary Contact",
          mobileNo: custMobile,
          emailAddress: custEmail,
          isPrimary: true
        };

        try {
          let customerContacts = await getContactsByCompanyId(preppedData.customerId);
          if (!customerContacts || customerContacts.length === 0) {
            customerContacts = contRes.filter((c: any) => Number(c.companyId) === Number(preppedData.customerId));
          }
          const activeContacts = (customerContacts || []).filter((c: any) => c.isActive !== false && !c.isDeleted);
          const combined = [
            primaryContact,
            ...activeContacts.filter((c: any) => c.contactId > 0 && c.fullName?.toLowerCase() !== custName.toLowerCase())
          ];
          setFilteredContacts(combined);

          if (!preppedData.contactName && !preppedData.contactMobile) {
            setFormData((prev: any) => ({
              ...prev,
              contactId: 0,
              contactName: custName,
              departmentName: custDept,
              designation: custDesig,
              contactMobile: custMobile,
              contactEmail: custEmail
            }));
          }
        } catch {
          setFilteredContacts([primaryContact]);
        }
      }

    } catch (error) {
      toast.error("Failed to load enquiry data.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = async (selectedVal: any) => {
    const custId = selectedVal ? Number(selectedVal) : "";
    setFormData((prev: any) => ({
      ...prev,
      customerId: custId,
      contactId: "",
      contactName: "",
      departmentName: "",
      designation: "",
      contactMobile: "",
      contactEmail: ""
    }));

    if (custId) {
      let cust = customers.find(c => c.customerId === custId);
      try {
        const fullCust = await getCustomerById(custId);
        if (fullCust) cust = { ...cust, ...fullCust };
      } catch { }

      // Resolve Industry Name
      const indId = Number(cust?.industryId ?? (cust as any)?.IndustryId ?? 0);
      const matchedInd = indId ? industriesList.find((i: any) => Number(i.industryId ?? i.IndustryId ?? i.id) === indId) : null;
      const industryName = cust?.industryName || (cust as any)?.IndustryName || matchedInd?.industryName || matchedInd?.name || "-";

      // Resolve Area Name
      const arId = Number(cust?.customerAreaId ?? (cust as any)?.CustomerAreaId ?? 0);
      const matchedAr = arId ? areasList.find((a: any) => Number(a.customerAreaId ?? a.CustomerAreaId ?? a.areaId ?? a.id) === arId) : null;
      const customerAreaName = cust?.customerAreaName || (cust as any)?.CustomerAreaName || matchedAr?.areaName || matchedAr?.name || "-";

      // Resolve Payment Term Name
      const ptId = Number(cust?.paymentTermsId ?? (cust as any)?.PaymentTermsId ?? cust?.paymentTermId ?? (cust as any)?.PaymentTermId ?? 0);
      const matchedPt = ptId ? (paymentTermsList.find((p: any) => Number(p.paymentTermId ?? p.PaymentTermId ?? p.id) === ptId) || masters.paymentTerms.find((p: any) => Number(p.id) === ptId)) : null;
      const paymentTermName = cust?.paymentTermName || (cust as any)?.PaymentTermName || matchedPt?.paymentTermName || matchedPt?.name || "-";

      // Resolve Sales Manager / Director Name
      const smId = Number((cust as any)?.salesManagerId ?? (cust as any)?.SalesManagerId ?? cust?.directorId ?? (cust as any)?.DirectorId ?? 0);
      let smName = (cust as any)?.salesManagerName || (cust as any)?.SalesManagerName || cust?.directorName || (cust as any)?.DirectorName || "";
      if (!smName && smId) {
        const matchedDir = directorsList.find((d: any) => Number(d.directorId ?? d.DirectorId ?? d.id) === smId);
        if (matchedDir) {
          smName = matchedDir.directorName || (matchedDir as any)?.fullName || (matchedDir as any)?.name || "";
        }
      }
      if (!smName && smId) {
        const matchedSm = masters.salesManagers.find((m: any) => Number(m.id ?? m.salesManagerId) === smId);
        if (matchedSm) {
          smName = matchedSm.name || (matchedSm as any)?.userName || "";
        }
      }

      // Resolve BDE
      const bdeId = Number(cust?.bdeUserId ?? (cust as any)?.BDEUserId ?? (cust as any)?.bdeId ?? (cust as any)?.BdeId ?? 0);
      let bdeName = cust?.bdeUserName || (cust as any)?.BDEUserName || (cust as any)?.bdeName || "";
      if (!bdeName && bdeId) {
        const matchedBde = bdeUsersList.find((b: any) => Number(b.id ?? b.bdeUserId) === bdeId);
        if (matchedBde) {
          bdeName = matchedBde.name || (matchedBde as any)?.value || (matchedBde as any)?.userName || "";
        }
      }
      if (bdeId && bdeName) {
        setBdeUsersList(prev => {
          if (!prev.some(b => Number(b.id || (b as any).bdeUserId) === bdeId)) {
            return [{ id: bdeId, name: bdeName, code: "" } as any, ...prev];
          }
          return prev;
        });
      }

      const enrichedCust = {
        ...cust,
        industryName: industryName !== "-" ? industryName : (cust?.industryName || "-"),
        customerAreaName: customerAreaName !== "-" ? customerAreaName : (cust?.customerAreaName || "-"),
        paymentTermName: paymentTermName !== "-" ? paymentTermName : (cust?.paymentTermName || "-"),
        salesManagerName: smName || "-",
        salesManagerId: smId,
        bdeUserName: bdeName || "-",
        bdeUserId: bdeId
      };
      setSelectedCustomerInfo(enrichedCust);

      setFormData((prev: any) => ({
        ...prev,
        paymentTermId: ptId || prev.paymentTermId,
        salesTerritoryId: arId || prev.salesTerritoryId,
        directorId: smId || prev.directorId,
        directorName: smName || prev.directorName,
        salesManagerId: smId || prev.salesManagerId,
        salesManagerName: smName || prev.salesManagerName,
        bdeUserId: bdeId || prev.bdeUserId,
        bdeUserName: bdeName || prev.bdeUserName
      }));

      // Extract primary contact details from Customer Master
      const custName = cust?.customerName || cust?.companyName || "";
      const custMobile = cust?.mobile || cust?.phone || (cust as any)?.mobileNumber || cust?.alternateMobile || "";
      const custEmail = cust?.email || cust?.emailAddress || cust?.alternateEmail || "";
      const custDept = (cust as any)?.department || (cust as any)?.departmentName || "";
      const custDesig = (cust as any)?.designation || (cust as any)?.designationName || "";

      const primaryContact: any = {
        contactId: 0,
        companyId: custId,
        fullName: custName,
        department: custDept,
        designation: custDesig || "Primary Contact",
        mobileNo: custMobile,
        emailAddress: custEmail,
        isPrimary: true
      };

      // Auto-fill Section 2 immediately from customer basic details
      setFormData((prev: any) => ({
        ...prev,
        contactId: 0,
        contactName: custName,
        departmentName: custDept,
        designation: custDesig,
        contactMobile: custMobile,
        contactEmail: custEmail
      }));

      setIsLoadingContacts(true);
      try {
        let customerContacts = await getContactsByCompanyId(custId);
        if (!customerContacts || customerContacts.length === 0) {
          customerContacts = contacts.filter((c: any) => Number(c.companyId) === Number(custId));
        }

        const activeContacts = (customerContacts || []).filter((c: any) => c.isActive !== false && !c.isDeleted);
        const combinedContacts = [
          primaryContact,
          ...activeContacts.filter((c: any) => c.contactId > 0 && c.fullName?.toLowerCase() !== custName.toLowerCase())
        ];
        setFilteredContacts(combinedContacts);

        setFormData((prev: any) => ({
          ...prev,
          contactId: 0,
          contactName: custName,
          departmentName: custDept,
          designation: custDesig,
          contactMobile: custMobile,
          contactEmail: custEmail
        }));
      } catch (err) {
        console.error("Error loading customer contacts in edit mode:", err);
        setFilteredContacts([primaryContact]);
        setFormData((prev: any) => ({
          ...prev,
          contactId: 0,
          contactName: custName,
          departmentName: custDept,
          designation: custDesig,
          contactMobile: custMobile,
          contactEmail: custEmail
        }));
      } finally {
        setIsLoadingContacts(false);
      }
    } else {
      setSelectedCustomerInfo(null);
      setFilteredContacts([]);
    }
  };

  const handleContactChange = (selectedVal: any) => {
    if (selectedVal === "" || selectedVal === null || selectedVal === undefined) {
      setFormData((prev: any) => ({
        ...prev,
        contactId: "",
        contactName: "",
        departmentName: "",
        designation: "",
        contactMobile: "",
        contactEmail: ""
      }));
      return;
    }

    const contId = Number(selectedVal);
    const contact = filteredContacts.find(c => Number(c.contactId) === contId);
    if (contact) {
      const dept = contact.department || (contact as any).departmentName || "";
      const desig = (contact.isPrimary && !contact.designation) ? "" : (contact.designation || (contact as any).designationName || "");
      setFormData((prev: any) => ({
        ...prev,
        contactId: contId,
        contactName: contact?.fullName || "",
        departmentName: dept,
        designation: desig,
        contactMobile: contact?.mobileNo || "",
        contactEmail: contact?.emailAddress || ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId) return;

    if (!formData.customerId) {
      toast.error("Please select a Customer.");
      return;
    }

    const selectedStatus = masters.statuses.find(s => s.id === Number(formData.enquiryStatusId));
    if (selectedStatus?.name.toLowerCase() === "lost" && !formData.lostReasonId) {
      toast.error("Lost Reason is mandatory when Status is 'Lost'.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      const numericFields = [
        'enquiryTypeId', 'enquirySourceId', 'customerId', 'contactId', 'productCategoryId',
        'unitOfMeasureId', 'placeOfSupplyId', 'expectedOrderValue', 'currencyId', 'customerBudget', 'probabilityPercentage',
        'paymentTermId', 'customerCreditLimit', 'estimatedTaxPercent', 'enquiryStatusId', 'enquiryStageId',
        'enquiryPriorityId', 'departmentId', 'salesTerritoryId', 'activityTypeId', 'lostReasonId',
        'salesManagerId', 'bdeUserId'
      ];
      numericFields.forEach(field => {
        let val = payload[field];
        if (typeof val === 'string') {
          val = val.replace(/%/g, '').trim();
        }
        if (val === "" || val === null || val === undefined || (field === 'contactId' && Number(val) === 0)) {
          payload[field] = null;
        } else {
          payload[field] = Number(val);
        }
      });

      await updateEnquiry(enquiryId, payload);
      toast.success("Enquiry Updated Successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOptions = customers.map((c: any) => {
    const companyDisplay = (c.companyName || c.customerName || "").trim();
    const gst = c.gstin || c.gstNumber || "";
    return {
      value: c.customerId,
      label: `${c.customerCode ? `${c.customerCode} — ` : ""}${companyDisplay}${gst ? ` — ${gst}` : ""}`
    };
  });

  const contactOptions = filteredContacts.map((c: any) => {
    const isCustPrimary = c.isPrimary || Number(c.contactId) === 0;
    const tag = isCustPrimary ? "(Primary Contact)" : c.designation ? `(${c.designation})` : "";
    const dept = c.department ? `Dept: ${c.department}` : "";
    const mob = c.mobileNo ? `Mob: ${c.mobileNo}` : "";
    const email = c.emailAddress ? `Email: ${c.emailAddress}` : "";

    const extraParts = [tag, dept, mob, email].filter(Boolean).join(" — ");
    const label = extraParts ? `${c.fullName || "Unnamed"} — ${extraParts}` : (c.fullName || "Unnamed");

    return {
      value: Number(c.contactId),
      label
    };
  });

  const departmentOptions = contactDepartments.map((d: any) => ({
    value: d.name,
    label: d.name
  }));

  const designationOptions = contactDesignations.map((d: any) => ({
    value: d.name,
    label: d.name
  }));

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5">
          <FileText size={20} className="text-white" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
            Edit Enquiry: {formData.enquiryNumber}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-6 sm:p-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#FF7900]">
              <Loader2 className="animate-spin mb-3 text-[#FF7900]" size={36} />
              <p className="text-sm font-semibold text-gray-700">Loading enquiry data...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Section 1: Basic */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <FileText size={16} /> Section 1 - Enquiry Basic Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Number</label>
                    <input type="text" readOnly value={formData.enquiryNumber || ""} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600 text-sm cursor-not-allowed font-medium" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Date <span className="text-red-500">*</span></label>
                    <input type="date" required name="enquiryDate" value={formData.enquiryDate || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Type <span className="text-red-500">*</span></label>
                    <select required name="enquiryTypeId" value={formData.enquiryTypeId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select</option>
                      {masters.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Source <span className="text-red-500">*</span></label>
                    <select required name="enquirySourceId" value={formData.enquirySourceId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select</option>
                      {masters.sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Company Name <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      name="customerId"
                      value={formData.customerId || ""}
                      onChange={handleCustomerChange}
                      options={customerOptions}
                      placeholder="Select Company Name"
                      isClearable={false}
                      className="text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Inherited Customer Details Box */}
                {selectedCustomerInfo && (
                  <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-lg p-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-3 gap-x-4 text-xs">
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Code</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.customerCode || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Company Name</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.companyName || selectedCustomerInfo.customerName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">GSTIN</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.gstin || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">PAN</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.pan || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Industry</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.industryName || "-"}</span></div>

                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Area</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.customerAreaName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Sales Manager</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.salesManagerName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">BDE</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.bdeUserName || "-"}</span></div>
                      <div className="sm:col-span-2 md:col-span-2"><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Payment Terms</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.paymentTermName || "-"}</span></div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic mt-3 border-t border-blue-100 pt-2">Automatically inherited from Customer Master.</p>
                  </div>
                )}
              </div>

              {/* Section 2: Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <Phone size={16} /> Section 2 - Enquiry Contact
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Contact</label>
                    <SearchableSelect
                      name="contactId"
                      value={formData.contactId !== undefined && formData.contactId !== null && formData.contactId !== "" ? Number(formData.contactId) : ""}
                      onChange={handleContactChange}
                      options={contactOptions}
                      placeholder={
                        !formData.customerId
                          ? "Select Customer first"
                          : isLoadingContacts
                            ? "Loading contacts..."
                            : filteredContacts.length === 0
                              ? "No contacts found"
                              : "Select Contact"
                      }
                      isDisabled={!formData.customerId || isLoadingContacts}
                      isLoading={isLoadingContacts}
                      isClearable={true}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Contact Name</label>
                    <input type="text" name="contactName" value={formData.contactName || ""} onChange={handleInputChange} placeholder="Contact Person Name" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Department</label>
                    <SearchableSelect
                      name="departmentName"
                      value={formData.departmentName || ""}
                      onChange={(val) => {
                        setFormData((prev: any) => ({ ...prev, departmentName: val || "" }));
                      }}
                      options={departmentOptions}
                      placeholder="Select or type department..."
                      isCreatable={true}
                      isClearable={true}
                      isSearchable={true}
                      className="text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Designation</label>
                    <SearchableSelect
                      name="designation"
                      value={formData.designation || ""}
                      onChange={(val) => {
                        setFormData((prev: any) => ({ ...prev, designation: val || "" }));
                      }}
                      options={designationOptions}
                      placeholder="Select or type designation..."
                      isCreatable={true}
                      isClearable={true}
                      isSearchable={true}
                      className="text-sm font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Mobile</label>
                    <input type="text" name="contactMobile" value={formData.contactMobile || ""} onChange={handleInputChange} placeholder="Contact Number / Mobile" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Email</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail || ""} onChange={handleInputChange} placeholder="Email ID" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Section 3: Requirement */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <Building size={16} /> Section 3 - Requirement Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Product Category <span className="text-red-500">*</span></label>
                    <select required name="productCategoryId" value={formData.productCategoryId || ""} onChange={handleInputChange} className="w-full md:w-1/4 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select Category</option>
                      {masters.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Requirement Subject <span className="text-red-500">*</span></label>
                    <input type="text" required name="requirementSubject" value={formData.requirementSubject || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Requirement <span className="text-red-500">*</span></label>
                    <textarea required name="customerRequirement" rows={3} value={formData.customerRequirement || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Required Quantity</label>
                    <input type="number" name="requiredQuantity" value={formData.requiredQuantity ?? ""} onChange={handleInputChange} onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">UOM</label>
                    <select name="unitOfMeasureId" value={formData.unitOfMeasureId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select</option>
                      {masters.uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Commercial */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <IndianRupee size={16} /> Section 4 - Commercial Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Order Value</label>
                    <input type="number" name="expectedOrderValue" value={formData.expectedOrderValue ?? ""} onChange={handleInputChange} onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Currency</label>
                    <select name="currencyId" value={formData.currencyId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">INR</option>
                      {masters.currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Budget</label>
                    <input type="number" name="customerBudget" value={formData.customerBudget ?? ""} onChange={handleInputChange} onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Closing Date</label>
                    <input type="date" name="expectedClosingDate" value={formData.expectedClosingDate || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Probability %</label>
                    <input
                      type="text"
                      name="probabilityPercentage"
                      value={formData.probabilityPercentage !== undefined && formData.probabilityPercentage !== null ? formData.probabilityPercentage : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.%]/g, '');
                        setFormData((prev: any) => ({ ...prev, probabilityPercentage: val }));
                      }}
                      placeholder="e.g. 50%"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Payment Terms</label>
                    <select name="paymentTermId" value={formData.paymentTermId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Payment Terms</option>
                      {masters.paymentTerms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Credit Limit</label>
                    <input type="number" name="customerCreditLimit" value={formData.customerCreditLimit ?? ""} onChange={handleInputChange} onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm no-spin [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                </div>
              </div>

              {/* Section 5: Pipeline & Assignment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <Layers size={16} /> Section 5 - Pipeline & Assignment
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Status <span className="text-red-500">*</span></label>
                    <select required name="enquiryStatusId" value={formData.enquiryStatusId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm font-semibold">
                      <option value="">Select Status</option>
                      {masters.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Stage <span className="text-red-500">*</span></label>
                    <select required name="enquiryStageId" value={formData.enquiryStageId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select Stage</option>
                      {masters.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Priority <span className="text-red-500">*</span></label>
                    <select required name="enquiryPriorityId" value={formData.enquiryPriorityId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select Priority</option>
                      {masters.priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Assigned Director</label>
                    <select
                      name="directorId"
                      value={formData.directorId || formData.salesManagerId || ""}
                      onChange={(e) => {
                        const dId = e.target.value ? Number(e.target.value) : "";
                        const d = directorsList.find((dir: any) => Number(dir.directorId ?? dir.DirectorId ?? dir.id) === dId);
                        const dirName = d ? (d.directorName || d.fullName || d.name || "") : "";
                        setFormData((prev: any) => ({
                          ...prev,
                          directorId: dId,
                          directorName: dirName,
                          salesManagerId: dId,
                          salesManagerName: dirName,
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm text-gray-800"
                    >
                      <option value="">Select Director</option>
                      {directorsList.map((d: any) => {
                        const id = d.directorId ?? d.DirectorId ?? d.id;
                        const name = d.directorName || d.fullName || d.name;
                        return (
                          <option key={id} value={id}>
                            {name} {d.directorCode ? `(${d.directorCode})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Assigned Sales Executive</label>
                    <select
                      name="bdeUserId"
                      value={formData.bdeUserId || ""}
                      onChange={(e) => {
                        const bId = e.target.value ? Number(e.target.value) : "";
                        const bde = bdeUsersList.find((b: any) => Number(b.id ?? b.bdeUserId) === bId);
                        setFormData((prev: any) => ({
                          ...prev,
                          bdeUserId: bId,
                          bdeUserName: bde ? (bde.name || (bde as any).value || (bde as any).fullName || "") : "",
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm text-gray-800"
                    >
                      <option value="">Select Sales Executive</option>
                      {bdeUsersList.map((b: any) => {
                        const id = b.id || (b as any).bdeUserId;
                        const name = b.name || (b as any).value || (b as any).fullName || (b as any).userName;
                        return (
                          <option key={id} value={id}>
                            {name} {(b as any).code ? `(${(b as any).code})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Territory</label>
                    <select
                      name="salesTerritoryId"
                      value={formData.salesTerritoryId || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm text-gray-800"
                    >
                      <option value="">Select Territory</option>
                      {areasList && areasList.length > 0 ? (
                        areasList.map((a: any) => {
                          const id = a.customerAreaId ?? a.CustomerAreaId ?? a.areaId ?? a.id;
                          const name = a.areaName ?? a.AreaName ?? a.name;
                          return (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          );
                        })
                      ) : (
                        masters.territories.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">Assigned Director and Assigned Sales Executive default from Customer Master and can be selected manually.</p>
              </div>

              {/* Section 6: Followup */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#FF7900] flex items-center gap-2">
                    <Calendar size={16} /> Section 6 - Follow-up & Outcome
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Lost Reason</label>
                    <select name="lostReasonId" value={formData.lostReasonId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select</option>
                      {masters.lostReasons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Outcome / Remarks</label>
                    <textarea name="outcomeInternalRemarks" rows={3} value={formData.outcomeInternalRemarks || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={buttonStyles.cancel}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isLoading || isUploading} className={buttonStyles.save}>
            {isSubmitting ? <><Loader2 className="animate-spin inline mr-1" size={16} /> Saving...</> : "Update Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEnquiryModal;