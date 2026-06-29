import { useFormik } from "formik";
import { FuseOptionKey } from "fuse.js";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "../constants";
import { SearchInput } from "./SearchInput";

interface SearchBoxProps<T> {
  records: T[] | null;
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  searchKey: FuseOptionKey<T>[];
  clearSearch?: boolean;
  hideLabel?: boolean;
  compact?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  fullWidth?: boolean;
  placeholder?: string;
}

/**
 * Search field that owns a local Fuse search
 * The parent passes the full list and gets the filtered results back via setRecords
 *
 * Used for simple, ephemeral searches with no URL updates, e.g.
 * team search in navbar, or component search
 */
export const SearchBox = <T extends object>({
  records,
  setRecords,
  searchKey,
  clearSearch = false,
  hideLabel = false,
  compact = false,
  inputRef,
  fullWidth = false,
  placeholder = "",
}: SearchBoxProps<T>) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState<string>();

  const searchKeys = useMemo(() => searchKey, []);

  const { submitForm, setFieldValue, values, resetForm } = useFormik({
    initialValues: { pattern: "" },
    onSubmit: ({ pattern }) => {
      if (clearSearch) return setRecords(records);
      setIsSearching(true);
      debouncedSearch(pattern);
    },
  });

  const { results, search } = useSearch({
    list: records || [],
    keys: searchKeys,
    searchType: "include-match",
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        search(pattern);
        setSearchedTerm(pattern);
        setIsSearching(false);
      }, SEARCH_DEBOUNCE_MS),
    [search],
  );

  useEffect(() => {
    if (results && searchedTerm) {
      const mappedResults = results.map((result) => result.item);
      setRecords(mappedResults);
    }
    if (results && !searchedTerm) {
      records && setRecords(records);
    }
  }, [results, setRecords, searchedTerm, records]);

  useEffect(() => {
    if (clearSearch) {
      resetForm();
      submitForm();
    }
  }, [clearSearch, resetForm, submitForm]);

  const handleClear = () => {
    setSearchedTerm("");
    resetForm();
    submitForm();
  };

  return (
    <SearchInput
      value={values.pattern}
      onChange={(value) => {
        setFieldValue("pattern", value);
        submitForm();
      }}
      onClear={handleClear}
      showClear={Boolean(searchedTerm)}
      isSearching={isSearching}
      hideLabel={hideLabel}
      compact={compact}
      fullWidth={fullWidth}
      placeholder={placeholder}
      inputRef={inputRef}
    />
  );
};
