import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, User, Building2, Phone, Mail, Loader2 } from "lucide-react";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import {
  getContactsByCompanyId,
  getAllContacts,
} from "../../RSM/Pages/Master/Contact/Services/ContactService";
import AddQuotationContactModal from "./AddQuotationContactModal";

interface QuotationInformationProps {
  quotationNumber?: string | null;
  customerId: number;
  contactId?: number | null;
  enquiryRef?: string | null;
  quotationDate?: string | null;
  revisionNumber: number;
  status?: string | null;
  customers: Customer[];
  onChange: (fields: {
    customerId?: number;
    contactId?: number | null;
    contactPerson?: string | null;
    enquiryRef?: string;
    quotationDate?: string;
    status?: string;
    revisionNumber?: number;
  }) => void;
  onRefreshCustomers?: () => Promise<void>;
  disabled?: boolean;
}

export const QuotationInformation: React.FC<QuotationInformationProps> = ({
  quotationNumber,
  customerId,
  contactId = null,
  enquiryRef = "",
  quotationDate,
  revisionNumber = 0,
  status = "Draft",
  customers,
  onChange,
  onRefreshCustomers,
  disabled = false,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState<boolean>(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(contactId);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const selectedCustomer = customers.find(
    (c) => Number(c.customerId || c.companyId) === Number(customerId)
  );

  // Fetch contacts whenever customerId (company) changes
  const fetchContactsForCompany = useCallback(
    async (compCompanyId: number, preferredContactId?: number | null) => {
      if (!compCompanyId || compCompanyId <= 0) {
        setContacts([]);
        setSelectedContactId(null);
        return;
      }

      setIsLoadingContacts(true);
      try {
        let list: Contact[] = [];
        try {
          list = await getContactsByCompanyId(compCompanyId);
        } catch {
          // fallback to getAllContacts filtered by companyId
        }

        if (!list || list.length === 0) {
          const all = await getAllContacts();
          list = all.filter(
            (c: Contact) => Number(c.companyId) === Number(compCompanyId)
          );
        }

        setContacts(list || []);

        // Determine which contact to select
        if (
          preferredContactId &&
          list.some((c) => Number(c.contactId) === Number(preferredContactId))
        ) {
          setSelectedContactId(preferredContactId);
          const matched = list.find(
            (c) => Number(c.contactId) === Number(preferredContactId)
          );
          onChangeRef.current({
            contactId: preferredContactId,
            contactPerson: matched?.fullName || null,
          });
        } else if (list && list.length > 0) {
          const first = list[0];
          setSelectedContactId(first.contactId);
          onChangeRef.current({
            contactId: first.contactId,
            contactPerson: first.fullName,
          });
        } else {
          setSelectedContactId(null);
          onChangeRef.current({ contactId: null, contactPerson: null });
        }
      } catch (err) {
        console.warn("Failed to load contacts for company:", err);
        setContacts([]);
        setSelectedContactId(null);
      } finally {
        setIsLoadingContacts(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchContactsForCompany(customerId, contactId);
  }, [customerId, fetchContactsForCompany]);

  // Keep local state in sync if contactId prop changes externally
  useEffect(() => {
    if (contactId !== undefined) {
      setSelectedContactId(contactId);
    }
  }, [contactId]);

  const handleCompanyChange = (newCompanyId: number) => {
    setSelectedContactId(null);
    onChangeRef.current({
      customerId: newCompanyId,
      contactId: null,
      contactPerson: null,
    });
  };

  const handleContactChange = (newContactId: number) => {
    setSelectedContactId(newContactId);
    const matched = contacts.find(
      (c) => Number(c.contactId) === Number(newContactId)
    );
    onChangeRef.current({
      contactId: newContactId || null,
      contactPerson: matched?.fullName || null,
    });
  };

  const handleContactCreated = async (created: Contact) => {
    // If contact created for a different company, switch company
    if (Number(created.companyId) !== Number(customerId)) {
      onChangeRef.current({ customerId: created.companyId });
    }

    try {
      if (onRefreshCustomers) {
        await onRefreshCustomers();
      }
    } catch {
      // ignore
    }

    // Refresh contacts and auto-select newly created contact
    await fetchContactsForCompany(created.companyId, created.contactId);
    setSelectedContactId(created.contactId);
    onChangeRef.current({
      customerId: created.companyId,
      contactId: created.contactId,
      contactPerson: created.fullName,
    });
  };

  const selectedContact = contacts.find(
    (c) => Number(c.contactId) === Number(selectedContactId)
  );

  // Format date string for HTML date input: YYYY-MM-DD
  const formattedDate = quotationDate
    ? quotationDate.substring(0, 10)
    : new Date().toISOString().substring(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quotation Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Quotation Number
          </label>
          <input
            type="text"
            readOnly
            value={quotationNumber || "Auto-generated upon save"}
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-3 text-sm font-mono font-semibold text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* 1. Company Name Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={customerId || ""}
              onChange={(e) =>
                handleCompanyChange(parseInt(e.target.value, 10) || 0)
              }
              disabled={disabled}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15 cursor-pointer"
            >
              <option value="" disabled>
                Select Company...
              </option>
              {customers.map((c) => {
                const cId = Number(c.customerId || c.companyId || 0);
                const cName =
                  c.companyName || c.customerName || `Company #${cId}`;
                return (
                  <option key={cId} value={cId}>
                    {cName} {c.customerCode ? `(${c.customerCode})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 2 & 3. Customer Name / Contact Person Dependent Dropdown with Add Contact Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Contact Person <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Add New Customer / Contact Person"
            >
              <Plus size={13} />
              <span>Add New Contact</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedContactId || ""}
                onChange={(e) =>
                  handleContactChange(parseInt(e.target.value, 10) || 0)
                }
                disabled={disabled || !customerId || isLoadingContacts}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
              >
                {!customerId ? (
                  <option value="">Select Company first...</option>
                ) : isLoadingContacts ? (
                  <option value="">Loading contacts...</option>
                ) : contacts.length === 0 ? (
                  <option value="">No contacts found — click + Add</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select Contact Person...
                    </option>
                    {contacts.map((c) => (
                      <option key={c.contactId} value={c.contactId}>
                        {c.fullName}{" "}
                        {c.designation ? `(${c.designation})` : ""}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {isLoadingContacts && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Loader2 size={16} className="animate-spin text-[#00234a]" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              disabled={disabled}
              className="p-3 bg-[#00234a] hover:bg-[#001833] text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              title="Add New Customer / Contact Person"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Enquiry Reference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Enquiry Reference
          </label>
          <input
            type="text"
            placeholder="e.g. ENQ-2026-884"
            value={enquiryRef || ""}
            onChange={(e) => onChangeRef.current({ enquiryRef: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-mono text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quotation Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Quotation Date
          </label>
          <input
            type="date"
            value={formattedDate}
            onChange={(e) =>
              onChangeRef.current({
                quotationDate: new Date(e.target.value).toISOString(),
              })
            }
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
          />
        </div>

        {/* Revision Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Revision
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-bold font-mono">
              R{revisionNumber}
            </span>
            <span className="text-xs text-gray-500">
              {revisionNumber === 0
                ? "Initial Proposal"
                : `Revision #${revisionNumber}`}
            </span>
          </div>
        </div>

        {/* Quotation Status */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status || "Draft"}
            onChange={(e) => onChangeRef.current({ status: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 transition focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15 cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Revised">Revised</option>
          </select>
        </div>
      </div>

      {/* Selected Customer & Contact Details Preview Banner */}
      {(selectedCustomer || selectedContact) && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-y-1">
            <span className="font-bold text-slate-800 mr-2 flex items-center gap-1">
              <User size={13} className="text-[#00234a]" />
              <span>Contact Person:</span>
            </span>
            <span className="font-semibold text-gray-900">
              {selectedContact?.fullName ||
                (selectedCustomer as any)?.contactPerson ||
                "N/A"}
            </span>

            {(selectedContact?.designation || selectedContact?.department) && (
              <span className="ml-2 text-slate-600">
                ({selectedContact.designation || ""}
                {selectedContact.designation && selectedContact.department
                  ? " - "
                  : ""}
                {selectedContact.department || ""})
              </span>
            )}

            {(selectedContact?.emailAddress ||
              (selectedCustomer as any)?.email) && (
              <span className="ml-3 text-slate-500 flex items-center gap-1">
                <Mail size={12} className="text-gray-400" />
                <span>
                  {selectedContact?.emailAddress ||
                    (selectedCustomer as any)?.email}
                </span>
              </span>
            )}

            {(selectedContact?.mobileNo ||
              (selectedCustomer as any)?.phone) && (
              <span className="ml-3 text-slate-500 flex items-center gap-1">
                <Phone size={12} className="text-gray-400" />
                <span>
                  {selectedContact?.mobileNo ||
                    (selectedCustomer as any)?.phone}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedCustomer && (
              <div className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 size={13} className="text-gray-400" />
                <span>
                  {selectedCustomer.companyName ||
                    selectedCustomer.customerName}
                </span>
              </div>
            )}
            {selectedCustomer?.gstin && (
              <span>
                <span className="font-bold text-slate-700">GSTIN:</span>{" "}
                {selectedCustomer.gstin}
              </span>
            )}
            {((selectedCustomer as any)?.city ||
              (selectedCustomer as any)?.cityName) && (
              <span>
                <span className="font-bold text-slate-700">Location:</span>{" "}
                {(selectedCustomer as any).city ||
                  (selectedCustomer as any).cityName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add New Contact Person Modal - Dark Theme matching Screenshot 3 */}
      <AddQuotationContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSuccess={handleContactCreated}
        companies={customers}
        selectedCompanyId={customerId}
      />
    </div>
  );
};

export default QuotationInformation;
