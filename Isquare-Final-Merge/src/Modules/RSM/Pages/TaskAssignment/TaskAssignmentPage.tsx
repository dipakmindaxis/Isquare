import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckSquare, CheckCircle2, Paperclip, Flag } from "lucide-react";
import { TasksMaster } from "../SalesActivities/Components/TasksMaster";
import { TaskStatusMaster } from "../Master/TaskStatus/TaskStatusMaster";
import { TaskAttachmentMaster } from "../Master/TaskAttachment/TaskAttachmentMaster";
import { PriorityMaster } from "../Master/Priority/PriorityMaster";

export type TaskAssignmentTab = "tasks" | "status" | "attachments" | "priority";

interface TabConfig {
  id: TaskAssignmentTab;
  label: string;
  icon: React.ReactElement;
}

const TABS: TabConfig[] = [
  {
    id: "tasks",
    label: "Task Assignment",
    icon: <CheckSquare className="w-4 h-4" />,
  },
  {
    id: "status",
    label: "Task Status",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    id: "attachments",
    label: "Task Attachments",
    icon: <Paperclip className="w-4 h-4" />,
  },
  {
    id: "priority",
    label: "Priority Master",
    icon: <Flag className="w-4 h-4" />,
  },
];

export const TaskAssignmentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get("tab")?.toLowerCase() as
    | TaskAssignmentTab
    | undefined;

  const validTabs: TaskAssignmentTab[] = [
    "tasks",
    "status",
    "attachments",
    "priority",
  ];
  const initialTab: TaskAssignmentTab =
    queryTab && validTabs.includes(queryTab) ? queryTab : "tasks";

  const [activeTab, setActiveTab] = useState<TaskAssignmentTab>(initialTab);

  const handleSelectTab = (tabId: TaskAssignmentTab) => {
    setActiveTab(tabId);
    setSearchParams(tabId === "tasks" ? {} : { tab: tabId });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Top Module Card with Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Task Assignment
              </h1>
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
                    ? "border-[#FF7900] text-[#FF7900] font-bold bg-orange-50/50 rounded-t-lg"
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
        {activeTab === "tasks" && <TasksMaster />}
        {activeTab === "status" && <TaskStatusMaster isTab={true} />}
        {activeTab === "attachments" && <TaskAttachmentMaster isTab={true} />}
        {activeTab === "priority" && <PriorityMaster isTab={true} />}
      </div>
    </div>
  );
};

export default TaskAssignmentPage;
