export interface EnquiryDto {
  enquiryId: number;
  enquiryNumber: string;
  enquiryDate: string;
  
  enquiryTypeId: number;
  enquiryTypeName?: string;
  enquirySourceId: number;
  enquirySourceName?: string;
  
  customerId: number;
  customerName?: string;
  customerCode?: string;

  contactId?: number;
  contactName?: string;
  departmentName?: string;
  designation?: string;
  contactMobile?: string;
  contactEmail?: string;

  productCategoryId: number;
  productCategoryName?: string;
  requirementSubject: string;
  customerRequirement: string;
  requiredQuantity?: number;
  unitOfMeasureId?: number;
  unitOfMeasureName?: string;
  deliveryTimeline?: string;
  placeOfSupplyId?: number;
  placeOfSupplyName?: string;
  technicalSpecificationNotes?: string;

  expectedOrderValue?: number;
  currencyId?: number;
  currencyCode?: string;
  customerBudget?: number;
  expectedClosingDate?: string;
  probabilityPercentage?: number;
  paymentTermId?: number;
  paymentTermName?: string;
  customerCreditLimit?: number;
  estimatedTaxPercent?: number;

  enquiryStatusId: number;
  enquiryStatusName?: string;
  enquiryStageId: number;
  enquiryStageName?: string;
  enquiryPriorityId: number;
  enquiryPriorityName?: string;

  salesManagerId?: number;
  salesManagerName?: string;
  bdeUserId?: number;
  bdeUserName?: string;
  departmentId?: number;
  departmentMasterName?: string;
  salesTerritoryId?: number;
  salesTerritoryName?: string;
  responsiblePerson?: string;

  nextFollowUpDate?: string;
  activityTypeId?: number;
  activityTypeName?: string;
  nextAction?: string;
  reminder?: string;
  activityDiscussionNotes?: string;

  lostReasonId?: number;
  lostReasonName?: string;
  outcomeInternalRemarks?: string;

  documentReference?: string;
  documentName?: string;
  documentFilePath?: string;
  termsAndConditions?: string;

  isActive: boolean;
  createdDate: string;
}

export type EnquiryCreatePayload = Omit<EnquiryDto, 'enquiryId' | 'enquiryTypeName' | 'enquirySourceName' | 'customerName' | 'customerCode' | 'productCategoryName' | 'unitOfMeasureName' | 'placeOfSupplyName' | 'currencyCode' | 'paymentTermName' | 'enquiryStatusName' | 'enquiryStageName' | 'enquiryPriorityName' | 'departmentMasterName' | 'salesTerritoryName' | 'activityTypeName' | 'lostReasonName' | 'isActive' | 'createdDate'>;

// Generic Master Item for dropdowns
export interface MasterItem {
  id: number;
  name: string;
  code?: string;
}