import React from "react";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

export interface SearchableOption {
  value: string | number;
  label: string;
}

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  value: string | number | null | undefined;
  onChange: (value: any, option?: SearchableOption | null) => void;
  options: SearchableOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isCreatable?: boolean;
  formatCreateLabel?: (inputValue: string) => React.ReactNode;
  hasError?: boolean;
  className?: string;
  minHeight?: string;
  portal?: boolean;
  autoFocus?: boolean;
}

const customStyles = (
  hasError?: boolean,
  isDisabled?: boolean,
  minHeight = "44px"
): StylesConfig<SearchableOption, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight,
    borderRadius: "0.5rem",
    borderColor: hasError ? "#ef4444" : state.isFocused ? "#FF7900" : "#d1d5db",
    boxShadow: state.isFocused
      ? hasError
        ? "0 0 0 1px #ef4444"
        : "0 0 0 1px #FF7900"
      : "none",
    backgroundColor: isDisabled ? "#f9fafb" : "#ffffff",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.6 : 1,
    fontSize: "0.875rem",
    transition: "all 0.15s ease",
    "&:hover": {
      borderColor: hasError ? "#ef4444" : "#FF7900",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 10px",
  }),
  input: (base) => ({
    ...base,
    color: "#1f2937",
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1f2937",
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    zIndex: 9999,
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#FF7900"
      : state.isFocused
      ? "#fff7ed"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "#1f2937",
    cursor: "pointer",
    fontSize: "0.875rem",
    padding: "8px 12px",
    "&:active": {
      backgroundColor: "#FF7900",
      color: "#ffffff",
    },
  }),
});

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "-- Select --",
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  isCreatable = false,
  formatCreateLabel,
  hasError = false,
  className = "",
  minHeight = "40px",
  portal = true,
  autoFocus = false,
}) => {
  const valStr =
    value !== undefined && value !== null && value !== "" ? String(value) : "";

  const selectedOption =
    (valStr !== ""
      ? options.find(
          (opt) => String(opt.value).toLowerCase() === valStr.toLowerCase()
        )
      : null) ||
    (isCreatable && valStr !== ""
      ? { value: valStr, label: valStr }
      : null);

  const handleChange = (selected: SingleValue<SearchableOption>) => {
    if (!selected) {
      onChange("", null);
    } else {
      onChange(selected.value, selected);
    }
  };

  const Component: any = isCreatable ? CreatableSelect : Select;

  return (
    <Component
      id={id}
      name={name}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable={isClearable}
      isSearchable={isSearchable}
      formatCreateLabel={
        formatCreateLabel || ((inputValue: string) => `Add "${inputValue}"`)
      }
      autoFocus={autoFocus}
      styles={customStyles(hasError, isDisabled, minHeight)}
      menuPortalTarget={
        portal && typeof document !== "undefined" ? document.body : undefined
      }
      menuPosition={portal ? "fixed" : "absolute"}
      className={className}
      classNamePrefix="react-select"
    />
  );
};

export default SearchableSelect;

