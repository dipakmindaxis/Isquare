import React, { useEffect, useState } from "react";
import {
  X,
  Loader2,
  FileText,
  Phone,
  Building,
  IndianRupee,
  Layers,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { getEnquiryById } from "../Services/EnquiryService";
import type { EnquiryDto } from "../Types/EnquiryTypes";

interface ViewEnquiryModalProps {
  isOpen: boolean;
  enquiryId: number | null;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-colors">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-[#154068] break-words">
      {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
    </p>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-3 mt-4 first:mt-0">
    <div className="bg-[#FF7900] p-1.5 rounded text-white">
      <Icon size={14} />
    </div>
    <h3 className="font-bold text-[#FF7900] uppercase text-xs tracking-wider">{title}</h3>
  </div>
);

const ViewEnquiryModal: React.FC<ViewEnquiryModalProps> = ({ isOpen, enquiryId, onClose }) => {
  const [enquiry, setEnquiry] = useState<EnquiryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && enquiryId) {
      const fetchEnquiry = async () => {
        setIsLoading(true);
        try {
          const data = await getEnquiryById(enquiryId);
          setEnquiry(data);
        } catch (error) {
          toast.error("Failed to load enquiry details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchEnquiry();
    }
  }, [isOpen, enquiryId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-16px)] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200 border border-gray-200">
        
        {/* Header */}
        <div className="bg-[#FF7900] p-4 sm:p-6 text-white flex justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-inner shrink-0">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-xl font-bold tracking-wide truncate max-w-[200px] sm:max-w-md">
                  Enquiry: {enquiry?.enquiryNumber || "..."}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${enquiry?.isActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                  {enquiry?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-orange-100 opacity-90 mt-0.5 truncate">
                Customer: {enquiry?.customerName || "-"} | Date: {enquiry?.enquiryDate?.substring(0, 10) || "-"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#FF7900]">
              <Loader2 className="animate-spin mb-2" size={36} />
              <p className="font-semibold text-sm">Loading enquiry details...</p>
            </div>
          ) : enquiry ? (
            <>
              <div>
                <SectionHeader icon={FileText} title="Basic Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem label="Enquiry Number" value={enquiry.enquiryNumber} />
                  <DetailItem label="Enquiry Date" value={enquiry.enquiryDate?.substring(0, 10)} />
                  <DetailItem label="Enquiry Type" value={enquiry.enquiryTypeName} />
                  <DetailItem label="Enquiry Source" value={enquiry.enquirySourceName} />
                  <DetailItem label="Customer Name" value={enquiry.customerName} />
                  <DetailItem label="Customer Code" value={enquiry.customerCode} />
                </div>
              </div>

              <div>
                <SectionHeader icon={Phone} title="Contact Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <DetailItem label="Contact Name" value={enquiry.contactName} />
                  <DetailItem label="Department" value={enquiry.departmentName} />
                  <DetailItem label="Designation" value={enquiry.designation} />
                  <DetailItem label="Mobile" value={enquiry.contactMobile} />
                  <DetailItem label="Email" value={enquiry.contactEmail} />
                </div>
              </div>

              <div>
                <SectionHeader icon={Building} title="Requirement Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem label="Product Category" value={enquiry.productCategoryName} />
                  <DetailItem label="Subject" value={enquiry.requirementSubject} />
                  <DetailItem label="Required Quantity" value={enquiry.requiredQuantity} />
                  <DetailItem label="UOM" value={enquiry.unitOfMeasureName} />
                  <DetailItem label="Delivery Timeline" value={enquiry.deliveryTimeline} />
                  <DetailItem label="Place of Supply" value={enquiry.placeOfSupplyName} />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <DetailItem label="Customer Requirement" value={enquiry.customerRequirement} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <DetailItem label="Technical Specifications / Notes" value={enquiry.technicalSpecificationNotes} />
                  </div>
                </div>
              </div>

              <div>
                <SectionHeader icon={IndianRupee} title="Commercial Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <DetailItem label="Expected Order Value" value={enquiry.expectedOrderValue ? `₹${enquiry.expectedOrderValue.toLocaleString()}` : "-"} />
                  <DetailItem label="Currency" value={enquiry.currencyCode} />
                  <DetailItem label="Customer Budget" value={enquiry.customerBudget} />
                  <DetailItem label="Expected Closing Date" value={enquiry.expectedClosingDate?.substring(0, 10)} />
                  <DetailItem label="Probability (%)" value={enquiry.probabilityPercentage} />
                  <DetailItem label="Payment Terms" value={enquiry.paymentTermName} />
                  <DetailItem label="Customer Credit Limit" value={enquiry.customerCreditLimit} />
                </div>
              </div>

              <div>
                <SectionHeader icon={Layers} title="Sales Assignment & Pipeline" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <DetailItem label="Status" value={enquiry.enquiryStatusName} />
                  <DetailItem label="Stage" value={enquiry.enquiryStageName} />
                  <DetailItem label="Priority" value={enquiry.enquiryPriorityName} />
                  <DetailItem label="Sales Manager" value={enquiry.salesManagerName} />
                  <DetailItem label="BDE / Employee" value={enquiry.bdeUserName} />
                  <DetailItem label="Department" value={enquiry.departmentMasterName} />
                  <DetailItem label="Territory" value={enquiry.salesTerritoryName} />
                  <DetailItem label="Responsible Person" value={enquiry.responsiblePerson} />
                </div>
              </div>

              <div>
                <SectionHeader icon={Calendar} title="Follow-up & Outcome" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  <DetailItem label="Next Follow-up" value={enquiry.nextFollowUpDate?.substring(0, 10)} />
                  <DetailItem label="Next Activity" value={enquiry.activityTypeName} />
                  <DetailItem label="Lost Reason" value={enquiry.lostReasonName} />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <DetailItem label="Outcome / Internal Remarks" value={enquiry.outcomeInternalRemarks} />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEnquiryModal;