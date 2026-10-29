import React, { useState, useEffect, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";
import { RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { getEnquiries } from "./Services/EnquiryService";
import type { EnquiryDto } from "./Types/EnquiryTypes";
import AddEnquiryModal from "./Components/AddEnquiryModal";

const customTableStyles = {
  headRow: {
    style: {
      backgroundColor: "#FF7900",
      minHeight: "52px",
      borderRadius: "0px",
      borderTopStyle: "solid" as any,
      borderTopWidth: "1px",
      borderTopColor: "#e06800",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "700",
      textTransform: "uppercase" as any,
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#374151",
    },
  },
  rows: {
    style: {
      minHeight: "54px",
      borderBottom: "1px solid #e5e7eb",
      "&:hover": { backgroundColor: "#f0f7ff", cursor: "pointer" },
    },
  },
};

const EnquiryMaster: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load enquiries.");
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const search = filterText.toLowerCase();
      return (
        (e.enquiryNumber || "").toLowerCase().includes(search) ||
        (e.customerName || "").toLowerCase().includes(search) ||
        (e.requirementSubject || "").toLowerCase().includes(search)
      );
    });
  }, [enquiries, filterText]);

  const columns: TableColumn<EnquiryDto>[] = [
    { name: "Enquiry No.", selector: row => row.enquiryNumber, sortable: true, width: "140px" },
    { name: "Date", selector: row => row.enquiryDate?.substring(0, 10), sortable: true, width: "110px" },
    { name: "Customer", selector: row => row.customerName || "-", sortable: true, grow: 2 },
    { name: "Subject", selector: row => row.requirementSubject || "-", sortable: true, grow: 2 },
    { name: "Status", selector: row => row.enquiryStatusName || "-", sortable: true, width: "120px" },
    { name: "Stage", selector: row => row.enquiryStageName || "-", sortable: true, width: "130px" },
    { name: "Value", selector: row => row.expectedOrderValue ? `₹${row.expectedOrderValue.toLocaleString()}` : "-", sortable: true, right: true },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      
      {/* Header Block */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Enquiry Management</h1>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">Manage commercial enquiries, requirements, and pipelines.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Toggles between Form and Table */}
      <div className="w-full">
        {isAddModalOpen ? (
          <AddEnquiryModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => { setIsAddModalOpen(false); fetchEnquiries(); }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="border-b-2 border-[#FF7900] pb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#00234a]">
                Enquiries
              </h2>
              <div className="flex items-center gap-3">
                <button type="button" onClick={fetchEnquiries} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#00234a] shadow-sm hover:bg-slate-50 transition cursor-pointer">
                  <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /><span>Refresh</span>
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(true)} className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2">
                  <FaPlus size={12} /><span>+ Create New</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Search by number, customer, subject..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500]" />
              </div>
            </div>

            <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredEnquiries}
                progressPending={isLoading}
                pagination
                paginationPerPage={15}
                customStyles={customTableStyles}
                highlightOnHover
                pointerOnHover
                noDataComponent={
                  <div className="py-12 text-center text-gray-400">
                    <FaUsers size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No enquiries found</p>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryMaster;