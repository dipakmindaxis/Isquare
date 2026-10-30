import React from "react";
import { createPortal } from "react-dom";
import AddEditContactModal from "../../RSM/Pages/Master/Contact/Components/AddEditContactModal";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";

export interface AddQuotationContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdContact: Contact) => void;
  companies: Customer[];
  selectedCompanyId?: number;
}

export const AddQuotationContactModal: React.FC<AddQuotationContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companies,
  selectedCompanyId = 0,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => e.stopPropagation()}
    >
      <AddEditContactModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={(savedContact) => {
          if (savedContact) {
            onSuccess(savedContact);
          }
        }}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
      />
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default AddQuotationContactModal;
