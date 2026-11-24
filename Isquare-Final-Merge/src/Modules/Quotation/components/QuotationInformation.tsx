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
    contactPhone?: string | null;
    contactEmail?: string | null;
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

  // Helper lookups for selected customer & contact
  const selectedCustomer = customers.find(
    (c) => Number(c.customerId || c.companyId) === Number(customerId)
  );

  const selectedCustomerName = selectedCustomer
    ? `${selectedCustomer.companyName || selectedCustomer.customerName || `Company #${customerId}`}${
        selectedCustomer.customerCode ? ` (${selectedCustomer.customerCode})` : ""
      }`
    : "";

  const selectedContact = contacts.find(
    (c) => Number(c.contactId) === Number(selectedContactId)
  );

  const selectedContactName = selectedContact
    ? `${selectedContact.fullName}${selectedContact.designation ? ` (${selectedContact.designation})` : ""}`
    : "";

  // 1. Company Name Searchable Combobox state
  const [companySearchTerm, setCompanySearchTerm] = useState<string>("");
  const [companyInput, setCompanyInput] = useState<string>(selectedCustomerName);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState<boolean>(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  // 2. Contact Person Searchable Combobox state
  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");
  const [contactInput, setContactInput] = useState<string>(selectedContactName);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState<boolean>(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // 3. Status Searchable Combobox state
  const [statusSearchTerm, setStatusSearchTerm] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>(status || "Draft");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // 4. Enquiry Reference Searchable Combobox state
  const [enquirySearch, setEnquirySearch] = useState<string>(enquiryRef || "");
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState<string>("");
  const [isEnquiryDropdownOpen, setIsEnquiryDropdownOpen] = useState<boolean>(false);
  const [enquiriesList, setEnquiriesList] = useState<EnquiryOption[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState<boolean>(false);
  const enquiryDropdownRef = useRef<HTMLDivElement>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Synchronize inputs when external props or selections change
  useEffect(() => {
    setCompanyInput(selectedCustomerName);
  }, [selectedCustomerName]);

  useEffect(() => {
    setContactInput(selectedContactName);
  }, [selectedContactName]);

  useEffect(() => {
    setStatusInput(status || "Draft");
  }, [status]);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(target)
      ) {
        setIsCompanyDropdownOpen(false);
        setCompanySearchTerm("");
        setCompanyInput(selectedCustomerName);
      }
      if (
        contactDropdownRef.current &&
        !contactDropdownRef.current.contains(target)
      ) {
        setIsContactDropdownOpen(false);
        setContactSearchTerm("");
        setContactInput(selectedContactName);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(target)
      ) {
        setIsStatusDropdownOpen(false);
        setStatusSearchTerm("");
        setStatusInput(status || "Draft");
      }
      if (
        enquiryDropdownRef.current &&
        !enquiryDropdownRef.current.contains(target)
      ) {
        setIsEnquiryDropdownOpen(false);
        setDropdownSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCustomerName, selectedContactName, status]);

  const filteredCustomers = useMemo(() => {
    const term = companySearchTerm.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) => {
      const name = (c.companyName || c.customerName || "").toLowerCase();
      const code = (c.customerCode || "").toLowerCase();
      const email = (c.emailAddress || c.email || "").toLowerCase();
      const phone = (c.mobile || c.phone || (c as any).mobileNo || (c as any).phoneNo || "").toLowerCase();
      const city = ((c as any).city || (c as any).cityName || "").toLowerCase();
      return (
        name.includes(term) ||
        code.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        city.includes(term)
      );
    });
  }, [customers, companySearchTerm]);

  const STATUS_OPTIONS = useMemo(
    () => ["Draft", "Sent", "Approved", "Won", "Lost", "Revised"],
    []
  );

  const filteredStatuses = useMemo(() => {
    const term = statusSearchTerm.trim().toLowerCase();
    if (!term) return STATUS_OPTIONS;
    return STATUS_OPTIONS.filter((s) => s.toLowerCase().includes(term));
  }, [STATUS_OPTIONS, statusSearchTerm]);

  const filteredContacts = useMemo(() => {
    const term = contactSearchTerm.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) => {
      const name = (c.fullName || "").toLowerCase();
      const desig = (c.designation || "").toLowerCase();
      const dept = (c.department || "").toLowerCase();
      const email = (c.emailAddress || c.altEmailAddress || "").toLowerCase();
      const phone = (c.mobileNo || c.altMobileNo || "").toLowerCase();
      return (
        name.includes(term) ||
        desig.includes(term) ||
        dept.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
    });
  }, [contacts, contactSearchTerm]);

  const filteredEnquiries = useMemo(() => {
    const term = dropdownSearchTerm.trim().toLowerCase();
    if (!term) return enquiriesList;
    return enquiriesList.filter((item) => {
      const matchLabel = item.displayLabel?.toLowerCase().includes(term);
      const matchNum = item.enquiryNumber?.toLowerCase().includes(term);
      const matchId = item.enquiryId ? String(item.enquiryId).includes(term) : false;
      const matchComp = item.companyName?.toLowerCase().includes(term);
      const matchProd = item.productName?.toLowerCase().includes(term);
      return matchLabel || matchNum || matchId || matchComp || matchProd;
    });
  }, [enquiriesList, dropdownSearchTerm]);

  const handleSelectEnquiry = (item: EnquiryOption) => {
    setEnquirySearch(item.displayLabel);
    setDropdownSearchTerm("");
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

  // Track sequence ID to discard outdated responses if the user switches customers rapidly
  const fetchSequenceRef = useRef<number>(0);

  // Fetch contacts whenever customerId (company) changes
  const fetchContactsForCompany = useCallback(
    async (compCompanyId: number, preferredContactId?: number | null) => {
      const currentSeq = ++fetchSequenceRef.current;

      if (!compCompanyId || compCompanyId <= 0) {
        setContacts([]);
        setSelectedContactId(null);
        onChangeRef.current({ contactId: null, contactPerson: null });
        return;
      }

      setIsLoadingContacts(true);
      try {
        const currentCust = customers.find(
          (c) =>
            Number(c.customerId) === Number(compCompanyId) ||
            Number(c.companyId) === Number(compCompanyId)
        );

        const validCompanyIds = new Set<number>();
        if (compCompanyId > 0) validCompanyIds.add(Number(compCompanyId));
        if (currentCust?.companyId && Number(currentCust.companyId) > 0) {
          validCompanyIds.add(Number(currentCust.companyId));
        }
        if (currentCust?.customerId && Number(currentCust.customerId) > 0) {
          validCompanyIds.add(Number(currentCust.customerId));
        }

        const targetCompanyName = (
          currentCust?.companyName ||
          currentCust?.customerName ||
          ""
        ).trim().toLowerCase();

        // 1. Fetch contacts via getContactsByCompanyId
        let list: Contact[] = [];
        try {
          const fetchId = currentCust?.companyId || compCompanyId;
          list = await getContactsByCompanyId(fetchId);
        } catch {
          // fallback
        }

        // 2. Fallback to getAllContacts if list is empty
        if (!list || list.length === 0) {
          const all = await getAllContacts();
          list = all;
        }

        // Discard stale responses if user switched customers
        if (currentSeq !== fetchSequenceRef.current) {
          return;
        }

        // 3. Strictly filter so only contacts associated with the selected customer/company are kept
        const filteredList = list.filter((c: Contact) => {
          if (!c) return false;
          const cCompId = Number(c.companyId || (c as any).customerId || 0);
          if (cCompId > 0 && validCompanyIds.has(cCompId)) {
            return true;
          }
          if (targetCompanyName && c.companyName) {
            const contactComp = c.companyName.trim().toLowerCase();
            if (contactComp === targetCompanyName) {
              return true;
            }
          }
          return false;
        });

        // Deduplicate contacts by contactId
        const uniqueContacts: Contact[] = [];
        const seenIds = new Set<number>();
        for (const item of filteredList) {
          const cid = Number(item.contactId);
          if (cid && !seenIds.has(cid)) {
            seenIds.add(cid);
            uniqueContacts.push(item);
          }
        }

        setContacts(uniqueContacts);

        // 4. Determine contact selection:
        // In Edit mode, if preferredContactId is valid and belongs to this customer, select it.
        if (
          preferredContactId &&
          uniqueContacts.some((c) => Number(c.contactId) === Number(preferredContactId))
        ) {
          setSelectedContactId(preferredContactId);
          const matched = uniqueContacts.find(
            (c) => Number(c.contactId) === Number(preferredContactId)
          );
          onChangeRef.current({
            contactId: preferredContactId,
            contactPerson: matched?.fullName || null,
            contactPhone: matched?.mobileNo || matched?.altMobileNo || null,
            contactEmail: matched?.emailAddress || matched?.altEmailAddress || null,
          });
        } else {
          // When customer changes, or if no preferred contact person, clear selection
          setSelectedContactId(null);
          onChangeRef.current({
            contactId: null,
            contactPerson: null,
            contactPhone: null,
            contactEmail: null,
          });
        }
      } catch (err) {
        if (currentSeq !== fetchSequenceRef.current) return;
        console.warn("Failed to load contacts for company:", err);
        setContacts([]);
        setSelectedContactId(null);
        onChangeRef.current({
          contactId: null,
          contactPerson: null,
          contactPhone: null,
          contactEmail: null,
        });
      } finally {
        if (currentSeq === fetchSequenceRef.current) {
          setIsLoadingContacts(false);
        }
      }
    },
    [customers]
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
      setSelectedContactId(null);
      setContacts([]);
      fetchContactsForCompany(customerId, null);
    }
  }, [customerId, contactId, fetchContactsForCompany]);

  // Keep local state in sync if contactId prop changes externally (e.g. edit mode async load)
  useEffect(() => {
    if (contactId !== undefined && contactId !== null && contactId !== selectedContactId) {
      setSelectedContactId(contactId);
      if (contacts.length > 0) {
        const found = contacts.find((c) => Number(c.contactId) === Number(contactId));
        if (found) {
          onChangeRef.current({
            contactId,
            contactPerson: found.fullName,
            contactPhone: found.mobileNo || found.altMobileNo || null,
            contactEmail: found.emailAddress || found.altEmailAddress || null,
          });
        }
      }
    }
  }, [contactId, selectedContactId, contacts]);

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
    setContacts([]);
    setContactInput("");
    setContactSearchTerm("");
    onChangeRef.current({
      customerId: newCompanyId,
      contactId: null,
      contactPerson: null,
      contactPhone: null,
      contactEmail: null,
    });
    fetchContactsForCompany(newCompanyId, null);
  };

  const handleContactChange = (newContactId: number) => {
    setSelectedContactId(newContactId);
    const matched = contacts.find(
      (c) => Number(c.contactId) === Number(newContactId)
    );
    const dispName = matched
      ? `${matched.fullName}${matched.designation ? ` (${matched.designation})` : ""}`
      : "";
    setContactInput(dispName);
    setContactSearchTerm("");
    onChangeRef.current({
      contactId: newContactId || null,
      contactPerson: matched?.fullName || null,
      contactPhone: matched?.mobileNo || matched?.altMobileNo || null,
      contactEmail: matched?.emailAddress || matched?.altEmailAddress || null,
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
    setContactInput(newFullName);
    setContactSearchTerm("");
    onChangeRef.current({
      customerId: newCompanyId,
      contactId: newContactId,
      contactPerson: newFullName,
      contactPhone: created.mobileNo || created.altMobileNo || null,
      contactEmail: created.emailAddress || created.altEmailAddress || null,
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
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed select-none"
          />
        </div>

        {/* 1. Company Name - Searchable Combobox */}
        <div ref={companyDropdownRef} className="relative">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Company..."
              value={companyInput}
              onChange={(e) => {
                const val = e.target.value;
                setCompanyInput(val);
                setCompanySearchTerm(val);
                setIsCompanyDropdownOpen(true);
                if (!val) {
                  handleCompanyChange(0);
                }
              }}
              onClick={() => !disabled && setIsCompanyDropdownOpen(true)}
              onFocus={() => !disabled && setIsCompanyDropdownOpen(true)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white pl-3.5 pr-14 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-text truncate"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {(companyInput || customerId) && !disabled ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompanyChange(0);
                    setCompanyInput("");
                    setCompanySearchTerm("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
                  title="Clear company selection"
                >
                  <X size={14} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setIsCompanyDropdownOpen((prev) => !prev);
                }}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-gray-800 rounded transition cursor-pointer"
                title="Toggle company options"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isCompanyDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Searchable Dropdown Menu */}
          {isCompanyDropdownOpen && !disabled && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-72 flex flex-col">
              <div className="p-2 bg-orange-50/60 border-b border-orange-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between shrink-0">
                <span>Select Company ({filteredCustomers.length})</span>
                <span className="text-[9px] font-normal text-gray-400">Company · Code</span>
              </div>

              <div className="overflow-y-auto max-h-56 divide-y divide-gray-100 flex-1">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                      {companySearchTerm
                        ? `No matching companies found for "${companySearchTerm}"`
                        : "No companies available"}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map((c) => {
                    const cId = Number(c.customerId || c.companyId || 0);
                    const cName = c.companyName || c.customerName || `Company #${cId}`;
                    const isSelected = Number(customerId) === cId;
                    return (
                      <button
                        key={cId}
                        type="button"
                        onClick={() => {
                          handleCompanyChange(cId);
                          const dispName = `${cName}${c.customerCode ? ` (${c.customerCode})` : ""}`;
                          setCompanyInput(dispName);
                          setCompanySearchTerm("");
                          setIsCompanyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 text-[#00234a] font-semibold"
                            : "hover:bg-slate-50 text-gray-800"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#00234a] truncate">
                            {cName}
                          </div>
                          {c.customerCode && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <span className="font-medium text-gray-600">Code: {c.customerCode}</span>
                              {(c as any).city && <span>• {(c as any).city}</span>}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-[#FF7900] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2 & 3. Customer Name / Contact Person Dependent Searchable Combobox */}
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
            <div ref={contactDropdownRef} className="relative flex-1">
              <input
                type="text"
                placeholder={
                  !customerId
                    ? "Select Company first..."
                    : isLoadingContacts && contacts.length === 0
                      ? "Loading contacts..."
                      : contacts.length === 0
                        ? "No contacts found — click + Add"
                        : "Select Contact Person..."
                }
                value={contactInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setContactInput(val);
                  setContactSearchTerm(val);
                  setIsContactDropdownOpen(true);
                  if (!val) {
                    handleContactChange(0);
                  }
                }}
                onClick={() => {
                  if (!disabled && customerId && contacts.length > 0) {
                    setIsContactDropdownOpen(true);
                  }
                }}
                onFocus={() => {
                  if (!disabled && customerId && contacts.length > 0) {
                    setIsContactDropdownOpen(true);
                  }
                }}
                disabled={disabled || !customerId || (isLoadingContacts && contacts.length === 0) || contacts.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white pl-3.5 pr-14 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-text truncate"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isLoadingContacts && (
                  <div className="p-1 pointer-events-none">
                    <Loader2 size={16} className="animate-spin text-[#FF7900]" />
                  </div>
                )}
                {(contactInput || selectedContactId) && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactChange(0);
                      setContactInput("");
                      setContactSearchTerm("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
                    title="Clear contact person"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled && customerId && contacts.length > 0) {
                      setIsContactDropdownOpen((prev) => !prev);
                    }
                  }}
                  disabled={disabled || !customerId || contacts.length === 0}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Toggle contact options"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isContactDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Menu */}
              {isContactDropdownOpen && !disabled && customerId && contacts.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-72 flex flex-col">
                  <div className="p-2 bg-orange-50/60 border-b border-orange-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between shrink-0">
                    <span>Select Contact Person ({filteredContacts.length})</span>
                    <span className="text-[9px] font-normal text-gray-400">Name · Designation · Mobile</span>
                  </div>

                  <div className="overflow-y-auto max-h-56 divide-y divide-gray-100 flex-1">
                    {filteredContacts.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 font-medium">
                          {contactSearchTerm
                            ? `No matching contacts found for "${contactSearchTerm}"`
                            : "No contacts found"}
                        </p>
                      </div>
                    ) : (
                      filteredContacts.map((c) => {
                        const cId = Number(c.contactId);
                        const isSelected = Number(selectedContactId) === cId;
                        const dispName = `${c.fullName}${c.designation ? ` (${c.designation})` : ""}`;
                        return (
                          <button
                            key={cId}
                            type="button"
                            onClick={() => {
                              handleContactChange(cId);
                              setContactInput(dispName);
                              setContactSearchTerm("");
                              setIsContactDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 transition flex items-start justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-orange-50 text-[#00234a] font-semibold"
                                : "hover:bg-slate-50 text-gray-800"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[#00234a] truncate">
                                {c.fullName}
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                                {c.designation && <span className="font-medium text-gray-700">{c.designation}</span>}
                                {c.designation && (c.mobileNo || c.emailAddress) && <span>•</span>}
                                {c.mobileNo && <span>{c.mobileNo}</span>}
                                {c.mobileNo && c.emailAddress && <span>•</span>}
                                {c.emailAddress && <span className="truncate">{c.emailAddress}</span>}
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

        {/* Enquiry Reference - Searchable Combobox */}
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
                setDropdownSearchTerm(val);
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
              onClick={() => !disabled && setIsEnquiryDropdownOpen(true)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white pl-3.5 pr-14 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-text truncate"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {enquirySearch && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnquirySearch("");
                    setDropdownSearchTerm("");
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEnquiryDropdownOpen((prev) => !prev);
                }}
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

          {/* Dropdown Menu */}
          {isEnquiryDropdownOpen && !disabled && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-72 flex flex-col">
              <div className="p-2 bg-orange-50/60 border-b border-orange-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between shrink-0">
                <span>Select Existing Enquiry ({filteredEnquiries.length})</span>
                <span className="text-[9px] font-normal text-gray-400">Enquiry No · Company · Product</span>
              </div>

              <div className="overflow-y-auto max-h-56 divide-y divide-gray-100 flex-1">
                {isLoadingEnquiries ? (
                  <div className="p-5 text-center flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Loader2 size={16} className="animate-spin text-[#FF7900]" />
                    <span>Loading enquiries from database...</span>
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                      {dropdownSearchTerm
                        ? `No matching enquiries found for "${dropdownSearchTerm}"`
                        : "No enquiries found in database"}
                    </p>
                    {dropdownSearchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setEnquirySearch(dropdownSearchTerm);
                          onChangeRef.current({ enquiryRef: dropdownSearchTerm, enquiryId: null });
                          setIsEnquiryDropdownOpen(false);
                          setDropdownSearchTerm("");
                        }}
                        className="mt-2 text-xs font-semibold text-[#FF7900] hover:text-[#e06800] underline cursor-pointer"
                      >
                        Use "{dropdownSearchTerm}" as custom reference
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
                        key={eq.enquiryNumber || String(eq.enquiryId)}
                        type="button"
                        onClick={() => handleSelectEnquiry(eq)}
                        className={`w-full text-left px-3.5 py-2.5 transition flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 text-[#00234a] font-semibold"
                            : "hover:bg-slate-50 text-gray-800"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#00234a] truncate">
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20"
          />
        </div>

        {/* Revision Number */}
        <div>
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Revision
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-orange-50 text-[#FF7900] rounded-lg border border-[#FF7900]/20 text-xs font-semibold">
              R{revisionNumber}
            </span>
            <span className="text-sm text-gray-500">
              {revisionNumber === 0
                ? "Initial Proposal"
                : `Revision #${revisionNumber}`}
            </span>
          </div>
        </div>

        {/* Quotation Status - Searchable Dropdown */}
        <div ref={statusDropdownRef} className="relative">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-1.5">
            Status
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Status..."
              value={statusInput}
              onChange={(e) => {
                const val = e.target.value;
                setStatusInput(val);
                setStatusSearchTerm(val);
                setIsStatusDropdownOpen(true);
              }}
              onClick={() => !disabled && setIsStatusDropdownOpen(true)}
              onFocus={() => !disabled && setIsStatusDropdownOpen(true)}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white pl-3.5 pr-10 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 cursor-text truncate font-medium"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setIsStatusDropdownOpen((prev) => !prev);
                }}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-gray-800 rounded transition cursor-pointer"
                title="Toggle status options"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isStatusDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isStatusDropdownOpen && !disabled && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-72 flex flex-col">
              <div className="p-2 bg-orange-50/60 border-b border-orange-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between shrink-0">
                <span>Select Status ({filteredStatuses.length})</span>
                <span className="text-[9px] font-normal text-gray-400">Status Option</span>
              </div>

              <div className="overflow-y-auto max-h-56 divide-y divide-gray-100 flex-1">
                {filteredStatuses.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                      No matching status found for "{statusSearchTerm}"
                    </p>
                  </div>
                ) : (
                  filteredStatuses.map((st) => {
                    const isSelected = (status || "Draft") === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          onChangeRef.current({ status: st });
                          setStatusInput(st);
                          setStatusSearchTerm("");
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 text-[#00234a] font-semibold"
                            : "hover:bg-slate-50 text-gray-800"
                        }`}
                      >
                        <span className="text-sm font-medium">{st}</span>
                        {isSelected && (
                          <Check size={16} className="text-[#FF7900] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Customer & Contact Details Preview Banner matching Customer Master */}
      {(selectedCustomer || selectedContact) && (
        <div className="p-3.5 bg-orange-50/30 border border-orange-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-y-1">
            <span className="font-bold text-slate-800 mr-2 flex items-center gap-1">
              <User size={13} className="text-[#FF7900]" />
              <span>Contact Person:</span>
            </span>
            <span className="font-semibold text-gray-900">
              {selectedContact?.fullName ||
                (selectedContactId ? "N/A" : "Select Contact Person")}
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

            {selectedContact?.emailAddress && (
              <span className="ml-3 text-slate-500 flex items-center gap-1">
                <Mail size={12} className="text-gray-400" />
                <span>{selectedContact.emailAddress}</span>
              </span>
            )}

            {selectedContact?.mobileNo && (
              <span className="ml-3 text-slate-500 flex items-center gap-1">
                <Phone size={12} className="text-gray-400" />
                <span>{selectedContact.mobileNo}</span>
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
