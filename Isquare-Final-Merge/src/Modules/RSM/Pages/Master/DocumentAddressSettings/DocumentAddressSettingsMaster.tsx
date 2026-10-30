import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Paperclip, FileText, Home } from "lucide-react";
import { DocumentTypeMaster } from "../DocumentType/DocumentTypeMaster";
import AddressType from "../AddressType/AddressType";

export type DocumentAddressTab = "document-type" | "address-type";

interface DocumentAddressSettingsMasterProps {
  initialTab?: DocumentAddressTab;
}

interface TabConfig {
  id: DocumentAddressTab;
  label: string;
  shortDesc: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "document-type",
    label: "Document Types",
    shortDesc: "Allowable customer documents, contracts & compliance attachments",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "address-type",
    label: "Address Types",
    shortDesc: "Billing, shipping, headquarter & operational site classifications",
    icon: <Home className="w-4 h-4" />,
  },
];

const TAB_ROUTES: Record<DocumentAddressTab, string> = {
  "document-type": "/rsm/master/document-type",
  "address-type": "/rsm/address-type",
};

export const DocumentAddressSettingsMaster: React.FC<DocumentAddressSettingsMasterProps> = ({
  initialTab,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab")?.toLowerCase() as DocumentAddressTab | undefined;

  const validTabs: DocumentAddressTab[] = ["document-type", "address-type"];

  const [activeTab, setActiveTab] = useState<DocumentAddressTab>(() => {
    if (queryTab && validTabs.includes(queryTab)) return queryTab;
    if (initialTab && validTabs.includes(initialTab)) return initialTab;
    return "document-type";
  });

  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (queryTab && validTabs.includes(queryTab) && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleSelectTab = (tabId: DocumentAddressTab) => {
    setActiveTab(tabId);
    navigate(TAB_ROUTES[tabId]);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Paperclip className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Document & Address Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Centralized configuration for customer document upload classifications and address location types.
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
                    ? "border-[#FF7900] text-[#FF7900] font-semibold bg-orange-50/50 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <span className={isActive ? "text-[#FF7900]" : "text-gray-400"}>
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
        {activeTab === "document-type" && <DocumentTypeMaster isTab={true} />}
        {activeTab === "address-type" && <AddressType isTab={true} />}
      </div>
    </div>
  );
};

export default DocumentAddressSettingsMaster;
