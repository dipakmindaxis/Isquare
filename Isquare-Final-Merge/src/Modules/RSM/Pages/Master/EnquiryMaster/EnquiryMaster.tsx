import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  Share2,
  Layers,
  PieChart,
  ListChecks,
  MessageSquare,
  XCircle,
  AlertCircle,
  Coins,
  Building2,
  MapPin,
  Truck,
} from "lucide-react";

// Import your newly created sub-master component
import { EnquirySourceMaster } from "./EnquirySource/EnquirySourceMaster"; // Adjust the import path if necessary
import { EnquiryTypeMaster } from "./EnquiryType/EnquiryTypeMaster";
import { EnquiryStatusMaster } from "./EnquiryStatus/EnquiryStatusMaster";
import { EnquiryStageMaster } from "./EnquiryStage/EnquiryStageMaster";
import { UnitOfMeasureMaster } from "./UnitOfMeasure/UnitOfMeasureMaster"; // Added UnitOfMeasure Import
import { EnquiryPriorityMaster } from "./EnquiryPriority/EnquiryPriorityMaster";

// import { EnquiryDocumentTypeMaster } from "./EnquiryDocumentType/EnquiryDocumentTypeMaster";
import { LostReasonMaster } from "./LostReason/LostReasonMaster";
import { CurrencyMaster } from "./Currency/CurrencyMaster";
import { DepartmentMaster } from "./Department/DepartmentMaster";
import { SalesTerritoryMaster } from "./SalesTerritory/SalesTerritoryMaster";
import { PlaceOfSupplyMaster } from "./PlaceOfSupply/PlaceOfSupplyMaster";

export type EnquiryTab =
  | "source"
  | "type"
  | "status"
  | "stage"
  | "priority"
  | "uom"
  | "currency"
  | "department"
  | "territory"
  | "place-of-supply"
  | "document-type"
  | "lost-reason";

interface EnquiryMasterProps {
  initialTab?: EnquiryTab;
}

interface TabConfig {
  id: EnquiryTab;
  label: string;
  shortDesc: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "source",
    label: "Enquiry Source",
    shortDesc: "Manage origins and acquisition channels for new enquiries",
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    id: "type",
    label: "Enquiry Type",
    shortDesc: "Classifications and categories of customer enquiries",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "status",
    label: "Enquiry Status",
    shortDesc: "Current state and progress tracking markers for enquiries",
    icon: <PieChart className="w-4 h-4" />,
  },
  {
    id: "stage",
    label: "Enquiry Stage",
    shortDesc: "Lifecycle phases and funnel milestones for enquiries",
    icon: <ListChecks className="w-4 h-4" />,
  },
  {
    id: "uom",
    label: "Unit of Measure",
    shortDesc: "Unit of Measure",
    icon: <MessageSquare className="w-4 h-4" />,
  },
   {
    id: "currency",
    label: "Currency",
    shortDesc: "Accepted currencies for enquiry estimations and quotes",
    icon: <Coins className="w-4 h-4" />,
  },
   {
    id: "department",
    label: "Department",
    shortDesc: "Organizational departments assigned to enquiries",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: "territory",
    label: "Sales Territory",
    shortDesc: "Geographic or operational sales jurisdictions",
    icon: <MapPin className="w-4 h-4" />,
  },
    {
    id: "place-of-supply",
    label: "Place of Supply",
    shortDesc: "Tax jurisdictions and GST billing origins/destinations",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    id: "lost-reason",
    label: "Lost Reason",
    shortDesc: "Standardized explanations for dropped or unsuccessful enquiries",
    icon: <XCircle className="w-4 h-4" />,
  },
  {
  id: "priority",
  label: "Enquiry Priority",
  shortDesc: "Urgency levels and priority ratings for enquiries",
  icon: <AlertCircle className="w-4 h-4" />,
},

];

export const EnquiryMaster: React.FC<EnquiryMasterProps> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = (
    searchParams.get("tab") ||
    initialTab ||
    "source"
  ).toLowerCase() as EnquiryTab;

  const activeTab: EnquiryTab = useMemo(() => {
    const validTabs: EnquiryTab[] = [
      "source",
      "type",
      "status",
      "stage",
      "priority",
      "uom",
      "currency",
      "department",
      "territory",
      "place-of-supply",
      "lost-reason",
    ];
    return validTabs.includes(rawTab) ? rawTab : "source";
  }, [rawTab]);

  useEffect(() => {
    if (initialTab && searchParams.get("tab") !== initialTab) {
      setSearchParams({ tab: initialTab }, { replace: true });
    }
  }, [initialTab, searchParams, setSearchParams]);

  const handleSelectTab = (tabId: EnquiryTab) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-50 border border-blue-500/30 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Enquiry Masters
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-500/20">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Unified master management for enquiry sources, types, statuses, stages, channels, document types, and lost reasons.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold bg-blue-50/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      <div className="w-full">
        {activeTab === "source" && (
           <EnquirySourceMaster isTab={true} />
        )}
        
         {activeTab === "type" && (
           <EnquiryTypeMaster isTab={true} />
        )}
        
     
        {activeTab === "status" && (
           <EnquiryStatusMaster isTab={true} />
        )}

        
      
        {activeTab === "stage" && (
           <EnquiryStageMaster isTab={true} />
        )}
           {activeTab === "priority" && (
        <EnquiryPriorityMaster isTab={true} />
      )}
       {activeTab === "uom" && (
           <UnitOfMeasureMaster isTab={true} />
        )}

      {activeTab === "currency" && <CurrencyMaster isTab={true} />}
      {activeTab === "department" && <DepartmentMaster isTab={true} />}
      {activeTab === "territory" && <SalesTerritoryMaster isTab={true} />}
      {activeTab === "place-of-supply" && <PlaceOfSupplyMaster isTab={true} />}
      {activeTab === "lost-reason" && (<LostReasonMaster isTab={true} />)}
     
      </div>
    </div>
  );
};

export default EnquiryMaster;