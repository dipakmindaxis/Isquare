import React from "react";
import CustomerMaster, { type CustomerMasterTab } from "../../Customer/CustomerMaster";

export type CustomerClassificationTab = CustomerMasterTab;

interface CustomerClassificationMasterProps {
  initialTab?: CustomerClassificationTab;
}

export const CustomerClassificationMaster: React.FC<CustomerClassificationMasterProps> = ({
  initialTab = "status",
}) => {
  return <CustomerMaster initialTab={initialTab} />;
};

export default CustomerClassificationMaster;
