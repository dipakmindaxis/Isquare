import React, { useEffect, useState } from "react";
import { X, Loader2, FileText, Phone, Building, Briefcase, IndianRupee, Layers, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getNextEnquiryNumber, createEnquiry, uploadEnquiryDocument } from "../Services/EnquiryService";
import {
  getEnquiryTypes, getEnquirySources, getProductCategories, getUOMs, getPlacesOfSupply,
  getCurrencies, getEnquiryStatuses, getEnquiryStages, getEnquiryPriorities, getTerritories,
  getLostReasons, getDepartments, getActivityTypes, getSalesManagers, getBdeUsers
} from "../Services/EnquiryMasterDataService";
import { getCustomers } from "../../Customer/Services/CustomerService";
import { getAllPaymentTerms } from "../../Master/PaymentTerm/Services/PaymentTermService";
import { getAllContacts } from "../../Master/Contact/Services/ContactService";
import type { MasterItem } from "../Types/EnquiryTypes";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface AddEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEnquiryModal: React.FC<AddEnquiryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    enquiryDate: new Date().toISOString().split("T")[0],
    enquiryNumber: "",
  });

  // Master Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [bdeUsersList, setBdeUsersList] = useState<MasterItem[]>([]);

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

  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        nextNumber, custRes, contRes, termsRes,
        types, sources, categories, uoms, places, currencies,
        statuses, stages, priorities, territories, lostReasons, departments, activities,
        salesManagersRes, bdeUsersRes
      ] = await Promise.all([
        getNextEnquiryNumber().catch(() => ""),
        getCustomers().catch(() => []),
        getAllContacts().catch(() => []),
        getAllPaymentTerms().catch(() => []),
        getEnquiryTypes(), getEnquirySources(), getProductCategories(), getUOMs(), getPlacesOfSupply(), getCurrencies(),
        getEnquiryStatuses(), getEnquiryStages(), getEnquiryPriorities(), getTerritories(), getLostReasons(), getDepartments(), getActivityTypes(),
        getSalesManagers().catch(() => []),
        getBdeUsers().catch(() => [])
      ]);

      setFormData({ enquiryDate: new Date().toISOString().split("T")[0], enquiryNumber: nextNumber });
      setCustomers(custRes);
      setContacts(contRes);
      setBdeUsersList(bdeUsersRes);

      setMasters({
        types, sources, categories, uoms, places, currencies, statuses, stages,
        priorities, territories, lostReasons, departments, activities,
        paymentTerms: termsRes.map((pt: any) => ({ id: pt.paymentTermId, name: pt.paymentTermName })),
        salesManagers: salesManagersRes
      });

    } catch (error) {
      toast.error("Failed to load initial data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value ? Number(e.target.value) : "";
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
      const cust = customers.find(c => c.customerId === custId);
      setSelectedCustomerInfo(cust);
      setFilteredContacts(contacts.filter(c => c.companyId === custId));

      // Auto-populate BDE from Customer Master
      let bdeId: number | "" = cust?.bdeUserId || cust?.bdeId || cust?.assignedBdeId || "";
      let bdeName: string = cust?.bdeUserName || cust?.bdeName || cust?.assignedBdeName || "";

      if (bdeId && !bdeName && bdeUsersList.length > 0) {
        const matchedBde = bdeUsersList.find(b => b.id === Number(bdeId));
        if (matchedBde) bdeName = matchedBde.name;
      } else if (!bdeId && bdeName && bdeUsersList.length > 0) {
        const matchedBde = bdeUsersList.find(b => b.name.toLowerCase() === bdeName.toLowerCase());
        if (matchedBde) bdeId = matchedBde.id;
      }

      // Auto-populate Sales Manager if assigned to customer, else preserve or allow selection
      let smId: number | "" = cust?.salesManagerId || "";
      let smName: string = cust?.salesManagerName || "";

      if (!smId && cust?.directorId) {
        const matchedSm = masters.salesManagers.find(m => m.id === cust.directorId || (cust.directorName && m.name.toLowerCase() === cust.directorName.toLowerCase()));
        if (matchedSm) {
          smId = matchedSm.id;
          smName = matchedSm.name;
        }
      } else if (!smId && cust?.salesManagerName) {
        const matchedSm = masters.salesManagers.find(m => m.name.toLowerCase() === cust.salesManagerName.toLowerCase());
        if (matchedSm) {
          smId = matchedSm.id;
          smName = matchedSm.name;
        }
      } else if (smId && !smName) {
        const matchedSm = masters.salesManagers.find(m => m.id === Number(smId));
        if (matchedSm) smName = matchedSm.name;
      }

      // Auto-fill commercial & assignment details from customer master
      setFormData((prev: any) => ({
        ...prev,
        paymentTermId: cust?.paymentTermsId || cust?.paymentTermId || "",
        customerCreditLimit: cust?.creditLimit || "",
        salesManagerId: smId,
        salesManagerName: smName,
        bdeUserId: bdeId,
        bdeUserName: bdeName
      }));
    } else {
      setSelectedCustomerInfo(null);
      setFilteredContacts([]);
      setFormData((prev: any) => ({
        ...prev,
        paymentTermId: "",
        customerCreditLimit: "",
        salesManagerId: "",
        salesManagerName: "",
        bdeUserId: "",
        bdeUserName: ""
      }));
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contId = e.target.value ? Number(e.target.value) : "";
    if (contId) {
      const contact = filteredContacts.find(c => c.contactId === contId);
      setFormData((prev: any) => ({
        ...prev,
        contactId: contId,
        contactName: contact?.fullName || "", // Fixed property name
        departmentName: contact?.department || "", // Fixed property name
        designation: contact?.designation || "", // Fixed property name
        contactMobile: contact?.mobileNo || "", // Fixed property name
        contactEmail: contact?.emailAddress || ""
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        contactId: "", contactName: "", departmentName: "", designation: "", contactMobile: "", contactEmail: ""
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const res = await uploadEnquiryDocument(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, documentFilePath: res.filePath, documentName: res.originalName }));
        toast.success("Document uploaded successfully");
      } catch (err) {
        toast.error("Failed to upload document");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        if (payload[field] === "") payload[field] = null;
        else if (payload[field] !== undefined && payload[field] !== null) payload[field] = Number(payload[field]);
      });

      await createEnquiry(payload);
      toast.success("Enquiry Created Successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">

      {/* Form Top Bar - Matches Customer Form */}
      <div className="flex justify-between items-center bg-[#FF7900] text-white px-6 py-4 shrink-0 border-b border-[#e06800]">
        <div className="flex items-center gap-2.5">
          <FileText size={20} className="text-white" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
            Create New Enquiry
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
          title="Back to Enquiries List"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-6 sm:p-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#FF7900]">
              <Loader2 className="animate-spin mb-3 text-[#FF7900]" size={36} />
              <p className="text-sm font-semibold text-gray-700">Loading form master data...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* 01. Enquiry Basic Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} /> Section 1 - Enquiry Basic Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block">Enquiry Number</label>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">Auto-generated</span>
                    </div>
                    <input type="text" readOnly value={formData.enquiryNumber} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600 text-sm cursor-not-allowed select-none font-medium" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Date <span className="text-red-500">*</span></label>
                    <input type="date" required name="enquiryDate" value={formData.enquiryDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Type <span className="text-red-500">*</span></label>
                    <select required name="enquiryTypeId" value={formData.enquiryTypeId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Enquiry Type</option>
                      {masters.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Enquiry Source <span className="text-red-500">*</span></label>
                    <select required name="enquirySourceId" value={formData.enquirySourceId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Enquiry Source</option>
                      {masters.sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer <span className="text-red-500">*</span></label>
                    <select required name="customerId" value={formData.customerId || ""} onChange={handleCustomerChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800 font-medium">
                      <option value="">Select Customer</option>
                      {customers.map((c: any) => (
                        <option key={c.customerId} value={c.customerId}>
                          {c.customerCode} — {c.customerName} {c.gstin ? `— ${c.gstin}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inherited Customer Details Box */}
                {selectedCustomerInfo && (
                  <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-lg p-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-y-3 gap-x-4 text-xs">
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Code</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.customerCode}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Name</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.customerName}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">GSTIN</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.gstin || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">PAN</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.pan || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Industry</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.industryName || "-"}</span></div>

                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Area</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.customerAreaName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Sales Manager</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.salesManagerName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">BDE</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.bdeUserName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Payment Terms</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.paymentTermName || "-"}</span></div>
                      <div><span className="text-gray-400 block uppercase text-[9px] font-bold tracking-wider">Credit Limit</span><span className="font-semibold text-gray-800">{selectedCustomerInfo.creditLimit || "-"}</span></div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic mt-3 border-t border-blue-100 pt-2">Automatically inherited from Customer Master.</p>
                  </div>
                )}
              </div>

              {/* 02. Enquiry Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Phone size={16} /> Section 2 - Enquiry Contact
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Contact <span className="text-red-500">*</span></label>
                    <select
                      name="contactId"
                      value={formData.contactId || ""}
                      onChange={handleContactChange}
                      disabled={!formData.customerId}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Contact</option>
                      {filteredContacts.map((c: any) => (
                        <option key={c.contactId} value={c.contactId}>
                          {c.fullName} — {c.department || "N/A"} — {c.mobileNo || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Contact Name</label>
                    <input type="text" name="contactName" value={formData.contactName || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Department</label>
                    <input type="text" name="departmentName" value={formData.departmentName || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Designation</label>
                    <input type="text" name="designation" value={formData.designation || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Mobile</label>
                    <input type="text" name="contactMobile" value={formData.contactMobile || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Email</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* 03. Requirement Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Building size={16} /> Section 3 - Requirement Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Product Category <span className="text-red-500">*</span></label>
                    <select required name="productCategoryId" value={formData.productCategoryId || ""} onChange={handleInputChange} className="w-full md:w-1/4 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Category</option>
                      {masters.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Requirement Subject <span className="text-red-500">*</span></label>
                    <input type="text" required name="requirementSubject" value={formData.requirementSubject || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Requirement <span className="text-red-500">*</span></label>
                    <textarea required name="customerRequirement" rows={3} value={formData.customerRequirement || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Required Quantity</label>
                    <input type="number" name="requiredQuantity" value={formData.requiredQuantity || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">UOM</label>
                    <select name="unitOfMeasureId" value={formData.unitOfMeasureId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select UOM</option>
                      {masters.uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Delivery Timeline</label>
                    <input type="text" name="deliveryTimeline" value={formData.deliveryTimeline || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Place of Supply</label>
                    <select name="placeOfSupplyId" value={formData.placeOfSupplyId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Place of Supply</option>
                      {masters.places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Technical Specification / Notes</label>
                    <textarea name="technicalSpecificationNotes" rows={3} value={formData.technicalSpecificationNotes || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* 05. Commercial Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee size={16} /> Section 4 - Commercial Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Order Value</label>
                    <input type="number" name="expectedOrderValue" value={formData.expectedOrderValue || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
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
                    <input type="number" name="customerBudget" value={formData.customerBudget || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Closing Date</label>
                    <input type="date" name="expectedClosingDate" value={formData.expectedClosingDate || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Probability %</label>
                    <input type="number" name="probabilityPercentage" value={formData.probabilityPercentage || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Payment Terms</label>
                    <select name="paymentTermId" value={formData.paymentTermId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">30 Days</option>
                      {masters.paymentTerms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Credit Limit</label>
                    <input type="number" name="customerCreditLimit" value={formData.customerCreditLimit || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm bg-gray-50" />
                  </div>
                  {/* <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Estimated Tax %</label>
                    <input type="number" name="estimatedTaxPercent" value={formData.estimatedTaxPercent || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div> */}
                </div>
              </div>

              {/* 06. Sales Assignment & Pipeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} /> Section 5 - Sales Assignment & Pipeline
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Status <span className="text-red-500">*</span></label>
                    <select required name="enquiryStatusId" value={formData.enquiryStatusId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm font-semibold text-gray-800">
                      <option value="">Select Status</option>
                      {masters.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Stage <span className="text-red-500">*</span></label>
                    <select required name="enquiryStageId" value={formData.enquiryStageId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Stage</option>
                      {masters.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Priority <span className="text-red-500">*</span></label>
                    <select required name="enquiryPriorityId" value={formData.enquiryPriorityId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Priority</option>
                      {masters.priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Assigned Sales Manager</label>
                    <select
                      name="salesManagerId"
                      value={formData.salesManagerId || ""}
                      onChange={(e) => {
                        const smId = e.target.value ? Number(e.target.value) : "";
                        const sm = masters.salesManagers.find(m => m.id === smId);
                        setFormData((prev: any) => ({
                          ...prev,
                          salesManagerId: smId,
                          salesManagerName: sm ? sm.name : "",
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Sales Manager</option>
                      {masters.salesManagers.map((sm) => (
                        <option key={sm.id} value={sm.id}>
                          {sm.name} {sm.code ? `(${sm.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Assigned BDE / Employee</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.bdeUserName || ""}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700 text-sm cursor-not-allowed font-medium select-none"
                      placeholder="Inherited from Customer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Department</label>
                    <select
                      name="departmentId"
                      value={formData.departmentId || ""}
                      onChange={(e) => {
                        const deptId = e.target.value ? Number(e.target.value) : "";
                        const dept = masters.departments.find(d => d.id === deptId);
                        setFormData((prev: any) => ({
                          ...prev,
                          departmentId: deptId,
                          departmentMasterName: dept ? dept.name : "",
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800"
                    >
                      <option value="">Select Department</option>
                      {masters.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Territory</label>
                    <select name="salesTerritoryId" value={formData.salesTerritoryId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Territory</option>
                      {masters.territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Responsible Person</label>
                    <input type="text" name="responsiblePerson" value={formData.responsiblePerson || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">BDE is inherited from Customer Master. Sales Manager defaults from Customer Master and can be selected manually.</p>
              </div>

              {/* 07. Follow-up / Sales Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} /> Section 6 - Follow-up / Sales Activity
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Next Follow-up Date</label>
                    <input type="date" name="nextFollowUpDate" value={formData.nextFollowUpDate || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Next Activity Type</label>
                    <select name="activityTypeId" value={formData.activityTypeId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Next Activity Type</option>
                      {masters.activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Next Action</label>
                    <input type="text" name="nextAction" value={formData.nextAction || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Reminder</label>
                    <input type="text" name="reminder" value={formData.reminder || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Activity / Discussion Notes</label>
                    <textarea name="activityDiscussionNotes" rows={3} value={formData.activityDiscussionNotes || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* 08. Outcome / Lost Reason */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} /> Section 7 - Outcome / Lost Reason
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Lost Reason</label>
                    <select name="lostReasonId" value={formData.lostReasonId || ""} onChange={handleInputChange} className="w-full md:w-1/4 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm text-gray-800">
                      <option value="">Select Lost Reason</option>
                      {masters.lostReasons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Outcome / Internal Remarks</label>
                    <textarea name="outcomeInternalRemarks" rows={3} value={formData.outcomeInternalRemarks || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Business rule: Lost Reason is mandatory when Status = Lost.</p>
                  </div>
                </div>
              </div>

              {/* 09. Documents & Terms */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} /> Section 8 - Documents & Terms
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Document Reference</label>
                    <input type="text" name="documentReference" value={formData.documentReference || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Document Name</label>
                    <input type="text" name="documentName" value={formData.documentName || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Upload Enquiry Document</label>
                    <div className="flex items-center gap-3">
                      <input type="file" onChange={handleFileUpload} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                      {isUploading && <Loader2 className="animate-spin text-blue-500" size={24} />}
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Terms & Conditions</label>
                    <textarea name="termsAndConditions" rows={3} value={formData.termsAndConditions || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm" />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions - Matches Customer Form */}
        <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={buttonStyles.cancel}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isLoading || isUploading} className={buttonStyles.save}>
            {isSubmitting ? <><Loader2 className="animate-spin inline mr-1" size={16} /> Saving...</> : "Create Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEnquiryModal;
