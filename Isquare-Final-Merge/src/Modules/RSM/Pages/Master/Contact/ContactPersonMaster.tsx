import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllContacts,
  deleteContact,
  toggleContactStatus,
} from "./Services/ContactService";
import { getAllCustomers, type Customer } from "../../Customer/Services/CustomerService";
import type { Contact } from "./Types/ContactTypes";
import AddEditContactModal from "./Components/AddEditContactModal";
import ViewContactModal from "./Components/ViewContactModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import LogoLoader from "../../../../../Components/Common/LogoLoader";
import { exportToExcel } from "../../../../../Utils/exportToExcel";

interface ContactPersonMasterProps {
  isTab?: boolean;
}

export const ContactPersonMaster: React.FC<ContactPersonMasterProps> = ({
  isTab = false,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Search, Status Filter & Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Map companyId -> companyName for fast, accurate lookup
  const companyMap = useMemo(() => {
    const map = new Map<number, string>();
    companies.forEach((c) => {
      const id = Number(c.customerId || c.companyId);
      if (id > 0) {
        map.set(id, c.companyName || c.customerName || `Company #${id}`);
      }
    });
    return map;
  }, [companies]);

  const getCompanyName = useCallback(
    (contact: Contact): string => {
      if (contact.companyId && companyMap.has(Number(contact.companyId))) {
        return companyMap.get(Number(contact.companyId))!;
      }
      return (
        contact.companyName ||
        (contact.companyId ? `Company #${contact.companyId}` : "—")
      );
    },
    [companyMap]
  );

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [contactsData, companiesData] = await Promise.all([
        getAllContacts(),
        getAllCustomers().catch(() => []),
      ]);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      if (Array.isArray(companiesData) && companiesData.length > 0) {
        setCompanies(companiesData);
      }
    } catch {
      toast.error("Failed to fetch contact persons.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const handleUpdate = () => {
      fetchItems();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "contacts_updated_at") {
        fetchItems();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchItems();
      }
    };

    window.addEventListener("contacts-updated", handleUpdate);
    window.addEventListener("contact-created", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("contacts-updated", handleUpdate);
      window.removeEventListener("contact-created", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchItems]);

  const filteredItems = useMemo((): Contact[] => {
    return contacts.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const companyName = getCompanyName(item).toLowerCase();
      const fullName = (item.fullName || "").toLowerCase();
      const department = (item.department || "").toLowerCase();
      const designation = (item.designation || "").toLowerCase();
      const mobile = (item.mobileNo || "").toLowerCase();
      const altMobile = (item.altMobileNo || "").toLowerCase();
      const email = (item.emailAddress || "").toLowerCase();
      const altEmail = (item.altEmailAddress || "").toLowerCase();

      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        companyName.includes(q) ||
        department.includes(q) ||
        designation.includes(q) ||
        mobile.includes(q) ||
        altMobile.includes(q) ||
        email.includes(q) ||
        altEmail.includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.isActive) ||
        (statusFilter === "Inactive" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter, getCompanyName]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo((): Contact[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = contacts.length;
    const active = contacts.filter((i) => i.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [contacts]);

  const handleAddClick = (): void => {
    setSelectedContact(null);
    setIsAddEditModalOpen(true);
  };

  const handleViewClick = (item: Contact): void => {
    setSelectedContact(item);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (item: Contact): void => {
    setSelectedContact(item);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteRequest = (item: Contact): void => {
    setSelectedContact(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedContact) return;
    try {
      await deleteContact(selectedContact.contactId);
      toast.success(
        `Contact "${selectedContact.fullName || "person"}" deleted successfully.`
      );
      await fetchItems();
    } catch {
      toast.error("Failed to delete contact person.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedContact(null);
    }
  };

  const handleStatusToggle = async (item: Contact): Promise<void> => {
    try {
      const updatedStatus = !item.isActive;
      await toggleContactStatus(item.contactId, updatedStatus, item);
      toast.success(
        `Contact "${item.fullName}" marked as ${
          updatedStatus ? "Active" : "Inactive"
        }.`
      );
      fetchItems();
    } catch {
      toast.error("Failed to update contact status.");
    }
  };

  const handleExportExcel = (): void => {
    if (filteredItems.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const exportData = filteredItems.map((item, index) => ({
      "Sr. No.": index + 1,
      "Company Name": getCompanyName(item),
      "Full Name": item.fullName || "—",
      Department: item.department || "—",
      Designation: item.designation || "—",
      "Mobile Number": item.mobileNo || "—",
      "Alt Mobile": item.altMobileNo || "—",
      "Email Address": item.emailAddress || "—",
      "Alt Email": item.altEmailAddress || "—",
      Status: item.isActive ? "Active" : "Inactive",
    }));

    exportToExcel(
      exportData,
      `ContactPersons_${new Date().toISOString().slice(0, 10)}`,
      "Contact Persons"
    );
  };

  return (
    <div
      className={
        isTab ? "w-full space-y-4" : "p-4 md:p-6 bg-gray-50 min-h-full space-y-5"
      }
    >
      {/* Top Header Card */}
      <div className="bg-white rounded-none shadow-xs border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 rounded-none flex items-center justify-center shrink-0 text-[#FF7900]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Contact Person
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage organization contact persons, representatives, and communications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchItems}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-none text-sm font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh records"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-300 rounded-none text-sm font-medium transition cursor-pointer shadow-xs"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-[#FF7900] hover:bg-[#E66D00] text-white font-medium px-5 py-2.5 rounded-none transition shadow-sm cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add Contact Person</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-none border border-gray-100">
            <div className="w-9 h-9 rounded-none bg-blue-100 text-[#00234a] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Contact Persons
              </p>
              <p className="text-base font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-none border border-gray-100">
            <div className="w-9 h-9 rounded-none bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active</p>
              <p className="text-base font-bold text-green-700">{stats.active}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-none border border-gray-100">
            <div className="w-9 h-9 rounded-none bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Inactive</p>
              <p className="text-base font-bold text-red-600">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-none shadow-xs border border-gray-200 p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, department, mobile, email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF7900] focus:border-[#FF7900] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Status:
          </span>
          <div className="flex bg-gray-100 p-1 rounded-none">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-[#FF7900] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table matching Industry Master design */}
      <div className="bg-white rounded-none shadow-xs overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead className="bg-[#FF7900] text-white text-xs uppercase tracking-wider border-b border-[#e06800]">
              <tr>
                <th className="px-3.5 py-3.5 text-left font-bold w-14 border-r border-[#e06800]">
                  Sr. No.
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Company Name
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Full Name
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Department
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Designation
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Mobile Number
                </th>
                <th className="px-4 py-3.5 text-left font-bold border-r border-[#e06800]">
                  Email Address
                </th>
                <th className="px-4 py-3.5 text-center font-bold w-24 border-r border-[#e06800]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-center font-bold w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <LogoLoader />
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="text-sm font-medium">
                        No contact persons found.
                      </p>
                      {searchQuery && (
                        <p className="text-xs text-gray-400">
                          Try adjusting your search query or status filter
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr
                    key={item.contactId}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="px-3.5 py-3 text-gray-700 font-medium border-r border-gray-200">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200">
                      {getCompanyName(item)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#00234a] border-r border-gray-200">
                      {item.fullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
                      {item.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
                      {item.designation || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-mono text-xs border-r border-gray-200">
                      {item.mobileNo ? (
                        <a
                          href={`tel:${item.mobileNo}`}
                          className="hover:text-[#FF7900] transition"
                        >
                          {item.mobileNo}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-xs border-r border-gray-200 truncate max-w-[200px]">
                      {item.emailAddress ? (
                        <a
                          href={`mailto:${item.emailAddress}`}
                          className="hover:text-[#FF7900] transition"
                          title={item.emailAddress}
                        >
                          {item.emailAddress}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      <div className="flex justify-center w-full">
                        <label
                          className="relative inline-flex items-center cursor-pointer"
                          onClick={() => handleStatusToggle(item)}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item.isActive)}
                            readOnly
                            className="sr-only"
                          />
                          <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${
                              item.isActive ? "bg-[#FF8500]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm"
                              style={{
                                left: item.isActive
                                  ? "calc(100% - 1.25rem - 0.125rem)"
                                  : "0.125rem",
                              }}
                            />
                          </div>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-2 w-full">
                        <button
                          onClick={() => handleViewClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit Contact"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(item)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete Contact"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-6 text-xs text-gray-600 select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-none bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF7900]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div>
            {filteredItems.length === 0
              ? "0-0 of 0"
              : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  filteredItems.length
                )} of ${filteredItems.length}`}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-none"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-none"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, Math.max(totalPages, 1)))
              }
              disabled={currentPage >= totalPages || totalPages === 0}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-none"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(totalPages, 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition rounded-none"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      <AddEditContactModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedContact(null);
        }}
        onSuccess={() => {
          fetchItems();
        }}
        contact={selectedContact}
        companies={companies}
      />

      {/* View Contact Modal */}
      <ViewContactModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        companyName={selectedContact ? getCompanyName(selectedContact) : undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Contact Person"
        message={`Are you sure you want to delete "${
          selectedContact?.fullName || "this contact"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ContactPersonMaster;
