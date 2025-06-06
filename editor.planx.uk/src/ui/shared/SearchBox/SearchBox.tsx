import ClearIcon from "@mui/icons-material/Clear";
import Search from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { visuallyHidden } from "@mui/utils";
import { useFormik } from "formik";
import { FuseOptionKey } from "fuse.js";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "../constants";
import Input from "../Input/Input";
import InputRow from "../InputRow";
import InputRowItem from "../InputRowItem";
import InputRowLabel from "../InputRowLabel";

interface SearchBoxProps<T> {
  records: T[] | null;
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  searchKey: FuseOptionKey<T>[];
  clearSearch?: boolean;
  hideLabel?: boolean;
}

export const SearchBox = <T extends object>({
  records,
  setRecords,
  searchKey,
  clearSearch = false,
  hideLabel = false,
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

  return (
    <Box maxWidth={360}>
      <InputRow>
        <InputRowLabel
          inputProps={{
            id: "search-label",
            htmlFor: "search",
            hidden: hideLabel,
          }}
        >
          <strong style={visuallyHidden}>Search</strong>
        </InputRowLabel>
        <InputRowItem>
          <Box sx={{ position: "relative" }}>
            <Input
              sx={{
                pr: 5,
              }}
              name="search"
              id="search"
              aria-describedby="search-label"
              value={values.pattern}
              onChange={(e) => {
                setFieldValue("pattern", e.target.value);
                submitForm();
              }}
              startAdornment={<Search sx={{ ml: -0.5, mr: 0.5 }} />}
            />
            {searchedTerm && !isSearching && (
              <IconButton
                id="clear-search"
                aria-label="clear search"
                onClick={() => {
                  setSearchedTerm("");
                  resetForm();
                  submitForm();
                }}
                size="small"
                sx={{
                  position: "absolute",
                  right: (theme) => theme.spacing(1),
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: 0.5,
                  zIndex: 1,
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            {isSearching && (
              <IconButton
                aria-label="is searching"
                onClick={() => {
                  setFieldValue("pattern", "");
                  submitForm();
                }}
                size="small"
                sx={{
                  position: "absolute",
                  right: (theme) => theme.spacing(1),
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: 0.5,
                  zIndex: 1,
                }}
              >
                <CircularProgress size={"1.5rem"} />
              </IconButton>
            )}
          </Box>
        </InputRowItem>
      </InputRow>
    </Box>
  );
};
