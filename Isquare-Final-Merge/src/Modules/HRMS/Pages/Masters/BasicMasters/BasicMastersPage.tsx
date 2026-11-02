// src/Features/BasicMasters/BasicMastersPage.tsx
import React, { useState } from "react";
import { Building, Briefcase, UserCog, Receipt } from "lucide-react";
import Department from "../Department/Departments";
import Designation from "../Designation/Designation";
import Role from "../Role/Role";
import PaymentTerm from "../../../../RSM/Pages/Master/PaymentTerm/PaymentTerm";

type ActiveTab = "departments" | "designations" | "roles" | "paymentTerms";

const BasicMastersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("departments");

  const renderContent = () => {
    switch (activeTab) {
      case "departments":
        return <Department />;
      case "designations":
        return <Designation />;
      case "roles":
        return <Role />;
      case "paymentTerms":
        return <PaymentTerm isTab={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#e4e8e1] p-4 md:p-6">
      {/* Page Heading matching Employee Listing */}
      <div className="mb-6">
        <h2 className="border-b-2 border-[#153E63] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#172B4D] inline-block">
          Basic Masters
        </h2>
        <p className="text-slate-600 mt-2 text-sm font-medium">
          Manage core organizational data like departments, designations, roles, and payment terms.
        </p>
      </div>

      {/* Main Tab Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        {/* Clean Tab Navigation with active indicator */}
        <div className="border-b border-slate-200 bg-white px-4 pt-2">
          <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Tabs">
            <TabButton
              icon={<Building size={16} />}
              label="Departments"
              isActive={activeTab === "departments"}
              onClick={() => setActiveTab("departments")}
            />
            <TabButton
              icon={<Briefcase size={16} />}
              label="Designations"
              isActive={activeTab === "designations"}
              onClick={() => setActiveTab("designations")}
            />
            <TabButton
              icon={<UserCog size={16} />}
              label="Roles"
              isActive={activeTab === "roles"}
              onClick={() => setActiveTab("roles")}
            />
            <TabButton
              icon={<Receipt size={16} />}
              label="Payment Terms"
              isActive={activeTab === "paymentTerms"}
              onClick={() => setActiveTab("paymentTerms")}
            />
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 md:p-6 bg-slate-50/60 min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer rounded-t-xl ${
      isActive
        ? "border-[#FF7900] text-[#FF7900] bg-orange-50/60 shadow-2xs"
        : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`}
  >
    <span className={isActive ? "text-[#FF7900]" : "text-slate-400"}>{icon}</span>
    <span>{label}</span>
  </button>
);

export default BasicMastersPage;
