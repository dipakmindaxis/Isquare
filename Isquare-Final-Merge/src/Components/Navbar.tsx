import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell,
  Folder,
  Key,
  LogOut,
  Menu,
  RefreshCw,
  User,
  Search,
  ChevronDown,
  Home,
  Users,
  ShieldCheck,
  UserCog,
  Flag,
  X,
  ArrowRight,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { toast } from "sonner";
import { usePermissions } from "../hooks/usePermissions";

import {
  type Notification,
  markAllAsRead,
  markOneNotificationRead,
  fetchNotifications,
} from "../features/Notifications/notificationSlice";
import { markAllNotificationsAsRead } from "../Modules/HRMS/Services/notificationService";
import { useNavigate, useLocation } from "react-router-dom";
import {
  startSignalRConnection,
  stopSignalRConnection,
} from "../Modules/HRMS/Services/signalRService";
import { rsmMenuConfig, type MenuItem } from "./Sidebar";
import ISquareLogo from "./Common/ISquareLogo";

interface NavbarProps {
  toggleSidebar: () => void;
}

interface SearchMenuItem {
  id: string;
  label: string;
  to: string;
  formName: string;
  category: string;
  icon: React.ReactNode;
}

const hrmsMenuItems: SearchMenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/hrms",
    formName: "Dashboard",
    category: "Operations",
    icon: <Home size={15} className="text-[#FF7900]" />,
  },
  {
    id: "employee",
    label: "Employee",
    to: "/hrms/employees",
    formName: "Employee",
    category: "Operations",
    icon: <Users size={15} className="text-[#FF7900]" />,
  },
  {
    id: "access-control",
    label: "Access Control",
    to: "/hrms/masters/access-control",
    formName: "AccessControl",
    category: "Master",
    icon: <ShieldCheck size={15} className="text-[#FF7900]" />,
  },
  {
    id: "basic-masters",
    label: "Basic Masters",
    to: "/hrms/masters",
    formName: "BasicMasters",
    category: "Master",
    icon: <UserCog size={15} className="text-[#FF7900]" />,
  },
  {
    id: "priority-master",
    label: "Priority Master",
    to: "/rsm/master/priority",
    formName: "PriorityMaster",
    category: "Master",
    icon: <Flag size={15} className="text-[#FF7900]" />,
  },
];

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word === "bde") return "BDE";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { hasPermission } = usePermissions();
  const { permissions } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();
  const isHRMS = location.pathname.startsWith("/hrms");
  const isCRM = location.pathname.startsWith("/rsm") || location.pathname.startsWith("/crm");

  const isAdmin = useMemo(() => {
    const roleNormalized = (user?.role || "").trim().toLowerCase();
    return (
      roleNormalized === "admin" ||
      roleNormalized === "administrator" ||
      roleNormalized === "superadmin" ||
      roleNormalized.includes("system admin")
    );
  }, [user?.role]);

  // Permission-based menu filtering: follows existing sidebar logic
  const isMenuAllowed = (formName: string): boolean => {
    if (isAdmin) return true;
    if (hasPermission(formName, "CanView")) return true;
    if (
      permissions &&
      permissions.some(
        (p: any) =>
          (p.formName || p.FormName)?.toLowerCase() === formName.toLowerCase() &&
          (p.canView || p.CanView) === true,
      )
    ) {
      return true;
    }
    return false;
  };

  // CRM searchable menus dynamically generated from rsmMenuConfig
  const crmMenuItems = useMemo(() => {
    const list: SearchMenuItem[] = [];

    const isItemAllowed = (item: MenuItem): boolean => {
      if (isAdmin) return true;
      if (!item.formName) return true;
      if (hasPermission(item.formName, "CanView")) return true;
      if (
        permissions &&
        permissions.some(
          (p) =>
            p.formName?.toLowerCase() === item.formName?.toLowerCase() &&
            p.canView === true
        )
      ) {
        return true;
      }
      return false;
    };

    rsmMenuConfig.forEach((item, parentIdx) => {
      if (item.subMenu && item.subMenu.length > 0) {
        const visibleSub = item.subMenu.filter(isItemAllowed);
        if (visibleSub.length > 0) {
          // Parent menu item (e.g. Quotation Management, Master)
          list.push({
            id: `crm-parent-${parentIdx}`,
            label: toTitleCase(item.label),
            to: visibleSub[0].to || "/rsm",
            formName: item.formName || "",
            category: "Operations",
            icon: React.cloneElement(item.icon as React.ReactElement<{ size?: number; className?: string }>, {
              size: 15,
              className: "text-[#FF7900]",
            }),
          });

          // Submenu items
          visibleSub.forEach((sub, subIdx) => {
            if (sub.to) {
              list.push({
                id: `crm-sub-${parentIdx}-${subIdx}`,
                label: toTitleCase(sub.label),
                to: sub.to,
                formName: sub.formName || "",
                category: toTitleCase(item.label),
                icon: React.cloneElement(sub.icon as React.ReactElement<{ size?: number; className?: string }>, {
                  size: 15,
                  className: "text-[#FF7900]",
                }),
              });
            }
          });
        }
      } else {
        if (isItemAllowed(item) && item.to) {
          list.push({
            id: `crm-item-${parentIdx}`,
            label: toTitleCase(item.label),
            to: item.to,
            formName: item.formName || "",
            category: "Operations",
            icon: React.cloneElement(item.icon as React.ReactElement<{ size?: number; className?: string }>, {
              size: 15,
              className: "text-[#FF7900]",
            }),
          });
        }
      }
    });

    return list;
  }, [user?.role, permissions, hasPermission]);

  const availableMenuItems = useMemo(() => {
    if (isCRM) return crmMenuItems;
    if (isHRMS) return hrmsMenuItems.filter((item) => isMenuAllowed(item.formName));
    return [];
  }, [isCRM, isHRMS, crmMenuItems, user?.role, permissions, hasPermission]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return availableMenuItems.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [searchQuery, availableMenuItems]);

  const handleSelectMenu = (item: SearchMenuItem) => {
    navigate(item.to);
    setSearchQuery("");
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults.length > 0) {
        const target =
          selectedIndex >= 0 && selectedIndex < filteredResults.length
            ? filteredResults[selectedIndex]
            : filteredResults[0];
        handleSelectMenu(target);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return text;
    const escaped = trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <span key={i} className="text-[#FF7900] font-bold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (user?.employeeId) {
      dispatch(fetchNotifications());
      startSignalRConnection(dispatch);
    }

    return () => {
      stopSignalRConnection();
    };
  }, [dispatch, user?.employeeId]);

  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    if (user?.employeeId) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user?.employeeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markOneNotificationRead(notification.id));
    }
    setIsNotificationOpen(false);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
    markAllNotificationsAsRead()
      .then(() => toast.success("All notifications marked as read"))
      .catch((err) => toast.error(err.message || "Failed to mark all as read"));
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "";
    }
  };

  const openChangePasswordModal = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!isLogoutModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLogoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoutModalOpen]);

  const handlePersonalDriveClick = () => {
    setIsDropdownOpen(false);
    navigate("/crm/drive");
  };

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("app-refresh"));
  };

  return (
    <>
      <header
        className={`${isHRMS
          ? "bg-white border-b border-[#E2E8F0] shadow-xs px-6 py-2 h-[64px]"
          : "bg-[#dbdcd6] border-b border-[#FF7900]/60 shadow-sm px-5 py-1 h-[60px]"
          } flex justify-between items-center sticky top-0 z-50 shrink-0`}
      >
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isHRMS
              ? "hover:bg-slate-100 text-[#17365D]"
              : "hover:bg-gray-100 text-gray-700 focus:outline-none"
              }`}
          >
            <Menu className={isHRMS ? "h-5 w-5" : "h-6 w-6"} />
          </button>

          {(isHRMS || isCRM) && (
            <div className="relative hidden md:block" ref={searchRef}>
              <div
                className={`relative flex items-center h-[42px] w-64 sm:w-72 md:w-80 lg:w-96 bg-white border rounded-full px-3.5 transition-all duration-200 shadow-2xs ${isSearchFocused || (isSearchOpen && searchQuery.trim().length > 0)
                  ? "border-[#FF7900] shadow-[0_0_0_3px_rgba(255,121,0,0.18)]"
                  : "border-[#E2E8F0] hover:border-slate-300"
                  }`}
              >
                <Search
                  className="text-[#64748B] w-4 h-4 shrink-0 mr-2.5 pointer-events-none transition-colors"
                  size={16}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                    setSelectedIndex(0);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.trim().length > 0) {
                      setIsSearchOpen(true);
                    }
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search here..."
                  className="w-full bg-transparent text-xs text-[#17365D] placeholder-[#94A3B8] font-normal outline-none border-none py-1.5"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      searchInputRef.current?.focus();
                    }}
                    className="ml-1 text-[#64748B] hover:text-[#17365D] cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dynamic Search Suggestions Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] lg:min-w-[384px] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                  {filteredResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3.5 py-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
                        <span>Matching Menus</span>
                        <span className="text-[9px] font-medium text-[#94A3B8]">
                          {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
                        {filteredResults.map((item, index) => {
                          const isSelected = index === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectMenu(item)}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${isSelected
                                ? "bg-[#FFF1E6] text-[#FF7900]"
                                : "hover:bg-slate-50 text-[#17365D]"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                                    ? "bg-white text-[#FF7900] shadow-2xs"
                                    : "bg-[#FFF1E6]/80 text-[#FF7900]"
                                    }`}
                                >
                                  {item.icon}
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-semibold leading-tight">
                                    {highlightMatch(item.label, searchQuery)}
                                  </p>
                                  <p className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">
                                    {item.category}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight
                                size={14}
                                className={`shrink-0 ml-2 transition-transform ${isSelected
                                  ? "text-[#FF7900] translate-x-0.5"
                                  : "text-[#94A3B8]"
                                  }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-[#94A3B8]">
                        <Search size={18} />
                      </div>
                      <p className="text-xs font-semibold text-[#17365D]">
                        {isCRM ? "No results found" : "No matching menu found"}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">
                        {isCRM
                          ? `No CRM menu items match "${searchQuery}"`
                          : `No authorized menus match "${searchQuery}"`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          <button
            onClick={handleRefresh}
            className={`p-2 transition-colors cursor-pointer ${isHRMS
              ? "text-slate-600 hover:text-[#FF7900] hover:bg-slate-100 rounded-full"
              : "text-gray-500 hover:text-blue-600"
              }`}
            title="Refresh"
          >
            <RefreshCw size={isHRMS ? 18 : 20} />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`p-2 transition-colors relative cursor-pointer ${isHRMS
                ? "text-slate-600 hover:text-[#17365D] hover:bg-slate-100 rounded-full"
                : "text-red-500 hover:bg-red-50 rounded-full"
                }`}
            >
              <Bell size={isHRMS ? 20 : 22} fill={isHRMS ? "none" : "currentColor"} />
              {unreadCount > 0 && (
                <span
                  className="
                    absolute 
                    -top-0.5 
                    -right-0.5
                    min-w-[16px]
                    h-[16px]
                    px-1
                    flex
                    items-center
                    justify-center
                    text-[9px]
                    font-bold
                    text-white
                    bg-red-500
                    rounded-full
                    border-2
                    border-white
                  "
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-3 flex justify-between items-center border-b">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ul className="py-1 text-sm text-gray-700 max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="px-4 py-3 flex items-start space-x-3">
                          <div className="shrink-0 pt-1">
                            {!notif.isRead && (
                              <span className="block w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                            )}
                          </div>

                          <div className="flex-1">
                            <p
                              className={`text-gray-800 ${!notif.isRead ? "font-semibold" : "font-normal"}`}
                            >
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-5 text-center text-gray-500">
                      No new notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={
                isHRMS
                  ? "flex items-center gap-2 px-3.5 py-1.5 border border-[#E2E8F0] rounded-full text-[#17365D] font-bold text-xs hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  : "flex items-center gap-2 px-4 py-1.5 border border-blue-500 rounded-full text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-sm"
              }
            >
              <User size={15} className={isHRMS ? "text-[#FF7900]" : "text-blue-700"} />
              <span>{user?.role || "Admin"}</span>
              {isHRMS && <ChevronDown size={14} className="text-slate-400" />}
            </button>

            {/* Redesigned Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-blue-600 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors">
                    <User size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "User Profile"}
                    </span>
                  </div>

                  <div
                    onClick={openChangePasswordModal}
                    className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <Key size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Change Password</span>
                  </div>

                  <div
                    onClick={handlePersonalDriveClick}
                    className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <Folder size={18} className="text-yellow-500" />
                    <span className="text-sm font-medium">My Drive</span>
                  </div>

                  <hr className="my-1 border-gray-100" />

                  <div
                    onClick={handleLogoutClick}
                    className="px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="w-full max-w-[460px] sm:max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Dark Navy with iSquare Logo & Close Button */}
            <div className="relative bg-[#07182E] pt-5 px-6 pb-12 overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <ISquareLogo size="sm" theme="white" className="max-w-[160px]" />
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Orange Wave Curve at Bottom of Header */}
              <div className="absolute -bottom-0.5 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
                <svg
                  viewBox="0 0 500 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-12 block"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 32 C 140 58, 210 40, 250 36 C 300 32, 380 18, 500 6 L 500 70 L 0 70 Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M0 32 C 140 58, 210 40, 250 36 C 300 32, 380 18, 500 6"
                    stroke="#FF7900"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Floating Overlapping Circular Logout Badge */}
            <div className="-mt-11 relative z-20 flex justify-center">
              <div className="w-22 h-22 rounded-full bg-[#FFEFE7] border-4 border-white shadow-md flex items-center justify-center">
                <LogOut size={34} className="text-[#E03131] translate-x-0.5" strokeWidth={2.4} />
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 pt-2 pb-7 text-center">
              {/* Title with flanking orange lines */}
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="w-9 h-[2.5px] bg-[#FF7900] rounded-full"></span>
                <h3 className="text-2xl font-bold text-[#0B1A30] tracking-tight">
                  Confirm Logout
                </h3>
                <span className="w-9 h-[2.5px] bg-[#FF7900] rounded-full"></span>
              </div>

              {/* Message */}
              <p className="text-sm font-medium text-[#475569] mt-3 mb-7 max-w-xs mx-auto leading-relaxed">
                Are you sure you want to log out of your account?
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-40 sm:w-44 py-2.5 px-6 rounded-2xl border-2 border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A] text-sm sm:text-base font-bold transition-all cursor-pointer shadow-xs hover:shadow text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="w-40 sm:w-44 py-2.5 px-6 rounded-2xl bg-[#FF7900] hover:bg-[#E86D00] text-white text-sm sm:text-base font-bold transition-all cursor-pointer shadow-[0_6px_20px_rgba(255,121,0,0.35)] hover:shadow-[0_8px_25px_rgba(255,121,0,0.45)] flex items-center justify-center gap-2"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  <span>Yes, Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;