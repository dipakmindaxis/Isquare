// Customer Master TypeScript Definitions

export interface CustomerAddress {
  addressId?: number;
  companyId?: number;
  addressType: string;
  address: string;
  countryId?: number;
  countryName?: string;
  stateId?: number;
  stateName?: string;
  cityId?: number;
  cityName?: string;
  pincode: string;
  isPrimary?: boolean;
  isActive?: boolean;
  createdBy?: number | string;
  createdDate?: string;
}

export interface Customer {
  customerId: number;
  companyId?: number;
  customerCode?: string;
  customerName: string;
  customerShortName?: string;
  companyName?: string;
  companyGroup?: string;
  plantCode?: string;

  // Business Information
  industryId?: number;
  industryName?: string;
  customerStatusId?: number;
  customerStatusName?: string;
  customerSourceId?: number;
  customerSourceName?: string;
  customerAreaId?: number;
  customerAreaName?: string;
  paymentTermsId?: number;
  paymentTermId?: number;
  paymentTermName?: string;

  // Registration & Tax Information
  pan?: string;
  tan?: string;
  gstin?: string;
  cin?: string;
  msmeNumber?: string;

  // Sales Assignment
  directorId?: number;
  directorName?: string;
  directorCode?: string;
  bdeUserId?: number;
  bdeUserName?: string;
  salesCoordinatorId?: number;
  salesCoordinatorName?: string;
  customerOwnerId?: number;
  customerOwnerName?: string;
  customerOwnerType?: "Director" | "BDE" | string | null;

  // Addresses
  addresses?: CustomerAddress[];

  // Other Details
  registrationDate?: string;
  visitedDate?: string;
  remarks?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CustomerAddressPayload {
  addressId?: number;
  companyId?: number;
  addressType: string;
  address: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  pincode: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface CustomerCreatePayload {
  customerCode?: string;
  customerName: string;
  customerShortName?: string | null;
  companyName?: string | null;
  companyGroup?: string | null;
  plantCode?: string | null;

  // Business Information
  industryId?: number | null;
  industryName?: string | null;
  customerStatusId?: number | null;
  customerStatusName?: string | null;
  customerSourceId?: number | null;
  customerSourceName?: string | null;
  customerAreaId?: number | null;
  customerAreaName?: string | null;
  paymentTermsId?: number | null;
  paymentTermId?: number | null;
  paymentTermName?: string | null;

  // Registration & Tax Information
  pan?: string | null;
  tan?: string | null;
  gstin?: string | null;
  cin?: string | null;
  msmeNumber?: string | null;

  // Sales Assignment
  directorId?: number | null;
  directorName?: string | null;
  directorCode?: string | null;
  bdeUserId?: number | null;
  bdeUserName?: string | null;
  salesCoordinatorId?: number | null;
  salesCoordinatorName?: string | null;
  customerOwnerId?: number | null;
  customerOwnerName?: string | null;
  customerOwnerType?: "Director" | "BDE" | string | null;

  // Addresses
  addresses?: CustomerAddressPayload[] | CustomerAddress[];

  // Other Details
  registrationDate?: string | null;
  visitedDate?: string | null;
  remarks?: string | null;
  isActive: boolean;
}

export interface CustomerUpdatePayload extends CustomerCreatePayload {
  customerId?: number;
  addresses?: CustomerAddress[];
}

export interface AddressValidationResult {
  isValid?: boolean;
  message?: string;
  status?: string;
  data?: unknown;
}

// Master Dropdown Item Types
export interface IndustryItem {
  industryId: number;
  industryName: string;
  industryCode?: string;
  isActive?: boolean;
}

export interface CustomerStatusItem {
  customerStatusId: number;
  statusName: string;
  statusCode?: string;
  isActive?: boolean;
}

export interface CustomerSourceItem {
  customerSourceId: number;
  sourceName: string;
  sourceCode?: string;
  isActive?: boolean;
}

export interface CustomerAreaItem {
  customerAreaId: number;
  areaName: string;
  areaCode?: string;
  isActive?: boolean;
}

export interface PaymentTermItem {
  paymentTermId: number;
  paymentTermName: string;
  paymentTermCode?: string;
  isActive?: boolean;
}

export interface CustomerCategoryItem {
  customerCategoryId: number;
  categoryName: string;
  categoryCode?: string;
  isActive?: boolean;
}

export interface CustomerTypeItem {
  id: number;
  customerTypeName: string;
  description?: string;
  isActive?: boolean;
}

export interface ClientTypeItem {
  id: number;
  clientTypeName?: string;
  name?: string;
  typeName?: string;
  description?: string;
  isActive?: boolean;
}

export interface BdeUserItem {
  id: number;
  value: string;
  code?: string;
  directorId?: number | null;
  directorEmployeeId?: number | null;
  directorName?: string | null;
  isActive?: boolean;
}

export interface SalesUserManagerItem {
  id: number;
  userName: string;
  code?: string;
  isActive?: boolean;
}

export interface EmployeeSelectItem {
  id: number;
  fullName: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  role?: string;
  reportingTo?: number;
  reportingToName?: string;
  levelId?: number;
  levelName?: string;
}

export interface CountryItem {
  countryId: number;
  countryName: string;
  countryCode?: string;
  isoCode?: string;
}

export interface StateItem {
  stateId: number;
  countryId?: number;
  stateName: string;
  stateCode?: string;
}

export interface CityItem {
  cityId: number;
  stateId?: number;
  cityName: string;
}

export interface AddressTypeItem {
  id: number;
  addressTypeName?: string;
  name?: string;
  type?: string;
}

export interface SalesCoordinatorItem {
  salesCoordinatorId: number;
  salesCoordinatorName: string;
  salesCoordinatorCode?: string;
  bdeUserId?: number | null;
  bdeUserName?: string | null;
  directorId?: number | null;
  directorName?: string | null;
  isActive?: boolean;
}

export interface DirectorItem {
  directorId: number;
  directorName: string;
  directorCode?: string;
  isActive?: boolean;
}
