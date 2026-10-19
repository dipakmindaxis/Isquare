import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import ContactTypeForm from "../Components/ContactTypeForm";
import ContactTypeTable from "../Components/ContactTypeTable";
import EditContactTypeModal from "../Components/EditContactTypeModal";

import {
    deleteContactType,
    getAllContactTypes,
} from "../Services/ContactTypeService";

import type { ContactType } from "../Types/ContactType";

interface ContactTypesProps {
    isTab?: boolean;
}

const ContactTypes: React.FC<ContactTypesProps> = ({ isTab = false }) => {
    const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedContactType, setSelectedContactType] =
        useState<ContactType | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchContactTypes = useCallback(async () => {
        setIsLoading(true);

        try {
            const data = await getAllContactTypes();
            const list = Array.isArray(data) ? data : (data as any)?.data || [];
            const normalized: ContactType[] = list.map((item: any) => ({
                contactTypeId: item.contactTypeId ?? item.ContactTypeId ?? item.id ?? 0,
                value: item.value ?? item.Value ?? "",
                code: item.code ?? item.Code ?? "",
                isActive: item.isActive ?? item.IsActive ?? true,
                isDeleted: item.isDeleted ?? item.IsDeleted ?? false,
            }));
            setContactTypes(normalized);
        } catch (error) {
            console.error("Error fetching contact types:", error);
            toast.error("Failed to load contact types.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContactTypes();
    }, [fetchContactTypes]);

    const handleEdit = (contactType: ContactType) => {
        setSelectedContactType(contactType);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedContactType(null);
    };

    const handleDelete = async (contactType: ContactType) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${contactType.value}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteContactType(contactType.contactTypeId);
            toast.success("Contact type deleted successfully.");
            await fetchContactTypes();
        } catch (error) {
            console.error("Error deleting contact type:", error);
            toast.error("Failed to delete contact type.");
        }
    };

    return (
        <div className={isTab ? "w-full" : "min-h-full bg-[#f5f6f8] p-6"}>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h5 className="text-[#FF7900] text-xs font-semibold uppercase tracking-wider">
                        MASTER TABLE
                    </h5>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Contact Types
                    </h1>

                    <p className="mt-1 text-xs text-gray-500">
                        Defines the role / department of a customer contact.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#FF7900] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E66D00] transition-colors shadow-md shadow-orange-500/25 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Add Contact Type</span>
                    </button>
                </div>
            </div>

            <ContactTypeTable
                contactTypes={contactTypes}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ContactTypeForm
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchContactTypes}
            />

            <EditContactTypeModal
                isOpen={isEditModalOpen}
                contactType={selectedContactType}
                onClose={handleCloseEditModal}
                onSuccess={fetchContactTypes}
            />
        </div>
    );
};

export default ContactTypes;