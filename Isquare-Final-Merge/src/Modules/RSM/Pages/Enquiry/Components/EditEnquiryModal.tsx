import React, { useEffect, useState } from "react";
import { X, Loader2, FileText, Phone, Building, IndianRupee, Layers, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getEnquiryById, updateEnquiry, } from "../Services/EnquiryService";
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
  const [isUploading, ] = useState(false);

  const [formData, setFormData] = useState<any>({});
  
  // Master Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [, setBdeUsersList] = useState<MasterItem[]>([]);

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
        enquiryRes, custRes, contRes, termsRes,
        types, sources, categories, uoms, places, currencies,
        statuses, stages, priorities, territories, lostReasons, departments, activities,
        salesManagersRes, bdeUsersRes
      ] = await Promise.all([
        getEnquiryById(enquiryId!),
        getCustomers().catch(() => []),
        getAllContacts().catch(() => []),
        getAllPaymentTerms().catch(() => []),
        getEnquiryTypes(), getEnquirySources(), getProductCategories(), getUOMs(), getPlacesOfSupply(), getCurrencies(),
        getEnquiryStatuses(), getEnquiryStages(), getEnquiryPriorities(), getTerritories(), getLostReasons(), getDepartments(), getActivityTypes().catch(() => []),
        getSalesManagers().catch(() => []),
        getBdeUsers().catch(() => [])
      ]);

      setCustomers(custRes);
      setContacts(contRes);
      setBdeUsersList(bdeUsersRes);

      setMasters({
        types, sources, categories, uoms, places, currencies, statuses, stages,
        priorities, territories, lostReasons, departments, activities,
        paymentTerms: termsRes.map((pt: any) => ({ id: pt.paymentTermId, name: pt.paymentTermName })),
        salesManagers: salesManagersRes
      });

      // Format dates for inputs
      const preppedData = { ...enquiryRes };
      if (preppedData.enquiryDate) preppedData.enquiryDate = preppedData.enquiryDate.substring(0, 10);
      if (preppedData.expectedClosingDate) preppedData.expectedClosingDate = preppedData.expectedClosingDate.substring(0, 10);
      if (preppedData.nextFollowUpDate) preppedData.nextFollowUpDate = preppedData.nextFollowUpDate.substring(0, 10);

      setFormData(preppedData);
      
      // Filter contacts based on customer
      if (preppedData.customerId) {
        setFilteredContacts(contRes.filter(c => c.companyId === preppedData.customerId));
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

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value ? Number(e.target.value) : "";
    setFormData((prev: any) => ({
      ...prev, customerId: custId, contactId: "", contactName: "", departmentName: "", designation: "", contactMobile: "", contactEmail: ""
    }));

    if (custId) {
      const cust = customers.find(c => c.customerId === custId);
      setFilteredContacts(contacts.filter(c => c.companyId === custId));

      let bdeId: number | "" = cust?.bdeUserId || cust?.bdeId || cust?.assignedBdeId || "";
      let bdeName: string = cust?.bdeUserName || cust?.bdeName || cust?.assignedBdeName || "";
      let smId: number | "" = cust?.salesManagerId || "";
      let smName: string = cust?.salesManagerName || "";

      setFormData((prev: any) => ({
        ...prev,
        paymentTermId: cust?.paymentTermsId || cust?.paymentTermId || prev.paymentTermId,
        customerCreditLimit: cust?.creditLimit || prev.customerCreditLimit,
        salesManagerId: smId || prev.salesManagerId,
        salesManagerName: smName || prev.salesManagerName,
        bdeUserId: bdeId || prev.bdeUserId,
        bdeUserName: bdeName || prev.bdeUserName
      }));
    } else {
      setFilteredContacts([]);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contId = e.target.value ? Number(e.target.value) : "";
    if (contId) {
      const contact = filteredContacts.find(c => c.contactId === contId);
      setFormData((prev: any) => ({
        ...prev,
        contactId: contId,
        contactName: contact?.fullName || "",
        departmentName: contact?.department || "",
        designation: contact?.designation || "",
        contactMobile: contact?.mobileNo || "",
        contactEmail: contact?.emailAddress || ""
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, contactId: "", contactName: "", departmentName: "", designation: "", contactMobile: "", contactEmail: "" }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId) return;

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
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
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
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer <span className="text-red-500">*</span></label>
                    <select required name="customerId" value={formData.customerId || ""} onChange={handleCustomerChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm font-medium">
                      <option value="">Select Customer</option>
                      {customers.map((c: any) => <option key={c.customerId} value={c.customerId}>{c.customerCode} — {c.customerName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <Phone size={16} /> Section 2 - Enquiry Contact
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Customer Contact</label>
                    <select name="contactId" value={formData.contactId || ""} onChange={handleContactChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                      <option value="">Select Contact</option>
                      {filteredContacts.map((c: any) => <option key={c.contactId} value={c.contactId}>{c.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Contact Name</label>
                    <input type="text" name="contactName" value={formData.contactName || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Department</label>
                    <input type="text" name="departmentName" value={formData.departmentName || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Mobile</label>
                    <input type="text" name="contactMobile" value={formData.contactMobile || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
              </div>

              {/* Section 3: Requirement */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
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
                    <input type="number" name="requiredQuantity" value={formData.requiredQuantity || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
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
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee size={16} /> Section 4 - Commercial Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Order Value</label>
                    <input type="number" name="expectedOrderValue" value={formData.expectedOrderValue || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest block">Expected Closing Date</label>
                    <input type="date" name="expectedClosingDate" value={formData.expectedClosingDate || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
              </div>

              {/* Section 5: Pipeline & Assignment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
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
                </div>
              </div>

              {/* Section 6: Followup */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-gray-200 pb-2.5">
                  <h3 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider flex items-center gap-2">
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