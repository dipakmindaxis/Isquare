// Customer Master Field Validation Rules

export const validatePAN = (pan?: string | null): string | null => {
  if (!pan || !pan.trim()) return null;
  const cleaned = pan.trim().toUpperCase();
  // 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleaned)) {
    return "Invalid PAN format (e.g. ABCDE1234F - 5 letters, 4 digits, 1 letter).";
  }
  return null;
};

export const validateTAN = (tan?: string | null): string | null => {
  if (!tan || !tan.trim()) return null;
  const cleaned = tan.trim().toUpperCase();
  // 4 letters, 5 digits, 1 letter
  const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
  if (!tanRegex.test(cleaned)) {
    return "Invalid TAN format (e.g. ABCD12345E - 4 letters, 5 digits, 1 letter).";
  }
  return null;
};

export const validateGSTIN = (gstin?: string | null): string | null => {
  if (!gstin || !gstin.trim()) return null;
  const cleaned = gstin.trim().toUpperCase();
  // 15 characters GSTIN format: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, 'Z', 1 alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleaned)) {
    return "Invalid GSTIN format (15 characters, e.g. 27ABCDE1234F1Z5).";
  }
  return null;
};

export const validateEmail = (email?: string | null): string | null => {
  if (!email || !email.trim()) return null;
  const cleaned = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return "Invalid Email format (e.g. name@company.com).";
  }
  return null;
};

export const validateMobile = (mobile?: string | null): string | null => {
  if (!mobile || !mobile.trim()) return null;
  const cleaned = mobile.trim();
  // 10 digits Indian mobile number starting with 6, 7, 8, or 9
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(cleaned)) {
    return "Invalid Mobile Number. Must be 10 digits starting with 6-9.";
  }
  return null;
};


export const validateVAN = (van?: string | null): string | null => {
  if (!van || !van.trim()) return null;
  const cleaned = van.trim().toUpperCase();
  const vanRegex = /^[A-Z0-9]{6,25}$/;
  if (!vanRegex.test(cleaned)) {
    return "Invalid Virtual Account Number (VAN). Must be 6 to 25 alphanumeric characters.";
  }
  return null;
};
