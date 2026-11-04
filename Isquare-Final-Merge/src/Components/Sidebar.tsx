import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  Settings,
  Database,
  ChevronDown,
  UserCog,
  ShieldCheck,
  LayoutDashboard,
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
  CheckSquare,
  FileText,
  Plus,
  RotateCcw,
  Sliders,
  Building2,
  Package,
  GitBranch,
  Flag,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import ISquareLogo, { ISquareIcon } from "./Common/ISquareLogo";
import { usePermissions } from "../hooks/usePermissions";

interface SidebarProps {
  isOpen: boolean;
}

export interface MenuItem {
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
    to: "/employees",
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
      to: "/masters/access-control",
      formName: "AccessControl",
    },
    {
      icon: <UserCog />,
      label: "Basic Masters",
      to: "/masters",
      formName: "BasicMasters",
    },
    {
      icon: <Flag />,
      label: "Priority Master",
      to: "/rsm/master/priority",
      formName: "PriorityMaster",
    },
  ],
};

export const rsmMenuConfig: MenuItem[] = [
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
    icon: <FileText />, 
    label: "ENQUIRIES",
    to: "/rsm/enquiries",
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
    icon: <Layers />,
    label: "ALL SALES ACTIVITIES",
    to: "/rsm/sales-activities",
  },
  {
    icon: <CheckSquare />,
    label: "TASK ASSIGNMENT",
    to: "/rsm/task-assignment",
  },

  {
    label: "MASTER",
    icon: <Database />,
    subMenu: [
      {
        icon: <Users />,
        label: "Enquiry master",
        to: "/rsm/master/enquiry-master",
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
        icon: <ShieldCheck />,
        label: "ROLE MASTER",
        to: "/rsm/role",
      },
      {
        icon: <GitBranch />,
        label: "HIERARCHY MANAGEMENT",
        to: "/rsm/hierarchy-management",
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
        icon: <Users />,
        label: "CONTACT PERSON",
        to: "/rsm/master/contact-person",
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
        icon: <Flag />,
        label: "PRIORITY MASTER",
        to: "/rsm/master/priority",
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
      <p className="text-[11px] font-bold text-[#FF7900] px-4 mb-2 uppercase tracking-wider">
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
          title={item.label}
          className={`flex items-center gap-3 px-3.5 ${verticalPadding} mx-2 rounded-xl transition-all duration-200 group ${
            isActive
              ? "bg-white text-[#FF7900] shadow-sm font-semibold"
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
              className={`sidebar-menu-item leading-snug truncate ${
                isActive
                  ? "text-[#FF7900] font-semibold"
                  : "text-gray-200 group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
          )}
        </NavLink>
      ) : (
        <button
          onClick={toggleHandler}
          title={item.label}
          className={`w-full flex items-center justify-between gap-3 px-3.5 ${verticalPadding} pr-4 mx-2 rounded-xl transition-all duration-200 group text-gray-200 hover:bg-white/10 hover:text-white cursor-pointer`}
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
              <span className="sidebar-menu-item leading-snug truncate text-gray-200 group-hover:text-white">
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
  const isHRMS = location.pathname.startsWith("/hrms");
  const { hasPermission } = usePermissions();

  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const handleToggle = (label: string) => {
    setOpenMenuLabel((prev) => (prev === label ? null : label));
  };

  // Flexible / Resizable Sidebar configuration
  const DEFAULT_WIDTH = 290;
  const MIN_WIDTH = 230;
  const MAX_WIDTH = 480;

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("isquare_sidebar_width");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed;
      }
    }
    return DEFAULT_WIDTH;
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem("isquare_sidebar_width", sidebarWidth.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, sidebarWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDoubleClickReset = () => {
    const targetWidth = sidebarWidth === DEFAULT_WIDTH ? 340 : DEFAULT_WIDTH;
    setSidebarWidth(targetWidth);
    localStorage.setItem("isquare_sidebar_width", targetWidth.toString());
  };

  const getVisibleMenu = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .map((item) => {
        if (item.to === "/rsm/master/follow-up") return null;
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
      className={`relative h-screen bg-[#414141] border-r border-[#383838] flex flex-col shadow-xl shrink-0 ${
        isDragging ? "transition-none select-none" : "transition-all duration-300"
      }`}
      style={{
        width: isOpen ? `${sidebarWidth}px` : "80px",
        minWidth: isOpen ? `${sidebarWidth}px` : "80px",
        maxWidth: isOpen ? `${sidebarWidth}px` : "80px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Draggable Flexible Resize Handle on the right edge */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClickReset}
          title="Drag left/right to resize sidebar (Double click to toggle wide/compact)"
          className="absolute top-0 -right-1.5 w-3 h-full cursor-col-resize group z-30 flex items-center justify-center transition-colors hover:bg-[#FF7900]/20"
        >
          <div
            className={`w-1 rounded-full transition-all duration-150 ${
              isDragging
                ? "bg-[#FF7900] h-full shadow-md"
                : "bg-transparent group-hover:bg-[#FF7900] group-hover:h-24 h-12"
            }`}
          />
        </div>
      )}

      {/* Logo Section */}
      <div
        className={`flex items-center ${
          isOpen ? "pl-6 pr-3 justify-start" : "justify-center"
        } border-b border-[#FF7900]/60 h-[64px] bg-[#414141] shrink-0 transition-all duration-300 overflow-hidden`}
      >
        {isOpen ? (
          <div className="flex flex-col justify-center">
            <ISquareLogo
              size="md"
              theme="white"
              className="justify-start max-w-[220px]"
            />
            {isHRMS && (
              <p className="text-[10px] text-[#FF7900] font-medium tracking-wide pl-12 -mt-1.5">
                -- HRMS &amp; Payroll
              </p>
            )}
          </div>
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

      {/* Subtle Orange Wave Decoration for HRMS matching reference screenshot */}
      {isHRMS && isOpen && (
        <div className="relative w-full h-28 pointer-events-none overflow-hidden shrink-0 mt-auto select-none opacity-85">
          <svg
            viewBox="0 0 260 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <path
              d="M-20 60 C 50 100, 150 10, 280 50 L 280 100 L -20 100 Z"
              fill="url(#orange-wave-fill)"
              opacity="0.25"
            />
            <path
              d="M-20 45 C 70 10, 170 90, 280 25"
              stroke="url(#orange-wave-stroke)"
              strokeWidth="2.2"
            />
            <path
              d="M-20 60 C 80 25, 180 105, 280 40"
              stroke="url(#orange-wave-stroke)"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <path
              d="M-20 75 C 90 40, 190 120, 280 55"
              stroke="url(#orange-wave-stroke)"
              strokeWidth="1"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="orange-wave-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7900" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFA726" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="orange-wave-stroke" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FF7900" />
                <stop offset="50%" stopColor="#FFA726" />
                <stop offset="100%" stopColor="#FFB74D" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

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
