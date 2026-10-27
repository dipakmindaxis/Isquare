export interface Contact {
  contactId: number;
  companyId: number;
  fullName: string;
  department?: string | null;
  designation?: string | null;
  mobileNo?: string | null;
  altMobileNo?: string | null;
  emailAddress?: string | null;
  altEmailAddress?: string | null;
  createdBy?: number | null;
  createdDate?: string | null;
  updatedBy?: number | null;
  updatedDate?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  companyName?: string | null;
  [key: string]: any;
}

export interface CreateContactDTO {
  companyId: number;
  fullName: string;
  department?: string | null;
  designation?: string | null;
  mobileNo?: string | null;
  altMobileNo?: string | null;
  emailAddress?: string | null;
  altEmailAddress?: string | null;
  createdBy?: number;
  isActive?: boolean;
}

export interface UpdateContactDTO {
  contactId?: number;
  companyId: number;
  fullName: string;
  department?: string | null;
  designation?: string | null;
  mobileNo?: string | null;
  altMobileNo?: string | null;
  emailAddress?: string | null;
  altEmailAddress?: string | null;
  updatedBy?: number;
  isActive?: boolean;
  [key: string]: any;
}
