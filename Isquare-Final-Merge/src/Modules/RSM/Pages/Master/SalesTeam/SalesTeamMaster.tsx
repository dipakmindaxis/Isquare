import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { UserCheck, UserCog, Users } from "lucide-react";
import BdeUsers from "../BdeUsers/Pages/BdeUsers";
import SalesUserManager from "../SalesUserManager/Pages/SalesUserManager";

export type SalesTeamTab = "bde" | "managers";

interface SalesTeamMasterProps {
  initialTab?: SalesTeamTab;
}

interface TabConfig {
  id: SalesTeamTab;
  label: string;
  shortDesc: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "bde",
    label: "BDE Users",
    shortDesc: "Business Development Executive assignment & account owners",
    icon: <UserCheck className="w-4 h-4" />,
  },
  {
    id: "managers",
    label: "Sales Managers",
    shortDesc: "Sales team management, supervisors & lead managers",
    icon: <UserCog className="w-4 h-4" />,
  },
];

export const SalesTeamMaster: React.FC<SalesTeamMasterProps> = ({
  initialTab,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = (searchParams.get("tab") || initialTab || "bde").toLowerCase() as SalesTeamTab;

  const activeTab: SalesTeamTab = useMemo(() => {
    return rawTab === "managers" ? "managers" : "bde";
  }, [rawTab]);

  useEffect(() => {
    if (initialTab && searchParams.get("tab") !== initialTab) {
      setSearchParams({ tab: initialTab }, { replace: true });
    }
  }, [initialTab, searchParams, setSearchParams]);

  const handleSelectTab = (tabId: SalesTeamTab) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#00234a]/10 text-[#00234a] rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Sales Team Master
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#00234a] border border-blue-100">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Unified administration for Business Development Executives (BDEs) and Sales Managers.
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
                    ? "border-[#F37021] text-[#00234a] font-semibold bg-orange-50/40 rounded-t-lg"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <span className={isActive ? "text-[#F37021]" : "text-gray-400"}>
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
        {activeTab === "bde" && <BdeUsers isTab={true} />}
        {activeTab === "managers" && <SalesUserManager isTab={true} />}
      </div>
    </div>
  );
};

export default SalesTeamMaster;
