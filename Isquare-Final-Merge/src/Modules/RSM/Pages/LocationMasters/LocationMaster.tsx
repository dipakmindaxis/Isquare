import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  Map,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import {
  createCity,
  createCountry,
  createState,
  deleteCity,
  deleteCountry,
  deleteState,
  getCities,
  getCityById,
  getCountries,
  getCountryById,
  getStateById,
  getStates,
  updateCity,
  updateCountry,
  updateState,
} from "./LocationMasterService";
import type {
  CityPayload,
  CityRecord,
  CountryPayload,
  CountryRecord,
  StatePayload,
  StateRecord,
} from "./LocationMasterService";

type MasterKind = "country" | "state" | "city";
type DialogMode = "add" | "edit" | "view";
type MasterRecord = CountryRecord | StateRecord | CityRecord;

interface TableRow {
  id: number;
  name: string;
  code?: string | null;
  isoCode?: string | null;
  countryName?: string;
  stateName?: string;
  isActive: boolean;
}

interface FormFields {
  countryName: string;
  countryCode: string;
  isoCode: string;
  countryId: string;
  stateName: string;
  stateCode: string;
  stateId: string;
  cityName: string;
  isActive: boolean;
}

const pageDetails: Record<
  MasterKind,
  { title: string; description: string; addLabel: string; icon: React.ReactNode }
> = {
  country: {
    title: "Country Master",
    description: "Manage countries and their identification codes.",
    addLabel: "Add Country",
    icon: <Globe className="w-5 h-5" />,
  },
  state: {
    title: "State Master",
    description: "Manage states and their country associations.",
    addLabel: "Add State",
    icon: <Map className="w-5 h-5" />,
  },
  city: {
    title: "City Master",
    description: "Manage cities and their state associations.",
    addLabel: "Add City",
    icon: <MapPin className="w-5 h-5" />,
  },
};

const recordId = (kind: MasterKind, record: MasterRecord): number => {
  if (kind === "country" && "countryId" in record) return record.countryId;
  if (kind === "state" && "stateId" in record) return record.stateId;
  if (kind === "city" && "cityId" in record) return record.cityId;
  throw new Error("The selected record does not match this master.");
};

const LocationMaster: React.FC<{ kind: MasterKind }> = ({ kind }) => {
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [states, setStates] = useState<StateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MasterRecord | null>(
    null,
  );
  const [isOpeningRecord, setIsOpeningRecord] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(false);
    try {
      if (kind === "country") {
        const countryRecords = await getCountries();
        setCountries(countryRecords);
        setRecords(countryRecords);
      } else if (kind === "state") {
        const [countryRecords, stateRecords] = await Promise.all([
          getCountries(),
          getStates(),
        ]);
        setCountries(countryRecords);
        setStates(stateRecords);
        setRecords(stateRecords);
      } else {
        const [countryRecords, stateRecords, cityRecords] = await Promise.all([
          getCountries(),
          getStates(),
          getCities(),
        ]);
        setCountries(countryRecords);
        setStates(stateRecords);
        setRecords(cityRecords);
      }
    } catch {
      setLoadError(true);
      toast.error(`Failed to load ${kind} records. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const rows = useMemo<TableRow[]>(() => {
    if (kind === "country") {
      return records
        .filter((record): record is CountryRecord => "countryName" in record)
        .map((record) => ({
          id: record.countryId,
          name: record.countryName,
          code: record.countryCode,
          isoCode: record.isoCode,
          isActive: record.isActive,
        }));
    }

    if (kind === "state") {
      return records
        .filter((record): record is StateRecord => "stateName" in record)
        .map((record) => ({
          id: record.stateId,
          name: record.stateName,
          code: record.stateCode,
          countryName:
            countries.find((country) => country.countryId === record.countryId)
              ?.countryName ?? "—",
          isActive: record.isActive,
        }));
    }

    return records
      .filter((record): record is CityRecord => "cityName" in record)
      .map((record) => {
        const state = states.find((entry) => entry.stateId === record.stateId);
        return {
          id: record.cityId,
          name: record.cityName,
          stateName: state?.stateName ?? "—",
          countryName:
            countries.find((country) => country.countryId === state?.countryId)
              ?.countryName ?? "—",
          isActive: record.isActive,
        };
      });
  }, [countries, kind, records, states]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [
        row.name,
        row.code,
        row.isoCode,
        row.countryName,
        row.stateName,
      ].some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [rows, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openRecord = async (
    mode: Exclude<DialogMode, "add">,
    row: TableRow,
  ): Promise<void> => {
    setIsOpeningRecord(true);
    try {
      const record =
        kind === "country"
          ? await getCountryById(row.id)
          : kind === "state"
            ? await getStateById(row.id)
            : await getCityById(row.id);
      setSelectedRecord(record);
      setDialogMode(mode);
    } catch {
      toast.error(`Failed to load ${kind} details.`);
    } finally {
      setIsOpeningRecord(false);
    }
  };

  const saveRecord = async (fields: FormFields): Promise<boolean> => {
    try {
      if (kind === "country") {
        const payload: CountryPayload = {
          countryName: fields.countryName.trim(),
          countryCode: fields.countryCode.trim() || null,
          isoCode: fields.isoCode.trim() || null,
          isActive: fields.isActive,
        };
        if (dialogMode === "edit" && selectedRecord) {
          await updateCountry(recordId(kind, selectedRecord), payload);
        } else {
          await createCountry(payload);
        }
      } else if (kind === "state") {
        const payload: StatePayload = {
          countryId: Number(fields.countryId),
          stateName: fields.stateName.trim(),
          stateCode: fields.stateCode.trim() || null,
          isActive: fields.isActive,
        };
        if (dialogMode === "edit" && selectedRecord) {
          await updateState(recordId(kind, selectedRecord), payload);
        } else {
          await createState(payload);
        }
      } else {
        const payload: CityPayload = {
          stateId: Number(fields.stateId),
          cityName: fields.cityName.trim(),
          isActive: fields.isActive,
        };
        if (dialogMode === "edit" && selectedRecord) {
          await updateCity(recordId(kind, selectedRecord), payload);
        } else {
          await createCity(payload);
        }
      }

      toast.success(
        `${pageDetails[kind].title.replace(" Master", "")} ${
          dialogMode === "edit" ? "updated" : "created"
        } successfully.`,
      );
      setDialogMode(null);
      setSelectedRecord(null);
      await fetchItems();
      return true;
    } catch {
      toast.error(
        `Failed to ${dialogMode === "edit" ? "update" : "create"} ${kind}.`,
      );
      return false;
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedRecord) return;
    setIsDeleting(true);
    try {
      const id = recordId(kind, selectedRecord);
      if (kind === "country") await deleteCountry(id);
      else if (kind === "state") await deleteState(id);
      else await deleteCity(id);
      toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} deleted.`);
      await fetchItems();
    } catch {
      toast.error(`Failed to delete ${kind}.`);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteRequest = (row: TableRow): void => {
    const record = records.find((item) => recordId(kind, item) === row.id);
    if (record) {
      setSelectedRecord(record);
      setIsConfirmOpen(true);
    }
  };

  const details = pageDetails[kind];
  const emptyColSpan = 5;

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 border border-[#FF7900]/30 text-[#FF7900]">
            {details.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{details.title}</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {details.description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRecord(null);
            setDialogMode("add");
          }}
          className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FF7900] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-[#E66D00]"
        >
          <Plus size={18} />
          <span>{details.addLabel}</span>
        </button>
      </div>

      <div className="mb-4 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={`Search ${kind} records...`}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-xs">
            <thead className="bg-[#FF7900] text-xs uppercase tracking-wider text-white border-b border-[#e06800]">
              <tr>
                <th className="px-6 py-3.5 text-left">
                  {kind === "country"
                    ? "Country Name"
                    : kind === "state"
                      ? "State Name"
                      : "City Name"}
                </th>
                {kind === "country" && (
                  <>
                    <th className="px-6 py-3.5 text-left">Country Code</th>
                    <th className="px-6 py-3.5 text-left">ISO Code</th>
                  </>
                )}
                {kind === "state" && (
                  <>
                    <th className="px-6 py-3.5 text-left">State Code</th>
                    <th className="px-6 py-3.5 text-left">Country</th>
                  </>
                )}
                {kind === "city" && (
                  <>
                    <th className="px-6 py-3.5 text-left">State</th>
                    <th className="px-6 py-3.5 text-left">Country</th>
                  </>
                )}
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={emptyColSpan} className="py-12 text-center text-gray-500">
                    <Loader2 className="mr-2 inline-block animate-spin text-[#FF7900]" />
                    Loading {kind} records...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={emptyColSpan} className="py-12 text-center text-gray-500">
                    Unable to load records.{" "}
                    <button
                      type="button"
                      onClick={() => void fetchItems()}
                      className="font-medium text-[#FF7900] underline"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={emptyColSpan} className="py-12 text-center text-gray-500">
                    No {kind} records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {row.name || "—"}
                    </td>
                    {kind === "country" && (
                      <>
                        <td className="px-6 py-4 text-gray-800">
                          {row.code || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.isoCode || "—"}
                        </td>
                      </>
                    )}
                    {kind === "state" && (
                      <>
                        <td className="px-6 py-4 text-gray-800">
                          {row.code || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.countryName}
                        </td>
                      </>
                    )}
                    {kind === "city" && (
                      <>
                        <td className="px-6 py-4 text-gray-800">
                          {row.stateName}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.countryName}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                          row.isActive
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3.5">
                        <button
                          type="button"
                          disabled={isOpeningRecord}
                          onClick={() => void openRecord("view", row)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                          title="View"
                          aria-label={`View ${row.name}`}
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={isOpeningRecord}
                          onClick={() => void openRecord("edit", row)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          title="Edit"
                          aria-label={`Edit ${row.name}`}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(row)}
                          className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                          title="Delete"
                          aria-label={`Delete ${row.name}`}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 0 && !loadError && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(event) => setItemsPerPage(Number(event.target.value))}
              className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#00234a] focus:outline-none focus:ring-2 focus:ring-[#00234a]/15"
            >
              {[5, 10, 25].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogMode && (
        <LocationMasterDialog
          key={`${kind}-${dialogMode}-${selectedRecord ? recordId(kind, selectedRecord) : "new"}`}
          kind={kind}
          mode={dialogMode}
          record={selectedRecord}
          countries={countries}
          states={states}
          onClose={() => {
            setDialogMode(null);
            setSelectedRecord(null);
          }}
          onSave={saveRecord}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
            setSelectedRecord(null);
          }
        }}
        onConfirm={() => void handleDelete()}
        title={`Delete ${kind}`}
        message={`Are you sure you want to delete "${
          selectedRecord && "countryName" in selectedRecord
            ? selectedRecord.countryName
            : selectedRecord && "stateName" in selectedRecord
              ? selectedRecord.stateName
              : selectedRecord && "cityName" in selectedRecord
                ? selectedRecord.cityName
                : ""
        }"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

interface LocationMasterDialogProps {
  kind: MasterKind;
  mode: DialogMode;
  record: MasterRecord | null;
  countries: CountryRecord[];
  states: StateRecord[];
  onClose: () => void;
  onSave: (fields: FormFields) => Promise<boolean>;
}

const LocationMasterDialog: React.FC<LocationMasterDialogProps> = ({
  kind,
  mode,
  record,
  countries,
  states,
  onClose,
  onSave,
}) => {
  const [fields, setFields] = useState<FormFields>({
    countryName: "",
    countryCode: "",
    isoCode: "",
    countryId: "",
    stateName: "",
    stateCode: "",
    stateId: "",
    cityName: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const readOnly = mode === "view";

  useEffect(() => {
    if (kind === "country" && record && "countryName" in record) {
      setFields((previous) => ({
        ...previous,
        countryName: record.countryName ?? "",
        countryCode: record.countryCode ?? "",
        isoCode: record.isoCode ?? "",
        isActive: record.isActive ?? true,
      }));
    } else if (kind === "state" && record && "stateName" in record) {
      setFields((previous) => ({
        ...previous,
        countryId: String(record.countryId ?? ""),
        stateName: record.stateName ?? "",
        stateCode: record.stateCode ?? "",
        isActive: record.isActive ?? true,
      }));
    } else if (kind === "city" && record && "cityName" in record) {
      const relatedState = states.find(
        (state) => state.stateId === record.stateId,
      );
      setFields((previous) => ({
        ...previous,
        countryId: String(relatedState?.countryId ?? ""),
        stateId: String(record.stateId ?? ""),
        cityName: record.cityName ?? "",
        isActive: record.isActive ?? true,
      }));
    }
  }, [kind, record, states]);

  const availableStates = useMemo(
    () =>
      fields.countryId
        ? states.filter(
            (state) => state.countryId === Number(fields.countryId),
          )
        : [],
    [fields.countryId, states],
  );

  const title =
    mode === "add"
      ? pageDetails[kind].addLabel
      : `${mode === "edit" ? "Edit" : "View"} ${kind}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (kind !== "country" && !fields.countryId) {
      toast.error("Please select a country.");
      return;
    }
    if (kind === "city" && !fields.stateId) {
      toast.error("Please select a state.");
      return;
    }
    if (
      (kind === "country" && !fields.countryName.trim()) ||
      (kind === "state" && !fields.stateName.trim()) ||
      (kind === "city" && !fields.cityName.trim())
    ) {
      toast.error(`${kind[0].toUpperCase()}${kind.slice(1)} name is required.`);
      return;
    }

    setIsSaving(true);
    try {
      if (await onSave(fields)) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (name: keyof FormFields, value: string | boolean) => {
    setFields((previous) => ({ ...previous, [name]: value }));
  };

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700";
  const inputClass =
    "min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 disabled:bg-gray-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="flex items-center justify-between border-b border-[#e06800] bg-[#FF7900] p-5 text-white sm:p-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
                {pageDetails[kind].icon}
              </div>
              <div>
                <h2 className="text-lg font-bold capitalize text-white">
                  {title}
                </h2>
                <p className="mt-0.5 text-xs text-white/90">
                  {mode === "view"
                    ? `View ${kind} information`
                    : `Enter ${kind} details`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
            {kind === "country" && (
              <>
                <label className="block">
                  <span className={labelClass}>
                    Country Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={fields.countryName}
                    onChange={(event) =>
                      updateField("countryName", event.target.value)
                    }
                    required
                    disabled={readOnly}
                    maxLength={100}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Country Code</span>
                  <input
                    className={inputClass}
                    value={fields.countryCode}
                    onChange={(event) =>
                      updateField("countryCode", event.target.value)
                    }
                    disabled={readOnly}
                    maxLength={20}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>ISO Code</span>
                  <input
                    className={inputClass}
                    value={fields.isoCode}
                    onChange={(event) =>
                      updateField("isoCode", event.target.value)
                    }
                    disabled={readOnly}
                    maxLength={10}
                  />
                </label>
              </>
            )}

            {kind === "state" && (
              <>
                <label className="block">
                  <span className={labelClass}>
                    Country <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={inputClass}
                    value={fields.countryId}
                    onChange={(event) =>
                      updateField("countryId", event.target.value)
                    }
                    required
                    disabled={readOnly}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.countryId} value={country.countryId}>
                        {country.countryName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>
                    State Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={fields.stateName}
                    onChange={(event) =>
                      updateField("stateName", event.target.value)
                    }
                    required
                    disabled={readOnly}
                    maxLength={100}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>State Code</span>
                  <input
                    className={inputClass}
                    value={fields.stateCode}
                    onChange={(event) =>
                      updateField("stateCode", event.target.value)
                    }
                    disabled={readOnly}
                    maxLength={20}
                  />
                </label>
              </>
            )}

            {kind === "city" && (
              <>
                <label className="block">
                  <span className={labelClass}>
                    Country <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={inputClass}
                    value={fields.countryId}
                    onChange={(event) => {
                      const countryId = event.target.value;
                      setFields((previous) => ({
                        ...previous,
                        countryId,
                        stateId: states.some(
                          (state) =>
                            String(state.stateId) === previous.stateId &&
                            String(state.countryId) === countryId,
                        )
                          ? previous.stateId
                          : "",
                      }));
                    }}
                    required
                    disabled={readOnly}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.countryId} value={country.countryId}>
                        {country.countryName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>
                    State <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={inputClass}
                    value={fields.stateId}
                    onChange={(event) =>
                      updateField("stateId", event.target.value)
                    }
                    required
                    disabled={readOnly || !fields.countryId}
                  >
                    <option value="">Select a state</option>
                    {availableStates.map((state) => (
                      <option key={state.stateId} value={state.stateId}>
                        {state.stateName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>
                    City Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={fields.cityName}
                    onChange={(event) =>
                      updateField("cityName", event.target.value)
                    }
                    required
                    disabled={readOnly}
                    maxLength={100}
                  />
                </label>
              </>
            )}

            <label className="flex cursor-pointer select-none items-center gap-2.5 pt-1 sm:col-span-2">
              <input
                type="checkbox"
                checked={fields.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                disabled={readOnly}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900] disabled:cursor-default"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Status
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 rounded-lg bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 cursor-pointer"
            >
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={isSaving}
                className="flex min-h-11 items-center gap-2 rounded-lg bg-[#FF7900] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#E66D00] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSaving
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : pageDetails[kind].addLabel}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationMaster;
