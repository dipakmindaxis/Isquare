import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Clock,
  Contact,
  PhoneCall,
  Users2,
  CheckCircle2,
  Flag,
  CalendarCheck,
} from "lucide-react";
import { FollowUpMaster } from "../FollowUp/FollowUpMaster";
import ContactTypes from "../ContactTypes/Pages/ContactTypes";
import { CallTypeMaster } from "../CallType/CallTypeMaster";
import { MeetingTypeMaster } from "../MeetingType/MeetingTypeMaster";
import { ActivityTypeMaster } from "../ActivityType/ActivityTypeMaster";
import { PriorityMaster } from "../Priority/PriorityMaster";

export type FollowUpContactTab =
  | "follow-up"
  | "contact-types"
  | "call-type"
  | "meeting-type"
  | "activity-type"
  | "priority";

interface FollowUpContactUpdatesMasterProps {
  initialTab?: FollowUpContactTab;
}

interface TabConfig {
  id: FollowUpContactTab;
  label: string;
  shortDesc: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "follow-up",
    label: "Follow-Up",
    shortDesc: "Automated follow-up cadences, schedule intervals & company reminders",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "contact-types",
    label: "Contact Types",
    shortDesc: "Customer contact designations, department roles & persona categories",
    icon: <Contact className="w-4 h-4" />,
  },
  {
    id: "call-type",
    label: "Call Types",
    shortDesc: "Sales communication categories, outreach modes & phone call types",
    icon: <PhoneCall className="w-4 h-4" />,
  },
  {
    id: "meeting-type",
    label: "Meeting Types",
    shortDesc: "Discussion templates, site visit classifications & presentation formats",
    icon: <Users2 className="w-4 h-4" />,
  },
  {
    id: "activity-type",
    label: "Activity Types",
    shortDesc: "Sales activity outcomes, engagement classifications & result types",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    id: "priority",
    label: "Priorities",
    shortDesc: "SLA urgency levels, task escalations & colored priority flags",
    icon: <Flag className="w-4 h-4" />,
  },
];

export const FollowUpContactUpdatesMaster: React.FC<
  FollowUpContactUpdatesMasterProps
> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = (
    searchParams.get("tab") ||
    initialTab ||
    "follow-up"
  ).toLowerCase() as FollowUpContactTab;

  const activeTab: FollowUpContactTab = useMemo(() => {
    const validTabs: FollowUpContactTab[] = [
      "follow-up",
      "contact-types",
      "call-type",
      "meeting-type",
      "activity-type",
      "priority",
    ];
    return validTabs.includes(rawTab) ? rawTab : "follow-up";
  }, [rawTab]);

  useEffect(() => {
    if (initialTab && searchParams.get("tab") !== initialTab) {
      setSearchParams({ tab: initialTab }, { replace: true });
    }
  }, [initialTab, searchParams, setSearchParams]);

  const handleSelectTab = (tabId: FollowUpContactTab) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Unified Master Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#00234a]/10 text-[#00234a] rounded-xl flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Follow-Up & Contact Updates
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#00234a] border border-blue-100">
                  Unified Master
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Unified master management for customer follow-up cadence, contact roles, communication channels, meetings, activity outcomes, and priority thresholds.
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
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${isActive
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
        {activeTab === "follow-up" && <FollowUpMaster isTab={true} />}
        {activeTab === "contact-types" && <ContactTypes isTab={true} />}
        {activeTab === "call-type" && <CallTypeMaster isTab={true} />}
        {activeTab === "meeting-type" && <MeetingTypeMaster isTab={true} />}
        {activeTab === "activity-type" && <ActivityTypeMaster isTab={true} />}
        {activeTab === "priority" && <PriorityMaster isTab={true} />}
      </div>
    </div>
  );
};

export default FollowUpContactUpdatesMaster;
