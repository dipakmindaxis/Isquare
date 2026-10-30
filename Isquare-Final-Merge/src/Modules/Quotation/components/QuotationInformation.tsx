import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Plus, User, Building2, Phone, Mail, Loader2, ChevronDown, Check, X } from "lucide-react";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import {
  getContactsByCompanyId,
  getAllContacts,
} from "../../RSM/Pages/Master/Contact/Services/ContactService";
import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import AddQuotationContactModal from "./AddQuotationContactModal";

export interface EnquiryOption {
  enquiryId?: number;
  enquiryNumber: string;
  customerId?: number | null;
  companyName: string;
  productName: string;
  displayLabel: string;
}

interface QuotationInformationProps {
  quotationNumber?: string | null;
  customerId: number;
  contactId?: number | null;
  enquiryId?: number | null;
  enquiryRef?: string | null;
  quotationDate?: string | null;
  revisionNumber: number;
  status?: string | null;
  customers: Customer[];
  onChange: (fields: {
    customerId?: number;
    contactId?: number | null;
    contactPerson?: string | null;
    enquiryId?: number | null;
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
  enquiryId = null,
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

  // Enquiry Reference Searchable Dropdown state
  const [enquirySearch, setEnquirySearch] = useState<string>(enquiryRef || "");
  const [isEnquiryDropdownOpen, setIsEnquiryDropdownOpen] = useState<boolean>(false);
  const [enquiriesList, setEnquiriesList] = useState<EnquiryOption[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState<boolean>(false);
  const enquiryDropdownRef = useRef<HTMLDivElement>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (enquiryRef) {
      setEnquirySearch(enquiryRef);
    }
  }, [enquiryRef]);

  // When enquiriesList loads, resolve full label for initial enquiryId or enquiryRef
  useEffect(() => {
    if (enquiriesList.length > 0) {
      if (enquiryId) {
        const found = enquiriesList.find((e) => Number(e.enquiryId) === Number(enquiryId));
        if (found) {
          setEnquirySearch(found.displayLabel);
          return;
        }
      }
      if (enquiryRef) {
        const found = enquiriesList.find(
          (e) =>
            e.enquiryNumber === enquiryRef ||
            e.displayLabel === enquiryRef ||
            (e.enquiryId && `ENQ-${e.enquiryId}` === enquiryRef)
        );
        if (found) {
          setEnquirySearch(found.displayLabel);
        }
      }
    }
  }, [enquiriesList, enquiryId, enquiryRef]);

  // Fetch real Enquiries from database via API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEnquiries(true);

    const fetchDatabaseEnquiries = async () => {
      try {
        const endpoint =
          API_ENDPOINTS.Enquiry ||
          API_ENDPOINTS.Enquiries ||
          `${API_ENDPOINTS.BaseUrl}/Enquiry`;
        const response = await apiClient.get<any>(endpoint);
        const data = response.data;
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.Data)
          ? data.Data
          : Array.isArray(data?.result)
          ? data.result
          : [];

        if (!isMounted) return;

        const options: EnquiryOption[] = list.map((eq: any) => {
          const eqId = eq.enquiryId ? Number(eq.enquiryId) : undefined;
          const eqNo =
            eq.enquiryNumber ||
            eq.enquiryNo ||
            (eqId ? `ENQ-${String(eqId).padStart(3, "0")}` : "");

          let compName = eq.customerName || eq.companyName || "";
          if (!compName && eq.customerId) {
            const foundCust = customers.find(
              (c) => Number(c.customerId || c.companyId) === Number(eq.customerId)
            );
            if (foundCust) {
              compName = foundCust.companyName || foundCust.customerName || "";
            }
          }
          if (!compName) {
            compName = eq.contactName ? `Client: ${eq.contactName}` : "Client";
          }

          const product =
            eq.requirementSubject ||
            eq.customerRequirement ||
            eq.productCategoryName ||
            eq.technicalSpecificationNotes ||
            "Industrial Requirement";

          const label = `${eqNo || (eqId ? `ENQ-${eqId}` : "ENQ")} - ${compName} - ${product}`;

          return {
            enquiryId: eqId,
            enquiryNumber: eqNo,
            customerId: eq.customerId ? Number(eq.customerId) : null,
            companyName: compName,
            productName: product,
            displayLabel: label,
          };
        });

        setEnquiriesList(options);
      } catch (err) {
        console.error("Failed to fetch enquiries from database:", err);
        if (isMounted) setEnquiriesList([]);
      } finally {
        if (isMounted) setIsLoadingEnquiries(false);
      }
    };

    fetchDatabaseEnquiries();

    return () => {
      isMounted = false;
    };
  }, [customers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        enquiryDropdownRef.current &&
        !enquiryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEnquiryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredEnquiries = useMemo(() => {
    if (!enquirySearch || !enquirySearch.trim()) return enquiriesList;
    const q = enquirySearch.toLowerCase().trim();
    return enquiriesList.filter((item) => {
      const matchLabel = item.displayLabel?.toLowerCase().includes(q);
      const matchNum = item.enquiryNumber?.toLowerCase().includes(q);
      const matchId = item.enquiryId ? String(item.enquiryId).includes(q) : false;
      const matchComp = item.companyName?.toLowerCase().includes(q);
      const matchProd = item.productName?.toLowerCase().includes(q);
      return matchLabel || matchNum || matchId || matchComp || matchProd;
    });
  }, [enquiriesList, enquirySearch]);

  const handleSelectEnquiry = (item: EnquiryOption) => {
    setEnquirySearch(item.displayLabel);
    setIsEnquiryDropdownOpen(false);

    const eqId = item.enquiryId ? Number(item.enquiryId) : null;
    const eqNum =
      item.enquiryNumber ||
      (eqId ? `ENQ-${String(eqId).padStart(3, "0")}` : item.displayLabel);

    let matchedCustId: number | null = null;
    if (item.customerId && item.customerId > 0) {
      matchedCustId = item.customerId;
    } else if (item.companyName) {
      const matchedCustomer = customers.find((c) => {
        const cName = (c.companyName || c.customerName || "").toLowerCase();
        return (
          cName.includes(item.companyName.toLowerCase()) ||
          item.companyName.toLowerCase().includes(cName)
        );
      });
      if (matchedCustomer) {
        matchedCustId = Number(matchedCustomer.customerId || matchedCustomer.companyId);
      }
    }

    if (matchedCustId && (!customerId || customerId === 0)) {
      handleCompanyChange(matchedCustId);
      onChangeRef.current({
        enquiryId: eqId,
        enquiryRef: eqNum,
        customerId: matchedCustId,
      });
    } else {
      onChangeRef.current({
        enquiryId: eqId,
        enquiryRef: eqNum,
      });
    }
  };

  const selectedCustomer = customers.find(
    (c) => Number(c.customerId || c.companyId) === Number(customerId)
  );

  // Fetch contacts whenever customerId (company) changes
  const fetchContactsForCompany = useCallback(
    async (compCompanyId: number, preferredContactId?: number | null) => {
      if (!compCompanyId || compCompanyId <= 0) {
        setContacts([]);
        setSelectedContactId(null);
        onChangeRef.current({ contactId: null, contactPerson: null });
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

        const validList = Array.isArray(list) ? list : [];
        setContacts(validList);

        // Determine which contact to select
        if (
          preferredContactId &&
          validList.some((c) => Number(c.contactId) === Number(preferredContactId))
        ) {
          setSelectedContactId(preferredContactId);
          const matched = validList.find(
            (c) => Number(c.contactId) === Number(preferredContactId)
          );
          onChangeRef.current({
            contactId: preferredContactId,
            contactPerson: matched?.fullName || null,
          });
        } else if (validList.length > 0) {
          const first = validList[0];
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
        onChangeRef.current({ contactId: null, contactPerson: null });
      } finally {
        setIsLoadingContacts(false);
      }
    },
    []
  );

  const isFirstMountRef = useRef<boolean>(true);
  const prevCustomerIdRef = useRef<number>(customerId);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      fetchContactsForCompany(customerId, contactId);
      return;
    }

    if (prevCustomerIdRef.current !== customerId) {
      prevCustomerIdRef.current = customerId;
      fetchContactsForCompany(customerId, null);
    }
  }, [customerId, contactId, fetchContactsForCompany]);

  // Keep local state in sync if contactId prop changes externally
  useEffect(() => {
    if (contactId !== undefined && contactId !== selectedContactId) {
      setSelectedContactId(contactId);
    }
  }, [contactId, selectedContactId]);

  // Listen for contacts updated/created in Master or other views
  useEffect(() => {
    const handleContactsMasterUpdated = () => {
      if (customerId && customerId > 0) {
        fetchContactsForCompany(customerId, selectedContactId);
      }
    };

    window.addEventListener("contacts-updated", handleContactsMasterUpdated);
    window.addEventListener("contact-created", handleContactsMasterUpdated);

    return () => {
      window.removeEventListener("contacts-updated", handleContactsMasterUpdated);
      window.removeEventListener("contact-created", handleContactsMasterUpdated);
    };
  }, [customerId, selectedContactId, fetchContactsForCompany]);

  const handleCompanyChange = (newCompanyId: number) => {
    prevCustomerIdRef.current = newCompanyId;
    setSelectedContactId(null);
    onChangeRef.current({
      customerId: newCompanyId,
      contactId: null,
      contactPerson: null,
    });
    fetchContactsForCompany(newCompanyId, null);
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

  const handleContactCreated = async (createdPayload: any) => {
    const created: Contact =
      createdPayload?.data ||
      createdPayload?.Data ||
      createdPayload?.result ||
      createdPayload?.Result ||
      createdPayload ||
      {};

    const newCompanyId = Number(created.companyId || customerId);
    const newContactId = Number(created.contactId);
    const newFullName = created.fullName || "";

    if (!newContactId) {
      console.warn("Contact was created without a valid contactId:", createdPayload);
      return;
    }

    const fullContactObj: Contact = {
      ...created,
      contactId: newContactId,
      companyId: newCompanyId,
      fullName: newFullName,
    };

    // 1. If contact created for a different company, switch company selection
    if (newCompanyId && newCompanyId !== Number(customerId)) {
      prevCustomerIdRef.current = newCompanyId;
      onChangeRef.current({ customerId: newCompanyId });
    }

    // 2. Immediately update local state so the new contact is visible and selected instantly
    setContacts((prev) => {
      const filtered = prev.filter((c) => Number(c.companyId) === newCompanyId);
      const exists = filtered.some((c) => Number(c.contactId) === newContactId);
      if (exists) {
        return filtered.map((c) =>
          Number(c.contactId) === newContactId ? { ...c, ...fullContactObj } : c
        );
      }
      return [fullContactObj, ...filtered];
    });

    setSelectedContactId(newContactId);
    onChangeRef.current({
      customerId: newCompanyId,
      contactId: newContactId,
      contactPerson: newFullName,
    });

    // 3. Refresh customers master if requested
    try {
      if (onRefreshCustomers) {
        await onRefreshCustomers();
      }
    } catch {
      // ignore
    }

    // 4. In background, refresh contacts from database to verify consistency
    try {
      let freshList: Contact[] = [];
      try {
        freshList = await getContactsByCompanyId(newCompanyId);
      } catch {
        // fallback
      }

      if (!freshList || freshList.length === 0) {
        const all = await getAllContacts();
        freshList = all.filter(
          (c: Contact) => Number(c.companyId) === Number(newCompanyId)
        );
      }

      if (freshList && freshList.length > 0) {
        const hasNew = freshList.some(
          (c) => Number(c.contactId) === newContactId
        );
        setContacts(hasNew ? freshList : [fullContactObj, ...freshList]);
      }
    } catch (e) {
      console.warn("Failed to refresh contacts from backend after creation:", e);
    }

    // 5. Dispatch update events so ContactPersonMaster displays the new record alongside existing records
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("contact-created", { detail: fullContactObj }));
        window.dispatchEvent(new Event("contacts-updated"));
        localStorage.setItem("contacts_updated_at", Date.now().toString());
      } catch {
        // ignore
      }
    }
  };

  const selectedContact = contacts.find(
    (c) => Number(c.contactId) === Number(selectedContactId)
  );

  // Format date string for HTML date input: YYYY-MM-DD
  const formattedDate = quotationDate
    ? quotationDate.substring(0, 10)
    : new Date().toISOString().substring(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quotation Number */}
        <div>
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Quotation Number
          </label>
          <input
            type="text"
            readOnly
            value={quotationNumber || "Auto-generated upon save"}
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-xs font-mono font-semibold text-gray-700 cursor-not-allowed select-none"
          />
        </div>

        {/* 1. Company Name Dropdown */}
        <div>
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-pointer"
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block">
              Contact Person <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7900] hover:text-[#e06800] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                disabled={disabled || !customerId || (isLoadingContacts && contacts.length === 0)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
              >
                {!customerId ? (
                  <option value="">Select Company first...</option>
                ) : contacts.length === 0 && isLoadingContacts ? (
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
                  <Loader2 size={16} className="animate-spin text-[#FF7900]" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              disabled={disabled}
              className="p-2.5 bg-[#00234a] hover:bg-[#FF7900] text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              title="Add New Customer / Contact Person"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Enquiry Reference - Searchable Dropdown */}
        <div ref={enquiryDropdownRef} className="relative">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Enquiry Reference
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search or select enquiry (e.g. ENQ-2026-739)..."
              value={enquirySearch}
              onChange={(e) => {
                const val = e.target.value;
                setEnquirySearch(val);
                const matched = enquiriesList.find(
                  (item) =>
                    item.displayLabel.toLowerCase() === val.toLowerCase() ||
                    item.enquiryNumber?.toLowerCase() === val.toLowerCase()
                );
                onChangeRef.current({
                  enquiryId: matched?.enquiryId ? Number(matched.enquiryId) : null,
                  enquiryRef: matched ? matched.enquiryNumber : val,
                });
                setIsEnquiryDropdownOpen(true);
              }}
              onFocus={() => setIsEnquiryDropdownOpen(true)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white pl-3.5 pr-14 py-2.5 text-xs font-mono text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-text"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {enquirySearch && !disabled && (
                <button
                  type="button"
                  onClick={() => {
                    setEnquirySearch("");
                    onChangeRef.current({ enquiryId: null, enquiryRef: "" });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
                  title="Clear enquiry reference"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEnquiryDropdownOpen((prev) => !prev)}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-gray-800 rounded transition cursor-pointer"
                title="Toggle enquiry options"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isEnquiryDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Searchable Dropdown Menu */}
          {isEnquiryDropdownOpen && !disabled && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
              <div className="p-2.5 bg-orange-50/60 border-b border-orange-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                <span>Select Existing Enquiry ({filteredEnquiries.length})</span>
                <span className="text-[9px] font-normal text-gray-400">Enquiry No · Company · Product</span>
              </div>
              {isLoadingEnquiries ? (
                <div className="p-5 text-center flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Loader2 size={16} className="animate-spin text-[#FF7900]" />
                  <span>Loading enquiries from database...</span>
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {enquirySearch
                      ? `No matching enquiries found for "${enquirySearch}"`
                      : "No enquiries found in database"}
                  </p>
                  {enquirySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        onChangeRef.current({ enquiryRef: enquirySearch });
                        setIsEnquiryDropdownOpen(false);
                      }}
                      className="mt-2 text-xs font-semibold text-[#FF7900] hover:text-[#e06800] underline cursor-pointer"
                    >
                      Use "{enquirySearch}" as custom reference
                    </button>
                  )}
                </div>
              ) : (
                filteredEnquiries.map((eq) => {
                  const isSelected =
                    enquiryRef === eq.displayLabel ||
                    enquiryRef === eq.enquiryNumber;
                  return (
                    <button
                      key={eq.enquiryNumber}
                      type="button"
                      onClick={() => handleSelectEnquiry(eq)}
                      className={`w-full text-left px-3.5 py-2.5 transition flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 text-[#00234a] font-semibold"
                          : "hover:bg-slate-50 text-gray-800"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-bold text-[#00234a] truncate">
                          {eq.displayLabel}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                          <span className="font-semibold text-gray-700">{eq.companyName}</span>
                          <span>•</span>
                          <span className="text-gray-600 truncate">{eq.productName}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-[#FF7900] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Quotation Date */}
        <div>
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20"
          />
        </div>

        {/* Revision Number */}
        <div>
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Revision
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-orange-50 text-[#FF7900] rounded-lg border border-[#FF7900]/20 text-xs font-bold font-mono">
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
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Status
          </label>
          <select
            value={status || "Draft"}
            onChange={(e) => onChangeRef.current({ status: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-pointer"
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

      {/* Selected Customer & Contact Details Preview Banner matching Customer Master */}
      {(selectedCustomer || selectedContact) && (
        <div className="p-3.5 bg-orange-50/30 border border-orange-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-y-1">
            <span className="font-bold text-slate-800 mr-2 flex items-center gap-1">
              <User size={13} className="text-[#FF7900]" />
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
