import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import SalesAttachmentDetailsTab, {
  type SalesAttachmentDetailsTabRef,
} from "./Tabs/SalesAttachmentDetailsTab";
import SalesAttachmentCustomerTab from "./Tabs/SalesAttachmentCustomerTab";
import {
  uploadSalesAttachment,
  getCustomersDropdown,
  getDocumentTypesDropdown,
  getActivitiesDropdown,
} from "./Services/SalesAttachmentService";
import type {
  CustomerOption,
  ActivityOption,
  DocumentTypeOption,
} from "./Types/SalesAttachmentTypes";

interface SalesAttachmentWizardProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const SalesAttachmentWizard: React.FC<SalesAttachmentWizardProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState({
    documentType: "",
    customerId: null as number | null,
    enquiryId: "",
    salesActivityId: null as number | null,
    remarks: "",
    file: null as File | null,
  });

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentTypeOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);

  const detailsTabRef = useRef<SalesAttachmentDetailsTabRef>(null);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [cList, dList, aList] = await Promise.all([
          getCustomersDropdown(),
          getDocumentTypesDropdown(),
          getActivitiesDropdown(),
        ]);
        setCustomers(cList);
        setDocTypes(dList);
        setActivities(aList);
        if (dList.length > 0 && !formData.documentType) {
          setFormData((prev) => ({ ...prev, documentType: dList[0].value }));
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    loadDropdowns();
  }, []);

  const validateDetailsTab = (): boolean => {
    const newErrors: ValidationErrors = {};
    let hasError = false;

    if (!formData.documentType?.trim()) {
      newErrors.documentType = ["Document Type is required"];
      hasError = true;
    }
    if (!formData.customerId) {
      newErrors.customerId = ["Customer selection is required"];
      hasError = true;
    }
    if (!formData.file) {
      newErrors.file = ["An attachment file is required"];
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleTabChange = (index: number) => {
    if (index > activeTab) {
      if (activeTab === 0 && !validateDetailsTab()) {
        toast.error("Please fill in required fields before proceeding.");
        return;
      }
    }
    setActiveTab(index);
  };

  const handleSave = async () => {
    if (!validateDetailsTab()) {
      setActiveTab(0);
      toast.error("Please provide the required file and fields.");
      return;
    }

    if (!formData.file) return;

    setIsSaving(true);
    const toastId = toast.loading("Uploading sales attachment...");

    try {
      await uploadSalesAttachment({
        file: formData.file,
        customerId: formData.customerId,
        enquiryId: formData.enquiryId ? Number(formData.enquiryId) || undefined : undefined,
        salesActivityId: formData.salesActivityId || undefined,
        documentType: formData.documentType,
        remarks: formData.remarks,
      });

      toast.success("Sales attachment uploaded successfully!", { id: toastId });
      onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to upload sales attachment.",
        { id: toastId }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { label: "Attachment Details", icon: <Paperclip size={16} /> },
    { label: "Customer & Activity Info", icon: <Users size={16} /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      {/* Tab Header with Logo Theme Navy & Orange Accent */}
      <div className="flex bg-[#00234a] p-1.5 gap-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => handleTabChange(index)}
            className={`flex-1 py-3 text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center gap-2 relative ${
              activeTab === index
                ? "bg-white text-[#00234a] shadow-lg scale-[1.02] border-b-2 border-[#F37021]"
                : "text-white hover:bg-white/10"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="p-8 bg-white min-h-[450px]">
        {activeTab === 0 && (
          <SalesAttachmentDetailsTab
            ref={detailsTabRef}
            formData={formData}
            setFormData={setFormData}
            customers={customers}
            docTypes={docTypes}
            activities={activities}
            errors={errors}
          />
        )}
        {activeTab === 1 && (
          <SalesAttachmentCustomerTab
            formData={formData}
            customers={customers}
            activities={activities}
          />
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className={buttonStyles.cancel}
        >
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab - 1)}
            className="px-8 py-2.5 bg-[#00234a] text-white rounded-lg font-normal text-sm hover:bg-[#F37021] transition"
          >
            Back
          </button>
        )}
        {activeTab < tabs.length - 1 ? (
          <button
            type="button"
            onClick={() => handleTabChange(activeTab + 1)}
            className="px-8 py-2.5 bg-[#00234a] text-white rounded-lg font-normal text-sm hover:bg-[#F37021] transition"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-10 py-2.5 bg-[#00234a] hover:bg-[#F37021] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Uploading...
              </>
            ) : (
              "Save & Upload"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesAttachmentWizard;
