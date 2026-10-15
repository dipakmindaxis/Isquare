import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import BdeUserTable from "../Components/BdeUserTable";
import BdeUserForm from "../Components/BdeUserForm";
import EditBdeUserModal from "../Components/EditBdeUserModal";

import {
  deleteBdeUser,
  getAllBdeUsers,
} from "../Services/BdeUserService";

import type { BdeUser as BdeUserType } from "../Types/BdeUser";

interface BdeUsersProps {
  isTab?: boolean;
}

const BdeUsers: React.FC<BdeUsersProps> = ({ isTab = false }) => {
  const [data, setData] = useState<BdeUserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BdeUserType | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBdeUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const responseData = await getAllBdeUsers();
      const list = Array.isArray(responseData) ? responseData : (responseData as any)?.data || [];
      const normalized = list.map((item: any) => ({
        id: item.id ?? item.ID ?? 0,
        value: item.value ?? item.Value ?? "",
        code: item.code ?? item.Code ?? "",
        isActive: item.isActive ?? item.IsActive ?? true,
        isDeleted: item.isDeleted ?? item.IsDeleted ?? false,
      }));
      setData(normalized);
    } catch (error) {
      console.error("Error fetching BDE users:", error);
      toast.error("Failed to load BDE users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBdeUsers();
  }, [fetchBdeUsers]);

  const handleEdit = (item: BdeUserType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: BdeUserType) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.value}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBdeUser(item.id);
      toast.success("BDE user deleted successfully.");

      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }

      await fetchBdeUsers();
    } catch (error) {
      console.error("Error deleting BDE user:", error);
      toast.error("Failed to delete BDE user.");
    }
  };

  return (
    <div className={isTab ? "w-full" : "min-h-full bg-[#f5f6f8] p-6"}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h5 className="text-[#154068]">MASTER TABLE</h5>

          <h1 className="text-2xl font-semibold text-[#154068]">
            BDE Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Business development executive assignment list.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#154068] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d3357] transition-colors"
          >
            <Plus size={18} />
            + Add BDE User
          </button>
        </div>
      </div>

      <BdeUserTable
        bdeUsers={data}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BdeUserForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBdeUsers}
      />

      <EditBdeUserModal
        isOpen={isEditModalOpen}
        bdeUser={selectedItem}
        onClose={handleCloseEditModal}
        onSuccess={fetchBdeUsers}
      />
    </div>
  );
};

export default BdeUsers;
