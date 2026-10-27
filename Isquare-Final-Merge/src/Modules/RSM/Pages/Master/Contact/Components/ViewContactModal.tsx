import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Briefcase,
  Layers,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { getContactById } from "../Services/ContactService";
import type { Contact } from "../Types/ContactTypes";

interface ViewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  companyName?: string;
}

export const ViewContactModal: React.FC<ViewContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  companyName,
}) => {
  const [data, setData] = useState<Contact | null>(contact);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && contact && contact.contactId) {
      setIsLoading(true);
      getContactById(contact.contactId)
        .then((fetched) => {
          setData(fetched || contact);
        })
        .catch(() => {
          setData(contact);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setData(contact);
    }
  }, [isOpen, contact]);

  if (!isOpen || !contact) return null;

  const resolvedCompany =
    data?.companyName ||
    companyName ||
    `Company #${data?.companyId || contact.companyId}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Contact Person Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View contact information and organization affiliation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin text-[#FF7900]" size={24} />
            <span>Loading contact details...</span>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Top Primary Card */}
            <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {data?.fullName || "—"}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                  <Building2 size={13} className="text-[#FF7900]" />
                  <span className="font-semibold">{resolvedCompany}</span>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  data?.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {data?.isActive ? (
                  <CheckCircle size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                <span>{data?.isActive ? "Active" : "Inactive"}</span>
              </span>
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Layers size={14} className="text-[#FF7900]" />
                  <span>Department</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.department || "—"}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Briefcase size={14} className="text-[#FF7900]" />
                  <span>Designation</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.designation || "—"}
                </p>
              </div>
            </div>

            {/* Mobile Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Phone size={14} className="text-[#FF7900]" />
                  <span>Mobile</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.mobileNo ? (
                    <a
                      href={`tel:${data.mobileNo}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.mobileNo}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Phone size={14} className="text-[#FF7900]" />
                  <span>Alt Mobile</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {data?.altMobileNo ? (
                    <a
                      href={`tel:${data.altMobileNo}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.altMobileNo}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  <Mail size={14} className="text-[#FF7900]" />
                  <span>Primary Email</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {data?.emailAddress ? (
                    <a
                      href={`mailto:${data.emailAddress}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.emailAddress}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {data?.altEmailAddress && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    <Mail size={14} className="text-[#FF7900]" />
                    <span>Alternate Email</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    <a
                      href={`mailto:${data.altEmailAddress}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.altEmailAddress}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            {data?.createdDate && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  <span>Created Date:</span>
                </span>
                <span className="font-medium text-gray-700">
                  {new Date(data.createdDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContactModal;
