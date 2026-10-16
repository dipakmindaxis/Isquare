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
  createdBy?: number;
  isActive?: boolean;
  companyName?: string | null;
  createdDate?: string | null;
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
