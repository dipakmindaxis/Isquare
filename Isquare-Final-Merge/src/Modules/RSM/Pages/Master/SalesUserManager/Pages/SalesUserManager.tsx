import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import SalesUserManagerTable from "../Components/SalesUserManagerTable";
import SalesUserManagerForm from "../Components/SalesUserManagerForm";
import EditSalesUserManagerModal from "../Components/EditSalesUserManagerModal";

import {
  deleteSalesUserManager,
  getAllSalesUserManagers,
} from "../Services/SalesUserManagerService";

import type { SalesUserManager as SalesUserManagerType } from "../Types/SalesUserManager";

interface SalesUserManagerProps {
  isTab?: boolean;
}

const SalesUserManager: React.FC<SalesUserManagerProps> = ({ isTab = false }) => {
  const [data, setData] = useState<SalesUserManagerType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SalesUserManagerType | null>(
    null
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchSalesUserManagers = useCallback(async () => {
    setIsLoading(true);

    try {
      const responseData = await getAllSalesUserManagers();
      setData(responseData);
    } catch (error) {
      console.error("Error fetching sales user managers:", error);
      toast.error("Failed to load sales user managers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesUserManagers();
  }, [fetchSalesUserManagers]);

  const handleEdit = (item: SalesUserManagerType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: SalesUserManagerType) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.userName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSalesUserManager(item.id);
      toast.success("Sales user manager deleted successfully.");

      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }

      await fetchSalesUserManagers();
    } catch (error) {
      console.error("Error deleting sales user manager:", error);
      toast.error("Failed to delete sales user manager.");
    }
  };

  return (
    <div className={isTab ? "w-full" : "min-h-full bg-[#f5f6f8] p-6"}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h5 className="text-[#FF7900] text-xs font-semibold uppercase tracking-wider">MASTER TABLE</h5>

          <h1 className="text-2xl font-bold text-gray-900">
            Users / Sales Managers
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            Sales ownership and assignment list.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#FF7900] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E66D00] transition-colors shadow-md shadow-orange-500/25 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Sales Manager</span>
          </button>
        </div>
      </div>

      <SalesUserManagerTable
        salesUserManagers={data}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SalesUserManagerForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchSalesUserManagers}
      />

      <EditSalesUserManagerModal
        isOpen={isEditModalOpen}
        salesUserManager={selectedItem}
        onClose={handleCloseEditModal}
        onSuccess={fetchSalesUserManagers}
      />
    </div>
  );
};

export default SalesUserManager;
