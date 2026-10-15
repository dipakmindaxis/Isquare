import React, { useState } from "react";
import {
  Home,
  Users,
  Settings,
  Database,
  ChevronDown,
  UserCog,
  ShieldCheck,
  LayoutDashboard,
  BriefcaseBusiness,
  Receipt,
  Factory,
  UserCheck,
  Share2,
  MapPin,
  PhoneCall,
  Clock,
  Paperclip,
  Layers,
  Contact,
  Users2,
  CheckCircle2,
  FileText,
  Plus,
  RotateCcw,
  Sliders,
  Building2,
  Package,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import ISquareLogo, { ISquareIcon } from "./Common/ISquareLogo";
import { usePermissions } from "../hooks/usePermissions";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  label: string;
  to?: string;
  icon: React.ReactElement;
  formName?: string;
  color?: string;
  isHeader?: boolean;
  subMenu?: MenuItem[];
}

interface SidebarItemProps {
  item: MenuItem;
  isOpen: boolean;
  level?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const mainMenuLinks = [
  { icon: <Home />, label: "Dashboard", to: "/", formName: "Dashboard" },
  {
    icon: <Users />,
    label: "EMPLOYEE",
    to: "/master/employee",
    formName: "Employee",
  },
];

const masterMenu: MenuItem = {
  icon: <Database />,
  label: "Master",
  subMenu: [
    {
      icon: <ShieldCheck />,
      label: "Access Control",
      to: "/access-control",
      formName: "AccessControl",
    },
    {
      icon: <UserCog />,
      label: "Basic Masters",
      to: "/basimasters",
      formName: "BasicMasters",
    },
  ],
};

const rsmMenuConfig: MenuItem[] = [
  {
    icon: <LayoutDashboard />,
    label: "DASHBOARD",
    to: "/rsm",
    formName: "Dashboard",
  },

  {
    icon: <Users />,
    label: "CUSTOMERS",
    to: "/rsm/customers",
  },

  {
    label: "QUOTATION MANAGEMENT",
    icon: <FileText />,
    subMenu: [
      {
        icon: <FileText />,
        label: "ALL QUOTATIONS",
        to: "/rsm/quotations",
      },
      {
        icon: <Plus />,
        label: "CREATE QUOTATION",
        to: "/rsm/quotations/create",
      },
      {
        icon: <RotateCcw />,
        label: "QUOTATION REVISIONS",
        to: "/rsm/quotations/revisions",
      },
      {
        icon: <CheckCircle2 />,
        label: "QUOTATION APPROVALS",
        to: "/rsm/quotations/approvals",
      },
      {
        icon: <Receipt />,
        label: "QUOTATION CHARGES",
        to: "/rsm/quotations/charges",
      },
    ],
  },

  {
    label: "SALES",
    icon: <BriefcaseBusiness />,
    subMenu: [
      {
        icon: <Users />,
        label: "CUSTOMERS",
        to: "/rsm/customers",
      },
      {
        icon: <Layers />,
        label: "ALL SALES ACTIVITIES",
        to: "/rsm/sales-activities",
      },
    ],
  },

  {
    label: "MASTER",
    icon: <Database />,
    subMenu: [
      {
        icon: <Users />,
        label: "CUSTOMERS",
        to: "/rsm/customers",
      },
      {
        icon: <Sliders />,
        label: "QUOTATION DEFAULTS",
        to: "/rsm/quotation-defaults",
      },
      {
        icon: <Building2 />,
        label: "COMPANY PROFILE",
        to: "/rsm/company-profile",
      },
      {
        icon: <Package />,
        label: "PRODUCT MASTER",
        to: "/rsm/products",
      },
      {
        icon: <Users />,
        label: "CUSTOMER CLASSIFICATION",
        to: "/rsm/master/customer-classification",
      },
      {
        icon: <UserCheck />,
        label: "SALES TEAM MASTER",
        to: "/rsm/master/sales-team",
      },
      {
        icon: <Clock />,
        label: "FOLLOW-UP & UPDATES",
        to: "/rsm/master/follow-up-contact-updates",
      },
      {
        icon: <Paperclip />,
        label: "DOCUMENT & ADDRESS",
        to: "/rsm/master/document-address-settings",
      },
      {
        icon: <Receipt />,
        label: "PAYMENT TERMS",
        to: "/rsm/payment-term",
      },
      {
        icon: <Factory />,
        label: "INDUSTRY",
        to: "/rsm/industry",
      },
      {
        icon: <UserCheck />,
        label: "CUSTOMER STATUS",
        to: "/rsm/customer-status",
      },
      {
        icon: <Share2 />,
        label: "CUSTOMER SOURCE",
        to: "/rsm/customer-source",
      },
      {
        icon: <MapPin />,
        label: "CUSTOMER AREA",
        to: "/rsm/customer-area",
      },
      {
        icon: <Home />,
        label: "ADDRESS TYPE",
        to: "/rsm/address-type",
      },
      {
        icon: <MapPin />,
        label: "LOCATION MASTERS",
        to: "/rsm/master/country",
      },
      {
        icon: <UserCheck />,
        label: "BDE USERS",
        to: "/rsm/bde-users",
      },
      {
        icon: <UserCog />,
        label: "SALES MANAGERS",
        to: "/rsm/sales-user-manager",
      },
      {
        icon: <Contact />,
        label: "CONTACT TYPES",
        to: "/rsm/contact-types",
      },
      {
        icon: <Paperclip />,
        label: "SALES ATTACHMENTS",
        to: "/rsm/master/sales-attachments",
      },
      {
        icon: <Clock />,
        label: "FOLLOW-UP",
        to: "/rsm/master/follow-up",
      },
      {
        icon: <Paperclip />,
        label: "DOCUMENT TYPE",
        to: "/rsm/master/document-type",
      },
      {
        icon: <PhoneCall />,
        label: "CALL TYPE",
        to: "/rsm/master/call-type",
      },
      {
        icon: <Users2 />,
        label: "MEETING TYPE",
        to: "/rsm/master/meeting-type",
      },
      {
        icon: <CheckCircle2 />,
        label: "ACTIVITY TYPE",
        to: "/rsm/master/activity-type",
      },
    ],
  },
];

const vmsMenuConfig: MenuItem[] = [
  {
    icon: <LayoutDashboard />,
    label: "DASHBOARD",
    to: "/vms",
    formName: "Dashboard",
    isHeader: true,
  },
];

const SidebarSection = ({
  title,
  children,
  isOpen,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}) => (
  <div className="mt-3">
    {isOpen && (
      <p className="text-xs font-semibold text-[#FF7900] px-4 mb-2 uppercase tracking-wider">
        {title}
      </p>
    )}
    <ul className="space-y-1">{children}</ul>
  </div>
);

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isOpen,
  level = 0,
  isExpanded,
  onToggle,
}) => {
  const location = useLocation();
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isActive = item.to
    ? item.to === "/" || item.to === "/rsm" || item.to === "/hrms" || item.to === "/vms"
      ? location.pathname === item.to
      : location.pathname === item.to || location.pathname.startsWith(item.to + "/")
    : false;
  const hasSub = !!item.subMenu && item.subMenu.length > 0;

  const showChildren = level === 0 ? isExpanded : internalExpanded;
  const toggleHandler =
    level === 0 ? onToggle : () => setInternalExpanded(!internalExpanded);

  const verticalPadding = level === 0 ? "py-2" : "py-1";

  return (
    <div className="w-full">
      {item.to ? (
        <NavLink
          to={item.to}
          className={`flex items-center gap-3 px-3.5 ${verticalPadding} mx-2 rounded-xl transition-all duration-200 group ${
            isActive
              ? "bg-white text-[#FF7900] shadow-sm"
              : "text-gray-200 hover:bg-white/10 hover:text-white"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span
            className="flex items-center justify-center shrink-0 w-8 h-8 text-[#FF7900] transition-transform duration-200 group-hover:scale-105"
          >
            {React.cloneElement(
              item.icon as React.ReactElement<{ size: number }>,
              { size: 20 },
            )}
          </span>
          {isOpen && (
            <span
              className={`sidebar-menu-item leading-none truncate ${
                isActive ? "text-[#FF7900]" : "text-gray-200 group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
          )}
        </NavLink>
      ) : (
        <button
          onClick={toggleHandler}
          className={`w-full flex items-center justify-between gap-3 px-3.5 ${verticalPadding} pr-4 mx-2 rounded-xl transition-all duration-200 group text-gray-200 hover:bg-white/10 hover:text-white`}
          style={{ paddingLeft: `${level * 16 + 12}px`, width: "calc(100% - 16px)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center shrink-0 w-8 h-8 text-[#FF7900] transition-transform duration-200 group-hover:scale-105">
              {React.cloneElement(
                item.icon as React.ReactElement<{ size: number }>,
                { size: 20 },
              )}
            </span>
            {isOpen && (
              <span className="sidebar-menu-item leading-none truncate text-gray-200 group-hover:text-white">
                {item.label}
              </span>
            )}
          </div>
          {isOpen && hasSub && (
            <ChevronDown
              size={18}
              className={`text-[#FF7900] shrink-0 transition-transform duration-200 ${
                showChildren ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      )}

      {showChildren && isOpen && hasSub && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {item.subMenu?.map((sub) => (
            <SidebarItem
              key={sub.label}
              item={sub}
              isOpen={isOpen}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const handleToggle = (label: string) => {
    setOpenMenuLabel((prev) => (prev === label ? null : label));
  };

  const getVisibleMenu = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .map((item) => {
        if (item.subMenu && item.subMenu.length > 0) {
          const filteredSubMenu = getVisibleMenu(item.subMenu);

          if (filteredSubMenu.length > 0) {
            return { ...item, subMenu: filteredSubMenu };
          }
          return null;
        }

        if (item.formName) {
          return hasPermission(item.formName, "CanView") ? item : null;
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  const isHRMS = location.pathname.startsWith("/hrms");
  const isRSM = location.pathname.startsWith("/rsm");
  const isVMS = location.pathname.startsWith("/vms");

  const visibleMainMenu = mainMenuLinks.filter(
    (l) => !l.formName || hasPermission(l.formName, "CanView"),
  );
  
  const visibleMasterSub =
    masterMenu.subMenu?.filter(
      (l) => !l.formName || hasPermission(l.formName, "CanView"),
    ) || [];

 const visibleVmsMenu = getVisibleMenu(vmsMenuConfig);

  return (
    <div
      className={`${isOpen ? "w-64" : "w-20"} h-screen bg-[#424242] flex flex-col transition-all duration-300 shadow-xl border-r border-[#383838]`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Logo Section */}
      <div
        className={`flex items-center ${isOpen ? "pl-6 pr-3 justify-start" : "justify-center"} border-b border-[#FF7900]/60 h-[60px] shrink-0 bg-[#424242] transition-all duration-300`}
      >
        {isOpen ? (
          <ISquareLogo
            size="md"
            theme="white"
            className="justify-start max-w-[200px]"
          />
        ) : (
          <ISquareIcon size={40} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {/* --- HRMS MENU --- */}
        {isHRMS && (
          <>
            <SidebarSection title="Operations" isOpen={isOpen}>
              {visibleMainMenu.map((link) => (
                <SidebarItem
                  key={link.label}
                  item={{
                    ...link,
                    to: `/hrms${link.to === "/" ? "" : link.to}`,
                  }}
                  isOpen={isOpen}
                  isExpanded={openMenuLabel === masterMenu.label}
                  onToggle={() => handleToggle(masterMenu.label)}
                />
              ))}

              {visibleMasterSub.length > 0 && (
                <SidebarItem
                  item={{
                    ...masterMenu,
                    subMenu: visibleMasterSub.map((sub) => ({
                      ...sub,
                      to: `/hrms${sub.to}`,
                    })),
                  }}
                  isOpen={isOpen}
                  isExpanded={openMenuLabel === masterMenu.label}
                  onToggle={() => handleToggle(masterMenu.label)}
                />
              )}
            </SidebarSection>
          </>
        )}

        {/* --- RSM MENU --- */}
        {isRSM && (
          <SidebarSection title="Operations" isOpen={isOpen}>
            {getVisibleMenu(rsmMenuConfig).map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isOpen={isOpen}
                isExpanded={openMenuLabel === item.label}
                onToggle={() => handleToggle(item.label)}
              />
            ))}
          </SidebarSection>
        )}

        {/* --- VMS MENU --- */}
        {isVMS && (
          <SidebarSection title="Operations" isOpen={isOpen}>
            {visibleVmsMenu.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isOpen={isOpen}
                isExpanded={openMenuLabel === item.label}
                onToggle={() => handleToggle(item.label)}
              />
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Footer Switcher & Settings */}
      <div className="p-1 border-t border-[#525252] mt-auto">
        <SidebarItem
          item={{ icon: <Home />, label: "Switch Module", to: "/" }}
          isOpen={isOpen}
        />
        <SidebarItem
          item={{ icon: <Settings />, label: "Settings", to: "/settings" }}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default Sidebar;
