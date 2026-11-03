import React, { useState, useEffect, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaFileExcel,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileInvoice,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { getEnquiries, deleteEnquiry } from "./Services/EnquiryService";
import type { EnquiryDto } from "./Types/EnquiryTypes";
import AddEnquiryModal from "./Components/AddEnquiryModal";

// TODO: Import your View and Edit components once created
import EditEnquiryModal from "./Components/EditEnquiryModal";
 import ViewEnquiryModal from "./Components/ViewEnquiryModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { exportToExcel } from "../../../../Utils/exportToExcel";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";

//

const customTableStyles: any = listingTableStyles;
/*
    style: {
      minHeight: "52px",
    },
  },
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
      textTransform: "uppercase",
      paddingLeft: "14px",
      paddingRight: "14px",
      letterSpacing: "0.5px",
      borderRight: "1px solid #e06800",
      borderRadius: "0px",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#374151",
      paddingLeft: "14px",
      paddingRight: "14px",
      borderRight: "1px solid #e5e7eb",
    },
  },
  rows: {
    style: {
      minHeight: "54px",
      borderBottom: "1px solid #e5e7eb",
      borderRadius: "0px",
      "&:hover": {
        backgroundColor: "#f0f7ff",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    },
  },
};

*/
const actionButtonStyles = {
  base: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow",
  view: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
  edit: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
  delete: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
};

const EnquiryMaster: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selection States
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState<{
    id: number;
    number: string;
  } | null>(null);

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
    return enquiries.filter((e) => {
      const search = filterText.toLowerCase();
      const matchesSearch =
        (e.enquiryNumber || "").toLowerCase().includes(search) ||
        (e.customerName || "").toLowerCase().includes(search) ||
        (e.requirementSubject || "").toLowerCase().includes(search);

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && e.isActive) ||
        (selectedStatus === "Inactive" && !e.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, filterText, selectedStatus]);

  // Analytics / Statistics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const active = enquiries.filter((e) => e.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [enquiries]);

  const handleDeleteRequest = (enquiry: EnquiryDto) => {
    setEnquiryToDelete({
      id: enquiry.enquiryId,
      number: enquiry.enquiryNumber,
    });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      await deleteEnquiry(enquiryToDelete.id);
      toast.success(`Enquiry "${enquiryToDelete.number}" deleted successfully.`);
      fetchEnquiries();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete enquiry.");
    } finally {
      setIsDeleteModalOpen(false);
      setEnquiryToDelete(null);
    }
  };

  const handleExportClick = () => {
    if (filteredEnquiries.length === 0) {
      toast.warning("No enquiry data available to export.");
      return;
    }
    const dataToExport = filteredEnquiries.map((e) => ({
      "Enquiry No": e.enquiryNumber || "-",
      "Date": e.enquiryDate ? e.enquiryDate.substring(0, 10) : "-",
      "Customer": e.customerName || "-",
      "Subject": e.requirementSubject || "-",
      "Value": e.expectedOrderValue || 0,
      "Status": e.enquiryStatusName || "-",
      "Stage": e.enquiryStageName || "-",
    }));
    exportToExcel(dataToExport, `Enquiries_Export_${new Date().toISOString().slice(0, 10)}`, "Enquiries");
  };

  const columns: TableColumn<EnquiryDto>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "70px",
    },
    {
      name: "Enquiry No.",
      selector: (row) => row.enquiryNumber,
      sortable: true,
      width: "140px",
    },
    {
      name: "Date",
      selector: (row) => row.enquiryDate?.substring(0, 10),
      sortable: true,
      width: "110px",
    },
    {
      name: "Customer",
      selector: (row) => row.customerName || "-",
      cell: (row) => (
        <div className="py-2">
          <p className="font-semibold text-gray-900 leading-tight">
            {row.customerName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{row.requirementSubject}</p>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Status / Stage",
      cell: (row) => (
        <div className="text-sm py-1">
          <p className="font-semibold text-gray-800">{row.enquiryStatusName || "-"}</p>
          <p className="text-gray-500">{row.enquiryStageName || "-"}</p>
        </div>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Value",
      selector: (row) => row.expectedOrderValue || 0,
      cell: (row) => (
        <span className="font-medium text-gray-700">
          {row.expectedOrderValue ? `₹${row.expectedOrderValue.toLocaleString()}` : "-"}
        </span>
      ),
      sortable: true,
      right: true,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              setSelectedEnquiryId(row.enquiryId);
              setIsViewModalOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View Enquiry"
          >
            <FaEye size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedEnquiryId(row.enquiryId);
              setIsEditModalOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit Enquiry"
          >
            <FaEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRequest(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete Enquiry"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
      width: "130px",
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Top Main Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-50 border border-[#FF7900]/30 text-[#FF7900] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#00234a]">
                  Enquiry Master
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#FF7900] border border-[#FF7900]/20">
                  Operations
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">
                Manage commercial enquiries, requirements, pipelines, and follow-ups.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        {isAddModalOpen ? (
          <AddEnquiryModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchEnquiries();
            }}
          />
        ) : isEditModalOpen && selectedEnquiryId ? (
          <EditEnquiryModal
            isOpen={isEditModalOpen}
            enquiryId={selectedEnquiryId}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEnquiryId(null);
            }}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedEnquiryId(null);
              fetchEnquiries();
            }}
          />
        ) : (
          <div className="space-y-6">
            
            {/* Listing Sub-Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="border-b-2 border-[#FF7900] pb-2 text-3xl font-bold tracking-[-0.03em] text-[#00234a]">
                  Enquiries
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchEnquiries}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00234a] shadow-sm transition hover:bg-slate-50 cursor-pointer"
                >
                  <FaFileExcel className="text-emerald-600 text-sm" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="rounded-xl bg-[#00234a] hover:bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(0,35,74,0.18)] transition cursor-pointer flex items-center gap-2"
                >
                  <FaPlus size={12} />
                  <span>Create New</span>
                </button>
              </div>
            </div>

            {/* Analytics / Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <FaFileInvoice size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Total Enquiries
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <FaCheckCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Active Enquiries
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <FaTimesCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider truncate">
                    Inactive Enquiries
                  </p>
                  <p className="text-2xl font-bold text-rose-600">{stats.inactive}</p>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
              <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by number, customer, subject..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF8500]/20 focus:border-[#FF8500]"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Status:
                </span>
                <div className="flex bg-gray-100 p-1 rounded-lg flex-1 sm:flex-initial">
                  {["All", "Active", "Inactive"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-all text-center ${
                        selectedStatus === st
                          ? "bg-white text-[#FF8500] shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[850px]">
                  <DataTable
                    columns={columns}
                    data={filteredEnquiries}
                    progressPending={isLoading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    customStyles={customTableStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noDataComponent={
                      <div className="py-12 text-center text-gray-400">
                        <FaUsers size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No enquiries found</p>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    
      {isViewModalOpen && (
        <ViewEnquiryModal
          isOpen={isViewModalOpen}
          enquiryId={selectedEnquiryId}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEnquiryId(null);
          }}
        />
      )}

     

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Enquiry"
        message={`Are you sure you want to delete enquiry "${enquiryToDelete?.number}"?`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default EnquiryMaster;