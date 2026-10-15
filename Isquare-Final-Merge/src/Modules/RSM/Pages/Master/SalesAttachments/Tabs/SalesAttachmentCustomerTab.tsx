import React from "react";
import { Building2, User, Phone, Activity } from "lucide-react";
import type { CustomerOption, ActivityOption } from "../Types/SalesAttachmentTypes";

interface FormData {
  documentType: string;
  customerId: number | null;
  enquiryId: string;
  salesActivityId: number | null;
  remarks: string;
  file: File | null;
}

interface SalesAttachmentCustomerTabProps {
  formData: FormData;
  customers: CustomerOption[];
  activities: ActivityOption[];
}

const SalesAttachmentCustomerTab: React.FC<SalesAttachmentCustomerTabProps> = ({
  formData,
  customers,
  activities,
}) => {
  const selectedCustomer = customers.find((c) => c.value === formData.customerId);
  const selectedActivity = activities.find((a) => a.value === formData.salesActivityId);

  const cardStyle =
    "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Customer Information Card */}
      <div className={cardStyle}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#00234a]">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00234a]">Associated Customer</h3>
            <p className="text-xs text-slate-400">Customer account bound to this document</p>
          </div>
        </div>

        {selectedCustomer ? (
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
                CUSTOMER NAME
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {selectedCustomer.label}
              </p>
            </div>
            {selectedCustomer.customerCode && (
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
                  CUSTOMER CODE
                </span>
                <p className="text-sm font-mono text-slate-700">
                  {selectedCustomer.customerCode}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <Phone size={14} className="text-[#F37021]" />
              <span>Available in CRM Customer Master</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <User size={32} className="mb-2 text-slate-300" />
            <p className="text-xs font-medium">No Customer selected yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Select a customer in the &quot;Attachment Details&quot; tab.
            </p>
          </div>
        )}
      </div>

      {/* Activity & Enquiry Card */}
      <div className={cardStyle}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F37021]">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00234a]">Activity & Enquiry Linkage</h3>
            <p className="text-xs text-slate-400">Contextual linkage within CRM</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
              ENQUIRY ID
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {formData.enquiryId || <span className="text-slate-400 italic">None specified</span>}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
              LINKED SALES ACTIVITY
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {selectedActivity ? (
                selectedActivity.label
              ) : formData.salesActivityId ? (
                `Activity #${formData.salesActivityId}`
              ) : (
                <span className="text-slate-400 italic">Not linked to specific activity</span>
              )}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 block">
              DOCUMENT TYPE
            </span>
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#00234a] text-xs font-semibold rounded-lg mt-1 border border-blue-100">
              {formData.documentType || "Not chosen"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAttachmentCustomerTab;
